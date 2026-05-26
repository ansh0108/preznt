import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { nameToSlug } from "../../lib/utils";
import { Spinner, Btn } from "../ui/primitives";
import Icon from "../ui/Icon";
import ProfileAvatar from "../ui/ProfileAvatar";
import Overview from "./Overview";
import Projects from "./Projects";
import Chatbot from "./Chatbot";
import PortfolioSidebar from "./PortfolioSidebar";

// ── Midnight Elite dark-luxury CSS variable references ──────────────────────
const glass = {
  background: "rgba(18,19,25,0.85)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid var(--line)",
  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.18)",
};

const CSS_VARS = ["--bg","--bg1","--bg2","--bg3","--line","--line2","--text","--text2","--text3","--accent","--accent-d","--accent-b"];

function applyThemeVars(profile) {
  const { accent = "#818cf8", dark_mode: darkMode = true } = profile.preferences || {};
  const root = document.documentElement;
  if (darkMode === false) { document.body.classList.add("light-mode"); }
  else { document.body.classList.remove("light-mode"); }
  root.style.setProperty("--accent",   accent);
  root.style.setProperty("--accent-d", accent + "14");
  root.style.setProperty("--accent-b", accent + "33");
}

// ─── TabBar ───────────────────────────────────────────────────────────────────
function TabBar({ tabs, activeTab, onSwitch }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 22, background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: 8, padding: "4px", width: "fit-content" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onSwitch(t.id)} className="b-tab" data-active={activeTab === t.id}
          style={{ background: activeTab === t.id ? "var(--bg1)" : "transparent", color: activeTab === t.id ? "var(--accent)" : "var(--text3)", padding: "9px 18px", borderRadius: 6, fontSize: 13, fontWeight: activeTab === t.id ? 700 : 400, display: "flex", alignItems: "center", gap: 7, border: activeTab === t.id ? "1px solid var(--line)" : "1px solid transparent", boxShadow: activeTab === t.id ? "0 1px 4px rgba(0,0,0,0.18)" : "none", transition: "all 0.15s", fontFamily: "var(--sans)" }}
        >
          <Icon name={t.icon} size={14} color={activeTab === t.id ? "var(--accent)" : "var(--text3)"} />
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── ContentPanel ─────────────────────────────────────────────────────────────
function ContentPanel({ tab, profile, hideSections, featuredRepos, userId, chatMessages, setChatMessages }) {
  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: 16, padding: "28px 30px", minHeight: 520 }}>
      <div style={{ display: tab === "overview" ? "block" : "none" }}><Overview profile={profile} hideSections={hideSections} /></div>
      <div style={{ display: tab === "projects" ? "block" : "none" }}><Projects profile={profile} hideSections={hideSections} featuredRepos={featuredRepos} /></div>
      <div style={{ display: tab === "chat" ? "block" : "none", height: 540, margin: "-28px -30px" }}>
        <Chatbot userId={userId} userName={profile.name} messages={chatMessages} setMessages={setChatMessages} />
      </div>
    </div>
  );
}

// ─── FullWidthHeader ──────────────────────────────────────────────────────────
function FullWidthHeader({ profile, hideSections }) {
  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: 16, padding: "24px 28px", display: "flex", gap: 20, alignItems: "center", marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
      <ProfileAvatar profile={profile} size={72} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.01em" }}>{profile.name}</div>
        <div style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>{profile.title}</div>
        {!hideSections.includes("current_role") && profile.experience?.[0] && (
          <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 6, fontFamily: "var(--sans)" }}>
            {profile.experience[0].title} at {profile.experience[0].company} · {profile.experience[0].dates}
          </div>
        )}
      </div>
      {profile.github_username && (
        <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg2)", border: "1px solid var(--line)", color: "var(--text2)", borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--sans)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-d)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.background = "var(--bg2)"; }}
          >
            <Icon name="github" size={13} color="currentColor" /> GitHub
          </button>
        </a>
      )}
    </div>
  );
}

const ALL_PORTFOLIO_TABS = [
  { id: "overview", label: "Overview", icon: "user" },
  { id: "projects", label: "Projects", icon: "code" },
  { id: "chat", label: "Ask AI", icon: "chat" },
];

// ─── PortfolioPage ────────────────────────────────────────────────────────────
function PortfolioPage({ userId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState(null);

  useEffect(() => {
    axios.get(`${API}/profile/${userId}`)
      .then(res => { const p = res.data; setProfile(p); if (p?.preferences?.tab_order?.[0]) setTab(p.preferences.tab_order[0]); axios.post(`${API}/analytics/${userId}/view`).catch(() => {}); })
      .catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!profile) return;
    applyThemeVars(profile);
    return () => { CSS_VARS.forEach(v => document.documentElement.style.removeProperty(v)); document.body.classList.remove("light-mode"); };
  }, [profile]);

  const switchTab = (t) => { setTab(t); axios.post(`${API}/analytics/${userId}/tab`, { tab: t }).catch(() => {}); };
  const copyLink = () => { navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(profile.name)}-${userId}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}><Spinner size={24} /></div>;
  if (!profile) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "var(--bg)" }}>
      <div style={{ color: "var(--text3)", fontSize: 14, fontFamily: "var(--sans)" }}>Portfolio not found</div>
      {onBack && <Btn variant="ghost" onClick={onBack}>← Go Back</Btn>}
    </div>
  );

  const prefs = profile.preferences || {};
  const tabs = (prefs.tab_order || ["overview", "projects", "chat"]).map(id => ALL_PORTFOLIO_TABS.find(t => t.id === id)).filter(Boolean);
  const template = prefs.template || "sidebar";
  const hideSections = prefs.hide_sections || [];
  const contentPanelProps = { tab, profile, hideSections, featuredRepos: prefs.featured_repos || [], userId, chatMessages, setChatMessages };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ ...glass, height: 72, display: "flex", alignItems: "center", padding: "0 40px", position: "sticky", top: 0, zIndex: 50, justifyContent: "space-between" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1 }}>Prolio</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Btn variant="subtle" onClick={copyLink}><Icon name={copied ? "check" : "copy"} size={13} color={copied ? "var(--teal)" : "var(--text2)"} />{copied ? "Copied!" : "Share"}</Btn>
          {onBack && <Btn variant="ghost" onClick={onBack} style={{ padding: "7px 14px", fontSize: 12.5 }}>← Back</Btn>}
        </div>
      </header>
      {template === "fullwidth" ? (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
          <FullWidthHeader profile={profile} hideSections={hideSections} />
          <TabBar tabs={tabs} activeTab={tab} onSwitch={switchTab} />
          <ContentPanel {...contentPanelProps} />
        </div>
      ) : (
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 48px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, alignItems: "start" }}>
          <PortfolioSidebar profile={profile} hideSections={hideSections} />
          <div style={{ animation: "fadeUp 0.38s ease" }}>
            <TabBar tabs={tabs} activeTab={tab} onSwitch={switchTab} />
            <ContentPanel {...contentPanelProps} />
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;
