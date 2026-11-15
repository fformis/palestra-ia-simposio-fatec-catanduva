using System.Security.Cryptography;
using Palestra.Domain.Profiles;
using Palestra.Infrastructure.Auth;
using Palestra.Infrastructure.Persistence.Seed;

namespace Palestra.Tests.SeedTestUsers;

public class SeedTestUsersTests
{
    private static readonly IReadOnlyList<SeedUser> Users = TestUserSeedData.Load();
    private static readonly DateOnly Month = new(2026, 11, 1);

    [Fact]
    public void Conjunto_tem_100_usuarios_unicos_do_dominio_de_teste()
    {
        Assert.Equal(100, Users.Count);
        Assert.Equal(100, Users.Select(u => u.Email).Distinct().Count());
        Assert.Equal(100, Users.Select(u => (u.FirstName, u.LastName)).Distinct().Count());
        Assert.All(Users, u => Assert.EndsWith("@" + TestUserSeedData.Domain, u.Email));
    }

    [Fact]
    public void Cada_usuario_tem_avatar_png_valido_e_distinto()
    {
        var hashes = Users.Select(u =>
        {
            var bytes = TestUserSeedData.Photo(u.N);
            Assert.Equal("image/png", ImageSignature.Detect(bytes));
            Assert.True(bytes.Length <= 2 * 1024 * 1024);
            return Convert.ToHexString(SHA256.HashData(bytes));
        });
        Assert.Equal(100, hashes.Distinct().Count());
    }

    [Fact]
    public void Perfis_tem_bio_unica_e_contagens_da_spec()
    {
        Assert.Equal(100, Users.Select(u => u.Bio).Distinct().Count());
        Assert.All(Users, u =>
        {
            Assert.InRange(u.Bio.Length, 1, 500);
            Assert.InRange(u.Occupations.Count, 2, 5);
            Assert.InRange(u.Educations.Count, 1, 3);
            Assert.InRange(u.Courses.Count, 2, 6);
        });
    }

    [Fact]
    public void Todos_os_itens_passam_pelas_validacoes_do_dominio()
    {
        foreach (var u in Users)
        {
            foreach (var o in u.Occupations)
                Assert.Empty(Occupation.New(u.Id).Update(o.Title, o.Company, o.Start, o.End, o.Description, Month));
            foreach (var e in u.Educations)
                Assert.Empty(Education.New(u.Id).Update(e.Institution, e.Course, e.Level, e.Start, e.End, e.Description, Month));
            foreach (var c in u.Courses)
                Assert.Empty(Course.New(u.Id).Update(c.Name, c.Institution, c.Hours, c.Start, c.End, Month));
        }
    }

    [Fact]
    public void Conjunto_cobre_os_casos_de_variedade()
    {
        Assert.Contains(Users, u => u.Occupations.All(o => o.End is not null));                       // sem ocupação atual
        Assert.Contains(Users, u => u.Educations.Any(e => e.End is null));                            // formação em andamento
        Assert.Contains(Users, u => Months(u.Occupations.Min(o => o.Start)!) <= Months("2016-10"));    // > 10 anos
        Assert.Contains(Users, u => u.Occupations.Any(o => o.Description is null));                   // sem descrição
        Assert.Contains(Users, u => u.Occupations.Any(o => o.Description is not null));               // com descrição
        Assert.True(Users.Select(u => u.Avatar.Skin).Distinct().Count() >= 6);
    }

    [Fact]
    public void Guids_fixos_sao_unicos_entre_usuarios_e_itens()
    {
        var ids = Users.SelectMany(u => new[] { u.Id }
            .Concat(u.Occupations.Select((_, i) => TestUserSeedData.ItemId(u.N, 1, i)))
            .Concat(u.Educations.Select((_, i) => TestUserSeedData.ItemId(u.N, 2, i)))
            .Concat(u.Courses.Select((_, i) => TestUserSeedData.ItemId(u.N, 3, i)))).ToList();
        Assert.Equal(ids.Count, ids.Distinct().Count());
    }

    [Fact]
    public void Senha_de_teste_confere_com_o_hash_do_login()
    {
        var hasher = new Pbkdf2PasswordHasher();
        Assert.True(hasher.Verify(TestUserSeedData.Password, hasher.Hash(TestUserSeedData.Password)));
    }

    private static int Months(string ym) => int.Parse(ym[..4]) * 12 + int.Parse(ym[5..]);
}
