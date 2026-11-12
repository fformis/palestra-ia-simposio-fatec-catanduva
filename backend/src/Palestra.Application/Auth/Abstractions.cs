using Palestra.Domain.Auth;

namespace Palestra.Application.Auth;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string normalizedEmail, CancellationToken ct = default);
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
}

public interface IPasswordTokenRepository
{
    Task<PasswordToken?> GetByHashAsync(string tokenHash, CancellationToken ct = default);
    Task<IReadOnlyList<PasswordToken>> GetUsableByUserAsync(Guid userId, DateTimeOffset now, CancellationToken ct = default);
    Task AddAsync(PasswordToken token, CancellationToken ct = default);
}

public interface ILoginAttemptRepository
{
    Task<LoginAttempt?> GetAsync(string normalizedEmail, CancellationToken ct = default);
    Task AddAsync(LoginAttempt attempt, CancellationToken ct = default);
    void Remove(LoginAttempt attempt);
}

public interface IUnitOfWork
{
    Task SaveChangesAsync(CancellationToken ct = default);
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface ITokenGenerator
{
    /// <summary>Gera um token aleatório; <c>Hash</c> é o que se guarda no banco.</summary>
    (string Token, string Hash) Generate();
    string Hash(string token);
}

public interface IEmailSender
{
    Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default);
}

public interface IClock
{
    DateTimeOffset UtcNow { get; }
}
