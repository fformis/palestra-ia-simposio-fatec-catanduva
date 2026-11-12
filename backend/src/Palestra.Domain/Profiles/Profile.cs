namespace Palestra.Domain.Profiles;

public class Profile
{
    private Profile() { }

    public Guid UserId { get; private set; }
    public string? Bio { get; private set; }
    /// <summary>Muda a cada troca de foto; nulo = sem foto.</summary>
    public DateTimeOffset? PhotoVersion { get; private set; }

    public static Profile New(Guid userId) => new() { UserId = userId };

    /// <summary>RF-06: texto opcional com limite; devolve falso (sem alterar) se exceder.</summary>
    public bool SetBio(string? text, int maxLength)
    {
        var bio = string.IsNullOrWhiteSpace(text) ? null : text.Trim();
        if (bio?.Length > maxLength) return false;
        Bio = bio;
        return true;
    }

    public void SetPhoto(DateTimeOffset now) => PhotoVersion = now;
    public void RemovePhoto() => PhotoVersion = null;
}

public class ProfilePhoto
{
    private ProfilePhoto() { }

    public Guid UserId { get; private set; }
    public string ContentType { get; private set; } = "";
    public byte[] Content { get; private set; } = [];

    public static ProfilePhoto New(Guid userId) => new() { UserId = userId };

    public void Replace(string contentType, byte[] content) => (ContentType, Content) = (contentType, content);
}

/// <summary>RF-05/RNF-02: identifica a imagem pelos primeiros bytes, sem confiar em nome ou tipo informado.</summary>
public static class ImageSignature
{
    public static string? Detect(ReadOnlySpan<byte> bytes)
    {
        if (bytes.StartsWith<byte>([0xFF, 0xD8, 0xFF])) return "image/jpeg";
        if (bytes.StartsWith<byte>([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) return "image/png";
        if (bytes.Length >= 12 && bytes.StartsWith("RIFF"u8) && bytes.Slice(8, 4).SequenceEqual("WEBP"u8)) return "image/webp";
        return null;
    }
}
