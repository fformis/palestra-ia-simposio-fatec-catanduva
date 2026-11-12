namespace Palestra.Domain.Auth;

public class LoginAttempt
{
    private LoginAttempt() { }

    public string Email { get; private set; } = "";
    public int FailedCount { get; private set; }
    public DateTimeOffset? LockedUntil { get; private set; }

    public static LoginAttempt For(string normalizedEmail) => new() { Email = normalizedEmail };

    public bool IsLocked(DateTimeOffset now) => LockedUntil is { } until && now < until;

    public void RegisterFailure(DateTimeOffset now, int maxAttempts, TimeSpan lockout)
    {
        if (LockedUntil is not null && now >= LockedUntil)
        {
            LockedUntil = null;
            FailedCount = 0;
        }

        FailedCount++;
        if (FailedCount >= maxAttempts)
        {
            LockedUntil = now + lockout;
            FailedCount = 0;
        }
    }

    public void Reset()
    {
        FailedCount = 0;
        LockedUntil = null;
    }
}
