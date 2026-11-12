using System.Text.RegularExpressions;

namespace Palestra.Application.Auth;

internal static partial class Validation
{
    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex EmailRegex();

    public static bool IsValidEmail(string? email) =>
        !string.IsNullOrWhiteSpace(email) && email.Trim().Length <= 254 && EmailRegex().IsMatch(email.Trim());
}
