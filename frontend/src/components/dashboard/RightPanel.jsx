import { SecHead } from "../ui/primitives";
import { Spinner, Btn } from "../ui/primitives";
import Icon from "../ui/Icon";
import OnboardingSteps from "./OnboardingSteps";
import CustomizeTab from "./CustomizeTab";
import GapAnalysis from "../features/GapAnalysis";
import CoverLetter from "../features/CoverLetter";
import PortfolioAnalytics from "./PortfolioAnalytics";
import InterviewPrep from "../features/InterviewPrep";

const SEEKER_TABS = [
  { id: "build", label: "Build Portfolio", icon: "zap" },
  { id: "gap", label: "Gap Analysis", icon: "target" },
  { id: "cover", label: "Cover Letter", icon: "file" },
  { id: "analytics", label: "Analytics", icon: "chart" },
  { id: "interview", label: "Interview Prep", icon: "zap" },
];

// ─── SeekerTabBar ─────────────────────────────────────────────────────────────
function SeekerTabBar({ tab, setTab }) {
  return (
    <div style={{ display: "flex", gap: 3, marginBottom: 20, background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "4px", width: "fit-content" }}>
      {SEEKER_TABS.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} data-active={tab === t.id}
          style={{ background: tab === t.id ? "var(--bg3)" : "transparent", color: tab === t.id ? "var(--accent)" : "var(--text3)", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: tab === t.id ? 600 : 400, border: tab === t.id ? "1px solid var(--line)" : "1px solid transparent", boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.07)" : "none", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", transition: "all 0.14s", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
          <Icon name={t.icon} size={14} color={tab === t.id ? "var(--accent)" : "var(--text3)"} /> {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── BuildTabPanel ────────────────────────────────────────────────────────────
function BuildTabPanel({ pm, hasLinkedin, hasResume, hasGithub, hasLinks, setGithub, shareUrl, auth }) {
  return (
    <div>
      <SecHead>Build Portfolio</SecHead>
      <OnboardingSteps hasLinkedin={hasLinkedin} hasResume={hasResume} hasGithub={hasGithub} hasLinks={hasLinks}
        built={pm.built} building={pm.building} buildError={pm.buildError} uploadFile={pm.uploadFile}
        setAddingGithub={v => setGithub(g => ({ ...g, adding: v }))} buildPortfolio={pm.buildPortfolio} />
      {pm.built && !pm.building && (
        <div className="slide-down" style={{ marginTop: 20, background: "linear-gradient(135deg, rgba(45,212,191,0.07), rgba(129,140,248,0.05))", border: "1px solid rgba(13,148,136,0.28)", borderRadius: "var(--r-lg)", padding: "18px 22px", animation: "live-border 2.5s ease-in-out infinite" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)", display: "inline-block", flexShrink: 0 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--teal)" }}>Portfolio is live!</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <a href={shareUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12.5, color: "var(--teal)", wordBreak: "break-all", flex: 1, opacity: 0.85 }}>{shareUrl}</a>
            <a href={shareUrl} target="_blank" rel="noreferrer" style={{ background: "rgba(45,212,191,0.1)", border: "1px solid rgba(45,212,191,0.35)", borderRadius: "var(--r-md)", color: "var(--teal)", padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              <Icon name="external" size={12} color="var(--teal)" /> Open
            </a>
          </div>
        </div>
      )}
      <div style={{ marginTop: 36, borderTop: "1px solid var(--line)", paddingTop: 28 }}>
        <CustomizeTab portfolioId={pm.activePortfolioId} auth={auth} profile={pm.profile} onPrefsChange={p => pm.setProfile(prev => ({ ...prev, preferences: p }))} onProfileChange={pm.loadProfile} />
      </div>
    </div>
  );
}

// ─── RightPanel ───────────────────────────────────────────────────────────────
function RightPanel({ tab, setTab, pm, gapState, setGapState, clState, setClState, hasLinkedin, hasResume, hasGithub, hasLinks, setGithub, shareUrl, auth }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <SeekerTabBar tab={tab} setTab={setTab} />
      <div style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "28px 30px", minHeight: 480, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)" }}>
        <div style={{ display: tab === "build" ? "block" : "none" }}>
          <BuildTabPanel pm={pm} hasLinkedin={hasLinkedin} hasResume={hasResume} hasGithub={hasGithub} hasLinks={hasLinks} setGithub={setGithub} shareUrl={shareUrl} auth={auth} />
        </div>
        <div style={{ display: tab === "gap" ? "block" : "none" }}>
          <GapAnalysis userId={pm.activePortfolioId} built={pm.built} role={gapState.role} setRole={v => setGapState(s => ({ ...s, role: v }))} result={gapState.result} setResult={v => setGapState(s => ({ ...s, result: v }))} error={gapState.error} setError={v => setGapState(s => ({ ...s, error: v }))} />
        </div>
        <div style={{ display: tab === "cover" ? "block" : "none" }}>
          <CoverLetter userId={pm.activePortfolioId} built={pm.built} profile={pm.profile} jd={clState.jd} setJd={v => setClState(s => ({ ...s, jd: v }))} company={clState.company} setCompany={v => setClState(s => ({ ...s, company: v }))} role={clState.role} setRole={v => setClState(s => ({ ...s, role: v }))} result={clState.result} setResult={v => setClState(s => ({ ...s, result: v }))} />
        </div>
        {tab === "analytics" && <PortfolioAnalytics portfolioId={pm.activePortfolioId} token={auth.token} />}
        {tab === "interview" && <InterviewPrep userId={pm.activePortfolioId} jd={gapState.role} />}
      </div>
    </div>
  );
}

export default RightPanel;
