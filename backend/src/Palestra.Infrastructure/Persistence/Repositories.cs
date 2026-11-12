using Microsoft.EntityFrameworkCore;
using Palestra.Application.Auth;
using Palestra.Domain.Auth;

namespace Palestra.Infrastructure.Persistence;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string normalizedEmail, CancellationToken ct = default)
        => db.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public async Task AddAsync(User user, CancellationToken ct = default) => await db.Users.AddAsync(user, ct);
}

public class PasswordTokenRepository(AppDbContext db) : IPasswordTokenRepository
{
    public Task<PasswordToken?> GetByHashAsync(string tokenHash, CancellationToken ct = default)
        => db.PasswordTokens.FirstOrDefaultAsync(t => t.TokenHash == tokenHash, ct);

    public async Task<IReadOnlyList<PasswordToken>> GetUsableByUserAsync(Guid userId, DateTimeOffset now, CancellationToken ct = default)
        => await db.PasswordTokens.Where(t => t.UserId == userId && t.UsedAt == null && t.ExpiresAt > now).ToListAsync(ct);

    public async Task AddAsync(PasswordToken token, CancellationToken ct = default) => await db.PasswordTokens.AddAsync(token, ct);
}

public class LoginAttemptRepository(AppDbContext db) : ILoginAttemptRepository
{
    public Task<LoginAttempt?> GetAsync(string normalizedEmail, CancellationToken ct = default)
        => db.LoginAttempts.FirstOrDefaultAsync(a => a.Email == normalizedEmail, ct);

    public async Task AddAsync(LoginAttempt attempt, CancellationToken ct = default) => await db.LoginAttempts.AddAsync(attempt, ct);

    public void Remove(LoginAttempt attempt) => db.LoginAttempts.Remove(attempt);
}
