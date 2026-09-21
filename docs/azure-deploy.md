# Deploy to Azure

Azure Static Web Apps managed APIs only support up to .NET 9 isolated. This API is .NET 10, so it runs as a **separate Function App**. A **Standard** Static Web App hosts the Vite frontend and, after you link them, proxies `/api/*` to that Function App.

Students use the Static Web App URL (for this deployment: [https://kind-ocean-0ce852303.7.azurestaticapps.net](https://kind-ocean-0ce852303.7.azurestaticapps.net)). They do not need the Function App hostname.

GitHub Actions deploys each half from `main`:

- [`.github/workflows/azure-static-web-apps-kind-ocean-0ce852303.yml`](../.github/workflows/azure-static-web-apps-kind-ocean-0ce852303.yml) — frontend (`web/` → `dist`)
- [`.github/workflows/deploy-api.yml`](../.github/workflows/deploy-api.yml) — API (`api/` → Function App `fapp-borderlands-learn-english`)

A push that touches both can start **two** workflow runs. GitHub titles each run with the **commit message**; the workflow name is the smaller label (`Azure Static Web Apps CI/CD` vs `Deploy API to Azure Functions`).

This deployment’s resource names (same resource group as Cosmos and Storage):

- Function App: `fapp-borderlands-learn-english`
- User-assigned managed identity: `mi-borderlands-learn-english`
- Static Web App hostname: `kind-ocean-0ce852303.7.azurestaticapps.net`

## 1. Confirm Cosmos and Storage

In Cosmos Data Explorer, confirm database `learn-english` and container `languageitems` with partition key `/id`. One document is one language item (an ordered list of elements). On **Keys**, copy the primary connection string.

On the media storage account:

1. Enable **Allow Blob anonymous access**.
2. Set containers `images` and `audio` to anonymous access **Blob** (not **Container**).
3. Copy the blob endpoint with no trailing slash, for example `https://YOUR_ACCOUNT.blob.core.windows.net`. That is `MEDIA_BASE_URL`.

See [blob-media.md](blob-media.md). If Cosmos is limited to selected networks, allow the Function App or Azure services, or the API returns 502.

## 2. Create the Function App

1. [Azure portal](https://portal.azure.com) → **Create a resource** → **Function App**.
2. Hosting: **Flex Consumption**.
3. Same subscription and resource group as Cosmos and Storage.
4. Region close to Cosmos (unsupported Flex regions are hidden).
5. Runtime stack **.NET**, version **10**.
6. Storage: let the portal create a **new** host storage account. Do not reuse the public media account.
7. Create. Do not add functions in the portal; GitHub publishes `api/`.

On **Overview**, the **name** at the top is `AZURE_FUNCTIONAPP_NAME` in `deploy-api.yml` (not the hostname). Keep that env value in sync if you recreate the app.

The HTTP route is `content`. Functions default `routePrefix` is `api`, so the live path is `/api/content`. Do not clear `routePrefix` in [api/host.json](../api/host.json).

## 3. Function App settings

Function App → **Settings** → **Environment variables** (sometimes **Configuration** / **Application settings**). Add:

- `COSMOS_CONNECTION_STRING` — Cosmos primary connection string
- `MEDIA_BASE_URL` — blob endpoint, no trailing slash

Optional (repo defaults): `COSMOS_DATABASE` = `learn-english`, `COSMOS_CONTAINER` = `languageitems`, `MEDIA_IMAGES_CONTAINER` = `images`, `MEDIA_AUDIO_CONTAINER` = `audio`.

Leave `AzureWebJobsStorage` and `FUNCTIONS_WORKER_RUNTIME` as the portal set them.

## 4. Create the Static Web App

Repo: `https://github.com/badnumbers/learn-english.git`, branch `main`.

1. **Create a resource** → **Static Web App**.
2. Same resource group. Plan: **Standard** (Free cannot link an external Function App).
3. Source: **GitHub**. Authorize if asked. Repository `learn-english`, branch `main`.
4. Build details:
   - App location: `web`
   - Api location: **leave empty** (do not put `api`)
   - Output location: `dist`
5. Create. Azure commits a workflow under `.github/workflows/` and stores a deployment token as a GitHub secret.

If you have local commits that are not on GitHub yet, Azure’s workflow commit will **diverge** `main`. Rebase (or pull) so both histories are kept, then push. Do not force-push over Azure’s workflow commit.

Open the generated workflow and confirm `api_location` is `""`. [web/public/staticwebapp.config.json](../web/public/staticwebapp.config.json) rewrites unknown paths to `index.html` so `/learn` works; Vite copies that file into `dist`.

Deployment Center on the Function App is optional. It can record “deploy from this GitHub repo” without creating login secrets, and it has **no project-path field**. Auth for Flex Consumption is the managed identity below, not a publish profile.

## 5. Let GitHub deploy the Function App (OIDC)

Flex Consumption has no Kudu site. A publish profile fails with `Failed to fetch Kudu App Settings` / 401. GitHub must log in as a **user-assigned managed identity**.

**A. Create the identity**

1. **Create a resource** → **User Assigned Managed Identity**.
2. Same resource group. Name e.g. `mi-borderlands-learn-english`. Create.

**B. Federated credential (GitHub → this identity)**

1. Identity → **Federated credentials** → **Add credential**.
2. Scenario: **GitHub Actions deploying Azure resources**.
3. Entity: **Branch**, branch `main`.
4. If the form asks for names: organisation `badnumbers`, repository `learn-english`.
5. If it asks for numeric IDs instead:
   - Organisation ID: `5503879` (`badnumbers` is a GitHub **user**, not an org — that ID is still correct)
   - Repository ID: `1335257914`

Azure fills in **issuer** (`https://token.actions.githubusercontent.com`) and **subject** (`repo:badnumbers/learn-english:ref:refs/heads/main`) itself. If you get **Credential couldn't be added (Conflict)** / issuer and subject already exist, the credential is already there. Cancel and use the existing row.

**C. Website Contributor on the Function App**

1. Function App → **Access control (IAM)** → **Add** → **Add role assignment**.
2. Role: **Website Contributor**.
3. Members: **Managed identity** → pick `mi-borderlands-learn-english`. Review + assign.

**D. GitHub secrets** (IDs, not passwords)

- Identity **Overview** → **Client ID** → secret `AZURE_CLIENT_ID`
- Identity **Overview** may also show **Subscription ID**; or copy it from the Function App Overview → secret `AZURE_SUBSCRIPTION_ID`
- **Tenant ID** is often missing on the identity blade. Portal search → **Microsoft Entra ID** → **Overview** → **Tenant ID** (sometimes labelled **Directory ID**). Secret `AZURE_TENANT_ID`

GitHub → `learn-english` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret** for each of the three names above (must match [deploy-api.yml](../.github/workflows/deploy-api.yml)).

Push to `main` (or **Actions** → **Deploy API to Azure Functions** → **Run workflow**). Login failures mean a secret name or federated subject is wrong. Do not use `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` for this app.

## 6. Link `/api` to the Function App

Until this is done, the frontend loads but `/api/content` is Azure’s 404 HTML and the page shows “Could not load this list.”

1. Static Web App → **APIs** (sometimes under **Settings**).
2. **Production** → **Link**.
3. Backend type **Function App** → `fapp-borderlands-learn-english` → Link.

`https://<static-app>/api/content` is then proxied to the Function App. Direct hits to `*.azurewebsites.net` may return 401 after linking; that is expected. Confirm the Static Web App workflow still has `api_location: ""`.

## 7. Find the URL and check it

Static Web App → **Overview** → URL at the top. Current production URL:

[https://kind-ocean-0ce852303.7.azurestaticapps.net](https://kind-ocean-0ce852303.7.azurestaticapps.net)

1. That origin loads the home page.
2. `https://kind-ocean-0ce852303.7.azurestaticapps.net/api/content?i=coat` returns JSON (use a slug that exists in Cosmos).
3. `https://kind-ocean-0ce852303.7.azurestaticapps.net/learn?items=coat,hat,shirt,shoes&title=clothing` shows the items; image and audio load from blob URLs.
4. The in-page **QR** code encodes the current page URL and should open the same list on a phone.

If the API returns 502, check Function App logs and `COSMOS_CONNECTION_STRING`. If media 404s, check `MEDIA_BASE_URL` and container anonymous access.
