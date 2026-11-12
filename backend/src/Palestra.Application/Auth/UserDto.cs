using Palestra.Domain.Auth;

namespace Palestra.Application.Auth;

public record UserDto(Guid Id, string FirstName, string LastName, string Email)
{
    public static UserDto From(User u) => new(u.Id, u.FirstName, u.LastName, u.Email);
}
