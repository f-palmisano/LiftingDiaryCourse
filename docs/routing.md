# Routing Coding Standards

## Rule: All App Routes Live Under `/dashboard`

**All application pages must be nested under the `/dashboard` route segment. Do not create top-level pages for app functionality.**

- **Do not** create pages at `/workouts`, `/profile`, `/settings`, or any other top-level path.
- **Do** place all authenticated app pages under `src/app/dashboard/`.
- The root page (`src/app/page.tsx`) is a landing/marketing page only — it must redirect or link to `/dashboard` for authenticated users.

### Current Route Structure

```
/                          → src/app/page.tsx           (public landing page)
/dashboard                 → src/app/dashboard/page.tsx  (protected)
/dashboard/workout/new     → src/app/dashboard/workout/new/page.tsx (protected)
/dashboard/workout/[id]    → src/app/dashboard/workout/[workoutId]/page.tsx (protected)
```

---

## Rule: Route Protection via Middleware Only

**All `/dashboard` routes are protected exclusively through Next.js middleware (`src/middleware.ts`). Do not add route-level auth guards as a replacement.**

- **Do not** redirect unauthenticated users inside `page.tsx` as the primary protection mechanism.
- **Do not** wrap pages in a custom auth HOC or guard component for route protection.
- **Do** rely on `clerkMiddleware()` in `src/middleware.ts` to block unauthenticated access to `/dashboard` and all sub-routes.
- The middleware is the single gate — it runs before any page code executes.

```ts
// src/middleware.ts — the only place route protection is configured
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

> **Note:** If the middleware does not yet use `createRouteMatcher` to explicitly protect `/dashboard(.*)`, update it to do so. The current `clerkMiddleware()` with no arguments initialises Clerk but does not auto-redirect unauthenticated users — `auth.protect()` must be called explicitly for protected routes.

---

## Rule: API Routes Follow the Same Path Convention

**API routes that serve dashboard data must live under `src/app/api/` and must enforce auth independently** (middleware does not replace server-side `auth()` checks in API handlers).

- **Do** call `auth()` from `@clerk/nextjs/server` at the top of every API route handler and return `401` if `userId` is null.
- See `docs/auth.md` for the full server-side auth pattern.

---

## What NOT to Do

```ts
// WRONG — app page outside /dashboard
// src/app/workouts/page.tsx ❌

// WRONG — protecting a route inside the page component instead of middleware
export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in') // ❌ not the right place for this
}

// WRONG — a custom auth wrapper component as the protection mechanism
export default function ProtectedLayout({ children }) {
  const { isSignedIn } = useAuth()
  if (!isSignedIn) return <Redirect to="/sign-in" /> // ❌
}
```

---

## Summary Cheatsheet

| Concern | Solution |
|---|---|
| Where app pages live | `src/app/dashboard/**` |
| Route protection mechanism | `clerkMiddleware()` + `auth.protect()` in `src/middleware.ts` |
| Adding a new protected page | Create it under `src/app/dashboard/` — middleware protects it automatically |
| API route auth | `auth()` from `@clerk/nextjs/server` + explicit `userId` null check |
| Landing / public pages | `src/app/page.tsx` only, no app functionality |
