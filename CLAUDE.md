# DiffLab

Multi-format diff comparison tool built with Next.js 16, React 19, TypeScript, Tailwind CSS v4.

## Stack

- **Runtime**: Bun
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (CSS-first config via `@theme inline`)
- **Fonts**: Geist Sans + Geist Mono (via `geist` package)
- **Editor**: Textarea with overlay highlighting (Phase 0), CodeMirror 6 planned (Phase 2)
- **Local DB**: Dexie.js planned (Phase 4)

## Commands

- `bun dev` — dev server
- `bun run build` — production build
- `bun run lint` — ESLint

## Project Structure

```
src/
  app/           — Next.js App Router pages + metadata
  components/    — React components (layout, editor, diff, ui)
  lib/           — Core logic (diff engine, highlighting, format detection)
  hooks/         — Custom React hooks (useTheme)
  types/         — Shared TypeScript types
  data/          — Static data (samples)
```

## Conventions

- All components in `src/components/`, grouped by domain
- Diff engine is pure functions in `src/lib/diff/` with no React dependencies
- Theme uses CSS custom properties, toggled via `data-theme` attribute on html
- State managed via React state in page component; Zustand only if needed
- HTML rendering sanitized via DOMPurify before injection
- No console.log in committed code
- Session state persisted via sessionStorage (tab-scoped, ephemeral)
