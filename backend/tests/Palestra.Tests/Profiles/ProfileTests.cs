using Palestra.Application.Auth;
using Palestra.Application.Profiles;
using Palestra.Domain.Profiles;
using Palestra.Tests.Auth;

namespace Palestra.Tests.Profiles;

public class ProfileStore : IProfileRepository, IUnitOfWork
{
    public List<Profile> Profiles { get; } = [];
    public List<ProfilePhoto> Photos { get; } = [];
    public List<ITimelineItem> Items { get; } = [];

    public Task<Profile?> GetProfileAsync(Guid userId, CancellationToken ct = default) => Task.FromResult(Profiles.FirstOrDefault(p => p.UserId == userId));
    public Task AddAsync(Profile p, CancellationToken ct = default) { Profiles.Add(p); return Task.CompletedTask; }
    public Task<ProfilePhoto?> GetPhotoAsync(Guid userId, CancellationToken ct = default) => Task.FromResult(Photos.FirstOrDefault(p => p.UserId == userId));
    public Task AddAsync(ProfilePhoto p, CancellationToken ct = default) { Photos.Add(p); return Task.CompletedTask; }
    public void Remove(ProfilePhoto p) => Photos.Remove(p);

    public Task<IReadOnlyList<T>> ListAsync<T>(Guid userId, CancellationToken ct = default) where T : class, ITimelineItem
        => Task.FromResult<IReadOnlyList<T>>(Items.OfType<T>().Where(i => i.UserId == userId).ToList());
    public Task<T?> FindAsync<T>(Guid id, Guid userId, CancellationToken ct = default) where T : class, ITimelineItem
        => Task.FromResult(Items.OfType<T>().FirstOrDefault(i => i.Id == id && i.UserId == userId));
    public Task AddItemAsync<T>(T item, CancellationToken ct = default) where T : class, ITimelineItem { Items.Add(item); return Task.CompletedTask; }
    public void RemoveItem<T>(T item) where T : class, ITimelineItem => Items.Remove(item);

    public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;
}

public class ProfileHarness
{
    public static readonly byte[] Png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3];

    public ProfileStore Store { get; } = new();
    public FakeClock Clock { get; } = new(); // 11/2026
    public ProfileOptions Options { get; } = new();
    public Guid Ana { get; } = Guid.NewGuid();
    public Guid Bia { get; } = Guid.NewGuid();

    public GetProfile Get => new(Store);
    public UpdateBio Bio => new(Store, Store, Options);
    public UploadPhoto Upload => new(Store, Store, Clock, Options);
    public RemovePhoto RemovePhoto => new(Store, Store);
    public SaveOccupation Occupation => new(Store, Store, Clock);
    public SaveEducation Education => new(Store, Store, Clock);
    public SaveCourse Course => new(Store, Store, Clock);
    public RemoveItem<Occupation> RemoveOccupation => new(Store, Store);

    public Task<PhotoResult> Send(byte[] bytes) => Upload.ExecuteAsync(Ana, new MemoryStream(bytes), bytes.Length);
    public static OccupationInput Job(string start, string? end = null, string title = "Dev") => new(title, "Acme", start, end, null);
}

public class TimelineTests
{
    [Fact] // RF-07 / RF-17
    public async Task Ocupacoes_vem_da_mais_recente_para_a_mais_antiga()
    {
        var h = new ProfileHarness();
        await h.Occupation.ExecuteAsync(h.Ana, null, ProfileHarness.Job("2019-01", "2020-12", "Antiga"));
        await h.Occupation.ExecuteAsync(h.Ana, null, ProfileHarness.Job("2023-05", title: "Recente"));
        var profile = await h.Get.ExecuteAsync(h.Ana);
        Assert.Equal(["Recente", "Antiga"], profile.Occupations.Select(o => o.Title));
    }

    [Fact] // RF-08 / RF-17
    public async Task Item_sem_termino_e_atual_e_vem_antes_no_empate()
    {
        var h = new ProfileHarness();
        await h.Occupation.ExecuteAsync(h.Ana, null, ProfileHarness.Job("2022-03", "2022-09", "Encerrada"));
        await h.Occupation.ExecuteAsync(h.Ana, null, ProfileHarness.Job("2022-03", title: "Atual"));
        var first = (await h.Get.ExecuteAsync(h.Ana)).Occupations[0];
        Assert.Equal(("Atual", null), (first.Title, first.End));
    }

    [Fact] // RF-09
    public async Task Ocupacao_e_criada_editada_e_removida()
    {
        var h = new ProfileHarness();
        var id = (await h.Occupation.ExecuteAsync(h.Ana, null, ProfileHarness.Job("2021-03"))).Item!.Id;
        var edited = await h.Occupation.ExecuteAsync(h.Ana, id, ProfileHarness.Job("2021-03", title: "Líder"));
        Assert.Equal("Líder", edited.Item!.Title);
        Assert.True(await h.RemoveOccupation.ExecuteAsync(h.Ana, id));
        Assert.Empty((await h.Get.ExecuteAsync(h.Ana)).Occupations);
    }

    [Fact] // RF-16
    public async Task Datas_inconsistentes_sao_recusadas_e_termino_futuro_e_aceito()
    {
        var h = new ProfileHarness();
        var before = await h.Occupation.ExecuteAsync(h.Ana, null, ProfileHarness.Job("2021-03", "2020-01"));
        var future = await h.Occupation.ExecuteAsync(h.Ana, null, ProfileHarness.Job("2027-01"));
        var planned = await h.Occupation.ExecuteAsync(h.Ana, null, ProfileHarness.Job("2026-01", "2027-12"));
        Assert.Equal("end_before_start", before.Errors!["end"]);
        Assert.Equal("future_start", future.Errors!["start"]);
        Assert.NotNull(planned.Item);
    }

    [Fact] // RF-22
    public async Task Campo_obrigatorio_vazio_nao_grava()
    {
        var h = new ProfileHarness();
        var r = await h.Occupation.ExecuteAsync(h.Ana, null, new OccupationInput("", "Acme", "", null, null));
        Assert.Equal("required", r.Errors!["title"]);
        Assert.Equal("required", r.Errors["start"]);
        Assert.Empty(h.Store.Items);
    }

    [Fact] // RF-02
    public async Task Perfil_de_um_usuario_nao_e_visto_nem_alterado_por_outro()
    {
        var h = new ProfileHarness();
        var id = (await h.Occupation.ExecuteAsync(h.Ana, null, ProfileHarness.Job("2021-03"))).Item!.Id;
        Assert.True((await h.Occupation.ExecuteAsync(h.Bia, id, ProfileHarness.Job("2021-03", title: "Invasão"))).NotFound);
        Assert.False(await h.RemoveOccupation.ExecuteAsync(h.Bia, id));
        Assert.Empty((await h.Get.ExecuteAsync(h.Bia)).Occupations);
    }

    [Fact] // RF-10 / RF-11
    public async Task Formacao_exige_nivel_da_lista_e_pode_estar_em_andamento()
    {
        var h = new ProfileHarness();
        var invalid = await h.Education.ExecuteAsync(h.Ana, null, new EducationInput("FATEC", "ADS", "phd", "2024-02", null, null));
        var ok = await h.Education.ExecuteAsync(h.Ana, null, new EducationInput("FATEC", "ADS", "mestrado", "2024-02", null, null));
        Assert.Equal("invalid", invalid.Errors!["level"]);
        Assert.Equal(("mestrado", null), (ok.Item!.Level, ok.Item.End));
    }

    [Fact] // RF-13
    public async Task Curso_exige_horas_positivas()
    {
        var h = new ProfileHarness();
        var zero = await h.Course.ExecuteAsync(h.Ana, null, new CourseInput("Docker", "Alura", 0, "2025-01", "2025-02"));
        var ok = await h.Course.ExecuteAsync(h.Ana, null, new CourseInput("Docker", "Alura", 40, "2025-01", "2025-02"));
        Assert.Equal("invalid", zero.Errors!["hours"]);
        Assert.Equal(40, ok.Item!.Hours);
    }
}

public class BioAndPhotoTests
{
    [Fact] // RF-06
    public async Task Bio_respeita_o_limite_de_500_caracteres()
    {
        var h = new ProfileHarness();
        Assert.True(await h.Bio.ExecuteAsync(h.Ana, new string('a', 500)));
        Assert.False(await h.Bio.ExecuteAsync(h.Ana, new string('a', 501)));
        Assert.Equal(500, (await h.Get.ExecuteAsync(h.Ana)).Bio!.Length);
    }

    [Fact] // RF-03 / RF-04
    public async Task Foto_valida_e_gravada_e_pode_ser_removida()
    {
        var h = new ProfileHarness();
        var r = await h.Send(ProfileHarness.Png);
        Assert.Equal(PhotoOutcome.Saved, r.Outcome);
        Assert.Equal("image/png", Assert.Single(h.Store.Photos).ContentType);
        await h.RemovePhoto.ExecuteAsync(h.Ana);
        Assert.Null((await h.Get.ExecuteAsync(h.Ana)).PhotoVersion);
    }

    [Fact] // RF-05
    public async Task Arquivo_invalido_ou_grande_e_recusado_e_a_foto_anterior_permanece()
    {
        var h = new ProfileHarness();
        await h.Send(ProfileHarness.Png);
        h.Options.MaxPhotoBytes = 100;
        var notImage = await h.Send("isto nao e imagem"u8.ToArray());
        var tooLarge = await h.Send([.. ProfileHarness.Png, .. new byte[200]]);
        Assert.Equal(PhotoOutcome.InvalidImage, notImage.Outcome);
        Assert.Equal(PhotoOutcome.TooLarge, tooLarge.Outcome);
        Assert.Equal(ProfileHarness.Png, Assert.Single(h.Store.Photos).Content);
    }

    [Theory] // RNF-02
    [InlineData(new byte[] { 0xFF, 0xD8, 0xFF, 0xE0 }, "image/jpeg")]
    [InlineData(new byte[] { 0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50 }, "image/webp")]
    [InlineData(new byte[] { 0x3C, 0x68, 0x74, 0x6D, 0x6C }, null)]
    public void Assinatura_identifica_o_tipo_da_imagem(byte[] bytes, string? expected)
        => Assert.Equal(expected, ImageSignature.Detect(bytes));
}
