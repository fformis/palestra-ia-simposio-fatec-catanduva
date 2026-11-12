using Palestra.Domain.Auth;

namespace Palestra.Application.Auth;

public enum SetPasswordResult { Success, WeakPassword, InvalidLink }

public class ValidatePasswordLink(IPasswordTokenRepository tokens, ITokenGenerator generator, IClock clock)
{
    /// <returns>A finalidade do link, ou <c>null</c> se inválido (usado, expirado ou inexistente).</returns>
    public async Task<TokenPurpose?> ExecuteAsync(string? token, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;
        var t = await tokens.GetByHashAsync(generator.Hash(token), ct);
        return t is not null && t.IsUsable(clock.UtcNow) ? t.Purpose : null;
    }
}

public class SetPassword(
    IPasswordTokenRepository tokens, IUserRepository users, ILoginAttemptRepository attempts,
    ITokenGenerator generator, IPasswordHasher hasher, IUnitOfWork uow, IClock clock, AuthOptions auth)
{
    public async Task<SetPasswordResult> ExecuteAsync(string? token, string? password, CancellationToken ct = default)
    {
        var now = clock.UtcNow;
        var t = string.IsNullOrWhiteSpace(token) ? null : await tokens.GetByHashAsync(generator.Hash(token), ct);
        if (t is null || !t.IsUsable(now)) return SetPasswordResult.InvalidLink;

        if (password is null || password.Length < auth.MinPasswordLength) return SetPasswordResult.WeakPassword;

        var user = await users.GetByIdAsync(t.UserId, ct);
        if (user is null) return SetPasswordResult.InvalidLink;

        user.SetPassword(hasher.Hash(password));
        t.MarkUsed(now);
        var attempt = await attempts.GetAsync(user.Email, ct);
        if (attempt is not null) attempts.Remove(attempt);
        await uow.SaveChangesAsync(ct);
        return SetPasswordResult.Success;
    }
}
