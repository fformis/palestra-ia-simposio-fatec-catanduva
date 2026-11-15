using System;
using System.Linq;
using Microsoft.EntityFrameworkCore.Migrations;
using Palestra.Infrastructure.Auth;
using Palestra.Infrastructure.Persistence.Seed;

#nullable disable

namespace Palestra.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// Spec 006: carga de 100 usuários de teste (TI) com perfil completo. Só dados, sem mudança de esquema.
    /// Usa nomes literais de tabelas/colunas para não depender das entidades do Domain.
    /// </summary>
    public partial class SeedTestUsers : Migration
    {
        private const string Text = "text", Uuid = "uuid", Date = "date", Int = "integer";

        // Valores gravados por EF para EducationLevel (conversão para string do enum).
        private static readonly System.Collections.Generic.Dictionary<string, string> Levels = new()
        {
            ["fundamental"] = "Fundamental", ["medio"] = "Medio", ["tecnico"] = "Tecnico", ["superior"] = "Superior",
            ["pos_mba"] = "PosMba", ["mestrado"] = "Mestrado", ["doutorado"] = "Doutorado",
        };

        private static DateOnly Month(string ym) => new(int.Parse(ym[..4]), int.Parse(ym[5..]), 1);
        private static DateOnly? MonthOrNull(string ym) => ym is null ? null : Month(ym);

        private static void Insert(MigrationBuilder b, string table, string[] cols, string[] types, System.Collections.Generic.List<object[]> rows)
        {
            var values = new object[rows.Count, cols.Length];
            for (var r = 0; r < rows.Count; r++)
                for (var c = 0; c < cols.Length; c++) values[r, c] = rows[r][c];
            b.InsertData(table, cols, types, values);
        }

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var users = TestUserSeedData.Load();

            // Idempotência: remove (com perfil, foto e itens, por cascata) quem já existir com os mesmos e-mails.
            DeleteSeed(migrationBuilder, users);

            // Um único hash de "senha123" para os 100 usuários (conta já ativa).
            var hash = new Pbkdf2PasswordHasher().Hash(TestUserSeedData.Password);
            var created = TestUserSeedData.CreatedAt;

            Insert(migrationBuilder, "users",
                ["Id", "FirstName", "LastName", "Email", "PasswordHash", "Status", "CreatedAt"],
                [Uuid, Text, Text, Text, Text, Text, "timestamp with time zone"],
                users.Select(u => new object[] { u.Id, u.FirstName, u.LastName, u.Email, hash, "Active", created }).ToList());

            Insert(migrationBuilder, "profiles",
                ["UserId", "Bio", "PhotoVersion"],
                [Uuid, Text, "timestamp with time zone"],
                users.Select(u => new object[] { u.Id, u.Bio, created }).ToList());

            Insert(migrationBuilder, "profile_photos",
                ["UserId", "ContentType", "Content"],
                [Uuid, Text, "bytea"],
                users.Select(u => new object[] { u.Id, "image/png", TestUserSeedData.Photo(u.N) }).ToList());

            Insert(migrationBuilder, "occupations",
                ["Id", "UserId", "Title", "Company", "Start", "End", "Description"],
                [Uuid, Uuid, Text, Text, Date, Date, Text],
                users.SelectMany(u => u.Occupations.Select((o, i) => new object[]
                    { TestUserSeedData.ItemId(u.N, 1, i), u.Id, o.Title, o.Company, Month(o.Start), MonthOrNull(o.End), o.Description })).ToList());

            Insert(migrationBuilder, "educations",
                ["Id", "UserId", "Institution", "Course", "Level", "Start", "End", "Description"],
                [Uuid, Uuid, Text, Text, Text, Date, Date, Text],
                users.SelectMany(u => u.Educations.Select((e, i) => new object[]
                    { TestUserSeedData.ItemId(u.N, 2, i), u.Id, e.Institution, e.Course, Levels[e.Level], Month(e.Start), MonthOrNull(e.End), e.Description })).ToList());

            Insert(migrationBuilder, "courses",
                ["Id", "UserId", "Name", "Institution", "Hours", "Start", "End"],
                [Uuid, Uuid, Text, Text, Int, Date, Date],
                users.SelectMany(u => u.Courses.Select((c, i) => new object[]
                    { TestUserSeedData.ItemId(u.N, 3, i), u.Id, c.Name, c.Institution, c.Hours, Month(c.Start), MonthOrNull(c.End) })).ToList());
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
            => DeleteSeed(migrationBuilder, TestUserSeedData.Load());

        private static void DeleteSeed(MigrationBuilder migrationBuilder, System.Collections.Generic.IReadOnlyList<SeedUser> users)
            => migrationBuilder.DeleteData("users", "Email", users.Select(u => (object)u.Email).ToArray());
    }
}
