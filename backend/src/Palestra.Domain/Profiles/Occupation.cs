namespace Palestra.Domain.Profiles;

public class Occupation : ITimelineItem
{
    private Occupation() { }

    public Guid Id { get; private set; }
    public Guid UserId { get; private set; }
    public string Title { get; private set; } = "";
    public string Company { get; private set; } = "";
    public DateOnly Start { get; private set; }
    public DateOnly? End { get; private set; }
    public string? Description { get; private set; }

    public static Occupation New(Guid userId) => new() { Id = Guid.NewGuid(), UserId = userId };

    /// <summary>Valida e aplica os dados; devolve os erros por campo (vazio = aplicado).</summary>
    public Dictionary<string, string> Update(string? title, string? company, string? start, string? end, string? description, DateOnly currentMonth)
    {
        var errors = new Dictionary<string, string>();
        var t = Text.Required(errors, "title", title, 150);
        var c = Text.Required(errors, "company", company, 150);
        var (s, e) = Period.Validate(start, end, currentMonth, errors);
        var d = Text.Optional(errors, "description", description, 1000);
        if (errors.Count > 0) return errors;

        (Title, Company, Start, End, Description) = (t, c, s, e, d);
        return errors;
    }
}
