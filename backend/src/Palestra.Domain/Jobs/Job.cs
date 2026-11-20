using Palestra.Domain.Profiles;

namespace Palestra.Domain.Jobs;

/// <summary>Limites de texto da vaga (vêm da configuração).</summary>
public record JobLimits(int MaxTitleLength = 100, int MaxDescriptionLength = 500)
{
    public const int MaxCompanyLength = 150;
    /// <summary>Limite técnico do texto gravado, com os marcadores de formatação.</summary>
    public const int MaxDescriptionStoredLength = 2000;
    public const decimal MaxSalary = 9_999_999_999.99m;
}

public class Job
{
    private Job() { }

    public Guid Id { get; private set; }
    public Guid OwnerId { get; private set; }
    public string Title { get; private set; } = "";
    public string? Company { get; private set; }
    public string Description { get; private set; } = "";
    public List<Benefit> Benefits { get; private set; } = [];
    public ContractType ContractType { get; private set; }
    public decimal Salary { get; private set; }
    public JobStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    /// <summary>Muda a cada troca de imagem; nulo = ilustração padrão.</summary>
    public DateTimeOffset? ImageVersion { get; private set; }

    /// <summary>RF-03/RF-06/RF-07: cria a vaga do anunciante; data de criação vem do relógio; status padrão Ativo.</summary>
    public static (Job? Job, Dictionary<string, string> Errors) Create(
        Guid ownerId, DateTimeOffset now, JobLimits limits,
        string? title, string? company, string? description, IEnumerable<string>? benefits,
        string? contractType, decimal? salary, string? status)
    {
        var job = new Job { Id = Guid.NewGuid(), OwnerId = ownerId, CreatedAt = now };
        var errors = job.Update(limits, title, company, description, benefits, contractType, salary, status ?? "active");
        return (errors.Count == 0 ? job : null, errors);
    }

    /// <summary>RF-05/RF-08: valida e aplica os dados; dono e data de criação nunca mudam. Devolve os erros por campo.</summary>
    public Dictionary<string, string> Update(
        JobLimits limits, string? title, string? company, string? description, IEnumerable<string>? benefits,
        string? contractType, decimal? salary, string? status)
    {
        var errors = new Dictionary<string, string>();
        var t = Text.Required(errors, "title", title, limits.MaxTitleLength);
        var c = Text.Optional(errors, "company", company, JobLimits.MaxCompanyLength);

        var d = description?.Trim() ?? "";
        if (d.Length == 0) errors["description"] = "required";
        else if (d.Length > JobLimits.MaxDescriptionStoredLength || JobDescription.VisibleLength(d) > limits.MaxDescriptionLength)
            errors["description"] = "too_long";

        var parsedBenefits = (benefits ?? []).Select(JobCodes.ParseBenefit).ToList();
        if (parsedBenefits.Any(b => b is null)) errors["benefits"] = "invalid";

        var ct = JobCodes.ParseContract(contractType);
        if (string.IsNullOrWhiteSpace(contractType)) errors["contractType"] = "required";
        else if (ct is null) errors["contractType"] = "invalid";

        if (salary is null) errors["salary"] = "required";
        else if (salary <= 0 || salary > JobLimits.MaxSalary || decimal.Round(salary.Value, 2) != salary) errors["salary"] = "invalid";

        var st = JobStatus.Active;
        if (string.IsNullOrWhiteSpace(status)) errors["status"] = "required";
        else if (JobCodes.ParseStatus(status) is { } s) st = s;
        else errors["status"] = "invalid";

        if (errors.Count > 0) return errors;

        (Title, Company, Description, ContractType, Salary, Status) = (t, c, d, ct!.Value, salary!.Value, st);
        Benefits = parsedBenefits.Select(b => b!.Value).Distinct().Order().ToList();
        return errors;
    }

    public bool IsOwner(Guid userId) => OwnerId == userId;

    /// <summary>RF-10: vaga inativa só é visível ao anunciante.</summary>
    public bool IsVisibleTo(Guid userId) => Status == JobStatus.Active || IsOwner(userId);

    public void SetImage(DateTimeOffset now) => ImageVersion = now;
    public void RemoveImage() => ImageVersion = null;
}

public class JobImage
{
    private JobImage() { }

    public Guid JobId { get; private set; }
    public string ContentType { get; private set; } = "";
    public byte[] Content { get; private set; } = [];

    public static JobImage New(Guid jobId) => new() { JobId = jobId };

    public void Replace(string contentType, byte[] content) => (ContentType, Content) = (contentType, content);
}

/// <summary>RF-12: no máximo uma curtida por usuário e vaga (chave composta).</summary>
public class JobLike
{
    private JobLike() { }

    public Guid JobId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public static JobLike New(Guid jobId, Guid userId, DateTimeOffset now) => new() { JobId = jobId, UserId = userId, CreatedAt = now };
}

/// <summary>RF-16: no máximo uma candidatura ativa por usuário e vaga; desistir apaga o registro (RF-17).</summary>
public class JobApplication
{
    private JobApplication() { }

    public Guid JobId { get; private set; }
    public Guid UserId { get; private set; }
    public DateTimeOffset AppliedAt { get; private set; }

    public static JobApplication New(Guid jobId, Guid userId, DateTimeOffset now) => new() { JobId = jobId, UserId = userId, AppliedAt = now };
}
