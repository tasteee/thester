import { useEffect, useMemo, useState } from 'react';
import { Search, X, Download, Moon, Sun, Loader2 } from 'lucide-react';
import { CURATED_THEMES, type CuratedTheme } from '../utils/curatedThemes';
import {
  importThemeFromOpenVsxExtension,
  searchOpenVsxThemes,
  type OpenVsxSearchResult,
} from '../utils/extensionThemeImport';
import styles from './ThemeSearchModal.module.css';

interface ThemeSearchModalProps {
  onClose: () => void;
  onImport: (name: string, content: string) => void;
}

export function ThemeSearchModal({ onClose, onImport }: ThemeSearchModalProps) {
  const [source, setSource] = useState<'curated' | 'extensions'>('curated');
  const [query, setQuery] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extensions, setExtensions] = useState<OpenVsxSearchResult[]>([]);
  const [extensionsLoading, setExtensionsLoading] = useState(false);

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

  useEffect(() => {
    if (source !== 'extensions') return;
    const q = query.trim();

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      if (!q) {
        setExtensions([]);
        setExtensionsLoading(false);
        setError(null);
        return;
      }

      setExtensionsLoading(true);
      setError(null);
      try {
        const results = await searchOpenVsxThemes(q, controller.signal);
        setExtensions(results);
      } catch (e) {
        if (controller.signal.aborted) return;
        setExtensions([]);
        setError(e instanceof Error ? e.message : 'Failed to search extensions');
      } finally {
        if (!controller.signal.aborted) setExtensionsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [query, source]);

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

  const handleImportExtension = async (ext: OpenVsxSearchResult) => {
    const id = `${ext.namespace}.${ext.name}`;
    setLoadingId(id);
    setError(null);
    try {
      const { filename, content } = await importThemeFromOpenVsxExtension(ext.namespace, ext.name);
      onImport(filename, content);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import extension theme');
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
          <div className={styles.titleWrap}>
            <h2 className={styles.title}>Browse Themes</h2>
            <div className={styles.sourceToggle} role="tablist" aria-label="Theme sources">
              <button
                className={styles.sourceBtn}
                data-active={source === 'curated'}
                onClick={() => setSource('curated')}
                type="button"
                role="tab"
                aria-selected={source === 'curated'}
              >
                Curated
              </button>
              <button
                className={styles.sourceBtn}
                data-active={source === 'extensions'}
                onClick={() => setSource('extensions')}
                type="button"
                role="tab"
                aria-selected={source === 'extensions'}
              >
                Extensions
              </button>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close" type="button">
            <X size={18} />
          </button>
        </div>

        <div className={styles.searchWrap}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder={
              source === 'curated'
                ? 'Search themes by name or author…'
                : 'Search VS Code theme extensions…'
            }
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
          {source === 'curated' ? (
            filtered.length === 0 ? (
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
            )
          ) : extensionsLoading ? (
            <div className={styles.noResults}>Searching extensions…</div>
          ) : query.trim() && extensions.length === 0 ? (
            <div className={styles.noResults}>No extensions match "{query}"</div>
          ) : (
            extensions.map((ext) => (
              <ExtensionThemeCard
                key={`${ext.namespace}.${ext.name}`}
                ext={ext}
                loading={loadingId === `${ext.namespace}.${ext.name}`}
                onImport={handleImportExtension}
              />
            ))
          )}
        </div>

        <div className={styles.footer}>
          <span>
            {source === 'curated'
              ? `${filtered.length} themes available`
              : query.trim()
                ? `${extensions.length} extensions found`
                : 'Search for a theme extension to import'}
          </span>
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

function ExtensionThemeCard({
  ext,
  loading,
  onImport,
}: {
  ext: OpenVsxSearchResult;
  loading: boolean;
  onImport: (e: OpenVsxSearchResult) => void;
}) {
  const displayName = ext.displayName?.trim() || ext.name;
  const description = ext.description?.trim() || 'Theme extension';
  const id = `${ext.namespace}.${ext.name}`;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardName}>{displayName}</span>
        <span className={styles.extBadge} aria-label="Extension theme">
          ext
        </span>
      </div>
      <p className={styles.cardAuthor}>by {ext.namespace}</p>
      <p className={styles.cardDesc}>{description}</p>
      <button
        className={styles.importBtn}
        onClick={() => onImport(ext)}
        disabled={loading}
        type="button"
        title="Imports the first theme contributed by this extension"
      >
        {loading ? (
          <Loader2 size={13} className={styles.spinner} />
        ) : (
          <Download size={13} />
        )}
        {loading ? 'Importing…' : `Import ${id}`}
      </button>
    </div>
  );
}
