import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { saveAuth } from "../../lib/auth";
import { Spinner, Btn } from "../ui/primitives";
import Icon from "../ui/Icon";

function MinimalProfileSetup({ auth, setAuth, onLogout }) {
  const [form, setForm] = useState({ name: "", title: "", bio: "" });
  const [photo, setPhoto] = useState({ file: null, preview: null });
  const [reconnect, setReconnect] = useState({ url: "", error: "", show: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePhoto = (file) => setPhoto({ file, preview: URL.createObjectURL(file) });

  const submit = async () => {
    if (!form.name.trim()) return setError("Name is required");
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API}/setup/profile`, { name: form.name.trim(), title: form.title.trim(), bio: form.bio.trim(), github_urls: [], github_username: "", target_roles: [] });
      const uid = res.data.user_id;
      if (photo.file) { const f = new FormData(); f.append("file", photo.file); await axios.post(`${API}/upload/photo/${uid}`, f); }
      await axios.post(`${API}/auth/link-portfolio`, { portfolio_id: uid }, { headers: { Authorization: `Bearer ${auth.token}` } });
      const updated = { ...auth, portfolio_id: uid, profile_name: form.name.trim() };
      saveAuth(updated); setAuth(updated);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const handleReconnect = async () => {
    setReconnect(r => ({ ...r, error: "" }));
    const idMatch = reconnect.url.match(/([0-9a-f]{8})(?:[^0-9a-f]|$)/);
    const id = idMatch ? idMatch[1] : reconnect.url.trim();
    if (!id || id.length !== 8) return setReconnect(r => ({ ...r, error: "Paste your full portfolio URL." }));
    try {
      const r = await axios.get(`${API}/profile/${id}`);
      await axios.post(`${API}/auth/link-portfolio`, { portfolio_id: id }, { headers: { Authorization: `Bearer ${auth.token}` } });
      const updated = { ...auth, portfolio_id: id, profile_name: r.data.name };
      saveAuth(updated); setAuth(updated);
    } catch { setReconnect(r => ({ ...r, error: "Could not find that portfolio." })); }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 10 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>prolio<span style={{ color: "var(--accent)" }}>.</span></div>
        <button onClick={onLogout} style={{ background: "transparent", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text3)", padding: "6px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="logout" size={13} color="var(--text3)" /> Sign out
        </button>
      </div>
      <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 24px" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Set up your profile</div>
        <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 32, lineHeight: 1.6 }}>You can add your resume, LinkedIn and GitHub repos from your dashboard after this.</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <label htmlFor="mps-photo" style={{ cursor: "pointer" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg3)", border: "2px dashed var(--line2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {photo.preview ? <img src={photo.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="camera" size={22} color="var(--text3)" />}
            </div>
            <input id="mps-photo" type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handlePhoto(e.target.files[0])} />
          </label>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name *" onKeyDown={e => e.key === "Enter" && submit()} />
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Professional title (optional)" />
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio (optional)" rows={3} style={{ resize: "vertical" }} />
        </div>
        {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <Btn onClick={submit} disabled={loading || !form.name.trim()} style={{ width: "100%", justifyContent: "center", marginBottom: 24 }}>
          {loading ? <><Spinner size={14} color="#fff" /> Creating profile…</> : "Continue to Dashboard"}
        </Btn>
        <div style={{ textAlign: "center" }}>
          <button onClick={() => setReconnect(r => ({ ...r, show: !r.show }))} style={{ background: "transparent", border: "none", color: "var(--text3)", fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>
            Already have a portfolio? Reconnect it
          </button>
        </div>
        {reconnect.show && (
          <div style={{ marginTop: 16, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "16px" }}>
            <div style={{ fontSize: 12.5, color: "var(--text3)", marginBottom: 10 }}>Paste your portfolio URL to link it to this account.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={reconnect.url} onChange={e => setReconnect(r => ({ ...r, url: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleReconnect()} placeholder="e.g. prolio.co/#/portfolio/..." style={{ flex: 1, fontSize: 12 }} />
              <Btn onClick={handleReconnect} disabled={!reconnect.url.trim()} style={{ flexShrink: 0, padding: "10px 14px" }}>Reconnect</Btn>
            </div>
            {reconnect.error && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 8 }}>{reconnect.error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default MinimalProfileSetup;
