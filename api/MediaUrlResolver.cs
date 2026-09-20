using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;

namespace Api;

/// <summary>
/// Public blob URLs: {MEDIA_BASE_URL}/{container}/{blobName}
/// blobName is a file name, optionally under up to two directory segments
/// (for example conversations/at-the-shop/01.mp3).
/// </summary>
public sealed class MediaUrlResolver
{
    private const int MaxDirectorySegments = 2;

    private static readonly Regex FileSegment = new(
        @"^[a-z0-9][a-z0-9._-]*\.[a-z0-9]+$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex DirectorySegment = new(
        @"^[a-z0-9][a-z0-9_-]*$",
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

    public string? ImageUrl(string? blobName) => Combine(_imagesContainer, blobName);

    public string? AudioUrl(string? blobName) => Combine(_audioContainer, blobName);

    private string? Combine(string container, string? blobName)
    {
        if (string.IsNullOrWhiteSpace(_baseUrl)
            || blobName is null
            || !IsSafeBlobName(blobName))
        {
            return null;
        }

        return $"{_baseUrl}/{container}/{blobName.Trim().Trim('/')}";
    }

    internal static bool IsSafeBlobName(string? blobName)
    {
        if (string.IsNullOrWhiteSpace(blobName))
        {
            return false;
        }

        var value = blobName.Trim().Trim('/');
        if (value.Contains('\\', StringComparison.Ordinal)
            || value.Contains("..", StringComparison.Ordinal)
            || value.Contains(':', StringComparison.Ordinal))
        {
            return false;
        }

        var parts = value.Split('/');
        if (parts.Length == 0 || parts.Length > MaxDirectorySegments + 1)
        {
            return false;
        }

        for (var i = 0; i < parts.Length - 1; i++)
        {
            if (!DirectorySegment.IsMatch(parts[i]))
            {
                return false;
            }
        }

        return FileSegment.IsMatch(parts[^1]);
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
