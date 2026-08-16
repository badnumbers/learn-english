using System.Text.RegularExpressions;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;

namespace Api;

public sealed class VocabRepository
{
    private const int MaxItems = 100;
    private static readonly Regex Whitespace = new(@"\s+", RegexOptions.Compiled);

    private readonly Container _container;
    private readonly MediaUrlResolver _media;

    public VocabRepository(CosmosClient client, IConfiguration config, MediaUrlResolver media)
    {
        var database = config["COSMOS_DATABASE"] ?? "learn-english";
        var container = config["COSMOS_CONTAINER"] ?? "vocab";
        _container = client.GetContainer(database, container);
        _media = media;
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

    public async Task<IReadOnlyList<VocabItemResponse>> GetBySlugsAsync(
        IReadOnlyList<string> slugs,
        CancellationToken cancellationToken)
    {
        if (slugs.Count == 0)
        {
            return [];
        }

        var keys = slugs.Select(slug => (id: slug, partitionKey: new PartitionKey(slug))).ToList();
        var response = await _container.ReadManyItemsAsync<VocabDocument>(keys, cancellationToken: cancellationToken);

        var found = response.Resource.ToDictionary(doc => doc.Id, StringComparer.Ordinal);

        return slugs.Select(slug =>
        {
            if (found.TryGetValue(slug, out var doc))
            {
                var english = string.IsNullOrWhiteSpace(doc.English) ? slug : doc.English;
                return new VocabItemResponse(
                    doc.Id,
                    english,
                    NormalizeTranslations(doc.Translations),
                    doc.Image ? _media.ImageUrl(doc.Id) : null,
                    Found: true);
            }

            return new VocabItemResponse(slug, slug, null, null, Found: false);
        }).ToList();
    }

    private static string Normalize(string value) =>
        Whitespace.Replace(value.Trim().ToLowerInvariant(), "-");

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
}
