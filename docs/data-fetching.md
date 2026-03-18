# Data Fetching

## ⚠️ CRITICAL RULES — READ BEFORE WRITING ANY DATA FETCHING CODE ⚠️

These rules are **non-negotiable**. Violations must be corrected before code is merged.

---

## Rule 1: Server Components ONLY

**ALL data fetching MUST be done exclusively in Server Components.**

- **NEVER** fetch data in Client Components (`"use client"`)
- **NEVER** fetch data in Route Handlers (`/app/api/...`)
- **NEVER** use `useEffect` + `fetch` to load data
- **NEVER** use SWR, React Query, or any client-side data fetching library
- **ONLY** fetch data by calling helper functions directly inside Server Components

```tsx
// ✅ CORRECT — Server Component fetching data
// src/app/dashboard/page.tsx (no "use client" directive)
import { getWorkoutsForDate } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getWorkoutsForDate("2024-01-01");
  return <WorkoutList workouts={workouts} />;
}
```

```tsx
// ❌ WRONG — fetching in a Client Component
"use client";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    fetch("/api/workouts").then(...); // NEVER DO THIS
  }, []);
}
```

```ts
// ❌ WRONG — fetching in a Route Handler
// src/app/api/workouts/route.ts
export async function GET() {
  const workouts = await db.select()...; // NEVER DO THIS
}
```

---

## Rule 2: All Database Queries Go in `/data` Helper Functions

**ALL database queries MUST be encapsulated in helper functions inside the `/data` directory** (`src/data/`).

- Server Components call these helpers — they never query the database directly
- Helper functions use **Drizzle ORM** exclusively — **NO raw SQL**
- One file per domain entity (e.g., `src/data/workouts.ts`, `src/data/exercises.ts`)

```ts
// ✅ CORRECT — src/data/workouts.ts
import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWorkoutsForDate(userId: string, date: string) {
  return db.query.workouts.findMany({
    where: and(eq(workouts.userId, userId), eq(workouts.date, date)),
    with: {
      workoutExercises: {
        with: { sets: true },
      },
    },
  });
}
```

```ts
// ❌ WRONG — raw SQL
const result = await db.execute(
  sql`SELECT * FROM workouts WHERE user_id = ${userId}` // NEVER DO THIS
);
```

---

## Rule 3: Users Can ONLY Access Their Own Data — No Exceptions

**Every single query MUST be scoped to the authenticated user's `userId`.** This is a security requirement.

- Always retrieve `userId` from Clerk auth at the top of every helper function
- Always filter queries with `eq(table.userId, userId)`
- **NEVER** trust a `userId` passed as a parameter from a Client Component or URL param — always derive it from the server-side auth session
- **NEVER** write a query that can return another user's data under any circumstances

```ts
// ✅ CORRECT — userId always comes from the server-side Clerk session
import { auth } from "@clerk/nextjs/server";

export async function getWorkoutsForDate(date: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  return db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId), // always scope to the authenticated user
      eq(workouts.date, date)
    ),
  });
}
```

```ts
// ❌ WRONG — userId comes from an untrusted external source
export async function getWorkoutsForDate(userId: string, date: string) {
  // userId could be tampered with — NEVER accept it as a parameter
  return db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
  });
}
```

---

## Summary Cheatsheet

| Rule | Requirement |
|---|---|
| Where to fetch data | Server Components only |
| Where database queries live | `src/data/` helper functions |
| How to query the database | Drizzle ORM — no raw SQL |
| How to scope queries | Always use `userId` from `auth()` — never from params |
| Route Handlers for data | Never |
| Client-side data fetching | Never |
