using Microsoft.EntityFrameworkCore;
using Palestra.Application.Profiles;
using Palestra.Domain.Profiles;

namespace Palestra.Infrastructure.Persistence;

public class ProfileRepository(AppDbContext db) : IProfileRepository
{
    public Task<Profile?> GetProfileAsync(Guid userId, CancellationToken ct = default)
        => db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);

    public async Task AddAsync(Profile profile, CancellationToken ct = default) => await db.Profiles.AddAsync(profile, ct);

    public Task<ProfilePhoto?> GetPhotoAsync(Guid userId, CancellationToken ct = default)
        => db.ProfilePhotos.FirstOrDefaultAsync(p => p.UserId == userId, ct);

    public async Task AddAsync(ProfilePhoto photo, CancellationToken ct = default) => await db.ProfilePhotos.AddAsync(photo, ct);

    public void Remove(ProfilePhoto photo) => db.ProfilePhotos.Remove(photo);

    public async Task<IReadOnlyList<T>> ListAsync<T>(Guid userId, CancellationToken ct = default) where T : class, ITimelineItem
        => await db.Set<T>().Where(i => i.UserId == userId).ToListAsync(ct);

    public Task<T?> FindAsync<T>(Guid id, Guid userId, CancellationToken ct = default) where T : class, ITimelineItem
        => db.Set<T>().FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId, ct);

    public async Task AddItemAsync<T>(T item, CancellationToken ct = default) where T : class, ITimelineItem
        => await db.Set<T>().AddAsync(item, ct);

    public void RemoveItem<T>(T item) where T : class, ITimelineItem => db.Set<T>().Remove(item);
}
