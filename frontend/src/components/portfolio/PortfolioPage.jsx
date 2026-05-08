import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { nameToSlug, getSkillClusters } from "../../lib/utils";
import { Spinner, Btn, SecHead, Pill } from "../ui/primitives";
import Icon from "../ui/Icon";
import OrgLogo from "../ui/OrgLogo";
import ProfileAvatar from "../ui/ProfileAvatar";
import Overview from "./Overview";
import Projects from "./Projects";
import Chatbot from "./Chatbot";

// ── Midnight Elite dark-luxury CSS variable references ──────────────────────
const glass = {
  background: "rgba(18,19,25,0.85)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid var(--line)",
  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.18)",
};
// ───────────────────────────────────────────────────────────────────────────

const CSS_VARS = ["--bg","--bg1","--bg2","--bg3","--line","--line2","--text","--text2","--text3","--accent","--accent-d","--accent-b"];

function applyThemeVars(profile) {
  const { accent = "#818cf8", dark_mode: darkMode = true } = profile.preferences || {};
  const root = document.documentElement;
  if (darkMode === false) {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
  }
  root.style.setProperty("--accent",   accent);
  root.style.setProperty("--accent-d", accent + "14");
  root.style.setProperty("--accent-b", accent + "33");
}

function TabBar({ tabs, activeTab, onSwitch }) {
  return (
    <div style={{
      display: "flex", gap: 2, marginBottom: 22,
      background: "var(--bg2)", border: "1px solid var(--line)",
      borderRadius: 8, padding: "4px", width: "fit-content",
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onSwitch(t.id)}
          className="b-tab"
          data-active={activeTab === t.id}
          style={{
            background: activeTab === t.id ? "var(--bg1)" : "transparent",
            color: activeTab === t.id ? "var(--accent)" : "var(--text3)",
            padding: "9px 18px", borderRadius: 6, fontSize: 13,
            fontWeight: activeTab === t.id ? 700 : 400,
            display: "flex", alignItems: "center", gap: 7,
            border: activeTab === t.id ? "1px solid var(--line)" : "1px solid transparent",
            boxShadow: activeTab === t.id ? "0 1px 4px rgba(0,0,0,0.18)" : "none",
            transition: "all 0.15s",
            fontFamily: "var(--sans)",
          }}
        >
          <Icon name={t.icon} size={14} color={activeTab === t.id ? "var(--accent)" : "var(--text3)"} />
          {t.label}
        </button>
      ))}
    </div>
  );
}

function ContentPanel({ tab, profile, hideSections, featuredRepos, userId, chatMessages, setChatMessages }) {
  return (
    <div style={{
      background: "var(--bg1)", border: "1px solid var(--line)",
      borderRadius: 16, padding: "28px 30px", minHeight: 520,
    }}>
      <div style={{ display: tab === "overview" ? "block" : "none" }}><Overview profile={profile} hideSections={hideSections} /></div>
      <div style={{ display: tab === "projects" ? "block" : "none" }}><Projects profile={profile} hideSections={hideSections} featuredRepos={featuredRepos} /></div>
      <div style={{ display: tab === "chat" ? "block" : "none", height: 540, margin: "-28px -30px" }}>
        <Chatbot userId={userId} userName={profile.name} messages={chatMessages} setMessages={setChatMessages} />
      </div>
    </div>
  );
}

function PortfolioSidebar({ profile, hideSections }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 73 }}>
      {/* Main profile card */}
      <div
        className="card-glow"
        style={{
          background: "var(--bg1)", border: "1px solid var(--line)",
          borderRadius: 16, padding: "28px 22px 22px",
          textAlign: "center", animation: "fadeUp 0.4s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ borderRadius: "50%", background: "var(--bg4)", display: "inline-flex" }}>
            <ProfileAvatar profile={profile} size={100} />
          </div>
        </div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2, color: "var(--text)" }}>{profile.name}</div>
        <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 6, fontWeight: 600, letterSpacing: "0.01em" }}>{profile.title}</div>
        {profile.tagline && (
          <div style={{ color: "var(--text3)", fontFamily: "var(--sans)", fontSize: 12.5, marginTop: 8, lineHeight: 1.4, textAlign: "center" }}>{profile.tagline}</div>
        )}
        {(profile.github_username || profile.has_resume || profile.linkedin_url) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <button
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--bg2)", border: "1px solid var(--line)", color: "var(--text2)", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--sans)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#0a66c2"; e.currentTarget.style.color = "#0a66c2"; e.currentTarget.style.background = "rgba(10,102,194,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.background = "var(--bg2)"; }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn Profile
                </button>
              </a>
            )}
            {profile.github_username && (
              <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <button
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--bg2)", border: "1px solid var(--line)", color: "var(--text2)", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--sans)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-d)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.background = "var(--bg2)"; }}
                >
                  <Icon name="github" size={15} color="currentColor" /> GitHub Profile
                </button>
              </a>
            )}
            {profile.has_resume && (
              <a href={`${API}/resume/${profile.user_id}`} download style={{ textDecoration: "none" }}>
                <button
                  className="b-primary"
                  style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", border: "none", color: "#fff", borderRadius: 100, padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(129,140,248,0.25)", fontFamily: "var(--sans)" }}
                >
                  <Icon name="file" size={15} color="#fff" /> Download Resume
                </button>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Current / Recent role card */}
      {!hideSections.includes("current_role") && profile.experience?.[0] && (() => {
        const isCurrentRole = /present|current/i.test(profile.experience[0].dates || "");
        return (
          <div style={{
            background: "var(--bg2)", border: "1px solid var(--line2)",
            borderRadius: 12, padding: "16px 20px", animation: "fadeUp 0.44s ease",
          }}>
            <SecHead style={{ marginBottom: 12, color: "var(--accent)" }}>{isCurrentRole ? "Currently" : "Recently"}</SecHead>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <OrgLogo name={profile.experience[0].company || profile.experience[0].title} size={34} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", lineHeight: 1.3 }}>{profile.experience[0].title}</div>
                <div style={{ fontSize: 12.5, color: "var(--accent)", marginTop: 3, fontWeight: 600 }}>{profile.experience[0].company}</div>
                <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 3 }}>{profile.experience[0].dates}</div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Links & Credentials card */}
      {!hideSections.includes("links") && profile.links?.length > 0 && (
        <div
          className="card-glow"
          style={{
            background: "var(--bg1)", border: "1px solid var(--line)",
            borderRadius: 12, padding: "18px 20px", animation: "fadeUp 0.45s ease",
          }}
        >
          <SecHead style={{ marginBottom: 12 }}>Links & Credentials</SecHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {profile.links.map((l, i) => {
              const colors = {
                product:     "var(--accent)",
                publication: "var(--rose)",
                certificate: "var(--teal)",
                award:       "var(--amber)",
                other:       "var(--text3)",
              };
              const color = colors[l.type] || "var(--text3)";
              return (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                      {l.type === "certificate" ? "cert" : l.type || "link"}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                    {l.issuer && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{l.issuer}</div>}
                  </div>
                  {l.url && (
                    <a href={l.url} target="_blank" rel="noreferrer" style={{ flexShrink: 0, textDecoration: "none", paddingTop: 14 }}>
                      <span style={{ fontSize: 11, color, background: `${color}14`, border: `1px solid ${color}33`, padding: "2px 8px", borderRadius: 100, fontWeight: 600, whiteSpace: "nowrap" }}>↗</span>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills card */}
      {!hideSections.includes("skills") && profile.skills?.length > 0 && (
        <div
          className="card-glow"
          style={{
            background: "var(--bg1)", border: "1px solid var(--line)",
            borderRadius: 12, padding: "18px 20px", animation: "fadeUp 0.46s ease",
          }}
        >
          <SecHead style={{ marginBottom: 12 }}>Top Skills</SecHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(getSkillClusters(profile)).map(([cat, skills]) => (
              <div key={cat}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontFamily: "var(--sans)" }}>{cat}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {skills.map((s, i) => <Pill key={i}>{s}</Pill>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open to / target roles */}
      {profile.target_roles?.length > 0 && (
        <div style={{
          background: "var(--bg1)", border: "1px solid var(--line)",
          borderRadius: 12, padding: "18px 20px", animation: "fadeUp 0.48s ease",
        }}>
          <SecHead style={{ marginBottom: 12 }}>Open to</SecHead>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {profile.target_roles.map((r, i) => <Pill key={i} color="var(--rose)">{r}</Pill>)}
          </div>
        </div>
      )}
    </div>
  );
}

function FullWidthHeader({ profile, hideSections }) {
  return (
    <div style={{
      background: "var(--bg1)", border: "1px solid var(--line)",
      borderRadius: 16, padding: "24px 28px",
      display: "flex", gap: 20, alignItems: "center",
      marginBottom: 28, animation: "fadeUp 0.4s ease",
    }}>
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

function PortfolioPage({ userId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState(null);

  useEffect(() => {
    axios.get(`${API}/profile/${userId}`)
      .then(res => {
        const p = res.data; setProfile(p);
        const order = p?.preferences?.tab_order;
        if (order?.[0]) setTab(order[0]);
        axios.post(`${API}/analytics/${userId}/view`).catch(() => {});
      })
      .catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!profile) return;
    applyThemeVars(profile);
    return () => {
      CSS_VARS.forEach(v => document.documentElement.style.removeProperty(v));
      document.body.classList.remove("light-mode");
    };
  }, [profile]);

  const switchTab = (t) => { setTab(t); axios.post(`${API}/analytics/${userId}/tab`, { tab: t }).catch(() => {}); };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <Spinner size={24} />
    </div>
  );
  if (!profile) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, background: "var(--bg)" }}>
      <div style={{ color: "var(--text3)", fontSize: 14, fontFamily: "var(--sans)" }}>Portfolio not found</div>
      {onBack && <Btn variant="ghost" onClick={onBack}>← Go Back</Btn>}
    </div>
  );

  const prefs = profile.preferences || {};
  const tabs = (prefs.tab_order || ["overview", "projects", "chat"]).map(id => ALL_PORTFOLIO_TABS.find(t => t.id === id)).filter(Boolean);
  const portfolioUrl = `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(profile.name)}-${userId}`;
  const template = prefs.template || "sidebar";
  const hideSections = prefs.hide_sections || [];
  const contentPanelProps = { tab, profile, hideSections, featuredRepos: prefs.featured_repos || [], userId, chatMessages, setChatMessages };

  const copyLink = () => { navigator.clipboard.writeText(portfolioUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Sticky glassmorphism nav — 72px */}
      <header style={{
        ...glass,
        height: 72,
        display: "flex", alignItems: "center",
        padding: "0 40px",
        position: "sticky", top: 0, zIndex: 50,
        justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1 }}>
          Prolio
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Btn variant="subtle" onClick={copyLink}>
            <Icon name={copied ? "check" : "copy"} size={13} color={copied ? "var(--teal)" : "var(--text2)"} />
            {copied ? "Copied!" : "Share"}
          </Btn>
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
