using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Palestra.Application.Auth;
using Palestra.Domain.Auth;

namespace Palestra.Api.Controllers;

public record RegisterRequest(string? FirstName, string? LastName, string? Email);
public record TokenRequest(string? Token);
public record SetPasswordRequest(string? Token, string? Password);
public record ForgotPasswordRequest(string? Email);
public record LoginRequest(string? Email, string? Password);

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest r, [FromServices] RegisterUser useCase, CancellationToken ct)
    {
        var result = await useCase.ExecuteAsync(r.FirstName, r.LastName, r.Email, ct);
        return result.Accepted ? Accepted() : BadRequest(new { code = "validation", fields = result.Errors });
    }

    [HttpPost("password-links/validate")]
    public async Task<IActionResult> Validate(TokenRequest r, [FromServices] ValidatePasswordLink useCase, CancellationToken ct)
    {
        var purpose = await useCase.ExecuteAsync(r.Token, ct);
        return purpose is null
            ? StatusCode(StatusCodes.Status410Gone, new { code = "invalid_link" })
            : Ok(new { purpose = purpose == TokenPurpose.Activation ? "activation" : "reset" });
    }

    [HttpPost("set-password")]
    public async Task<IActionResult> SetPassword(SetPasswordRequest r, [FromServices] SetPassword useCase, CancellationToken ct)
        => await useCase.ExecuteAsync(r.Token, r.Password, ct) switch
        {
            SetPasswordResult.Success => NoContent(),
            SetPasswordResult.WeakPassword => BadRequest(new { code = "weak_password" }),
            _ => StatusCode(StatusCodes.Status410Gone, new { code = "invalid_link" }),
        };

    [HttpPost("forgot-password")]
    public async Task<IActionResult> Forgot(ForgotPasswordRequest r, [FromServices] ForgotPassword useCase, CancellationToken ct)
        => await useCase.ExecuteAsync(r.Email, ct) ? Accepted() : BadRequest(new { code = "validation" });

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest r, [FromServices] Login useCase, CancellationToken ct)
    {
        var result = await useCase.ExecuteAsync(r.Email, r.Password, ct);
        switch (result.Outcome)
        {
            case LoginOutcome.Success:
                var u = result.User!;
                var identity = new ClaimsIdentity(
                [
                    new Claim(ClaimTypes.NameIdentifier, u.Id.ToString()),
                    new Claim(ClaimTypes.Name, $"{u.FirstName} {u.LastName}"),
                    new Claim(ClaimTypes.Email, u.Email),
                ], CookieAuthenticationDefaults.AuthenticationScheme);
                await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(identity),
                    new AuthenticationProperties { IsPersistent = true });
                return Ok(u);
            case LoginOutcome.Pending:
                return StatusCode(StatusCodes.Status403Forbidden, new { code = "account_pending" });
            case LoginOutcome.Locked:
                return StatusCode(StatusCodes.Status423Locked, new { code = "locked", retryAfterSeconds = result.RetryAfterSeconds });
            default:
                return Unauthorized(new { code = "invalid_credentials" });
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me([FromServices] GetCurrentUser useCase, CancellationToken ct)
    {
        var id = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user = await useCase.ExecuteAsync(id, ct);
        return user is null ? Unauthorized() : Ok(user);
    }
}
