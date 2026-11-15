using System.Reflection;
using System.Text.Json;

namespace Palestra.Infrastructure.Persistence.Seed;

public record SeedAvatar(int Skin, string Hair, int HairColor, string Accessory, int Bg, int Shirt);
public record SeedOccupation(string Title, string Company, string Start, string? End, string? Description);
public record SeedEducation(string Institution, string Course, string Level, string Start, string? End, string? Description);
public record SeedCourse(string Name, string Institution, int Hours, string Start, string? End);

public record SeedUser(
    int N, string FirstName, string LastName, string Email, string Bio, SeedAvatar Avatar,
    List<SeedOccupation> Occupations, List<SeedEducation> Educations, List<SeedCourse> Courses)
{
    public Guid Id => TestUserSeedData.UserId(N);
}

/// <summary>Spec 006: lê os 100 usuários de teste e seus avatares, embutidos como recurso (Persistence/Seed/TestUsers).</summary>
public static class TestUserSeedData
{
    public const string Password = "senha123";
    public const string Domain = "exemplo.com";
    public static readonly DateTimeOffset CreatedAt = new(2026, 11, 1, 0, 0, 0, TimeSpan.Zero);

    private static readonly JsonSerializerOptions Json = new() { PropertyNameCaseInsensitive = true };
    private sealed record Root(List<SeedUser> Users);

    public static Guid UserId(int n) => new($"00000000-0000-4000-8000-{n:D12}");

    /// <summary>Id estável de um item de perfil (kind: 1 ocupação, 2 formação, 3 curso; index a partir de 0).</summary>
    public static Guid ItemId(int n, int kind, int index) => new($"00000000-0000-4000-{kind:D4}-{n * 10 + index:D12}");

    public static IReadOnlyList<SeedUser> Load()
    {
        using var stream = Resource("Seed.users.json");
        return JsonSerializer.Deserialize<Root>(stream, Json)!.Users;
    }

    public static byte[] Photo(int n)
    {
        using var stream = Resource($"Seed.photos.{n:D3}.png");
        using var ms = new MemoryStream();
        stream.CopyTo(ms);
        return ms.ToArray();
    }

    private static Stream Resource(string name)
        => typeof(TestUserSeedData).Assembly.GetManifestResourceStream(name)
           ?? throw new InvalidOperationException($"Recurso embutido não encontrado: {name}");
}
