using Palestra.Application.Auth;
using Palestra.Domain.Auth;
using Palestra.Infrastructure.Auth;

namespace Palestra.Tests.Auth;

public class RegisterTests
{
    [Fact] // RF-09
    public async Task Cadastro_novo_cria_pendente_e_envia_link()
    {
        var h = new Harness();
        var r = await h.Register.ExecuteAsync("Ana", "Silva", "Ana@X.com");
        Assert.True(r.Accepted);
        Assert.Equal(UserStatus.Pending, Assert.Single(h.Store.Users).Status);
        Assert.Contains("/definir-senha?token=", Assert.Single(h.Email.Sent).Body);
    }

    [Fact] // RF-07
    public async Task Cadastro_com_campo_vazio_ou_email_invalido_e_recusado()
    {
        var h = new Harness();
        var r = await h.Register.ExecuteAsync("", "Silva", "invalido");
        Assert.False(r.Accepted);
        Assert.Contains("firstName", r.Errors!.Keys);
        Assert.Contains("email", r.Errors.Keys);
        Assert.Empty(h.Email.Sent);
    }

    [Fact] // RF-08 / RF-12
    public async Task Cadastro_com_conta_ativa_nao_cria_usuario_e_avisa_o_dono()
    {
        var h = new Harness();
        await h.ActiveUser();
        var r = await h.Register.ExecuteAsync("Outra", "Pessoa", "ANA@x.com");
        Assert.True(r.Accepted);
        Assert.Single(h.Store.Users);
        Assert.Contains("já existe", Assert.Single(h.Email.Sent).Body);
    }

    [Fact] // RF-12
    public async Task Cadastro_de_conta_pendente_atualiza_nome_e_invalida_link_anterior()
    {
        var h = new Harness();
        await h.Register.ExecuteAsync("Ana", "Silva", "ana@x.com");
        var first = h.LastToken();
        await h.Register.ExecuteAsync("Bia", "Souza", "ana@x.com");
        Assert.Equal("Bia", Assert.Single(h.Store.Users).FirstName);
        Assert.Null(await h.Validate.ExecuteAsync(first));
        Assert.NotNull(await h.Validate.ExecuteAsync(h.LastToken()));
    }
}

public class SetPasswordTests
{
    [Fact] // RF-10
    public async Task Token_valido_ativa_a_conta_e_nao_pode_ser_reutilizado()
    {
        var h = new Harness();
        await h.Register.ExecuteAsync("Ana", "Silva", "ana@x.com");
        var token = h.LastToken();
        Assert.Equal(SetPasswordResult.Success, await h.SetPassword.ExecuteAsync(token, "senha1234"));
        Assert.Equal(UserStatus.Active, h.Store.Users[0].Status);
        Assert.Equal(SetPasswordResult.InvalidLink, await h.SetPassword.ExecuteAsync(token, "outra1234"));
    }

    [Fact] // RF-18
    public async Task Senha_com_menos_de_8_caracteres_e_recusada()
    {
        var h = new Harness();
        await h.Register.ExecuteAsync("Ana", "Silva", "ana@x.com");
        Assert.Equal(SetPasswordResult.WeakPassword, await h.SetPassword.ExecuteAsync(h.LastToken(), "1234567"));
        Assert.Equal(UserStatus.Pending, h.Store.Users[0].Status);
    }

    [Fact] // RF-11
    public async Task Link_expirado_e_invalido()
    {
        var h = new Harness();
        await h.Register.ExecuteAsync("Ana", "Silva", "ana@x.com");
        var token = h.LastToken();
        h.Clock.UtcNow = h.Clock.UtcNow.AddHours(25);
        Assert.Equal(SetPasswordResult.InvalidLink, await h.SetPassword.ExecuteAsync(token, "senha1234"));
        Assert.Null(await h.Validate.ExecuteAsync(token));
    }
}

public class ForgotPasswordTests
{
    [Fact] // RF-14
    public async Task Conta_ativa_recebe_email_e_inexistente_nao()
    {
        var h = new Harness();
        await h.ActiveUser();
        Assert.True(await h.Forgot.ExecuteAsync("ana@x.com"));
        Assert.Single(h.Email.Sent);
        h.Email.Sent.Clear();
        Assert.True(await h.Forgot.ExecuteAsync("ninguem@x.com"));
        Assert.Empty(h.Email.Sent);
    }

    [Fact] // RF-15 / RF-16
    public async Task Novo_pedido_invalida_o_anterior_e_senha_antiga_deixa_de_valer()
    {
        var h = new Harness();
        await h.ActiveUser();
        await h.Forgot.ExecuteAsync("ana@x.com");
        var first = h.LastToken();
        await h.Forgot.ExecuteAsync("ana@x.com");
        var second = h.LastToken();
        Assert.Equal(SetPasswordResult.InvalidLink, await h.SetPassword.ExecuteAsync(first, "nova12345"));
        Assert.Equal(SetPasswordResult.Success, await h.SetPassword.ExecuteAsync(second, "nova12345"));
        Assert.Equal(LoginOutcome.InvalidCredentials, (await h.Login.ExecuteAsync("ana@x.com", "senha1234")).Outcome);
        Assert.Equal(LoginOutcome.Success, (await h.Login.ExecuteAsync("ana@x.com", "nova12345")).Outcome);
    }
}

public class LoginTests
{
    [Fact] // RF-03
    public async Task Senha_correta_autentica()
    {
        var h = new Harness();
        await h.ActiveUser();
        var r = await h.Login.ExecuteAsync("ANA@x.com", "senha1234");
        Assert.Equal(LoginOutcome.Success, r.Outcome);
        Assert.Equal("Ana", r.User!.FirstName);
    }

    [Fact] // RF-04
    public async Task Senha_errada_e_email_inexistente_dao_o_mesmo_resultado()
    {
        var h = new Harness();
        await h.ActiveUser();
        var wrong = await h.Login.ExecuteAsync("ana@x.com", "errada");
        var unknown = await h.Login.ExecuteAsync("ninguem@x.com", "errada");
        Assert.Equal(wrong, unknown);
        Assert.Equal(LoginOutcome.InvalidCredentials, wrong.Outcome);
    }

    [Fact] // RF-05
    public async Task Conta_pendente_nao_entra()
    {
        var h = new Harness();
        await h.Register.ExecuteAsync("Ana", "Silva", "ana@x.com");
        Assert.Equal(LoginOutcome.Pending, (await h.Login.ExecuteAsync("ana@x.com", "qualquer")).Outcome);
    }

    [Fact] // RF-23
    public async Task Tres_falhas_bloqueiam_por_15_minutos_mesmo_com_senha_correta()
    {
        var h = new Harness();
        await h.ActiveUser();
        for (var i = 0; i < 3; i++) await h.Login.ExecuteAsync("ana@x.com", "errada");

        var locked = await h.Login.ExecuteAsync("ana@x.com", "senha1234");
        Assert.Equal(LoginOutcome.Locked, locked.Outcome);
        Assert.True(locked.RetryAfterSeconds > 0);

        h.Clock.UtcNow = h.Clock.UtcNow.AddMinutes(16);
        Assert.Equal(LoginOutcome.Success, (await h.Login.ExecuteAsync("ana@x.com", "senha1234")).Outcome);
        Assert.Empty(h.Store.Attempts);
    }
}

public class HasherTests
{
    [Fact] // RNF-01
    public void Pbkdf2_verifica_sem_guardar_texto_puro()
    {
        var hasher = new Pbkdf2PasswordHasher();
        var hash = hasher.Hash("senha1234");
        Assert.DoesNotContain("senha1234", hash);
        Assert.True(hasher.Verify("senha1234", hash));
        Assert.False(hasher.Verify("outra", hash));
    }
}
