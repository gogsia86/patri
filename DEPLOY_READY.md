# Deploy Ready Checklist

This repository is prepped for GitHub + Vercel deployment.

## Security Rules

- Never commit real keys or tokens.
- Keep `.env.local` local-only.
- Use GitHub Actions secrets and Vercel project environment variables.

## 1) Local Preflight (already passing in this workspace)

```bash
npm run lint
npm run test
npm run build
```

## 2) First Git Commit (if not committed yet)

```bash
git add .
git commit -m "chore: prepare project for CI and Vercel deployment"
```

## 3) Connect GitHub Remote and Push

Replace `<YOUR_GITHUB_REPO_URL>` with the repo URL you will provide.

```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## 4) GitHub Secrets Needed (for workflow `.github/workflows/vercel-deploy.yml`)

Set these in: GitHub Repo -> Settings -> Secrets and variables -> Actions

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 5) Vercel Project Env Vars

Set in Vercel project settings for Production/Preview as needed:

- `OLLAMA_BASE_URL` (if applicable for your runtime topology)
- `OLLAMA_MODEL`
- `PATRI_REDIS_PORT` only if your hosting setup uses this value directly

## 6) Trigger Deployment

- Push to `main`, or
- Run workflow manually: Actions -> `Vercel Deploy` -> `Run workflow`

## 7) Smoke Test URLs

- `/`
- `/admin`
- `/api/chat`

## Notes

- Current Docker compose in this repo provisions Redis service only.
- App deploy target is Vercel (Next.js app), and Redis can remain external/local as needed.
