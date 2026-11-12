using System.Globalization;

namespace Palestra.Domain.Profiles;

/// <summary>Item de uma linha do tempo: pertence a um usuário e tem um período mês/ano.</summary>
public interface ITimelineItem
{
    Guid Id { get; }
    Guid UserId { get; }
    DateOnly Start { get; }
    DateOnly? End { get; }
}

/// <summary>Regras de período (mês/ano, sempre no dia 1) compartilhadas por ocupações, formações e cursos.</summary>
public static class Period
{
    public const string Format = "yyyy-MM";

    public static DateOnly MonthOf(DateTimeOffset now) => new(now.UtcDateTime.Year, now.UtcDateTime.Month, 1);

    public static string ToText(DateOnly month) => month.ToString(Format, CultureInfo.InvariantCulture);

    public static bool TryParse(string? text, out DateOnly month)
        => DateOnly.TryParseExact(text?.Trim(), Format, CultureInfo.InvariantCulture, DateTimeStyles.None, out month);

    /// <summary>
    /// RF-16: início obrigatório e não futuro; término opcional, não anterior ao início (pode ser futuro).
    /// Erros são registrados por campo (<c>start</c>/<c>end</c>).
    /// </summary>
    public static (DateOnly Start, DateOnly? End) Validate(string? start, string? end, DateOnly currentMonth, IDictionary<string, string> errors)
    {
        DateOnly s = default;
        DateOnly? e = null;

        if (string.IsNullOrWhiteSpace(start)) errors["start"] = "required";
        else if (!TryParse(start, out s)) errors["start"] = "invalid";
        else if (s > currentMonth) errors["start"] = "future_start";

        if (!string.IsNullOrWhiteSpace(end))
        {
            if (!TryParse(end, out var parsed)) errors["end"] = "invalid";
            else if (!errors.ContainsKey("start") && parsed < s) errors["end"] = "end_before_start";
            else e = parsed;
        }
        return (s, e);
    }

    /// <summary>RF-17: mais recente primeiro; em empate, itens sem término (atuais) antes; depois término mais recente.</summary>
    public static IReadOnlyList<T> Sort<T>(IEnumerable<T> items) where T : ITimelineItem
        => items.OrderByDescending(i => i.Start).ThenBy(i => i.End.HasValue).ThenByDescending(i => i.End).ToList();
}

internal static class Text
{
    public static string Required(IDictionary<string, string> errors, string field, string? value, int max)
    {
        var v = value?.Trim() ?? "";
        if (v.Length == 0) errors[field] = "required";
        else if (v.Length > max) errors[field] = "too_long";
        return v;
    }

    public static string? Optional(IDictionary<string, string> errors, string field, string? value, int max)
    {
        var v = value?.Trim();
        if (string.IsNullOrEmpty(v)) return null;
        if (v.Length > max) errors[field] = "too_long";
        return v;
    }
}
