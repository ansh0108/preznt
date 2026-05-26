import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner } from "../ui/primitives";
import Icon from "../ui/Icon";
import CandidateEvaluator from "./CandidateEvaluator";
import CandidateProfileView from "./CandidateProfileView";
import RecruiterSidebar from "./RecruiterSidebar";
import AddByUpload from "./AddByUpload";
import TalentPool from "./TalentPool";

const T = { r: "12px" };

// ─── AddByUrl ─────────────────────────────────────────────────────────────────
function AddByUrl({ onAdd }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const add = async () => {
    setError("");
    const idMatch = url.match(/([0-9a-f]{8})(?:[^0-9a-f]|$)/);
    const id = idMatch ? idMatch[1] : url.trim();
    if (!id || id.length !== 8) return setError("Paste a valid portfolio URL.");
    setLoading(true);
    try { const r = await axios.get(`${API}/profile/${id}`); onAdd(r.data); setUrl(""); }
    catch { setError("Could not find that portfolio. Check the URL."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, maxWidth: 640, marginBottom: 8 }}>
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Paste portfolio URL, e.g. prolio.co/#/portfolio/name-id"
          style={{ flex: 1, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: T.r, padding: "10px 14px", fontSize: 14, color: "var(--text)", outline: "none", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }} />
        <button onClick={add} disabled={loading || !url.trim()}
          style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: T.r, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: loading || !url.trim() ? "not-allowed" : "pointer", opacity: loading || !url.trim() ? 0.55 : 1, display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
          {loading ? <Spinner size={14} color="#fff" /> : "Add Candidate"}
        </button>
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}
    </>
  );
}

// ─── EvaluateSection ──────────────────────────────────────────────────────────
function EvaluateSection({ candidates, setCandidates, addMode, setAddMode }) {
  return (
    <section style={{ marginBottom: 52 }}>
      <h2 style={{ fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.01em" }}>Evaluate a Candidate</h2>
      <p style={{ fontSize: 13, color: "var(--text3)", margin: "0 0 22px", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
        Add a candidate via their Prolio portfolio link, or upload their resume / LinkedIn / GitHub directly.
      </p>
      <div style={{ display: "flex", gap: 3, background: "var(--bg3)", borderRadius: 100, padding: "4px", width: "fit-content", marginBottom: 22 }}>
        {[{ id: "url", label: "By Portfolio URL" }, { id: "upload", label: "Upload Files" }].map(m => (
          <button key={m.id} onClick={() => setAddMode(m.id)}
            style={{ background: addMode === m.id ? "var(--bg1)" : "transparent", color: addMode === m.id ? "var(--accent)" : "var(--text3)", padding: "7px 18px", borderRadius: 100, fontSize: 13, fontWeight: addMode === m.id ? 600 : 400, border: addMode === m.id ? "1px solid var(--line)" : "1px solid transparent", cursor: "pointer", transition: "all 0.14s", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
            {m.label}
          </button>
        ))}
      </div>
      {addMode === "url"
        ? <AddByUrl onAdd={c => setCandidates(prev => [...prev, c])} />
        : <AddByUpload onAdd={c => setCandidates(prev => [...prev, c])} />}
      {candidates.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
          {candidates.map(c => (
            <CandidateEvaluator key={c.user_id} candidate={c} onRemove={() => setCandidates(prev => prev.filter(x => x.user_id !== c.user_id))} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── RecruiterDashboard ───────────────────────────────────────────────────────
function RecruiterDashboard({ auth, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [addMode, setAddMode] = useState("url");
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    axios.get(`${API}/profiles/list`).then(r => setProfiles(r.data.profiles || [])).catch(() => {}).finally(() => setPoolLoading(false));
  }, []);

  if (selectedProfile) {
    return <CandidateProfileView profile={selectedProfile} onBack={() => setSelectedProfile(null)} onShortlist={() => {}} />;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      <RecruiterSidebar auth={auth} onLogout={onLogout} />
      <main style={{ marginLeft: 288, flex: 1, padding: "40px 44px", maxWidth: "calc(100% - 288px)", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: 32, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Recruiter Hub</h1>
            <p style={{ fontSize: 14, color: "var(--text3)", margin: "8px 0 0", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>Evaluate candidates and browse the talent pool.</p>
          </div>
          <button style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: T.r, color: "var(--text2)", padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--line2)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; }}>
            Export Report
          </button>
        </div>
        <EvaluateSection candidates={candidates} setCandidates={setCandidates} addMode={addMode} setAddMode={setAddMode} />
        <div style={{ borderTop: "1px solid var(--line)", marginBottom: 48 }} />
        <TalentPool profiles={profiles} search={search} setSearch={setSearch} poolLoading={poolLoading} setSelectedProfile={setSelectedProfile} />
      </main>
    </div>
  );
}

export default RecruiterDashboard;
