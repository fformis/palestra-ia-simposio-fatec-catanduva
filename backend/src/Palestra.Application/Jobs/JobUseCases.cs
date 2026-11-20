using Palestra.Application.Auth;
using Palestra.Application.Profiles;
using Palestra.Domain.Jobs;
using Palestra.Domain.Profiles;

namespace Palestra.Application.Jobs;

// Vaga inativa para quem não é dono, ou ação do dono sobre vaga alheia, é tratada como inexistente (not_found).

/// <summary>Monta o <see cref="JobDto"/> com anunciante e contagens.</summary>
public class JobReader(IJobRepository repo, IUserRepository users)
{
    public async Task<JobDto> ToDtoAsync(Job job, Guid userId, CancellationToken ct)
    {
        var owner = await users.GetByIdAsync(job.OwnerId, ct);
        var engagement = await repo.GetEngagementAsync(job.Id, userId, ct);
        return JobDto.From(job, new OwnerDto(owner?.FirstName ?? "", owner?.LastName ?? ""), userId, engagement);
    }

    /// <summary>Vaga visível ao usuário (RF-10), ou nulo.</summary>
    public async Task<Job?> FindVisibleAsync(Guid jobId, Guid userId, CancellationToken ct)
        => await repo.GetAsync(jobId, ct) is { } job && job.IsVisibleTo(userId) ? job : null;

    /// <summary>Vaga do próprio usuário, ou nulo.</summary>
    public async Task<Job?> FindOwnedAsync(Guid jobId, Guid userId, CancellationToken ct)
        => await repo.GetAsync(jobId, ct) is { } job && job.IsOwner(userId) ? job : null;
}

public class CreateJob(IJobRepository repo, IUnitOfWork uow, IClock clock, JobsOptions options, JobReader reader)
{
    public async Task<JobResult<JobDto>> ExecuteAsync(Guid userId, JobInput input, CancellationToken ct = default)
    {
        var (job, errors) = Job.Create(userId, clock.UtcNow, options.Limits,
            input.Title, input.Company, input.Description, input.Benefits, input.ContractType, input.Salary, input.Status);
        if (job is null) return new(Errors: errors);

        await repo.AddAsync(job, ct);
        await uow.SaveChangesAsync(ct);
        return new(await reader.ToDtoAsync(job, userId, ct));
    }
}

public class GetJob(JobReader reader)
{
    public async Task<JobResult<JobDto>> ExecuteAsync(Guid userId, Guid jobId, CancellationToken ct = default)
        => await reader.FindVisibleAsync(jobId, userId, ct) is { } job
            ? new(await reader.ToDtoAsync(job, userId, ct))
            : JobResult<JobDto>.Fail(JobErrors.NotFound);
}

public class UpdateJob(IUnitOfWork uow, JobsOptions options, JobReader reader)
{
    public async Task<JobResult<JobDto>> ExecuteAsync(Guid userId, Guid jobId, JobInput input, CancellationToken ct = default)
    {
        var job = await reader.FindOwnedAsync(jobId, userId, ct);
        if (job is null) return JobResult<JobDto>.Fail(JobErrors.NotFound);

        var errors = job.Update(options.Limits, input.Title, input.Company, input.Description, input.Benefits, input.ContractType, input.Salary, input.Status);
        if (errors.Count > 0) return new(Errors: errors);

        await uow.SaveChangesAsync(ct);
        return new(await reader.ToDtoAsync(job, userId, ct));
    }
}

public class SetLike(IJobRepository repo, IClock clock, JobReader reader)
{
    /// <summary>RF-12/RF-14: curtir (<paramref name="on"/>) ou descurtir; o dono não curte a própria vaga.</summary>
    public async Task<JobResult<EngagementDto>> ExecuteAsync(Guid userId, Guid jobId, bool on, CancellationToken ct = default)
    {
        var job = await reader.FindVisibleAsync(jobId, userId, ct);
        if (job is null) return JobResult<EngagementDto>.Fail(JobErrors.NotFound);
        if (job.IsOwner(userId)) return JobResult<EngagementDto>.Fail(JobErrors.OwnJob);

        await repo.SetLikeAsync(jobId, userId, on, clock.UtcNow, ct);
        return new(await repo.GetEngagementAsync(jobId, userId, ct));
    }
}

public class SetApplication(IJobRepository repo, IProfileRepository profiles, IClock clock, JobReader reader)
{
    /// <summary>RF-15 a RF-19: candidatar-se (<paramref name="on"/>) ou desistir.</summary>
    public async Task<JobResult<EngagementDto>> ExecuteAsync(Guid userId, Guid jobId, bool on, CancellationToken ct = default)
    {
        var job = await reader.FindVisibleAsync(jobId, userId, ct);
        if (job is null) return JobResult<EngagementDto>.Fail(JobErrors.NotFound);
        if (job.IsOwner(userId)) return JobResult<EngagementDto>.Fail(JobErrors.OwnJob);

        if (on && !await repo.HasApplicationAsync(jobId, userId, ct))
        {
            var hasMinimumProfile = (await profiles.ListAsync<Occupation>(userId, ct)).Count > 0
                || (await profiles.ListAsync<Education>(userId, ct)).Count > 0;
            if (!hasMinimumProfile) return JobResult<EngagementDto>.Fail(JobErrors.ProfileIncomplete);
        }

        await repo.SetApplicationAsync(jobId, userId, on, clock.UtcNow, ct);
        return new(await repo.GetEngagementAsync(jobId, userId, ct));
    }
}

public class ListCandidates(IJobRepository repo, JobReader reader)
{
    private static readonly StringComparer PtBr = StringComparer.Create(new System.Globalization.CultureInfo("pt-BR"), ignoreCase: true);

    /// <summary>RF-22/RF-23: só o anunciante; ordem alfabética por nome e sobrenome.</summary>
    public async Task<JobResult<IReadOnlyList<CandidateDto>>> ExecuteAsync(Guid userId, Guid jobId, CancellationToken ct = default)
    {
        if (await reader.FindOwnedAsync(jobId, userId, ct) is null) return JobResult<IReadOnlyList<CandidateDto>>.Fail(JobErrors.NotFound);

        var rows = await repo.ListCandidatesAsync(jobId, ct);
        return new(rows
            .OrderBy(r => $"{r.FirstName} {r.LastName}", PtBr)
            .Select(r => new CandidateDto(r.UserId, r.FirstName, r.LastName, r.Email, r.PhotoVersion?.UtcTicks.ToString(), r.AppliedAt))
            .ToList());
    }
}

/// <summary>RF-25: o anunciante só acessa quem tem candidatura ativa em uma vaga dele.</summary>
public class CandidateAccess(IJobRepository repo, JobReader reader)
{
    public async Task<bool> AllowedAsync(Guid userId, Guid jobId, Guid candidateId, CancellationToken ct)
        => await reader.FindOwnedAsync(jobId, userId, ct) is not null && await repo.HasApplicationAsync(jobId, candidateId, ct);
}

public class GetCandidateProfile(CandidateAccess access, GetProfile getProfile, IUserRepository users)
{
    /// <summary>RF-24: perfil somente leitura do candidato, com nome e e-mail.</summary>
    public async Task<JobResult<CandidateProfileDto>> ExecuteAsync(Guid userId, Guid jobId, Guid candidateId, CancellationToken ct = default)
    {
        if (!await access.AllowedAsync(userId, jobId, candidateId, ct)) return JobResult<CandidateProfileDto>.Fail(JobErrors.NotFound);
        var user = await users.GetByIdAsync(candidateId, ct);
        if (user is null) return JobResult<CandidateProfileDto>.Fail(JobErrors.NotFound);

        var p = await getProfile.ExecuteAsync(candidateId, ct);
        return new(new CandidateProfileDto(user.FirstName, user.LastName, user.Email, p.Bio, p.PhotoVersion, p.Occupations, p.Educations, p.Courses));
    }
}

public class GetCandidatePhoto(CandidateAccess access, GetPhoto getPhoto)
{
    public async Task<PhotoContent?> ExecuteAsync(Guid userId, Guid jobId, Guid candidateId, CancellationToken ct = default)
        => await access.AllowedAsync(userId, jobId, candidateId, ct) ? await getPhoto.ExecuteAsync(candidateId, ct) : null;
}
