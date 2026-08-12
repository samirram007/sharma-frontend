# Project knowledge — sharma-frontend

This file gives Freebuff context about the **AIPT frontend** (React SPA). See the repo-root `knowledge.md` for the full-stack overview and the **API Endpoint Inventory**; this file is frontend-specific.

## What is this?

React 19 SPA for **AIPT** (Accounts | Inventory | Payroll | Tax). Serves the `sharma-api` Laravel backend via a JSON API. Built with Vite 8 + TypeScript 6 + TanStack Router (file-based) + TanStack Query/Table + Tailwind CSS v4 + Shadcn/Radix UI. Package manager is **pnpm** (`pnpm@11.10.0`, package name `frontendts`).

## Quickstart / Commands

| Action             | Command                                                       |
| ------------------ | ------------------------------------------------------------- |
| Install            | `pnpm install`                                                |
| Dev (Vite)         | `pnpm dev` — port **5173**                                    |
| Alt dev            | `pnpm start` — port **3000**                                  |
| Build              | `pnpm build` (`vite build && tsc`)                            |
| Test               | `pnpm test` (Vitest 4, jsdom)                                 |
| E2E                | `pnpm test:e2e` (Playwright — needs Laravel backend on :8000) |
| Lint               | `pnpm lint` (ESLint, TanStack config)                         |
| Format             | `pnpm format` (Prettier)                                      |
| Check all          | `pnpm check` (`prettier --write . && eslint --fix`)           |
| SSR (experimental) | `pnpm serve:ssr` / `pnpm dev:server` (`tsx src/server.ts`)    |

**Setup:** copy `.env.example` → `.env` (canonical local defaults: `VITE_API_BASE_URL=/api` through the Vite proxy, `VITE_BACKEND_URL=http://localhost:8000`), then put machine-specific overrides in `.env.local` (gitignored) — e.g. `VITE_BACKEND_URL=https://sharma-api.local` for a Laragon HTTPS dev box. `.env.production` (tracked) holds the prod build config. Local dev login (seed only): `admin@admin.com` / `password`.

## E2E testing (Playwright)

Playwright e2e tests live in `e2e/` (`playwright.config.ts` at project root).

- **Run:** `pnpm test:e2e` (also `test:e2e:headed`, `test:e2e:ui`, `test:e2e:report`, `test:e2e:typecheck`)
- **Prereqs:** Laravel backend running on `http://localhost:8000` (seeded demo users) + `pnpm exec playwright install chromium` once. The Vite dev server is started (or reused) automatically by the config's `webServer`.
- **Auth:** `e2e/helpers/auth.ts` logs in via the API and seeds the JWT into `localStorage` (`auth_token`) — the SPA's axios client sends it as a Bearer header, same as a real session.
- **Dashboard regression coverage:** `e2e/dashboard.spec.ts` asserts the dashboard renders without error states, and simulates a 500 on `/api/dashboard/transporter_wise` via `page.route` to prove widget failures render an inline fallback (no full-page server error / no 'Internal Server Error!' toast).
- CI: set `CI=1` for retries/single-worker mode; the Laravel backend must be reachable (it is not started by Playwright).

**Stack (from package.json):** `react ^19.2.4`, `typescript ^6.0.2`, `vite ^8.0.4`, `@tanstack/react-router ^1.168`, `@tanstack/react-query ^5.96`, `@tanstack/react-table ^8.21`, `tailwindcss ^4.2`, `zod ^4.3`, `react-hook-form ^7.72` + `@hookform/resolvers ^5.2`, `recharts ^3.8`, `vitest ^4.1`. Dev: ESLint `^10.8` (tanstack/eslint-config), Prettier `^3.8`.

## Architecture

### Key directories

```
src/
  routes/            — TanStack Router file-based routes (routeTree.gen.ts is AUTO-GENERATED)
  features/          — Domain modules (feature-first)
    auth/            — AuthContext, login/sign-up/otp/forgot-password, profile, change-password
    modules/         — ~50 domain modules mirroring API entities (stock_item, godown, voucher, …)
    masters/         — Grouped management pages (accounts, inventory, party, payroll, statutory, …)
    transactions/    — Transactions index + opening-balance
    reports/         — Balance sheet, P&L, receipt_note_report, day_book, running-balance, …
    dashboard/       — Widgets (recharts)
    settings/        — Account, appearance, display, notifications, profile
    chats/ tasks/ apps/ notifications/ enums/ errors/ global/
  components/
    ui/              — ~33 Shadcn/Radix primitives (button, dialog, select, tabs, …)
    (custom)         — export-dropdown, select-dropdown, form-input-field, search, pin-input, …
  layouts/           — GuestLayout, ProtectedLayout, sidebar/header/nav components
  core/
    contexts/        — ThemeContextProvider, font-context, echo-context, MyRouterContext, search-context
    hooks/           — use-dialog-state, use-mobile, useFocusArea, useFocusNext, useRestrictFocusToRef
  integrations/tanstack-query/ — QueryClient setup + devtools layout
  utils/             — axios-client, dataClient, export-table-pdf/excel, export-common, format-num, date
  lib/               — auth.ts (guards + token key), utils.ts (cn)
  config/fonts.ts    — font list for appearance settings
  styles.css         — Tailwind v4 theme (oklch tokens) + custom button/utility classes
  types/ data/       — shared TS types, demo/feature data
```

### Routing (TanStack Router, file-based)

- Route files live in `src/routes/`; `routeTree.gen.ts` is **auto-generated** by `@tanstack/router-plugin/vite` (dev server regenerates on file changes — never hand-edit).
- `router.tsx` exports `createAppRouter()` — `defaultPreload: 'intent'`, `scrollRestoration: true`, `defaultStructuralSharing: true`. `AppRouter.tsx` renders `RouterProvider` with context `{ auth, queryClient }` and augments the `Register` type; while `auth.isLoading` it shows a `react-top-loading-bar` + spinner.
- `__root.tsx` — `NavigationProgress`, `<Outlet />`, and `LayoutAddition` (TanStack + React Query devtools); `notFoundComponent: NotFoundError`, `errorComponent: GeneralError`.
- Route groups: `(guest)` (sign-in, sign-up, otp, forgot-password), `_protected` (authenticated layout), `(errors)`, `(false_redirect)` (frontend/website).
- **`_protected.tsx`** — `beforeLoad` guard: not authenticated → `redirect('/sign-in')`; authenticated with zero permissions → `redirect('/forbidden')`. Renders `ProtectedLayout` (sidebar + header).
- **Per-route guards** — `lib/auth.ts` exports `requirePermission(permission, fallback = '/forbidden')`, a reusable `beforeLoad` guard checking `context.auth.permissions` (e.g. `requirePermission('USER_MENU_VIEW')`).
- `lib/auth.ts` also exports `AUTH_TOKEN_KEY = 'auth_token'`, `OPENING_STOCK_EDITOR_ROLE_CODES`, and `canEditOpeningStock(roles)`.

### Provider tree (bootstrap)

`main.tsx` mounts into `#app` (index.html) in this order:
`TanStackQueryProvider` → `ThemeContextProvider` (defaultTheme **dark**, storageKey `vite-ui-theme`) → `FontProvider` → `AuthProvider` → `EchoProvider` (Reverb) → `Toaster` (sonner, top-center, richColors) → `AppRouter`.

### Auth flow

- **AuthContext** (`features/auth/contexts/AuthContext.tsx`) — state: `user` (UserWithRole), `userFiscalYear`, `period` (start/end dates derived from `userFiscalYear`), `permissions[]` (collected from `user.roles[].permissions[]` where `isAllowed`, keyed by `appModuleFeature.code`), `menuTree` (fetched via query once user exists). `isAuthenticated = !!user`.
- `fetchProfile()` runs on mount: `GET /auth/me`; on failure clears user + token. `login()` stores the bearer token if returned, then fetches profile. `logout()` calls the API, `queryClient.clear()`, clears state + token.
- **Token storage is driver-configurable** via `VITE_AUTH_STORAGE` (`localStorage` default | `sessionStorage` | `cookie`) — shared helpers `getToken/setToken/removeToken` in AuthContext and mirrored logic in `axios-client.ts` (kept in sync manually; circular-dependency note in code).
- **axios-client.ts** — `baseURL: VITE_API_BASE_URL`, `withCredentials: true`. Request interceptor attaches `Authorization: Bearer <token>` when stored. Response interceptor: on **401** (not on `/auth/refresh` or `/sign-in`) it calls `POST /auth/refresh` once (`_retry` flag) and replays the request; on refresh failure it clears the token and hard-redirects to `/sign-in`.
- ⚠️ Known issue: the JWT lives **both** in client storage (localStorage/sessionStorage) **and** in an httpOnly cookie — duplication + XSS exposure (see backend knowledge.md, same gap).

### Realtime (Reverb) — verified dev flow

- Vite dev proxy forwards **both** `/api` and `/broadcasting` → `VITE_BACKEND_URL` (`vite.config.js` strips a trailing `/api` from the target).
- The browser connects directly to `ws://localhost:8080` (Reverb); `VITE_REVERB_APP_KEY` default `af749dfcf9c0012a6a40a3fd24650e4a`, `VITE_REVERB_HOST/PORT/SCHEME` from env.
- Private/presence channel auth POSTs to **`/broadcasting/auth`** (NOT under `/api`) — a custom `authorizer` in `echo-context.tsx` posts `{socket_id, channel_name}` via `axiosClient` (fresh bearer token + 401 auto-refresh). The endpoint is resolved to an absolute URL against `window.location.origin` (dev: same-origin via the proxy; prod: `VITE_REVERB_AUTH_ENDPOINT`, e.g. `https://api.sharmahardware.co.in/broadcasting/auth`).
- **Drift check:** `src/lib/broadcast-drift.ts` — the auth-endpoint probe is **lazy**: it only GET-probes `/broadcasting/auth` after a real channel-auth POST fails with a drift-indicative status (404 or network error, not 403 — the route exists then and probing would just add a second 403 console entry), at most once per page load, warning when the endpoint is 404/unreachable (host/path/route-cache drift). The WS app-key check binds eagerly and warns once on Reverb close codes 4001/4008. No `[realtime]` warnings ⇒ config matches the backend. Probing lazily (rather than on every load) keeps the devtools console free of the "Failed to load resource: 403" entry that a bare eager GET probe generated on every healthy page load (dev and prod alike).
- **Verified locally end-to-end:** sign-in renders → `admin@admin.com`/`password` → dashboard loads → WS connects to `ws://localhost:8080` → channel auth POST returns 200 → realtime functional.

### Data fetching (TanStack Query)

- **`utils/dataClient.tsx`** — `getData/postData/putData/patchData/deleteData` wrappers over axiosClient. Payloads pass through `removeEmptyStrings()`. **Success auto-toasts `response.data.message`; errors auto-toast per-field validation messages** (session-expired text is rewritten, `duration: 6000`). Don't double-toast in mutation callbacks.
- **`integrations/tanstack-query/root-provider.tsx`** — shared `QueryClient`: `staleTime: 10min`, `refetchOnWindowFocus: only in prod`, retries: **disabled in dev**, in prod stop after 3 and never retry 401/403. Mutation `onError` → `handleServerError`; queryCache `onError` toasts 500.
- **Per-module pattern** — each module has `data/api.ts` (calls dataClient) + `data/queryOptions.ts` (exported `xQueryOptions()` with `queryKey: [BASE_KEY, ...]`, `queryFn`, sometimes `enabled`/`staleTime: 30s` for reports). Features consume via `useQuery({ ...queryOptions(), enabled: ... })` and mutations via `useMutation`.
- Response shape from backend: unified envelope `{ success, code, message, data }` — the `data` field is the actual payload.

### Forms (react-hook-form + Zod v4)

- **Schema pair per module** (`data/schema.ts`): a resource schema (response type, e.g. `godownSchema`) + a `formSchema` (form type, usually with an `isEdit: z.boolean()` flag). Recursion via `z.lazy()` (e.g. godown `parent`, address). Shared schemas like `ActiveInactiveStatusSchema` live in `src/types/`.
- Dialogs: `components/action-dialog.tsx` (create/edit) + `components/delete-dialog.tsx`, driven by a per-module context (`contexts/*-context.tsx`) that holds dialog state via `use-dialog-state` and config toggles.
- **`select-dropdown.tsx`** — the standard relation lookup: a right-side **Sheet + Command** (cmdk) searchable combobox wrapped in `FormControl`; props `items: {label, value}[]`, `isPending` loader, `useSheet` variant. Domain-specific dropdowns (e.g. `country-dropdown.tsx`, `godown-combo-box.tsx`) wrap it with query data.
- Other form primitives: `form-input-field.tsx`, `password-input.tsx`, `pin-input.tsx`, `date` via react-day-picker v9 (`components/ui/calendar.tsx`), `sonner` toasts.

### Tables (TanStack Table v8)

Two coexisting patterns:

- **`data-table` pattern** (stock_category, stock_unit, voucher_category, voucher_type, unique_quantity_code, tasks, notifications): full-featured `components/data-table.tsx` with `data-table-toolbar`, `data-table-column-header`, `data-table-faceted-filter`, `data-table-pagination`, `data-table-view-options`, `data-table-row-actions`.
- **`grid-table` pattern** (godown, grade, role, permission, menu, shift, status, stock_item, user, supplier, transporter…): CSS-grid table (`display: grid; gridTemplateColumns` from column defs) with sortable headers, row actions, and per-module `primary-buttons.tsx` (Add / Import / Export). State managed externally (sorting, pagination, columnVisibility, rowSelection).
- Reports use a **GridTable with manual pagination + expandable rows** (see Report Architecture in root knowledge.md — ReceiptNoteReport pattern).

### UI & theming (Tailwind v4 + Shadcn)

- **Tailwind v4 CSS-first config** — no `tailwind.config.js`. `src/styles.css`: `@import 'tailwindcss'`, `@plugin "tailwindcss-animate"`, `@custom-variant dark (&:is(.dark *))`, and `@theme inline` mapping oklch CSS variables → Tailwind color tokens (`--color-primary: var(--primary)`, etc.).
- Theme tokens in `:root` (light) and `.dark` (**deep navy, hue ~248** — intentionally different from stock zinc). `ThemeContextProvider` (custom, NOT next-themes) sets the `.dark` class on `<html>`, supports `system`, persists to `localStorage[vite-ui-theme]`.
- **Custom button classes** in `@layer components`: `btn-gradient` (primary gradient + sheen "wave" hover animation), `btn-surface`, `btn-outline`, `btn-ghost` — with `prefers-reduced-motion` support.
- **Custom utilities:** `placeholder`, `text-destructive`, `border-destructive`, `container`, `no-scrollbar`, `faded-bottom`, `border-inside-all`.
- ⚠️ **Global input overrides** in `@layer base`: inputs/selects/comboboxes are forced to `h-6`, `py-0`, border-bottom-only, dark focus (bg-slate-950) — new fields inherit these. A `.voucher-entry` scope variant exists for ledger-style POS grids.
- **Icons:** lucide-react (primary), `@tabler/icons-react`, react-icons, `@radix-ui/react-icons`.
- **Fonts:** `config/fonts.ts` = `['inter', 'manrope', 'system']`; applied via `FontProvider` (`core/contexts/font-context.tsx`) and the appearance settings form. Dynamic font classes must be safelisted (comment in fonts.ts).

### Reports & export system

- Reports follow the **ReceiptNoteReport pattern** (see root `knowledge.md` → "Report Architecture"): `index.tsx` with header + ReportingPeriod + view-selector dropdown/Tabs, `data/{api,queryOptions,schema}.ts` (one endpoint per grouped view, lazy-loaded via `enabled`), `components/{columns,grid-table,stock-item-details}.tsx`, TOTAL rows, on-screen charts via **recharts**.
- **`components/export-dropdown.tsx`** — shared export menu: PDF, Excel, CSV, JSON, Copy to Clipboard (TSV), Print. Props: `tab/title/rawData/columns/formatRow/computeTotals` + handlers `onExportPdf/Excel/Csv/Json/CopyToClipboard` + optional `chartConfig {labelKey, valueKey, chartLabel, formatLabel}`.
- **`utils/export-table-pdf.ts`** — jsPDF v4 + `jspdf-autotable`; `exportTableToPdf({ fileName, sections: [{ title, columnData, data, chart? }] })`.
- **`utils/export-table-excel.ts`** — Excel via exceljs.
- **`utils/export-common.ts`** — `generateChartImage({labels, datasets})` renders a canvas bar chart (800×500) to a data URL for PDF embedding (labels truncated at 15 chars, rotated 45°, Y-axis L/K-friendly).
- **`utils/format-num.ts`** — `toNum` (safe coercion → 0), `formatFixed` (2dp, no commas — for CSV/JSON), `formatLocale` (en-IN with fallback `'—'` — for display).
- Number/date conventions: display uses `toLocaleString('en-IN', …)` / `toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })`; exports use `toFixed(2)` and `format(d, 'dd-MMM-yyyy')` (date-fns). CSV writes include the `\uFEFF` BOM; clipboard falls back to `document.execCommand('copy')`.

### Realtime & misc features

- **Laravel Echo + pusher-js → Laravel Reverb** via `EchoProvider` (`core/contexts/echo-context.tsx`); env: `VITE_REVERB_APP_KEY/HOST/PORT/SCHEME` (defaults `localhost:8080/http`). Private-channel auth POSTs to `VITE_REVERB_AUTH_ENDPOINT` (derived from `VITE_API_BASE_URL` → `.../broadcasting/auth`, NOT under `/api`) with the bearer token via `axiosClient`. Used by notifications center and chats.
- **POS / transactions** — `features/modules/voucher/` hosts every voucher type (purchase, sales, receipt, payment, contra, journal, opening_stock, physical_stock, transfer_voucher, freight, day_book, …) sharing `contexts/pos-context.tsx`, `pos-header/body/footer`, `special/save-dialog`, and `components/stock-journal*` grids; shared schema in `data-schema/voucher-schema.ts` (+ `movement-type.ts`).
- **Dashboard** — recharts widgets with per-widget queries (`/dashboard/summary`, `*_wise`).
- **Enums** — `features/enums/` + `GET /api/enums/{enumName}`.
- **Tests** — Vitest (globals, jsdom; config in `vite.config.js` `test` block). Existing: `utils/date.test.ts`, `voucher/data-schema/movement-type.test.ts`, and per-voucher payload tests under `features/modules/voucher/{contra,payment,purchase,purchase_order}/test/`.

## Conventions

### Formatting / Linting

- **Prettier:** `semi: false`, `singleQuote: true`, `trailingComma: 'all'` (`prettier.config.js`).
- **ESLint:** `@tanstack/eslint-config` + local overrides — `no-console` **off**, `no-explicit-any` **off**, unused vars warn with `_` prefix ignored, several import/order rules relaxed.
- **TypeScript:** `strict: true`, `verbatimModuleSyntax: true`, `noUnusedLocals/Parameters`, `skipLibCheck: true`, `noEmit`, moduleResolution `bundler`, path alias `@/* → ./src/*`.

### Patterns to follow

- **Feature-first folders** — every domain under `features/` with `data/{api,queryOptions,schema}.ts`, `components/`, `contexts/`, `index.tsx` (+ `details.tsx`, `configuration.tsx` where needed).
- **Query options pattern** — export `xxxQueryOptions()` from `data/queryOptions.ts`; use `useQuery({ ...queryOptions(), enabled })`; lazy-load report tabs with `enabled: activeTab === '…'`.
- **Mutations** — `useMutation` with `onSuccess: queryClient.invalidateQueries(...)`; rely on dataClient's automatic toasts.
- **Route guards** — `requirePermission('FEATURE_CODE')` in `beforeLoad`; sidebars/nav filter items by `permissions` via `hasPermission` (nav-group).
- **Dialogs** — per-module context + `use-dialog-state`; create/edit in `action-dialog.tsx`, delete in `delete-dialog.tsx`.
- **Relation lookups** — wrap `select-dropdown.tsx` in a module-specific dropdown component that feeds it query data.
- **UI primitives** — add via `pnpx shadcn@latest add <component>` (new-york, zinc base — though the app overrides tokens in styles.css).
- **Charts** — recharts on screen; `generateChartImage` for PDFs.

## Gotchas & Known Issues

1. **`routeTree.gen.ts` is auto-generated** — never hand-edit; it regenerates on route-file changes via the router plugin. `tsconfig.json` excludes `entry-client.tsx`/`entry-server.tsx` (SSR mostly disabled; `index.html` loads `main.tsx`).
2. **`VITE_API_BASE_URL` must end with `/api`.** The Vite dev proxy (`/api` → `VITE_BACKEND_URL`) does **not** rewrite the prefix (Laravel routes are already `/api`-prefixed).
3. **Token duplication (security):** JWT stored in localStorage/sessionStorage (via `VITE_AUTH_STORAGE`, default `localStorage`, key `auth_token`) **and** in the httpOnly cookie set by the backend. Keep the two storage paths in sync when editing auth code (`AuthContext` + `axios-client.ts` — circular import note in the latter).
4. **Query behavior differs dev vs prod** — dev: no retries, no refetch-on-window-focus (root-provider). Don't be surprised if a dev query doesn't retry.
5. **Two UI primitive sets coexist:** Radix (`@radix-ui/*`, shadcn `components/ui/`) and `@base-ui-components/react` — check what an existing component uses before adding/editing one.
6. **Global input styling** in `styles.css` `@layer base` (small `h-6` inputs, underline borders, dark focus) applies app-wide — use `.voucher-entry` inside POS grids for the ledger look.
7. **Dynamic font classes** (`font-inter` etc.) must stay in the fonts safelist; the fonts.ts comment references a `tailwind.config.js` that no longer exists in v4 — fonts are applied via FontProvider, not tailwind config.
8. **dataClient auto-toasts** success messages and validation errors — don't call `toast()` again in callbacks or users see duplicates.
9. **pnpm is the standard package manager**; `package-lock.json` is gitignored, `pnpm-lock.yaml` + `pnpm-workspace.yaml` are canonical. CI installs with `--frozen-lockfile`.
10. **SSR scripts** (`serve:ssr`, `dev:server`, `server.ts`) are experimental/disabled — the SPA is client-rendered.
11. **`exceljs`/`jspdf` (v4)/`jspdf-autotable` (v5)/`file-saver`** are heavyweight deps — export handlers use dynamic `import()` for code-splitting; keep it that way.
12. `.env.example` ships `VITE_API_BASE_URL=https://aipt-api.local/api`; social login URLs default to `#` (disabled); `VITE_AUTH_STORAGE` (default `localStorage`) and `VITE_REVERB_AUTH_ENDPOINT` are documented. The resolved API base is shared via `src/lib/env.ts` (`API_BASE_URL`, falls back to `/api`) and consumed by `axios-client.ts` and `echo-context.tsx`.

## Things to avoid

- Do NOT hand-edit `src/routeTree.gen.ts` — the router plugin owns it.
- Do NOT commit `.env` files (API URLs/keys).
- Do NOT install packages globally — use project-local `pnpm`.
- Do NOT use `next-themes` for theming — the custom `ThemeContextProvider` is the standard.
- Do NOT double-toast around `dataClient` calls.
- Do NOT mutate React Query cache directly — invalidate via `queryClient.invalidateQueries()`.
- Do NOT cast to `any` without reason (ESLint allows it, but it hides real type errors).
- Do NOT add new Radix primitives blindly when `@base-ui-components` is the pattern in that file — match the file's existing library.
- Do NOT change `AUTH_TOKEN_KEY` (`auth_token`) without updating both `lib/auth.ts` and `axios-client.ts`.
- Do NOT remove the `/api` suffix from `VITE_API_BASE_URL`.

## Key Dependencies (from package.json)

| Package                                                  | Purpose                                                |
| -------------------------------------------------------- | ------------------------------------------------------ |
| `react` / `react-dom` `^19.2`                            | UI framework                                           |
| `@tanstack/react-router` `^1.168`                        | File-based routing (`routeTree.gen.ts` auto-gen)       |
| `@tanstack/react-query` `^5.96`                          | Server state/caching                                   |
| `@tanstack/react-table` `^8.21`                          | Tables                                                 |
| `react-hook-form` + `@hookform/resolvers`                | Form state + Zod resolvers                             |
| `zod` `^4.3`                                             | Schema validation                                      |
| `tailwindcss` `^4.2` + `@tailwindcss/vite`               | Styling (CSS-first config in `styles.css`)             |
| `recharts` `^3.8`                                        | Charts                                                 |
| `lucide-react` / `@tabler/icons-react` / `react-icons`   | Icons                                                  |
| `@radix-ui/*` + `radix-ui` + `@base-ui-components/react` | UI primitives (both coexist)                           |
| `cmdk` `^1.1`                                            | Command palette (command-menu, select-dropdown sheets) |
| `react-day-picker` `^9.14`                               | Date pickers (calendar.tsx)                            |
| `sonner` `^2.0`                                          | Toasts (dataClient auto-toasts)                        |
| `axios` `^1.14`                                          | HTTP (interceptors: bearer + 401 refresh)              |
| `jspdf` `^4.2` + `jspdf-autotable` `^5.0`                | PDF export                                             |
| `exceljs` `^3.4`                                         | Excel export                                           |
| `file-saver` + `@types/file-saver`                       | File downloads                                         |
| `date-fns` `^4.1`                                        | Date formatting (exports)                              |
| `lodash` `^4.18`                                         | Utility functions (isEqual, lowerCase, upperCase)      |
| `laravel-echo` `^2.3` + `pusher-js` `^8.5`               | Realtime (Reverb)                                      |
| `@dnd-kit/*`                                             | Drag & drop (menu tree)                                |
| `react-top-loading-bar`                                  | Auth-loading progress bar                              |
| `@faker-js/faker`                                        | Demo data                                              |

## Vite Config Notes (`vite.config.js`)

- `base` from `VITE_BASE_URL`; dev proxy `/api` → `VITE_BACKEND_URL` (default `http://localhost:8000`), no prefix rewrite, `secure` from `VITE_API_SECURE`.
- TanStack Router plugin: `autoCodeSplitting: true`, SPA prerender (`crawlLinks`), sitemap host `https://localhost:3000`.
- `manualChunks`: `src/features/masters/accounts` → `accounts` chunk (keep feature splits here).
- `optimizeDeps.include: ['react-is']`.
- Vitest: `globals: true`, `environment: 'jsdom'` (in the `test` block).
