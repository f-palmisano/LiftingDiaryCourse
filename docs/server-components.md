# Server Components Coding Standards

## ⚠️ CRITICAL RULES — READ BEFORE WRITING ANY SERVER COMPONENT CODE ⚠️

These rules are **non-negotiable**. Violations must be corrected before code is merged.

---

## Rule 1: `params` and `searchParams` MUST Be Awaited

**This is a Next.js 15 project. `params` and `searchParams` are Promises and MUST be awaited before accessing their properties.**

- **NEVER** destructure `params` or `searchParams` directly in the function signature
- **ALWAYS** type them as `Promise<...>` and `await` them inside the function body

```tsx
// ✅ CORRECT — params typed as Promise, awaited before use
interface PageProps {
  params: Promise<{ workoutId: string }>;
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { workoutId } = await params;
  // use workoutId here
}
```

```tsx
// ✅ CORRECT — searchParams typed as Promise, awaited before use
interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { date } = await searchParams;
  // use date here
}
```

```tsx
// ❌ WRONG — params not typed as Promise, accessed without await
interface PageProps {
  params: { workoutId: string }; // WRONG type
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { workoutId } = params; // NEVER DO THIS — params is a Promise
}
```

```tsx
// ❌ WRONG — destructuring params directly in the function signature
export default async function EditWorkoutPage({
  params: { workoutId }, // NEVER DO THIS
}: {
  params: { workoutId: string };
}) {}
```

---

## Rule 2: Page Components MUST Be `async` Functions

**All page and layout Server Components that access `params`, `searchParams`, or fetch data MUST be declared as `async` functions.**

```tsx
// ✅ CORRECT
export default async function WorkoutPage({ params }: PageProps) {
  const { workoutId } = await params;
  const workout = await getWorkoutById(parseInt(workoutId, 10));
  return <div>{workout.name}</div>;
}
```

```tsx
// ❌ WRONG — sync function cannot await params or data
export default function WorkoutPage({ params }: PageProps) {
  // cannot await params or call async data helpers here
}
```

---

## Rule 3: Parse and Validate Dynamic Route Segments

**Dynamic route segments from `params` are always strings. Always parse and validate them before use.**

- Convert numeric IDs with `parseInt()` and check with `isNaN()`
- Call `notFound()` from `next/navigation` if the segment is invalid or the resource does not exist

```tsx
// ✅ CORRECT — validate the param before use
import { notFound } from "next/navigation";

export default async function WorkoutPage({ params }: PageProps) {
  const { workoutId } = await params;
  const id = parseInt(workoutId, 10);

  if (isNaN(id)) notFound();

  const workout = await getWorkoutById(id);
  if (!workout) notFound();

  return <div>{workout.name}</div>;
}
```

```tsx
// ❌ WRONG — passing raw string param directly to a function that expects a number
const workout = await getWorkoutById(workoutId); // workoutId is still a string
```

---

## Summary Cheatsheet

| Rule | Requirement |
|---|---|
| `params` type | Always `Promise<{ ... }>` |
| `searchParams` type | Always `Promise<{ ... }>` |
| Accessing `params` / `searchParams` | Always `await` inside the function body |
| Page components with data fetching | Always `async` functions |
| Dynamic route segments (e.g. IDs) | Always parse and validate; call `notFound()` on invalid input |
