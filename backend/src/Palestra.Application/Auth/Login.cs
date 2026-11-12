using Palestra.Domain.Auth;

namespace Palestra.Application.Auth;

public enum LoginOutcome { Success, InvalidCredentials, Pending, Locked }

public record LoginResult(LoginOutcome Outcome, UserDto? User = null, int RetryAfterSeconds = 0);

public class Login(
    IUserRepository users, ILoginAttemptRepository attempts, IPasswordHasher hasher,
    IUnitOfWork uow, IClock clock, AuthOptions auth)
{
    public async Task<LoginResult> ExecuteAsync(string? emailAddress, string? password, CancellationToken ct = default)
    {
        var now = clock.UtcNow;
        var email = User.NormalizeEmail(emailAddress ?? "");
        var attempt = await attempts.GetAsync(email, ct);

        if (attempt is not null && attempt.IsLocked(now))
            return Locked(attempt, now);

        var user = await users.GetByEmailAsync(email, ct);
        if (user is { Status: UserStatus.Pending })
            return new LoginResult(LoginOutcome.Pending);

        if (user?.PasswordHash is null || password is null || !hasher.Verify(password, user.PasswordHash))
        {
            if (attempt is null)
            {
                attempt = LoginAttempt.For(email);
                await attempts.AddAsync(attempt, ct);
            }
            attempt.RegisterFailure(now, auth.MaxFailedAttempts, TimeSpan.FromMinutes(auth.LockoutMinutes));
            await uow.SaveChangesAsync(ct);
            return attempt.IsLocked(now) ? Locked(attempt, now) : new LoginResult(LoginOutcome.InvalidCredentials);
        }

        if (attempt is not null)
        {
            attempts.Remove(attempt);
            await uow.SaveChangesAsync(ct);
        }
        return new LoginResult(LoginOutcome.Success, UserDto.From(user));
    }

    private static LoginResult Locked(LoginAttempt attempt, DateTimeOffset now) =>
        new(LoginOutcome.Locked, RetryAfterSeconds: (int)Math.Ceiling((attempt.LockedUntil!.Value - now).TotalSeconds));
}

public class GetCurrentUser(IUserRepository users)
{
    public async Task<UserDto?> ExecuteAsync(Guid id, CancellationToken ct = default)
    {
        var user = await users.GetByIdAsync(id, ct);
        return user is null ? null : UserDto.From(user);
    }
}
