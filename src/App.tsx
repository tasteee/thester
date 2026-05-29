import { useCallback, useEffect, useRef, useState } from 'react';
import type { OnMount } from '@monaco-editor/react';
import { Toolbar } from './components/Toolbar';
import { ThemeEditorPane } from './components/ThemeEditorPane';
import { PreviewPane, THEME_NAME } from './components/PreviewPane';
import { ThemeSearchModal } from './components/ThemeSearchModal';
import { useThemeStore } from './store/useThemeStore';
import { convertVSCodeThemeToMonaco, parseThemeJSON } from './utils/themeConverter';
import './App.css';

export default function App() {
  const { files, activeFileId, addFile, saveActiveFile } = useThemeStore();
  const [showSearch, setShowSearch] = useState(false);
  const [splitPercent, setSplitPercent] = useState(50);
  const [monacoReady, setMonacoReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const monacoRef = useRef<Parameters<OnMount>[1] | null>(null);

  const handleMonacoReady = useCallback((monaco: Parameters<OnMount>[1]) => {
    monacoRef.current = monaco;
    // Define a neutral placeholder first so the preview editor has a theme
    monaco.editor.defineTheme(THEME_NAME, {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {},
    });
    monaco.editor.setTheme(THEME_NAME);
    setMonacoReady(true);
  }, []);

  // Apply the theme whenever the active file content changes OR when Monaco first becomes ready
  const activeFile = files.find((f) => f.id === activeFileId);
  const activeContent = activeFile?.content;

  useEffect(() => {
    const monaco = monacoRef.current;
    if (!monaco || !activeContent) return;

    const parsed = parseThemeJSON(activeContent);
    if (!parsed) return;

    try {
      const monacoTheme = convertVSCodeThemeToMonaco(parsed);
      monaco.editor.defineTheme(THEME_NAME, monacoTheme);
      monaco.editor.setTheme(THEME_NAME);
    } catch {
      // silently ignore conversion errors — keep previous theme
    }
  }, [activeContent, monacoReady]);

  // Intercept Ctrl/Cmd+S so it saves in-app rather than opening "Save page as…"
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() !== 's') return;
      e.preventDefault();
      saveActiveFile();
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [saveActiveFile]);

  // ── Split pane resize ────────────────────────────────────────────────────
  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const startX = e.clientX;
    const startPct = splitPercent;

    const onMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const dx = ev.clientX - startX;
      const newPct = startPct + (dx / containerWidth) * 100;
      setSplitPercent(Math.max(20, Math.min(80, newPct)));
    };

    const onMouseUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // ── Import from search modal ─────────────────────────────────────────────
  const handleImport = useCallback(
    (name: string, content: string) => {
      addFile({ name, content });
    },
    [addFile],
  );

  return (
    <div className="app">
      <Toolbar onSearch={() => setShowSearch(true)} />

      <div className="split-container" ref={containerRef}>
        <div className="split-pane" style={{ width: `${splitPercent}%` }}>
          <ThemeEditorPane onMonacoReady={handleMonacoReady} />
        </div>

        <div
          className="split-divider"
          onMouseDown={handleDividerMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panels"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setSplitPercent((p) => Math.max(20, p - 2));
            if (e.key === 'ArrowRight') setSplitPercent((p) => Math.min(80, p + 2));
          }}
        >
          <div className="split-handle" />
        </div>

        <div className="split-pane" style={{ flex: 1 }}>
          <PreviewPane monacoRef={monacoRef} />
        </div>
      </div>

      {showSearch && (
        <ThemeSearchModal onClose={() => setShowSearch(false)} onImport={handleImport} />
      )}
    </div>
  );
}
