export interface CuratedTheme {
  id: string;
  name: string;
  author: string;
  type: 'dark' | 'light';
  description: string;
  url: string;
}

/**
 * Curated collection of VS Code themes for the theme editor.
 *
 * Theme URLs use jsDelivr CDN for reliable access:
 * - npm packages: cdn.jsdelivr.net/npm/package@version/path
 * - GitHub repos: cdn.jsdelivr.net/gh/owner/repo@branch/path
 *
 * jsDelivr provides faster, more reliable access than raw.githubusercontent.com
 * and handles CORS properly for browser-based theme imports.
 */
export const CURATED_THEMES: CuratedTheme[] = [
  {
    id: 'catppuccin-mocha',
    name: 'Catppuccin Mocha',
    author: 'Catppuccin',
    type: 'dark',
    description: 'Soothing pastel theme for the high-spirited',
    url: 'https://cdn.jsdelivr.net/npm/@catppuccin/vscode@latest/themes/mocha.json',
  },
  {
    id: 'catppuccin-latte',
    name: 'Catppuccin Latte',
    author: 'Catppuccin',
    type: 'light',
    description: 'Soothing pastel theme — light variant',
    url: 'https://cdn.jsdelivr.net/npm/@catppuccin/vscode@latest/themes/latte.json',
  },
  {
    id: 'catppuccin-macchiato',
    name: 'Catppuccin Macchiato',
    author: 'Catppuccin',
    type: 'dark',
    description: 'Soothing pastel theme — macchiato variant',
    url: 'https://cdn.jsdelivr.net/npm/@catppuccin/vscode@latest/themes/macchiato.json',
  },
  {
    id: 'catppuccin-frappe',
    name: 'Catppuccin Frappé',
    author: 'Catppuccin',
    type: 'dark',
    description: 'Soothing pastel theme — frappé variant',
    url: 'https://cdn.jsdelivr.net/npm/@catppuccin/vscode@latest/themes/frappe.json',
  },
  {
    id: 'dracula',
    name: 'Dracula',
    author: 'Dracula Theme',
    type: 'dark',
    description: 'Dark theme with vibrant colors',
    url: 'https://cdn.jsdelivr.net/npm/dracula-theme@4.0.0/template/vscode/dracula.json',
  },
  {
    id: 'dracula-soft',
    name: 'Dracula Soft',
    author: 'Dracula Theme',
    type: 'dark',
    description: 'Soft variant of the classic Dracula theme',
    url: 'https://cdn.jsdelivr.net/npm/dracula-theme@4.0.0/template/vscode/dracula-soft.json',
  },
  {
    id: 'one-dark-pro',
    name: 'One Dark Pro',
    author: 'binaryify',
    type: 'dark',
    description: "Atom's iconic One Dark theme for VS Code",
    url: 'https://cdn.jsdelivr.net/gh/Binaryify/OneDark-Pro@master/themes/OneDark-Pro.json',
  },
  {
    id: 'one-dark-pro-mix',
    name: 'One Dark Pro Mix',
    author: 'binaryify',
    type: 'dark',
    description: 'One Dark Pro with mixed color palette',
    url: 'https://cdn.jsdelivr.net/gh/Binaryify/OneDark-Pro@master/themes/OneDark-Pro-Mix.json',
  },
  {
    id: 'github-dark',
    name: 'GitHub Dark',
    author: 'GitHub',
    type: 'dark',
    description: "GitHub's official dark theme",
    url: 'https://cdn.jsdelivr.net/npm/github-vscode-theme@latest/themes/dark.json',
  },
  {
    id: 'github-light',
    name: 'GitHub Light',
    author: 'GitHub',
    type: 'light',
    description: "GitHub's official light theme",
    url: 'https://cdn.jsdelivr.net/npm/github-vscode-theme@latest/themes/light.json',
  },
  {
    id: 'github-dark-dimmed',
    name: 'GitHub Dark Dimmed',
    author: 'GitHub',
    type: 'dark',
    description: "GitHub's dimmed dark theme",
    url: 'https://cdn.jsdelivr.net/npm/github-vscode-theme@latest/themes/dark-dimmed.json',
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    author: 'enkia',
    type: 'dark',
    description: 'Clean dark theme honoring the lights of downtown Tokyo',
    url: 'https://cdn.jsdelivr.net/gh/enkia/tokyo-night-vscode-theme@master/themes/tokyo-night-color-theme.json',
  },
  {
    id: 'tokyo-night-storm',
    name: 'Tokyo Night Storm',
    author: 'enkia',
    type: 'dark',
    description: 'Tokyo Night with a stormier palette',
    url: 'https://cdn.jsdelivr.net/gh/enkia/tokyo-night-vscode-theme@master/themes/tokyo-night-storm-color-theme.json',
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    author: 'Sarah Drasner',
    type: 'dark',
    description: 'Fine-tuned for those of us who like to code late',
    url: 'https://cdn.jsdelivr.net/gh/sdras/night-owl-vscode-theme@main/themes/Night%20Owl-color-theme.json',
  },
  {
    id: 'night-owl-no-italics',
    name: 'Night Owl (No Italics)',
    author: 'Sarah Drasner',
    type: 'dark',
    description: 'Night Owl without italic styles',
    url: 'https://cdn.jsdelivr.net/gh/sdras/night-owl-vscode-theme@main/themes/Night%20Owl-color-theme-no-italic.json',
  },
  {
    id: 'ayu-dark',
    name: 'Ayu Dark',
    author: 'teabyii',
    type: 'dark',
    description: 'Simple theme with bright colors',
    url: 'https://cdn.jsdelivr.net/gh/ayu-theme/vscode-ayu@master/ayu-dark.json',
  },
  {
    id: 'ayu-mirage',
    name: 'Ayu Mirage',
    author: 'teabyii',
    type: 'dark',
    description: 'Ayu theme with a softer background',
    url: 'https://cdn.jsdelivr.net/gh/ayu-theme/vscode-ayu@master/ayu-mirage.json',
  },
  {
    id: 'ayu-light',
    name: 'Ayu Light',
    author: 'teabyii',
    type: 'light',
    description: 'Ayu light variant',
    url: 'https://cdn.jsdelivr.net/gh/ayu-theme/vscode-ayu@master/ayu-light.json',
  },
  {
    id: 'nord',
    name: 'Nord',
    author: 'arcticicestudio',
    type: 'dark',
    description: 'Arctic, north-bluish color palette',
    url: 'https://cdn.jsdelivr.net/gh/nordtheme/visual-studio-code@develop/themes/nord-color-theme.json',
  },
  {
    id: 'monokai-pro',
    name: 'Monokai Pro',
    author: 'Monokai',
    type: 'dark',
    description: 'Professional theme for professional developers',
    url: 'https://cdn.jsdelivr.net/gh/Monokai/monokai-pro-vscode@master/themes/Monokai%20Pro.json',
  },
  {
    id: 'solarized-dark',
    name: 'Solarized Dark',
    author: 'Ryan Olson',
    type: 'dark',
    description: 'Classic Solarized dark variant',
    url: 'https://cdn.jsdelivr.net/gh/ryanolsonx/vscode-solarized-theme@master/themes/solarized-dark.json',
  },
  {
    id: 'gruvbox-dark',
    name: 'Gruvbox Dark',
    author: 'jdinhify',
    type: 'dark',
    description: "Retro groove color scheme — dark variant",
    url: 'https://cdn.jsdelivr.net/gh/jdinhify/vscode-theme-gruvbox@main/themes/gruvbox-dark-medium.json',
  },
  {
    id: 'material-dark',
    name: 'Material Theme',
    author: 'Equinusocio',
    type: 'dark',
    description: "The most epic theme for VS Code",
    url: 'https://cdn.jsdelivr.net/gh/material-theme/vsc-material-theme@master/themes/Material-Theme-Default.json',
  },
  {
    id: 'palenight',
    name: 'Material Palenight',
    author: 'Equinusocio',
    type: 'dark',
    description: 'Material Palenight variant',
    url: 'https://cdn.jsdelivr.net/gh/material-theme/vsc-material-theme@master/themes/Material-Theme-Palenight.json',
  },
  {
    id: 'synthwave-84',
    name: "SynthWave '84",
    author: 'Robb Owen',
    type: 'dark',
    description: "Inspired by 80s synthwave",
    url: 'https://cdn.jsdelivr.net/gh/robb0wen/synthwave-vscode@master/themes/synthwave-color-theme.json',
  },
  {
    id: 'panda',
    name: 'Panda Syntax',
    author: 'tinkertrain',
    type: 'dark',
    description: 'A superminimal dark Syntax Theme',
    url: 'https://cdn.jsdelivr.net/gh/tinkertrain/panda-syntax-vscode@master/themes/panda-syntax-theme.json',
  },
];
