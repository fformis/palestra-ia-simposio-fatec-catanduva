using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Palestra.Infrastructure.Persistence;

namespace Palestra.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
        => services.AddDbContext<AppDbContext>(o => o.UseNpgsql(config.GetConnectionString("Default")));
}
