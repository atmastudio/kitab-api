export default function handler(req, res) {
  const { password } = req.body || {};
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminPass) {
    return res.status(500).json({ ok: false, error: "ADMIN_PASSWORD belum di-set" });
  }

  if (password === adminPass) {
    return res.json({ ok: true });
  }

  return res.json({ ok: false });
}
