# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js with Turbopack)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Run ESLint
```

## Architecture

This is a **Next.js 16 App Router** project using TypeScript and Tailwind CSS v4.

- **Routing:** File-based App Router under `src/app/`. Use `page.tsx` for route pages, `layout.tsx` for shared layouts.
- **Path alias:** `@/*` maps to `src/*` (e.g., `import Foo from '@/components/Foo'`).
- **Styling:** Tailwind CSS v4 via PostCSS — no `tailwind.config.js` needed; configuration is done via CSS.
- **Fonts:** Geist (sans + mono) loaded via `next/font/google` in `src/app/layout.tsx` and applied as CSS variables (`--font-geist-sans`, `--font-geist-mono`).

## Key Tech Versions

- Next.js 16.1.6, React 19, TypeScript 5 (strict mode), Tailwind CSS 4, ESLint 9 (flat config)
