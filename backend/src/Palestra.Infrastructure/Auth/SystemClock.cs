using Palestra.Application.Auth;

namespace Palestra.Infrastructure.Auth;

public class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
