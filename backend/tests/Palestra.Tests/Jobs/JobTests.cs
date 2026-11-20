using Palestra.Application.Auth;
using Palestra.Application.Jobs;
using Palestra.Application.Profiles;
using Palestra.Domain.Auth;
using Palestra.Domain.Jobs;
using Palestra.Tests.Auth;
using Palestra.Tests.Profiles;

namespace Palestra.Tests.Jobs;

public class JobStore : IJobRepository, IUnitOfWork
{
    public List<Job> Jobs { get; } = [];
    public List<JobImage> Images { get; } = [];
    public HashSet<(Guid Job, Guid User)> Likes { get; } = [];
    public Dictionary<(Guid Job, Guid User), DateTimeOffset> Applications { get; } = [];
    public Store Users { get; init; } = new();
    public ProfileStore Profiles { get; init; } = new();

    public Task<Job?> GetAsync(Guid id, CancellationToken ct = default) => Task.FromResult(Jobs.FirstOrDefault(j => j.Id == id));
    public Task AddAsync(Job job, CancellationToken ct = default) { Jobs.Add(job); return Task.CompletedTask; }
    public Task<JobImage?> GetImageAsync(Guid jobId, CancellationToken ct = default) => Task.FromResult(Images.FirstOrDefault(i => i.JobId == jobId));
    public Task AddAsync(JobImage image, CancellationToken ct = default) { Images.Add(image); return Task.CompletedTask; }
    public void Remove(JobImage image) => Images.Remove(image);

    public Task<EngagementDto> GetEngagementAsync(Guid jobId, Guid userId, CancellationToken ct = default) => Task.FromResult(new EngagementDto(
        Likes.Count(l => l.Job == jobId), Applications.Keys.Count(a => a.Job == jobId), Likes.Contains((jobId, userId)), Applications.ContainsKey((jobId, userId))));

    public Task SetLikeAsync(Guid jobId, Guid userId, bool on, DateTimeOffset now, CancellationToken ct = default)
    {
        if (on) Likes.Add((jobId, userId)); else Likes.Remove((jobId, userId));
        return Task.CompletedTask;
    }

    public Task SetApplicationAsync(Guid jobId, Guid userId, bool on, DateTimeOffset now, CancellationToken ct = default)
    {
        if (on) Applications.TryAdd((jobId, userId), now); else Applications.Remove((jobId, userId));
        return Task.CompletedTask;
    }

    public Task<bool> HasApplicationAsync(Guid jobId, Guid userId, CancellationToken ct = default) => Task.FromResult(Applications.ContainsKey((jobId, userId)));

    public Task<IReadOnlyList<CandidateRow>> ListCandidatesAsync(Guid jobId, CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<CandidateRow>>(Applications.Where(a => a.Key.Job == jobId)
            .Select(a => Users.Users.First(u => u.Id == a.Key.User))
            .Select(u => new CandidateRow(u.Id, u.FirstName, u.LastName, u.Email, null, Applications[(jobId, u.Id)]))
            .ToList());

    public Task SaveChangesAsync(CancellationToken ct = default) => Task.CompletedTask;
}

public class JobHarness
{
    public JobStore Store { get; } = new();
    public FakeClock Clock { get; } = new();
    public JobsOptions Options { get; } = new();
    public Guid Owner { get; }

    public JobHarness() => Owner = NewUser("Olga", "Dona", withProfile: false);

    public JobReader Reader => new(Store, Store.Users);
    public CreateJob Create => new(Store, Store, Clock, Options, Reader);
    public GetJob Get => new(Reader);
    public UpdateJob Update => new(Store, Options, Reader);
    public UploadJobImage Upload => new(Store, Store, Clock, Options, Reader);
    public SetLike Like => new(Store, Clock, Reader);
    public SetApplication Apply => new(Store, Store.Profiles, Clock, Reader);
    public ListCandidates Candidates => new(Store, Reader);
    public GetCandidateProfile CandidateProfile => new(new CandidateAccess(Store, Reader), new GetProfile(Store.Profiles), Store.Users);

    public static JobInput Input(string title = "Dev .NET", decimal salary = 5000, string? status = null, string contract = "clt", string description = "Vaga **remota**", params string[] benefits)
        => new(title, "Acme", description, [.. benefits], contract, salary, status);

    public Guid NewUser(string first, string last = "Silva", bool withProfile = true)
    {
        var user = User.Register(first, last, $"{first.ToLowerInvariant()}@x.com", Clock.UtcNow);
        Store.Users.Users.Add(user);
        if (withProfile)
            new SaveOccupation(Store.Profiles, Store.Profiles, Clock).ExecuteAsync(user.Id, null, ProfileHarness.Job("2020-01")).GetAwaiter().GetResult();
        return user.Id;
    }

    public async Task<Guid> NewJob(string? status = null) => (await Create.ExecuteAsync(Owner, Input(status: status))).Value!.Id;
}

public class JobDomainTests
{
    [Fact] // RF-03
    public void Codigos_de_regime_fora_da_lista_nao_convertem()
        => Assert.Equal((ContractType?)ContractType.Pj, JobCodes.ParseContract("pj") ?? JobCodes.ParseContract("freelancer"));

    [Fact] // RF-03 / RF-05
    public void Descricao_conta_so_caracteres_visiveis()
        => Assert.Equal(6, JobDescription.VisibleLength("**abc** *d*\n- e"));

    [Fact] // RF-05
    public void Descricao_com_500_visiveis_e_marcadores_e_aceita_e_com_501_nao()
    {
        var limits = new JobLimits();
        var ok = Job.Create(Guid.NewGuid(), DateTimeOffset.UtcNow, limits, "Dev", null, "**" + new string('a', 500) + "**", [], "clt", 1000, null);
        var tooLong = Job.Create(Guid.NewGuid(), DateTimeOffset.UtcNow, limits, "Dev", null, new string('a', 501), [], "clt", 1000, null);
        Assert.Equal((true, "too_long"), (ok.Job is not null, tooLong.Errors["description"]));
    }
}

public class JobTests
{
    [Fact] // RF-03 / RF-06 / RF-07
    public async Task Vaga_criada_fica_ativa_com_data_do_dia_e_dono()
    {
        var h = new JobHarness();
        var job = (await h.Create.ExecuteAsync(h.Owner, JobHarness.Input(benefits: ["medical", "gympass"]))).Value!;
        Assert.Equal(("active", h.Clock.UtcNow, true, 2), (job.Status, job.CreatedAt, job.IsOwner, job.Benefits.Count));
    }

    [Fact] // RF-05
    public async Task Cargo_vazio_e_valor_zero_nao_criam_a_vaga()
    {
        var h = new JobHarness();
        var result = await h.Create.ExecuteAsync(h.Owner, JobHarness.Input(title: " ", salary: 0));
        Assert.Equal(("required", "invalid", 0), (result.Errors!["title"], result.Errors["salary"], h.Store.Jobs.Count));
    }

    [Fact] // RF-03
    public async Task Regime_ou_beneficio_fora_da_lista_e_recusado()
    {
        var h = new JobHarness();
        var result = await h.Create.ExecuteAsync(h.Owner, JobHarness.Input(contract: "freelancer", benefits: ["vale_cultura"]));
        Assert.Equal(("invalid", "invalid"), (result.Errors!["contractType"], result.Errors["benefits"]));
    }

    [Fact] // RF-08
    public async Task Dono_edita_e_a_data_de_criacao_nao_muda_outro_usuario_nao_edita()
    {
        var h = new JobHarness();
        var id = await h.NewJob();
        h.Clock.UtcNow = h.Clock.UtcNow.AddDays(3);
        var edited = (await h.Update.ExecuteAsync(h.Owner, id, JobHarness.Input(salary: 7000, status: "active"))).Value!;
        var other = await h.Update.ExecuteAsync(h.NewUser("Bia"), id, JobHarness.Input(salary: 1));
        Assert.Equal((7000m, h.Clock.UtcNow.AddDays(-3), "not_found"), (edited.Salary, edited.CreatedAt, other.Error));
    }

    [Fact] // RF-09 / RF-10
    public async Task Vaga_inativa_so_e_visivel_ao_dono()
    {
        var h = new JobHarness();
        var id = await h.NewJob(status: "inactive");
        var owner = await h.Get.ExecuteAsync(h.Owner, id);
        var other = await h.Get.ExecuteAsync(h.NewUser("Bia"), id);
        Assert.Equal(("inactive", "not_found"), (owner.Value!.Status, other.Error));
    }

    [Fact] // RF-04
    public async Task Imagem_invalida_ou_grande_demais_e_recusada()
    {
        var h = new JobHarness();
        var id = await h.NewJob();
        var text = "olá"u8.ToArray();
        var big = new byte[h.Options.MaxImageBytes + 1];
        var invalid = await h.Upload.ExecuteAsync(h.Owner, id, new MemoryStream(text), text.Length);
        var tooLarge = await h.Upload.ExecuteAsync(h.Owner, id, new MemoryStream(big), big.Length);
        var ok = await h.Upload.ExecuteAsync(h.Owner, id, new MemoryStream(ProfileHarness.Png), ProfileHarness.Png.Length);
        Assert.Equal(("invalid_image", "image_too_large", true), (invalid.Error, tooLarge.Error, ok.Value is not null));
    }

    [Fact] // RF-12 / RF-13 / RNF-04
    public async Task Curtir_duas_vezes_conta_uma_e_descurtir_zera()
    {
        var h = new JobHarness();
        var id = await h.NewJob();
        var bia = h.NewUser("Bia");
        await h.Like.ExecuteAsync(bia, id, on: true);
        var twice = (await h.Like.ExecuteAsync(bia, id, on: true)).Value!.Likes;
        var after = (await h.Like.ExecuteAsync(bia, id, on: false)).Value!.Likes;
        Assert.Equal((1, 0), (twice, after));
    }

    [Fact] // RF-14 / RF-19
    public async Task Dono_nao_curte_nem_se_candidata()
    {
        var h = new JobHarness();
        var id = await h.NewJob();
        var like = await h.Like.ExecuteAsync(h.Owner, id, on: true);
        var apply = await h.Apply.ExecuteAsync(h.Owner, id, on: true);
        Assert.Equal(("own_job", "own_job"), (like.Error, apply.Error));
    }

    [Fact] // RF-15
    public async Task Candidatura_exige_perfil_minimo()
    {
        var h = new JobHarness();
        var id = await h.NewJob();
        var result = await h.Apply.ExecuteAsync(h.NewUser("Caio", withProfile: false), id, on: true);
        Assert.Equal("profile_incomplete", result.Error);
    }

    [Fact] // RF-16 / RF-17 / RF-18 / RF-20
    public async Task Candidatar_desistir_e_candidatar_de_novo()
    {
        var h = new JobHarness();
        var id = await h.NewJob();
        var bia = h.NewUser("Bia");
        var applied = (await h.Apply.ExecuteAsync(bia, id, on: true)).Value!;
        var withdrawn = (await h.Apply.ExecuteAsync(bia, id, on: false)).Value!;
        var again = (await h.Apply.ExecuteAsync(bia, id, on: true)).Value!;
        Assert.Equal((1, 0, 1, true), (applied.Candidates, withdrawn.Candidates, again.Candidates, again.AppliedByMe));
    }

    [Fact] // RF-22 / RF-23
    public async Task Lista_de_candidatos_e_alfabetica_e_so_do_dono()
    {
        var h = new JobHarness();
        var id = await h.NewJob();
        var carla = h.NewUser("Carla");
        await h.Apply.ExecuteAsync(carla, id, on: true);
        await h.Apply.ExecuteAsync(h.NewUser("Ana"), id, on: true);
        var list = (await h.Candidates.ExecuteAsync(h.Owner, id)).Value!;
        var other = await h.Candidates.ExecuteAsync(carla, id);
        Assert.Equal(("Ana,Carla", "ana@x.com", "not_found"), (string.Join(",", list.Select(c => c.FirstName)), list[0].Email, other.Error));
    }

    [Fact] // RF-24 / RF-25
    public async Task Perfil_do_candidato_so_enquanto_a_candidatura_esta_ativa()
    {
        var h = new JobHarness();
        var id = await h.NewJob();
        var bia = h.NewUser("Bia");
        await h.Apply.ExecuteAsync(bia, id, on: true);
        var profile = (await h.CandidateProfile.ExecuteAsync(h.Owner, id, bia)).Value!;
        await h.Apply.ExecuteAsync(bia, id, on: false);
        var afterWithdraw = await h.CandidateProfile.ExecuteAsync(h.Owner, id, bia);
        Assert.Equal(("bia@x.com", 1, "not_found"), (profile.Email, profile.Occupations.Count, afterWithdraw.Error));
    }
}
