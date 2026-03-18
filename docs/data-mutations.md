# Data Mutations

## ⚠️ CRITICAL RULES — READ BEFORE WRITING ANY MUTATION CODE ⚠️

These rules are **non-negotiable**. Violations must be corrected before code is merged.

---

## Rule 1: All Database Mutations Go in `/data` Helper Functions

**ALL database mutations MUST be encapsulated in helper functions inside the `src/data/` directory.**

- Server Actions call these helpers — they never write to the database directly
- Helper functions use **Drizzle ORM** exclusively — **NO raw SQL**
- One file per domain entity (e.g., `src/data/workouts.ts`, `src/data/sets.ts`)
- Read helpers and write helpers for the same entity live in the same file

```ts
// ✅ CORRECT — src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export async function createWorkout(name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();

  return workout;
}

export async function deleteWorkout(workoutId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

```ts
// ❌ WRONG — mutation directly inside a Server Action
"use server";

export async function createWorkoutAction(name: string) {
  await db.insert(workouts).values({ name }); // NEVER DO THIS
}
```

```ts
// ❌ WRONG — raw SQL
await db.execute(sql`INSERT INTO workouts (name) VALUES (${name})`); // NEVER DO THIS
```

---

## Rule 2: Mutations MUST Be Triggered via Server Actions

**ALL data mutations MUST be performed through Next.js Server Actions.**

- **NEVER** mutate data from a Client Component via `fetch()` to an API route
- **NEVER** mutate data from a Route Handler (`/app/api/...`)
- **NEVER** call `src/data/` mutation helpers directly from a Client Component

Server Actions must be defined in **colocated `actions.ts` files** placed next to the page or component that uses them.

```
src/app/dashboard/
  page.tsx
  actions.ts        ← Server Actions for this route
  WorkoutForm.tsx   ← Client Component that calls the action
```

```ts
// ✅ CORRECT — src/app/dashboard/actions.ts
"use server";

export async function createWorkoutAction(...) { ... }
export async function deleteWorkoutAction(...) { ... }
```

```ts
// ❌ WRONG — Server Actions in a page or component file
// src/app/dashboard/page.tsx
"use server"; // NEVER mix server actions into page/component files
export async function createWorkoutAction(...) { ... }
```

```ts
// ❌ WRONG — mutation via Route Handler
// src/app/api/workouts/route.ts
export async function POST(req: Request) {
  await createWorkout(...); // NEVER DO THIS
}
```

---

## Rule 3: Server Action Parameters MUST Be Typed — Never `FormData`

**Server Action parameters must always use explicit TypeScript types.**

- **NEVER** accept `FormData` as a parameter
- **ALWAYS** define typed parameters that match the data your action needs
- Use primitive types (`string`, `number`, `Date`) or plain objects

```ts
// ✅ CORRECT — typed parameters
export async function createWorkoutAction(name: string, startedAt: Date) { ... }

export async function addSetAction(workoutExerciseId: number, reps: number, weightKg: number) { ... }
```

```ts
// ❌ WRONG — FormData parameter
export async function createWorkoutAction(formData: FormData) { // NEVER DO THIS
  const name = formData.get("name") as string;
}
```

---

## Rule 4: Server Actions MUST Validate Arguments with Zod

**Every Server Action MUST validate all incoming arguments using Zod before doing anything else.**

- Install Zod if not present: `npm install zod`
- Define a Zod schema at the top of each action
- Call `.parse()` (throws on invalid input) as the first operation in the action body
- Never trust that the caller has passed correct data — always validate

```ts
// ✅ CORRECT — src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  startedAt: z.date(),
});

export async function createWorkoutAction(name: string, startedAt: Date) {
  const parsed = createWorkoutSchema.parse({ name, startedAt });
  return createWorkout(parsed.name, parsed.startedAt);
}
```

```ts
// ✅ CORRECT — validating a numeric ID before a delete
const deleteWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
});

export async function deleteWorkoutAction(workoutId: number) {
  const { workoutId: id } = deleteWorkoutSchema.parse({ workoutId });
  return deleteWorkout(id);
}
```

```ts
// ❌ WRONG — no validation
export async function createWorkoutAction(name: string, startedAt: Date) {
  return createWorkout(name, startedAt); // NEVER skip validation
}
```

---

## Rule 5: Users Can ONLY Mutate Their Own Data — No Exceptions

**Every mutation helper in `src/data/` MUST scope its write to the authenticated user's `userId`.** This is a security requirement.

- Always retrieve `userId` from Clerk auth inside the helper function
- Always include `eq(table.userId, userId)` in `WHERE` clauses for updates and deletes
- **NEVER** accept a `userId` as a parameter — always derive it from the server-side auth session
- **NEVER** insert or modify rows without attaching the authenticated `userId`

```ts
// ✅ CORRECT — userId always comes from the server-side Clerk session
import { auth } from "@clerk/nextjs/server";

export async function updateWorkoutName(workoutId: number, name: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  await db
    .update(workouts)
    .set({ name })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

```ts
// ❌ WRONG — missing userId scope on an update
export async function updateWorkoutName(workoutId: number, name: string) {
  await db
    .update(workouts)
    .set({ name })
    .where(eq(workouts.id, workoutId)); // could update another user's data!
}
```

---

## Complete Example

The full flow for a "create workout" feature:

**`src/data/workouts.ts`** — database helper

```ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";

export async function createWorkout(name: string, startedAt: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();

  return workout;
}
```

**`src/app/dashboard/actions.ts`** — Server Action

```ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(255),
  startedAt: z.date(),
});

export async function createWorkoutAction(name: string, startedAt: Date) {
  const parsed = createWorkoutSchema.parse({ name, startedAt });
  return createWorkout(parsed.name, parsed.startedAt);
}
```

**`src/app/dashboard/WorkoutForm.tsx`** — Client Component

```tsx
"use client";

import { createWorkoutAction } from "./actions";

export function WorkoutForm() {
  async function handleSubmit() {
    await createWorkoutAction("Morning session", new Date());
  }

  return <button onClick={handleSubmit}>Start Workout</button>;
}
```

---

## Rule 6: Never Call `redirect()` Inside Server Actions — Redirect Client-Side Instead

**Server Actions must NOT call `redirect()` from `next/navigation`.** Redirects must be handled client-side after the Server Action resolves.

- **NEVER** import or call `redirect()` inside a Server Action
- **ALWAYS** return from the Server Action and let the calling Client Component navigate using `useRouter`

```ts
// ❌ WRONG — redirect inside a Server Action
import { redirect } from "next/navigation";

export async function createWorkoutAction(name: string, startedAt: Date) {
  const parsed = createWorkoutSchema.parse({ name, startedAt });
  const workout = await createWorkout(parsed.name, parsed.startedAt);
  redirect("/dashboard"); // NEVER DO THIS
}
```

```ts
// ✅ CORRECT — Server Action just returns the result
export async function createWorkoutAction(name: string, startedAt: Date) {
  const parsed = createWorkoutSchema.parse({ name, startedAt });
  return createWorkout(parsed.name, parsed.startedAt);
}
```

```tsx
// ✅ CORRECT — Client Component handles the redirect
"use client";

import { useRouter } from "next/navigation";
import { createWorkoutAction } from "./actions";

export function WorkoutForm() {
  const router = useRouter();

  async function handleSubmit() {
    await createWorkoutAction(name, new Date());
    router.push("/dashboard"); // redirect happens here, client-side
  }
}
```

---

## Summary Cheatsheet

| Rule | Requirement |
|---|---|
| Where mutation logic lives | `src/data/` helper functions only |
| How to trigger mutations | Server Actions in colocated `actions.ts` files |
| Server Action parameters | Typed TypeScript — never `FormData` |
| Argument validation | Zod `.parse()` at the top of every Server Action |
| How to query/mutate the database | Drizzle ORM — no raw SQL |
| How to scope mutations | Always use `userId` from `auth()` — never from params |
| Route Handlers for mutations | Never |
| Direct DB calls from Client Components | Never |
| `redirect()` in Server Actions | Never — redirect client-side via `router.push()` after the action resolves |
