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

function useProfileData(activePortfolioId) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState(null);
  const [built, setBuilt] = useState(false);

  const loadProfile = async () => {
    try {
      const r = await axios.get(`${API}/profile/${activePortfolioId}`);
      setProfile(r.data); setBuilt(r.data.indexed);
    } catch {} finally { setProfileLoading(false); }
  };

  const buildPortfolio = async () => {
    setBuilding(true); setBuildError(null);
    try { await axios.post(`${API}/index/${activePortfolioId}`); setBuilt(true); await loadProfile(); }
    catch { setBuildError("Build failed. Please try again."); }
    finally { setBuilding(false); }
  };

  const uploadFile = async (file, type) => {
    const f = new FormData(); f.append("file", file);
    const ep = type === "linkedin" ? `/upload/linkedin/${activePortfolioId}` : `/upload/document/${activePortfolioId}`;
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { await axios.post(`${API}${ep}`, f, { timeout: 60000 }); await loadProfile(); break; }
      catch (e) { lastErr = e; if (attempt < 3) await new Promise(r => setTimeout(r, 1500 * attempt)); else throw lastErr; }
    }
    buildPortfolio();
  };

  const saveLinks = async (updatedLinks) => {
    try {
      await axios.patch(`${API}/profile/${activePortfolioId}/links`, { links: updatedLinks });
      await loadProfile();
    } catch {}
  };

  return { profile, setProfile, profileLoading, building, buildError, built, loadProfile, buildPortfolio, uploadFile, saveLinks };
}

function usePortfolioList(auth, activePortfolioId, setActivePortfolioId) {
  const [portfolios, setPortfolios] = useState([]);
  const [creatingPortfolio, setCreatingPortfolio] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [creatingLoading, setCreatingLoading] = useState(false);
  const [deletingPortfolioId, setDeletingPortfolioId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadPortfolios = async () => {
    try {
      const r = await axios.get(`${API}/portfolios/mine`, { headers: { Authorization: `Bearer ${auth.token}` } });
      setPortfolios(r.data.portfolios || []);
    } catch {}
  };

  const createPortfolio = async () => {
    if (!newRoleName.trim()) return;
    setCreatingLoading(true);
    try {
      const r = await axios.post(`${API}/portfolio/create`, { role_name: newRoleName.trim() }, { headers: { Authorization: `Bearer ${auth.token}` } });
      setActivePortfolioId(r.data.portfolio_id);
      setNewRoleName(""); setCreatingPortfolio(false);
      await loadPortfolios();
    } catch {} finally { setCreatingLoading(false); }
  };

  const setPrimary = async (pid) => {
    try { await axios.patch(`${API}/portfolio/${pid}/set-primary`, {}, { headers: { Authorization: `Bearer ${auth.token}` } }); await loadPortfolios(); }
    catch {}
  };

  const deletePortfolio = async (pid) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/portfolio/${pid}`, { headers: { Authorization: `Bearer ${auth.token}` } });
      const remaining = portfolios.filter(p => p.id !== pid);
      if (activePortfolioId === pid && remaining.length > 0) setActivePortfolioId(remaining[0].id);
      setDeletingPortfolioId(null); await loadPortfolios();
    } catch {} finally { setDeleteLoading(false); }
  };

  return { portfolios, loadPortfolios, creatingPortfolio, setCreatingPortfolio, newRoleName, setNewRoleName, creatingLoading, deletingPortfolioId, setDeletingPortfolioId, deleteLoading, createPortfolio, setPrimary, deletePortfolio };
}

function usePortfolioManager(auth, initialPortfolioId) {
  const [activePortfolioId, setActivePortfolioId] = useState(initialPortfolioId);
  const profileData = useProfileData(activePortfolioId);
  const portfolioList = usePortfolioList(auth, activePortfolioId, setActivePortfolioId);

  useEffect(() => { profileData.loadProfile(); portfolioList.loadPortfolios(); }, [activePortfolioId]);

  return { activePortfolioId, setActivePortfolioId, ...profileData, ...portfolioList };
}

function DeleteModal({ portfolioId, portfolios, deleteLoading, onConfirm, onCancel }) {
  const name = portfolios.find(p => p.id === portfolioId)?.role_name;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.15s ease" }}>
      <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 32px", maxWidth: 380, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Delete Portfolio?</div>
        <div style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6, marginBottom: 24 }}>
          This will permanently delete <strong style={{ color: "var(--text)" }}>{name}</strong> and all its data. This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} className="b-ghost" style={{ padding: "9px 18px", borderRadius: "var(--r-md)", background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleteLoading} style={{ padding: "9px 18px", borderRadius: "var(--r-md)", background: "var(--red)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: deleteLoading ? 0.6 : 1 }}>
            {deleteLoading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PortfolioSwitcher({ portfolios, activePortfolioId, setActivePortfolioId, setProfile, creatingPortfolio, setCreatingPortfolio, newRoleName, setNewRoleName, creatingLoading, createPortfolio, deletingPortfolioId, setDeletingPortfolioId, deletePortfolio, deleteLoading, setPrimary }) {
  if (!portfolios.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Portfolios</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {portfolios.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <button onClick={() => { setActivePortfolioId(p.id); setProfile(null); }} className="b-pill"
              style={{ padding: "8px 14px", borderRadius: portfolios.length > 1 ? "100px 0 0 100px" : 100, fontSize: 13, fontWeight: 600, cursor: "pointer", background: p.id === activePortfolioId ? "var(--accent-d)" : "var(--bg2)", border: `1px solid ${p.id === activePortfolioId ? "var(--accent)" : "var(--line2)"}`, borderRight: portfolios.length > 1 ? "none" : undefined, color: p.id === activePortfolioId ? "var(--accent)" : "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
              {p.role_name}
              {p.is_primary && <span style={{ fontSize: 10, color: "var(--amber)", fontWeight: 800 }}>★</span>}
              {p.built && <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />}
            </button>
            {portfolios.length > 1 && (
              <button onClick={() => setDeletingPortfolioId(p.id)} title="Delete portfolio"
                style={{ padding: "8px 9px", borderRadius: "0 100px 100px 0", fontSize: 13, cursor: "pointer", background: p.id === activePortfolioId ? "var(--accent-d)" : "var(--bg2)", border: `1px solid ${p.id === activePortfolioId ? "var(--accent)" : "var(--line2)"}`, color: "var(--text3)", display: "flex", alignItems: "center", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.borderColor = p.id === activePortfolioId ? "var(--accent)" : "var(--line2)"; e.currentTarget.style.background = p.id === activePortfolioId ? "var(--accent-d)" : "var(--bg2)"; }}>
                <Icon name="x" size={11} color="currentColor" />
              </button>
            )}
          </div>
        ))}
        <button onClick={() => setCreatingPortfolio(v => !v)} style={{ padding: "8px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1px dashed var(--line2)", color: "var(--text3)", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.color = "var(--text3)"; }}>
          + New
        </button>
      </div>
      {creatingPortfolio && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} onKeyDown={e => e.key === "Enter" && createPortfolio()} placeholder="e.g. Data Analyst" autoFocus
            style={{ flex: 1, fontSize: 12, padding: "6px 10px", background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text)", outline: "none" }} />
          <button onClick={createPortfolio} disabled={!newRoleName.trim() || creatingLoading} className="b-primary"
            style={{ padding: "6px 12px", borderRadius: "var(--r-md)", background: "var(--accent)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: (!newRoleName.trim() || creatingLoading) ? 0.5 : 1 }}>
            {creatingLoading ? "…" : "Create"}
          </button>
        </div>
      )}
      {portfolios.length > 1 && portfolios.find(p => p.id === activePortfolioId && !p.is_primary) && (
        <button onClick={() => setPrimary(activePortfolioId)} className="b-ghost"
          style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: "var(--text3)", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", cursor: "pointer", padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--amber)" }}>★</span> Set as primary portfolio
        </button>
      )}
      {deletingPortfolioId && (
        <DeleteModal portfolioId={deletingPortfolioId} portfolios={portfolios} deleteLoading={deleteLoading}
          onConfirm={() => deletePortfolio(deletingPortfolioId)} onCancel={() => setDeletingPortfolioId(null)} />
      )}
    </div>
  );
}

function OnboardingSteps({ hasLinkedin, hasResume, hasGithub, built, building, buildError, uploadFile, setAddingGithub, buildPortfolio }) {
  const steps = [
    { label: "Upload LinkedIn PDF", done: hasLinkedin, id: "onb-li", accept: ".pdf", type: "linkedin", action: "upload", hint: "Go to your LinkedIn profile → More → Save to PDF" },
    { label: "Upload Resume", done: hasResume, id: "onb-cv", accept: ".pdf,.docx,.pptx,.txt", type: "resume", action: "upload", hint: "PDF, Word, or plain text — any format works" },
    { label: "Connect GitHub", done: hasGithub, action: "github", hint: "Shows your projects on the portfolio — optional but recommended" },
    { label: "Portfolio built", done: built, action: "none", hint: building ? "Building your AI portfolio now…" : "Happens automatically after each upload" },
  ];
  const allDone = steps.every(s => s.done);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", overflow: "hidden" }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < steps.length - 1 ? "1px solid var(--line)" : "none", background: step.done ? "rgba(45,212,191,0.03)" : "transparent" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: step.done ? "rgba(45,212,191,0.12)" : "var(--bg3)", border: `1px solid ${step.done ? "rgba(45,212,191,0.4)" : "var(--line2)"}` }}>
              {step.done ? <Icon name="check" size={13} color="var(--teal)" /> : step.action === "none" && building ? <Spinner size={12} color="var(--accent)" /> : <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)" }}>{i + 1}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: step.done ? "var(--teal)" : "var(--text)" }}>{step.label}</div>
              <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 2 }}>{step.hint}</div>
            </div>
            {step.action === "upload" && !step.done && (
              <label htmlFor={step.id} style={{ cursor: "pointer", flexShrink: 0 }}>
                <div style={{ background: "var(--accent)", color: "#fff", borderRadius: "var(--r-md)", padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>Upload</div>
                <input id={step.id} type="file" accept={step.accept} style={{ display: "none" }} onChange={e => e.target.files[0] && uploadFile(e.target.files[0], step.type)} />
              </label>
            )}
            {step.action === "github" && !step.done && (
              <button onClick={() => setAddingGithub(true)} style={{ background: "var(--accent)", color: "#fff", borderRadius: "var(--r-md)", padding: "6px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0 }}>Connect</button>
            )}
            {step.action === "upload" && step.done && (
              <label htmlFor={`${step.id}-replace`} style={{ cursor: "pointer", flexShrink: 0 }}>
                <div style={{ background: "var(--bg3)", color: "var(--text3)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "5px 12px", fontSize: 11 }}>Replace</div>
                <input id={`${step.id}-replace`} type="file" accept={step.accept} style={{ display: "none" }} onChange={e => e.target.files[0] && uploadFile(e.target.files[0], step.type)} />
              </label>
            )}
          </div>
        ))}
      </div>
      {buildError && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 10 }}>{buildError}</div>}
      {allDone && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Btn variant="ghost" onClick={buildPortfolio} disabled={building} style={{ fontSize: 12 }}>
            {building ? <><Spinner size={12} color="var(--accent)" /> Rebuilding…</> : "↺ Rebuild"}
          </Btn>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>Run this if you've replaced a document and want to refresh the AI.</span>
        </div>
      )}
    </div>
  );
}

const SEEKER_TABS = [
  { id: "build", label: "Build Portfolio", icon: "zap" },
  { id: "gap", label: "Gap Analysis", icon: "target" },
  { id: "cover", label: "Cover Letter", icon: "file" },
  { id: "analytics", label: "Analytics", icon: "chart" },
  { id: "interview", label: "Interview Prep", icon: "zap" },
];

const linkInputSt = { width: "100%", background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: 12, padding: "7px 10px", outline: "none" };

function DashboardHeader({ auth, built, shareUrl, copied, onLogout, onCopy }) {
  return (
    <div style={{ borderBottom: "1px solid var(--line)", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 10, backdropFilter: "blur(12px)" }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>prolio<span style={{ color: "var(--accent)" }}>.</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {built && (
          <button onClick={onCopy} className="b-ghost"
            style={{ background: copied ? "rgba(45,212,191,0.1)" : "var(--bg2)", border: `1px solid ${copied ? "var(--teal)" : "var(--line2)"}`, borderRadius: "var(--r-md)", color: copied ? "var(--teal)" : "var(--text2)", padding: "6px 14px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name={copied ? "check" : "link"} size={13} color={copied ? "var(--teal)" : "var(--text2)"} />
            {copied ? "Copied!" : "Share Portfolio"}
          </button>
        )}
        {built && (
          <a href={shareUrl} target="_blank" rel="noreferrer" className="b-ghost"
            style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text3)", padding: "6px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <Icon name="external" size={13} color="var(--text3)" /> View Live
          </a>
        )}
        <div style={{ fontSize: 13, color: "var(--text3)" }}>{auth.email}</div>
        <button onClick={onLogout} className="b-ghost" style={{ background: "transparent", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text3)", padding: "6px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="logout" size={13} color="var(--text3)" /> Sign out
        </button>
      </div>
    </div>
  );
}

function ProfileCard({ pm }) {
  return (
    <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "22px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
      {pm.built && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--accent), var(--teal), var(--accent))", backgroundSize: "200% 100%", animation: "gradient-x 3s ease infinite" }} />}
      <div style={{ marginBottom: 14 }}>
        <ProfilePhoto key={`photo-${pm.activePortfolioId}-${pm.profile?.photo_ext || "none"}`} userId={pm.profile?.has_photo ? pm.activePortfolioId : null} name={pm.profile?.name} size={72} onUpload={() => document.getElementById("dash-photo-upload").click()} />
        <input id="dash-photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
          const file = e.target.files[0]; if (!file) return;
          const fd = new FormData(); fd.append("file", file);
          try { await axios.post(`${API}/upload/photo/${pm.activePortfolioId}`, fd); pm.loadProfile(); } catch {}
          e.target.value = "";
        }} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{pm.profile?.name}</div>
        {pm.profile?.title && <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{pm.profile.title}</div>}
        {pm.profile?.tagline && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 5, fontStyle: "italic", lineHeight: 1.5 }}>{pm.profile.tagline}</div>}
        {pm.built && (
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.35)", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "var(--teal)", fontWeight: 600 }}>
            <span className="live-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block", flexShrink: 0 }} />
            Portfolio Live
          </div>
        )}
      </div>
    </div>
  );
}

function GithubSection({ hasGithub, pm, github, setGithub }) {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: hasGithub ? "rgba(45,212,191,0.1)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="github" size={14} color={hasGithub ? "var(--teal)" : "var(--text3)"} />
          </div>
          <span style={{ fontSize: 13, color: hasGithub ? "var(--text2)" : "var(--text3)", fontWeight: 500 }}>GitHub Repos</span>
        </div>
        <button onClick={() => setGithub(g => ({ ...g, adding: !g.adding }))} className="b-ghost" style={{ background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: 6, color: "var(--accent)", padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>
          {github.adding ? "Cancel" : "+ Add"}
        </button>
      </div>
      {hasGithub && <div style={{ fontSize: 12, color: "var(--text3)", paddingLeft: 36, marginBottom: 6 }}>{pm.profile.github_urls.length} repo{pm.profile.github_urls.length !== 1 ? "s" : ""} added</div>}
      {github.adding && (
        <div style={{ marginTop: 12 }}>
          <GithubRepoPicker onConfirm={async (urls) => {
            setGithub(g => ({ ...g, loading: true }));
            try {
              for (const url of urls) await axios.post(`${API}/profile/${pm.activePortfolioId}/github`, { github_url: url });
              setGithub(g => ({ ...g, adding: false }));
              await pm.loadProfile(); pm.buildPortfolio();
            } catch {} finally { setGithub(g => ({ ...g, loading: false })); }
          }} />
        </div>
      )}
    </div>
  );
}

function LinksPanel({ links, saveLinks, link, setLink, profile }) {
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: links.length > 0 ? "rgba(45,212,191,0.1)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="link" size={14} color={links.length > 0 ? "var(--teal)" : "var(--text3)"} />
          </div>
          <span style={{ fontSize: 13, color: links.length > 0 ? "var(--text2)" : "var(--text3)", fontWeight: 500 }}>Links & Credentials</span>
        </div>
        <button onClick={() => setLink(l => ({ ...l, adding: !l.adding }))} className="b-ghost" style={{ background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: 6, color: "var(--accent)", padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>
          {link.adding ? "Cancel" : "+ Add"}
        </button>
      </div>
      {links.length > 0 && (
        <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 5, marginBottom: link.adding ? 8 : 0 }}>
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
      {link.adding && (
        <div style={{ marginTop: 10, background: "var(--bg2)", borderRadius: "var(--r-md)", border: "1px solid var(--line2)", padding: "14px" }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
            {["certificate", "publication", "award", "other"].map(t => (
              <button key={t} onClick={() => setLink(l => ({ ...l, value: { ...l.value, type: t } }))} className="b-pill"
                style={{ padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, cursor: "pointer", background: link.value.type === t ? "var(--accent-d)" : "var(--bg3)", border: `1px solid ${link.value.type === t ? "var(--accent)" : "var(--line2)"}`, color: link.value.type === t ? "var(--accent)" : "var(--text3)" }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <input value={link.value.title} onChange={e => setLink(l => ({ ...l, value: { ...l.value, title: e.target.value } }))} placeholder="Title *" style={linkInputSt} />
          <input value={link.value.issuer} onChange={e => setLink(l => ({ ...l, value: { ...l.value, issuer: e.target.value } }))} placeholder={link.value.type === "publication" ? "Published in (optional)" : "Issued by (optional)"} style={{ ...linkInputSt, marginTop: 6 }} />
          <input value={link.value.url} onChange={e => setLink(l => ({ ...l, value: { ...l.value, url: e.target.value } }))} placeholder="URL (optional)" style={{ ...linkInputSt, marginTop: 6 }} />
          <input value={link.value.date} onChange={e => setLink(l => ({ ...l, value: { ...l.value, date: e.target.value } }))} placeholder="e.g. March 2024 (optional)" style={{ ...linkInputSt, marginTop: 6 }} />
          <button disabled={!link.value.title.trim() || link.saving} className="b-primary"
            onClick={async () => {
              setLink(l => ({ ...l, saving: true }));
              await saveLinks([...(profile?.links || []), { ...link.value }]);
              setLink({ adding: false, value: { type: "certificate", title: "", url: "", issuer: "", date: "" }, saving: false });
            }}
            style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: "var(--r-md)", background: "var(--accent)", border: "none", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: (!link.value.title.trim() || link.saving) ? 0.5 : 1 }}>
            {link.saving ? "Saving…" : "Add"}
          </button>
        </div>
      )}
    </div>
  );
}

function LeftSidebar({ pm, hasLinkedin, hasResume, hasGithub, github, setGithub, link, setLink, links }) {
  return (
    <div style={{ width: 300, flexShrink: 0 }}>
      <PortfolioSwitcher portfolios={pm.portfolios} activePortfolioId={pm.activePortfolioId} setActivePortfolioId={pm.setActivePortfolioId} setProfile={pm.setProfile} creatingPortfolio={pm.creatingPortfolio} setCreatingPortfolio={pm.setCreatingPortfolio} newRoleName={pm.newRoleName} setNewRoleName={pm.setNewRoleName} creatingLoading={pm.creatingLoading} createPortfolio={pm.createPortfolio} deletingPortfolioId={pm.deletingPortfolioId} setDeletingPortfolioId={pm.setDeletingPortfolioId} deletePortfolio={pm.deletePortfolio} deleteLoading={pm.deleteLoading} setPrimary={pm.setPrimary} />
      <ProfileCard pm={pm} />
      <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "18px 20px" }}>
        <SecHead style={{ marginBottom: 14 }}>Data Sources</SecHead>
        <UploadRow label="LinkedIn PDF" icon="user" done={hasLinkedin} accept=".pdf" onFile={f => pm.uploadFile(f, "linkedin")}
          hint={[["Go to your LinkedIn profile", "Click your profile photo → View Profile"], ['Click the "…" More button', "Below your name and headline"], ['Select "Save to PDF"', "Downloads your profile instantly as a PDF"]]} />
        <UploadRow label="Resume / CV" icon="file" done={hasResume} accept=".pdf,.docx,.pptx,.txt" onFile={f => pm.uploadFile(f, "resume")} />
        <GithubSection hasGithub={hasGithub} pm={pm} github={github} setGithub={setGithub} />
        <LinksPanel links={links} saveLinks={pm.saveLinks} link={link} setLink={setLink} profile={pm.profile} />
      </div>
    </div>
  );
}

function RightPanel({ tab, setTab, pm, gapState, setGapState, clState, setClState, hasLinkedin, hasResume, hasGithub, setGithub, shareUrl, auth }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", gap: 2, marginBottom: 20, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "4px", width: "fit-content" }}>
        {SEEKER_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="b-tab" data-active={tab === t.id}
            style={{ background: tab === t.id ? "var(--bg3)" : "transparent", color: tab === t.id ? "var(--text)" : "var(--text3)", padding: "9px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, border: tab === t.id ? "1px solid var(--line2)" : "1px solid transparent", boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.3)" : "none", display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
            <Icon name={t.icon} size={14} color={tab === t.id ? "var(--accent)" : "var(--text3)"} /> {t.label}
          </button>
        ))}
      </div>
      <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 30px", minHeight: 480 }}>
        <div key={`build-${tab === "build"}`} className={tab === "build" ? "tab-content" : ""} style={{ display: tab === "build" ? "block" : "none" }}>
          <SecHead>Build Portfolio</SecHead>
          <OnboardingSteps hasLinkedin={hasLinkedin} hasResume={hasResume} hasGithub={hasGithub} built={pm.built} building={pm.building} buildError={pm.buildError} uploadFile={pm.uploadFile} setAddingGithub={v => setGithub(g => ({ ...g, adding: v }))} buildPortfolio={pm.buildPortfolio} />
          {pm.built && !pm.building && (
            <div className="slide-down" style={{ marginTop: 20, background: "linear-gradient(135deg, rgba(45,212,191,0.08), rgba(129,140,248,0.06))", border: "1px solid rgba(45,212,191,0.35)", borderRadius: "var(--r-lg)", padding: "18px 22px", animation: "live-border 2.5s ease-in-out infinite" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span className="live-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", display: "inline-block", flexShrink: 0 }} />
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--teal)" }}>Portfolio is live!</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <a href={shareUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: "var(--teal)", wordBreak: "break-all", flex: 1, opacity: 0.85 }}>{shareUrl}</a>
                <a href={shareUrl} target="_blank" rel="noreferrer" className="b-ghost" style={{ background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.35)", borderRadius: "var(--r-md)", color: "var(--teal)", padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                  <Icon name="external" size={12} color="var(--teal)" /> Open
                </a>
              </div>
            </div>
          )}
          <div style={{ marginTop: 36, borderTop: "1px solid var(--line)", paddingTop: 28 }}>
            <CustomizeTab portfolioId={pm.activePortfolioId} auth={auth} profile={pm.profile} onPrefsChange={p => pm.setProfile(prev => ({ ...prev, preferences: p }))} onProfileChange={pm.loadProfile} />
          </div>
        </div>
        <div key={`gap-${tab === "gap"}`} className={tab === "gap" ? "tab-content" : ""} style={{ display: tab === "gap" ? "block" : "none" }}>
          <GapAnalysis userId={pm.activePortfolioId} built={pm.built} role={gapState.role} setRole={v => setGapState(s => ({ ...s, role: v }))} result={gapState.result} setResult={v => setGapState(s => ({ ...s, result: v }))} error={gapState.error} setError={v => setGapState(s => ({ ...s, error: v }))} />
        </div>
        <div key={`cover-${tab === "cover"}`} className={tab === "cover" ? "tab-content" : ""} style={{ display: tab === "cover" ? "block" : "none" }}>
          <CoverLetter userId={pm.activePortfolioId} built={pm.built} profile={pm.profile} jd={clState.jd} setJd={v => setClState(s => ({ ...s, jd: v }))} company={clState.company} setCompany={v => setClState(s => ({ ...s, company: v }))} role={clState.role} setRole={v => setClState(s => ({ ...s, role: v }))} result={clState.result} setResult={v => setClState(s => ({ ...s, result: v }))} />
        </div>
        {tab === "analytics" && <PortfolioAnalytics portfolioId={pm.activePortfolioId} token={auth.token} />}
        {tab === "interview" && <InterviewPrep userId={pm.activePortfolioId} jd={gapState.role} />}
      </div>
    </div>
  );
}

function SeekerProfileDashboard({ auth, setAuth, onLogout, initialPortfolioId }) {
  const pm = usePortfolioManager(auth, initialPortfolioId);
  const [tab, setTab] = useState("build");
  const [copied, setCopied] = useState(false);
  const [github, setGithub] = useState({ adding: false, url: "", loading: false });
  const [link, setLink] = useState({ adding: false, value: { type: "certificate", title: "", url: "", issuer: "", date: "" }, saving: false });
  const [gapState, setGapState] = useState({ role: "", result: null, error: null });
  const [clState, setClState] = useState({ jd: "", company: "", role: "", result: null });

  if (pm.profileLoading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}><Spinner size={32} /></div>;

  const hasLinkedin = (pm.profile?.experience?.length > 0) || !!pm.profile?.linkedin_summary;
  const hasResume = pm.profile?.resume_projects?.length > 0;
  const hasGithub = pm.profile?.github_urls?.length > 0;
  const activePortfolio = pm.portfolios.find(p => p.id === pm.activePortfolioId);
  const roleSlug = activePortfolio?.role_name ? `-${nameToSlug(activePortfolio.role_name)}` : "";
  const shareUrl = auth.profile_name ? `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(auth.profile_name)}${roleSlug}-${pm.activePortfolioId}` : `${window.location.origin}${window.location.pathname}#/portfolio/${pm.activePortfolioId}`;
  const links = pm.profile?.links || [];

  return (
    <div style={{ minHeight: "100vh" }}>
      <DashboardHeader auth={auth} built={pm.built} shareUrl={shareUrl} copied={copied} onLogout={onLogout}
        onCopy={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 24, alignItems: "flex-start" }}>
        <LeftSidebar pm={pm} hasLinkedin={hasLinkedin} hasResume={hasResume} hasGithub={hasGithub} github={github} setGithub={setGithub} link={link} setLink={setLink} links={links} />
        <RightPanel tab={tab} setTab={setTab} pm={pm} gapState={gapState} setGapState={setGapState} clState={clState} setClState={setClState} hasLinkedin={hasLinkedin} hasResume={hasResume} hasGithub={hasGithub} setGithub={setGithub} shareUrl={shareUrl} auth={auth} />
      </div>
    </div>
  );
}

export default SeekerProfileDashboard;
