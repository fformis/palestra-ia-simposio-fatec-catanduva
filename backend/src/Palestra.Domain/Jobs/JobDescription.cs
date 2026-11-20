using System.Text.RegularExpressions;

namespace Palestra.Domain.Jobs;

/// <summary>
/// RF-03: a descrição usa um Markdown restrito — <c>**negrito**</c>, <c>*itálico*</c>,
/// linhas <c>- item</c> e <c>1. item</c>. O limite conta só o texto visível, sem os marcadores.
/// Quebras de linha não contam. A mesma regra existe no frontend (<c>markdown.ts</c>).
/// </summary>
public static partial class JobDescription
{
    public static int VisibleLength(string? text)
    {
        if (string.IsNullOrEmpty(text)) return 0;
        return text.Replace("\r", "").Split('\n')
            .Sum(line => ListPrefix().Replace(line, "").Replace("*", "").Length);
    }

    [GeneratedRegex(@"^\s*(- |\d+\. )")]
    private static partial Regex ListPrefix();
}
