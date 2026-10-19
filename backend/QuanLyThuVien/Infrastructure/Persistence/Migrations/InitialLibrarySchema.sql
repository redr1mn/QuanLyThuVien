IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [AspNetRoles] (
        [Id] nvarchar(450) NOT NULL,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(120) NOT NULL,
        [Slug] nvarchar(140) NOT NULL,
        [IsActive] bit NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [Members] (
        [Id] int NOT NULL IDENTITY,
        [CardNumber] nvarchar(40) NOT NULL,
        [FullName] nvarchar(200) NOT NULL,
        [Email] nvarchar(320) NULL,
        [Phone] nvarchar(30) NULL,
        [Address] nvarchar(500) NULL,
        [MemberType] nvarchar(50) NOT NULL,
        [IssuedAtUtc] datetimeoffset NOT NULL,
        [ExpiresAtUtc] datetimeoffset NOT NULL,
        [Status] int NOT NULL,
        [MaxBooks] int NOT NULL,
        CONSTRAINT [PK_Members] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [AspNetRoleClaims] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [Books] (
        [Id] int NOT NULL IDENTITY,
        [Isbn] nvarchar(20) NULL,
        [Title] nvarchar(300) NOT NULL,
        [Author] nvarchar(200) NOT NULL,
        [Publisher] nvarchar(200) NULL,
        [PublishYear] int NULL,
        [Description] nvarchar(4000) NULL,
        [CoverImage] nvarchar(1000) NULL,
        [ReplacementPrice] decimal(18,2) NOT NULL,
        [CategoryId] int NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NOT NULL,
        CONSTRAINT [PK_Books] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Books_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [AspNetUsers] (
        [Id] nvarchar(450) NOT NULL,
        [MemberId] int NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NOT NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUsers_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [BookCopies] (
        [Id] int NOT NULL IDENTITY,
        [BookId] int NOT NULL,
        [Barcode] nvarchar(80) NOT NULL,
        [ShelfLocation] nvarchar(80) NOT NULL,
        [Status] int NOT NULL,
        [AcquiredAtUtc] datetimeoffset NOT NULL,
        CONSTRAINT [PK_BookCopies] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_BookCopies_Books_BookId] FOREIGN KEY ([BookId]) REFERENCES [Books] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [Reservations] (
        [Id] bigint NOT NULL IDENTITY,
        [MemberId] int NOT NULL,
        [BookId] int NOT NULL,
        [Status] int NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [ExpiresAtUtc] datetimeoffset NULL,
        [FulfilledAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_Reservations] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Reservations_Books_BookId] FOREIGN KEY ([BookId]) REFERENCES [Books] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Reservations_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [AspNetUserClaims] (
        [Id] int NOT NULL IDENTITY,
        [UserId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [AspNetUserLogins] (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [AspNetUserRoles] (
        [UserId] nvarchar(450) NOT NULL,
        [RoleId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [AspNetUserTokens] (
        [UserId] nvarchar(450) NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [Loans] (
        [Id] bigint NOT NULL IDENTITY,
        [MemberId] int NOT NULL,
        [ProcessedByUserId] nvarchar(450) NULL,
        [BorrowedAtUtc] datetimeoffset NOT NULL,
        [DueAtUtc] datetimeoffset NOT NULL,
        [ReturnedAtUtc] datetimeoffset NULL,
        [Status] int NOT NULL,
        CONSTRAINT [PK_Loans] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Loans_AspNetUsers_ProcessedByUserId] FOREIGN KEY ([ProcessedByUserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Loans_Members_MemberId] FOREIGN KEY ([MemberId]) REFERENCES [Members] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [LoanItems] (
        [Id] bigint NOT NULL IDENTITY,
        [LoanId] bigint NOT NULL,
        [BookCopyId] int NOT NULL,
        [ReturnedAtUtc] datetimeoffset NULL,
        [ReturnCondition] nvarchar(80) NULL,
        CONSTRAINT [PK_LoanItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_LoanItems_BookCopies_BookCopyId] FOREIGN KEY ([BookCopyId]) REFERENCES [BookCopies] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_LoanItems_Loans_LoanId] FOREIGN KEY ([LoanId]) REFERENCES [Loans] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE TABLE [Fines] (
        [Id] bigint NOT NULL IDENTITY,
        [LoanId] bigint NOT NULL,
        [LoanItemId] bigint NULL,
        [Amount] decimal(18,2) NOT NULL,
        [DailyRate] decimal(18,2) NOT NULL,
        [DaysOverdue] int NOT NULL,
        [Reason] nvarchar(300) NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [PaidAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_Fines] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Fines_LoanItems_LoanItemId] FOREIGN KEY ([LoanItemId]) REFERENCES [LoanItems] ([Id]),
        CONSTRAINT [FK_Fines_Loans_LoanId] FOREIGN KEY ([LoanId]) REFERENCES [Loans] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_AspNetUsers_MemberId] ON [AspNetUsers] ([MemberId]) WHERE [MemberId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_BookCopies_Barcode] ON [BookCopies] ([Barcode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_BookCopies_BookId_Status] ON [BookCopies] ([BookId], [Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Books_CategoryId] ON [Books] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Books_Isbn] ON [Books] ([Isbn]) WHERE [Isbn] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Books_Title_Author] ON [Books] ([Title], [Author]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Categories_Name] ON [Categories] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Categories_Slug] ON [Categories] ([Slug]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Fines_LoanId_PaidAtUtc] ON [Fines] ([LoanId], [PaidAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Fines_LoanItemId] ON [Fines] ([LoanItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_LoanItems_BookCopyId] ON [LoanItems] ([BookCopyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_LoanItems_LoanId_BookCopyId] ON [LoanItems] ([LoanId], [BookCopyId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Loans_DueAtUtc] ON [Loans] ([DueAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Loans_MemberId_Status] ON [Loans] ([MemberId], [Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Loans_ProcessedByUserId] ON [Loans] ([ProcessedByUserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Members_CardNumber] ON [Members] ([CardNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Members_Email] ON [Members] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Members_Status] ON [Members] ([Status]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    CREATE INDEX [IX_Reservations_BookId_CreatedAtUtc] ON [Reservations] ([BookId], [CreatedAtUtc]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_Reservations_MemberId_BookId_Status] ON [Reservations] ([MemberId], [BookId], [Status]) WHERE [Status] = 0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261018150935_InitialLibrarySchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261018150935_InitialLibrarySchema', N'10.0.0');
END;

COMMIT;
GO

