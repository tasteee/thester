import { parseThemeJSON } from './themeConverter';

export interface OpenVsxSearchResult {
  namespace: string;
  name: string;
  version?: string;
  displayName?: string;
  description?: string;
}

interface OpenVsxExtensionDetail {
  namespace: string;
  name: string;
  version?: string;
  repository?: unknown;
}

interface PackageJsonThemeContribution {
  label?: string;
  id?: string;
  uiTheme?: string;
  path?: string;
}

function normalizeGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url
    .trim()
    .replace(/^git\+/, '')
    .replace(/\.git$/, '')
    .replace(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
    .replace(/^git@github\.com:/, 'https://github.com/');

  const match = cleaned.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)/i);
  if (!match) return null;
  const owner = match[1] ?? '';
  const repo = match[2] ?? '';
  if (!owner || !repo) return null;
  return { owner, repo };
}

function getRepositoryUrl(repoField: unknown): string | null {
  if (!repoField) return null;
  if (typeof repoField === 'string') return repoField;
  if (typeof repoField === 'object') {
    const maybeUrl = (repoField as { url?: unknown }).url;
    if (typeof maybeUrl === 'string') return maybeUrl;
  }
  return null;
}

async function fetchTextFirst(urls: string[]): Promise<{ text: string; url: string }> {
  let lastError: unknown = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { text: await res.text(), url };
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Failed to fetch');
}

function buildRefCandidates(version: string | undefined): string[] {
  const candidates = [
    version ? `v${version}` : null,
    version ?? null,
    'main',
    'master',
  ].filter(Boolean) as string[];
  return [...new Set(candidates)];
}

function jsdelivrGhUrl(owner: string, repo: string, ref: string, path: string) {
  const cleanPath = path.replace(/^\.\//, '').replace(/^\/+/, '');
  return `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${cleanPath}`;
}

function inferRefFromUrl(url: string): string | null {
  // Best-effort: parse ref out of jsDelivr URL we successfully fetched
  // https://cdn.jsdelivr.net/gh/owner/repo@ref/path
  const match = url.match(/\/gh\/[^/]+\/[^@]+@([^/]+)\//);
  return match?.[1] ?? null;
}

export async function searchOpenVsxThemes(query: string, signal?: AbortSignal) {
  const q = query.trim();
  if (!q) return [] as OpenVsxSearchResult[];

  const url = `https://open-vsx.org/api/-/search?query=${encodeURIComponent(q)}&size=20&category=Themes`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Open VSX search failed (${res.status})`);

  const data = (await res.json()) as { extensions?: unknown };
  const list = Array.isArray(data.extensions) ? data.extensions : [];

  return list
    .map((ext) => {
      const e = ext as Partial<OpenVsxSearchResult>;
      return {
        namespace: typeof e.namespace === 'string' ? e.namespace : '',
        name: typeof e.name === 'string' ? e.name : '',
        version: typeof e.version === 'string' ? e.version : undefined,
        displayName: typeof e.displayName === 'string' ? e.displayName : undefined,
        description: typeof e.description === 'string' ? e.description : undefined,
      };
    })
    .filter((e) => e.namespace && e.name);
}

export async function importThemeFromOpenVsxExtension(
  namespace: string,
  name: string,
): Promise<{ filename: string; content: string }> {
  const detailUrl = `https://open-vsx.org/api/${encodeURIComponent(namespace)}/${encodeURIComponent(name)}`;
  const detailRes = await fetch(detailUrl);
  if (!detailRes.ok) throw new Error(`Failed to load extension details (${detailRes.status})`);
  const detail = (await detailRes.json()) as OpenVsxExtensionDetail;

  const repoUrl = getRepositoryUrl(detail.repository);
  if (!repoUrl) throw new Error('Extension does not publish a repository URL');
  const repo = normalizeGitHubRepoUrl(repoUrl);
  if (!repo) throw new Error('Only GitHub-hosted extension repositories are supported right now');

  const refCandidates = buildRefCandidates(detail.version);
  const packageJsonUrls = refCandidates.map((ref) => jsdelivrGhUrl(repo.owner, repo.repo, ref, 'package.json'));
  const { text: packageJsonText, url: packageJsonFetchedUrl } = await fetchTextFirst(packageJsonUrls);
  const refUsed = inferRefFromUrl(packageJsonFetchedUrl) ?? refCandidates[0] ?? 'main';

  let packageJson: unknown;
  try {
    packageJson = JSON.parse(packageJsonText);
  } catch {
    throw new Error('Extension repository package.json is not valid JSON');
  }

  const contributes = (packageJson as { contributes?: unknown }).contributes as
    | { themes?: unknown }
    | undefined;
  const rawThemes = contributes?.themes;
  const themes = Array.isArray(rawThemes) ? rawThemes : [];
  const normalizedThemes = themes
    .map((t) => {
      const theme = t as PackageJsonThemeContribution;
      return {
        label: typeof theme.label === 'string' ? theme.label : undefined,
        path: typeof theme.path === 'string' ? theme.path : undefined,
      };
    })
    .filter((t) => Boolean(t.path));

  const first = normalizedThemes[0];
  if (!first?.path) throw new Error('No contributed theme JSON files found in package.json');

  const themeUrl = jsdelivrGhUrl(repo.owner, repo.repo, refUsed, first.path);
  const themeRes = await fetch(themeUrl);
  if (!themeRes.ok) throw new Error(`Failed to fetch theme JSON (${themeRes.status})`);
  const content = await themeRes.text();

  // Basic validation so we error fast on non-theme files
  const parsed = parseThemeJSON(content);
  if (!parsed) throw new Error('Theme file is not valid JSON');

  const filenameBase =
    first.label?.trim() ||
    parsed.name?.trim() ||
    `${namespace}.${name}`;
  const filename = filenameBase.endsWith('.json') ? filenameBase : `${filenameBase}.json`;

  return { filename, content };
}

