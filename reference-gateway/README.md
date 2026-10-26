# DesignForge reference gateway

Local gateway for the Figma plugin. It keeps provider credentials outside Figma and exposes one normalized endpoint.

## Run locally

```powershell
$env:DESIGNFORGE_GATEWAY_TOKEN = 'local-development-token'
node src/server.mjs
```

Optional local Pinterest OAuth setup:

```powershell
$env:PINTEREST_CLIENT_ID = 'your-app-client-id'
$env:PINTEREST_CLIENT_SECRET = 'your-app-client-secret'
$env:PINTEREST_REDIRECT_URI = 'http://127.0.0.1:8787/auth/pinterest/callback'
```

Open `http://127.0.0.1:8787/auth/pinterest/start` in a browser and approve access. The development gateway stores the resulting token only in memory; production must use encrypted server-side storage and refresh-token rotation.

The gateway status endpoint is `GET /api/pinterest/status` with the gateway bearer token. The Figma plugin's **Connect Pinterest** button opens the OAuth start URL; after approval, run a search in the plugin.

For encrypted persistence, generate a 32-byte key and provide it only to the gateway process:

```powershell
$bytes = [byte[]]::new(32); [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$env:DESIGNFORGE_TOKEN_ENCRYPTION_KEY = [Convert]::ToHexString($bytes).ToLower()
```

Without this key, local development remains memory-only. Production should use a managed secret store and protected file permissions.

The gateway stores the refresh token with the encrypted token record and refreshes the access token shortly before expiry. Use `.env.example` as the deployment checklist; do not commit a real `.env` file.

## Deploy

Build and run the included container with a managed secret store:

```powershell
docker build -t designforge-reference-gateway .
docker run --env-file .env -p 8787:8787 designforge-reference-gateway
```

Put the container behind an HTTPS host or reverse proxy. Set `PINTEREST_REDIRECT_URI` to the public HTTPS callback URL, then add that exact URL to the Pinterest app. Configure the Figma manifest's `allowedDomains` with the public gateway origin, not the local address. Verify `/health` after deployment.

For Render, use the included `render.yaml`, create the service from the repository, enter the secret environment variables in the dashboard, deploy, and verify `https://YOUR-GATEWAY-DOMAIN/health`. Copy `manifest.production.example.json` to a local production manifest and replace the placeholder domain before importing the plugin.

Repository CI validates gateway syntax and the Figma plugin TypeScript build through `.github/workflows/reference-gateway.yml`.

Request:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:8787/api/design-references `
  -Headers @{ Authorization = 'Bearer local-development-token' } `
  -ContentType 'application/json' `
  -Body '{"query":"finance dashboard","sources":["pinterest"],"limit":3}'
```

The gateway now supports a server-side Pinterest adapter. Set `PINTEREST_ACCESS_TOKEN` to enable it; otherwise it uses mock results. The default path is `/v5/search/pins`, configurable with `PINTEREST_SEARCH_PATH` if your approved Pinterest access uses a different endpoint. Do not put credentials in the Figma plugin.

Pinterest requires an approved app and OAuth access token. Its API uses bearer authorization and has access tiers and rate limits; confirm your app's approved operations before enabling production traffic. See the official [API call guide](https://developers.pinterest.com/docs/getting-started/make-an-api-call/) and [access tiers](https://developers.pinterest.com/docs/key-concepts/access-tiers/).

For a deployed version, use HTTPS, a real authentication system, restricted CORS, rate limiting, caching, and a secret manager.
