namespace Palestra.Domain.Auth;

public class PasswordToken
{
    private PasswordToken() { }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string TokenHash { get; private set; } = "";
    public TokenPurpose Purpose { get; private set; }
    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset? UsedAt { get; private set; }

    public static PasswordToken Create(Guid userId, string tokenHash, TokenPurpose purpose, DateTimeOffset expiresAt) => new()
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        TokenHash = tokenHash,
        Purpose = purpose,
        ExpiresAt = expiresAt,
    };

    public bool IsUsable(DateTimeOffset now) => UsedAt is null && now < ExpiresAt;

    public void MarkUsed(DateTimeOffset now) => UsedAt ??= now;
}
