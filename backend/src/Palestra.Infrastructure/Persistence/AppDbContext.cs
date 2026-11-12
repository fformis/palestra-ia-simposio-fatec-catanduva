using Microsoft.EntityFrameworkCore;
using Palestra.Application.Auth;
using Palestra.Domain.Auth;
using Palestra.Domain.Profiles;

namespace Palestra.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();
    public DbSet<PasswordToken> PasswordTokens => Set<PasswordToken>();
    public DbSet<LoginAttempt> LoginAttempts => Set<LoginAttempt>();
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<ProfilePhoto> ProfilePhotos => Set<ProfilePhoto>();
    public DbSet<Occupation> Occupations => Set<Occupation>();
    public DbSet<Education> Educations => Set<Education>();
    public DbSet<Course> Courses => Set<Course>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

    Task IUnitOfWork.SaveChangesAsync(CancellationToken ct) => SaveChangesAsync(ct);
}
