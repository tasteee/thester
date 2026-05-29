import { useRef } from 'react';
import { FilePlus, Upload, Search, Download, Palette, Save } from 'lucide-react';
import { useThemeStore, DEFAULT_THEME_CONTENT } from '../store/useThemeStore';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  onSearch: () => void;
}

export function Toolbar({ onSearch }: ToolbarProps) {
  const { files, activeFileId, addFile, saveActiveFile } = useThemeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = files.find((f) => f.id === activeFileId);

  const handleNew = () => {
    addFile({ name: 'New Theme.json', content: DEFAULT_THEME_CONTENT });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      addFile({ name: file.name.endsWith('.json') ? file.name : `${file.name}.json`, content });
    };
    reader.readAsText(file);

    // Reset so the same file can be re-uploaded
    e.target.value = '';
  };

  const handleExport = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className={styles.toolbar}>
      <div className={styles.brand}>
        <Palette size={18} className={styles.brandIcon} />
        <span className={styles.brandName}>thester</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleNew} title="New theme file" type="button">
          <FilePlus size={15} />
          <span>New</span>
        </button>

        <button
          className={styles.btn}
          onClick={handleUploadClick}
          title="Upload theme JSON"
          type="button"
        >
          <Upload size={15} />
          <span>Upload</span>
        </button>

        <button
          className={`${styles.btn} ${styles.btnAccent}`}
          onClick={onSearch}
          title="Browse VS Code themes"
          type="button"
        >
          <Search size={15} />
          <span>Browse Themes</span>
        </button>

        <div className={styles.divider} />

        <button
          className={styles.btn}
          onClick={saveActiveFile}
          disabled={!activeFile || !activeFile.isDirty}
          title={
            !activeFile
              ? 'No file to save'
              : activeFile.isDirty
                ? 'Save to browser storage (Ctrl+S)'
                : 'All changes saved'
          }
          type="button"
        >
          <Save size={15} />
          <span>Save</span>
        </button>

        <button
          className={styles.btn}
          onClick={handleExport}
          disabled={!activeFile}
          title={activeFile ? `Export ${activeFile.name}` : 'No file to export'}
          type="button"
        >
          <Download size={15} />
          <span>Export JSON</span>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Upload theme JSON file"
      />
    </header>
  );
}
