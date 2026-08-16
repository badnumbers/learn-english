using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace Api;

/// <summary>
/// Public blob URLs: {MEDIA_BASE_URL}/{container}/{documentId}
/// </summary>
public sealed class MediaUrlResolver
{
    private static readonly Regex Slug = new(
        @"^[a-z0-9]+(?:-[a-z0-9]+)*$",
        RegexOptions.Compiled);

    private readonly string? _baseUrl;
    private readonly string _imagesContainer;
    private readonly string _audioContainer;

    public MediaUrlResolver(IConfiguration config)
    {
        _baseUrl = TrimTrailingSlash(config["MEDIA_BASE_URL"]);
        _imagesContainer = string.IsNullOrWhiteSpace(config["MEDIA_IMAGES_CONTAINER"])
            ? "images"
            : config["MEDIA_IMAGES_CONTAINER"]!.Trim().Trim('/');
        _audioContainer = string.IsNullOrWhiteSpace(config["MEDIA_AUDIO_CONTAINER"])
            ? "audio"
            : config["MEDIA_AUDIO_CONTAINER"]!.Trim().Trim('/');
    }

    public string? ImageUrl(string documentId) => Combine(_imagesContainer, documentId);

    public string? AudioUrl(string documentId) => Combine(_audioContainer, documentId);

    private string? Combine(string container, string documentId)
    {
        if (string.IsNullOrWhiteSpace(_baseUrl) || !Slug.IsMatch(documentId))
        {
            return null;
        }

        return $"{_baseUrl}/{container}/{documentId}";
    }

    private static string? TrimTrailingSlash(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim().TrimEnd('/');
    }
}
