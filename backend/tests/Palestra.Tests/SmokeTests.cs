using Microsoft.EntityFrameworkCore;
using Palestra.Infrastructure.Persistence;

namespace Palestra.Tests;

public class SmokeTests
{
    [Fact]
    public void DbContext_usa_provider_postgres()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql("Host=x").Options;
        using var db = new AppDbContext(options);
        Assert.Equal("Npgsql.EntityFrameworkCore.PostgreSQL", db.Database.ProviderName);
    }
}
