import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { saveAuth } from "../../lib/auth";
import { nameToSlug } from "../../lib/utils";
import { Spinner, Btn, SecHead } from "../ui/primitives";
import Icon from "../ui/Icon";
import ProfilePhoto from "./ProfilePhoto";
import UploadRow from "./UploadRow";
import PortfolioAnalytics from "./PortfolioAnalytics";
import CustomizeTab from "./CustomizeTab";
import GithubRepoPicker from "../setup/GithubRepoPicker";
import GapAnalysis from "../features/GapAnalysis";
import CoverLetter from "../features/CoverLetter";
import InterviewPrep from "../features/InterviewPrep";

function SeekerProfileDashboard({ auth, setAuth, onLogout, initialPortfolioId }) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [tab, setTab] = useState("build");
  const [addingGithub, setAddingGithub] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [githubLoading, setGithubLoading] = useState(false);
  const [addingLink, setAddingLink] = useState(false);
  const [newLink, setNewLink] = useState({ type: "certificate", title: "", url: "", issuer: "", date: "" });
  const [linkSaving, setLinkSaving] = useState(false);
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState(null);
  const [built, setBuilt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gapRole, setGapRole] = useState(""); const [gapResult, setGapResult] = useState(null); const [gapError, setGapError] = useState(null);
  const [clJd, setClJd] = useState(""); const [clCompany, setClCompany] = useState(""); const [clRole, setClRole] = useState(""); const [clResult, setClResult] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [activePortfolioId, setActivePortfolioId] = useState(initialPortfolioId);
  const [creatingPortfolio, setCreatingPortfolio] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [deletingPortfolioId, setDeletingPortfolioId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProfile = async () => {
    try {
      const r = await axios.get(`${API}/profile/${activePortfolioId}`);
      setProfile(r.data);
      setBuilt(r.data.indexed);
    } catch {} finally { setProfileLoading(false); }
  };

  const loadPortfolios = async () => {
    try {
      const r = await axios.get(`${API}/portfolios/mine`, { headers: { Authorization: `Bearer ${auth.token}` } });
      setPortfolios(r.data.portfolios || []);
    } catch {}
  };

  useEffect(() => { loadProfile(); loadPortfolios(); }, [activePortfolioId]);

  const activePortfolio = portfolios.find(p => p.id === activePortfolioId);
  const roleSlug = activePortfolio?.role_name ? `-${nameToSlug(activePortfolio.role_name)}` : "";
  const shareSlug = auth.profile_name ? `${nameToSlug(auth.profile_name)}${roleSlug}-${activePortfolioId}` : activePortfolioId;
  const shareUrl = `${window.location.origin}${window.location.pathname}#/portfolio/${shareSlug}`;

  const uploadFile = async (file, type) => {
    const f = new FormData(); f.append("file", file);
    const ep = type === "linkedin" ? `/upload/linkedin/${activePortfolioId}` : `/upload/document/${activePortfolioId}`;
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { await axios.post(`${API}${ep}`, f, { timeout: 60000 }); await loadProfile(); return; }
      catch (e) { lastErr = e; if (attempt < 3) await new Promise(r => setTimeout(r, 1500 * attempt)); }
    }
    throw lastErr;
  };

  const saveLinks = async (updatedLinks) => {
    setLinkSaving(true);
    try {
      await axios.patch(`${API}/profile/${activePortfolioId}/links`, { links: updatedLinks }, { headers: { Authorization: `Bearer ${auth.token}` } });
      await loadProfile();
    } catch {} finally { setLinkSaving(false); }
  };

  const buildPortfolio = async () => {
    setBuilding(true); setBuildError(null);
    try {
      await axios.post(`${API}/index/${activePortfolioId}`);
      setBuilt(true); await loadProfile();
    } catch { setBuildError("Build failed. Please try again."); }
    finally { setBuilding(false); }
  };

  const createPortfolio = async () => {
    if (!newRoleName.trim()) return;
    setCreatingLoading(true);
    try {
      const r = await axios.post(`${API}/portfolio/create`, { role_name: newRoleName.trim() }, { headers: { Authorization: `Bearer ${auth.token}` } });
      const newId = r.data.portfolio_id;
      setActivePortfolioId(newId);
      setNewRoleName("");
      setCreatingPortfolio(false);
      await loadPortfolios();
    } catch {} finally { setCreatingLoading(false); }
  };

  const setPrimary = async (pid) => {
    try {
      await axios.patch(`${API}/portfolio/${pid}/set-primary`, {}, { headers: { Authorization: `Bearer ${auth.token}` } });
      await loadPortfolios();
    } catch {}
  };

  const deletePortfolio = async (pid) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/portfolio/${pid}`, { headers: { Authorization: `Bearer ${auth.token}` } });
      const remaining = portfolios.filter(p => p.id !== pid);
      if (activePortfolioId === pid && remaining.length > 0) {
        setActivePortfolioId(remaining[0].id);
      }
      setDeletingPortfolioId(null);
      await loadPortfolios();
    } catch {} finally { setDeleteLoading(false); }
  };

  if (profileLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><Spinner size={32} /></div>;

  const hasLinkedin = (profile?.experience?.length > 0) || !!profile?.linkedin_summary;
  const hasResume = profile?.resume_projects?.length > 0;
  const hasGithub = profile?.github_urls?.length > 0;

  const SEEKER_TABS = [
    { id: "build", label: "Build Portfolio", icon: "zap" },
    { id: "gap", label: "Gap Analysis", icon: "target" },
    { id: "cover", label: "Cover Letter", icon: "file" },
    { id: "analytics", label: "Analytics", icon: "chart" },
    { id: "interview", label: "Interview Prep", icon: "zap" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 10, backdropFilter: "blur(12px)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>prolio<span style={{ color: "var(--accent)" }}>.</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {built && (
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="b-ghost"
              style={{ background: copied ? "rgba(45,212,191,0.1)" : "var(--bg2)", border: `1px solid ${copied ? "var(--teal)" : "var(--line2)"}`, borderRadius: "var(--r-md)", color: copied ? "var(--teal)" : "var(--text2)", padding: "6px 14px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name={copied ? "check" : "link"} size={13} color={copied ? "var(--teal)" : "var(--text2)"} />
              {copied ? "Copied!" : "Share Portfolio"}
            </button>
          )}
          {built && (
            <a href={shareUrl} target="_blank" rel="noreferrer"
              className="b-ghost"
              style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text3)", padding: "6px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
              <Icon name="external" size={13} color="var(--text3)" /> View Live
            </a>
          )}
          <div style={{ fontSize: 13, color: "var(--text3)" }}>{auth.email}</div>
          <button onClick={onLogout} className="b-ghost"
            style={{ background: "transparent", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text3)", padding: "6px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="logout" size={13} color="var(--text3)" /> Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 24, alignItems: "flex-start" }}>
        {/* LEFT SIDEBAR */}
        <div style={{ width: 300, flexShrink: 0 }}>
          {/* Delete portfolio confirmation modal */}
          {deletingPortfolioId && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.15s ease" }}>
              <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 32px", maxWidth: 380, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Delete Portfolio?</div>
                <div style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6, marginBottom: 24 }}>
                  This will permanently delete <strong style={{ color: "var(--text)" }}>{portfolios.find(p => p.id === deletingPortfolioId)?.role_name}</strong> and all its data. This cannot be undone.
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button onClick={() => setDeletingPortfolioId(null)}
                    className="b-ghost"
                    style={{ padding: "9px 18px", borderRadius: "var(--r-md)", background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    Cancel
                  </button>
                  <button onClick={() => deletePortfolio(deletingPortfolioId)} disabled={deleteLoading}
                    style={{ padding: "9px 18px", borderRadius: "var(--r-md)", background: "var(--red)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: deleteLoading ? 0.6 : 1, transition: "all 0.15s" }}>
                    {deleteLoading ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio switcher */}
          {portfolios.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Portfolios</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {portfolios.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    <button onClick={() => { setActivePortfolioId(p.id); setProfile(null); setBuilt(false); }}
                      className="b-pill"
                      style={{
                        padding: "8px 14px", borderRadius: portfolios.length > 1 ? "100px 0 0 100px" : 100,
                        fontSize: 13, fontWeight: 600, cursor: "pointer",
                        background: p.id === activePortfolioId ? "var(--accent-d)" : "var(--bg2)",
                        border: `1px solid ${p.id === activePortfolioId ? "var(--accent)" : "var(--line2)"}`,
                        borderRight: portfolios.length > 1 ? "none" : undefined,
                        color: p.id === activePortfolioId ? "var(--accent)" : "var(--text2)",
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                      {p.role_name}
                      {p.is_primary && <span style={{ fontSize: 10, color: "var(--amber)", fontWeight: 800 }}>★</span>}
                      {p.built && <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />}
                    </button>
                    {portfolios.length > 1 && (
                      <button onClick={() => setDeletingPortfolioId(p.id)}
                        title="Delete portfolio"
                        style={{
                          padding: "8px 9px", borderRadius: "0 100px 100px 0",
                          fontSize: 13, cursor: "pointer",
                          background: p.id === activePortfolioId ? "var(--accent-d)" : "var(--bg2)",
                          border: `1px solid ${p.id === activePortfolioId ? "var(--accent)" : "var(--line2)"}`,
                          color: "var(--text3)", display: "flex", alignItems: "center",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.borderColor = p.id === activePortfolioId ? "var(--accent)" : "var(--line2)"; e.currentTarget.style.background = p.id === activePortfolioId ? "var(--accent-d)" : "var(--bg2)"; }}>
                        <Icon name="x" size={11} color="currentColor" />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => setCreatingPortfolio(v => !v)}
                  style={{ padding: "8px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1px dashed var(--line2)", color: "var(--text3)", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.color = "var(--accent)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.color = "var(--text3)"; }}>
                  + New
                </button>
              </div>
              {creatingPortfolio && (
                <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                  <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && createPortfolio()}
                    placeholder="e.g. Data Analyst" autoFocus
                    style={{ flex: 1, fontSize: 12, padding: "6px 10px", background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text)", outline: "none" }} />
                  <button onClick={createPortfolio} disabled={!newRoleName.trim() || creatingLoading}
                    className="b-primary"
                    style={{ padding: "6px 12px", borderRadius: "var(--r-md)", background: "var(--accent)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: (!newRoleName.trim() || creatingLoading) ? 0.5 : 1 }}>
                    {creatingLoading ? "…" : "Create"}
                  </button>
                </div>
              )}
              {portfolios.length > 1 && portfolios.find(p => p.id === activePortfolioId && !p.is_primary) && (
                <button onClick={() => setPrimary(activePortfolioId)}
                  className="b-ghost"
                  style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: "var(--text3)", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", cursor: "pointer", padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--amber)" }}>★</span> Set as primary portfolio
                </button>
              )}
            </div>
          )}

          {/* Profile card */}
          <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "22px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
            {built && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--accent), var(--teal), var(--accent))", backgroundSize: "200% 100%", animation: "gradient-x 3s ease infinite" }} />}
            <div style={{ marginBottom: 14 }}>
              <ProfilePhoto key={`photo-${activePortfolioId}-${profile?.photo_ext || "none"}`} userId={profile?.has_photo ? activePortfolioId : null} name={profile?.name} size={72} onUpload={() => document.getElementById("dash-photo-upload").click()} />
              <input id="dash-photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
                const file = e.target.files[0]; if (!file) return;
                const fd = new FormData(); fd.append("file", file);
                try { await axios.post(`${API}/upload/photo/${activePortfolioId}`, fd); loadProfile(); } catch {}
                e.target.value = "";
              }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{profile?.name}</div>
              {profile?.title && <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{profile.title}</div>}
              {profile?.tagline && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 5, fontStyle: "italic", lineHeight: 1.5 }}>{profile.tagline}</div>}
              {built && (
                <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.35)", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "var(--teal)", fontWeight: 600 }}>
                  <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block", flexShrink: 0 }} />
                  Portfolio Live
                </div>
              )}
            </div>
          </div>

          {/* Data sources */}
          <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "18px 20px" }}>
            <SecHead style={{ marginBottom: 14 }}>Data Sources</SecHead>
            <UploadRow label="LinkedIn PDF" icon="user" done={hasLinkedin} accept=".pdf" onFile={f => uploadFile(f, "linkedin")}
              hint={[
                ["Go to your LinkedIn profile", "Click your profile photo → View Profile"],
                ['Click the "…" More button', "Below your name and headline"],
                ['Select "Save to PDF"', "Downloads your profile instantly as a PDF"],
              ]}
            />
            <UploadRow label="Resume / CV" icon="file" done={hasResume} accept=".pdf,.docx,.pptx,.txt" onFile={f => uploadFile(f, "resume")} />

            {/* GitHub */}
            <div style={{ marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: hasGithub ? "rgba(45,212,191,0.1)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="github" size={14} color={hasGithub ? "var(--teal)" : "var(--text3)"} />
                  </div>
                  <span style={{ fontSize: 13, color: hasGithub ? "var(--text2)" : "var(--text3)", fontWeight: 500 }}>GitHub Repos</span>
                </div>
                <button onClick={() => setAddingGithub(v => !v)} className="b-ghost"
                  style={{ background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: 6, color: "var(--accent)", padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>
                  {addingGithub ? "Cancel" : "+ Add"}
                </button>
              </div>
              {hasGithub && <div style={{ fontSize: 12, color: "var(--text3)", paddingLeft: 36, marginBottom: 6 }}>{profile.github_urls.length} repo{profile.github_urls.length !== 1 ? "s" : ""} added</div>}
              {addingGithub && (
                <div style={{ marginTop: 12 }}>
                  <GithubRepoPicker onConfirm={async (urls) => {
                    setGithubLoading(true);
                    try {
                      for (const url of urls) {
                        await axios.post(`${API}/profile/${activePortfolioId}/github`, { github_url: url });
                      }
                      setAddingGithub(false);
                      await loadProfile();
                    } catch {} finally { setGithubLoading(false); }
                  }} />
                </div>
              )}
            </div>

            {/* Links & Credentials */}
            {(() => {
              const links = profile?.links || [];
              const linkInputSt = { width: "100%", background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: 12, padding: "7px 10px", outline: "none" };
              return (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: links.length > 0 ? "rgba(45,212,191,0.1)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="link" size={14} color={links.length > 0 ? "var(--teal)" : "var(--text3)"} />
                      </div>
                      <span style={{ fontSize: 13, color: links.length > 0 ? "var(--text2)" : "var(--text3)", fontWeight: 500 }}>Links & Credentials</span>
                    </div>
                    <button onClick={() => setAddingLink(v => !v)} className="b-ghost"
                      style={{ background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: 6, color: "var(--accent)", padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>
                      {addingLink ? "Cancel" : "+ Add"}
                    </button>
                  </div>
                  {links.length > 0 && (
                    <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 5, marginBottom: addingLink ? 8 : 0 }}>
                      {links.map((l, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                          <div style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                            <span style={{ color: "var(--accent)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginRight: 5 }}>{l.type === "certificate" ? "cert" : l.type}</span>
                            {l.title}
                          </div>
                          <button onClick={() => saveLinks(links.filter((_, j) => j !== i))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text3)", padding: "0 2px", fontSize: 16, lineHeight: 1 }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {addingLink && (
                    <div style={{ marginTop: 10, background: "var(--bg2)", borderRadius: "var(--r-md)", border: "1px solid var(--line2)", padding: "14px" }}>
                      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
                        {["certificate", "publication", "award", "other"].map(t => (
                          <button key={t} onClick={() => setNewLink(p => ({ ...p, type: t }))}
                            className="b-pill"
                            style={{ padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, cursor: "pointer",
                              background: newLink.type === t ? "var(--accent-d)" : "var(--bg3)",
                              border: `1px solid ${newLink.type === t ? "var(--accent)" : "var(--line2)"}`,
                              color: newLink.type === t ? "var(--accent)" : "var(--text3)" }}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </button>
                        ))}
                      </div>
                      <input value={newLink.title} onChange={e => setNewLink(p => ({ ...p, title: e.target.value }))} placeholder="Title *" style={linkInputSt} />
                      <input value={newLink.issuer} onChange={e => setNewLink(p => ({ ...p, issuer: e.target.value }))}
                        placeholder={newLink.type === "publication" ? "Published in (optional)" : "Issued by (optional)"}
                        style={{ ...linkInputSt, marginTop: 6 }} />
                      <input value={newLink.url} onChange={e => setNewLink(p => ({ ...p, url: e.target.value }))} placeholder="URL (optional)" style={{ ...linkInputSt, marginTop: 6 }} />
                      <input value={newLink.date} onChange={e => setNewLink(p => ({ ...p, date: e.target.value }))} placeholder="e.g. March 2024 (optional)" style={{ ...linkInputSt, marginTop: 6 }} />
                      <button disabled={!newLink.title.trim() || linkSaving}
                        className="b-primary"
                        onClick={async () => {
                          await saveLinks([...(profile?.links || []), { ...newLink }]);
                          setNewLink({ type: "certificate", title: "", url: "", issuer: "", date: "" });
                          setAddingLink(false);
                        }}
                        style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: "var(--r-md)", background: "var(--accent)", border: "none", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: (!newLink.title.trim() || linkSaving) ? 0.5 : 1 }}>
                        {linkSaving ? "Saving…" : "Add"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* RIGHT MAIN */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "4px", width: "fit-content" }}>
            {SEEKER_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="b-tab"
                data-active={tab === t.id}
                style={{
                  background: tab === t.id ? "var(--bg3)" : "transparent", color: tab === t.id ? "var(--text)" : "var(--text3)",
                  padding: "9px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                  border: tab === t.id ? "1px solid var(--line2)" : "1px solid transparent",
                  boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
                  display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                }}>
                <Icon name={t.icon} size={14} color={tab === t.id ? "var(--accent)" : "var(--text3)"} /> {t.label}
              </button>
            ))}
          </div>

          <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 30px", minHeight: 480 }}>
            {/* Build Portfolio */}
            <div key={`build-${tab === "build"}`} className={tab === "build" ? "tab-content" : ""} style={{ display: tab === "build" ? "block" : "none" }}>
              <SecHead>Build Portfolio</SecHead>
              <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
                Your portfolio is generated from your LinkedIn, resume, and GitHub data. Click each source below to upload, or use the sidebar.
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
                {[
                  { label: "LinkedIn", done: hasLinkedin, accept: ".pdf", type: "linkedin", inputId: "build-li" },
                  { label: "Resume", done: hasResume, accept: ".pdf,.docx,.pptx,.txt", type: "resume", inputId: "build-cv" },
                ].map(s => (
                  <label key={s.label} htmlFor={s.inputId} style={{ cursor: "pointer" }}>
                    <div className={!s.done ? "b-src" : ""}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: s.done ? "rgba(45,212,191,0.08)" : "var(--bg2)", border: `1px solid ${s.done ? "rgba(45,212,191,0.45)" : "var(--line2)"}`, borderRadius: "var(--r-md)", padding: "7px 14px", fontSize: 13 }}>
                      <Icon name={s.done ? "check" : "plus"} size={13} color={s.done ? "var(--teal)" : "var(--accent)"} />
                      <span style={{ color: s.done ? "var(--teal)" : "var(--text2)", fontWeight: 500 }}>{s.label}</span>
                      {!s.done && <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 2 }}>Upload</span>}
                    </div>
                    <input id={s.inputId} type="file" accept={s.accept} style={{ display: "none" }} onChange={e => e.target.files[0] && uploadFile(e.target.files[0], s.type)} />
                  </label>
                ))}
                <div className={!hasGithub ? "b-src" : ""} onClick={() => !hasGithub && setAddingGithub(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: hasGithub ? "rgba(45,212,191,0.08)" : "var(--bg2)", border: `1px solid ${hasGithub ? "rgba(45,212,191,0.45)" : "var(--line2)"}`, borderRadius: "var(--r-md)", padding: "7px 14px", fontSize: 13 }}>
                  <Icon name={hasGithub ? "check" : "github"} size={13} color={hasGithub ? "var(--teal)" : "var(--text3)"} />
                  <span style={{ color: hasGithub ? "var(--teal)" : "var(--text2)", fontWeight: 500 }}>GitHub</span>
                  {!hasGithub && <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 2 }}>Connect</span>}
                </div>
              </div>
              {!hasLinkedin && !hasResume && !hasGithub ? (
                <div style={{ color: "var(--text3)", fontSize: 13 }}>Add at least one data source from the sidebar to build your portfolio.</div>
              ) : (
                <Btn onClick={buildPortfolio} disabled={building}>
                  {building ? <><Spinner size={14} color="#fff" /> Building…</> : <><Icon name="zap" size={14} color="#fff" /> {built ? "Rebuild Portfolio" : "Build Portfolio"}</>}
                </Btn>
              )}
              {buildError && <div style={{ color: "var(--red)", fontSize: 13, marginTop: 12 }}>{buildError}</div>}
              {built && !building && (
                <div className="slide-down" style={{ marginTop: 20, background: "linear-gradient(135deg, rgba(45,212,191,0.08), rgba(129,140,248,0.06))", border: "1px solid rgba(45,212,191,0.35)", borderRadius: "var(--r-lg)", padding: "18px 22px", animation: "live-border 2.5s ease-in-out infinite" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", display: "inline-block", flexShrink: 0 }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--teal)" }}>Portfolio is live!</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <a href={shareUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: "var(--teal)", wordBreak: "break-all", flex: 1, opacity: 0.85 }}>{shareUrl}</a>
                    <a href={shareUrl} target="_blank" rel="noreferrer"
                      className="b-ghost"
                      style={{ background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.35)", borderRadius: "var(--r-md)", color: "var(--teal)", padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                      <Icon name="external" size={12} color="var(--teal)" /> Open
                    </a>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 36, borderTop: "1px solid var(--line)", paddingTop: 28 }}>
                <CustomizeTab portfolioId={activePortfolioId} auth={auth} profile={profile} onPrefsChange={(p) => setProfile(prev => ({ ...prev, preferences: p }))} onProfileChange={loadProfile} />
              </div>
            </div>

            {/* Gap Analysis */}
            <div key={`gap-${tab === "gap"}`} className={tab === "gap" ? "tab-content" : ""} style={{ display: tab === "gap" ? "block" : "none" }}>
              <GapAnalysis userId={activePortfolioId} role={gapRole} setRole={setGapRole} result={gapResult} setResult={setGapResult} error={gapError} setError={setGapError} />
            </div>

            {/* Cover Letter */}
            <div key={`cover-${tab === "cover"}`} className={tab === "cover" ? "tab-content" : ""} style={{ display: tab === "cover" ? "block" : "none" }}>
              <CoverLetter userId={activePortfolioId} profile={profile} jd={clJd} setJd={setClJd} company={clCompany} setCompany={setClCompany} role={clRole} setRole={setClRole} result={clResult} setResult={setClResult} />
            </div>

            {/* Analytics */}
            {tab === "analytics" && (
              <PortfolioAnalytics portfolioId={activePortfolioId} token={auth.token} />
            )}

            {/* Interview Prep */}
            {tab === "interview" && (
              <InterviewPrep userId={activePortfolioId} jd={gapRole} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeekerProfileDashboard;
