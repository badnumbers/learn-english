namespace Api;

public sealed record LanguageItemResponse(
    string Id,
    string? Style,
    IReadOnlyList<LanguageElementResponse> Elements,
    bool Found);

public sealed record LanguageElementResponse(
    string Type,
    string? ImageUrl,
    IReadOnlyDictionary<string, string>? Translations,
    string? Text,
    string? AudioUrl);
