import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { saveAuth } from "../../lib/auth";
import { Spinner, Btn } from "../ui/primitives";
import Icon from "../ui/Icon";

const P    = "#4648d4";
const T1   = "#111c2d";
const T2   = "#464554";
const T3   = "#767586";
const BG   = "#f9f9ff";
const BG1  = "#ffffff";
const BG2  = "#f0f3ff";
const BGH  = "#dee8ff";
const BGFIX = "#e1e0ff";
const BD   = "rgba(0,0,0,0.06)";
const hairline = { border: `1px solid ${BD}` };
const luxShadow = "0 20px 40px -10px rgba(0,0,0,0.04)";

const INPUT_ST = { width: "100%", background: BG1, border: `1px solid ${BD}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: T1, outline: "none", boxSizing: "border-box", fontFamily: "var(--sans)" };

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
    <div style={{ minHeight: "100vh", background: BG }}>
      <div style={{ background: "rgba(249,249,255,0.88)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.05)", padding: "0 40px", height: 72, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 800, color: P, letterSpacing: "-0.02em", lineHeight: 1 }}>Prolio</div>
        <button onClick={onLogout} style={{ background: "transparent", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 8, color: T3, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--sans)", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(70,72,212,0.06)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <Icon name="logout" size={13} color={T3} /> Sign out
        </button>
      </div>
      <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 24px" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", color: T1, marginBottom: 8 }}>Set up your profile</div>
        <div style={{ color: T3, fontSize: 14, marginBottom: 36, lineHeight: 1.65, fontFamily: "var(--sans)" }}>Add your resume, LinkedIn, and GitHub repos from the dashboard after this.</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <label htmlFor="mps-photo" style={{ cursor: "pointer" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: BGH, border: photo.preview ? "2px dashed rgba(70,72,212,0.35)" : "2px dashed rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {photo.preview ? <img src={photo.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="camera" size={22} color={T3} />}
            </div>
            <input id="mps-photo" type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handlePhoto(e.target.files[0])} />
          </label>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name *" onKeyDown={e => e.key === "Enter" && submit()} style={INPUT_ST} />
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Professional title (optional)" style={INPUT_ST} />
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Short bio (optional)" rows={3} style={{ ...INPUT_ST, resize: "vertical" }} />
        </div>
        {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button onClick={submit} disabled={loading || !form.name.trim()}
          style={{ width: "100%", background: P, color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 600, fontSize: 14, cursor: loading || !form.name.trim() ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(70,72,212,0.20)", opacity: loading || !form.name.trim() ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--sans)", marginBottom: 24 }}>
          {loading ? <><Spinner size={14} color="#fff" /> Creating profile…</> : "Continue to Dashboard"}
        </button>
        <div style={{ textAlign: "center" }}>
          <button onClick={() => setReconnect(r => ({ ...r, show: !r.show }))} style={{ background: "transparent", border: "none", color: T3, fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>
            Already have a portfolio? Reconnect it
          </button>
        </div>
        {reconnect.show && (
          <div style={{ marginTop: 16, background: BG1, border: `1px solid ${BD}`, borderRadius: 12, padding: "16px" }}>
            <div style={{ fontSize: 12.5, color: T3, marginBottom: 10 }}>Paste your portfolio URL to link it to this account.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={reconnect.url} onChange={e => setReconnect(r => ({ ...r, url: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleReconnect()} placeholder="e.g. prolio.co/#/portfolio/..." style={{ ...INPUT_ST, flex: 1, fontSize: 12 }} />
              <Btn onClick={handleReconnect} disabled={!reconnect.url.trim()} style={{ flexShrink: 0, padding: "10px 14px" }}>Reconnect</Btn>
            </div>
            {reconnect.error && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 8 }}>{reconnect.error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default MinimalProfileSetup;
