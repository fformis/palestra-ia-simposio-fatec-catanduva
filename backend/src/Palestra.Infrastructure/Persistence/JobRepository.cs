using Microsoft.EntityFrameworkCore;
using Npgsql;
using Palestra.Application.Jobs;
using Palestra.Domain.Jobs;

namespace Palestra.Infrastructure.Persistence;

public class JobRepository(AppDbContext db) : IJobRepository
{
    public Task<Job?> GetAsync(Guid id, CancellationToken ct = default) => db.Jobs.FirstOrDefaultAsync(j => j.Id == id, ct);

    public async Task AddAsync(Job job, CancellationToken ct = default) => await db.Jobs.AddAsync(job, ct);

    public Task<JobImage?> GetImageAsync(Guid jobId, CancellationToken ct = default) => db.JobImages.FirstOrDefaultAsync(i => i.JobId == jobId, ct);

    public async Task AddAsync(JobImage image, CancellationToken ct = default) => await db.JobImages.AddAsync(image, ct);

    public void Remove(JobImage image) => db.JobImages.Remove(image);

    public async Task<EngagementDto> GetEngagementAsync(Guid jobId, Guid userId, CancellationToken ct = default) => new(
        await db.JobLikes.CountAsync(l => l.JobId == jobId, ct),
        await db.JobApplications.CountAsync(a => a.JobId == jobId, ct),
        await db.JobLikes.AnyAsync(l => l.JobId == jobId && l.UserId == userId, ct),
        await db.JobApplications.AnyAsync(a => a.JobId == jobId && a.UserId == userId, ct));

    public Task SetLikeAsync(Guid jobId, Guid userId, bool on, DateTimeOffset now, CancellationToken ct = default)
        => on ? InsertOnceAsync(db.JobLikes, l => l.JobId == jobId && l.UserId == userId, JobLike.New(jobId, userId, now), ct)
              : db.JobLikes.Where(l => l.JobId == jobId && l.UserId == userId).ExecuteDeleteAsync(ct);

    public Task SetApplicationAsync(Guid jobId, Guid userId, bool on, DateTimeOffset now, CancellationToken ct = default)
        => on ? InsertOnceAsync(db.JobApplications, a => a.JobId == jobId && a.UserId == userId, JobApplication.New(jobId, userId, now), ct)
              : db.JobApplications.Where(a => a.JobId == jobId && a.UserId == userId).ExecuteDeleteAsync(ct);

    public Task<bool> HasApplicationAsync(Guid jobId, Guid userId, CancellationToken ct = default)
        => db.JobApplications.AnyAsync(a => a.JobId == jobId && a.UserId == userId, ct);

    public async Task<IReadOnlyList<CandidateRow>> ListCandidatesAsync(Guid jobId, CancellationToken ct = default)
        => await (from a in db.JobApplications
                  where a.JobId == jobId
                  join u in db.Users on a.UserId equals u.Id
                  join p in db.Profiles on u.Id equals p.UserId into profiles
                  from p in profiles.DefaultIfEmpty()
                  select new CandidateRow(u.Id, u.FirstName, u.LastName, u.Email, p == null ? null : p.PhotoVersion, a.AppliedAt))
                 .ToListAsync(ct);

    public async Task<IReadOnlyList<FeedRow>> ListFeedAsync(FeedQuery q, CancellationToken ct = default)
    {
        var jobs = db.Jobs.AsNoTracking().Where(j => q.Mine ? j.OwnerId == q.UserId : j.Status == JobStatus.Active);
        if (q.AfterCreatedAt is { } at && q.AfterId is { } after)
            jobs = jobs.Where(j => j.CreatedAt < at || (j.CreatedAt == at && j.Id.CompareTo(after) < 0));

        // Uma única consulta: anunciante, foto e contagens em subconsultas (sem N+1).
        var rows = await (from j in jobs.OrderByDescending(j => j.CreatedAt).ThenByDescending(j => j.Id).Take(q.Take)
                          join u in db.Users on j.OwnerId equals u.Id
                          join p in db.Profiles on u.Id equals p.UserId into profiles
                          from p in profiles.DefaultIfEmpty()
                          select new
                          {
                              Job = j,
                              u.FirstName,
                              u.LastName,
                              Photo = p == null ? null : p.PhotoVersion,
                              Likes = db.JobLikes.Count(l => l.JobId == j.Id),
                              Candidates = db.JobApplications.Count(a => a.JobId == j.Id),
                              Liked = db.JobLikes.Any(l => l.JobId == j.Id && l.UserId == q.UserId),
                              Applied = db.JobApplications.Any(a => a.JobId == j.Id && a.UserId == q.UserId),
                          })
                         .ToListAsync(ct);

        return rows
            .OrderByDescending(r => r.Job.CreatedAt).ThenByDescending(r => r.Job.Id)
            .Select(r => new FeedRow(r.Job, r.FirstName, r.LastName, r.Photo, new EngagementDto(r.Likes, r.Candidates, r.Liked, r.Applied)))
            .ToList();
    }

    /// <summary>RNF-04: grava se ainda não existe; chave repetida por clique simultâneo conta como "já existe".</summary>
    private async Task InsertOnceAsync<T>(DbSet<T> set, System.Linq.Expressions.Expression<Func<T, bool>> exists, T entity, CancellationToken ct) where T : class
    {
        if (await set.AnyAsync(exists, ct)) return;
        set.Add(entity);
        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException e) when (e.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            db.Entry(entity).State = EntityState.Detached;
        }
    }
}
