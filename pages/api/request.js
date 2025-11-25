import fs from 'fs';
import path from 'path';
import fetch from 'isomorphic-unfetch';

const FILE_NAME = "data/request.json";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

function formatJakartaDate(d = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year:"numeric",
    month:"2-digit",
    day:"2-digit",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit"
  })
    .format(d)
    .replace(",", "");
}

async function getGitHubFile(filePath) {
  const r = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`,
    { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
  );

  if (r.status === 404) return null;
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function putGitHubFile(filePath, contentBase64, sha, message) {
  const body = { message, content: contentBase64, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;

  const r = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`,
    {
      method: "PUT",
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
      body: JSON.stringify(body)
    }
  );

  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function readLocal(filePath) {
  if (!fs.existsSync(filePath)) {
    return { total: 0, updatedAt: "", data: [] };
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      // GET list request
      if (GITHUB_TOKEN && GITHUB_REPO) {
        const file = await getGitHubFile(FILE_NAME);
        if (!file) return res.json({ total:0, updatedAt:"", data:[] });
        return res.json(JSON.parse(Buffer.from(file.content, "base64").toString("utf8")));
      }

      // Local
      const filePath = path.join(process.cwd(), FILE_NAME);
      return res.json(readLocal(filePath));
    }

    if (req.method === "POST") {
      const { nama } = req.body || {};
      if (!nama) return res.status(400).json({ message: "Field 'nama' wajib" });

      let json, sha = null;

      // GitHub mode
      if (GITHUB_TOKEN && GITHUB_REPO) {
        const file = await getGitHubFile(FILE_NAME);
        if (file) {
          sha = file.sha;
          json = JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
        } else {
          json = { total: 0, updatedAt: "", data: [] };
        }
      } else {
        // Local
        const filePath = path.join(process.cwd(), FILE_NAME);
        json = readLocal(filePath);
      }

      const nextId = json.data.length === 0 ? 1 : Math.max(...json.data.map(x => x.id)) + 1;
      json.data.push({ id: nextId, nama });
      json.total = json.data.length;
      json.updatedAt = formatJakartaDate();

      const text = JSON.stringify(json, null, 2);

      // SAVE GitHub
      if (GITHUB_TOKEN && GITHUB_REPO) {
        await putGitHubFile(
          FILE_NAME,
          Buffer.from(text).toString("base64"),
          sha,
          `Add request ${nextId}`
        );
      } else {
        // SAVE Local
        try {
          const filePath = path.join(process.cwd(), FILE_NAME);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, text, "utf8");
        } catch (e) {
          console.warn("Local write blocked (Vercel)");
        }
      }

      return res.json(json);
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
