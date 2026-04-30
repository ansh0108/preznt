import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner, Btn, Divider } from "../ui/primitives";
import Icon from "../ui/Icon";
import CandidateEvaluator from "./CandidateEvaluator";
import ProfileCard from "./ProfileCard";

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
    try {
      const r = await axios.get(`${API}/profile/${id}`);
      onAdd(r.data);
      setUrl("");
    } catch { setError("Could not find that portfolio. Check the URL."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, maxWidth: 640, marginBottom: 8 }}>
        <input value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Paste portfolio URL, e.g. prolio.co/#/portfolio/name-id" style={{ flex: 1 }} />
        <Btn onClick={add} disabled={loading || !url.trim()}>
          {loading ? <Spinner size={14} color="#fff" /> : "Add Candidate"}
        </Btn>
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}
    </>
  );
}

function AddByUpload({ onAdd }) {
  const [name, setName] = useState("");
  const [resume, setResume] = useState(null);
  const [linkedin, setLinkedin] = useState(null);
  const [github, setGithub] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!resume && !linkedin && !github.trim()) return setError("Add at least one file or GitHub URL.");
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("github_url", github.trim());
      if (resume) fd.append("resume", resume);
      if (linkedin) fd.append("linkedin", linkedin);
      const r = await axios.post(`${API}/evaluate/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      onAdd(r.data);
      setName(""); setResume(null); setLinkedin(null); setGithub("");
    } catch { setError("Upload failed. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "22px 24px", maxWidth: 640 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Candidate Name</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name (optional)" style={{ width: "100%" }} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>GitHub Profile URL</div>
          <input value={github} onChange={e => setGithub(e.target.value)} placeholder="github.com/username" style={{ width: "100%" }} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
        {[
          { label: "Resume / CV", accept: ".pdf,.docx,.pptx,.txt", file: resume, setFile: setResume },
          { label: "LinkedIn PDF", accept: ".pdf", file: linkedin, setFile: setLinkedin },
        ].map(({ label, accept, file, setFile }) => (
          <label key={label} style={{ cursor: "pointer" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
            <div style={{ border: `1px dashed ${file ? "var(--teal)" : "var(--line2)"}`, borderRadius: "var(--r-md)", padding: "12px 14px", display: "flex", alignItems: "center", gap: 8, background: file ? "rgba(45,212,191,0.06)" : "var(--bg2)", transition: "all 0.15s" }}>
              <Icon name={file ? "check" : "file"} size={14} color={file ? "var(--teal)" : "var(--text3)"} />
              <span style={{ fontSize: 12.5, color: file ? "var(--teal)" : "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file ? file.name : `Upload ${label}`}</span>
            </div>
            <input type="file" accept={accept} style={{ display: "none" }} onChange={e => setFile(e.target.files[0] || null)} />
          </label>
        ))}
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <Btn onClick={submit} disabled={loading || (!resume && !linkedin && !github.trim())}>
        {loading ? <><Spinner size={14} color="#fff" /> Analyzing…</> : <><Icon name="zap" size={14} color="#fff" /> Analyze Candidate</>}
      </Btn>
    </div>
  );
}

function RecruiterDashboard({ auth, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [addMode, setAddMode] = useState("url");

  useEffect(() => {
    axios.get(`${API}/profiles/list`)
      .then(r => setProfiles(r.data.profiles || []))
      .catch(() => {})
      .finally(() => setPoolLoading(false));
  }, []);

  const filtered = profiles.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q) || p.tagline?.toLowerCase().includes(q) || p.current_role?.toLowerCase().includes(q) || p.skills?.some(s => s.toLowerCase().includes(q));
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 10 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>prolio<span style={{ color: "var(--accent)" }}>.</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 13, color: "var(--text3)" }}>{auth.email}</div>
          <button onClick={onLogout} style={{ background: "transparent", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text3)", padding: "6px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="logout" size={13} color="var(--text3)" /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "var(--serif)", marginBottom: 6 }}>Evaluate a Candidate</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>Add a candidate via their prolio portfolio link, or upload their resume / LinkedIn / GitHub directly.</div>

          <div style={{ display: "flex", gap: 2, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "4px", width: "fit-content", marginBottom: 20 }}>
            {[{ id: "url", label: "By Portfolio URL" }, { id: "upload", label: "Upload Files" }].map(m => (
              <button key={m.id} onClick={() => setAddMode(m.id)}
                style={{ background: addMode === m.id ? "var(--bg3)" : "transparent", color: addMode === m.id ? "var(--text)" : "var(--text3)", padding: "7px 16px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: addMode === m.id ? 600 : 400, border: addMode === m.id ? "1px solid var(--line2)" : "1px solid transparent", cursor: "pointer" }}>
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
        </div>

        <Divider my={0} />

        <div style={{ marginTop: 40 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "var(--serif)", marginBottom: 6 }}>Talent Pool</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 24 }}>Browse AI-powered portfolios from registered job seekers.</div>
          <div style={{ position: "relative", maxWidth: 480, marginBottom: 28 }}>
            <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={15} color="var(--text3)" /></div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, role, or skill…" style={{ paddingLeft: 40 }} />
          </div>
          {poolLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--text3)", fontSize: 14 }}>{search ? "No candidates match your search." : "No profiles available yet."}</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map(p => <ProfileCard key={p.user_id} profile={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
