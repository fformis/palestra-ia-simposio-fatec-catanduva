using Palestra.Domain.Auth;

namespace Palestra.Application.Auth;

public class ForgotPassword(
    IUserRepository users, PasswordLinkIssuer links, IEmailSender email, IUnitOfWork uow, AuthOptions auth)
{
    /// <returns><c>false</c> se o e-mail tem formato inválido; <c>true</c> em qualquer outro caso (RF-14).</returns>
    public async Task<bool> ExecuteAsync(string? emailAddress, CancellationToken ct = default)
    {
        if (!Validation.IsValidEmail(emailAddress)) return false;

        var user = await users.GetByEmailAsync(User.NormalizeEmail(emailAddress!), ct);
        if (user is not { Status: UserStatus.Active }) return true;

        var link = await links.IssueAsync(user, TokenPurpose.Reset, ct);
        await uow.SaveChangesAsync(ct);
        var (subject, body) = AuthEmails.ResetPassword(user.FirstName, link, auth.LinkValidityHours);
        await email.SendAsync(user.Email, subject, body, ct);
        return true;
    }
}
