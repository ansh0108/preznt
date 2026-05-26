import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner } from "../ui/primitives";
import Icon from "../ui/Icon";

const T = { r: "12px" };

const inputSt = { width: "100%", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: T.r, padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none", boxSizing: "border-box", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" };
const labelSt = { fontSize: 11, fontWeight: 700, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" };

// ─── FileDropZone ─────────────────────────────────────────────────────────────
function FileDropZone({ label, accept, file, setFile }) {
  return (
    <label style={{ cursor: "pointer" }}>
      <span style={labelSt}>{label}</span>
      <div style={{ border: `1.5px dashed ${file ? "var(--accent)" : "var(--line)"}`, borderRadius: T.r, padding: "14px 16px", display: "flex", alignItems: "center", gap: 9, background: file ? "var(--bg4)" : "var(--bg2)", transition: "all 0.15s" }}>
        <Icon name={file ? "check" : "file"} size={14} color={file ? "var(--accent)" : "var(--text3)"} />
        <span style={{ fontSize: 12.5, color: file ? "var(--accent)" : "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
          {file ? file.name : `Upload ${label}`}
        </span>
      </div>
      <input type="file" accept={accept} style={{ display: "none" }} onChange={e => setFile(e.target.files[0] || null)} />
    </label>
  );
}

// ─── AddByUpload ──────────────────────────────────────────────────────────────
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

  const canSubmit = !!(resume || linkedin || github.trim());
  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: T.r, padding: "24px", maxWidth: 640, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.18)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <span style={labelSt}>Candidate Name</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name (optional)" style={inputSt} />
        </div>
        <div>
          <span style={labelSt}>GitHub Profile URL</span>
          <input value={github} onChange={e => setGithub(e.target.value)} placeholder="github.com/username" style={inputSt} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        <FileDropZone label="Resume / CV" accept=".pdf,.docx,.pptx,.txt" file={resume} setFile={setResume} />
        <FileDropZone label="LinkedIn PDF" accept=".pdf" file={linkedin} setFile={setLinkedin} />
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <button onClick={submit} disabled={loading || !canSubmit}
        style={{ background: "var(--accent)", color: "#fff", border: "none", borderRadius: T.r, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: loading || !canSubmit ? "not-allowed" : "pointer", opacity: loading || !canSubmit ? 0.55 : 1, display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
        {loading ? <><Spinner size={14} color="#fff" /> Analyzing…</> : <><Icon name="zap" size={14} color="#fff" /> Analyze Candidate</>}
      </button>
    </div>
  );
}

export default AddByUpload;
