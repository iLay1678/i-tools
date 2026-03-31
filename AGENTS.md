# AGENTS.md

## Purpose
- This repository is a Next.js 16 App Router project for a toolbox-style web app.
- Stack: React 18, TypeScript, Tailwind CSS 4, Radix UI, shadcn/ui-style components, Oxlint.
- Deployment targets include Node/Docker and Cloudflare Workers via OpenNext.

## Repository layout
- `app/` — all application code, routes, API handlers, shared components, and utilities.
- `app/**/page.tsx` — page-level route components.
- `app/api/**/route.ts` — Next.js route handlers.
- `app/components/ui/` — reusable UI primitives.
- `app/components/` — app-specific shared components.
- `app/lib/` and `app/utils/` — helpers and non-UI utilities.
- `public/` — static assets.

## Package manager
- Prefer `npm` for local work because the repo includes `package-lock.json` and the README uses npm.
- Be aware that `Dockerfile` uses `pnpm` through Corepack during container builds.
- Do not switch package managers unless explicitly requested.

## Install
```bash
npm install
```

## Development commands
```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Deploy-related commands
```bash
npm run deploy
npm run export
```

## What each script does
- `npm run dev` — starts the Next.js dev server.
- `npm run build` — creates a production build.
- `npm run start` — serves the production build.
- `npm run lint` — runs Oxlint.
- `npm run deploy` — builds with OpenNext and deploys with Wrangler.
- `npm run export` — runs `next export`.

## Test status
- There is currently no test runner configured in `package.json`.
- No `*.test.*` or `*.spec.*` files were found.
- There is no repository-standard single-test command yet.

## Single-test guidance
- If you are asked to run tests, first confirm whether a test framework should be added.
- Do not invent a test command and present it as existing repository behavior.
- If a framework is introduced later, update this file with:
  - the full test command,
  - the single-file test command,
  - and any watch/debug variants.

## Mandatory validation before handoff
- Run `npm run lint` after code changes when feasible.
- Run `npm run build` for changes that may affect routing, typing, bundling, or deployment.
- If you add a test framework, run the relevant tests and document the exact commands here.

## Agent instruction files
- No `.cursorrules` file was found.
- No files were found under `.cursor/rules/`.
- No `.github/copilot-instructions.md` file was found.
- If any of those files are added later, treat them as higher-priority supplemental instructions and merge their constraints into this file.

## TypeScript rules
- TypeScript is configured with `strict: true`; keep code type-safe.
- Prefer explicit types for public helpers, shared component props, and complex state.
- Avoid `any`; use `unknown`, discriminated unions, or typed interfaces instead.
- Keep `noEmit` assumptions intact; do not add build outputs to source control.
- Use the configured alias: `@/*` maps to `./app/*`.

## Imports
- Prefer alias imports like `@/components/...`, `@/lib/...`, and `@/utils/...` over deep relative paths when available.
- Keep framework imports (`react`, `next/*`) near the top.
- Group imports logically: framework, third-party, internal.
- Match the surrounding file's quote style and semicolon style instead of reformatting unrelated lines.
- Remove unused imports; Oxlint will flag them.

## Formatting conventions
- The codebase is not perfectly uniform today: some files use single quotes/no semicolons, others use double quotes/semicolons.
- Default rule: preserve the existing style of the file you touch.
- Do not reformat large files solely for style normalization.
- Keep JSX readable with one prop per line when lines grow long.
- Prefer small, focused diffs.

## Naming conventions
- React components: `PascalCase`.
- Page components commonly use `export default function XxxPage()`.
- Utility functions: `camelCase`.
- Interfaces and types: `PascalCase`.
- Route segment folders: kebab-case (`json-formatter`, `random-string`, etc.).
- Constants that are true configuration tables may use `UPPER_SNAKE_CASE` or descriptive `camelCase`; follow local context.

## React / Next.js conventions
- Use App Router patterns already present in `app/`.
- Add `'use client'` only when the component actually needs client-only features such as hooks, browser APIs, or event handlers.
- Prefer server components by default when client interactivity is unnecessary.
- Keep page files focused on page behavior; extract reusable UI into `app/components/` or `app/components/ui/`.
- Use `next/link` for internal navigation.
- Keep metadata near layout/page definitions when appropriate.

## UI conventions
- Tailwind utility classes are the primary styling approach.
- Reuse existing UI primitives from `app/components/ui/` before adding new primitives.
- Use the shared `cn()` helper from `@/lib/utils` for class merging.
- The repo uses shadcn/ui-style patterns with Radix primitives and `class-variance-authority`; follow those patterns for variant-based components.
- Keep the UI consistent with the current product style: modern, compact, utility-first, Chinese-language user-facing copy.

## State and component design
- Prefer local state for page-scoped tools.
- Use `useCallback`/`useMemo` when they clearly help stabilize handlers or derived values already being passed around.
- Avoid unnecessary abstraction for one-off tool pages.
- Extract helpers when logic becomes reusable or hard to scan inline.

## Error handling
- Fail with user-friendly messages in interactive pages.
- In route handlers, validate inputs and return structured JSON responses.
- Prefer typed error narrowing (`error instanceof Error`) over `catch (error: any)` for new code.
- Preserve current external API behavior unless the task explicitly allows changing it.
- Do not swallow errors silently.

## API route guidance
- Route handlers live under `app/api/**/route.ts`.
- Keep handlers narrow and explicit about request parsing.
- Return `Response.json(...)` consistently.
- Remember that `next.config.js` applies permissive CORS headers to `/api/(.*)`.
- Be careful when changing API shapes because some tool pages may depend on current response fields.

## Dependency guidance
- Prefer existing dependencies already in the repo before adding new ones.
- Do not replace Oxlint with ESLint unless explicitly requested.
- Do not add formatting tooling unless asked.
- Treat Cloudflare/OpenNext files (`wrangler.json`, `open-next.config.ts`) as deployment-critical.

## File safety
- Do not commit generated output such as `.next/` or `.open-next/`.
- Respect ignored local files like `.dev.vars`, `.wrangler/`, `.claude`, and `.ai_memory`.
- Avoid editing CI, Docker, or Cloudflare config unless the task requires it.

## Practical workflow for agents
1. Inspect the target route/component and nearby shared utilities.
2. Preserve the touched file's local formatting style.
3. Reuse existing UI primitives and helpers.
4. Keep types strict and avoid introducing `any`.
5. Run lint; run build when changes are broad or risky.
6. If you add tests or a test runner, update this file with exact commands.

## Good defaults for this repo
- Prefer minimal, targeted edits.
- Prefer compatibility with current Chinese UI copy and route naming.
- Prefer local consistency over imposing a new global style.
- Prefer explicit, typed code over clever abstractions.
