# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## ⚠️ STOP — READ /docs BEFORE WRITING ANY CODE ⚠️

> **THIS IS A HARD REQUIREMENT. DO NOT SKIP IT.**
>
> Before generating **any** code — even a single line — you **MUST** read the relevant documentation file(s) in the `/docs` directory. This rule applies to every task, every time, without exception.

The `/docs` directory contains the authoritative coding standards for this project. Code written without consulting these docs will violate project conventions and must be rewritten.

**Non-negotiable workflow for every code task:**
1. **STOP** — do not write code yet.
2. Identify which area(s) the task touches (UI, API, database, etc.).
3. Find and **fully read** the matching docs file(s) from the table below.
4. Only then generate code that complies with those standards.

| Topic | Docs File | When to read |
|---|---|---|
| UI components, styling, date formatting | `docs/ui.md` | Any time you touch a component, page, or style |
| Data fetching, database queries, auth scoping | `docs/data-fetching.md` | Any time you fetch data or write a database query |
| Data mutations, server actions, validation | `docs/data-mutations.md` | Any time you write a server action or mutate data |
| Authentication | `docs/auth.md` | Any time you touch auth, middleware, or user identity |
| Server Components, params, searchParams | `docs/server-components.md` | Any time you write a page or layout Server Component |
| Routing, route protection, URL structure | `docs/routing.md` | Any time you add a new page, route, or touch middleware |

**If a relevant docs file exists for the area you are working in, reading it is mandatory before writing a single line of code.**

---

## Commands

```bash
npm run dev      # Start development server (Next.js with Turbopack)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Run ESLint

# Database (Drizzle ORM)
npx drizzle-kit generate   # Generate SQL migrations from schema changes
npx drizzle-kit migrate    # Apply migrations to the database
npx drizzle-kit studio     # Open Drizzle Studio (database browser)
```

- /docs/ui.md
- /docs/data-fetching.md
- /docs/data-mutations.md
- /docs/auth.md
- /docs/server-components.md
- /docs/routing.md

## Architecture

This is a **Lifting Diary** workout tracking app built with Next.js 16 App Router.

### Stack

- **Framework:** Next.js 16 App Router, React 19, TypeScript 5 (strict mode)
- **Styling:** Tailwind CSS v4 via PostCSS — no `tailwind.config.js`; theme configured in `src/app/globals.css` using CSS variables (OKLch color space). Dark mode via `.dark` class.
- **Auth:** Clerk (`@clerk/nextjs`) — `src/middleware.ts` protects all routes except static assets. `ClerkProvider` wraps the root layout.
- **Database:** Drizzle ORM + Neon serverless PostgreSQL. Client at `src/db/index.ts`, schema at `src/db/schema.ts`, config at `drizzle.config.ts`.
- **UI primitives:** Base UI (`@base-ui/react`) for unstyled components, Lucide for icons, `cn()` utility from `src/lib/utils.ts` for class merging.
- **Path alias:** `@/*` → `src/*`

### Data Model

Workouts are per-user (Clerk `userId`) and follow this hierarchy:

```
workouts (userId, name, startedAt, completedAt)
  └── workout_exercises (workoutId, exerciseId, order)
        ├── exercises (name)
        └── sets (setNumber, reps, weightKg)
```

Cascade deletes: workout → workout_exercises → sets.

### API Routes

- **GET `/api/workouts?date=YYYY-MM-DD`** — Returns workouts with nested exercises and sets for the authenticated user on a given date. Requires Clerk auth; returns 401 if unauthenticated.

### Environment Variables

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=   # Neon serverless connection string (use pooled URL)
```
