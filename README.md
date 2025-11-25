# Nextjs Vercel JSON CRUD
A minimal Next.js app to add items into a JSON file (not a DB).  
Two modes:
- **GITHUB mode (recommended for Vercel):** set `GITHUB_TOKEN` and `GITHUB_REPO` env vars in Vercel. The API will commit updates to the JSON file in your repo (persistent).
- **LOCAL mode:** if no `GITHUB_TOKEN`, the app writes to `data/data.json` on disk (useful for local dev; NOT persistent on Vercel serverless).

## How to use
1. Install dependencies: `npm install`
2. Run locally: `npm run dev`
3. Open http://localhost:3000

## Deploy to Vercel (recommended)
1. Push this repo to GitHub.
2. Create a Vercel project from the repo.
3. (Optional but recommended) In Vercel Environment Variables add:
   - `GITHUB_TOKEN` (personal access token with `repo` or `public_repo` scope)
   - `GITHUB_REPO` (format: owner/repo)
   - `GITHUB_BRANCH` (optional, default `main`)
   - `DATA_FILE_PATH` (optional, default `data/data.json`)
4. Deploy.

## API
- `GET /api/add` — returns current JSON file.
- `POST /api/add` — body `{ nama, nama_ar, link }` adds item (id auto increment). Response format:
  `{"status":200,"total":..., "updatedAt":"YYYY-MM-DD HH:MM:SS", "data":[...]}`
