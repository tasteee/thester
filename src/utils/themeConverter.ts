import type * as monacoType from 'monaco-editor';

export interface VSCodeTheme {
  name?: string;
  type?: 'dark' | 'light' | 'hc';
  colors?: Record<string, string>;
  tokenColors?: VSCodeTokenColor[];
  semanticTokenColors?: Record<string, unknown>;
  semanticHighlighting?: boolean;
  include?: string;
}

interface VSCodeTokenColor {
  name?: string;
  scope?: string | string[];
  settings?: {
    foreground?: string;
    background?: string;
    fontStyle?: string;
  };
}

function cleanHex(hex: string | undefined): string | undefined {
  if (!hex) return undefined;
  // Monaco token rules need hex WITHOUT #
  return hex.startsWith('#') ? hex.slice(1) : hex;
}

function cleanColorHex(hex: string | undefined): string | undefined {
  if (!hex) return undefined;
  // Monaco colors need hex WITH #
  return hex.startsWith('#') ? hex : `#${hex}`;
}

export function convertVSCodeThemeToMonaco(
  vscodeTheme: VSCodeTheme,
): monacoType.editor.IStandaloneThemeData {
  const base: monacoType.editor.BuiltinTheme =
    vscodeTheme.type === 'light' ? 'vs' : vscodeTheme.type === 'hc' ? 'hc-black' : 'vs-dark';

  const rules: monacoType.editor.ITokenThemeRule[] = [];

  if (Array.isArray(vscodeTheme.tokenColors)) {
    for (const tokenColor of vscodeTheme.tokenColors) {
      const settings = tokenColor.settings ?? {};
      const rawScope = tokenColor.scope;

      // Handle missing scope → apply to root token
      const scopes: string[] = rawScope
        ? Array.isArray(rawScope)
          ? rawScope.map((s) => s.trim()).filter(Boolean)
          : rawScope
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
        : [''];

      for (const scope of scopes) {
        const rule: monacoType.editor.ITokenThemeRule = { token: scope };
        const fg = cleanHex(settings.foreground);
        if (fg) rule.foreground = fg;
        const bg = cleanHex(settings.background);
        if (bg) rule.background = bg;
        if (settings.fontStyle !== undefined) rule.fontStyle = settings.fontStyle;
        rules.push(rule);
      }
    }
  }

  const colors: Record<string, string> = {};
  if (vscodeTheme.colors) {
    for (const [key, value] of Object.entries(vscodeTheme.colors)) {
      const cleaned = cleanColorHex(typeof value === 'string' ? value : undefined);
      if (cleaned) colors[key] = cleaned;
    }
  }

  return { base, inherit: true, rules, colors };
}

export function parseThemeJSON(content: string): VSCodeTheme | null {
  try {
    // Strip JSON comments (VS Code allows them in theme files)
    const stripped = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(stripped) as VSCodeTheme;
  } catch {
    return null;
  }
}
