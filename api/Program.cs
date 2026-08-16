using Api;
using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services.AddSingleton(_ =>
{
    var connectionString = builder.Configuration["COSMOS_CONNECTION_STRING"];
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "Set COSMOS_CONNECTION_STRING in api/local.settings.json (or the Function App settings).");
    }

    return new CosmosClient(connectionString);
});

builder.Services.AddSingleton<MediaUrlResolver>();
builder.Services.AddSingleton<VocabRepository>();

builder.Build().Run();
