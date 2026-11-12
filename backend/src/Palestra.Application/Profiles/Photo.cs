using Palestra.Application.Auth;
using Palestra.Domain.Profiles;

namespace Palestra.Application.Profiles;

public enum PhotoOutcome { Saved, InvalidImage, TooLarge }
public record PhotoResult(PhotoOutcome Outcome, string? PhotoVersion = null);
public record PhotoContent(string ContentType, byte[] Content);

public class UploadPhoto(IProfileRepository repo, IUnitOfWork uow, IClock clock, ProfileOptions options)
{
    public async Task<PhotoResult> ExecuteAsync(Guid userId, Stream content, long length, CancellationToken ct = default)
    {
        if (length > options.MaxPhotoBytes) return new PhotoResult(PhotoOutcome.TooLarge);

        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, ct);
        var bytes = buffer.ToArray();
        if (bytes.Length > options.MaxPhotoBytes) return new PhotoResult(PhotoOutcome.TooLarge);

        var contentType = ImageSignature.Detect(bytes);
        if (contentType is null) return new PhotoResult(PhotoOutcome.InvalidImage);

        var photo = await repo.GetPhotoAsync(userId, ct);
        if (photo is null)
        {
            photo = ProfilePhoto.New(userId);
            await repo.AddAsync(photo, ct);
        }
        photo.Replace(contentType, bytes);

        var profile = await repo.GetOrCreateAsync(userId, ct);
        profile.SetPhoto(clock.UtcNow);
        await uow.SaveChangesAsync(ct);
        return new PhotoResult(PhotoOutcome.Saved, profile.PhotoVersion!.Value.UtcTicks.ToString());
    }
}

public class GetPhoto(IProfileRepository repo)
{
    public async Task<PhotoContent?> ExecuteAsync(Guid userId, CancellationToken ct = default)
        => await repo.GetPhotoAsync(userId, ct) is { } p ? new PhotoContent(p.ContentType, p.Content) : null;
}

public class RemovePhoto(IProfileRepository repo, IUnitOfWork uow)
{
    public async Task ExecuteAsync(Guid userId, CancellationToken ct = default)
    {
        if (await repo.GetPhotoAsync(userId, ct) is { } photo) repo.Remove(photo);
        (await repo.GetProfileAsync(userId, ct))?.RemovePhoto();
        await uow.SaveChangesAsync(ct);
    }
}
