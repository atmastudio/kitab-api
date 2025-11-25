# Nextjs Vercel JSON CRUD (Fixed)
This version includes:
- Safe LOCAL mode fallback (no error on Vercel)
- Full GitHub mode support

## Do you need GitHub Token?
- **YES**, if you want the JSON file to be saved permanently.
- **NO**, if you only run locally (file saved locally only).

If deployed to Vercel WITHOUT GitHub Token → data will NOT persist (serverless FS).

## Environment Variables for GitHub Mode
- GITHUB_TOKEN
- GITHUB_REPO  → username/repo
- GITHUB_BRANCH → main
- DATA_FILE_PATH → data/data.json

