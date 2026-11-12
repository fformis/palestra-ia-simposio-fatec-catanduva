namespace Palestra.Domain.Auth;

public class User
{
    private User() { }

    public Guid Id { get; private set; }
    public string FirstName { get; private set; } = "";
    public string LastName { get; private set; } = "";
    public string Email { get; private set; } = "";
    public string? PasswordHash { get; private set; }
    public UserStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    public static User Register(string firstName, string lastName, string email, DateTimeOffset now) => new()
    {
        Id = Guid.NewGuid(),
        FirstName = firstName.Trim(),
        LastName = lastName.Trim(),
        Email = NormalizeEmail(email),
        Status = UserStatus.Pending,
        CreatedAt = now,
    };

    public void UpdateName(string firstName, string lastName)
    {
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
    }

    public void SetPassword(string passwordHash)
    {
        PasswordHash = passwordHash;
        Status = UserStatus.Active;
    }
}
