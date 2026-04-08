# AGENTS.md

## Stack and runtime gotchas
- Verified stack: Next.js 16 App Router, React 19, TypeScript `strict`, Tailwind CSS 4, Radix UI, Oxlint.
- Use `npm` for local work. The repo is lockfile-first (`package-lock.json`). Docker alone installs with `pnpm` via Corepack.
- Docker now builds on `node:22-alpine`; keep Node 22 compatibility when changing runtime-sensitive dependencies.
- API routes should default to Edge Runtime (`export const runtime = 'edge'`) unless the handler or its dependencies require Node-only features such as `process`, Node built-ins, or libraries incompatible with Edge.
- When making a release-level change, bump the version in `package.json` and `package-lock.json`, and record release notes in `README.md` under the update log section.
- Keep README update log entries brief and user-facing; avoid implementation details or low-level technical notes there.

## Commands that actually exist
- Install: `npm install`
- Dev: `npm run dev`
- Lint: `npm run lint` (Oxlint, not ESLint)
- Build: `npm run build`
- Production server: `npm run start`
- Cloudflare/OpenNext deploy: `npm run deploy`
- Static export: `npm run export`

## Verification expectations
- There is no test runner configured and no repo-standard single-test command. Do not invent one.
- Default validation after code changes: `npm run lint`.
- Also run `npm run build` for route, type, bundling, dependency, or deployment-related changes.

## High-value repo structure
- `app/` contains both pages and route handlers; there is no separate `src/`.
- Route handlers live in `app/api/**/route.ts`.
- Shared UI primitives are in `app/components/ui/`; reuse them before adding new components.
- Shared non-UI helpers live under `app/lib/` and `app/utils/`.
- `@/*` maps to `./app/*` in `tsconfig.json`.

## Architecture details easy to miss
- The whole site shell is wrapped by `app/layout.tsx` + `app/components/ClientLayout.tsx`; top-nav links like `/docs` are defined there.
- Tool pages shown on the homepage are hand-maintained in `app/page.tsx`; when adding, removing, or renaming tools, also sync the README tool list and relevant copy there.
- API docs are served from `/docs` using `@scalar/nextjs-api-reference`, with the spec from `app/api/openapi/route.ts`.
- The toolbox API index (`app/lib/toolbox.ts` `apiCatalog`) and the OpenAPI spec (`app/api/openapi/route.ts`) are both hand-maintained. If you add/remove/rename public APIs, update both or docs will drift.
- `next.config.js` adds permissive CORS headers for `/api/*`; some route helpers also set CORS headers directly. Preserve existing API behavior unless the task explicitly changes it.

## Deployment-sensitive files
- `next.config.js` sets `output: 'standalone'`; Docker depends on `.next/standalone` and `.next/static` being produced by `next build`.
- `wrangler.json` expects OpenNext output at `.open-next/worker.js` and `.open-next/assets`.
- Treat `Dockerfile`, `next.config.js`, `open-next.config.ts`, and `wrangler.json` as deployment-critical; avoid casual edits.

## Style and implementation conventions that matter here
- Preserve the touched file's existing quote/semicolon style; this repo is intentionally mixed.
- Prefer server components; add `'use client'` only when hooks, browser APIs, or handlers require it.
- Keep user-facing copy in Chinese unless the surrounding feature is already English.
- Prefer focused edits over wide cleanup. Do not reformat unrelated files.
- For new code, avoid `any`; use `unknown`, explicit interfaces, or typed narrowing.

## Existing instruction files
- No `.cursorrules`, `.cursor/rules/`, `.github/copilot-instructions.md`, or `opencode.json` are present today.
