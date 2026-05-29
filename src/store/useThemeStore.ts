import { create } from 'zustand';
import { nanoid } from '../utils/nanoid';

export interface ThemeFile {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
}

export const DEFAULT_THEME_CONTENT = JSON.stringify(
  {
    $schema: 'vscode://schemas/color-theme',
    name: 'My Custom Theme',
    type: 'dark',
    colors: {
      'editor.background': '#1e1e2e',
      'editor.foreground': '#cdd6f4',
      'editor.lineHighlightBackground': '#313244',
      'editor.selectionBackground': '#45475a80',
      'editorCursor.foreground': '#f5c2e7',
      'editorLineNumber.foreground': '#6c7086',
      'editorLineNumber.activeForeground': '#cdd6f4',
      'editorBracketHighlight.foreground1': '#f38ba8',
      'editorBracketHighlight.foreground2': '#fab387',
      'editorBracketHighlight.foreground3': '#f9e2af',
      'activityBar.background': '#1e1e2e',
      'activityBar.foreground': '#cdd6f4',
      'sideBar.background': '#181825',
      'sideBar.foreground': '#cdd6f4',
      'titleBar.activeBackground': '#1e1e2e',
      'titleBar.activeForeground': '#cdd6f4',
      'statusBar.background': '#1e1e2e',
      'statusBar.foreground': '#cdd6f4',
      'tab.activeBackground': '#1e1e2e',
      'tab.inactiveBackground': '#181825',
    },
    tokenColors: [
      {
        name: 'Comments',
        scope: ['comment', 'punctuation.definition.comment'],
        settings: { foreground: '#6c7086', fontStyle: 'italic' },
      },
      {
        name: 'Keywords',
        scope: ['keyword', 'storage.type', 'storage.modifier'],
        settings: { foreground: '#cba6f7' },
      },
      {
        name: 'Strings',
        scope: ['string', 'string.quoted'],
        settings: { foreground: '#a6e3a1' },
      },
      {
        name: 'Numbers',
        scope: ['constant.numeric', 'constant.language'],
        settings: { foreground: '#fab387' },
      },
      {
        name: 'Functions',
        scope: ['entity.name.function', 'support.function'],
        settings: { foreground: '#89b4fa' },
      },
      {
        name: 'Types / Classes',
        scope: ['entity.name.type', 'entity.name.class', 'support.class'],
        settings: { foreground: '#f9e2af' },
      },
      {
        name: 'Variables',
        scope: ['variable', 'variable.other'],
        settings: { foreground: '#cdd6f4' },
      },
    ],
  },
  null,
  2,
);

interface ThemeStore {
  files: ThemeFile[];
  activeFileId: string | null;
  previewLanguage: string;

  addFile: (file: Omit<ThemeFile, 'id' | 'isDirty'>) => string;
  removeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  renameFile: (id: string, name: string) => void;
  setPreviewLanguage: (lang: string) => void;
}

const initialFileId = nanoid();

export const useThemeStore = create<ThemeStore>((set, get) => ({
  files: [
    {
      id: initialFileId,
      name: 'My Custom Theme.json',
      content: DEFAULT_THEME_CONTENT,
      isDirty: false,
    },
  ],
  activeFileId: initialFileId,
  previewLanguage: 'typescript',

  addFile: (file) => {
    const id = nanoid();
    set((state) => ({
      files: [...state.files, { ...file, id, isDirty: false }],
      activeFileId: id,
    }));
    return id;
  },

  removeFile: (id) => {
    const { files, activeFileId } = get();
    const idx = files.findIndex((f) => f.id === id);
    const remaining = files.filter((f) => f.id !== id);

    let newActive = activeFileId;
    if (activeFileId === id) {
      if (remaining.length > 0) {
        const newIdx = Math.max(0, idx - 1);
        newActive = remaining[newIdx]?.id ?? remaining[0]?.id ?? null;
      } else {
        newActive = null;
      }
    }

    set({ files: remaining, activeFileId: newActive });
  },

  setActiveFile: (id) => set({ activeFileId: id }),

  updateFileContent: (id, content) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, content, isDirty: true } : f)),
    })),

  renameFile: (id, name) =>
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, name } : f)),
    })),

  setPreviewLanguage: (lang) => set({ previewLanguage: lang }),
}));
