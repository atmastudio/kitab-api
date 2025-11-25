import fs from 'fs';
import path from 'path';
import fetch from 'isomorphic-unfetch';

const DATA_FILE = process.env.DATA_FILE_PATH || 'data/data.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

function formatJakartaDate(d = new Date()) {
  const opts = { timeZone: 'Asia/Jakarta', hour12: false };
  const parts = new Intl.DateTimeFormat('en-GB', Object.assign({
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  }, opts)).formatToParts(d);

  const map = {};
  for (const p of parts) map[p.type] = p.value;
  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
}

async function readLocalData() {
  const filePath = path.join(process.cwd(), DATA_FILE);
  if (!fs.existsSync(filePath)) {
    const initial = { status: 200, total: 0, updatedAt: formatJakartaDate(), data: [] };
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

async function getGitHubFile(filePath) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
  const r = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('GHTT: ' + r.status + ' ' + (await r.text()));
  return r.json();
}

async function putGitHubFile(filePath, contentBase64, sha, message) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`;
  const body = { message, content: contentBase64, branch: GITHUB_BRANCH };
  if (sha) body.sha = sha;
  const r = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('GHPUT: ' + r.status + ' ' + (await r.text()));
  return r.json();
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (GITHUB_TOKEN && GITHUB_REPO) {
        const file = await getGitHubFile(DATA_FILE);
        if (!file) return res.status(200).json({ status: 200, total: 0, updatedAt: formatJakartaDate(), data: [] });
        const content = Buffer.from(file.content, 'base64').toString('utf8');
        return res.status(200).json(JSON.parse(content));
      } else {
        const data = await readLocalData();
        return res.status(200).json(data);
      }
    }

    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

    const { nama, nama_ar = '', link } = req.body || {};
    if (!nama || !link) return res.status(400).json({ message: 'Field nama dan link wajib diisi' });

    let json;
    let sha = null;
    if (GITHUB_TOKEN && GITHUB_REPO) {
      const file = await getGitHubFile(DATA_FILE);
      if (!file) {
        json = { status: 200, total: 0, updatedAt: formatJakartaDate(), data: [] };
      } else {
        sha = file.sha;
        json = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
      }
    } else {
      json = await readLocalData();
    }

    const ids = json.data.map(i => Number(i.id) || 0);
    const nextId = ids.length ? Math.max(...ids) + 1 : 1;

    const newItem = { id: nextId, nama, nama_ar: nama_ar || '', link };
    json.data.push(newItem);
    json.total = json.data.length;
    json.updatedAt = formatJakartaDate();

    const newContentStr = JSON.stringify(json, null, 2);

    if (GITHUB_TOKEN && GITHUB_REPO) {
      const contentBase64 = Buffer.from(newContentStr, 'utf8').toString('base64');
      await putGitHubFile(DATA_FILE, contentBase64, sha, `Update data.json: add id ${nextId}`);
      return res.status(200).json(json);
    } else {
      const filePath = path.join(process.cwd(), DATA_FILE);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, newContentStr, 'utf8');
      return res.status(200).json(json);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message || String(err) });
  }
}
