import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { existsSync, mkdirSync, copyFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { checkAllDependencies, isSystemReady } from '../lib/detector.js';

interface InitOptions {
  ide?: string;
  yes?: boolean;
  projectName?: string;
  generateMcp?: boolean;
}

interface IdeConfig {
  dir: string;
  configFile: string;
  commandsDir: string;
  skillsDir: string;
  rulesDir: string;
}

const IDE_CONFIGS: Record<string, IdeConfig> = {
  augment: { dir: '.augment', configFile: 'AGENTS.md', commandsDir: 'commands', skillsDir: 'skills', rulesDir: '.rules/memory' },
  claude: { dir: '.', configFile: 'CLAUDE.md', commandsDir: '.claude/commands', skillsDir: '.claude/skills', rulesDir: '.rules/memory' },
  cursor: { dir: '.cursor', configFile: '.cursorrules', commandsDir: 'commands', skillsDir: 'skills', rulesDir: '.rules/memory' },
  gemini: { dir: '.', configFile: 'gemini.md', commandsDir: '.gemini/commands', skillsDir: '.gemini/skills', rulesDir: '.rules/memory' },
  common: { dir: '.', configFile: 'AGENTS.md', commandsDir: '.agents/commands', skillsDir: '.agents/skills', rulesDir: '.rules/memory' },
};

function getTemplatesDir(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  // 开发时: cli/src/commands/ -> cli/dist/ (编译后) -> templates/
  // npm 包: dist/ -> templates/ (在 cli 包根目录)
  // 尝试多个可能的路径
  const possiblePaths = [
    join(__dirname, '..', 'templates'),       // npm 包: dist/../templates
    join(__dirname, '..', '..', 'templates'), // 开发时 (从 dist/)
    join(__dirname, '..', '..', '..', 'templates'), // 旧路径 (从 src/)
  ];

  for (const p of possiblePaths) {
    if (existsSync(join(p, 'shared'))) {
      return p;
    }
  }

  // 默认返回第一个
  return possiblePaths[0];
}

function copyDir(src: string, dest: string): void {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const file of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, file.name);
    const destPath = join(dest, file.name);
    if (file.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function generateProjectYaml(projectName: string): string {
  return `# OpenMemory Plus Project Configuration
# Generated: ${new Date().toISOString()}

project:
  name: "${projectName}"
  version: "1.0.0"
  description: ""

memory:
  # 项目级记忆存储位置
  project_store: ".memory/"
  # 用户级记忆 (openmemory MCP)
  user_store: "openmemory"

classification:
  # 项目级信息关键词 (存入 .memory/)
  project_keywords:
    - "项目配置"
    - "技术决策"
    - "部署信息"
    - "API 密钥"
    - "架构设计"
    - "数据库"
  # 用户级信息关键词 (存入 openmemory)
  user_keywords:
    - "用户偏好"
    - "编码风格"
    - "技能"
    - "习惯"
    - "喜欢"

agent:
  # 对话结束时自动提取记忆
  auto_extract: true
  # 对话开始时自动搜索上下文
  auto_search: true
  # MCP 不可用时降级到文件存储
  fallback_to_file: true
`;
}

export async function initCommand(options: InitOptions): Promise<void> {
  console.log(chalk.cyan.bold('\n🧠 OpenMemory Plus - 项目初始化\n'));
  
  // Check dependencies
  const spinner = ora('检测系统依赖...').start();
  const status = await checkAllDependencies();
  spinner.stop();
  
  if (!isSystemReady(status)) {
    console.log(chalk.yellow('⚠️ 系统依赖未就绪'));
    console.log(chalk.gray('建议先运行 ') + chalk.cyan('openmemory-plus install'));
    
    if (!options.yes) {
      const { cont } = await inquirer.prompt([{
        type: 'confirm', name: 'cont', message: '是否继续初始化?', default: false,
      }]);
      if (!cont) return;
    }
  }
  
  // Select IDE
  let ide = options.ide?.toLowerCase();
  if (!ide || !IDE_CONFIGS[ide]) {
    const { selectedIde } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedIde',
      message: '选择 IDE 类型:',
      choices: [
        { name: 'Augment', value: 'augment' },
        { name: 'Claude Code', value: 'claude' },
        { name: 'Cursor', value: 'cursor' },
        { name: 'Gemini', value: 'gemini' },
        { name: '通用 (AGENTS.md)', value: 'common' },
      ],
      default: 'augment',
    }]);
    ide = selectedIde;
  }
  
  // Get project name
  let projectName = options.projectName;
  if (!projectName) {
    const cwd = process.cwd();
    const defaultName = cwd.split('/').pop() || 'my-project';
    const { name } = await inquirer.prompt([{
      type: 'input', name: 'name', message: '项目名称:', default: defaultName,
    }]);
    projectName = name;
  }
  
  const config = IDE_CONFIGS[ide!];
  const cwd = process.cwd();
  
  console.log(chalk.bold('\n📁 创建配置文件...'));
  
  // Create .memory directory
  const memoryDir = join(cwd, '.memory');
  if (!existsSync(memoryDir)) {
    mkdirSync(memoryDir, { recursive: true });
    console.log(chalk.green('  ✓ 创建 .memory/'));
  }
  
  // Create project.yaml
  const projectYaml = join(memoryDir, 'project.yaml');
  writeFileSync(projectYaml, generateProjectYaml(projectName!));
  console.log(chalk.green('  ✓ 创建 .memory/project.yaml'));
  
  const templatesDir = getTemplatesDir();
  const sharedTemplates = join(templatesDir, 'shared');
  const ideTemplates = join(templatesDir, ide === 'common' ? 'common' : ide!);

  // Create and copy commands from shared templates
  const commandsDir = join(cwd, config.dir, config.commandsDir);
  mkdirSync(commandsDir, { recursive: true });
  copyDir(join(sharedTemplates, 'commands'), commandsDir);
  console.log(chalk.green(`  ✓ 创建 ${config.dir}/${config.commandsDir}/ (6 个命令)`));

  // Create and copy skills from shared templates
  const skillsDir = join(cwd, config.dir, config.skillsDir);
  mkdirSync(skillsDir, { recursive: true });
  copyDir(join(sharedTemplates, 'skills'), skillsDir);
  console.log(chalk.green(`  ✓ 创建 ${config.dir}/${config.skillsDir}/ (memory-extraction)`));

  // Create and copy rules from shared templates
  const rulesDir = join(cwd, config.rulesDir);
  mkdirSync(rulesDir, { recursive: true });
  copyDir(join(sharedTemplates, 'rules'), rulesDir);
  console.log(chalk.green(`  ✓ 创建 ${config.rulesDir}/ (classification.md)`));

  // Copy IDE-specific config file
  if (existsSync(ideTemplates)) {
    copyDir(ideTemplates, join(cwd, config.dir));
    console.log(chalk.green(`  ✓ 复制 IDE 配置文件`));
  }

  // Generate MCP config if requested
  if (options.generateMcp) {
    generateMcpConfig(ide!);
  }

  console.log(chalk.green.bold('\n🎉 OpenMemory Plus 初始化完成!\n'));
  console.log(chalk.gray('使用 ') + chalk.cyan('/memory') + chalk.gray(' 查看记忆状态'));
  console.log(chalk.gray('使用 ') + chalk.cyan('/mem search <query>') + chalk.gray(' 搜索记忆'));

  if (!options.generateMcp) {
    console.log(chalk.gray('\n💡 提示: 运行 ') + chalk.cyan('openmemory-plus init --generate-mcp') + chalk.gray(' 生成 MCP 配置\n'));
  }
}

function generateMcpConfig(ide: string): void {
  console.log(chalk.bold('\n📋 MCP 配置 (复制到 IDE 配置文件):'));

  const mcpConfig = {
    openmemory: {
      command: "npx",
      args: ["-y", "openmemory-mcp"],
      env: {
        OPENAI_API_KEY: "your-openai-key-or-use-ollama",
        MEM0_EMBEDDING_MODEL: "bge-m3",
        MEM0_EMBEDDING_PROVIDER: "ollama",
        QDRANT_HOST: "localhost",
        QDRANT_PORT: "6333"
      }
    }
  };

  console.log(chalk.cyan('\n```json'));
  console.log(JSON.stringify(mcpConfig, null, 2));
  console.log(chalk.cyan('```\n'));

  const configPaths: Record<string, string> = {
    augment: '~/.augment/settings.json (mcpServers 字段)',
    claude: '~/.config/claude/mcp.json',
    cursor: '~/.cursor/mcp.json',
    gemini: '~/.config/gemini/mcp.json',
    common: '参考各 IDE 的 MCP 配置文档',
  };

  console.log(chalk.gray(`配置文件位置: ${configPaths[ide] || configPaths.common}`));
}

