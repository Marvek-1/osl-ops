<p align="center"><img src="assets/osl-epr-logo.png" alt="WHO African Region · OSL EPR" width="120"></p>

# OSL-Preparedness · Ebola Preparedness Supply Chain dashboard

WHO African Region · Operations Support and Logistics (OSL) · Emergency Preparedness and Response (EPR). Static site: HTML + JSON, no build step.

- Production: https://afro-osl-preparedness.azurewebsites.net (WHO sign-in)
- Staging: https://afro-osl-preparedness-staging.azurewebsites.net (WHO sign-in)

## Pages
- `index.html` – dashboard (Executive brief and Operations)
- `BeneficiaryRisk.dc.html` – Beneficiaries & risk
- `Data Schema.dc.html` – sources, fields, mapping, proposed database tables

## Data
- `data/orders.json` – order lines and shipments from the OSL supply monitoring exports
- `data/parking.json` – update receipts and data inconsistencies (Parking Lot tab)
- `data/cases.json` – WHO Disease Outbreak News
- `data/impact.json` – WHO ETC calculator rates and kit references
- `data/sources.json` – SharePoint source files read live with the signed-in user's access

Values are shown as recorded. Nothing is removed. Empty = "not available". Invalid = "Inconsistent (recorded as …)", flagged in the Parking Lot.

## Deploy
Every push to `main` deploys to Azure App Service through `.github/workflows/azure-deploy.yml`.

One-time setup:
1. Azure portal → the web app → Overview → **Download publish profile**.
   (If the download is blocked: Configuration → General settings → SCM Basic Auth Publishing = On.)
2. GitHub → this repo → Settings → Secrets and variables → Actions → New repository secret:
   name `AZURE_WEBAPP_PUBLISH_PROFILE`, value = full content of the downloaded file.
3. The workflow deploys to `afro-osl-preparedness`, slot `staging`. Check staging, then Swap into production.
4. Push, or run the workflow from the Actions tab.

Full Azure notes (hosting options, WHO sign-in, outbound sources, PostgreSQL): `AZURE.md`.

## Weekly data update
Replace the files in `data/`, commit, push to `main`. The workflow checks the JSON and redeploys.
