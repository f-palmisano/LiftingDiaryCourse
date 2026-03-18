# Auth Coding Standards

## Rule: Use Clerk for All Authentication

**This project uses [Clerk](https://clerk.com) exclusively for authentication. Do not implement custom auth, JWT handling, session management, or any other auth mechanism.**

- **Do not** use NextAuth, Auth.js, Lucia, or any other auth library.
- **Do not** manage sessions, cookies, or tokens manually.
- **Do not** create custom login/signup pages or forms — use Clerk's hosted UI or its pre-built components.
- **Do** use Clerk's SDK (`@clerk/nextjs`) for everything auth-related.

---

## Middleware

All routes are protected by Clerk middleware defined in `src/middleware.ts`. It uses `clerkMiddleware()` and runs on all non-static routes.

```ts
// src/middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

- **Do not** remove or bypass this middleware.
- **Do not** add route-level auth checks as a replacement for middleware — the middleware is the primary gate.

---

## ClerkProvider

`ClerkProvider` wraps the entire app in `src/app/layout.tsx`. This is required for Clerk to work on both the server and client.

- **Do not** remove `ClerkProvider` from the root layout.
- **Do not** add a second `ClerkProvider` anywhere in the tree.

---

## Server-Side Auth

To get the current user's ID in a Server Component or data helper, use `auth()` from `@clerk/nextjs/server`.

```ts
// ✅ CORRECT — always call auth() on the server to get the userId
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
if (!userId) throw new Error("Unauthenticated");
```

- **Always** call `auth()` directly inside the server-side function that needs it — never pass `userId` down from a parent or accept it as a parameter from external input.
- **Always** guard with a null check on `userId` and throw or redirect if the user is not authenticated.
- See `docs/data-fetching.md` Rule 3 for how `userId` must be used to scope database queries.

---

## Client-Side Auth

For UI that depends on auth state, use Clerk's pre-built components from `@clerk/nextjs`:

| Component | Purpose |
|---|---|
| `<SignInButton>` | Triggers Clerk's sign-in flow (use `mode="modal"`) |
| `<SignUpButton>` | Triggers Clerk's sign-up flow (use `mode="modal"`) |
| `<UserButton>` | Displays the signed-in user's avatar with account management |
| `<Show when="signed-in">` | Conditionally renders children when the user is signed in |
| `<Show when="signed-out">` | Conditionally renders children when the user is signed out |

```tsx
// ✅ CORRECT — use Clerk components for auth UI
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";

<Show when="signed-out">
  <SignInButton mode="modal"><button>Sign In</button></SignInButton>
  <SignUpButton mode="modal"><button>Sign Up</button></SignUpButton>
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

- **Do not** implement custom sign-in/sign-out UI from scratch.
- **Do not** use `useEffect` to check auth state — use Clerk's components and hooks.

---

## What NOT to Do

```ts
// WRONG — manual session/token handling
const token = cookies().get("session");
const user = verifyJwt(token);

// WRONG — accepting userId from an untrusted source
export async function getData(userId: string) { ... }

// WRONG — using a different auth library
import { getSession } from "next-auth/react";
```

---

## Summary Cheatsheet

| Concern | Solution |
|---|---|
| Route protection | `clerkMiddleware()` in `src/middleware.ts` |
| Provider setup | `<ClerkProvider>` in root layout |
| Get userId on server | `auth()` from `@clerk/nextjs/server` |
| Sign-in / sign-up UI | `<SignInButton>`, `<SignUpButton>` from `@clerk/nextjs` |
| User avatar / account | `<UserButton>` from `@clerk/nextjs` |
| Conditional auth UI | `<Show when="signed-in|signed-out">` from `@clerk/nextjs` |
| Custom auth libraries | Never |
