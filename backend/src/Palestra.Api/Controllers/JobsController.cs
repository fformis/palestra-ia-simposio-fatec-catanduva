using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Palestra.Application.Jobs;
using Palestra.Application.Profiles;

namespace Palestra.Api.Controllers;

/// <summary>Vagas, curtidas, candidaturas e candidatos (spec 009). O usuário vem sempre do cookie.</summary>
[ApiController]
[Authorize]
[Route("api/jobs")]
public class JobsController : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> Create(JobInput input, [FromServices] CreateJob useCase, CancellationToken ct)
        => ToResult(await useCase.ExecuteAsync(UserId, input, ct), created: true);

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, [FromServices] GetJob useCase, CancellationToken ct)
        => ToResult(await useCase.ExecuteAsync(UserId, id, ct));

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, JobInput input, [FromServices] UpdateJob useCase, CancellationToken ct)
        => ToResult(await useCase.ExecuteAsync(UserId, id, input, ct));

    // ---- Imagem ----

    [HttpPut("{id:guid}/image")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile? file, [FromServices] UploadJobImage useCase, CancellationToken ct)
    {
        if (file is null) return BadRequest(new { code = JobErrors.InvalidImage });
        await using var stream = file.OpenReadStream();
        var result = await useCase.ExecuteAsync(UserId, id, stream, file.Length, ct);
        return result.Error is null ? Ok(new { imageVersion = result.Value }) : Error(result.Error);
    }

    [HttpGet("{id:guid}/image")]
    public async Task<IActionResult> Image(Guid id, [FromServices] GetJobImage useCase, CancellationToken ct)
        => File(await useCase.ExecuteAsync(UserId, id, ct));

    [HttpDelete("{id:guid}/image")]
    public async Task<IActionResult> RemoveImage(Guid id, [FromServices] RemoveJobImage useCase, CancellationToken ct)
        => await useCase.ExecuteAsync(UserId, id, ct) ? NoContent() : Error(JobErrors.NotFound);

    // ---- Curtidas e candidaturas ----

    [HttpPut("{id:guid}/like")]
    public async Task<IActionResult> Like(Guid id, [FromServices] SetLike useCase, CancellationToken ct)
        => ToResult(await useCase.ExecuteAsync(UserId, id, on: true, ct));

    [HttpDelete("{id:guid}/like")]
    public async Task<IActionResult> Unlike(Guid id, [FromServices] SetLike useCase, CancellationToken ct)
        => ToResult(await useCase.ExecuteAsync(UserId, id, on: false, ct));

    [HttpPut("{id:guid}/application")]
    public async Task<IActionResult> Apply(Guid id, [FromServices] SetApplication useCase, CancellationToken ct)
        => ToResult(await useCase.ExecuteAsync(UserId, id, on: true, ct));

    [HttpDelete("{id:guid}/application")]
    public async Task<IActionResult> Withdraw(Guid id, [FromServices] SetApplication useCase, CancellationToken ct)
        => ToResult(await useCase.ExecuteAsync(UserId, id, on: false, ct));

    // ---- Candidatos (só o anunciante) ----

    [HttpGet("{id:guid}/candidates")]
    public async Task<IActionResult> Candidates(Guid id, [FromServices] ListCandidates useCase, CancellationToken ct)
        => ToResult(await useCase.ExecuteAsync(UserId, id, ct));

    [HttpGet("{id:guid}/candidates/{userId:guid}")]
    public async Task<IActionResult> Candidate(Guid id, Guid userId, [FromServices] GetCandidateProfile useCase, CancellationToken ct)
        => ToResult(await useCase.ExecuteAsync(UserId, id, userId, ct));

    [HttpGet("{id:guid}/candidates/{userId:guid}/photo")]
    public async Task<IActionResult> CandidatePhoto(Guid id, Guid userId, [FromServices] GetCandidatePhoto useCase, CancellationToken ct)
        => File(await useCase.ExecuteAsync(UserId, id, userId, ct));

    private IActionResult ToResult<T>(JobResult<T> result, bool created = false)
    {
        if (result.Errors is not null) return BadRequest(new { code = "validation", fields = result.Errors });
        if (result.Error is not null) return Error(result.Error);
        return created ? StatusCode(StatusCodes.Status201Created, result.Value) : Ok(result.Value);
    }

    private IActionResult Error(string code)
        => code == JobErrors.NotFound ? NotFound(new { code }) : BadRequest(new { code });

    /// <summary>Imagem com o tipo detectado no envio; nunca reinterpretada pelo navegador (RNF-02).</summary>
    private IActionResult File(PhotoContent? content)
    {
        if (content is null) return Error(JobErrors.NotFound);
        Response.Headers.XContentTypeOptions = "nosniff";
        Response.Headers.CacheControl = "private, max-age=31536000";
        return File(content.Content, content.ContentType);
    }
}
