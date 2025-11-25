import React, { useState, useEffect } from "react";

export default function Home() {
  const [nama, setNama] = useState("");
  const [namaAr, setNamaAr] = useState("");
  const [link, setLink] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // AUTH
  const [pwInput, setPwInput] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [pwError, setPwError] = useState("");

  async function checkPassword(e) {
    e.preventDefault();
    const res = await fetch("/api/checkpass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pwInput })
    });
    const j = await res.json();

    if (j.ok) {
      setAuthorized(true);
    } else {
      setPwError("Password salah!");
    }
  }

  useEffect(() => {
    fetch("/api/add")
      .then(r => r.json())
      .then(j => setJsonData(j))
      .catch(() => setJsonData(null));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          nama_ar: namaAr,
          link
        })
      });

      const result = await res.json();
      if (res.ok) {
        setJsonData(result);
        setNama("");
        setNamaAr("");
        setLink("");
        setMessage("Berhasil ditambahkan!");
      } else {
        setMessage("Gagal: " + (result.message || JSON.stringify(result)));
      }
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // ========== LOGIN PAGE ==========
  if (!authorized) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
        <h2>Login Admin</h2>

        <form onSubmit={checkPassword}>
          <input
            type="password"
            placeholder="Masukkan password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            style={{ width: "100%", padding: "10px", marginTop: "10px" }}
          />
          <button
            type="submit"
            style={{ marginTop: "10px", padding: "10px", width: "100%" }}
          >
            Masuk
          </button>
        </form>

        {pwError && <p style={{ color: "red" }}>{pwError}</p>}
      </div>
    );
  }

  // ========== MAIN PAGE ==========
  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: "0 20px" }}>
      <h1>Tambah Data ke JSON</h1>
      <br> </br>
      <form onSubmit={handleSubmit}>
        <label>Nama</label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          required
        /><br></br>

        <label>Nama Arab</label>
        <input value={namaAr} onChange={(e) => setNamaAr(e.target.value)} />
        <br></br>
        <label>Link</label>
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
        />
        <br></br>

        <button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Tambah"}
        </button>
      </form>

      <h2>Preview JSON</h2>
      <pre>{jsonData ? JSON.stringify(jsonData, null, 2) : "Memuat..."}</pre>

      <p style={{ marginTop: 30, opacity: 0.5 }}>Protected Mode Active</p>
    </div>
  );
}
