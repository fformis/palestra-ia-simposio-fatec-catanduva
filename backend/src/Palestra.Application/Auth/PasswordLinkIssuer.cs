using Palestra.Domain.Auth;

namespace Palestra.Application.Auth;

/// <summary>Gera um novo link de senha e invalida os pendentes da conta (RF-16).</summary>
public class PasswordLinkIssuer(
    IPasswordTokenRepository tokens, ITokenGenerator generator, IClock clock,
    AuthOptions auth, FrontendOptions frontend)
{
    public async Task<string> IssueAsync(User user, TokenPurpose purpose, CancellationToken ct = default)
    {
        var now = clock.UtcNow;
        foreach (var pending in await tokens.GetUsableByUserAsync(user.Id, now, ct))
            pending.MarkUsed(now);

        var (token, hash) = generator.Generate();
        await tokens.AddAsync(PasswordToken.Create(user.Id, hash, purpose, now.AddHours(auth.LinkValidityHours)), ct);
        return $"{frontend.BaseUrl.TrimEnd('/')}/definir-senha?token={token}";
    }
}
