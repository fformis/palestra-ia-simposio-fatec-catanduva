namespace Palestra.Domain.Profiles;

public enum EducationLevel { Fundamental, Medio, Tecnico, Superior, PosMba, Mestrado, Doutorado }

public static class EducationLevels
{
    private static readonly Dictionary<string, EducationLevel> ByCode = new()
    {
        ["fundamental"] = EducationLevel.Fundamental,
        ["medio"] = EducationLevel.Medio,
        ["tecnico"] = EducationLevel.Tecnico,
        ["superior"] = EducationLevel.Superior,
        ["pos_mba"] = EducationLevel.PosMba,
        ["mestrado"] = EducationLevel.Mestrado,
        ["doutorado"] = EducationLevel.Doutorado,
    };

    public static bool TryParse(string? code, out EducationLevel level) => ByCode.TryGetValue(code?.Trim() ?? "", out level);

    public static string ToCode(EducationLevel level) => ByCode.First(p => p.Value == level).Key;
}

public class Education : ITimelineItem
{
    private Education() { }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Institution { get; private set; } = "";
    public string Course { get; private set; } = "";
    public EducationLevel Level { get; private set; }
    public DateOnly Start { get; private set; }
    public DateOnly? End { get; private set; }
    public string? Description { get; private set; }

    public static Education New(Guid userId) => new() { Id = Guid.NewGuid(), UserId = userId };

    public Dictionary<string, string> Update(string? institution, string? course, string? level, string? start, string? end, string? description, DateOnly currentMonth)
    {
        var errors = new Dictionary<string, string>();
        var i = Text.Required(errors, "institution", institution, 150);
        var c = Text.Required(errors, "course", course, 150);
        EducationLevel l = default;
        if (string.IsNullOrWhiteSpace(level)) errors["level"] = "required";
        else if (!EducationLevels.TryParse(level, out l)) errors["level"] = "invalid";
        var (s, e) = Period.Validate(start, end, currentMonth, errors);
        var d = Text.Optional(errors, "description", description, 1000);
        if (errors.Count > 0) return errors;

        (Institution, Course, Level, Start, End, Description) = (i, c, l, s, e, d);
        return errors;
    }
}
