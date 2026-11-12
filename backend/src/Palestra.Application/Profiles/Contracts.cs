using Palestra.Domain.Profiles;

namespace Palestra.Application.Profiles;

public class ProfileOptions
{
    public int MaxPhotoBytes { get; set; } = 2 * 1024 * 1024;
    public int MaxBioLength { get; set; } = 500;
}

public interface IProfileRepository
{
    Task<Profile?> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(Profile profile, CancellationToken ct = default);

    Task<ProfilePhoto?> GetPhotoAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(ProfilePhoto photo, CancellationToken ct = default);
    void Remove(ProfilePhoto photo);

    /// <summary>Itens (ocupações, formações ou cursos) sempre filtrados pelo dono.</summary>
    Task<IReadOnlyList<T>> ListAsync<T>(Guid userId, CancellationToken ct = default) where T : class, ITimelineItem;
    Task<T?> FindAsync<T>(Guid id, Guid userId, CancellationToken ct = default) where T : class, ITimelineItem;
    Task AddItemAsync<T>(T item, CancellationToken ct = default) where T : class, ITimelineItem;
    void RemoveItem<T>(T item) where T : class, ITimelineItem;
}

// Datas mês/ano trafegam como "AAAA-MM"; término ausente = null.
public record OccupationInput(string? Title, string? Company, string? Start, string? End, string? Description);
public record EducationInput(string? Institution, string? Course, string? Level, string? Start, string? End, string? Description);
public record CourseInput(string? Name, string? Institution, int? Hours, string? Start, string? End);

public record OccupationDto(Guid Id, string Title, string Company, string Start, string? End, string? Description)
{
    public static OccupationDto From(Occupation o) => new(o.Id, o.Title, o.Company, Period.ToText(o.Start), o.End is { } e ? Period.ToText(e) : null, o.Description);
}

public record EducationDto(Guid Id, string Institution, string Course, string Level, string Start, string? End, string? Description)
{
    public static EducationDto From(Education x) => new(x.Id, x.Institution, x.Course, EducationLevels.ToCode(x.Level), Period.ToText(x.Start), x.End is { } e ? Period.ToText(e) : null, x.Description);
}

public record CourseDto(Guid Id, string Name, string Institution, int Hours, string Start, string? End)
{
    public static CourseDto From(Course c) => new(c.Id, c.Name, c.Institution, c.Hours, Period.ToText(c.Start), c.End is { } e ? Period.ToText(e) : null);
}

public record ProfileDto(string? Bio, string? PhotoVersion, IReadOnlyList<OccupationDto> Occupations, IReadOnlyList<EducationDto> Educations, IReadOnlyList<CourseDto> Courses);

/// <summary>Resultado de salvar um item: o item, erros por campo, ou não encontrado (inexistente ou de outro usuário).</summary>
public record SaveResult<TDto>(TDto? Item = default, IReadOnlyDictionary<string, string>? Errors = null, bool NotFound = false);
