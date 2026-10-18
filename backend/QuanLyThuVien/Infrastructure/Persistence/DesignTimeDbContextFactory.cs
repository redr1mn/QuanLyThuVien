using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace QuanLyThuVien.Infrastructure.Persistence;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<LibraryDbContext>
{
    public LibraryDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("LIBRARY_DB_CONNECTION");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Set LIBRARY_DB_CONNECTION before running an EF Core migration command.");
        }

        var options = new DbContextOptionsBuilder<LibraryDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new LibraryDbContext(options);
    }
}
