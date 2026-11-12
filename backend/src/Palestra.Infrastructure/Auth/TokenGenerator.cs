using System.Buffers.Text;
using System.Security.Cryptography;
using System.Text;
using Palestra.Application.Auth;

namespace Palestra.Infrastructure.Auth;

public class TokenGenerator : ITokenGenerator
{
    public (string Token, string Hash) Generate()
    {
        var token = Base64Url.EncodeToString(RandomNumberGenerator.GetBytes(32));
        return (token, Hash(token));
    }

    public string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token))).ToLowerInvariant();
}
