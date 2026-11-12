using Palestra.Domain.Auth;

namespace Palestra.Application.Auth;

public record RegisterResult(bool Accepted, IReadOnlyDictionary<string, string>? Errors = null);

public class RegisterUser(
    IUserRepository users, PasswordLinkIssuer links, IEmailSender email, IUnitOfWork uow,
    IClock clock, AuthOptions auth, FrontendOptions frontend)
{
    public async Task<RegisterResult> ExecuteAsync(string? firstName, string? lastName, string? emailAddress, CancellationToken ct = default)
    {
        var errors = new Dictionary<string, string>();
        if (string.IsNullOrWhiteSpace(firstName) || firstName.Trim().Length > 100) errors["firstName"] = "required";
        if (string.IsNullOrWhiteSpace(lastName) || lastName.Trim().Length > 100) errors["lastName"] = "required";
        if (string.IsNullOrWhiteSpace(emailAddress)) errors["email"] = "required";
        else if (!Validation.IsValidEmail(emailAddress)) errors["email"] = "invalid";
        if (errors.Count > 0) return new RegisterResult(false, errors);

        var normalized = User.NormalizeEmail(emailAddress!);
        var user = await users.GetByEmailAsync(normalized, ct);

        if (user is { Status: UserStatus.Active })
        {
            var baseUrl = frontend.BaseUrl.TrimEnd('/');
            var (s, b) = AuthEmails.AccountExists(user.FirstName, $"{baseUrl}/entrar", $"{baseUrl}/esqueci-senha");
            await email.SendAsync(user.Email, s, b, ct);
            return new RegisterResult(true);
        }

        if (user is null)
        {
            user = User.Register(firstName!, lastName!, normalized, clock.UtcNow);
            await users.AddAsync(user, ct);
        }
        else
        {
            user.UpdateName(firstName!, lastName!);
        }

        var link = await links.IssueAsync(user, TokenPurpose.Activation, ct);
        await uow.SaveChangesAsync(ct);
        var (subject, body) = AuthEmails.CreatePassword(user.FirstName, link, auth.LinkValidityHours);
        await email.SendAsync(user.Email, subject, body, ct);
        return new RegisterResult(true);
    }
}
