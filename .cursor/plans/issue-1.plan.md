---
name: Self-contained button badge
overview: Fold the shadcn button primitive into devere-ui/button, and switch devere-ui call sites off the same-named shadcn button and badge. Other primitives stay on shadcn.
todos:
  - id: inline-button
    content: Fold ui/button into devere-ui/button and export buttonVariants
    status: pending
  - id: retarget-imports
    content: Point dialog, theme-toggle, and data-table at devere-ui button and badge
    status: pending
  - id: registry-deps
    content: Replace shadcn button/badge registry deps with @devere-ui equivalents
    status: pending
isProject: false
---

# Self-contained button and badge

Only [src/components/devere-ui/button.tsx](src/components/devere-ui/button.tsx) still imports a shadcn primitive of the same name (`@/components/ui/button`). Badge, tabs, dialog, drawer, and table already do not. Dialog, theme-toggle, and data-table still import the shadcn button, and data-table still imports the shadcn badge.

## In scope

- Copy `buttonVariants` and the Base UI button from [src/components/ui/button.tsx](src/components/ui/button.tsx) into [src/components/devere-ui/button.tsx](src/components/devere-ui/button.tsx). Keep the existing `loading` behavior. Export `Button`, `ButtonProps`, and `buttonVariants`.
- Stop that file from importing `@/components/ui/button`.
- Point these devere-ui imports at the devere-ui versions:
  - [src/components/devere-ui/dialog.tsx](src/components/devere-ui/dialog.tsx) and [src/components/devere-ui/theme-toggle.tsx](src/components/devere-ui/theme-toggle.tsx): `@/components/devere-ui/button` (theme-toggle keeps using `buttonVariants` for its variant and size types).
  - [src/components/devere-ui/data-table.tsx](src/components/devere-ui/data-table.tsx): `@/components/devere-ui/button` and `@/components/devere-ui/badge`.
- Adapt the three filter-count badges in data-table. They currently pass `variant="secondary"` to the shadcn badge. The devere badge API is `color` and `size`, so map those call sites to a small neutral pill (`size="sm"` plus a neutral `color`) and keep the existing layout classes.
- Update [registry.json](registry.json):
  - `button`: drop the shadcn `"button"` registry dependency. Depend on `@base-ui/react` and `class-variance-authority` directly, and keep `@devere-ui/circular-progress`.
  - `dialog` and `theme-toggle`: replace `"button"` with `"@devere-ui/button"`.
  - `data-table`: replace `"button"` with `"@devere-ui/button"` and `"badge"` with `"@devere-ui/badge"`.

## Out of scope

- Do not delete or rewrite [src/components/ui/button.tsx](src/components/ui/button.tsx) or [src/components/ui/badge.tsx](src/components/ui/badge.tsx). Local shadcn files (`sidebar`, `sheet`, `ui/dialog`, `input-group`) and [src/components/copy-button.tsx](src/components/copy-button.tsx) keep importing them.
- Do not vendor popover, dropdown-menu, card, sidebar, checkbox, command, input, select, separator, textarea, or tooltip.
- Do not change badge, tabs, drawer, or table beyond the dialog and data-table import updates above. They already avoid a same-named shadcn import.

## Acceptance

- No file under `src/components/devere-ui/` imports `@/components/ui/button` or `@/components/ui/badge`.
- Installing `@devere-ui/button` does not install the shadcn button.
- Installing data-table, dialog, or theme-toggle pulls `@devere-ui/button` (and data-table pulls `@devere-ui/badge`) instead of the shadcn button or badge.
- `npx tsc -b` and `npm run registry:validate` pass.
- Button demo still shows the loading state. Data-table filter counts still render as small neutral pills. Theme toggle still accepts the same variant and size props.
