using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Api;

internal sealed class VocabDocument
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("english")]
    public string? English { get; set; }

    [JsonProperty("description")]
    public string? Description { get; set; }

    [JsonProperty("translations")]
    public Dictionary<string, string>? Translations { get; set; }

    [JsonProperty("files")]
    public Dictionary<string, string>? Files { get; set; }

    [JsonExtensionData]
    public Dictionary<string, JToken>? ExtraProperties { get; set; }
}
