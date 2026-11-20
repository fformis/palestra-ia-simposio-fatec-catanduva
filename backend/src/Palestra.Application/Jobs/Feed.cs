using System.Text;
using Palestra.Application.Profiles;
using Palestra.Domain.Jobs;

namespace Palestra.Application.Jobs;

/// <summary>Cursor opaco do feed: posição (data de criação, id) da última vaga entregue (spec 010, RF-07/RF-08).</summary>
public static class FeedCursor
{
    public static string Encode(DateTimeOffset createdAt, Guid id)
        => Convert.ToBase64String(Encoding.UTF8.GetBytes($"{createdAt.UtcTicks}_{id:N}")).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    public static bool TryDecode(string? text, out DateTimeOffset createdAt, out Guid id)
    {
        createdAt = default;
        id = default;
        if (string.IsNullOrWhiteSpace(text)) return false;
        try
        {
            var b64 = text.Replace('-', '+').Replace('_', '/');
            b64 = b64.PadRight(b64.Length + (4 - b64.Length % 4) % 4, '=');
            var parts = Encoding.UTF8.GetString(Convert.FromBase64String(b64)).Split('_');
            if (parts.Length != 2 || !long.TryParse(parts[0], out var ticks) || !Guid.TryParse(parts[1], out id)) return false;
            createdAt = new DateTimeOffset(ticks, TimeSpan.Zero);
            return true;
        }
        catch (FormatException)
        {
            return false;
        }
        catch (ArgumentOutOfRangeException)
        {
            return false;
        }
    }
}

/// <summary>Filtro e posição de uma página do feed. <c>Mine</c>: vagas do usuário (qualquer status); senão, todas as ativas.</summary>
public record FeedQuery(Guid UserId, bool Mine, DateTimeOffset? AfterCreatedAt, Guid? AfterId, int Take);

public record FeedRow(Job Job, string OwnerFirstName, string OwnerLastName, DateTimeOffset? OwnerPhotoVersion, EngagementDto Engagement);

public record JobFeedPageDto(IReadOnlyList<JobDto> Items, string? NextCursor);

public class ListFeed(IJobRepository repo, JobsOptions options)
{
    /// <summary>RF-05 a RF-08: página de vagas, mais recente primeiro, paginada por cursor.</summary>
    public async Task<JobResult<JobFeedPageDto>> ExecuteAsync(Guid userId, string? scope, string? cursor, CancellationToken ct = default)
    {
        bool mine;
        switch (scope)
        {
            case null or "" or "all": mine = false; break;
            case "mine": mine = true; break;
            default: return new(Errors: new Dictionary<string, string> { ["scope"] = "invalid" });
        }

        DateTimeOffset? afterCreatedAt = null;
        Guid? afterId = null;
        if (!string.IsNullOrEmpty(cursor))
        {
            if (!FeedCursor.TryDecode(cursor, out var c, out var id))
                return new(Errors: new Dictionary<string, string> { ["cursor"] = "invalid" });
            (afterCreatedAt, afterId) = (c, id);
        }

        var size = options.FeedPageSize;
        var rows = await repo.ListFeedAsync(new FeedQuery(userId, mine, afterCreatedAt, afterId, size + 1), ct);
        var page = rows.Take(size).ToList();
        var next = rows.Count > size ? FeedCursor.Encode(page[^1].Job.CreatedAt, page[^1].Job.Id) : null;

        var items = page.Select(r => JobDto.From(r.Job,
            new OwnerDto(r.OwnerFirstName, r.OwnerLastName, r.OwnerPhotoVersion?.UtcTicks.ToString()), userId, r.Engagement)).ToList();
        return new(new JobFeedPageDto(items, next));
    }
}

public class GetOwnerPhoto(JobReader reader, GetPhoto getPhoto)
{
    /// <summary>RF-12/RNF-02: foto do anunciante, só para quem pode ver a vaga.</summary>
    public async Task<PhotoContent?> ExecuteAsync(Guid userId, Guid jobId, CancellationToken ct = default)
        => await reader.FindVisibleAsync(jobId, userId, ct) is { } job ? await getPhoto.ExecuteAsync(job.OwnerId, ct) : null;
}
