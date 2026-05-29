import { useCallback, useEffect, useRef } from 'react';
import MonacoEditor, { type OnMount } from '@monaco-editor/react';
import { FileJson, FileX } from 'lucide-react';
import { MonacoLoader } from './MonacoLoader';
import { TabBar } from './TabBar';
import { useThemeStore } from '../store/useThemeStore';
import styles from './ThemeEditorPane.module.css';

interface ThemeEditorPaneProps {
  onMonacoReady: (monaco: Parameters<OnMount>[1]) => void;
}

export function ThemeEditorPane({ onMonacoReady }: ThemeEditorPaneProps) {
  const { files, activeFileId, setActiveFile, removeFile, updateFileContent } = useThemeStore();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const monacoReadyRef = useRef(false);
  // Track programmatic content changes (tab switches) to avoid false dirty flags
  const isProgrammaticChangeRef = useRef(false);

  const activeFile = files.find((f) => f.id === activeFileId) ?? null;

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      if (!monacoReadyRef.current) {
        monacoReadyRef.current = true;
        onMonacoReady(monaco);
      }
    },
    [onMonacoReady],
  );

  // When active file ID changes, push new content into the editor model
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !activeFile) return;
    const model = editor.getModel();
    if (model && model.getValue() !== activeFile.content) {
      isProgrammaticChangeRef.current = true;
      model.setValue(activeFile.content);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileId]);

  const handleChange = useCallback(
    (value: string | undefined) => {
      // Skip the onChange fired by our programmatic model.setValue
      if (isProgrammaticChangeRef.current) {
        isProgrammaticChangeRef.current = false;
        return;
      }
      if (activeFileId && value !== undefined) {
        updateFileContent(activeFileId, value);
      }
    },
    [activeFileId, updateFileContent],
  );

  return (
    <div className={styles.pane}>
      <TabBar
        files={files}
        activeFileId={activeFileId}
        onSelect={setActiveFile}
        onClose={removeFile}
      />

      <div className={styles.editorWrap}>
        {activeFile ? (
          <MonacoEditor
            height="100%"
            language="json"
            value={activeFile.content}
            onChange={handleChange}
            loading={<MonacoLoader />}
            onMount={handleMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineHeight: 1.7,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontLigatures: true,
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              wordWrap: 'off',
              folding: true,
              foldingHighlight: true,
              bracketPairColorization: { enabled: true },
              formatOnPaste: true,
              renderLineHighlight: 'line',
              smoothScrolling: true,
              cursorSmoothCaretAnimation: 'on',
              renderWhitespace: 'none',
              guides: { indentation: true },
              scrollbar: {
                verticalScrollbarSize: 6,
                horizontalScrollbarSize: 6,
              },
            }}
          />
        ) : (
          <div className={styles.emptyState}>
            <FileX size={40} strokeWidth={1.2} />
            <p>No theme files open</p>
            <span>Use the toolbar above to create or import a theme.</span>
          </div>
        )}
      </div>

      <div className={styles.statusBar}>
        <FileJson size={12} />
        <span>{activeFile ? activeFile.name : 'No file'}</span>
        {activeFile?.isDirty && <span className={styles.dirty}>● unsaved</span>}
      </div>
    </div>
  );
}
