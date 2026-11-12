using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Palestra.Application.Auth;
using Palestra.Infrastructure.Auth;
using Palestra.Infrastructure.Persistence;

namespace Palestra.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(o => o.UseNpgsql(config.GetConnectionString("Default")));
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddSingleton(config.GetSection("Auth").Get<AuthOptions>() ?? new AuthOptions());
        services.AddSingleton(config.GetSection("Frontend").Get<FrontendOptions>() ?? new FrontendOptions());
        services.AddSingleton(config.GetSection("Smtp").Get<SmtpOptions>() ?? new SmtpOptions());

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPasswordTokenRepository, PasswordTokenRepository>();
        services.AddScoped<ILoginAttemptRepository, LoginAttemptRepository>();
        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddSingleton<ITokenGenerator, TokenGenerator>();
        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        services.AddScoped<PasswordLinkIssuer>();
        services.AddScoped<RegisterUser>();
        services.AddScoped<ValidatePasswordLink>();
        services.AddScoped<SetPassword>();
        services.AddScoped<ForgotPassword>();
        services.AddScoped<Login>();
        services.AddScoped<GetCurrentUser>();
        return services;
    }
}
