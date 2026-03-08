# DiffLab

Compare JSON, YAML, TOML, and code files side by side. Runs entirely in the browser — no data leaves your machine.

**[difflab.dev](https://difflab.dev)** (or wherever you deploy it)

## What it does

- **Structured diff** for JSON, YAML, TOML — compares parsed keys and values, not just text
- **Text diff** for everything else — JS, TS, Kotlin, Swift, HTML, CSS, Markdown, plain text
- **Side-by-side and unified views** with GitHub-style collapsed unchanged regions
- **Format detection** from file extension or content heuristics
- **Local comparison history** stored in IndexedDB via Dexie.js — search, tag, export/import
- **CodeMirror 6** editors with syntax highlighting, folding, bracket matching, search
- Format, minify, download per panel
- Drag & drop, file upload, keyboard shortcuts
- Dark / light / system theme
- Fully client-side, no server, no cookies

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Runtime | Bun |
| Styling | Tailwind CSS v4 |
| Editor | CodeMirror 6 |
| Diff | jsdiff + custom structured engine |
| Local DB | Dexie.js (IndexedDB) |
| Analytics | Vercel Analytics |

## Development

```bash
bun install
bun dev
```

Build:

```bash
bun run build
```

Lint:

```bash
bun run lint
```

## Project structure

```
src/
  app/           Pages + metadata (App Router)
  components/    React components (layout, editor, diff, ui)
  lib/           Core logic (diff engine, formatter, format detection, db)
  hooks/         Custom hooks (useTheme, useSettings)
  types/         Shared TypeScript types
  data/          Static sample data
```

## License

MIT
