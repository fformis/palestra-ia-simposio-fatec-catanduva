namespace Palestra.Domain.Jobs;

public enum ContractType { Clt, Pj, Estagio }

public enum Benefit { Medical, Dental, Pet, Gympass, BirthdayOff }

public enum JobStatus { Active, Inactive }

/// <summary>RF-03: listas fixas da vaga e seus códigos no contrato (código desconhecido → nenhum valor).</summary>
public static class JobCodes
{
    private static readonly Dictionary<ContractType, string> Contracts = new()
    {
        [ContractType.Clt] = "clt",
        [ContractType.Pj] = "pj",
        [ContractType.Estagio] = "estagio",
    };

    private static readonly Dictionary<Benefit, string> Benefits = new()
    {
        [Benefit.Medical] = "medical",
        [Benefit.Dental] = "dental",
        [Benefit.Pet] = "pet",
        [Benefit.Gympass] = "gympass",
        [Benefit.BirthdayOff] = "birthday_off",
    };

    private static readonly Dictionary<JobStatus, string> Statuses = new()
    {
        [JobStatus.Active] = "active",
        [JobStatus.Inactive] = "inactive",
    };

    public static string ToCode(ContractType v) => Contracts[v];
    public static string ToCode(Benefit v) => Benefits[v];
    public static string ToCode(JobStatus v) => Statuses[v];

    public static ContractType? ParseContract(string? code) => Parse(Contracts, code);
    public static Benefit? ParseBenefit(string? code) => Parse(Benefits, code);
    public static JobStatus? ParseStatus(string? code) => Parse(Statuses, code);

    private static T? Parse<T>(Dictionary<T, string> map, string? code) where T : struct, Enum
    {
        foreach (var (value, text) in map)
            if (text == code?.Trim()) return value;
        return null;
    }
}
