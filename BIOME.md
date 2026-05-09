# Biome Setup Guide

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

## ✨ Features

- ⚡ **Fast**: 25x faster than ESLint, 97x faster than Prettier
- 🔧 **Auto-fix on save**: Automatically format and fix issues when you save files
- 🎯 **Zero config**: Works out of the box with sensible defaults
- 📦 **All-in-one**: Replaces ESLint + Prettier with a single tool
- 🚀 **Native speed**: Written in Rust for maximum performance

## 🚀 Quick Start

### 1. Install VSCode Extension

Install the [Biome extension](vscode:extension/biomejs.biome) from VSCode marketplace:

```
Cmd+Shift+P → Extensions: Install Extensions → Search "Biome"
```

Or click this link: `vscode:extension/biomejs.biome`

### 2. Reload VSCode

After installing the extension, reload VSCode:
```
Cmd+Shift+P → Developer: Reload Window
```

### 3. Start Using

That's it! Now when you save a file (Cmd+S), it will automatically:
- ✅ Format the code
- ✅ Organize imports
- ✅ Fix linting issues

## 📝 Available Scripts

```bash
# Lint all files
pnpm lint

# Lint and auto-fix
pnpm lint:fix

# Format all files
pnpm format

# Check (lint + format)
pnpm check

# Check and fix everything
pnpm check:fix

# CI check (fails on issues)
pnpm biome:ci
```

## ⚙️ Configuration

Configuration is in [biome.json](biome.json).

### Current Settings

- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quote style**: Single quotes (`'`)
- **JSX quotes**: Double quotes (`"`)
- **Semicolons**: As needed (omitted when possible)
- **Trailing commas**: Always
- **Arrow parentheses**: Always

### Customize

Edit `biome.json` to customize rules:

```json
{
  "formatter": {
    "lineWidth": 120,  // Change line width
    "indentWidth": 4   // Change indent
  },
  "linter": {
    "rules": {
      "suspicious": {
        "noExplicitAny": "off"  // Disable a rule
      }
    }
  }
}
```

## 🎯 Format on Save

Format on save is enabled by default in `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  }
}
```

### Disable Format on Save (Optional)

If you want to format manually:

1. Open `.vscode/settings.json`
2. Change:
   ```json
   "editor.formatOnSave": false
   ```

## 🔄 Migrating from ESLint/Prettier

Biome replaces both ESLint and Prettier:

### What's Disabled

In `.vscode/settings.json`:
```json
{
  "eslint.enable": false,
  "prettier.enable": false
}
```

### Remove Old Config Files (Optional)

You can remove these files if you don't need them:
```bash
rm .eslintrc.json
rm .prettierrc
rm .prettierignore
```

## 🎨 Supported Files

Biome supports:
- ✅ JavaScript (`.js`, `.mjs`, `.cjs`)
- ✅ TypeScript (`.ts`, `.mts`, `.cts`)
- ✅ JSX/TSX (`.jsx`, `.tsx`)
- ✅ JSON (`.json`, `.jsonc`)

## 🚫 Ignored Files

These are automatically ignored (configured in `biome.json`):
- `node_modules/`
- `build/`
- `dist/`
- `.react-router/`
- `*.min.js`
- `coverage/`

## 🔧 Manual Commands

### Format a specific file
```bash
pnpm biome format --write path/to/file.ts
```

### Lint a specific directory
```bash
pnpm biome lint app/
```

### Check a single file
```bash
pnpm biome check path/to/file.ts
```

## ⌨️ Keyboard Shortcuts

In VSCode:

| Action | Shortcut (Mac) | Shortcut (Windows) |
|--------|---------------|-------------------|
| Format Document | `Shift+Option+F` | `Shift+Alt+F` |
| Format Selection | `Cmd+K Cmd+F` | `Ctrl+K Ctrl+F` |
| Organize Imports | `Shift+Option+O` | `Shift+Alt+O` |

## 🐛 Troubleshooting

### Biome not formatting on save

1. **Check extension is installed**:
   ```
   Cmd+Shift+X → Search "Biome"
   ```

2. **Check settings**:
   - Open `.vscode/settings.json`
   - Verify `"editor.formatOnSave": true`
   - Verify `"editor.defaultFormatter": "biomejs.biome"`

3. **Reload VSCode**:
   ```
   Cmd+Shift+P → Developer: Reload Window
   ```

### Conflicts with ESLint/Prettier

Disable them in `.vscode/settings.json`:
```json
{
  "eslint.enable": false,
  "prettier.enable": false
}
```

### Biome binary not found

Run:
```bash
pnpm install
```

## 📊 Performance Comparison

| Tool | Time (10,000 files) |
|------|---------------------|
| **Biome** | ~1s |
| ESLint | ~25s |
| Prettier | ~97s |

Biome is significantly faster! ⚡

## 📚 Resources

- [Biome Documentation](https://biomejs.dev/)
- [VSCode Extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Configuration Reference](https://biomejs.dev/reference/configuration/)
- [Rules Reference](https://biomejs.dev/linter/rules/)

## 🎓 Tips

1. **Use `check:fix` for quick cleanup**:
   ```bash
   pnpm check:fix
   ```

2. **Run in CI**:
   ```bash
   pnpm biome:ci
   ```

3. **Format before committing**:
   Add to your git hooks:
   ```bash
   pnpm format
   ```

4. **VSCode Command Palette**:
   - `Cmd+Shift+P → Biome: Format`
   - `Cmd+Shift+P → Biome: Fix all auto-fixable problems`

---

**Happy coding with Biome! 🚀**
