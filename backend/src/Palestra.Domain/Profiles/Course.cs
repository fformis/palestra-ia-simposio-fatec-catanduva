namespace Palestra.Domain.Profiles;

public class Course : ITimelineItem
{
    public const int MaxHours = 99_999;

    private Course() { }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Name { get; private set; } = "";
    public string Institution { get; private set; } = "";
    public int Hours { get; private set; }
    public DateOnly Start { get; private set; }
    public DateOnly? End { get; private set; }

    public static Course New(Guid userId) => new() { Id = Guid.NewGuid(), UserId = userId };

    public Dictionary<string, string> Update(string? name, string? institution, int? hours, string? start, string? end, DateOnly currentMonth)
    {
        var errors = new Dictionary<string, string>();
        var n = Text.Required(errors, "name", name, 150);
        var i = Text.Required(errors, "institution", institution, 150);
        if (hours is null) errors["hours"] = "required";
        else if (hours is < 1 or > MaxHours) errors["hours"] = "invalid";
        var (s, e) = Period.Validate(start, end, currentMonth, errors);
        if (errors.Count > 0) return errors;

        (Name, Institution, Hours, Start, End) = (n, i, hours!.Value, s, e);
        return errors;
    }
}
