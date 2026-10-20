# React SPA + API-only Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Tách frontend thành React SPA chạy độc lập tại `http://localhost:5173` và biến ASP.NET Core thành backend REST API/auth/database, không còn phụ thuộc Razor UI để render ứng dụng.

**Architecture:** React owns the browser entry point, routing, layouts and all user-facing pages. ASP.NET Core owns API controllers, authentication, application services, domain rules, EF Core and SQL Server. In development Vite proxies `/api` to the ASP.NET API on port `5194`; the browser never needs to open Razor pages.

**Tech Stack:** React 18, TypeScript, Vite, React Router, Axios, Zod, Zustand, ASP.NET Core 10, ASP.NET Core Identity, EF Core SQL Server, xUnit.

**Spec:** The approved in-chat design from 2026-10-20: `React SPA độc lập + ASP.NET Core API-only`.

## Global Constraints

- `frontend` must render a real root page from `frontend/index.html` at `http://localhost:5173`.
- Backend business APIs remain under `/api`; SQL Server and Identity remain backend-owned.
- Reader, Staff and Admin authorization must remain enforced by backend endpoints.
- Do not move database entities or passwords/secrets into frontend code.
- Preserve the existing API contracts and feature services unless a route adapter is required.
- Keep the branch name `refactor/separate-backend-frontend`; do not create any branch containing `codex/`.
- Verify each task with focused tests before moving to the next task.

## Review Focus

- Opening `/` directly on Vite must render the app instead of returning 404; pin with an SPA shell test/build.
- Refreshing a nested React route must not lose the selected page; pin with router fallback and route tests.
- API cookies must work through the Vite `/api` proxy; pin with a health/auth smoke check.
- Unauthenticated, Reader, Staff and Admin users must retain the existing backend authorization behavior; run the complete backend test suite.
- Removing Razor hosting must not remove API startup, health checks or SQL Server configuration; run solution build and `/api/health` smoke test.

## File Map

### Frontend application boundary

- Create: `frontend/index.html` — Vite browser entry document.
- Create: `frontend/src/app/App.tsx` — top-level router and route table.
- Create: `frontend/src/app/layouts/PublicLayout.tsx` — public navigation shell.
- Create: `frontend/src/app/layouts/AuthenticatedLayout.tsx` — role-aware application shell.
- Create: `frontend/src/app/router/routes.tsx` — route definitions and protected route guards.
- Modify: `frontend/src/main.tsx` — mount `App` from the SPA root.
- Modify: `frontend/vite.config.ts` — proxy `/api` to the ASP.NET backend.
- Modify: `frontend/package.json` — add `react-router-dom`.
- Create: `frontend/tests/app-routing.test.mjs` — root and protected route contract tests.

### Frontend feature integration

- Create: `frontend/src/pages/auth/LoginPage.tsx` and `RegisterPage.tsx` — React auth forms.
- Create: `frontend/src/pages/catalog/CatalogPage.tsx` — public catalog page adapter.
- Create: `frontend/src/pages/reader/ReaderAccountPage.tsx` — Reader page adapter.
- Create: `frontend/src/pages/staff/MembersPage.tsx` and `CirculationPage.tsx` — Staff page adapters.
- Create: `frontend/src/pages/admin/ReportsPage.tsx` — Admin/Staff report adapter.
- Modify: `frontend/src/features/auth/api/auth-api.ts` and schemas/store — register/session handling.
- Modify: existing feature pages only where route/layout props are needed.
- Delete after migration: `frontend/src/components/Workspace.tsx`, `workspace-data.ts`, legacy workspace CSS and legacy `BookCatalog.tsx` if no route imports remain.

### Backend API-only boundary

- Modify: `backend/QuanLyThuVien/Program.cs` — register API controllers, remove default MVC route and Razor UI hosting.
- Modify: `backend/QuanLyThuVien/QuanLyThuVien.csproj` — remove publish-time frontend embedding target.
- Delete after route migration: `backend/QuanLyThuVien/Controllers/`, `Views/`, old MVC-only `Models/` and UI-only `wwwroot/` assets.
- Keep: `backend/QuanLyThuVien/Api/`, `Application/`, `Domain/`, `Infrastructure/`, migrations and API contracts.
- Modify: `backend/QuanLyThuVien/Infrastructure/Authentication/IdentitySetup.cs` only if cookie/API redirect behavior needs a SPA-safe adapter.
- Create/modify: `backend/QuanLyThuVien.Tests/Api/ApiOnlyStartupTests.cs` — assert API startup and no Razor default route dependency.

### Documentation and scripts

- Modify: `README.md` — document independent frontend/backend startup and API proxy.
- Modify: `docs/sql-server-local.md` — document two-process SPA/API workflow.
- Modify: `docs/library-functionality.md` — replace hybrid architecture and Razor routes with SPA routes.

## Implementation Tasks

### Task 1: Establish the independent Vite SPA shell

**Files:**
- Create: `frontend/index.html`
- Create: `frontend/src/app/App.tsx`
- Create: `frontend/src/app/router/routes.tsx`
- Create: `frontend/src/app/layouts/PublicLayout.tsx`
- Create: `frontend/src/app/layouts/AuthenticatedLayout.tsx`
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/vite.config.ts`
- Modify: `frontend/package.json`, `frontend/package-lock.json`
- Test: `frontend/tests/app-routing.test.mjs`

**Interfaces:**
- Consumes: existing auth store, catalog/member/circulation/report/reader feature pages and `/api` Axios client.
- Produces: a mounted `<App />` at `/`, a Vite proxy for `/api`, and route definitions for `/`, `/login`, `/register`, `/reader/account`, `/staff/readers`, `/staff/circulation`, `/admin/reports`.

- [ ] Write failing routing contract tests asserting `frontend/index.html` exists, the app entry imports `App`, and Vite config has an `/api` proxy target.
- [ ] Run `npm test`; expected: routing tests fail because the SPA entry and proxy do not exist.
- [ ] Add the Vite entry, install React Router, define route/layout boundaries, and keep API calls on the existing Axios client.
- [ ] Run `npm test`, `npm run typecheck`, and `npm run build`; expected: all pass and `frontend/index.html` is served at Vite root.
- [ ] Commit: `feat: establish independent react spa shell`.

### Task 2: Move authentication and public pages into React

**Files:**
- Create: `frontend/src/pages/auth/LoginPage.tsx`
- Create: `frontend/src/pages/auth/RegisterPage.tsx`
- Create: `frontend/src/pages/catalog/CatalogPage.tsx`
- Modify: `frontend/src/features/auth/api/auth-api.ts`
- Modify: `frontend/src/features/auth/schemas/auth.ts`
- Modify: `frontend/src/features/auth/store/auth-store.ts`
- Test: `frontend/tests/auth-pages.test.mjs`

**Interfaces:**
- Consumes: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`, `POST /api/auth/logout`, and `GET /api/books`.
- Produces: React login/register forms with Zod validation, cookie session refresh, loading/error states, and public catalog at `/`.

- [ ] Write failing tests for login request shape, registration request shape and unauthenticated redirect behavior.
- [ ] Run focused frontend tests; expected: fail because React auth pages and registration API adapter do not exist.
- [ ] Implement forms using Axios, Zod and Zustand; do not duplicate password/member persistence in the browser.
- [ ] Run focused tests, full frontend tests, typecheck and build; expected: all pass.
- [ ] Commit: `feat: move auth and catalog into react spa`.

### Task 3: Move Reader, Staff and Admin screens into SPA routes

**Files:**
- Create: `frontend/src/pages/reader/ReaderAccountPage.tsx`
- Create: `frontend/src/pages/staff/MembersPage.tsx`
- Create: `frontend/src/pages/staff/CirculationPage.tsx`
- Create: `frontend/src/pages/admin/ReportsPage.tsx`
- Modify: `frontend/src/app/router/routes.tsx`
- Modify: feature page imports/stores only where adapter props are needed.
- Delete after proving no imports remain: `frontend/src/components/Workspace.tsx`, `workspace-data.ts`, legacy workspace styles and obsolete demo catalog component.
- Test: `frontend/tests/role-routes.test.mjs`

**Interfaces:**
- Consumes: existing feature API clients/stores and backend role enforcement.
- Produces: role-aware SPA routes with Reader/Staff/Admin navigation and no localStorage demo state for implemented workflows.

- [ ] Write failing tests for route-to-page mapping and role guard behavior.
- [ ] Run focused tests; expected: fail while routes still depend on Workspace/Razor props.
- [ ] Wire existing feature pages into layouts, remove legacy workspace imports, and keep feature state in Zustand/API stores.
- [ ] Run full frontend tests, typecheck and build; expected: no `Workspace` import remains in the application entry.
- [ ] Commit: `feat: migrate library screens to spa routes`.

### Task 4: Make ASP.NET Core API-only

**Files:**
- Modify: `backend/QuanLyThuVien/Program.cs`
- Modify: `backend/QuanLyThuVien/QuanLyThuVien.csproj`
- Modify: API auth cookie configuration if needed for SPA API responses.
- Delete after API smoke verification: `backend/QuanLyThuVien/Controllers/`, `Views/`, UI-only `Models/`, and UI-only `wwwroot/` assets.
- Test: `backend/QuanLyThuVien.Tests/Api/ApiOnlyStartupTests.cs`

**Interfaces:**
- Consumes: existing API controllers, Identity, EF Core and SQL Server configuration.
- Produces: API-only startup with `/api/health`, `/api/auth/*`, catalog and workflow endpoints, no MVC default route requirement.

- [ ] Write failing startup tests asserting API health remains available without a Razor default route.
- [ ] Run focused backend tests; expected: fail while startup still depends on MVC/Razor setup.
- [ ] Replace MVC registration/map route with API controller registration, remove publish-time frontend embedding, and delete obsolete UI host files only after references are gone.
- [ ] Run backend tests, solution build and local `/api/health`; expected: all pass.
- [ ] Commit: `refactor: make backend api only`.

### Task 5: Update developer workflow and documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/sql-server-local.md`
- Modify: `docs/library-functionality.md`
- Test: manual startup smoke using two terminals.

**Interfaces:**
- Consumes: final ports, Vite proxy target, SQL Server environment variables and API route table from Tasks 1–4.
- Produces: one unambiguous workflow: Vite at `5173`, ASP.NET API at `5194`/`7244`, SQL Server behind the API.

- [ ] Update docs to remove hybrid/Razor startup instructions and state that `5173` is the user-facing frontend URL.
- [ ] Run the documented commands in separate terminals.
- [ ] Verify `http://localhost:5173/` returns the React app, `/api/health` returns 200 through the proxy, and authenticated route guards behave correctly.
- [ ] Commit: `docs: document spa and api-only workflow`.

### Final verification

- [ ] Run `npm test`, `npm run typecheck`, and `npm run build` sequentially.
- [ ] Run `dotnet test backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj --nologo`.
- [ ] Run `dotnet build QuanLyThuVien.slnx --nologo` separately from tests.
- [ ] Start SQL Server, backend API and Vite; verify browser root `http://localhost:5173` and proxied `/api/health`.
- [ ] Run `git diff --check` and confirm no uncommitted changes before handoff.
