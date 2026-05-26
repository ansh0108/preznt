import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { nameToSlug } from "../../lib/utils";
import { Spinner } from "../ui/primitives";
import DashboardHeader from "./DashboardHeader";
import LeftSidebar from "./LeftSidebar";
import RightPanel from "./RightPanel";

// ─── useProfileData ────────────────────────────────────────────────────────────
function useProfileData(activePortfolioId, auth) {
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [buildError, setBuildError] = useState(null);
  const [built, setBuilt] = useState(false);

  const loadProfile = async () => {
    try {
      const r = await axios.get(`${API}/profile/${activePortfolioId}`);
      setProfile(r.data); setBuilt(r.data.indexed);
    } catch (e) { setBuildError(e?.message || "Failed to load profile."); }
    finally { setProfileLoading(false); }
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
    await buildPortfolio();
  };

  const saveLinks = async (updatedLinks) => {
    try {
      await axios.patch(`${API}/profile/${activePortfolioId}/links`, { links: updatedLinks }, { headers: { Authorization: `Bearer ${auth?.token}` } });
      await loadProfile();
    } catch (e) { setBuildError(e?.message || "Failed to save links."); }
  };

  return { profile, setProfile, profileLoading, building, buildError, built, loadProfile, buildPortfolio, uploadFile, saveLinks };
}

// ─── usePortfolioList ──────────────────────────────────────────────────────────
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
    } catch (e) { /* non-critical: silently fail on portfolio list errors */ }
  };

  const createPortfolio = async () => {
    if (!newRoleName.trim()) return;
    setCreatingLoading(true);
    try {
      const r = await axios.post(`${API}/portfolio/create`, { role_name: newRoleName.trim() }, { headers: { Authorization: `Bearer ${auth.token}` } });
      setActivePortfolioId(r.data.portfolio_id);
      setNewRoleName(""); setCreatingPortfolio(false);
      await loadPortfolios();
    } catch (e) { /* creation failed; loading state cleared in finally */ }
    finally { setCreatingLoading(false); }
  };

  const setPrimary = async (pid) => {
    try { await axios.patch(`${API}/portfolio/${pid}/set-primary`, {}, { headers: { Authorization: `Bearer ${auth.token}` } }); await loadPortfolios(); }
    catch (e) { /* non-critical: primary switch failed */ }
  };

  const deletePortfolio = async (pid) => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/portfolio/${pid}`, { headers: { Authorization: `Bearer ${auth.token}` } });
      const remaining = portfolios.filter(p => p.id !== pid);
      if (activePortfolioId === pid && remaining.length > 0) setActivePortfolioId(remaining[0].id);
      setDeletingPortfolioId(null); await loadPortfolios();
    } catch (e) { /* delete failed; UI state unchanged */ }
    finally { setDeleteLoading(false); }
  };

  return { portfolios, loadPortfolios, creatingPortfolio, setCreatingPortfolio, newRoleName, setNewRoleName, creatingLoading, deletingPortfolioId, setDeletingPortfolioId, deleteLoading, createPortfolio, setPrimary, deletePortfolio };
}

// ─── usePortfolioManager ───────────────────────────────────────────────────────
function usePortfolioManager(auth, initialPortfolioId) {
  const [activePortfolioId, setActivePortfolioId] = useState(initialPortfolioId);
  const profileData = useProfileData(activePortfolioId, auth);
  const portfolioList = usePortfolioList(auth, activePortfolioId, setActivePortfolioId);

  useEffect(() => { profileData.loadProfile(); portfolioList.loadPortfolios(); }, [activePortfolioId]);

  return { activePortfolioId, setActivePortfolioId, ...profileData, ...portfolioList };
}

function useDashboardState() {
  const [tab, setTab] = useState("build");
  const [copied, setCopied] = useState(false);
  const [github, setGithub] = useState({ adding: false, url: "", loading: false });
  const [link, setLink] = useState({ adding: false, value: { type: "product", title: "", url: "", issuer: "", date: "" }, saving: false });
  const [gapState, setGapState] = useState({ role: "", result: null, error: null });
  const [clState, setClState] = useState({ jd: "", company: "", role: "", result: null });
  const [reparsingLinkedin, setReparsingLinkedin] = useState(false);
  return { tab, setTab, copied, setCopied, github, setGithub, link, setLink, gapState, setGapState, clState, setClState, reparsingLinkedin, setReparsingLinkedin };
}

// ─── SeekerProfileDashboard ────────────────────────────────────────────────────
function SeekerProfileDashboard({ auth, setAuth, onLogout, initialPortfolioId }) {
  const pm = usePortfolioManager(auth, initialPortfolioId);
  const { tab, setTab, copied, setCopied, github, setGithub, link, setLink, gapState, setGapState, clState, setClState, reparsingLinkedin, setReparsingLinkedin } = useDashboardState();

  if (pm.profileLoading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Spinner size={32} />
    </div>
  );

  const hasLinkedin = (pm.profile?.experience?.length > 0) || !!pm.profile?.linkedin_summary;
  const hasResume = pm.profile?.resume_projects?.length > 0;
  const hasGithub = pm.profile?.github_urls?.length > 0;
  const activePortfolio = pm.portfolios.find(p => p.id === pm.activePortfolioId);
  const roleSlug = activePortfolio?.role_name ? `-${nameToSlug(activePortfolio.role_name)}` : "";
  const shareUrl = auth.profile_name
    ? `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(auth.profile_name)}${roleSlug}-${pm.activePortfolioId}`
    : `${window.location.origin}${window.location.pathname}#/portfolio/${pm.activePortfolioId}`;
  const links = pm.profile?.links || [];

  const handleReparseLinkedin = async () => {
    setReparsingLinkedin(true);
    try { await axios.post(`${API}/reparse/linkedin/${pm.activePortfolioId}`); await pm.loadProfile(); pm.buildPortfolio(); }
    catch (e) { /* reparse failed silently */ }
    finally { setReparsingLinkedin(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <div style={{ position: "absolute", top: 80, right: 100, width: 600, height: 600, borderRadius: "50%", background: "rgba(129,140,248,0.04)", filter: "blur(120px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <DashboardHeader auth={auth} built={pm.built} shareUrl={shareUrl} copied={copied} onLogout={onLogout}
          onCopy={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 24, alignItems: "flex-start" }}>
          <LeftSidebar pm={pm} hasLinkedin={hasLinkedin} hasResume={hasResume} hasGithub={hasGithub} github={github} setGithub={setGithub} link={link} setLink={setLink} links={links} onReparseLinkedin={handleReparseLinkedin} reparsingLinkedin={reparsingLinkedin} />
          <RightPanel tab={tab} setTab={setTab} pm={pm} gapState={gapState} setGapState={setGapState} clState={clState} setClState={setClState} hasLinkedin={hasLinkedin} hasResume={hasResume} hasGithub={hasGithub} hasLinks={links.length > 0} setGithub={setGithub} shareUrl={shareUrl} auth={auth} />
        </div>
      </div>
    </div>
  );
}

export default SeekerProfileDashboard;
