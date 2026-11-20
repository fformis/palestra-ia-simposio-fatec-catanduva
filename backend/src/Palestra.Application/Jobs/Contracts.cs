using Palestra.Domain.Jobs;

namespace Palestra.Application.Jobs;

public class JobsOptions
{
    public int MaxImageBytes { get; set; } = 2 * 1024 * 1024;
    public int MaxTitleLength { get; set; } = 100;
    public int MaxDescriptionLength { get; set; } = 500;

    public JobLimits Limits => new(MaxTitleLength, MaxDescriptionLength);
}

/// <summary>Candidato com os dados de usuário e perfil necessários à lista (RF-22).</summary>
public record CandidateRow(Guid UserId, string FirstName, string LastName, string Email, DateTimeOffset? PhotoVersion, DateTimeOffset AppliedAt);

public interface IJobRepository
{
    Task<Job?> GetAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Job job, CancellationToken ct = default);

    Task<JobImage?> GetImageAsync(Guid jobId, CancellationToken ct = default);
    Task AddAsync(JobImage image, CancellationToken ct = default);
    void Remove(JobImage image);

    /// <summary>Contagens calculadas a partir dos registros, e o estado do usuário (RF-13, RF-20).</summary>
    Task<EngagementDto> GetEngagementAsync(Guid jobId, Guid userId, CancellationToken ct = default);

    /// <summary>
    /// Liga/desliga a curtida ou a candidatura de forma idempotente e grava na hora; registro repetido
    /// (inclusive por cliques simultâneos) é tratado como "já existe" (RNF-04).
    /// </summary>
    Task SetLikeAsync(Guid jobId, Guid userId, bool on, DateTimeOffset now, CancellationToken ct = default);
    Task SetApplicationAsync(Guid jobId, Guid userId, bool on, DateTimeOffset now, CancellationToken ct = default);

    Task<bool> HasApplicationAsync(Guid jobId, Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<CandidateRow>> ListCandidatesAsync(Guid jobId, CancellationToken ct = default);
}

public record JobInput(string? Title, string? Company, string? Description, List<string>? Benefits, string? ContractType, decimal? Salary, string? Status);

public record EngagementDto(int Likes, int Candidates, bool LikedByMe, bool AppliedByMe);

public record OwnerDto(string FirstName, string LastName);

public record JobDto(
    Guid Id, string Title, string? Company, string Description, IReadOnlyList<string> Benefits, string ContractType,
    decimal Salary, string Status, DateTimeOffset CreatedAt, string? ImageVersion, OwnerDto Owner, bool IsOwner,
    int Likes, int Candidates, bool LikedByMe, bool AppliedByMe)
{
    public static JobDto From(Job j, OwnerDto owner, Guid userId, EngagementDto e) => new(
        j.Id, j.Title, j.Company, j.Description, j.Benefits.Select(JobCodes.ToCode).ToList(), JobCodes.ToCode(j.ContractType),
        j.Salary, JobCodes.ToCode(j.Status), j.CreatedAt, j.ImageVersion?.UtcTicks.ToString(), owner, j.IsOwner(userId),
        e.Likes, e.Candidates, e.LikedByMe, e.AppliedByMe);
}

public record CandidateDto(Guid UserId, string FirstName, string LastName, string Email, string? PhotoVersion, DateTimeOffset AppliedAt);

public record CandidateProfileDto(
    string FirstName, string LastName, string Email, string? Bio, string? PhotoVersion,
    IReadOnlyList<Profiles.OccupationDto> Occupations, IReadOnlyList<Profiles.EducationDto> Educations, IReadOnlyList<Profiles.CourseDto> Courses);

/// <summary>Resultado de um caso de uso de vaga: valor, erros por campo ou um código de erro.</summary>
public record JobResult<T>(T? Value = default, IReadOnlyDictionary<string, string>? Errors = null, string? Error = null)
{
    public static JobResult<T> Fail(string code) => new(Error: code);
}

public static class JobErrors
{
    public const string NotFound = "not_found";
    public const string OwnJob = "own_job";
    public const string ProfileIncomplete = "profile_incomplete";
    public const string InvalidImage = "invalid_image";
    public const string ImageTooLarge = "image_too_large";
}
