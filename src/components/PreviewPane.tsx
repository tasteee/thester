import { useCallback, useEffect, useRef } from 'react';
import MonacoEditor, { type OnMount } from '@monaco-editor/react';
import { ChevronDown } from 'lucide-react';
import { MonacoLoader } from './MonacoLoader';
import { useThemeStore } from '../store/useThemeStore';
import { PREVIEW_SAMPLES } from '../utils/previewSamples';
import styles from './PreviewPane.module.css';

const THEME_NAME = 'user-custom-theme';

interface PreviewPaneProps {
  monacoRef: React.MutableRefObject<Parameters<OnMount>[1] | null>;
}

export function PreviewPane({ monacoRef }: PreviewPaneProps) {
  const { previewLanguage, setPreviewLanguage } = useThemeStore();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const sample = PREVIEW_SAMPLES.find((s) => s.language === previewLanguage) ?? PREVIEW_SAMPLES[0];

  const handleMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  // Update language on the model when previewLanguage changes
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, previewLanguage);
    }
  }, [previewLanguage, monacoRef]);

  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        <span className={styles.label}>Preview</span>
        <div className={styles.languageSelect}>
          <select
            value={previewLanguage}
            onChange={(e) => setPreviewLanguage(e.target.value)}
            aria-label="Select preview language"
          >
            {PREVIEW_SAMPLES.map((s) => (
              <option key={s.language} value={s.language}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown size={13} className={styles.chevron} />
        </div>
      </div>

      <div className={styles.editorWrap}>
        <MonacoEditor
          key={THEME_NAME}
          height="100%"
          language={previewLanguage}
          value={sample.code}
          theme={THEME_NAME}
          loading={<MonacoLoader />}
          onMount={handleMount}
          options={{
            readOnly: true,
            minimap: { enabled: true, scale: 1 },
            fontSize: 13,
            lineHeight: 1.7,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            wordWrap: 'off',
            renderLineHighlight: 'none',
            smoothScrolling: true,
            cursorStyle: 'line',
            renderWhitespace: 'none',
            guides: { indentation: false },
            domReadOnly: true,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            overviewRulerBorder: false,
          }}
        />
      </div>
    </div>
  );
}

export { THEME_NAME };
