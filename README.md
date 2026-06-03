# devere-ui

A shadcn-compatible component registry. Components install into a
`components/devere-ui/` folder, alongside the shadcn primitives they build on.

Showcase: https://wealthtechgroup.github.io/devere-ui

## Install a component

Zero-config, straight from GitHub:

```bash
npx shadcn@latest add WealthTechGroup/devere-ui/button
```

Or via the `@devere-ui` namespace (register once per project):

```bash
npx shadcn@latest registry add @devere-ui=https://wealthtechgroup.github.io/devere-ui/r/{name}.json
npx shadcn@latest add @devere-ui/button
```

## Components

- **button** — the shadcn button with a `loading` state (spinner + optional `loadingText`).
- **loading-screen** — full-area loading state with a spinning ring and optional centered logo (`logoUrl` prop).

## Develop

```bash
npm install
npm run dev              # showcase at localhost:5173
npm run registry:validate
npm run registry:build   # writes JSON to public/r
```

Add a component under `src/components/devere-ui/`, register it in `registry.json`
with `"target": "@components/devere-ui/<name>.tsx"`, then push to `main` — CI
builds the registry and deploys the showcase to GitHub Pages.