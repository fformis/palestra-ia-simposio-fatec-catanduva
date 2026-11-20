using Palestra.Application.Auth;
using Palestra.Application.Profiles;
using Palestra.Domain.Profiles;

namespace Palestra.Application.Jobs;

public class UploadJobImage(IJobRepository repo, IUnitOfWork uow, IClock clock, JobsOptions options, JobReader reader)
{
    /// <summary>RF-04/RNF-02: só o dono; até o limite e com assinatura de imagem válida (mesma regra da foto de perfil).</summary>
    public async Task<JobResult<string>> ExecuteAsync(Guid userId, Guid jobId, Stream content, long length, CancellationToken ct = default)
    {
        var job = await reader.FindOwnedAsync(jobId, userId, ct);
        if (job is null) return JobResult<string>.Fail(JobErrors.NotFound);
        if (length > options.MaxImageBytes) return JobResult<string>.Fail(JobErrors.ImageTooLarge);

        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, ct);
        var bytes = buffer.ToArray();
        if (bytes.Length > options.MaxImageBytes) return JobResult<string>.Fail(JobErrors.ImageTooLarge);

        var contentType = ImageSignature.Detect(bytes);
        if (contentType is null) return JobResult<string>.Fail(JobErrors.InvalidImage);

        var image = await repo.GetImageAsync(jobId, ct);
        if (image is null)
        {
            image = Domain.Jobs.JobImage.New(jobId);
            await repo.AddAsync(image, ct);
        }
        image.Replace(contentType, bytes);
        job.SetImage(clock.UtcNow);
        await uow.SaveChangesAsync(ct);
        return new(job.ImageVersion!.Value.UtcTicks.ToString());
    }
}

public class GetJobImage(IJobRepository repo, JobReader reader)
{
    public async Task<PhotoContent?> ExecuteAsync(Guid userId, Guid jobId, CancellationToken ct = default)
    {
        if (await reader.FindVisibleAsync(jobId, userId, ct) is null) return null;
        return await repo.GetImageAsync(jobId, ct) is { } i ? new PhotoContent(i.ContentType, i.Content) : null;
    }
}

public class RemoveJobImage(IJobRepository repo, IUnitOfWork uow, JobReader reader)
{
    public async Task<bool> ExecuteAsync(Guid userId, Guid jobId, CancellationToken ct = default)
    {
        var job = await reader.FindOwnedAsync(jobId, userId, ct);
        if (job is null) return false;
        if (await repo.GetImageAsync(jobId, ct) is { } image) repo.Remove(image);
        job.RemoveImage();
        await uow.SaveChangesAsync(ct);
        return true;
    }
}
