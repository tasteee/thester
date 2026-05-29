export interface PreviewSample {
  label: string;
  language: string;
  code: string;
}

export const PREVIEW_SAMPLES: PreviewSample[] = [
  {
    label: 'TypeScript',
    language: 'typescript',
    code: `import { useState, useEffect, useCallback } from 'react';

interface UserConfig {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
}

type EventHandler<T = void> = (event: MouseEvent) => T;

const DEFAULT_CONFIG: UserConfig = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  tabSize: 2,
};

// Fetch user data with generics and error handling
async function fetchUserData<T extends object>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(\`HTTP error — status: \${response.status}\`);
  }

  return response.json() as Promise<T>;
}

// Custom hook with generic type constraint
export function useSettings<T extends Partial<UserConfig>>(initial?: T) {
  const [config, setConfig] = useState<UserConfig>({
    ...DEFAULT_CONFIG,
    ...initial,
  });

  const updateSetting = useCallback(
    <K extends keyof UserConfig>(key: K, value: UserConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  useEffect(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
    return () => {
      localStorage.setItem('settings', JSON.stringify(config));
    };
  }, [config]);

  return { config, updateSetting } as const;
}

// Enum and class example
enum LogLevel {
  Debug = 'DEBUG',
  Info = 'INFO',
  Warn = 'WARN',
  Error = 'ERROR',
}

class Logger {
  private readonly name: string;
  private level: LogLevel;

  constructor(name: string, level = LogLevel.Info) {
    this.name = name;
    this.level = level;
  }

  log(message: string, level = LogLevel.Info): void {
    const timestamp = new Date().toISOString();
    console.log(\`[\${timestamp}] [\${level}] [\${this.name}] \${message}\`);
  }
}
`,
  },
  {
    label: 'JavaScript',
    language: 'javascript',
    code: `// Modern JavaScript — async, classes, destructuring
const API_BASE = 'https://api.example.com/v2';

/**
 * Exponential backoff retry with jitter
 * @param {() => Promise<any>} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 */
async function withRetry(fn, maxRetries = 3) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = Math.min(1000 * 2 ** attempt + Math.random() * 100, 10000);
      console.warn(\`Attempt \${attempt + 1} failed, retrying in \${delay}ms...\`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

class EventEmitter {
  #listeners = new Map();

  on(event, listener) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(listener);
    return () => this.off(event, listener);
  }

  off(event, listener) {
    this.#listeners.get(event)?.delete(listener);
  }

  emit(event, ...args) {
    this.#listeners.get(event)?.forEach((fn) => fn(...args));
  }
}

// Array destructuring, spread, and optional chaining
const processItems = (items = []) => {
  const [first, second, ...rest] = items;
  return {
    head: first ?? null,
    tail: rest.length > 0 ? rest : null,
    total: items?.length ?? 0,
  };
};

// Tagged template literal
const highlight = (strings, ...values) =>
  strings.reduce((acc, str, i) => \`\${acc}\${str}\${values[i] ?? ''}\`, '');

const user = { name: 'Ava', role: 'admin' };
const message = highlight\`Hello \${user.name}, you have \${user.role} access.\`;
console.log(message);
`,
  },
  {
    label: 'Python',
    language: 'python',
    code: `"""
Async web scraper with type hints and dataclasses.
Demonstrates modern Python 3.12+ features.
"""

from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import AsyncGenerator, Optional
from enum import StrEnum

import aiohttp


class Status(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"


@dataclass(frozen=True, slots=True)
class ScrapeResult:
    url: str
    status_code: int
    content: str
    fetched_at: datetime = field(default_factory=datetime.utcnow)
    error: Optional[str] = None

    @property
    def is_success(self) -> bool:
        return 200 <= self.status_code < 300


class AsyncScraper:
    """Concurrent web scraper with rate limiting."""

    def __init__(self, rate_limit: int = 10, timeout: float = 30.0) -> None:
        self._semaphore = asyncio.Semaphore(rate_limit)
        self._timeout = aiohttp.ClientTimeout(total=timeout)
        self._session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self) -> "AsyncScraper":
        self._session = aiohttp.ClientSession(timeout=self._timeout)
        return self

    async def __aexit__(self, *_) -> None:
        await self._session.close()

    async def fetch(self, url: str) -> ScrapeResult:
        async with self._semaphore:
            try:
                async with self._session.get(url) as resp:
                    content = await resp.text()
                    return ScrapeResult(url, resp.status, content)
            except Exception as exc:
                return ScrapeResult(url, 0, "", error=str(exc))

    async def fetch_all(self, urls: list[str]) -> AsyncGenerator[ScrapeResult, None]:
        tasks = [asyncio.create_task(self.fetch(url)) for url in urls]
        for coro in asyncio.as_completed(tasks):
            yield await coro


async def main() -> None:
    urls = [
        "https://httpbin.org/get",
        "https://httpbin.org/headers",
        "https://httpbin.org/ip",
    ]

    async with AsyncScraper(rate_limit=5) as scraper:
        async for result in scraper.fetch_all(urls):
            status = "✓" if result.is_success else "✗"
            print(f"{status} {result.url} — {result.status_code}")


if __name__ == "__main__":
    asyncio.run(main())
`,
  },
  {
    label: 'Rust',
    language: 'rust',
    code: `//! Async HTTP client with exponential backoff and structured error handling.

use std::time::Duration;

use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use thiserror::Error;
use tokio::time::sleep;

#[derive(Debug, Error)]
pub enum FetchError {
    #[error("HTTP error {status}: {message}")]
    Http { status: u16, message: String },
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),
    #[error("Max retries ({0}) exceeded")]
    Exhausted(u32),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub base_url: String,
    pub max_retries: u32,
    pub timeout_secs: u64,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            base_url: "https://api.example.com".into(),
            max_retries: 3,
            timeout_secs: 30,
        }
    }
}

pub struct ApiClient {
    inner: Client,
    config: Config,
}

impl ApiClient {
    pub fn new(config: Config) -> Result<Self, reqwest::Error> {
        let inner = Client::builder()
            .timeout(Duration::from_secs(config.timeout_secs))
            .user_agent("thester/1.0")
            .build()?;
        Ok(Self { inner, config })
    }

    pub async fn get<T>(&self, path: &str) -> Result<T, FetchError>
    where
        T: for<'de> Deserialize<'de>,
    {
        let url = format!("{}{}", self.config.base_url, path);
        let mut attempt = 0u32;

        loop {
            let response = self.inner.get(&url).send().await?;

            match response.status() {
                StatusCode::OK => {
                    return Ok(response.json::<T>().await?);
                }
                status if status.is_server_error() && attempt < self.config.max_retries => {
                    let delay = Duration::from_millis(100 * 2u64.pow(attempt));
                    eprintln!("Server error {status}, retrying in {delay:?}...");
                    sleep(delay).await;
                    attempt += 1;
                }
                status => {
                    let message = response.text().await.unwrap_or_default();
                    return Err(FetchError::Http {
                        status: status.as_u16(),
                        message,
                    });
                }
            }
        }
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = ApiClient::new(Config::default())?;
    let body: serde_json::Value = client.get("/data").await?;
    println!("{}", serde_json::to_string_pretty(&body)?);
    Ok(())
}
`,
  },
  {
    label: 'Go',
    language: 'go',
    code: `// Package cache provides a generic, thread-safe in-memory LRU cache.
package cache

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"sync"
	"time"
)

// ErrNotFound is returned when the key is missing from the cache.
var ErrNotFound = errors.New("cache: key not found")

// Entry holds a cached value and its expiry time.
type Entry[V any] struct {
	Value     V
	ExpiresAt time.Time
}

func (e Entry[V]) Expired() bool {
	return !e.ExpiresAt.IsZero() && time.Now().After(e.ExpiresAt)
}

// Cache is a generic, thread-safe key-value store with optional TTL.
type Cache[K comparable, V any] struct {
	mu      sync.RWMutex
	entries map[K]Entry[V]
	ttl     time.Duration
	log     *slog.Logger
}

// New creates a Cache with the given default TTL (0 means no expiry).
func New[K comparable, V any](ttl time.Duration) *Cache[K, V] {
	return &Cache[K, V]{
		entries: make(map[K]Entry[V]),
		ttl:     ttl,
		log:     slog.Default(),
	}
}

// Set stores a value under the given key.
func (c *Cache[K, V]) Set(key K, value V) {
	c.mu.Lock()
	defer c.mu.Unlock()

	var expiresAt time.Time
	if c.ttl > 0 {
		expiresAt = time.Now().Add(c.ttl)
	}
	c.entries[key] = Entry[V]{Value: value, ExpiresAt: expiresAt}
	c.log.Debug("cache set", slog.Any("key", key))
}

// Get retrieves the value for key, or ErrNotFound if absent or expired.
func (c *Cache[K, V]) Get(key K) (V, error) {
	c.mu.RLock()
	entry, ok := c.entries[key]
	c.mu.RUnlock()

	var zero V
	if !ok || entry.Expired() {
		return zero, fmt.Errorf("%w: %v", ErrNotFound, key)
	}
	return entry.Value, nil
}

// GetOrFetch returns the cached value, or calls fetch to populate it.
func (c *Cache[K, V]) GetOrFetch(ctx context.Context, key K, fetch func(context.Context) (V, error)) (V, error) {
	if v, err := c.Get(key); err == nil {
		return v, nil
	}
	v, err := fetch(ctx)
	if err != nil {
		var zero V
		return zero, err
	}
	c.Set(key, v)
	return v, nil
}
`,
  },
  {
    label: 'CSS',
    language: 'css',
    code: `/* Premium design system — tokens and utilities */

@layer base, components, utilities;

@layer base {
  :root {
    --color-bg: hsl(240 10% 4%);
    --color-surface: hsl(240 8% 9%);
    --color-border: hsl(240 8% 18%);
    --color-accent: hsl(262 83% 68%);
    --color-accent-glow: hsl(262 83% 68% / 0.3);
    --color-text: hsl(240 15% 90%);
    --color-text-muted: hsl(240 10% 55%);

    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;

    --shadow-sm: 0 1px 3px hsl(0 0% 0% / 0.3);
    --shadow-md: 0 4px 16px hsl(0 0% 0% / 0.4);
    --shadow-glow: 0 0 24px var(--color-accent-glow);

    --font-sans: 'Inter', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html { color-scheme: dark; }

  body {
    font-family: var(--font-sans);
    background: var(--color-bg);
    color: var(--color-text);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
}

@layer components {
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    box-shadow: var(--shadow-md);
    transition: transform 150ms ease, box-shadow 150ms ease;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md), var(--shadow-glow);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 150ms ease;
  }

  .btn-primary {
    background: linear-gradient(135deg, var(--color-accent), hsl(262 83% 55%));
    color: white;
    box-shadow: 0 2px 8px var(--color-accent-glow);
  }

  .btn-primary:hover {
    filter: brightness(1.15);
    box-shadow: 0 4px 16px var(--color-accent-glow);
  }
}

@layer utilities {
  .flex { display: flex; }
  .grid { display: grid; }
  .hidden { display: none; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
}
`,
  },
  {
    label: 'HTML',
    language: 'html',
    code: `<!DOCTYPE html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="A premium VS Code theme testbed" />
    <title>Thester — Theme Testbed</title>
    <link rel="stylesheet" href="/styles/main.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <script type="module" src="/src/main.ts" defer></script>
  </head>
  <body>
    <header class="site-header" role="banner">
      <nav class="nav" aria-label="Main navigation">
        <a href="/" class="logo" aria-label="Thester home">
          <svg width="24" height="24" aria-hidden="true"><!-- icon --></svg>
          <span>Thester</span>
        </a>
        <ul class="nav-links" role="list">
          <li><a href="/themes">Browse Themes</a></li>
          <li><a href="/editor">Editor</a></li>
          <li><a href="/docs">Docs</a></li>
        </ul>
        <button class="btn btn-primary" type="button" id="open-editor">
          Launch Editor
        </button>
      </nav>
    </header>

    <main id="main-content" tabindex="-1">
      <section class="hero" aria-labelledby="hero-heading">
        <h1 id="hero-heading" class="hero-title">
          Build <em>perfect</em> VS Code themes
        </h1>
        <p class="hero-subtitle">
          A live testbed for crafting, previewing, and exporting VS Code color themes.
          Edit JSON on the left, see results instantly on the right.
        </p>
        <div class="hero-actions">
          <a href="/editor" class="btn btn-primary">Open Editor</a>
          <a href="/themes" class="btn btn-outline">Browse Themes</a>
        </div>
      </section>

      <section class="features" aria-label="Features">
        <article class="feature-card">
          <h2>Multi-tab editing</h2>
          <p>Work on several themes simultaneously with intuitive tab management.</p>
        </article>
        <article class="feature-card">
          <h2>Live preview</h2>
          <p>See your changes applied instantly across a dozen programming languages.</p>
        </article>
        <article class="feature-card">
          <h2>Import from registry</h2>
          <p>Clone any popular theme as a starting point for your creation.</p>
        </article>
      </section>
    </main>

    <footer class="site-footer" role="contentinfo">
      <p>&copy; 2024 Thester. Open source.</p>
    </footer>
  </body>
</html>
`,
  },
  {
    label: 'JSON',
    language: 'json',
    code: `{
  "$schema": "vscode://schemas/color-theme",
  "name": "My Custom Theme",
  "type": "dark",
  "colors": {
    "editor.background": "#1e1e2e",
    "editor.foreground": "#cdd6f4",
    "editor.lineHighlightBackground": "#313244",
    "editor.selectionBackground": "#45475a80",
    "editorCursor.foreground": "#f5c2e7",
    "editorLineNumber.foreground": "#6c7086",
    "editorLineNumber.activeForeground": "#cdd6f4",
    "editorBracketHighlight.foreground1": "#f38ba8",
    "editorBracketHighlight.foreground2": "#fab387",
    "editorBracketHighlight.foreground3": "#f9e2af",
    "activityBar.background": "#1e1e2e",
    "activityBar.foreground": "#cdd6f4",
    "sideBar.background": "#181825",
    "sideBar.foreground": "#cdd6f4",
    "titleBar.activeBackground": "#1e1e2e",
    "titleBar.activeForeground": "#cdd6f4",
    "statusBar.background": "#1e1e2e",
    "statusBar.foreground": "#cdd6f4",
    "tab.activeBackground": "#1e1e2e",
    "tab.inactiveBackground": "#181825"
  },
  "tokenColors": [
    {
      "name": "Comments",
      "scope": ["comment", "punctuation.definition.comment"],
      "settings": {
        "foreground": "#6c7086",
        "fontStyle": "italic"
      }
    },
    {
      "name": "Keywords",
      "scope": ["keyword", "storage.type", "storage.modifier"],
      "settings": {
        "foreground": "#cba6f7"
      }
    },
    {
      "name": "Strings",
      "scope": ["string", "string.quoted"],
      "settings": {
        "foreground": "#a6e3a1"
      }
    },
    {
      "name": "Numbers",
      "scope": ["constant.numeric", "constant.language"],
      "settings": {
        "foreground": "#fab387"
      }
    },
    {
      "name": "Functions",
      "scope": ["entity.name.function", "support.function"],
      "settings": {
        "foreground": "#89b4fa"
      }
    }
  ]
}
`,
  },
  {
    label: 'SQL',
    language: 'sql',
    code: `-- Analytics schema with window functions and CTEs

CREATE SCHEMA IF NOT EXISTS analytics;

CREATE TABLE analytics.events (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type  VARCHAR(64) NOT NULL,
    properties  JSONB       DEFAULT '{}',
    occurred_at TIMESTAMPTZ DEFAULT now(),
    session_id  UUID,
    ip_address  INET,
    user_agent  TEXT
);

CREATE INDEX events_user_id_idx ON analytics.events (user_id, occurred_at DESC);
CREATE INDEX events_type_idx    ON analytics.events (event_type, occurred_at DESC);
CREATE INDEX events_props_idx   ON analytics.events USING GIN (properties);

-- CTE with window functions for user retention
WITH cohorts AS (
    SELECT
        user_id,
        DATE_TRUNC('week', MIN(occurred_at)) AS cohort_week,
        COUNT(*)                              AS total_events
    FROM  analytics.events
    WHERE event_type = 'session_start'
    GROUP BY user_id
),
retention AS (
    SELECT
        c.cohort_week,
        DATE_TRUNC('week', e.occurred_at)                  AS activity_week,
        COUNT(DISTINCT e.user_id)                           AS active_users,
        ROUND(
            COUNT(DISTINCT e.user_id)::NUMERIC /
            NULLIF(COUNT(DISTINCT c.user_id), 0) * 100, 2
        )                                                   AS retention_pct,
        ROW_NUMBER() OVER (
            PARTITION BY c.cohort_week
            ORDER BY DATE_TRUNC('week', e.occurred_at)
        )                                                   AS week_number
    FROM  analytics.events e
    JOIN  cohorts c USING (user_id)
    WHERE e.event_type = 'session_start'
    GROUP BY c.cohort_week, DATE_TRUNC('week', e.occurred_at)
)
SELECT cohort_week, week_number, active_users, retention_pct
FROM   retention
WHERE  week_number <= 12
ORDER  BY cohort_week, week_number;
`,
  },
  {
    label: 'Markdown',
    language: 'markdown',
    code: `# Thester — VS Code Theme Testbed

> A **gorgeous** live testbed for crafting and previewing VS Code color themes.

## Features

- 🎨 **Multi-tab editing** — work on several themes at once
- ⚡ **Live preview** — see changes applied instantly across a dozen languages
- 📦 **Import from registry** — clone any popular theme as a starting point
- 💾 **Export** — download your theme JSON with one click

## Getting Started

### 1. Open a Theme

Choose from the curated library or upload your own \`.json\` file:

\`\`\`bash
# Or start from scratch — a blank template is ready to go
thester new "My Awesome Theme"
\`\`\`

### 2. Edit the JSON

The left editor is a full Monaco JSON editor with schema validation:

\`\`\`json
{
  "name": "My Theme",
  "type": "dark",
  "colors": {
    "editor.background": "#1e1e2e"
  }
}
\`\`\`

### 3. Preview Instantly

Switch the right pane to any supported language:

| Language    | Tokens highlighted |
|-------------|-------------------|
| TypeScript  | ✅                |
| Python      | ✅                |
| Rust        | ✅                |
| SQL         | ✅                |

### 4. Export

Click **Export JSON** to download your theme. Drop it into any VS Code
extension and you're done.

---

## Contributing

Pull requests are welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md).

_Made with ❤️ and lots of dark mode._
`,
  },
  {
    label: 'Java',
    language: 'java',
    code: `package dev.thester.cache;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Function;
import java.util.logging.Logger;

/**
 * Thread-safe, generic LRU cache with TTL support.
 *
 * @param <K> key type
 * @param <V> value type
 */
public final class LruCache<K, V> {

    private static final Logger LOG = Logger.getLogger(LruCache.class.getName());

    private final int maxSize;
    private final Duration ttl;
    private final LinkedHashMap<K, CacheEntry<V>> store;
    private final ReadWriteLock lock = new ReentrantReadWriteLock();
    private final AtomicLong hits = new AtomicLong();
    private final AtomicLong misses = new AtomicLong();

    public LruCache(int maxSize, Duration ttl) {
        if (maxSize <= 0) throw new IllegalArgumentException("maxSize must be positive");
        this.maxSize = maxSize;
        this.ttl = Objects.requireNonNull(ttl);
        this.store = new LinkedHashMap<>(maxSize, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<K, CacheEntry<V>> eldest) {
                return size() > maxSize;
            }
        };
    }

    public Optional<V> get(K key) {
        lock.readLock().lock();
        try {
            var entry = store.get(key);
            if (entry == null || entry.isExpired()) {
                misses.incrementAndGet();
                return Optional.empty();
            }
            hits.incrementAndGet();
            return Optional.of(entry.value());
        } finally {
            lock.readLock().unlock();
        }
    }

    public V computeIfAbsent(K key, Function<K, V> loader) {
        return get(key).orElseGet(() -> {
            V value = loader.apply(key);
            put(key, value);
            return value;
        });
    }

    public void put(K key, V value) {
        lock.writeLock().lock();
        try {
            store.put(key, new CacheEntry<>(value, Instant.now().plus(ttl)));
        } finally {
            lock.writeLock().unlock();
        }
    }

    public CacheStats stats() {
        return new CacheStats(hits.get(), misses.get(), store.size());
    }

    private record CacheEntry<V>(V value, Instant expiresAt) {
        boolean isExpired() { return Instant.now().isAfter(expiresAt); }
    }

    public record CacheStats(long hits, long misses, int size) {
        public double hitRate() {
            long total = hits + misses;
            return total == 0 ? 0.0 : (double) hits / total;
        }
    }
}
`,
  },
  {
    label: 'C++',
    language: 'cpp',
    code: `// Thread-safe event dispatcher using std::variant and templates.
#include <algorithm>
#include <functional>
#include <mutex>
#include <print>
#include <string>
#include <unordered_map>
#include <variant>
#include <vector>

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------
struct ClickEvent   { int x, y; std::string target; };
struct ResizeEvent  { unsigned width, height; };
struct KeyEvent     { int keyCode; bool shift, ctrl, alt; };

using AnyEvent = std::variant<ClickEvent, ResizeEvent, KeyEvent>;

// ---------------------------------------------------------------------------
// EventBus
// ---------------------------------------------------------------------------
template <typename... Events>
class EventBus {
public:
    using Handler = std::function<void(const std::variant<Events...>&)>;
    using Token   = std::size_t;

    Token subscribe(Handler handler) {
        std::scoped_lock lock{mutex_};
        const Token token = next_token_++;
        handlers_.emplace_back(token, std::move(handler));
        return token;
    }

    void unsubscribe(Token token) {
        std::scoped_lock lock{mutex_};
        std::erase_if(handlers_, [token](const auto& pair) {
            return pair.first == token;
        });
    }

    template <typename E>
        requires (std::is_same_v<E, Events> || ...)
    void emit(E&& event) {
        std::scoped_lock lock{mutex_};
        std::variant<Events...> wrapped{std::forward<E>(event)};
        for (auto& [_, handler] : handlers_) {
            handler(wrapped);
        }
    }

private:
    std::vector<std::pair<Token, Handler>> handlers_;
    std::mutex mutex_;
    Token next_token_{1};
};

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------
int main() {
    EventBus<ClickEvent, ResizeEvent, KeyEvent> bus;

    const auto tok = bus.subscribe([](const AnyEvent& ev) {
        std::visit([](const auto& e) {
            using T = std::decay_t<decltype(e)>;
            if constexpr (std::is_same_v<T, ClickEvent>) {
                std::println("Click on '{}' at ({}, {})", e.target, e.x, e.y);
            } else if constexpr (std::is_same_v<T, ResizeEvent>) {
                std::println("Resize to {}×{}", e.width, e.height);
            } else if constexpr (std::is_same_v<T, KeyEvent>) {
                std::println("Key code {} (shift={}, ctrl={})", e.keyCode, e.shift, e.ctrl);
            }
        }, ev);
    });

    bus.emit(ClickEvent{120, 240, "submit-button"});
    bus.emit(ResizeEvent{1920, 1080});
    bus.emit(KeyEvent{13, false, false, false});

    bus.unsubscribe(tok);
    return 0;
}
`,
  },
];
