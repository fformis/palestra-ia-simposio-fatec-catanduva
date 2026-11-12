using System.Net;

namespace Palestra.Application.Auth;

public static class AuthEmails
{
    public static (string Subject, string Body) CreatePassword(string firstName, string link, int validityHours) =>
        ("Palestra: crie sua senha", Wrap(firstName,
            "Recebemos seu cadastro no Palestra. Para concluir, crie sua senha pelo link abaixo.",
            link, "Criar minha senha", validityHours));

    public static (string Subject, string Body) ResetPassword(string firstName, string link, int validityHours) =>
        ("Palestra: redefina sua senha", Wrap(firstName,
            "Recebemos um pedido para redefinir a senha da sua conta no Palestra.",
            link, "Criar nova senha", validityHours));

    public static (string Subject, string Body) AccountExists(string firstName, string loginUrl, string forgotUrl) =>
        ("Palestra: você já possui uma conta", $"""
            <p>Olá, {H(firstName)}!</p>
            <p>Alguém tentou criar uma conta no <strong>Palestra</strong> com este e-mail, mas ela já existe.</p>
            <p><a href="{H(loginUrl)}">Entrar</a> ou, se esqueceu a senha, <a href="{H(forgotUrl)}">use "Esqueci minha senha"</a>.</p>
            <p>Se não foi você, pode ignorar esta mensagem.</p>
            """);

    private static string Wrap(string firstName, string reason, string link, string action, int validityHours) => $"""
        <p>Olá, {H(firstName)}!</p>
        <p>{reason}</p>
        <p><a href="{H(link)}">{action}</a></p>
        <p>O link vale por {(validityHours == 24 ? "1 dia" : $"{validityHours} horas")} e só pode ser usado uma vez.</p>
        <p>Se você não fez essa solicitação, ignore esta mensagem.</p>
        """;

    private static string H(string s) => WebUtility.HtmlEncode(s);
}
