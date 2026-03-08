# DiffLab - Migration & Feature Plan

> Migrating from single-file HTML to a Next.js app with multi-format comparison, local history, and polished UX.

---

## Decisions (Resolved)

| Question           | Decision                                  | Reasoning                                                                                    |
| ------------------ | ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Name**           | **DiffLab**                               | User preference. Existing "DiffLab" uses (AI co, image tool, research lab) don't overlap.    |
| **Deployment**     | **Vercel** (Cloudflare Pages as fallback) | App is mostly client-side. Vercel is native for Next.js. CF Pages works via static export.   |
| **Analytics**      | **Vercel Analytics**                      | Free on hobby plan, zero config on Vercel, ~1KB script, no cookies, GDPR-compliant.          |
| **Editor**         | **CodeMirror 6**                          | Free (MIT), modular (~150KB base), performant. Monaco is ~2MB — overkill.                    |
| **Local DB**       | **Dexie.js**                              | ~29KB gzip. Negligible vs CodeMirror + Next.js. Query-friendly API, good DX. Worth trying.   |
| **State mgmt**     | **Zustand** (if needed)                   | Only if prop drilling or cross-component state becomes a problem. Not preemptively.           |
| **Storage limit**  | **Browser-managed** + soft warning at 80% | No arbitrary cap. Warn user when approaching quota via `navigator.storage.estimate()`.        |

---

## Phase 0: Project Setup & Migration

- [x] Initialize Next.js project (App Router, TypeScript strict, Tailwind CSS v4, Bun)
- [x] Project structure: `src/app`, `src/components`, `src/lib`, `src/hooks`, `src/stores`, `src/types`
- [x] Configure ESLint, Prettier
- [x] Set up path aliases (`@/`)
- [x] Port existing JSON diff logic into `src/lib/diff/`
- [x] Port existing UI into React components
- [x] Remove Tailwind CDN, use proper Tailwind install
- [x] Verify feature parity with current single-file app before moving forward

## Phase 1: Multi-Format Comparison Engine

### Format Support
- [x] JSON (existing — port & improve)
- [x] YAML (`yaml` package)
- [x] TOML (`smol-toml`)
- [x] Plain text (line-by-line diff)
- [x] Markdown (line-by-line diff, treat as text)
- [x] Code files: JS, TS, Kotlin, Swift, etc. (line-by-line diff, treat as text)

### Diff Strategies
- [x] **Structured diff** for JSON, YAML, TOML — parse into objects, compare keys/values (current behavior)
- [x] **Text diff** for everything else — line-by-line with `diff` (jsdiff) library
- [ ] Unified diff view + side-by-side diff view toggle
- [x] Diff summary stats per format

### Auto-Detection
- [x] Detect format from file extension on drop/upload
- [x] Detect format from content heuristics (leading `{`/`[` = JSON, `---` = YAML, `[section]` = TOML, etc.)
- [x] Format selector dropdown (manual override) per panel
- [x] **Type mismatch error**: if left panel is JSON and right panel is YAML, show clear error — do not compare
- [x] Allow "Text mode" override to force text diff regardless of format

### Comparison Options
- [x] Ignore whitespace toggle (for text/code diffs)
- [ ] Ignore case toggle
- [ ] Ignore comments toggle (for code files — strip `//`, `/* */`, `#` before diff)

## Phase 2: Editor & Syntax Highlighting

### CodeMirror 6 Integration
- [x] Replace `<textarea>` with CodeMirror 6 editors
- [x] Language extensions: JSON, YAML, TOML, Markdown, JavaScript, TypeScript, Kotlin, Swift, HTML, CSS
- [x] Theme that matches app's dark/light mode (custom CodeMirror theme)
- [x] Line numbers
- [x] Code folding
- [x] Bracket matching
- [x] Search within editor (Ctrl+F)

### Formatting
- [x] Format button per panel (pretty-print for structured formats, no-op for text)
- [x] JSON: `JSON.stringify` with indent
- [x] YAML: `yaml.stringify` with indent
- [x] TOML: `smol-toml.stringify`
- [x] **Format on paste** setting (toggle in settings/toolbar) — auto-format when content is pasted
- [ ] Minify/compact button for structured formats
- [ ] Preserve cursor position after format

## Phase 3: Theme System (Light + Dark)

- [x] CSS custom properties for both themes (extend current `--bg-base`, `--text`, etc.)
- [x] Light theme color palette
- [x] Dark theme (current, refined)
- [x] System preference detection (`prefers-color-scheme`)
- [x] Manual toggle (dark / light / system) in navbar
- [x] Persist preference in localStorage
- [x] CodeMirror theme sync with app theme
- [x] Smooth transition between themes

## Phase 4: Local Comparison History (IndexedDB via Dexie.js)

### Storage Layer
- [x] Dexie.js setup with versioned schema
- [x] Schema: `comparisons` table with fields:
  - `id` (auto-generated UUID)
  - `title` (auto-generated or user-editable)
  - `leftContent`, `rightContent`
  - `leftFormat`, `rightFormat`
  - `leftFileName`, `rightFileName`
  - `createdAt`, `updatedAt`
  - `tags` (optional, for organization)
- [x] Storage quota monitoring via `navigator.storage.estimate()` — soft warning at 80%

### History UI
- [x] History panel/page (`/history`)
- [x] List view: title, formats, date, preview snippet
- [x] Search/filter history by title, format, date range, tags
- [x] Sort by date (newest/oldest)
- [x] Load a saved comparison back into the editor
- [x] Edit comparison title/tags
- [x] Delete individual comparisons
- [x] Bulk delete / clear all (with confirmation)
- [x] Export history as JSON backup
- [x] Import history from JSON backup

### Auto-Save
- [ ] Option to auto-save comparisons (toggle in settings)
- [x] Save button to manually save current comparison
- [x] Indicator showing "saved" / "unsaved" state

## Phase 5: SEO, Metadata & Analytics

### Metadata
- [x] Dynamic `<title>` and `<meta description>` per page
- [x] Open Graph tags (og:title, og:description, og:image, og:url, og:type)
- [x] Twitter Card meta tags
- [x] Canonical URLs
- [x] Structured data (JSON-LD) for the tool

### Assets
- [x] Favicon (SVG icon)
- [ ] OG image (1200x630 branded preview card)
- [ ] App icons for PWA manifest

### SEO
- [x] `robots.txt`
- [x] `sitemap.xml` (generated via Next.js)
- [x] Proper heading hierarchy (h1, h2, etc.)
- [x] Semantic HTML throughout

### Analytics (decide last — not a blocker)

| | Vercel Analytics | Firebase/GA4 | Clarity |
|---|---|---|---|
| Cost | Free (2.5K events/mo) | Free (unlimited) | Free (unlimited) |
| Script size | ~1KB | ~45KB | ~22KB |
| Cookies | No | Yes | Yes |
| GDPR consent | No | Yes | Yes |
| Setup | 1 line | Firebase project + SDK | Script tag |
| Dashboard | Simple, clean | Complex, mobile-focused | Heatmaps, recordings |
| Best for | Web tools | Mobile apps, funnels | UX research |

- [ ] Pick analytics provider (Vercel Analytics recommended, decide at launch)
- [ ] No tracking of content — only page views, referrers, basic usage

## Phase 6: Sample Data & Onboarding

- [x] "Try an example" button/dropdown in toolbar or empty state
- [x] Sample pairs for every supported format:
  - JSON: two API responses with added/removed/changed fields
  - YAML: two config files (e.g., Kubernetes manifests) with diffs
  - TOML: two Cargo.toml or pyproject.toml files with version bumps
  - Markdown: two README versions with section changes
  - JavaScript/TypeScript: two versions of a function with refactoring
  - Kotlin: two data class versions
  - Swift: two struct versions
  - Plain text: two paragraphs with word changes
- [x] Clicking a sample auto-loads both panels, sets format, and runs diff
- [x] Samples stored as static assets in `src/data/samples/` (not fetched from server)
- [x] Each sample has a short description shown in the dropdown
- [x] Empty state CTA: "Not sure how it works? Try an example" with a prominent button

## Phase 7: Polish & UX

- [x] Keyboard shortcuts panel (help modal showing all shortcuts)
  - [x] Ctrl+Shift+S swap (existing)
  - [x] Ctrl+Shift+F format both
  - [x] Ctrl+Shift+D toggle diff/keys view
  - [x] Ctrl+S save comparison to history
  - [x] ? toggle shortcuts modal
- [x] File upload button (not just drag & drop — some users prefer clicking)
- [x] File download button (formats structured data before download)
- [x] Inline filename editing (double-click to rename in editor header)
- [x] Ignore whitespace toggle for text diffs
- [ ] Responsive design audit — mobile, tablet, desktop
- [x] Loading states, empty states, error states for all views
- [x] Toast notification system (improve existing)
- [x] Drag & drop refinements (visual feedback, multi-file handling)
- [x] Copy diff results (existing — extend for all formats)
- [ ] Accessibility: ARIA labels, keyboard navigation, focus management, screen reader support
- [x] 404 page
- [x] Settings persistence (format on paste, ignore whitespace — persisted in localStorage)

---

## Phase 8: Final Polish

- [x] Side-by-side diff view toggle (unified + split with toggle buttons)
- [x] Ignore case toggle for text diffs
- [x] Minify/compact button for structured formats (JSON, YAML, TOML)
- [x] Accessibility: ARIA labels, roles, aria-selected, aria-pressed, aria-modal on all interactive elements
- [x] Responsive design: flex-wrap toolbars, modal margins, label truncation

## Deferred

- [ ] Analytics integration (Vercel Analytics — decide at launch)
- [ ] OG image (1200x630 branded preview card)
- [ ] Auto-save toggle
- [ ] Ignore comments toggle (strip `//`, `/* */`, `#` before diff)

## Extras (Nice-to-Have, Post-Launch)

- [ ] **PWA**: service worker, offline support, installable
- [ ] **Import from URL**: fetch content from a remote URL into a panel
- [ ] **Share via link**: encode small diffs in URL params or generate a temporary shareable hash (no server — URL encoding or free paste service)
- [ ] **Web Workers**: offload diff computation for large files to a worker thread
- [ ] **Error recovery**: auto-fix common JSON issues (trailing commas, single quotes, unquoted keys) with a "Try to fix" button
- [ ] **Diff navigation**: jump to next/previous change in diff view
- [ ] **Collapsible sections** in structured diff (collapse unchanged nested objects)
- [ ] **Character-level diff highlighting** within changed lines (word diff)
- [ ] **Export diff**: download diff as `.patch`, `.txt`, or `.png` (screenshot)
- [ ] **Duplicate detection** (from original TODO)
- [ ] **Multiple tabs**: concurrent comparisons in separate tabs within the app
- [ ] **Clipboard paste detection**: auto-detect format from clipboard content on paste
- [ ] **Print-friendly styles** for diff output

---

## Tech Stack (Final)

| Concern            | Choice                        |
| ------------------ | ----------------------------- |
| Framework          | Next.js 16 (App Router)       |
| Language           | TypeScript (strict)           |
| Runtime            | Bun                           |
| Styling            | Tailwind CSS v4               |
| Editor             | CodeMirror 6                  |
| Diff engine        | jsdiff + custom structured    |
| YAML parsing       | `yaml`                        |
| TOML parsing       | `smol-toml`                   |
| Local DB           | Dexie.js (~29KB gz)           |
| State management   | Zustand (only if needed)      |
| Analytics          | Vercel Analytics              |
| Deployment         | Vercel (CF Pages as fallback) |
