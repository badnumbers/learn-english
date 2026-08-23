using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace Api;

/// <summary>
/// Public blob URLs: {MEDIA_BASE_URL}/{container}/{fileName}
/// </summary>
public sealed class MediaUrlResolver
{
    private static readonly Regex FileName = new(
        @"^[a-z0-9][a-z0-9._-]*\.[a-z0-9]+$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

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

    public string? ImageUrl(string? fileName) => Combine(_imagesContainer, fileName);

    public string? AudioUrl(string? fileName) => Combine(_audioContainer, fileName);

    private string? Combine(string container, string? fileName)
    {
        if (string.IsNullOrWhiteSpace(_baseUrl)
            || fileName is null
            || !IsSafeFileName(fileName))
        {
            return null;
        }

        return $"{_baseUrl}/{container}/{fileName.Trim()}";
    }

    internal static bool IsSafeFileName(string? fileName) =>
        !string.IsNullOrWhiteSpace(fileName) && FileName.IsMatch(fileName.Trim());

    private static string? TrimTrailingSlash(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim().TrimEnd('/');
    }
}
