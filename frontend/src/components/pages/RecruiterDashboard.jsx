import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner, Btn, Divider } from "../ui/primitives";
import Icon from "../ui/Icon";
import CandidateEvaluator from "./CandidateEvaluator";
import ProfileCard from "./ProfileCard";

function RecruiterDashboard({ auth, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [addMode, setAddMode] = useState("url");
  const [candidateUrl, setCandidateUrl] = useState("");
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadResume, setUploadResume] = useState(null);
  const [uploadLinkedin, setUploadLinkedin] = useState(null);
  const [uploadGithub, setUploadGithub] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    axios.get(`${API}/profiles/list`)
      .then(r => setProfiles(r.data.profiles || []))
      .catch(() => {})
      .finally(() => setPoolLoading(false));
  }, []);

  const addCandidate = async () => {
    setCandidateError("");
    const idMatch = candidateUrl.match(/([0-9a-f]{8})(?:[^0-9a-f]|$)/);
    const id = idMatch ? idMatch[1] : candidateUrl.trim();
    if (!id || id.length !== 8) return setCandidateError("Paste a valid portfolio URL.");
    if (candidates.some(c => c.user_id === id)) return setCandidateError("Already added.");
    setCandidateLoading(true);
    try {
      const r = await axios.get(`${API}/profile/${id}`);
      setCandidates(prev => [...prev, r.data]);
      setCandidateUrl("");
    } catch { setCandidateError("Could not find that portfolio. Check the URL."); }
    finally { setCandidateLoading(false); }
  };

  const addByUpload = async () => {
    if (!uploadResume && !uploadLinkedin && !uploadGithub.trim()) return setUploadError("Add at least one file or GitHub URL.");
    setUploadError(""); setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", uploadName.trim());
      fd.append("github_url", uploadGithub.trim());
      if (uploadResume) fd.append("resume", uploadResume);
      if (uploadLinkedin) fd.append("linkedin", uploadLinkedin);
      const r = await axios.post(`${API}/evaluate/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setCandidates(prev => [...prev, r.data]);
      setUploadName(""); setUploadResume(null); setUploadLinkedin(null); setUploadGithub("");
    } catch { setUploadError("Upload failed. Please try again."); }
    finally { setUploadLoading(false); }
  };

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
        {/* Evaluate a Candidate */}
        <div style={{ marginBottom: 52 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "var(--serif)", marginBottom: 6 }}>Evaluate a Candidate</div>
          <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>Add a candidate via their prolio portfolio link, or upload their resume / LinkedIn / GitHub directly.</div>

          <div style={{ display: "flex", gap: 2, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "4px", width: "fit-content", marginBottom: 20 }}>
            {[{ id: "url", label: "By Portfolio URL" }, { id: "upload", label: "Upload Files" }].map(m => (
              <button key={m.id} onClick={() => { setAddMode(m.id); setCandidateError(""); setUploadError(""); }}
                style={{ background: addMode === m.id ? "var(--bg3)" : "transparent", color: addMode === m.id ? "var(--text)" : "var(--text3)", padding: "7px 16px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: addMode === m.id ? 600 : 400, border: addMode === m.id ? "1px solid var(--line2)" : "1px solid transparent", cursor: "pointer" }}>
                {m.label}
              </button>
            ))}
          </div>

          {addMode === "url" ? (
            <>
              <div style={{ display: "flex", gap: 10, maxWidth: 640, marginBottom: 8 }}>
                <input value={candidateUrl} onChange={e => setCandidateUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && addCandidate()}
                  placeholder="Paste portfolio URL, e.g. prolio.co/#/portfolio/name-id" style={{ flex: 1 }} />
                <Btn onClick={addCandidate} disabled={candidateLoading || !candidateUrl.trim()}>
                  {candidateLoading ? <Spinner size={14} color="#fff" /> : "Add Candidate"}
                </Btn>
              </div>
              {candidateError && <div style={{ color: "var(--red)", fontSize: 13 }}>{candidateError}</div>}
            </>
          ) : (
            <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "22px 24px", maxWidth: 640 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Candidate Name</div>
                  <input value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="Full name (optional)" style={{ width: "100%" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>GitHub Profile URL</div>
                  <input value={uploadGithub} onChange={e => setUploadGithub(e.target.value)} placeholder="github.com/username" style={{ width: "100%" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
                {[
                  { label: "Resume / CV", accept: ".pdf,.docx,.pptx,.txt", file: uploadResume, setFile: setUploadResume },
                  { label: "LinkedIn PDF", accept: ".pdf", file: uploadLinkedin, setFile: setUploadLinkedin },
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
              {uploadError && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{uploadError}</div>}
              <Btn onClick={addByUpload} disabled={uploadLoading || (!uploadResume && !uploadLinkedin && !uploadGithub.trim())}>
                {uploadLoading ? <><Spinner size={14} color="#fff" /> Analyzing…</> : <><Icon name="zap" size={14} color="#fff" /> Analyze Candidate</>}
              </Btn>
            </div>
          )}

          {candidates.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
              {candidates.map(c => (
                <CandidateEvaluator key={c.user_id} candidate={c} onRemove={() => setCandidates(prev => prev.filter(x => x.user_id !== c.user_id))} />
              ))}
            </div>
          )}
        </div>

        <Divider my={0} />

        {/* Talent Pool */}
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
