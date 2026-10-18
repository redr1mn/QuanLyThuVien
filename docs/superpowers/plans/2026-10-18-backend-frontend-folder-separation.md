# Backend / Frontend Folder Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the ASP.NET MVC host and React/Vite source into explicit `backend/` and `frontend/` areas while preserving the current hybrid runtime, routes, ports and namespaces.

**Architecture:** Keep ASP.NET MVC/Razor as the server host under `backend/QuanLyThuVien/`. Move React/Vite source and npm metadata to repository-level `frontend/`; Vite continues to emit generated assets into `backend/QuanLyThuVien/wwwroot/dist/`, which Razor serves in static-bundle mode.

**Tech Stack:** ASP.NET Core 10 MVC, Razor Views, .NET 10, React 18, TypeScript, Vite 6, npm, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-18-backend-frontend-folder-design.md`

## Global Constraints

- Preserve the `QuanLyThuVien` namespace, assembly identity, routes, launch ports and user-facing behavior.
- Keep Razor as the host; do not convert the application into a standalone SPA.
- Keep `http://localhost:5173` for Vite HMR and the existing ASP.NET `http`/`https` launch profiles.
- Keep generated Vite output at `backend/QuanLyThuVien/wwwroot/dist/`; do not commit generated bundles.
- Do not add a database, EF Core, API project, authentication provider or unrelated business refactor.
- Use `git mv` for repository moves and `apply_patch` for file content changes.

## Review Focus

- The solution must resolve the moved `.csproj`; verify with `dotnet build` from the repository root.
- MSBuild must invoke npm from the repository-level `frontend/`; verify the `SpaRoot` and publish target paths by inspecting the project file and running the frontend build.
- Vite must write both entry bundles to the backend web root; verify `main.js` and `index.js` exist after `npm run build`.
- Razor must keep both development and static-bundle paths valid; verify `_ViteScripts.cshtml`, `Home/Index.cshtml`, `appsettings.Development.json` and the generated output together.
- Documentation and tracked source must not retain the old `QuanLyThuVien/ClientApp` path; verify with `rg` after the move.

---

### Task 1: Move project ownership and update build paths

**Files:**
- Move: `QuanLyThuVien/` → `backend/QuanLyThuVien/`
- Move: `backend/QuanLyThuVien/ClientApp/` → `frontend/`
- Modify: `QuanLyThuVien.slnx`
- Modify: `backend/QuanLyThuVien/QuanLyThuVien.csproj`
- Modify: `frontend/vite.config.ts`

**Interfaces:**
- Produces the backend project at `backend/QuanLyThuVien/QuanLyThuVien.csproj` for the solution and `dotnet` tooling.
- Produces the frontend package at `frontend/package.json` for npm tooling.
- Keeps Vite output contract at `backend/QuanLyThuVien/wwwroot/dist/`.

- [ ] **Step 1: Create the backend container and move the ASP.NET project**

Run from the repository root:

```powershell
New-Item -ItemType Directory -Force backend | Out-Null
git mv QuanLyThuVien backend/QuanLyThuVien
```

Expected: all existing ASP.NET files, including `wwwroot`, are under `backend/QuanLyThuVien/` and the original root-level `QuanLyThuVien/` path no longer exists.

- [ ] **Step 2: Move the frontend source to the repository-level frontend directory**

```powershell
git mv backend/QuanLyThuVien/ClientApp frontend
```

Expected: `frontend/package.json`, `frontend/src/`, `frontend/tests/` and the Vite config exist; `backend/QuanLyThuVien/ClientApp/` no longer exists.

- [ ] **Step 3: Point the solution and MSBuild at the moved frontend/backend paths**

Update `QuanLyThuVien.slnx` to use `backend/QuanLyThuVien/QuanLyThuVien.csproj`.

Update `backend/QuanLyThuVien/QuanLyThuVien.csproj` so:

```xml
<SpaRoot>..\..\frontend\</SpaRoot>
```

The existing `DefaultItemExcludes`, `WorkingDirectory="$(SpaRoot)"`, npm commands and `wwwroot\dist\**` publish inclusion remain semantically unchanged.

- [ ] **Step 4: Point Vite output at the backend web root**

In `frontend/vite.config.ts`, change only the `build.outDir` value to:

```ts
outDir: '../backend/QuanLyThuVien/wwwroot/dist',
```

Keep the two entry points, filenames, manifest behavior, port `5173`, strict port and HMR settings unchanged.

- [ ] **Step 5: Verify the structural move before documentation edits**

Run:

```powershell
git status --short
Test-Path backend/QuanLyThuVien/QuanLyThuVien.csproj
Test-Path frontend/package.json
Test-Path QuanLyThuVien/QuanLyThuVien.csproj
Test-Path backend/QuanLyThuVien/ClientApp
```

Expected: the first two `Test-Path` commands return `True`, the last two return `False`, and only the intended rename/path changes are present.

- [ ] **Step 6: Commit the structural move**

```powershell
git add QuanLyThuVien.slnx backend frontend
git commit -m "refactor: separate backend and frontend folders"
```

### Task 2: Update repository documentation and ignore rules

**Files:**
- Modify: `README.md`
- Modify: `.gitignore`

**Interfaces:**
- Documents the new paths used by contributors and deployment.
- Records the current missing backend/frontend capabilities without implying they were implemented by the folder move.

- [ ] **Step 1: Update setup and run commands in README**

Replace `QuanLyThuVien/ClientApp` references with `frontend` for npm commands and replace backend working-directory references with `backend/QuanLyThuVien`.

Update the Vite output descriptions from `QuanLyThuVien/wwwroot/dist` to `backend/QuanLyThuVien/wwwroot/dist`.

- [ ] **Step 2: Update the documented folder tree and file ownership**

Rewrite the README tree so it shows:

```text
backend/QuanLyThuVien/   # ASP.NET MVC, Razor, server assets
frontend/                # React, TypeScript, Vite, frontend tests
```

Keep `Views/`, controllers and server `wwwroot/css`, `wwwroot/js`, `wwwroot/lib` under the backend tree. Keep React components, tests, npm metadata and Vite config under the frontend tree.

- [ ] **Step 3: Add the frontend missing-capabilities subsection**

Under the existing implementation-status documentation, state that frontend API integration, typed shared contracts, loading/error/empty/unauthorized states, lint/typecheck coverage and browser-level end-to-end tests are not implemented yet. Keep the existing backend missing list and explicitly label both as follow-up work.

- [ ] **Step 4: Update ignore rules for the new frontend location**

Replace the obsolete `**/ClientApp/dist/` rule with a rule covering `frontend/dist/`. Retain the existing `node_modules/` and `**/wwwroot/dist/` rules.

- [ ] **Step 5: Verify documentation and ignore changes**

Run:

```powershell
rg -n "QuanLyThuVien/ClientApp|ClientApp" README.md .gitignore backend frontend QuanLyThuVien.slnx
git diff --check
```

Expected: no obsolete path reference is returned and `git diff --check` is clean.

- [ ] **Step 6: Commit documentation changes**

```powershell
git add README.md .gitignore
git commit -m "docs: document separated backend and frontend"
```

### Task 3: Install frontend dependencies and verify the complete build contract

**Files:**
- Verify: `backend/QuanLyThuVien/QuanLyThuVien.csproj`
- Verify: `backend/QuanLyThuVien/Views/Shared/_ViteScripts.cshtml`
- Verify: `backend/QuanLyThuVien/Views/Home/Index.cshtml`
- Verify: `backend/QuanLyThuVien/appsettings.Development.json`
- Verify: `frontend/package.json`
- Verify: generated `backend/QuanLyThuVien/wwwroot/dist/` output (ignored)

**Interfaces:**
- Consumes the moved solution and frontend paths from Tasks 1–2.
- Produces a verified backend build, passing frontend tests and Vite bundles at the backend web root.

- [ ] **Step 1: Restore frontend dependencies**

Run from `frontend/`:

```powershell
npm ci
```

Expected: dependencies install from the committed `package-lock.json`, including the TypeScript compiler.

- [ ] **Step 2: Run the existing frontend tests**

Run from `frontend/`:

```powershell
npm test
```

Expected: all existing workspace-data tests pass.

- [ ] **Step 3: Build both Vite entries**

Run from `frontend/`:

```powershell
npm run build
```

Expected: TypeScript compilation and Vite build pass, creating `backend/QuanLyThuVien/wwwroot/dist/assets/main.js`, `index.js`, CSS and the manifest.

- [ ] **Step 4: Build the moved ASP.NET project**

Run from the repository root:

```powershell
dotnet build --nologo
```

Expected: the project resolves at `backend/QuanLyThuVien/QuanLyThuVien.csproj` with zero errors.

- [ ] **Step 5: Verify generated output and runtime references**

Run:

```powershell
Test-Path backend/QuanLyThuVien/wwwroot/dist/assets/main.js
Test-Path backend/QuanLyThuVien/wwwroot/dist/assets/index.js
rg -n "localhost:5173|dist/assets/main.js|dist/assets/index.js|SpaRoot|outDir" backend frontend
git status --short
```

Expected: both bundle checks return `True`; references use the new ownership boundaries; only ignored build output and any intentional dependency metadata are outside the committed source diff.

- [ ] **Step 6: Final diff and verification record**

Run:

```powershell
git diff --check
git status --short --branch
```

Expected: no whitespace errors and no untracked source files outside the intended documentation/build changes. Record any pre-existing build limitation separately from migration failures.
