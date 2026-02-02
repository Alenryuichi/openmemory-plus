<p align="center">
  <img src="https://img.shields.io/badge/🧠_OpenMemory_Plus-Agent_Memory_Framework-blueviolet?style=for-the-badge" alt="OpenMemory Plus">
</p>

<p align="center">
  <strong>Dual-Layer Memory · Smart Classification · Auto-Extraction · Multi-IDE Support</strong>
</p>

<p align="center">
  <a href="README.md">🇨🇳 中文</a> | <a href="README_EN.md">🇺🇸 English</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/openmemory-plus">
    <img src="https://img.shields.io/npm/v/openmemory-plus?color=%2334D058&label=npm" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/openmemory-plus">
    <img src="https://img.shields.io/npm/dm/openmemory-plus" alt="npm downloads">
  </a>
  <a href="https://github.com/Alenryuichi/openmemory-plus">
    <img src="https://img.shields.io/github/license/Alenryuichi/openmemory-plus" alt="License">
  </a>
  <a href="https://github.com/Alenryuichi/openmemory-plus">
    <img src="https://img.shields.io/github/stars/Alenryuichi/openmemory-plus?style=social" alt="GitHub stars">
  </a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-supported-ides">Supported IDEs</a> •
  <a href="docs/architecture.md">Docs</a>
</p>

---

## 🎯 Introduction

**OpenMemory Plus** is a unified memory management framework for AI Agents, integrating project-level (`.memory/`) and user-level (`openmemory` MCP) dual-layer memory systems.

> **Give any AI Agent persistent memory in 5 minutes.**

---

## 💡 Why OpenMemory Plus?

### Pain Points

Have you experienced these problems?

| 😤 Pain Point | 📖 Scenario |
|---------------|-------------|
| **Multi-CLI Memory Silos** | Using Gemini, Augment, Claude, Cursor simultaneously - each has isolated memory |
| **Agent Amnesia** | Every new conversation, Agent forgets who you are, where the project is |
| **Repeated Self-Introduction** | After switching CLI, you have to tell Agent again: I like TypeScript, use pnpm... |
| **Fragmented Config** | Deploy URL in Slack, API Key in notes, paths in your head |
| **Lost Context** | Technical decisions discussed in Claude yesterday, Augment doesn't remember today |

### How OpenMemory Plus Solves This

**🔗 Unified Memory Layer for Multiple CLIs**

```
┌─────────────────────────────────────────────────────────────┐
│                  Without OpenMemory Plus                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │ Gemini  │   │ Augment │   │ Claude  │   │ Cursor  │     │
│  │ CLI     │   │ Agent   │   │ Code    │   │ Agent   │     │
│  ├─────────┤   ├─────────┤   ├─────────┤   ├─────────┤     │
│  │Memory A │   │Memory B │   │Memory C │   │Memory D │     │
│  │(isolated)│  │(isolated)│  │(isolated)│  │(isolated)│    │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘     │
│       ❌ Isolated - must repeat preferences everywhere      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  With OpenMemory Plus                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │ Gemini  │   │ Augment │   │ Claude  │   │ Cursor  │     │
│  │ CLI     │   │ Agent   │   │ Code    │   │ Agent   │     │
│  └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘     │
│       │             │             │             │           │
│       └─────────────┴──────┬──────┴─────────────┘           │
│                            │                                │
│                    ┌───────▼───────┐                        │
│                    │  OpenMemory   │                        │
│                    │  Plus Layer   │                        │
│                    ├───────────────┤                        │
│                    │ • Preferences │                        │
│                    │ • Tech Stack  │                        │
│                    │ • Project Config│                      │
│                    │ • Decisions   │                        │
│                    └───────────────┘                        │
│       ✅ One memory, everywhere. Seamless CLI switching     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**💬 Real Conversation Comparison**

```
┌─────────────────────────────────────────────────────────────┐
│  [Gemini CLI] Morning                                       │
│  User: I prefer TypeScript and pnpm                         │
│  Gemini: Got it, preferences saved ✅                       │
├─────────────────────────────────────────────────────────────┤
│  [Augment] Afternoon - Switch CLI                           │
│  User: Initialize a new project                             │
│  Augment: Sure! Using TypeScript + pnpm based on your prefs │
│           (Auto-loaded from Gemini's saved preferences) ✅  │
├─────────────────────────────────────────────────────────────┤
│  [Claude Code] Evening - Switch again                       │
│  User: Check code style                                     │
│  Claude: I see you prefer functional style, checking...     │
│          (All CLIs share the same memory) ✅                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Use Cases

### 👤 Who Should Use This?

| User Type | Use Case |
|-----------|----------|
| **Solo Developers** | Multi-project development, want Agent to remember each project's config |
| **Full-Stack Engineers** | Frequently switch between frontend/backend, need Agent to remember tech preferences |
| **AI Tool Power Users** | Use Cursor, Claude, Augment simultaneously, want shared memory |
| **Team Tech Leads** | Want version-controlled project config, new members' Agents auto-get context |

