# Commander.js Patterns

**Purpose:** Common patterns for Commander.js CLI development.

---

## Basic Setup

```javascript
const { Command } = require('commander');
const program = new Command();

program
  .name('my-cli')
  .description('CLI description')
  .version('1.0.0');
```

---

## Commands

### Simple Command
```javascript
program
  .command('init')
  .description('Initialize project')
  .action(() => {
    console.log('Initializing...');
  });
```

### Command with Arguments
```javascript
program
  .command('create <name>')
  .description('Create a new item')
  .argument('<name>', 'Item name')
  .action((name) => {
    console.log(`Creating: ${name}`);
  });
```

### Optional Arguments
```javascript
program
  .command('fetch [url]')
  .description('Fetch data')
  .argument('[url]', 'URL to fetch', 'https://default.com')
  .action((url) => {
    console.log(`Fetching: ${url}`);
  });
```

---

## Options

### Boolean Option
```javascript
.option('-v, --verbose', 'Enable verbose mode')
```

### Option with Value
```javascript
.option('-c, --config <path>', 'Config file path')
```

### Option with Default
```javascript
.option('-p, --port <number>', 'Port number', '3000')
```

### Negatable Option
```javascript
.option('--no-color', 'Disable colors')
```

---

## Global Options

```javascript
program
  .option('--json', 'Output as JSON')
  .option('--verbose', 'Verbose output')
  .option('--quiet', 'Suppress output');

// Access in command
program.command('test')
  .action((options, command) => {
    const globalOpts = command.parent.opts();
    if (globalOpts.json) {
      console.log(JSON.stringify(result));
    }
  });
```

---

## Hooks

### Pre-Action Hook
```javascript
program.hook('preAction', (thisCommand, actionCommand) => {
  // Setup before any command runs
  global.logger = createLogger(thisCommand.opts());
});
```

### Post-Action Hook
```javascript
program.hook('postAction', (thisCommand, actionCommand) => {
  // Cleanup after command runs
});
```

---

## Error Handling

```javascript
program.exitOverride((err) => {
  if (program.opts().json) {
    console.log(JSON.stringify({
      success: false,
      error: err.message
    }));
  }
  process.exit(err.exitCode);
});
```

---

## Subcommands

```javascript
const sub = program.command('config');

sub.command('get <key>')
  .action((key) => console.log(config[key]));

sub.command('set <key> <value>')
  .action((key, value) => { config[key] = value; });
```

---

## Parsing

```javascript
// Parse process.argv
program.parse(process.argv);

// Parse custom array
program.parse(['node', 'test', 'command', '--option']);

// Async parsing
await program.parseAsync(process.argv);
```

