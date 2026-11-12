using System.Net.Mail;
using Palestra.Application.Auth;

namespace Palestra.Infrastructure.Auth;

public class SmtpOptions
{
    public string Host { get; set; } = "smtp4dev";
    public int Port { get; set; } = 25;
    public string FromAddress { get; set; } = "palestra@exemplo.com.br";
    public string FromName { get; set; } = "Palestra";
}

public class SmtpEmailSender(SmtpOptions options) : IEmailSender
{
    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        using var client = new SmtpClient(options.Host, options.Port);
        using var message = new MailMessage
        {
            From = new MailAddress(options.FromAddress, options.FromName),
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true,
        };
        message.To.Add(to);
        await client.SendMailAsync(message, ct);
    }
}
