using Newtonsoft.Json;

namespace Api;

internal sealed class VocabDocument
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("english")]
    public string? English { get; set; }

    [JsonProperty("translations")]
    public Dictionary<string, string>? Translations { get; set; }

    [JsonProperty("image")]
    public bool Image { get; set; }

    [JsonProperty("audio")]
    public bool Audio { get; set; }
}
