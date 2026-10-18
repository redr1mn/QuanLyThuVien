# Backend / Frontend Folder Separation Design

## Goal

Tách mã nguồn ASP.NET MVC/Razor và mã nguồn React/Vite thành hai vùng rõ ràng là `backend/` và `frontend/`, nhưng giữ nguyên mô hình hybrid hiện tại và không thay đổi hành vi nghiệp vụ.

## Current state

Repository hiện có một project ASP.NET Core nằm trong `QuanLyThuVien/`. React/Vite nằm lồng trong `QuanLyThuVien/ClientApp/`, trong khi Razor Views, controller, server-side static assets và thư mục output Vite cùng thuộc project ASP.NET. `.slnx`, `.csproj`, `_ViteScripts.cshtml` và `vite.config.ts` đều đang phụ thuộc vào các đường dẫn này.

Backend hiện build được và test frontend hiện có 10 test pass. Frontend build chưa được xác nhận trong checkout hiện tại vì `node_modules` chưa được cài, khiến lệnh `tsc` không tồn tại.

## Target architecture

```text
QuanLyThuVien/
├── backend/
│   └── QuanLyThuVien/
│       ├── Controllers/
│       ├── Models/
│       ├── Properties/
│       ├── Views/
│       ├── wwwroot/
│       │   ├── css/
│       │   ├── js/
│       │   ├── lib/
│       │   └── dist/              # output được Vite sinh ra, không chỉnh tay
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       ├── Program.cs
│       └── QuanLyThuVien.csproj
├── frontend/
│   ├── src/
│   ├── tests/
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── docs/
├── QuanLyThuVien.slnx
├── README.md
└── .gitignore
```

### Ownership rules

- `backend/QuanLyThuVien/` owns ASP.NET startup, controllers, models, Razor Views, authentication, server-rendered CSS/JS and the public web root.
- `frontend/` owns React components, TypeScript, Vite configuration, frontend tests and npm dependencies.
- `backend/QuanLyThuVien/wwwroot/dist/` remains a generated deployment artifact owned by the backend host. Frontend source writes to it through Vite; it is not committed.
- Razor Views remain in the backend because they are server-rendered and currently provide routing, authentication-aware navigation and React mount points.
- The namespace remains `QuanLyThuVien`; moving the project directory must not cause a namespace or route rename.

## Build and runtime contracts

1. `QuanLyThuVien.slnx` points to `backend/QuanLyThuVien/QuanLyThuVien.csproj`.
2. `QuanLyThuVien.csproj` sets `SpaRoot` to `..\..\frontend\` and runs `npm install` plus `npm run build` from that directory during publish.
3. `frontend/vite.config.ts` writes production assets to `../backend/QuanLyThuVien/wwwroot/dist`.
4. Development HMR continues to use `http://localhost:5173`; ASP.NET continues to use the existing `http` and `https` launch profiles.
5. `_ViteScripts.cshtml` keeps loading `src/main.tsx` from the Vite server in Development and `wwwroot/dist/assets/main.js` from the backend in static-bundle mode.
6. The home page continues to load `wwwroot/dist/assets/index.js` through its existing Razor section.
7. README setup, run, build, troubleshooting and tree examples use `frontend/` and `backend/QuanLyThuVien/` consistently.

## Migration scope

- Move the existing ASP.NET project directory under `backend/QuanLyThuVien/`.
- Move `ClientApp` to the repository-level `frontend/` directory.
- Update only path-sensitive solution, MSBuild, Vite, documentation and ignore-file entries.
- Preserve source content, routes, namespaces, package versions, launch ports and existing generated-asset behavior.
- Do not introduce a separate API project, database, EF Core, authentication provider or frontend routing layer as part of this structural migration.

## Known missing capabilities after the move

The folder separation does not implement these currently absent capabilities:

### Backend

- Persistent database schema, EF Core context, migrations and seed strategy.
- Real account storage, password hashing, account status and password recovery.
- `[Authorize]` and role/policy enforcement on Staff/Admin routes and actions.
- Service/repository boundaries and API endpoints for books, readers, circulation, fines and reports.
- Real data access for the reader account, catalog and circulation flows.
- Backend unit/integration tests and an automated authorization test matrix.
- Production secrets/configuration strategy, structured audit logging, rate limiting and operational health checks.

### Frontend

- Typed API client and real backend integration; current catalog/workspace behavior still uses local/demo data where noted by the source.
- Consistent loading, error, empty and unauthorized states for server-backed screens.
- Frontend lint/typecheck scripts beyond the build command and browser-level end-to-end coverage.
- Shared domain types generated or synchronized with the backend contract.

These are follow-up work items, not implicit requirements of this folder migration.

## Verification and acceptance criteria

- No tracked source path references the old `QuanLyThuVien/ClientApp` location.
- `dotnet build` passes from the repository root.
- From `frontend/`, `npm ci`, `npm test` and `npm run build` pass.
- The build produces `backend/QuanLyThuVien/wwwroot/dist/assets/main.js` and `index.js`.
- Development configuration still points Razor to the Vite server at port 5173.
- Static-bundle mode still serves the generated assets from the backend web root.
- `QuanLyThuVien.slnx` opens the moved project and existing controller/view routes remain unchanged.
- README accurately describes the new ownership boundaries and the known missing capabilities.

## Non-goals

- Converting Razor pages into a standalone SPA.
- Adding a database or changing authentication policy.
- Refactoring controller/model/business logic unrelated to path changes.
- Renaming the .NET assembly, namespace, routes or user-facing screens.
