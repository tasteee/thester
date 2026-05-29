# Thester — VS Code Theme Testbed

A gorgeous, premium-grade live testbed for crafting, previewing, and exporting VS Code color themes — right in the browser.

## Features

- **Multi-tab theme editing** — open multiple theme JSON files simultaneously; the focused tab drives the live preview
- **Live Monaco preview** — the right pane updates instantly as you edit JSON; choose from 12 different programming languages
- **Browse & import themes** — 25+ curated popular themes (Catppuccin, Dracula, One Dark Pro, Tokyo Night, Night Owl, GitHub, Nord, and more) with one-click import
- **Upload your own theme** — drag and drop or file-select any `.json` theme file
- **Start from scratch** — a polished blank template ready to edit
- **Export as JSON** — download your finished theme with one click
- **Resizable split pane** — drag the divider to balance editor / preview real estate
- **Keyboard-accessible resize** — arrow keys move the divider when it's focused

## Tech Stack

| Layer       | Tool                                |
|-------------|-------------------------------------|
| Framework   | React 19 + TypeScript               |
| Build       | Vite                                |
| Editors     | Monaco Editor (`@monaco-editor/react`) |
| State       | Zustand                             |
| Icons       | Lucide React                        |
| Styles      | CSS Modules + CSS custom properties |

## Getting Started

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build
npm run lint     # ESLint check
```

## How It Works

1. **Edit JSON** in the left Monaco editor — it accepts VS Code color theme JSON with full schema support, bracket colorization, and folding
2. **The theme is applied** to the right preview editor automatically as you type (invalid JSON is silently ignored)
3. **Switch tabs** to work on multiple themes; the focused tab always drives the preview
4. **Import** a curated theme as a starting point, or upload your own
5. **Export** the active theme as a `.json` file ready to drop into a VS Code extension

## Theme JSON Format

Thester supports the standard VS Code color theme format:

```json
{
  "$schema": "vscode://schemas/color-theme",
  "name": "My Theme",
  "type": "dark",
  "colors": {
    "editor.background": "#1e1e2e",
    "editor.foreground": "#cdd6f4"
  },
  "tokenColors": [
    {
      "name": "Keywords",
      "scope": ["keyword", "storage.type"],
      "settings": { "foreground": "#cba6f7" }
    }
  ]
}
```

See the [VS Code theme color reference](https://code.visualstudio.com/api/references/theme-color) for the full list of supported color keys.
