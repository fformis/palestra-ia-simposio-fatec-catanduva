namespace Palestra.Application.Auth;

public class AuthOptions
{
    public int LinkValidityHours { get; set; } = 24;
    public int SessionMinutes { get; set; } = 120;
    public int MaxFailedAttempts { get; set; } = 3;
    public int LockoutMinutes { get; set; } = 15;
    public int MinPasswordLength { get; set; } = 8;
}

public class FrontendOptions
{
    public string BaseUrl { get; set; } = "http://localhost:5173";
}
