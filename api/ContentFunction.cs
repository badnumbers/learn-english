using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Api;

public sealed class ContentFunction
{
    private readonly ContentRepository _repository;
    private readonly ILogger<ContentFunction> _logger;

    public ContentFunction(ContentRepository repository, ILogger<ContentFunction> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    [Function("Content")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "content")] HttpRequest req,
        CancellationToken cancellationToken)
    {
        var slugs = ContentRepository.ParseSlugs(req.Query["i"]);

        try
        {
            var items = await _repository.GetBySlugsAsync(slugs, cancellationToken);
            return new OkObjectResult(new { items });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load content for {Count} slug(s).", slugs.Count);
            return new ObjectResult(new { error = "Could not load content." })
            {
                StatusCode = StatusCodes.Status502BadGateway
            };
        }
    }
}
