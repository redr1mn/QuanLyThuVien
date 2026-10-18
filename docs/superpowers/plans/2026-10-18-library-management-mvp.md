# Library Management MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current local/demo library workspace with a SQL Server-backed library MVP covering authentication, catalog, members, circulation, reservations and basic reports.

**Architecture:** Keep one ASP.NET Core MVC host with Razor pages and `/api` endpoints. Use a domain/application/infrastructure split inside the existing project, with EF Core SQL Server and ASP.NET Core Identity for persistence and authentication. Organize React by feature; all server communication goes through Axios, all external payloads are parsed with Zod, and Zustand stores only client/session/UI state.

**Tech Stack:** ASP.NET Core 10, C#, EF Core SQL Server, ASP.NET Core Identity, SQL Server, React 18, TypeScript, Vite, Axios, Zod, Zustand, xUnit.

**Spec:** `docs/superpowers/specs/2026-10-18-library-management-mvp-design.md`

## Global Constraints

- Database được chốt là **SQL Server**.
- Không tách thành nhiều project .NET ở giai đoạn này.
- `Domain` không tham chiếu ASP.NET, EF Core hoặc UI.
- Các API dùng cookie authentication same-origin trong giai đoạn đầu.
- Components không gọi Axios trực tiếp; gọi feature API/service.
- Zod parse response API trước khi đưa vào UI, đồng thời validate form input.
- Zustand giữ session, filter, modal, loading/error và state dùng chung; không được dùng như database.
- Không tự động chạy migration destructive trong production startup.
- Không tạo microservices hoặc project .NET riêng cho từng module.
- Không triển khai notification, barcode, Excel import hoặc thanh toán trong MVP đầu tiên.

## Review Focus

- Người dùng đã đăng nhập nhưng thiếu role phải nhận `403`, không chỉ bị ẩn menu. Pin in Task 3 API authorization tests.
- Payload API sai schema hoặc thiếu field phải bị từ chối ở boundary, không rơi xuống UI với `undefined`. Pin in Task 4 frontend contract tests.
- Một độc giả bị khóa/hết hạn hoặc vượt giới hạn không được tạo loan. Pin in Task 6 domain/application tests.
- Retry cùng thao tác mượn/trả không được tạo bản ghi hoặc tiền phạt trùng. Pin in Task 6 transaction/idempotency tests.
- Hai thao tác cùng lấy bản copy cuối phải không làm tồn kho âm hoặc tạo hai loan hợp lệ. Pin in Task 6 SQL Server concurrency test.

---

## File map

### Backend files

- Create `backend/QuanLyThuVien/Domain/Entities/`: persistence-independent entities and aggregate state.
- Create `backend/QuanLyThuVien/Domain/Enums/`: status and role enums.
- Create `backend/QuanLyThuVien/Domain/Rules/`: pure circulation and reservation rules.
- Create `backend/QuanLyThuVien/Application/Common/`: clock, result and pagination abstractions.
- Create `backend/QuanLyThuVien/Application/Features/{Auth,Catalog,Members,Circulation,Reservations,Reports}/`: use cases, ports and feature DTOs.
- Create `backend/QuanLyThuVien/Infrastructure/Persistence/`: `LibraryDbContext`, EF configurations, migrations and seed.
- Create `backend/QuanLyThuVien/Infrastructure/Authentication/`: Identity user and role setup.
- Create `backend/QuanLyThuVien/Api/Controllers/`: HTTP-only API controllers and contracts.
- Modify `backend/QuanLyThuVien/Controllers/AccountController.cs`: remove hardcoded demo credential validation and use Identity service.
- Modify `backend/QuanLyThuVien/Program.cs`: register SQL Server, Identity, API conventions and health checks.
- Modify `backend/QuanLyThuVien/QuanLyThuVien.csproj`: add EF Core SQL Server/design, Identity and testable configuration dependencies.
- Modify `backend/QuanLyThuVien/appsettings.json` and `appsettings.Development.json`: add named SQL Server connection string without credentials.
- Create `backend/QuanLyThuVien.Tests/`: domain and application tests; integration tests use an explicit test connection string.

### Frontend files

- Create `frontend/src/shared/api/http-client.ts`: one Axios instance with same-origin credentials, timeout and error normalization.
- Create `frontend/src/shared/api/api-envelope.ts`: API envelope and pagination types.
- Create `frontend/src/shared/schemas/`: Zod schemas for API responses and form inputs.
- Create `frontend/src/shared/stores/`: shared Zustand stores such as session and notifications.
- Create `frontend/src/features/{auth,catalog,members,circulation,reservations,reports}/`: feature APIs, stores, components and pages.
- Create `frontend/src/app/`: providers and page mounting boundaries.
- Modify `frontend/package.json` and `frontend/package-lock.json`: add `axios`, `zod`, `zustand` and the test/typecheck scripts needed by the implementation.
- Modify `frontend/src/main.tsx`: register feature page entry points without feature logic in the registry.
- Modify `frontend/src/components/BookCatalog.tsx` and `Workspace.tsx`: keep only compatibility wrappers while feature pages take over data and state.

## Task 1: Backend and frontend foundation

**Files:**

- Modify: `backend/QuanLyThuVien/QuanLyThuVien.csproj`
- Modify: `backend/QuanLyThuVien/Program.cs`
- Modify: `backend/QuanLyThuVien/appsettings.json`
- Modify: `backend/QuanLyThuVien/appsettings.Development.json`
- Create: `backend/QuanLyThuVien/Application/Common/LibraryOptions.cs`
- Create: `backend/QuanLyThuVien/Api/Controllers/HealthController.cs`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Create: `frontend/tests/foundation.test.mjs`
- Create: `backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj`
- Modify: `QuanLyThuVien.slnx`

**Interfaces:**

- Produces `LibraryOptions.ConnectionStringName = "LibraryDb"` and a `/api/health` endpoint returning `{ "data": { "status": "ok" }, "errors": [] }`.
- Produces frontend dependencies `axios`, `zod`, `zustand` and scripts `typecheck` and `test` that can run without a live database.

- [ ] **Step 1: Add the failing foundation checks**

  Add a backend test asserting the health response contract and `frontend/tests/foundation.test.mjs` importing `axios`, `zod` and `zustand`. Keep the tests independent from SQL Server.

- [ ] **Step 2: Run the checks to verify they fail**

  Run `dotnet test backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj` and `npm test` from `frontend/`. Expected: the new backend project/health contract and frontend package assertions are not implemented yet.

- [ ] **Step 3: Implement the foundation**

  Register the liveness endpoint, add a backend test project to the solution, and add the frontend dependencies/scripts. Add `test: "node --test tests"` and `typecheck: "tsc --noEmit"`. Do not add SQL Server/domain behavior in this task.

- [ ] **Step 4: Run foundation verification**

  Run `dotnet build --nologo`, `dotnet test backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj`, `npm ci`, `npm run typecheck` and `npm test`. Expected: all pass without requiring SQL Server.

- [ ] **Step 5: Commit**

  `git add backend frontend QuanLyThuVien.slnx && git commit -m "chore: add library application foundation"`

## Task 2: Domain model, EF Core SQL Server and Identity

**Files:**

- Create: `backend/QuanLyThuVien/Domain/Entities/ApplicationUser.cs`
- Create: `backend/QuanLyThuVien/Domain/Entities/Member.cs`
- Create: `backend/QuanLyThuVien/Domain/Entities/Category.cs`
- Create: `backend/QuanLyThuVien/Domain/Entities/Book.cs`
- Create: `backend/QuanLyThuVien/Domain/Entities/BookCopy.cs`
- Create: `backend/QuanLyThuVien/Domain/Entities/Loan.cs`
- Create: `backend/QuanLyThuVien/Domain/Entities/LoanItem.cs`
- Create: `backend/QuanLyThuVien/Domain/Entities/Reservation.cs`
- Create: `backend/QuanLyThuVien/Domain/Entities/Fine.cs`
- Create: `backend/QuanLyThuVien/Domain/Enums/BookCopyStatus.cs`
- Create: `backend/QuanLyThuVien/Domain/Enums/LoanStatus.cs`
- Create: `backend/QuanLyThuVien/Domain/Enums/ReservationStatus.cs`
- Create: `backend/QuanLyThuVien/Domain/Enums/MemberStatus.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/LibraryDbContext.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Configurations/CategoryConfiguration.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Configurations/BookConfiguration.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Configurations/BookCopyConfiguration.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Configurations/MemberConfiguration.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Configurations/LoanConfiguration.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Configurations/LoanItemConfiguration.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Configurations/ReservationConfiguration.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Configurations/FineConfiguration.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Seed/DatabaseSeeder.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Authentication/IdentitySetup.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/DesignTimeDbContextFactory.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Persistence/Migrations/*`
- Modify: `backend/QuanLyThuVien/Program.cs`
- Modify: `backend/QuanLyThuVien/Views/Account/Login.cshtml`

**Interfaces:**

- `LibraryDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>` exposes `DbSet<Member>`, `DbSet<Category>`, `DbSet<Book>`, `DbSet<BookCopy>`, `DbSet<Loan>`, `DbSet<LoanItem>`, `DbSet<Reservation>` and `DbSet<Fine>`.
- `ApplicationUser` has optional `MemberId`, `IsActive` and audit timestamps.
- `BookCopyStatus` has `Available`, `OnLoan`, `Reserved`, `Lost`, `Damaged`.
- `LoanStatus` has `Open`, `Returned`, `Cancelled`; `ReservationStatus` has `Waiting`, `Ready`, `Fulfilled`, `Cancelled`, `Expired`.
- SQL Server connection is read only from `ConnectionStrings:LibraryDb`; credentials never enter tracked configuration.

- [ ] **Step 1: Write domain mapping tests**

  Add tests for required fields, unique ISBN/barcode/card number indexes, one-to-many relationships and decimal fine precision. Assert that a duplicate barcode or card number is rejected by the model metadata.

- [ ] **Step 2: Run mapping tests to verify the model is absent**

  Run `dotnet test backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj --filter FullyQualifiedName~Persistence`. Expected: failure because the context/entities are not present.

- [ ] **Step 3: Implement entities, configuration and Identity**

  Implement the entities and EF configurations with explicit SQL Server column types, indexes and delete behavior. Register Identity roles and seed only `Reader`, `Staff`, `Admin`; do not seed passwords in source.

- [ ] **Step 4: Create and verify the first migration**

  Run `dotnet ef migrations add InitialLibrarySchema --project backend/QuanLyThuVien/QuanLyThuVien.csproj --startup-project backend/QuanLyThuVien/QuanLyThuVien.csproj --output-dir Infrastructure/Persistence/Migrations`. Then run `dotnet ef migrations script --idempotent --project backend/QuanLyThuVien/QuanLyThuVien.csproj --startup-project backend/QuanLyThuVien/QuanLyThuVien.csproj --output backend/QuanLyThuVien/Infrastructure/Persistence/Migrations/InitialLibrarySchema.sql` and inspect that Identity, library tables, indexes and foreign keys are present.

- [ ] **Step 5: Run mapping/build verification**

  Register `AddHealthChecks().AddDbContextCheck<LibraryDbContext>()`, then run `dotnet test backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj --filter FullyQualifiedName~Persistence` and `dotnet build --nologo`. Expected: PASS with no warnings introduced by the new model.

- [ ] **Step 6: Commit**

  `git add backend QuanLyThuVien.slnx && git commit -m "feat: add SQL Server library domain and persistence"`

## Task 3: Authentication, API envelope and authorization

**Files:**

- Create: `backend/QuanLyThuVien/Api/Contracts/ApiEnvelope.cs`
- Create: `backend/QuanLyThuVien/Api/Contracts/ApiError.cs`
- Create: `backend/QuanLyThuVien/Api/Middleware/ApiExceptionMiddleware.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Auth/IAuthService.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Auth/AuthService.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Auth/AuthContracts.cs`
- Create: `backend/QuanLyThuVien/Api/Controllers/AuthController.cs`
- Create: `frontend/src/features/auth/api/auth-api.ts`
- Create: `frontend/src/features/auth/schemas/auth.ts`
- Create: `frontend/src/features/auth/store/auth-store.ts`
- Modify: `backend/QuanLyThuVien/Controllers/AccountController.cs`
- Modify: `backend/QuanLyThuVien/Program.cs`
- Modify: `backend/QuanLyThuVien/Views/Account/Login.cshtml`
- Create: `backend/QuanLyThuVien.Tests/Api/AuthAuthorizationTests.cs`

**Interfaces:**

- `POST /api/auth/login` accepts `{ username, password, rememberMe }` and returns `{ data: { userId, displayName, role }, errors: [] }`.
- `GET /api/auth/me` returns the current session or `401`.
- `POST /api/auth/logout` clears the Identity cookie.
- `IAuthService.LoginAsync(LoginRequest request, CancellationToken cancellationToken)` returns `AuthSession` or a typed invalid-credentials result.
- `ApiEnvelope<T>` is the only success/error wrapper used by new API endpoints.
- `authApi.me()`, `authApi.login(request)` and `authApi.logout()` are the only frontend session calls; `auth-store.ts` exposes `user`, `isLoading`, `error`, `loadSession()` and `logout()`.

- [ ] **Step 1: Write authorization tests**

  Add tests for unauthenticated `GET /api/auth/me` => `401`, authenticated Reader access to own session => `200`, Reader access to Staff endpoint => `403`, and Staff/Admin role claims being restored from the cookie.

- [ ] **Step 2: Run tests to verify missing auth behavior**

  Run `dotnet test backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj --filter FullyQualifiedName~AuthAuthorization`. Expected: failure because the API endpoints and Identity service are not implemented.

- [ ] **Step 3: Implement Identity-backed auth**

  Implement `AuthService`, API contracts, cookie login/logout, current-session endpoint, exception-to-envelope middleware and role policies. Change the Razor `AccountController` to use the same Identity service; remove the hardcoded `reader`, `staff`, `admin` password branch.

- [ ] **Step 4: Verify auth behavior**

  Run the authorization tests, `dotnet build --nologo` and a manual local request sequence with seeded development users supplied through an ignored seed configuration. Expected: no demo credentials are accepted outside the configured seed path.

- [ ] **Step 5: Commit**

  `git add backend && git commit -m "feat: add identity authentication and API authorization"`

## Task 4: Catalog vertical slice and frontend API foundation

**Files:**

- Create: `backend/QuanLyThuVien/Application/Features/Catalog/CatalogService.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Catalog/CatalogContracts.cs`
- Create: `backend/QuanLyThuVien/Api/Controllers/BooksController.cs`
- Create: `backend/QuanLyThuVien/Api/Controllers/CategoriesController.cs`
- Create: `backend/QuanLyThuVien.Tests/Application/CatalogTests.cs`
- Create: `frontend/src/shared/api/http-client.ts`
- Create: `frontend/src/shared/api/api-envelope.ts`
- Create: `frontend/src/shared/api/api-error.ts`
- Create: `frontend/src/shared/schemas/catalog.ts`
- Create: `frontend/src/features/catalog/api/catalog-api.ts`
- Create: `frontend/src/features/catalog/store/catalog-store.ts`
- Create: `frontend/src/features/catalog/components/BookTable.tsx`
- Create: `frontend/src/features/catalog/pages/CatalogPage.tsx`
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/components/BookCatalog.tsx`
- Modify: `frontend/src/index.tsx`
- Create: `frontend/tests/catalog-schema.test.mjs`

**Interfaces:**

- `GET /api/books?query=&categoryId=&availableOnly=&page=1&pageSize=20` returns `ApiEnvelope<PagedResult<BookListItem>>`.
- `GET /api/books/{id}` returns `ApiEnvelope<BookDetails>`.
- `GET /api/categories` returns `ApiEnvelope<CategoryListItem[]>`.
- Staff/Admin use `POST /api/categories` and `PUT /api/categories/{id}` for category maintenance.
- Staff/Admin use `POST /api/books`, `PUT /api/books/{id}` and `POST /api/books/{id}/copies`.
- `catalogApi.list(params): Promise<PagedResult<BookListItem>>` validates the server payload with `bookListResponseSchema`.
- `useCatalogStore` exposes `query`, `categoryId`, `availableOnly`, `page`, `items`, `isLoading`, `error`, `load()` and `resetFilters()`.

- [ ] **Step 1: Write catalog contract and application tests**

  Test search by title/author, category filter, available-only filter, pagination metadata, and Staff/Admin-only mutations. Add a frontend Zod test for a valid book response and a malformed response missing `id`.

- [ ] **Step 2: Run tests to verify the catalog slice is absent**

  Run the backend catalog filter and frontend schema tests. Expected: failure because the service, endpoint and schemas do not exist.

- [ ] **Step 3: Implement the backend catalog slice**

  Add read/write contracts, query pagination, soft-delete filtering, category/copy validation, category endpoints and role policies. Return DTOs instead of EF entities.

- [ ] **Step 4: Implement the Axios/Zod/Zustand boundary**

  Configure one Axios client with `baseURL: '/api'`, `withCredentials: true`, timeout and normalized errors. Parse every catalog response with Zod; keep request state in `catalog-store.ts`.

- [ ] **Step 5: Move catalog UI off mock data**

  Extract the current catalog presentation into the catalog feature, preserve the existing visual language, and remove the mock fallback/localStorage path for the server-backed catalog. Keep `BookCatalog.tsx` as a compatibility wrapper only if the Razor home route still needs it.

- [ ] **Step 6: Verify and commit**

  Run backend catalog tests, frontend schema tests, `npm run typecheck`, `npm test`, `npm run build` and `dotnet build --nologo`. Commit with `feat: add catalog API and frontend data boundary`.

## Task 5: Members vertical slice

**Files:**

- Create: `backend/QuanLyThuVien/Application/Features/Members/MemberService.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Members/MemberContracts.cs`
- Create: `backend/QuanLyThuVien/Api/Controllers/MembersController.cs`
- Create: `backend/QuanLyThuVien.Tests/Application/MemberTests.cs`
- Create: `frontend/src/shared/schemas/members.ts`
- Create: `frontend/src/features/members/api/members-api.ts`
- Create: `frontend/src/features/members/store/members-store.ts`
- Create: `frontend/src/features/members/components/MemberTable.tsx`
- Create: `frontend/src/features/members/components/MemberForm.tsx`
- Create: `frontend/src/features/members/pages/MembersPage.tsx`
- Modify: `frontend/src/components/Workspace.tsx`

**Interfaces:**

- `GET /api/members?query=&status=&page=1&pageSize=20` returns paged member summaries.
- `GET /api/members/{id}` returns member profile, card status, current loan count and overdue count.
- `POST /api/members` and `PUT /api/members/{id}` are Staff/Admin-only.
- Reader requests for another member return `403`; a Reader can only request their linked profile.

- [ ] **Step 1: Write member rule tests**

  Cover duplicate card number, expired card, locked member, invalid email/phone input and Reader self-only access.

- [ ] **Step 2: Run member tests to verify absence**

  Run `dotnet test backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj --filter FullyQualifiedName~MemberTests`. Expected: FAIL before service/controller implementation.

- [ ] **Step 3: Implement backend member use cases**

  Add DTOs, validation, query filters, soft lock/unlock behavior and policies. Do not allow direct changes to loan history from member update endpoints.

- [ ] **Step 4: Implement frontend member feature**

  Add Zod schemas, API service, Zustand store and table/form states for loading, validation, empty, conflict and unauthorized responses.

- [ ] **Step 5: Verify and commit**

  Run member tests, `npm run typecheck`, `npm test`, `npm run build` and `dotnet build --nologo`. Commit with `feat: add member management slice`.

## Task 6: Circulation, fines and transaction safety

**Files:**

- Create: `backend/QuanLyThuVien/Application/Common/IClock.cs`
- Create: `backend/QuanLyThuVien/Infrastructure/Services/SystemClock.cs`
- Create: `backend/QuanLyThuVien/Domain/Rules/CirculationRules.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Circulation/CirculationService.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Circulation/CirculationContracts.cs`
- Create: `backend/QuanLyThuVien/Api/Controllers/LoansController.cs`
- Create: `backend/QuanLyThuVien.Tests/Domain/CirculationRulesTests.cs`
- Create: `backend/QuanLyThuVien.Tests/Application/CirculationServiceTests.cs`
- Create: `frontend/src/shared/schemas/circulation.ts`
- Create: `frontend/src/features/circulation/api/circulation-api.ts`
- Create: `frontend/src/features/circulation/store/circulation-store.ts`
- Create: `frontend/src/features/circulation/components/LoanForm.tsx`
- Create: `frontend/src/features/circulation/components/ReturnForm.tsx`
- Create: `frontend/src/features/circulation/pages/CirculationPage.tsx`
- Modify: `frontend/src/components/Workspace.tsx`

**Interfaces:**

- `POST /api/loans` accepts `{ memberId, copyIds[], dueAt }` and creates one open loan.
- `POST /api/loans/{id}/return` accepts `{ items: [{ copyId, condition }] }` and returns the final loan plus fines.
- `GET /api/loans?status=&memberId=&overdueOnly=&page=1&pageSize=20` returns paged loans; Reader scope is automatically limited to the current member.
- `CirculationService.BorrowAsync(BorrowCommand, CancellationToken)` and `ReturnAsync(ReturnCommand, CancellationToken)` run all state changes in one SQL Server transaction.
- Fine calculation is `overdueDays * dailyFine + conditionCharge`; the rate/config used is stored with the resulting fine.

- [ ] **Step 1: Write pure rule tests first**

  Test max books, expired/locked card, overdue block, unavailable copy, due date range, normal return, overdue fine, damaged/lost charge and repeated return rejection.

- [ ] **Step 2: Run rule tests to verify failure**

  Run `dotnet test backend/QuanLyThuVien.Tests/QuanLyThuVien.Tests.csproj --filter FullyQualifiedName~CirculationRulesTests`. Expected: FAIL because `CirculationRules` and `IClock` do not exist.

- [ ] **Step 3: Implement pure rules and service tests**

  Add deterministic clock injection and implement the rules without EF calls. Then add service tests using a transaction-capable test context or a fake repository port for the application layer.

- [ ] **Step 4: Implement SQL Server transaction behavior**

  Lock/recheck selected copies inside the transaction, create the loan and items, update copy statuses, and calculate/store fines. Reject a stale or repeated command with `409` rather than silently duplicating it.

- [ ] **Step 5: Implement API and frontend circulation flow**

  Add role/scope policies, DTO schemas and Zustand state. Replace local `borrow`, `returnLoan`, browser persistence and mock loan records for the circulation pages with API calls.

- [ ] **Step 6: Verify concurrency and commit**

  Run rule/service tests. If `LIBRARY_TEST_CONNECTION` is set, run the SQL Server integration test that submits two borrow commands for the final copy and expects one success plus one `409`. Then run all backend/frontend build checks and commit with `feat: add transactional circulation and fines`.

## Task 7: Reservations and reports

**Files:**

- Create: `backend/QuanLyThuVien/Application/Features/Reservations/ReservationService.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Reservations/ReservationContracts.cs`
- Create: `backend/QuanLyThuVien/Api/Controllers/ReservationsController.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Reports/ReportService.cs`
- Create: `backend/QuanLyThuVien/Application/Features/Reports/ReportContracts.cs`
- Create: `backend/QuanLyThuVien/Api/Controllers/ReportsController.cs`
- Create: `backend/QuanLyThuVien.Tests/Application/ReservationAndReportTests.cs`
- Create: `frontend/src/shared/schemas/reports.ts`
- Create: `frontend/src/features/reservations/api/reservations-api.ts`
- Create: `frontend/src/features/reservations/store/reservations-store.ts`
- Create: `frontend/src/features/reports/api/reports-api.ts`
- Create: `frontend/src/features/reports/store/reports-store.ts`
- Create: `frontend/src/features/reports/pages/ReportsPage.tsx`
- Modify: `frontend/src/components/Workspace.tsx`

**Interfaces:**

- `POST /api/reservations` creates one waiting reservation per member/book pair.
- `DELETE /api/reservations/{id}` cancels only an owned waiting reservation unless Staff/Admin override.
- `GET /api/reports/overview?from=&to=` returns counts for active loans, overdue loans, books, members, borrow/return volume and top books.

- [ ] **Step 1: Write reservation/report tests**

  Cover duplicate waiting reservation, cancel ownership, reservation expiration, role-scoped report access and empty date range.

- [ ] **Step 2: Implement backend reservation/report use cases**

  Enforce unique waiting reservation, calculate queue order from creation time and use SQL aggregation for report counts.

- [ ] **Step 3: Implement frontend pages and states**

  Add API services, Zod schemas and Zustand stores. Render loading, empty, error and unauthorized states; do not reintroduce mock data.

- [ ] **Step 4: Verify and commit**

  Run targeted tests, all builds and `git diff --check`. Commit with `feat: add reservations and library reports`.

## Task 8: Remove demo paths, documentation and release verification

**Files:**

- Modify: `backend/QuanLyThuVien/Views/Shared/_WorkspaceApp.cshtml`
- Modify: `backend/QuanLyThuVien/Views/Shared/_WorkspaceNavigation.cshtml`
- Modify: `backend/QuanLyThuVien/Views/Home/Index.cshtml`
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-10-18-library-management-mvp-design.md` only if an implementation decision materially differs from the spec
- Modify: `frontend/src/components/workspace-data.ts` or delete only after no import remains
- Create: `docs/sql-server-local.md`

- [ ] **Step 1: Search for stale demo behavior**

  Run `rg -n "MOCK|localStorage|ThuVien@123|authentication_source|demo|TODO" backend frontend README.md` and classify every remaining match. Delete only paths made obsolete by this implementation; preserve comments describing deferred work.

- [ ] **Step 2: Document SQL Server setup**

  Document connection string configuration, migration command, development seed command, required roles and the fact that credentials belong in User Secrets/environment variables.

- [ ] **Step 3: Run the full verification matrix**

  Run `dotnet restore`, `dotnet build --nologo`, `dotnet test`, `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `git diff --check`, and a local API smoke test for login, catalog, member, borrow, return, reservation and report routes.

- [ ] **Step 4: Review the final diff**

  Confirm no changes target `main`, no tracked secret or connection password exists, no component calls Axios directly, no endpoint returns EF entities, and no localStorage data remains authoritative for implemented features.

- [ ] **Step 5: Commit**

  `git add backend frontend docs README.md && git commit -m "docs: document SQL Server library MVP setup"`

## Handoff

After this plan is approved, implement tasks in order. The plan is intentionally staged because authentication, persistence and circulation contracts are dependencies for the later frontend modules.
