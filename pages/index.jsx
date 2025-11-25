import React, { useState, useEffect } from 'react';

export default function Home() {
  const [nama, setNama] = useState('');
  const [namaAr, setNamaAr] = useState('');
  const [link, setLink] = useState('');
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/add')
      .then(r => r.json())
      .then(j => setJsonData(j))
      .catch(() => setJsonData(null));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, nama_ar: namaAr, link })
      });
      const result = await res.json();
      if (res.ok) {
        setJsonData(result);
        setNama(''); setNamaAr(''); setLink('');
        setMessage('Berhasil ditambahkan');
      } else {
        setMessage('Gagal: ' + (result.message || JSON.stringify(result)));
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth:900, margin:'20px auto', padding:'0 20px' }}>
      <h1>Tambah Data ke JSON</h1>
      <form onSubmit={handleSubmit}>
        <label>Nama</label>
        <input value={nama} onChange={e=>setNama(e.target.value)} required/>

        <label>Nama Arab</label>
        <input value={namaAr} onChange={e=>setNamaAr(e.target.value)} />

        <label>Link</label>
        <input value={link} onChange={e=>setLink(e.target.value)} required/>

        <button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Tambah'}
        </button>
      </form>

      <h2>Preview JSON</h2>
      <pre>{jsonData ? JSON.stringify(jsonData, null, 2) : 'Memuat...'}</pre>
    </div>
  );
}
