import fs from 'fs';
import path from 'path';
import fetch from 'isomorphic-unfetch';

const DATA_FILE = process.env.DATA_FILE_PATH || 'data/data.json';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || '';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

function formatJakartaDate(d = new Date()) {
  const opts = { timeZone: 'Asia/Jakarta', hour12: false };
  const p = new Intl.DateTimeFormat('en-GB', {
    ...opts,
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit'
  }).formatToParts(d);
  const m = {}; for (const x of p) m[x.type] = x.value;
  return `${m.year}-${m.month}-${m.day} ${m.hour}:${m.minute}:${m.second}`;
}

async function readLocalData() {
  const filePath = path.join(process.cwd(), DATA_FILE);
  if (!fs.existsSync(filePath)) {
    const initial = { status:200, total:0, updatedAt:formatJakartaDate(), data:[] };
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive:true });
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2));
    } catch(e) {
      console.warn('Local write blocked (Vercel). Using memory only.');
    }
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { status:200, total:0, updatedAt:formatJakartaDate(), data:[] };
  }
}

async function getGitHubFile(filePath) {
  const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`, {
    headers:{ Authorization:`token ${GITHUB_TOKEN}` }
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function putGitHubFile(filePath, contentBase64, sha, message) {
  const body = { message, content:contentBase64, branch:GITHUB_BRANCH };
  if (sha) body.sha = sha;

  const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
    method:'PUT',
    headers:{ Authorization:`token ${GITHUB_TOKEN}` },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (GITHUB_TOKEN && GITHUB_REPO) {
        const file = await getGitHubFile(DATA_FILE);
        if (!file) return res.json({ status:200,total:0,data:[],updatedAt:formatJakartaDate() });
        return res.json(JSON.parse(Buffer.from(file.content,'base64').toString('utf8')));
      }
      return res.json(await readLocalData());
    }

    if (req.method !== 'POST')
      return res.status(405).json({ message:'Method not allowed' });

    const { nama, nama_ar='', link } = req.body || {};
    if (!nama || !link)
      return res.status(400).json({ message:'Field nama & link wajib' });

    let json, sha=null;
    if (GITHUB_TOKEN && GITHUB_REPO) {
      const file = await getGitHubFile(DATA_FILE);
      if (!file) json = { status:200,total:0,data:[],updatedAt:formatJakartaDate() };
      else {
        sha = file.sha;
        json = JSON.parse(Buffer.from(file.content,'base64').toString('utf8'));
      }
    } else json = await readLocalData();

    const nextId = (Math.max(0, ...json.data.map(x=>x.id))) + 1;
    json.data.push({ id:nextId, nama, nama_ar, link });
    json.total = json.data.length;
    json.updatedAt = formatJakartaDate();

    const text = JSON.stringify(json, null, 2);

    if (GITHUB_TOKEN && GITHUB_REPO) {
      await putGitHubFile(
        DATA_FILE,
        Buffer.from(text,'utf8').toString('base64'),
        sha,
        `Add item ${nextId}`
      );
    } else {
      try {
        const fp = path.join(process.cwd(), DATA_FILE);
        fs.mkdirSync(path.dirname(fp), { recursive:true });
        fs.writeFileSync(fp, text, 'utf8');
      } catch {
        console.warn('Write blocked on Vercel (local mode)');
      }
    }

    return res.json(json);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
}
