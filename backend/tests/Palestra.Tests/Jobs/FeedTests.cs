using Palestra.Application.Jobs;
using Palestra.Application.Profiles;

namespace Palestra.Tests.Jobs;

public class FeedTests
{
    private static ListFeed Feed(JobHarness h) => new(h.Store, h.Options);

    private static async Task<Guid> JobBy(JobHarness h, Guid owner, string? status = null)
    {
        h.Clock.UtcNow = h.Clock.UtcNow.AddMinutes(1); // cada vaga mais recente que a anterior
        return (await h.Create.ExecuteAsync(owner, JobHarness.Input(status: status))).Value!.Id;
    }

    [Fact] // RF-07 / RF-08 (cursor)
    public void Cursor_codificado_volta_igual_e_texto_invalido_falha()
    {
        var (at, id) = (DateTimeOffset.UtcNow, Guid.NewGuid());
        var ok = FeedCursor.TryDecode(FeedCursor.Encode(at, id), out var at2, out var id2);
        Assert.Equal((true, at.UtcTicks, id, false), (ok, at2.UtcTicks, id2, FeedCursor.TryDecode("xyz", out _, out _)));
    }

    [Fact] // RF-05
    public async Task Todas_traz_so_as_ativas_inclusive_as_do_usuario()
    {
        var h = new JobHarness();
        var me = h.NewUser("Bia");
        var active = await JobBy(h, h.Owner);
        await JobBy(h, h.Owner, status: "inactive");
        var mine = await JobBy(h, me);

        var page = (await Feed(h).ExecuteAsync(me, "all", null)).Value!;
        Assert.Equal([mine, active], page.Items.Select(j => j.Id));
    }

    [Fact] // RF-06
    public async Task Minhas_traz_so_as_do_usuario_inclusive_inativas()
    {
        var h = new JobHarness();
        await JobBy(h, h.NewUser("Bia"));
        var active = await JobBy(h, h.Owner);
        var inactive = await JobBy(h, h.Owner, status: "inactive");

        var page = (await Feed(h).ExecuteAsync(h.Owner, "mine", null)).Value!;
        Assert.Equal([inactive, active], page.Items.Select(j => j.Id));
    }

    [Fact] // RF-07 / RF-08
    public async Task Pagina_de_10_em_10_sem_repetir_e_mais_recente_primeiro()
    {
        var h = new JobHarness();
        for (var i = 0; i < 25; i++)
        {
            if (i != 13) h.Clock.UtcNow = h.Clock.UtcNow.AddMinutes(1); // duas vagas com a mesma data
            await h.Create.ExecuteAsync(h.Owner, JobHarness.Input());
        }

        var seen = new List<JobDto>();
        var sizes = new List<int>();
        string? cursor = null;
        do
        {
            var page = (await Feed(h).ExecuteAsync(h.NewUser("U" + sizes.Count), "all", cursor)).Value!;
            sizes.Add(page.Items.Count);
            seen.AddRange(page.Items);
            cursor = page.NextCursor;
        } while (cursor is not null);

        var expected = h.Store.Jobs.OrderByDescending(j => j.CreatedAt).ThenByDescending(j => j.Id).Select(j => j.Id);
        Assert.Equal(("10,10,5", string.Join(",", expected)), (string.Join(",", sizes), string.Join(",", seen.Select(j => j.Id))));
    }

    [Fact] // RF-08
    public async Task Cursor_ou_scope_invalido_e_recusado()
    {
        var h = new JobHarness();
        var bad = await Feed(h).ExecuteAsync(h.Owner, "all", "xyz");
        var scope = await Feed(h).ExecuteAsync(h.Owner, "outros", null);
        Assert.Equal(("invalid", "invalid"), (bad.Errors!["cursor"], scope.Errors!["scope"]));
    }

    [Fact] // RNF-02
    public async Task Foto_do_anunciante_de_vaga_inativa_nao_e_servida_a_outro_usuario()
    {
        var h = new JobHarness();
        var id = await JobBy(h, h.Owner, status: "inactive");
        var photo = await new GetOwnerPhoto(h.Reader, new GetPhoto(h.Store.Profiles)).ExecuteAsync(h.NewUser("Bia"), id);
        Assert.Null(photo);
    }
}
