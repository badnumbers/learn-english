namespace Api;

public sealed record VocabItemResponse(
    string Id,
    string English,
    IReadOnlyDictionary<string, string>? Translations,
    string? ImageUrl,
    bool Found);
