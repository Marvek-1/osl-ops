# Move to Azure · AFRO - NRB Azure Resources

Subscription: AFRO Production Subscription · Resource group: `EPROSL-P-EUW-RG01` · West Europe

The dashboard is a static site (HTML + JSON, no build, no server code). It runs on App Service as plain files.

## 1. Choose where it runs (decide with the resource owner)
| Option | Resource | Use when |
|---|---|---|
| A (recommended) | New web app on the existing plan `ASP-EPROSLPEUWRG01-8d6a`, e.g. `afro-ebola-supply` | `afro` already serves another application |
| B | Slot `afro-sig` of App Service `afro` | Slot is free and approved for this use |
| C | App Service `afro` (production) | Only if `afro` is empty and assigned to this dashboard |

**Check first:** open `https://afro.azurewebsites.net` and the `afro-sig` slot URL. A zip deploy replaces everything in `wwwroot`. Do not deploy over a running application.

Microsoft guidance followed here (learn.microsoft.com/azure/app-service/deploy-best-practices): deploy continuously to a non-production slot (`staging`), check it, then swap into production. Slots need Standard tier or higher on the plan.

## 2. Deploy (Azure CLI or Cloud Shell)
```bash
RG=EPROSL-P-EUW-RG01
PLAN=ASP-EPROSLPEUWRG01-8d6a
APP=afro-ebola-supply          # option A; use afro for B/C

# Option A only: create the web app on the existing plan
az webapp list-runtimes --os linux -o table          # pick the stack the plan uses
az webapp create -g $RG -p $PLAN -n $APP --runtime "NODE:20-lts"

# Linux plan: serve the folder as static files
az webapp config set -g $RG -n $APP --startup-file "pm2 serve /home/site/wwwroot --no-daemon"

# Package and deploy (run inside the deploy/ folder)
zip -r ../ebola-dashboard.zip . -x "vercel.json"
az webapp deploy -g $RG -n $APP --src-path ../ebola-dashboard.zip --type zip
# Option B: add  --slot afro-sig   (confirm the slot name: az webapp deployment slot list -g $RG -n afro -o table)
```
Windows plan: skip the startup command; `web.config` in this folder sets the default page, JSON type and no-cache for `data/`.

Portal alternative: App Service → Deployment Center → or Advanced Tools (Kudu) → Zip Push Deploy → drag the zip onto `site/wwwroot`.

## 3. Restrict to WHO staff (required: the PDF footer says "For internal WHO use")
App Service → Authentication → Add identity provider → Microsoft → tenant `worldhealthorg.onmicrosoft.com` → "Require authentication" → unauthenticated requests: HTTP 302 redirect to login.
Optional: limit to a security group under Enterprise applications → the app → Assignment required = Yes.

Also set: Configuration → General settings → HTTPS only = On, Minimum TLS 1.2, FTP state = Disabled.

## 4. Outbound sources the browser loads
Staff browsers must reach these. If WHO adds a Content-Security-Policy, allow them:
- fonts.googleapis.com, fonts.gstatic.com (IBM Plex fonts)
- unpkg.com (d3, topojson, MapLibre)
- cdn.jsdelivr.net (country outlines)
- tiles.openfreemap.org, demotiles.maplibre.org (map and terrain tiles)
- api.mapbox.com (only if a Mapbox token is set)
- cdn.sheetjs.com (Excel export)

To remove these dependencies later, copy the libraries into `/vendor` and point the page at them.

## 5. Weekly data update on Azure
1. Upload the new exports here; the merge produces `data/orders.json` and `data/parking.json`.
2. Kudu → Debug console → `site/wwwroot/data` → drag the new files in (or re-run the zip deploy).
3. Reload the dashboard. `data/` is served without cache.

With option B, deploy to `afro-sig` first, check, then **Swap** into production.

## 6. Later: PostgreSQL (`afro-server`)
`Data Schema.dc.html` lists the tables (country, line, shipment, status_map, case_report, import_receipt, import_file, import_issue). Field names match the JSON files, so the current files load unchanged. The server is on the private network (`afroVnet`, `privatelink.postgres.database.azure.com`); the web app needs VNet integration to read from it, and a small API (Container App `afro-container` or a Function) between the page and the database. Only needed when the migration plans arrive.

## Files
- `index.html`, `Ebola Order Tracker v2.dc.html` – dashboard
- `BeneficiaryRisk.dc.html` – Beneficiaries & risk
- `Data Schema.dc.html` – sources, fields, mapping, tables
- `support.js` – runtime
- `data/` – orders, parking, cases, impact
- `flags/`, `assets/` – images
- `web.config` – Windows App Service settings · `vercel.json` – Vercel only
