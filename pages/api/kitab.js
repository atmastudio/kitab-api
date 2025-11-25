import fs from 'fs';
import path from 'path';
import fetch from 'isomorphic-unfetch';

const DATA_FILE = process.env.DATA_FILE_PATH || 'data/data.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

async function readLocalData() {
  const filePath = path.join(process.cwd(), DATA_FILE);
  if (!fs.existsSync(filePath)) return { status:200, total:0, updatedAt:"", data:[] };
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

async function getGitHubFile(pathFile) {
  const r = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${pathFile}?ref=${GITHUB_BRANCH}`,
    { headers:{ Authorization:`token ${GITHUB_TOKEN}` } }
  );
  if (r.status === 404) return null;
  return r.json();
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Only GET allowed" });
    }

    // GitHub mode
    if (GITHUB_TOKEN && GITHUB_REPO) {
      const file = await getGitHubFile(DATA_FILE);
      if (!file) return res.json({ status:200, total:0, updatedAt:"", data:[] });
      const json = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
      return res.json(json);
    }

    // Local mode
    const local = await readLocalData();
    return res.json(local);

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
