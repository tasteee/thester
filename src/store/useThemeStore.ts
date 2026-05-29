import { create } from 'zustand';
import { nanoid } from '../utils/nanoid';

export interface ThemeFile {
  id: string;
  name: string;
  content: string;
  isDirty: boolean;
}

interface PersistedThemeStore {
  files: ThemeFile[];
  activeFileId: string | null;
  previewLanguage: string;
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
  saveFile: (id: string) => void;
  saveActiveFile: () => void;
  renameFile: (id: string, name: string) => void;
  setPreviewLanguage: (lang: string) => void;
}

const STORAGE_KEY = 'thester.themeStore.v1';

function safeParsePersisted(raw: string | null): PersistedThemeStore | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<PersistedThemeStore>;
    if (!Array.isArray(data.files) || typeof data.previewLanguage !== 'string') return null;
    const files: ThemeFile[] = data.files
      .filter((f): f is ThemeFile => Boolean(f && typeof f === 'object'))
      .map((f) => ({
        id: typeof f.id === 'string' && f.id ? f.id : nanoid(),
        name: typeof f.name === 'string' && f.name ? f.name : 'Untitled.json',
        content: typeof f.content === 'string' ? f.content : DEFAULT_THEME_CONTENT,
        isDirty: Boolean(f.isDirty),
      }));

    if (files.length === 0) return null;

    const activeFileId =
      typeof data.activeFileId === 'string' && files.some((f) => f.id === data.activeFileId)
        ? data.activeFileId
        : files[0]?.id ?? null;

    return { files, activeFileId, previewLanguage: data.previewLanguage };
  } catch {
    return null;
  }
}

function loadPersistedStore(): PersistedThemeStore | null {
  if (typeof window === 'undefined') return null;
  return safeParsePersisted(window.localStorage.getItem(STORAGE_KEY));
}

function persistStoreState(state: PersistedThemeStore) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore persistence failures (e.g. storage quota / privacy mode)
  }
}

const persisted = loadPersistedStore();
const fallbackInitialFileId = nanoid();
const initialState: PersistedThemeStore =
  persisted ??
  ({
    files: [
      {
        id: fallbackInitialFileId,
        name: 'My Custom Theme.json',
        content: DEFAULT_THEME_CONTENT,
        isDirty: false,
      },
    ],
    activeFileId: fallbackInitialFileId,
    previewLanguage: 'typescript',
  } satisfies PersistedThemeStore);

export const useThemeStore = create<ThemeStore>((set, get) => ({
  files: initialState.files,
  activeFileId: initialState.activeFileId,
  previewLanguage: initialState.previewLanguage,

  addFile: (file) => {
    const id = nanoid();
    set((state) => {
      const next: PersistedThemeStore = {
        files: [...state.files, { ...file, id, isDirty: false }],
        activeFileId: id,
        previewLanguage: state.previewLanguage,
      };
      persistStoreState(next);
      return next;
    });
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

    set((state) => {
      const next: PersistedThemeStore = {
        files: remaining,
        activeFileId: newActive,
        previewLanguage: state.previewLanguage,
      };
      persistStoreState(next);
      return next;
    });
  },

  setActiveFile: (id) =>
    set((state) => {
      const next: PersistedThemeStore = { ...state, activeFileId: id };
      persistStoreState(next);
      return next;
    }),

  updateFileContent: (id, content) =>
    set((state) => {
      const next: PersistedThemeStore = {
        files: state.files.map((f) => (f.id === id ? { ...f, content, isDirty: true } : f)),
        activeFileId: state.activeFileId,
        previewLanguage: state.previewLanguage,
      };
      persistStoreState(next);
      return next;
    }),

  saveFile: (id) =>
    set((state) => {
      const next: PersistedThemeStore = {
        files: state.files.map((f) => (f.id === id ? { ...f, isDirty: false } : f)),
        activeFileId: state.activeFileId,
        previewLanguage: state.previewLanguage,
      };
      persistStoreState(next);
      return next;
    }),

  saveActiveFile: () => {
    const { activeFileId, saveFile } = get();
    if (activeFileId) saveFile(activeFileId);
  },

  renameFile: (id, name) =>
    set((state) => {
      const next: PersistedThemeStore = {
        files: state.files.map((f) => (f.id === id ? { ...f, name } : f)),
        activeFileId: state.activeFileId,
        previewLanguage: state.previewLanguage,
      };
      persistStoreState(next);
      return next;
    }),

  setPreviewLanguage: (lang) =>
    set((state) => {
      const next: PersistedThemeStore = { ...state, previewLanguage: lang };
      persistStoreState(next);
      return next;
    }),
}));
