using Palestra.Application.Auth;
using Palestra.Domain.Auth;
using Palestra.Infrastructure.Auth;

namespace Palestra.Tests.Auth;

public class FakeClock : IClock
{
    public DateTimeOffset UtcNow { get; set; } = new(2026, 11, 11, 12, 0, 0, TimeSpan.Zero);
}

public class FakeEmail : IEmailSender
{
    public List<(string To, string Subject, string Body)> Sent { get; } = [];
    public Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        Sent.Add((to, subject, htmlBody));
        return Task.CompletedTask;
    }
}

public class FakeHasher : IPasswordHasher
{
    public string Hash(string password) => "hash:" + password;
    public bool Verify(string password, string hash) => hash == "hash:" + password;
}

public class Store : IUserRepository, IPasswordTokenRepository, ILoginAttemptRepository, IUnitOfWork
{
    public List<User> Users { get; } = [];
    public List<PasswordToken> Tokens { get; } = [];
    public Dictionary<string, LoginAttempt> Attempts { get; } = [];

    public Task<User?> GetByEmailAsync(string e, CancellationToken ct = default) => Task.FromResult(Users.FirstOrDefault(u => u.Email == e));
    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) => Task.FromResult(Users.FirstOrDefault(u => u.Id == id));
    public Task AddAsync(User u, CancellationToken ct = default) { Users.Add(u); return Task.CompletedTask; }

    public Task<PasswordToken?> GetByHashAsync(string h, CancellationToken ct = default) => Task.FromResult(Tokens.FirstOrDefault(t => t.TokenHash == h));
    public Task<IReadOnlyList<PasswordToken>> GetUsableByUserAsync(Guid id, DateTimeOffset now, CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<PasswordToken>>(Tokens.Where(t => t.UserId == id && t.IsUsable(now)).ToList());
    public Task AddAsync(PasswordToken t, CancellationToken ct = default) { Tokens.Add(t); return Task.CompletedTask; }

    public Task<LoginAttempt?> GetAsync(string e, CancellationToken ct = default) => Task.FromResult(Attempts.GetValueOrDefault(e));
    public Task AddAsync(LoginAttempt a, CancellationToken ct = default) { Attempts[a.Email] = a; return Task.CompletedTask; }
    public void Remove(LoginAttempt a) => Attempts.Remove(a.Email);

    public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;
}

public class Harness
{
    public Store Store { get; } = new();
    public FakeClock Clock { get; } = new();
    public FakeEmail Email { get; } = new();
    public AuthOptions Auth { get; } = new();
    public FrontendOptions Frontend { get; } = new();
    public TokenGenerator Tokens { get; } = new();
    public FakeHasher Hasher { get; } = new();

    public PasswordLinkIssuer Links => new(Store, Tokens, Clock, Auth, Frontend);
    public RegisterUser Register => new(Store, Links, Email, Store, Clock, Auth, Frontend);
    public SetPassword SetPassword => new(Store, Store, Store, Tokens, Hasher, Store, Clock, Auth);
    public ValidatePasswordLink Validate => new(Store, Tokens, Clock);
    public ForgotPassword Forgot => new(Store, Links, Email, Store, Auth);
    public Login Login => new(Store, Store, Hasher, Store, Clock, Auth);

    /// <summary>Extrai o token do último e-mail enviado.</summary>
    public string LastToken()
    {
        var body = Email.Sent[^1].Body;
        var i = body.IndexOf("token=", StringComparison.Ordinal) + 6;
        return body[i..body.IndexOf('"', i)];
    }

    public async Task<string> ActiveUser(string email = "ana@x.com", string password = "senha1234")
    {
        await Register.ExecuteAsync("Ana", "Silva", email);
        await SetPassword.ExecuteAsync(LastToken(), password);
        Email.Sent.Clear();
        return email;
    }
}
