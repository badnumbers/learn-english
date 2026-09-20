using System.Text.RegularExpressions;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Api;

public sealed class ContentRepository
{
    private const int MaxItems = 100;
    private static readonly Regex Whitespace = new(@"\s+", RegexOptions.Compiled);

    private readonly Container _container;
    private readonly MediaUrlResolver _media;
    private readonly ILogger<ContentRepository> _logger;

    public ContentRepository(
        CosmosClient client,
        IConfiguration config,
        MediaUrlResolver media,
        ILogger<ContentRepository> logger)
    {
        var database = config["COSMOS_DATABASE"] ?? "learn-english";
        var container = config["COSMOS_CONTAINER"] ?? "languageitems";
        _container = client.GetContainer(database, container);
        _media = media;
        _logger = logger;
    }

    public static IReadOnlyList<string> ParseSlugs(string? query)
    {
        if (string.IsNullOrWhiteSpace(query))
        {
            return [];
        }

        var seen = new HashSet<string>(StringComparer.Ordinal);
        var slugs = new List<string>();

        foreach (var part in query.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
        {
            var slug = Normalize(part);
            if (slug.Length == 0 || !seen.Add(slug))
            {
                continue;
            }

            slugs.Add(slug);
            if (slugs.Count >= MaxItems)
            {
                break;
            }
        }

        return slugs;
    }

    public async Task<IReadOnlyList<LanguageItemResponse>> GetBySlugsAsync(
        IReadOnlyList<string> slugs,
        CancellationToken cancellationToken)
    {
        if (slugs.Count == 0)
        {
            return [];
        }

        var keys = slugs.Select(slug => (id: slug, partitionKey: new PartitionKey(slug))).ToList();
        var response = await _container.ReadManyItemsAsync<ContentDocument>(keys, cancellationToken: cancellationToken);

        var found = response.Resource.ToDictionary(doc => doc.Id, StringComparer.Ordinal);

        return slugs.Select(slug =>
        {
            if (found.TryGetValue(slug, out var doc))
            {
                var id = string.IsNullOrWhiteSpace(doc.Id) ? slug : doc.Id.Trim();
                return new LanguageItemResponse(
                    id,
                    NormalizeStyle(doc.Style),
                    MapElements(doc, id),
                    Found: true);
            }

            return new LanguageItemResponse(slug, null, [], Found: false);
        }).ToList();
    }

    private IReadOnlyList<LanguageElementResponse> MapElements(ContentDocument doc, string id)
    {
        if (doc.Elements is { Count: > 0 })
        {
            return doc.Elements
                .Select(element => MapElement(element, id))
                .Where(element => element is not null)
                .Select(element => element!)
                .ToList();
        }

        return AdaptFlatDocument(doc, id);
    }

    private LanguageElementResponse? MapElement(ContentElementDocument element, string id)
    {
        var type = element.Type?.Trim().ToLowerInvariant();
        switch (type)
        {
            case "image":
            {
                var imageUrl = _media.ImageUrl(element.File?.Trim());
                if (imageUrl is null)
                {
                    return null;
                }

                return new LanguageElementResponse("image", imageUrl, null, null, null);
            }
            case "translations":
            {
                var translations = NormalizeTranslations(element.Translations);
                if (translations is null)
                {
                    return null;
                }

                return new LanguageElementResponse("translations", null, translations, null, null);
            }
            case "english":
            {
                var text = element.Text?.Trim();
                if (string.IsNullOrWhiteSpace(text))
                {
                    return null;
                }

                return new LanguageElementResponse(
                    "english",
                    null,
                    null,
                    text,
                    _media.AudioUrl(element.Audio?.Trim()));
            }
            default:
                if (!string.IsNullOrWhiteSpace(type))
                {
                    _logger.LogWarning("Ignoring unknown element type {Type} on language item {Id}.", type, id);
                }

                return null;
        }
    }

    private List<LanguageElementResponse> AdaptFlatDocument(ContentDocument doc, string id)
    {
        var elements = new List<LanguageElementResponse>();

        var imageUrl = _media.ImageUrl(FileName(doc.Files, "image"));
        if (imageUrl is not null)
        {
            elements.Add(new LanguageElementResponse("image", imageUrl, null, null, null));
        }

        var translations = NormalizeTranslations(doc.Translations);
        if (translations is not null)
        {
            elements.Add(new LanguageElementResponse("translations", null, translations, null, null));
        }

        var english = string.IsNullOrWhiteSpace(doc.English) ? id : doc.English.Trim();
        elements.Add(new LanguageElementResponse(
            "english",
            null,
            null,
            english,
            _media.AudioUrl(FileName(doc.Files, "audio"))));

        return elements;
    }

    private static string Normalize(string value) =>
        Whitespace.Replace(value.Trim().ToLowerInvariant(), "-");

    private static string? NormalizeStyle(string? style)
    {
        if (string.IsNullOrWhiteSpace(style))
        {
            return null;
        }

        var value = style.Trim().ToLowerInvariant();
        return value is "bubble-left" or "bubble-right" ? value : null;
    }

    private static IReadOnlyDictionary<string, string>? NormalizeTranslations(
        Dictionary<string, string>? translations)
    {
        if (translations is null || translations.Count == 0)
        {
            return null;
        }

        var cleaned = translations
            .Where(pair => !string.IsNullOrWhiteSpace(pair.Key) && !string.IsNullOrWhiteSpace(pair.Value))
            .ToDictionary(pair => pair.Key.Trim(), pair => pair.Value.Trim(), StringComparer.Ordinal);

        return cleaned.Count == 0 ? null : cleaned;
    }

    private static string? FileName(Dictionary<string, string>? files, string kind)
    {
        if (files is null)
        {
            return null;
        }

        foreach (var pair in files)
        {
            if (string.Equals(pair.Key, kind, StringComparison.OrdinalIgnoreCase)
                && !string.IsNullOrWhiteSpace(pair.Value))
            {
                return pair.Value.Trim();
            }
        }

        return null;
    }
}
