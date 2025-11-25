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
        setMessage('Berhasil ditambahkan ✅');
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
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial', maxWidth:960, margin:'28px auto', padding:'0 16px' }}>
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h1 style={{ margin:0 }}>JSON List Editor</h1>
        <small style={{ color:'#666' }}>Simpan ke file JSON — Siap deploy ke Vercel</small>
      </header>

      <main style={{ display:'grid', gridTemplateColumns: '1fr 420px', gap:20 }}>
        <section style={{ padding:20, border:'1px solid #eee', borderRadius:10, background:'#fff' }}>
          <h2 style={{ marginTop:0 }}>Tambah Item</h2>
          <form onSubmit={handleSubmit}>
            <label style={{ display:'block', marginBottom:6 }}>Nama *</label>
            <input value={nama} onChange={e=>setNama(e.target.value)} required style={{ width:'100%', padding:10, marginBottom:12, borderRadius:6, border:'1px solid #ddd' }} />

            <label style={{ display:'block', marginBottom:6 }}>Nama (Arab)</label>
            <input value={namaAr} onChange={e=>setNamaAr(e.target.value)} style={{ width:'100%', padding:10, marginBottom:12, borderRadius:6, border:'1px solid #ddd' }} />

            <label style={{ display:'block', marginBottom:6 }}>Link *</label>
            <input value={link} onChange={e=>setLink(e.target.value)} required style={{ width:'100%', padding:10, marginBottom:12, borderRadius:6, border:'1px solid #ddd' }} />

            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button type='submit' disabled={loading} style={{ padding:'10px 16px', borderRadius:8, border:'none', background:'#111827', color:'#fff', cursor:'pointer' }}>
                {loading ? 'Menyimpan...' : 'Tambah'}
              </button>
              <span style={{ color:'#666' }}>{message}</span>
            </div>
          </form>

          <div style={{ marginTop:18 }}>
            <h3 style={{ marginBottom:8 }}>Petunjuk</h3>
            <ul style={{ marginTop:0, color:'#555' }}>
              <li>Field <strong>Nama</strong> dan <strong>Link</strong> wajib.</li>
              <li>Jika deploy ke Vercel, gunakan mode GitHub (lihat README).</li>
            </ul>
          </div>
        </section>

        <aside style={{ padding:20, border:'1px solid #eee', borderRadius:10, background:'#fafafa' }}>
          <h3 style={{ marginTop:0 }}>Preview JSON</h3>
          <div style={{ maxHeight:560, overflow:'auto', background:'#fff', padding:12, borderRadius:8, border:'1px solid #eee' }}>
            <pre style={{ whiteSpace:'pre-wrap', wordBreak:'break-word', margin:0 }}>{jsonData ? JSON.stringify(jsonData, null, 2) : 'Memuat...'}</pre>
          </div>
        </aside>
      </main>

      <footer style={{ marginTop:28, color:'#666' }}>
        <small>Created for you — ready to push to GitHub & deploy to Vercel.</small>
      </footer>
    </div>
  );
}
