using Palestra.Application.Auth;
using Palestra.Domain.Profiles;

namespace Palestra.Application.Profiles;

// "Save" cria quando não há id e edita quando há; item de outro usuário é tratado como inexistente (RF-02).

public class SaveOccupation(IProfileRepository repo, IUnitOfWork uow, IClock clock)
{
    public async Task<SaveResult<OccupationDto>> ExecuteAsync(Guid userId, Guid? id, OccupationInput input, CancellationToken ct = default)
    {
        var item = id is null ? Occupation.New(userId) : await repo.FindAsync<Occupation>(id.Value, userId, ct);
        if (item is null) return new(NotFound: true);

        var errors = item.Update(input.Title, input.Company, input.Start, input.End, input.Description, Period.MonthOf(clock.UtcNow));
        if (errors.Count > 0) return new(Errors: errors);

        if (id is null) await repo.AddItemAsync(item, ct);
        await uow.SaveChangesAsync(ct);
        return new(OccupationDto.From(item));
    }
}

public class SaveEducation(IProfileRepository repo, IUnitOfWork uow, IClock clock)
{
    public async Task<SaveResult<EducationDto>> ExecuteAsync(Guid userId, Guid? id, EducationInput input, CancellationToken ct = default)
    {
        var item = id is null ? Education.New(userId) : await repo.FindAsync<Education>(id.Value, userId, ct);
        if (item is null) return new(NotFound: true);

        var errors = item.Update(input.Institution, input.Course, input.Level, input.Start, input.End, input.Description, Period.MonthOf(clock.UtcNow));
        if (errors.Count > 0) return new(Errors: errors);

        if (id is null) await repo.AddItemAsync(item, ct);
        await uow.SaveChangesAsync(ct);
        return new(EducationDto.From(item));
    }
}

public class SaveCourse(IProfileRepository repo, IUnitOfWork uow, IClock clock)
{
    public async Task<SaveResult<CourseDto>> ExecuteAsync(Guid userId, Guid? id, CourseInput input, CancellationToken ct = default)
    {
        var item = id is null ? Course.New(userId) : await repo.FindAsync<Course>(id.Value, userId, ct);
        if (item is null) return new(NotFound: true);

        var errors = item.Update(input.Name, input.Institution, input.Hours, input.Start, input.End, Period.MonthOf(clock.UtcNow));
        if (errors.Count > 0) return new(Errors: errors);

        if (id is null) await repo.AddItemAsync(item, ct);
        await uow.SaveChangesAsync(ct);
        return new(CourseDto.From(item));
    }
}

/// <summary>Remove uma ocupação, formação ou curso do próprio usuário; falso se não encontrado.</summary>
public class RemoveItem<T>(IProfileRepository repo, IUnitOfWork uow) where T : class, ITimelineItem
{
    public async Task<bool> ExecuteAsync(Guid userId, Guid id, CancellationToken ct = default)
    {
        var item = await repo.FindAsync<T>(id, userId, ct);
        if (item is null) return false;
        repo.RemoveItem(item);
        await uow.SaveChangesAsync(ct);
        return true;
    }
}
