using Palestra.Application.Auth;
using Palestra.Domain.Profiles;

namespace Palestra.Application.Profiles;

public class GetProfile(IProfileRepository repo)
{
    public async Task<ProfileDto> ExecuteAsync(Guid userId, CancellationToken ct = default)
    {
        var profile = await repo.GetProfileAsync(userId, ct);
        return new ProfileDto(
            profile?.Bio,
            profile?.PhotoVersion?.UtcTicks.ToString(),
            Period.Sort(await repo.ListAsync<Occupation>(userId, ct)).Select(OccupationDto.From).ToList(),
            Period.Sort(await repo.ListAsync<Education>(userId, ct)).Select(EducationDto.From).ToList(),
            Period.Sort(await repo.ListAsync<Course>(userId, ct)).Select(CourseDto.From).ToList());
    }
}

public class UpdateBio(IProfileRepository repo, IUnitOfWork uow, ProfileOptions options)
{
    /// <summary>Devolve falso quando a bio excede o limite (RF-06).</summary>
    public async Task<bool> ExecuteAsync(Guid userId, string? bio, CancellationToken ct = default)
    {
        var profile = await repo.GetOrCreateAsync(userId, ct);
        if (!profile.SetBio(bio, options.MaxBioLength)) return false;
        await uow.SaveChangesAsync(ct);
        return true;
    }
}

internal static class ProfileRepositoryExtensions
{
    public static async Task<Profile> GetOrCreateAsync(this IProfileRepository repo, Guid userId, CancellationToken ct)
    {
        var profile = await repo.GetProfileAsync(userId, ct);
        if (profile is null)
        {
            profile = Profile.New(userId);
            await repo.AddAsync(profile, ct);
        }
        return profile;
    }
}
