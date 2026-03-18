# UI Coding Standards

## Rule: Use shadcn/ui Components Only

**All UI in this project must be built exclusively with shadcn/ui components. ABSOLUTELY NO custom UI components are to be created.**

- **Do not** create new components in `src/components/` by hand.
- **Do not** build custom buttons, inputs, dialogs, cards, or any other UI primitives from scratch.
- **Do not** use other component libraries (e.g. Base UI, Radix primitives directly, Headless UI, Material UI, etc.) for UI elements.
- **Do** install shadcn/ui components via the CLI and use them directly in pages and layouts.

## Installing Components

```bash
npx shadcn add button
npx shadcn add input
npx shadcn add dialog
npx shadcn add card
# etc.
```

Browse all available components at https://ui.shadcn.com/docs/components

Installed components live in `src/components/ui/` and must not be modified structurally — only Tailwind class tweaks via `className` props are acceptable.

## Project Configuration

shadcn/ui is configured in `components.json`:
- Style: `base-nova`
- Components path: `src/components/ui/`
- Utils path: `src/lib/utils.ts`
- Icons: `lucide-react`
- Tailwind CSS variables: enabled

## Allowed Supporting Utilities

These are used internally by shadcn/ui and may be used alongside component imports:

| Utility | Package | Purpose |
|---|---|---|
| `cn()` | `src/lib/utils.ts` | Merge Tailwind classes (clsx + tailwind-merge) |
| Icons | `lucide-react` | Icon library used by shadcn/ui |
| `date-fns` | `date-fns` | Date formatting (see below) |

## Styling

- Apply layout, spacing, and color via Tailwind utility classes on the `className` prop of shadcn components.
- Use the `cn()` helper from `@/lib/utils` to merge conditional classes.
- All colors must reference the CSS variable-based design tokens defined in `src/app/globals.css` (e.g. `bg-background`, `text-foreground`, `border-border`).
- Dark mode is applied via the `.dark` class on the document element — use `dark:` Tailwind variants.
- Do not create new CSS classes or CSS modules for UI elements.

## Date Formatting

All dates displayed in the UI must be formatted using **`date-fns`**. No other date libraries or manual formatting are permitted.

### Required Format

Dates must be displayed with an ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

Use `format` from `date-fns` with the `do MMM yyyy` format token:

```tsx
import { format } from "date-fns";

format(new Date("2025-09-01"), "do MMM yyyy"); // "1st Sep 2025"
format(new Date("2025-08-02"), "do MMM yyyy"); // "2nd Aug 2025"
format(new Date("2026-01-03"), "do MMM yyyy"); // "3rd Jan 2026"
format(new Date("2024-06-04"), "do MMM yyyy"); // "4th Jun 2024"
```

### Rules

- Always use `date-fns` — never use `Date.prototype.toLocaleDateString()`, `Intl.DateTimeFormat`, or manual string concatenation for display dates.
- Never hardcode ordinal suffixes (st, nd, rd, th) — `date-fns` handles this via the `do` token.
- If `date-fns` is not yet installed: `npm install date-fns`

## What NOT to Do

```tsx
// WRONG — custom UI component
function MyButton({ children }: { children: React.ReactNode }) {
  return <button className="bg-blue-500 text-white px-4 py-2 rounded">{children}</button>;
}

// WRONG — wrapper around a shadcn component
function PrimaryButton(props: ButtonProps) {
  return <Button variant="default" size="lg" {...props} />;
}

// WRONG — manual date formatting
const formatted = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

// WRONG — Intl API for display dates
new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(date);

// CORRECT — use shadcn/ui component directly
import { Button } from "@/components/ui/button";
<Button variant="default" size="lg">Submit</Button>

// CORRECT — use date-fns for date formatting
import { format } from "date-fns";
format(date, "do MMM yyyy"); // "1st Sep 2025"
```

## Adding New UI

1. Check https://ui.shadcn.com/docs/components for the component you need.
2. Install it: `npx shadcn add <component-name>`
3. Import from `@/components/ui/<component-name>` and use it directly — no wrapper, no abstraction.

If shadcn/ui does not offer the component you need, discuss with the team before creating anything custom.

## Existing Violations to Fix

The following files are custom implementations that must be replaced with shadcn/ui equivalents:

| File | Issue | Fix |
|---|---|---|
| `src/components/ui/button.tsx` | Custom Base UI implementation | `npx shadcn add button` |
| `src/app/components/DarkModeToggle.tsx` | Custom component | Replace with shadcn `Switch` or `Button` + icon |
| `src/app/dashboard/DatePicker.tsx` | Custom native `<input type="date">` | `npx shadcn add calendar` + `npx shadcn add popover` |
