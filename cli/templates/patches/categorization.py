"""
OpenMemory Plus - Multi-Provider Categorization Module
支持多种 LLM Provider 的记忆分类功能

Supported Providers:
- DeepSeek (推荐)
- MiniMax
- ZhiPu (智谱 AI)
- Qwen (通义千问)
- OpenAI
- Ollama (本地)
"""

import json
import logging
import os
from typing import List, Optional, Tuple

from app.utils.prompts import MEMORY_CATEGORIZATION_PROMPT
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential

load_dotenv()


class MemoryCategories(BaseModel):
    categories: List[str]


# Provider configuration: (env_key, base_url, default_model, supports_structured_output)
# M2 Fix: Added Ollama support for local LLM
PROVIDERS = [
    ("DEEPSEEK_API_KEY", "https://api.deepseek.com", "deepseek-chat", False),
    ("MINIMAX_API_KEY", "https://api.minimax.chat/v1", "abab6.5s-chat", False),
    ("ZHIPU_API_KEY", "https://open.bigmodel.cn/api/paas/v4", "glm-4-flash", False),
    ("DASHSCOPE_API_KEY", "https://dashscope.aliyuncs.com/compatible-mode/v1", "qwen-turbo", False),
    ("OPENAI_API_KEY", None, "gpt-4o-mini", True),  # None = use default OpenAI URL
]

# Ollama configuration (local LLM, no API key needed)
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("LLM_MODEL", "qwen2.5:7b")


def get_llm_config() -> Tuple[Optional[str], Optional[str], Optional[str], bool]:
    """Detect configured LLM provider from environment variables."""
    # First check for API-based providers
    for env_key, base_url, default_model, supports_structured in PROVIDERS:
        api_key = os.environ.get(env_key)
        if api_key:
            # Allow custom base_url override
            base_url_key = env_key.replace("_API_KEY", "_BASE_URL")
            actual_base_url = os.environ.get(base_url_key) or base_url
            # Allow custom model override
            actual_model = os.environ.get("LLM_MODEL") or default_model
            provider_name = env_key.replace("_API_KEY", "").lower()
            logging.info(f"[LLM] Using provider: {provider_name}, model: {actual_model}")
            return api_key, actual_base_url, actual_model, supports_structured

    # M2 Fix: Check for Ollama (local LLM, no API key needed)
    llm_provider = os.environ.get("LLM_PROVIDER", "").lower()
    if llm_provider == "ollama" or os.environ.get("OLLAMA_HOST"):
        ollama_base_url = f"{OLLAMA_HOST}/v1"
        logging.info(f"[LLM] Using provider: ollama, model: {OLLAMA_MODEL}")
        # Ollama uses "ollama" as a dummy API key for OpenAI-compatible endpoint
        return "ollama", ollama_base_url, OLLAMA_MODEL, False

    return None, None, None, False


# Initialize LLM client
api_key, base_url, model_name, supports_structured = get_llm_config()

openai_client: Optional[OpenAI] = None
if api_key:
    if base_url:
        openai_client = OpenAI(api_key=api_key, base_url=base_url)
    else:
        openai_client = OpenAI(api_key=api_key)


def extract_json_from_text(text: str) -> Optional[dict]:
    """Extract JSON object from text response."""
    text = text.strip()
    # Try to find JSON object in the response
    start_idx = text.find("{")
    end_idx = text.rfind("}") + 1
    if start_idx != -1 and end_idx > start_idx:
        try:
            return json.loads(text[start_idx:end_idx])
        except json.JSONDecodeError:
            pass
    return None


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=15))
def get_categories_for_memory(memory: str) -> List[str]:
    """Get categories for a memory using configured LLM provider."""
    if openai_client is None:
        logging.warning("[WARN] No LLM API key configured, skipping categorization")
        return []

    try:
        messages = [
            {"role": "system", "content": MEMORY_CATEGORIZATION_PROMPT},
            {"role": "user", "content": memory},
        ]

        if supports_structured:
            # OpenAI with structured output (beta API)
            completion = openai_client.beta.chat.completions.parse(
                model=model_name,
                messages=messages,
                response_format=MemoryCategories,
                temperature=0,
            )
            parsed: MemoryCategories = completion.choices[0].message.parsed
            return [cat.strip().lower() for cat in parsed.categories]
        else:
            # Other providers: use JSON mode with explicit instruction
            json_instruction = (
                'Return ONLY a JSON object with format: {"categories": ["cat1", "cat2"]}. '
                "No other text or explanation."
            )
            completion = openai_client.chat.completions.create(
                model=model_name,
                messages=messages + [{"role": "user", "content": json_instruction}],
                temperature=0,
            )
            content = completion.choices[0].message.content
            if content:
                parsed_json = extract_json_from_text(content)
                if parsed_json and "categories" in parsed_json:
                    return [cat.strip().lower() for cat in parsed_json["categories"]]
            return []

    except Exception as e:
        logging.error(f"[ERROR] Failed to get categories: {e}")
        return []

