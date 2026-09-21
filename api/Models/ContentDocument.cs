using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Api;

internal sealed class ContentDocument
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("description")]
    public string? Description { get; set; }

    [JsonProperty("context")]
    public string? Context { get; set; }

    [JsonProperty("translationNotes")]
    public string? TranslationNotes { get; set; }

    [JsonProperty("tags")]
    public List<string>? Tags { get; set; }

    [JsonProperty("style")]
    public string? Style { get; set; }

    [JsonProperty("elements")]
    public List<ContentElementDocument>? Elements { get; set; }

    [JsonProperty("english")]
    public string? English { get; set; }

    [JsonProperty("translations")]
    public Dictionary<string, string>? Translations { get; set; }

    [JsonProperty("files")]
    public Dictionary<string, string>? Files { get; set; }

    [JsonExtensionData]
    public Dictionary<string, JToken>? ExtraProperties { get; set; }
}

internal sealed class ContentElementDocument
{
    [JsonProperty("type")]
    public string? Type { get; set; }

    [JsonProperty("file")]
    public string? File { get; set; }

    [JsonProperty("translations")]
    public Dictionary<string, string>? Translations { get; set; }

    [JsonProperty("text")]
    public string? Text { get; set; }

    [JsonProperty("audio")]
    public string? Audio { get; set; }

    [JsonExtensionData]
    public Dictionary<string, JToken>? ExtraProperties { get; set; }
}
