import { useRef } from 'react';
import { X } from 'lucide-react';
import type { ThemeFile } from '../store/useThemeStore';
import styles from './TabBar.module.css';

interface TabBarProps {
  files: ThemeFile[];
  activeFileId: string | null;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

export function TabBar({ files, activeFileId, onSelect, onClose }: TabBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onClose(id);
  };

  // Horizontal scroll on wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className={styles.tabBar} onWheel={handleWheel} ref={scrollRef}>
      {files.map((file) => (
        <button
          key={file.id}
          className={`${styles.tab} ${file.id === activeFileId ? styles.tabActive : ''}`}
          onClick={() => onSelect(file.id)}
          title={file.name}
          type="button"
        >
          <span className={styles.tabDot} data-dirty={file.isDirty} />
          <span className={styles.tabName}>{file.name.replace(/\.json$/, '')}</span>
          <span
            role="button"
            tabIndex={0}
            className={styles.tabClose}
            onClick={(e) => handleClose(e, file.id)}
            onKeyDown={(e) => e.key === 'Enter' && onClose(file.id)}
            aria-label={`Close ${file.name}`}
          >
            <X size={12} />
          </span>
        </button>
      ))}
    </div>
  );
}
