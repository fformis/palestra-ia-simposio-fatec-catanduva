using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Palestra.Application.Profiles;
using Palestra.Domain.Profiles;

namespace Palestra.Api.Controllers;

public record BioRequest(string? Bio);

/// <summary>Perfil do usuário autenticado: o dono vem sempre do cookie, nunca da rota (RF-02).</summary>
[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> Get([FromServices] GetProfile useCase, CancellationToken ct)
        => Ok(await useCase.ExecuteAsync(UserId, ct));

    [HttpPut("bio")]
    public async Task<IActionResult> Bio(BioRequest r, [FromServices] UpdateBio useCase, CancellationToken ct)
        => await useCase.ExecuteAsync(UserId, r.Bio, ct)
            ? NoContent()
            : BadRequest(new { code = "validation", fields = new { bio = "too_long" } });

    // ---- Foto ----

    [HttpPut("photo")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> UploadPhoto(IFormFile? file, [FromServices] UploadPhoto useCase, CancellationToken ct)
    {
        if (file is null) return BadRequest(new { code = "invalid_image" });
        await using var stream = file.OpenReadStream();
        var result = await useCase.ExecuteAsync(UserId, stream, file.Length, ct);
        return result.Outcome switch
        {
            PhotoOutcome.Saved => Ok(new { photoVersion = result.PhotoVersion }),
            PhotoOutcome.TooLarge => BadRequest(new { code = "image_too_large" }),
            _ => BadRequest(new { code = "invalid_image" }),
        };
    }

    [HttpGet("photo")]
    public async Task<IActionResult> Photo([FromServices] GetPhoto useCase, CancellationToken ct)
    {
        var photo = await useCase.ExecuteAsync(UserId, ct);
        if (photo is null) return NotFound(new { code = "not_found" });
        Response.Headers.XContentTypeOptions = "nosniff";
        Response.Headers.CacheControl = "private, max-age=31536000";
        return File(photo.Content, photo.ContentType);
    }

    [HttpDelete("photo")]
    public async Task<IActionResult> RemovePhoto([FromServices] RemovePhoto useCase, CancellationToken ct)
    {
        await useCase.ExecuteAsync(UserId, ct);
        return NoContent();
    }

    // ---- Ocupações ----

    [HttpPost("occupations")]
    public async Task<IActionResult> AddOccupation(OccupationInput input, [FromServices] SaveOccupation useCase, CancellationToken ct)
        => Saved(await useCase.ExecuteAsync(UserId, null, input, ct), created: true);

    [HttpPut("occupations/{id:guid}")]
    public async Task<IActionResult> EditOccupation(Guid id, OccupationInput input, [FromServices] SaveOccupation useCase, CancellationToken ct)
        => Saved(await useCase.ExecuteAsync(UserId, id, input, ct));

    [HttpDelete("occupations/{id:guid}")]
    public async Task<IActionResult> RemoveOccupation(Guid id, [FromServices] RemoveItem<Occupation> useCase, CancellationToken ct)
        => Removed(await useCase.ExecuteAsync(UserId, id, ct));

    // ---- Formações ----

    [HttpPost("educations")]
    public async Task<IActionResult> AddEducation(EducationInput input, [FromServices] SaveEducation useCase, CancellationToken ct)
        => Saved(await useCase.ExecuteAsync(UserId, null, input, ct), created: true);

    [HttpPut("educations/{id:guid}")]
    public async Task<IActionResult> EditEducation(Guid id, EducationInput input, [FromServices] SaveEducation useCase, CancellationToken ct)
        => Saved(await useCase.ExecuteAsync(UserId, id, input, ct));

    [HttpDelete("educations/{id:guid}")]
    public async Task<IActionResult> RemoveEducation(Guid id, [FromServices] RemoveItem<Education> useCase, CancellationToken ct)
        => Removed(await useCase.ExecuteAsync(UserId, id, ct));

    // ---- Cursos ----

    [HttpPost("courses")]
    public async Task<IActionResult> AddCourse(CourseInput input, [FromServices] SaveCourse useCase, CancellationToken ct)
        => Saved(await useCase.ExecuteAsync(UserId, null, input, ct), created: true);

    [HttpPut("courses/{id:guid}")]
    public async Task<IActionResult> EditCourse(Guid id, CourseInput input, [FromServices] SaveCourse useCase, CancellationToken ct)
        => Saved(await useCase.ExecuteAsync(UserId, id, input, ct));

    [HttpDelete("courses/{id:guid}")]
    public async Task<IActionResult> RemoveCourse(Guid id, [FromServices] RemoveItem<Course> useCase, CancellationToken ct)
        => Removed(await useCase.ExecuteAsync(UserId, id, ct));

    private IActionResult Saved<TDto>(SaveResult<TDto> result, bool created = false)
    {
        if (result.NotFound) return NotFound(new { code = "not_found" });
        if (result.Errors is not null) return BadRequest(new { code = "validation", fields = result.Errors });
        return created ? StatusCode(StatusCodes.Status201Created, result.Item) : Ok(result.Item);
    }

    private IActionResult Removed(bool found) => found ? NoContent() : NotFound(new { code = "not_found" });
}
