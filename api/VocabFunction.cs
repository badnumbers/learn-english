using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Api;

public sealed class VocabFunction
{
    private readonly VocabRepository _repository;
    private readonly ILogger<VocabFunction> _logger;

    public VocabFunction(VocabRepository repository, ILogger<VocabFunction> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [Function("Vocab")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "vocab")] HttpRequest req,
        CancellationToken cancellationToken)
    {
        var slugs = VocabRepository.ParseSlugs(req.Query["w"]);

        try
        {
            var items = await _repository.GetBySlugsAsync(slugs, cancellationToken);
            return new OkObjectResult(new { items });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load vocabulary for {Count} slug(s).", slugs.Count);
            return new ObjectResult(new { error = "Could not load vocabulary." })
            {
                StatusCode = StatusCodes.Status502BadGateway
            };
        }
    }
}
