import { useState, useMemo } from 'react';
import { Search, X, Download, Moon, Sun, Loader2 } from 'lucide-react';
import { CURATED_THEMES, type CuratedTheme } from '../utils/curatedThemes';
import styles from './ThemeSearchModal.module.css';

interface ThemeSearchModalProps {
  onClose: () => void;
  onImport: (name: string, content: string) => void;
}

export function ThemeSearchModal({ onClose, onImport }: ThemeSearchModalProps) {
  const [query, setQuery] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return CURATED_THEMES;
    return CURATED_THEMES.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }, [query]);

  const handleImport = async (theme: CuratedTheme) => {
    setLoadingId(theme.id);
    setError(null);
    try {
      const res = await fetch(theme.url);
      if (!res.ok) throw new Error(`Failed to fetch theme (${res.status})`);
      const text = await res.text();
      // Validate it's parseable JSON
      JSON.parse(text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, ''));
      onImport(`${theme.name}.json`, text);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import theme');
    } finally {
      setLoadingId(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-label="Browse themes">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Browse Themes</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close" type="button">
            <X size={18} />
          </button>
        </div>

        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search themes by name or author…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => setQuery('')} type="button" aria-label="Clear search">
              <X size={13} />
            </button>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.noResults}>No themes match "{query}"</div>
          ) : (
            filtered.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                loading={loadingId === theme.id}
                onImport={handleImport}
              />
            ))
          )}
        </div>

        <div className={styles.footer}>
          <span>{filtered.length} themes available</span>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({
  theme,
  loading,
  onImport,
}: {
  theme: CuratedTheme;
  loading: boolean;
  onImport: (t: CuratedTheme) => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardName}>{theme.name}</span>
        <span
          className={styles.typeBadge}
          data-type={theme.type}
          aria-label={`${theme.type} theme`}
        >
          {theme.type === 'dark' ? <Moon size={10} /> : <Sun size={10} />}
          {theme.type}
        </span>
      </div>
      <p className={styles.cardAuthor}>by {theme.author}</p>
      <p className={styles.cardDesc}>{theme.description}</p>
      <button
        className={styles.importBtn}
        onClick={() => onImport(theme)}
        disabled={loading}
        type="button"
      >
        {loading ? (
          <Loader2 size={13} className={styles.spinner} />
        ) : (
          <Download size={13} />
        )}
        {loading ? 'Importing…' : 'Import'}
      </button>
    </div>
  );
}
