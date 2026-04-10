import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { SecHead } from "../ui/primitives";
import Icon from "../ui/Icon";

function CustomizeRow({ label, children }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 22, borderBottom: "1px solid var(--line)", marginBottom: 22, gap: 24, flexWrap: "wrap" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", minWidth: 140 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 220 }}>{children}</div>
    </div>
  );
}

function CustomizeToggle({ on, onClick, label }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
      <div style={{ width: 40, height: 22, borderRadius: 100, background: on ? "var(--accent)" : "var(--bg3)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
    </button>
  );
}

function CustomizeTab({ portfolioId, auth, profile, onPrefsChange, onProfileChange }) {
  const DEFAULT_PREFS = { accent: "#818cf8", dark_mode: true, template: "sidebar", hide_sections: [], featured_repos: [] };
  const [prefs, setPrefs] = useState(profile?.preferences || DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [title, setTitle] = useState(profile?.title || "");
  const [tagline, setTagline] = useState(profile?.tagline || "");
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || "");
  const [headlineSaving, setHeadlineSaving] = useState(false);
  const [headlineSaved, setHeadlineSaved] = useState(false);

  useEffect(() => {
    if (profile?.preferences) setPrefs({ ...DEFAULT_PREFS, ...profile.preferences });
  }, [profile]);

  const save = async (next) => {
    setSaving(true);
    try {
      await axios.patch(`${API}/profile/${portfolioId}/preferences`, next, { headers: { Authorization: `Bearer ${auth.token}` } });
      setSaved(true); onPrefsChange?.(next);
      setTimeout(() => setSaved(false), 2000);
    } catch {} finally { setSaving(false); }
  };

  const update = (key, val) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next); save(next);
  };

  const saveHeadline = async () => {
    setHeadlineSaving(true);
    try {
      await axios.patch(`${API}/profile/${portfolioId}/headline`, { title, tagline, linkedin_url: linkedinUrl }, { headers: { Authorization: `Bearer ${auth.token}` } });
      setHeadlineSaved(true); onProfileChange?.();
      setTimeout(() => setHeadlineSaved(false), 2000);
    } catch {} finally { setHeadlineSaving(false); }
  };

  const toggleSection = (sec) => {
    const cur = prefs.hide_sections || [];
    update("hide_sections", cur.includes(sec) ? cur.filter(s => s !== sec) : [...cur, sec]);
  };

  const toggleFeatured = (name) => {
    const cur = prefs.featured_repos || [];
    update("featured_repos", cur.includes(name) ? cur.filter(r => r !== name) : [...cur, name]);
  };

  const COLORS = [
    { label: "Indigo", value: "#818cf8" }, { label: "Rose", value: "#f472b6" },
    { label: "Teal", value: "#2dd4bf" },   { label: "Amber", value: "#fbbf24" },
    { label: "Green", value: "#4ade80" },  { label: "Blue", value: "#60a5fa" },
    { label: "Violet", value: "#a78bfa" }, { label: "Orange", value: "#fb923c" },
  ];

  const SECTIONS = [
    { id: "about", label: "About / Bio" },
    { id: "current_role", label: "Current Role card" },
    { id: "skills", label: "Skills" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "github", label: "GitHub Projects" },
    { id: "resume_projects", label: "Resume Projects" },
    { id: "links", label: "Publications & Credentials" },
  ];

  const githubRepos = profile?.github_repos || [];

  return (
    <div style={{ maxWidth: 680 }}>
      <SecHead>Customize Portfolio</SecHead>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 28 }}>
        Changes save automatically and appear live on your public portfolio.
        {saved && <span style={{ marginLeft: 12, color: "var(--teal)", fontWeight: 600 }}>Saved!</span>}
        {saving && <span style={{ marginLeft: 12, color: "var(--text3)" }}>Saving…</span>}
      </div>

      {/* Headline */}
      <CustomizeRow label="Headline">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.stopPropagation()} placeholder="e.g. AI Engineer · ML & LLM Systems"
            style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none", boxSizing: "border-box" }} />
          <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} onKeyDown={e => e.stopPropagation()} placeholder="Short tagline (optional) — e.g. Building AI-powered products"
            style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none", boxSizing: "border-box" }} />
          <input type="text" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} onKeyDown={e => e.stopPropagation()} placeholder="LinkedIn URL — https://linkedin.com/in/yourprofile"
            style={{ width: "100%", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "9px 12px", fontSize: 13, color: "var(--text)", outline: "none", boxSizing: "border-box" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="b-primary" onClick={saveHeadline} disabled={headlineSaving}
              style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: "var(--r-md)", padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              {headlineSaving ? "Saving…" : "Save"}
            </button>
            {headlineSaved && <span style={{ fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>Saved!</span>}
          </div>
        </div>
      </CustomizeRow>

      {/* Accent color */}
      <CustomizeRow label="Accent Color">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {COLORS.map(c => (
            <button key={c.value} onClick={() => update("accent", c.value)} title={c.label}
              style={{ width: 32, height: 32, borderRadius: "50%", background: c.value, border: prefs.accent === c.value ? "3px solid var(--text)" : "3px solid transparent", cursor: "pointer", transition: "transform 0.15s, border 0.15s", transform: prefs.accent === c.value ? "scale(1.2)" : "scale(1)" }} />
          ))}
        </div>
      </CustomizeRow>

      {/* Mode */}
      <CustomizeRow label="Appearance">
        <div style={{ display: "flex", gap: 10 }}>
          {[{ id: true, label: "Dark" }, { id: false, label: "Light" }].map(m => (
            <button key={String(m.id)} onClick={() => update("dark_mode", m.id)}
              style={{ padding: "8px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid", borderColor: prefs.dark_mode === m.id ? "var(--accent)" : "var(--line2)", background: prefs.dark_mode === m.id ? "var(--accent-d)" : "var(--bg2)", color: prefs.dark_mode === m.id ? "var(--accent)" : "var(--text3)", transition: "all 0.15s" }}>
              {m.label}
            </button>
          ))}
        </div>
      </CustomizeRow>

      {/* Template */}
      <CustomizeRow label="Layout">
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { id: "sidebar", label: "Sidebar", desc: "Profile sidebar + tabbed main area" },
            { id: "fullwidth", label: "Full Width", desc: "No sidebar — single wide column" },
          ].map(t => (
            <button key={t.id} onClick={() => update("template", t.id)}
              style={{ flex: 1, padding: "14px 16px", borderRadius: "var(--r-lg)", border: `2px solid ${prefs.template === t.id ? "var(--accent)" : "var(--line2)"}`, background: prefs.template === t.id ? "var(--accent-d)" : "var(--bg2)", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 10, height: 36 }}>
                {t.id === "sidebar"
                  ? <><div style={{ width: 10, height: "100%", borderRadius: 3, background: prefs.template === t.id ? "var(--accent-b)" : "var(--bg3)" }} /><div style={{ flex: 1, height: "100%", borderRadius: 3, background: prefs.template === t.id ? "var(--accent-d)" : "var(--bg3)" }} /></>
                  : <div style={{ flex: 1, height: "100%", borderRadius: 3, background: prefs.template === t.id ? "var(--accent-d)" : "var(--bg3)" }} />}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: prefs.template === t.id ? "var(--accent)" : "var(--text)", marginBottom: 3 }}>{t.label}</div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </CustomizeRow>

      {/* Sections */}
      <CustomizeRow label="Visible Sections">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          {SECTIONS.map(s => (
            <CustomizeToggle key={s.id} on={!(prefs.hide_sections || []).includes(s.id)} onClick={() => toggleSection(s.id)} label={s.label} />
          ))}
        </div>
      </CustomizeRow>

      {/* Featured repos */}
      {githubRepos.length > 0 && (
        <CustomizeRow label="Featured Projects">
          <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Pinned repos appear first in your portfolio.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {githubRepos.map(r => {
              const isFeatured = (prefs.featured_repos || []).includes(r.name);
              return (
                <button key={r.name} onClick={() => toggleFeatured(r.name)}
                  className="b-ghost"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: isFeatured ? "var(--accent-d)" : "var(--bg2)", border: `1px solid ${isFeatured ? "var(--accent)" : "var(--line2)"}`, borderRadius: "var(--r-md)", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                  <Icon name={isFeatured ? "star" : "github"} size={13} color={isFeatured ? "var(--accent)" : "var(--text3)"} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isFeatured ? "var(--accent)" : "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</div>
                    {r.language && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{r.language}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </CustomizeRow>
      )}

      {/* Tab Order */}
      <CustomizeRow label="Tab Order">
        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 10 }}>Drag or use arrows to reorder tabs on your public portfolio.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(() => {
            const ALL_TABS = [
              { id: "overview", label: "Overview" },
              { id: "projects", label: "Projects" },
              { id: "chat", label: "Ask AI" },
            ];
            const order = prefs.tab_order || ["overview", "projects", "chat"];
            const ordered = order.map(id => ALL_TABS.find(t => t.id === id)).filter(Boolean);
            const moveTab = (idx, dir) => {
              const newOrder = [...order];
              const swap = idx + dir;
              if (swap < 0 || swap >= newOrder.length) return;
              [newOrder[idx], newOrder[swap]] = [newOrder[swap], newOrder[idx]];
              update("tab_order", newOrder);
            };
            return ordered.map((t, idx) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", minWidth: 20 }}>{idx + 1}</span>
                <span style={{ fontSize: 13, color: "var(--text)", flex: 1 }}>{t.label}</span>
                <button onClick={() => moveTab(idx, -1)} disabled={idx === 0} style={{ background: "transparent", border: "none", cursor: idx === 0 ? "default" : "pointer", color: idx === 0 ? "var(--text3)" : "var(--text2)", padding: "2px 6px", fontSize: 14 }}>↑</button>
                <button onClick={() => moveTab(idx, 1)} disabled={idx === ordered.length - 1} style={{ background: "transparent", border: "none", cursor: idx === ordered.length - 1 ? "default" : "pointer", color: idx === ordered.length - 1 ? "var(--text3)" : "var(--text2)", padding: "2px 6px", fontSize: 14 }}>↓</button>
              </div>
            ));
          })()}
        </div>
      </CustomizeRow>
    </div>
  );
}

export default CustomizeTab;
