# Deployment log · OSL-Preparedness dashboard

Subscription: AFRO Production Subscription
Resource group: EPROSL-P-EUW-RG01 · West Europe
App Service plan: ASP-EPROSLPEUWRG01-8d6a (Premium V2, P1v2, Linux)
Business Owner: MENDIZABAL JOFFRE, Carla · Technical Focal Point: IDON, Akanimo · Owning cluster: EPR · Owning unit: OSL
Repository: github.com/akanimo-osl/OSL-Preparedness

## 22 Oct 2026

### Done
- Created web app `afro-osl-preparedness` on the existing plan (Azure CLI, Cloud Shell).
  - Production: https://afro-osl-preparedness.azurewebsites.net
  - Staging slot: https://afro-osl-preparedness-staging.azurewebsites.net
- Runtime Node 24 LTS; startup `pm2 serve /home/site/wwwroot --no-daemon` (static files).
- HTTPS only on; minimum TLS 1.2; FTP disabled; FTP basic auth off; client certificates off; Always on.
- VNet integration: afroVnet / afroAppSubnet.
- Staging slot created with the production configuration.
- Tags set on production and staging: BUSINESS OWNER = MENDIZABAL JOFFRE, Carla; TechnicalFocalPoint 1 = IDON, Akanimo; OwningCluster = EPR; OwningUnit = OSL.

### To do
- [x] Authentication on production (Microsoft, single tenant, require sign-in, 302 redirect, token store on) · app registration `afro-osl-preparedness-web` (client ID 9740d215-89c3-4d42-b8fe-1cda951f0238; renamed from afro-osl-preparedness-pro; logo added) · upgraded from classic auth format on 22 Oct 2026
- [x] Authentication on staging slot · app registration `osl-preparedness-web-staging` (client ID ddeaff27-3643-4b3a-9da6-941d17e84fc0)
- [x] SCM basic auth on staging only (FTP off; production SCM off) · publish profile of staging → GitHub secret `AZURE_WEBAPP_PUBLISH_PROFILE`
- [ ] Upload dashboard files and `.github/workflows/azure-deploy.yml` to `main`
- [ ] GitHub Actions run green
- [ ] Check dashboard on staging address with WHO sign-in
- [ ] Swap staging → production
- [ ] Delete web app `afro` (Technical Focal Point; created by IDON, Akanimo, never deployed) (and its slot `afro-sig`) — keep the App Service plan
- [x] Graph delegated permission Files.Read.All (admin consent not required) on `afro-osl-preparedness-web` and `osl-preparedness-web-staging`
- [x] Login scope `openid offline_access profile https://graph.microsoft.com/Files.Read.All` and token store on, production and staging (verified 22 Oct 2026)
- [ ] Data folder: SharePoint KENYA NAIROBI-HUB › Data › OSL - Nairobi › DevOPS › OSL-Preparedness (fixed file names, weekly overwrite, version history)
- [ ] Delete old app registrations `afro-osl-preparedness` (client ID dc75ae8b…) and `afro-osl-preparedness-prod` (client ID 1aa83f67…)
- [ ] Custom domain request to WHO IT (optional)

### Replaced resources (never deployed)
- `afro` (Python runtime at creation, changed to Node 24 LTS on 22 Oct 2026; no content deployed)
- `afro-sig` (slot of `afro`; no content deployed)

### Not to be changed
afro-server, afro-container, afroVnet, afro-ai-resource, Log Analytics workspace, Container Apps environment — other work or shared.
