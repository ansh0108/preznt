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

function PortfolioPage({ userId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState(null);

  useEffect(() => {
    axios.get(`${API}/profile/${userId}`)
      .then(res => {
        const p = res.data;
        setProfile(p);
        const order = p?.preferences?.tab_order;
        if (order?.[0]) setTab(order[0]);
        axios.post(`${API}/analytics/${userId}/view`).catch(() => {});
      })
      .catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!profile) return;
    const prefs = profile.preferences || {};
    const accent = prefs.accent || "#818cf8";
    const darkMode = prefs.dark_mode !== false;
    const root = document.documentElement;
    if (!darkMode) {
      root.style.setProperty("--bg", "#f8f8fb");
      root.style.setProperty("--bg1", "#ffffff");
      root.style.setProperty("--bg2", "#f1f1f5");
      root.style.setProperty("--bg3", "#e8e8ef");
      root.style.setProperty("--line", "rgba(0,0,0,0.07)");
      root.style.setProperty("--line2", "rgba(0,0,0,0.12)");
      root.style.setProperty("--text", "#0d0d14");
      root.style.setProperty("--text2", "#3a3a50");
      root.style.setProperty("--text3", "#7a7a96");
    }
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-d", accent + "1a");
    root.style.setProperty("--accent-b", accent + "40");
    return () => {
      ["--bg","--bg1","--bg2","--bg3","--line","--line2","--text","--text2","--text3","--accent","--accent-d","--accent-b"]
        .forEach(v => root.style.removeProperty(v));
    };
  }, [profile]);

  const switchTab = (t) => {
    setTab(t);
    axios.post(`${API}/analytics/${userId}/tab`, { tab: t }).catch(() => {});
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size={24} /></div>;
  if (!profile) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ color: "var(--text3)", fontSize: 14 }}>Portfolio not found</div>
      {onBack && <Btn variant="ghost" onClick={onBack}>← Go Back</Btn>}
    </div>
  );

  const prefs = profile.preferences || {};
  const ALL_PORTFOLIO_TABS = [
    { id: "overview", label: "Overview", icon: "user" },
    { id: "projects", label: "Projects", icon: "code" },
    { id: "chat", label: "Ask AI", icon: "chat" },
  ];
  const tabOrder = prefs.tab_order || ["overview", "projects", "chat"];
  const TABS = tabOrder.map(id => ALL_PORTFOLIO_TABS.find(t => t.id === id)).filter(Boolean);

  const portfolioUrl = `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(profile.name)}-${userId}`;
  const accent = prefs.accent || "#818cf8";
  const template = prefs.template || "sidebar";
  const hideSections = prefs.hide_sections || [];
  const featuredRepos = prefs.featured_repos || [];

  const copyLink = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const tabBar = (
    <div style={{ display: "flex", gap: 2, marginBottom: 22, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "4px", width: "fit-content" }}>
      {TABS.map(t => (
        <button key={t.id} onClick={() => switchTab(t.id)} className="b-tab" data-active={tab === t.id} style={{
          background: tab === t.id ? "var(--bg3)" : "transparent",
          color: tab === t.id ? "var(--text)" : "var(--text3)",
          padding: "9px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
          display: "flex", alignItems: "center", gap: 7,
          border: tab === t.id ? "1px solid var(--line2)" : "1px solid transparent",
          boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.3)" : "none"
        }}>
          <Icon name={t.icon} size={14} color={tab === t.id ? "var(--accent)" : "var(--text3)"} />
          {t.label}
        </button>
      ))}
    </div>
  );

  const contentPanel = (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 30px", minHeight: 520 }}>
      <div style={{ display: tab === "overview" ? "block" : "none" }}><Overview profile={profile} hideSections={hideSections} /></div>
      <div style={{ display: tab === "projects" ? "block" : "none" }}><Projects profile={profile} hideSections={hideSections} featuredRepos={featuredRepos} /></div>
      <div style={{ display: tab === "chat" ? "block" : "none", height: 540, margin: "-28px -30px" }}>
        <Chatbot userId={userId} userName={profile.name} messages={chatMessages} setMessages={setChatMessages} />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ background: "var(--bg1)", borderBottom: "1px solid var(--line)", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(12px)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em" }}>
          prolio<span style={{ color: "var(--accent)", fontStyle: "italic" }}>.co</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="subtle" onClick={copyLink}>
            <Icon name={copied ? "check" : "copy"} size={13} color={copied ? "var(--teal)" : "var(--text2)"} />
            {copied ? "Copied!" : "Copy link"}
          </Btn>
          {onBack && <Btn variant="ghost" onClick={onBack} style={{ padding: "7px 14px", fontSize: 12.5 }}>← New Portfolio</Btn>}
        </div>
      </header>

      {template === "fullwidth" ? (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "24px 28px", display: "flex", gap: 20, alignItems: "center", marginBottom: 28, animation: "fadeUp 0.4s ease" }}>
            <ProfileAvatar profile={profile} size={72} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600 }}>{profile.name}</div>
              <div style={{ color: "var(--accent)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>{profile.title}</div>
              {!hideSections.includes("current_role") && profile.experience?.[0] && (
                <div style={{ fontSize: 12.5, color: "var(--text3)", marginTop: 6 }}>
                  {profile.experience[0].title} at {profile.experience[0].company} · {profile.experience[0].dates}
                </div>
              )}
            </div>
            {profile.github_username && (
              <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <button style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-md)", padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Icon name="github" size={13} color="currentColor" /> GitHub
                </button>
              </a>
            )}
          </div>
          {tabBar}
          {contentPanel}
        </div>
      ) : (
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 48px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, alignItems: "start" }}>
          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 73 }}>
            <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 22px 22px", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
              <ProfileAvatar profile={profile} size={100} />
              <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{profile.name}</div>
              <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 6, fontWeight: 600, letterSpacing: "0.01em" }}>{profile.title}</div>
              {profile.tagline && (
                <div style={{ color: "var(--text3)", fontSize: 12.5, marginTop: 8, lineHeight: 1.4, textAlign: "center" }}>{profile.tagline}</div>
              )}
              {(profile.github_username || profile.has_resume || profile.linkedin_url) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-md)", padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#0a66c2"; e.currentTarget.style.color = "#0a66c2"; e.currentTarget.style.background = "rgba(10,102,194,0.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.background = "var(--bg3)"; }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        LinkedIn Profile
                      </button>
                    </a>
                  )}
                  {profile.github_username && (
                    <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-md)", padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-d)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.background = "var(--bg3)"; }}>
                        <Icon name="github" size={15} color="currentColor" /> GitHub Profile
                      </button>
                    </a>
                  )}
                  {profile.has_resume && (
                    <a href={`${API}/resume/${profile.user_id}`} download style={{ textDecoration: "none" }}>
                      <button className="b-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", border: "none", color: "#fff", borderRadius: "var(--r-md)", padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        <Icon name="file" size={15} color="#fff" /> Download Resume
                      </button>
                    </a>
                  )}
                </div>
              )}
            </div>

            {!hideSections.includes("current_role") && profile.experience?.[0] && (() => {
              const isCurrentRole = /present|current/i.test(profile.experience[0].dates || "");
              return (
                <div style={{ background: "var(--accent-d)", border: "1px solid var(--accent-b)", borderRadius: "var(--r-lg)", padding: "16px 20px", animation: "fadeUp 0.44s ease" }}>
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

            {!hideSections.includes("skills") && profile.skills?.length > 0 && (
              <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "18px 20px", animation: "fadeUp 0.46s ease" }}>
                <SecHead style={{ marginBottom: 12 }}>Top Skills</SecHead>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {Object.entries(getSkillClusters(profile)).map(([cat, skills]) => (
                    <div key={cat}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{cat}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {skills.map((s, i) => <Pill key={i}>{s}</Pill>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.target_roles?.length > 0 && (
              <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "18px 20px", animation: "fadeUp 0.48s ease" }}>
                <SecHead style={{ marginBottom: 12 }}>Open to</SecHead>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {profile.target_roles.map((r, i) => <Pill key={i} color="var(--rose)">{r}</Pill>)}
                </div>
              </div>
            )}
          </div>

          {/* Main */}
          <div style={{ animation: "fadeUp 0.38s ease" }}>
            <TabBar />
            <ContentPanel />
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioPage;
