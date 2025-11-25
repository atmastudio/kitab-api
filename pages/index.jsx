import React, { useState, useEffect } from "react";

export default function Home() {
  const [nama, setNama] = useState("");
  const [namaAr, setNamaAr] = useState("");
  const [link, setLink] = useState("");
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

    if (j.ok) setAuthorized(true);
    else setPwError("Password salah!");
  }

  useEffect(() => {
    fetch("/api/add")
      .then((r) => r.json())
      .then((j) => setJsonData(j))
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
        body: JSON.stringify({ nama, nama_ar: namaAr, link })
      });

      const result = await res.json();
      if (res.ok) {
        setJsonData(result);
        setNama("");
        setNamaAr("");
        setLink("");
        setMessage("Berhasil ditambahkan!");
      } else setMessage("Gagal: " + (result.message || JSON.stringify(result)));
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!authorized) {
    return (
      <div className="max-w-sm mx-auto mt-40 p-6 bg-white shadow-lg rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">Login Admin</h2>
        <form onSubmit={checkPassword}>
          <input
            type="password"
            placeholder="Masukkan password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold"
          >
            Masuk
          </button>
        </form>
        {pwError && <p className="text-red-600 mt-2">{pwError}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tambah Data ke JSON</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 bg-white p-6 shadow-lg rounded-xl"
      >
        <div>
          <label className="font-semibold">Nama</label>
          <input
            className="w-full p-2 mt-1 border rounded-lg"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="font-semibold">Nama Arab</label>
          <input
            className="w-full p-2 mt-1 border rounded-lg"
            value={namaAr}
            onChange={(e) => setNamaAr(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Link</label>
          <input
            className="w-full p-2 mt-1 border rounded-lg"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold mt-2"
        >
          {loading ? "Menyimpan..." : "Tambah"}
        </button>

        {message && (
          <p className="mt-2 font-semibold text-blue-600">{message}</p>
        )}
      </form>

      <h2 className="text-xl font-bold mt-10 mb-2">Preview JSON</h2>
      <pre className="bg-gray-100 p-4 rounded-lg shadow-inner text-sm overflow-auto max-h-96">
        {jsonData ? JSON.stringify(jsonData, null, 2) : "Memuat..."}
      </pre>

      <p className="mt-10 opacity-60 text-center">Protected Mode Active</p>
    </div>
  );
}
