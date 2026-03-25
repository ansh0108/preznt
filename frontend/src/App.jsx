import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8004";

function getRouteFromHash() {
  const match = window.location.hash.match(/^#\/portfolio\/(.+)$/);
  if (match) {
    const slug = match[1];
    // user_id is always the last 8-char hex segment: "ansh-dasrapuria-62ce3b34"
    const idMatch = slug.match(/([0-9a-f]{8})$/);
    const userId = idMatch ? idMatch[1] : slug;
    return { page: "portfolio", userId };
  }
  return { page: "setup", userId: null };
}

function nameToSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── ICONS (clean SVGs, no emojis) ───────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor", style: s = {} }) => {
  const paths = {
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></>,
    graduation: <><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>,
    code: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
    chat: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
    fork: <><circle cx="6" cy="6" r="2" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M6 8v8M18 8a6 6 0 0 1-6 6H9" /></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    github: <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    wrench: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></>,
    target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
    arrow: <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    check: <><polyline points="20 6 9 17 4 12" /></>,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
    trending: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", flexShrink: 0, ...s }}>
      {paths[name]}
    </svg>
  );
};

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #08080a;
      --bg1:      #0e0e11;
      --bg2:      #141418;
      --bg3:      #1c1c22;
      --bg4:      #232329;
      --line:     rgba(255,255,255,0.065);
      --line2:    rgba(255,255,255,0.11);
      --text:     #ededef;
      --text2:    #b4b4bc;
      --text3:    #7c7c88;
      --accent:   #818cf8;
      --accent-d: rgba(129,140,248,0.12);
      --accent-b: rgba(129,140,248,0.25);
      --rose:     #f472b6;
      --rose-d:   rgba(244,114,182,0.12);
      --teal:     #2dd4bf;
      --teal-d:   rgba(45,212,191,0.1);
      --amber:    #fbbf24;
      --red:      #f87171;
      --green:    #4ade80;
      --serif:    'Playfair Display', Georgia, serif;
      --sans:     'Plus Jakarta Sans', system-ui, sans-serif;
      --r-sm:     8px;
      --r-md:     12px;
      --r-lg:     18px;
      --r-xl:     24px;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--sans);
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--bg4); border-radius: 2px; }

    input, textarea {
      font-family: var(--sans);
      background: var(--bg2);
      border: 1px solid var(--line2);
      border-radius: var(--r-md);
      color: var(--text);
      padding: 11px 14px;
      font-size: 13.5px;
      width: 100%;
      outline: none;
      transition: border-color 0.18s, background 0.18s;
    }
    input:focus, textarea:focus {
      border-color: var(--accent);
      background: var(--bg3);
    }
    input::placeholder, textarea::placeholder { color: var(--text3); }
    button { font-family: var(--sans); cursor: pointer; border: none; outline: none; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100% { opacity: 0.9; } 50% { opacity: 0.3; } }
    @keyframes shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
  `}</style>
);

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const Spinner = ({ size = 16, color = "var(--accent)" }) => (
  <div style={{ width: size, height: size, border: `1.5px solid ${color}30`, borderTop: `1.5px solid ${color}`, borderRadius: "50%", animation: "spin 0.75s linear infinite", display: "inline-block", flexShrink: 0 }} />
);

const Pill = ({ children, color = "var(--accent)", size = "sm" }) => {
  const pad = size === "sm" ? "3px 10px" : "5px 14px";
  const fs = size === "sm" ? 11.5 : 13;
  return (
    <span style={{ background: `${color}18`, border: `1px solid ${color}35`, color, padding: pad, borderRadius: 100, fontSize: fs, fontWeight: 600, display: "inline-block", letterSpacing: "0.01em", lineHeight: 1.5, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

const Divider = ({ my = 24 }) => <div style={{ height: 1, background: "var(--line)", margin: `${my}px 0` }} />;

const SecHead = ({ children, style: s = {} }) => (
  <div style={{ fontFamily: "var(--sans)", fontSize: 10.5, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18, ...s }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", disabled, style: s = {}, icon }) => {
  const styles = {
    primary: {
      background: "var(--accent)",
      color: "#fff",
      padding: "10px 22px",
      borderRadius: "var(--r-md)",
      fontWeight: 600,
      fontSize: 13.5,
      opacity: disabled ? 0.45 : 1,
      transition: "opacity 0.15s, transform 0.12s, background 0.15s",
      display: "inline-flex", alignItems: "center", gap: 7,
      borderRadius: "var(--r-md)",
    },
    ghost: {
      background: "transparent",
      border: "1px solid var(--line2)",
      color: "var(--text2)",
      padding: "9px 18px",
      borderRadius: "var(--r-md)",
      fontSize: 13,
      fontWeight: 500,
      transition: "border-color 0.15s, color 0.15s",
      display: "inline-flex", alignItems: "center", gap: 7,
    },
    subtle: {
      background: "var(--bg3)",
      border: "1px solid var(--line)",
      color: "var(--text2)",
      padding: "8px 16px",
      borderRadius: "var(--r-md)",
      fontSize: 12.5,
      fontWeight: 500,
      display: "inline-flex", alignItems: "center", gap: 6,
      transition: "background 0.15s, border-color 0.15s",
    }
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], ...s }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = "translateY(-1px)"; if (variant === "primary") e.currentTarget.style.background = "#6d78f0"; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; if (variant === "primary") e.currentTarget.style.background = "var(--accent)"; }}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
};

// ─── ORG LOGO — 3-tier fallback ───────────────────────────────────────────────
const ORG_OVERRIDES = {
  // University of Illinois
  "university of illinois system":              "uillinois.edu",
  "university of illinois urbana-champaign":    "illinois.edu",
  "university of illinois":                     "illinois.edu",
  "uiuc":                                       "illinois.edu",
  // Colleges
  "dwarkadas j. sanghvi college of engineering":"djsce.ac.in",
  "djsce":                                      "djsce.ac.in",
  "djsce e-cell":                               "djsce.ac.in",
  // Professional orgs
  "djsce acm student chapter":                  "acm.org",
  "acm":                                        "acm.org",
  // Companies
  "cdp india pvt. ltd.":                        "cdpindia.com",
  "cdp india":                                  "cdpindia.com",
  "yearbook canvas":                            "yearbookcanvas.com",
  "choice equity broking":                      "choiceindia.com",
  "choice":                                     "choiceindia.com",
  "polestar":                                   "polestar.com",
  "shree balaji shipping & projects pvt. ltd.": "shreebalajigroup.com",
  "sfc foundations":                            "sfcfoundations.org",
};


// Student groups / internal orgs with no logo — show initials directly
const INITIALS_ONLY = new Set([
  "business intelligence group (uiuc)",
  "business intelligence group",
]);

function guessDomain(name) {
  const lower = (name || "").toLowerCase().trim();
  if (ORG_OVERRIDES[lower]) return ORG_OVERRIDES[lower];
  const clean = lower
    .replace(/\b(inc|llc|ltd|pvt|corp|co\b|group|technologies|solutions|systems|services|the|of|at|and|&|student|chapter|college|university|institute)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
    .split(" ").filter(Boolean).slice(0, 2).join("") + ".com";
  return clean;
}

function OrgLogo({ name, size = 40 }) {
  const lower = (name || "").toLowerCase().trim();
  const isInitialsOnly = INITIALS_ONLY.has(lower);
  const [tier, setTier] = useState(isInitialsOnly ? 4 : 0);
  const domain = guessDomain(name);

  const PALETTE = ["#818cf8", "#f472b6", "#2dd4bf", "#fbbf24", "#a78bfa", "#34d399"];
  const color = PALETTE[(name?.charCodeAt(0) || 0) % PALETTE.length];

  const initials = (name || "")
    .split(/\s+/)
    .filter(w => !["of", "the", "and", "at", "&", "pvt", "ltd", "inc", "j.", "j", "dr."].includes(w.toLowerCase()))
    .slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

  if (tier >= 4) {
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.22, flexShrink: 0, background: `${color}20`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.35, fontWeight: 700, color, fontFamily: "var(--sans)", letterSpacing: "-0.02em" }}>{initials}</span>
      </div>
    );
  }

  const token = import.meta.env.VITE_LOGO_DEV_TOKEN;
  const src = tier === 0
    ? `https://img.logo.dev/${domain}?token=${token}&size=200&format=png`
    : tier === 1
    ? `https://logo.clearbit.com/${domain}?size=200`
    : tier === 2
    ? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`
    : `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return (
    <img
      src={src}
      alt={name}
      onError={() => setTier(t => t + 1)}
      style={{
        width: size, height: size,
        borderRadius: size * 0.22,
        objectFit: "contain",
        background: "#fff",
        padding: Math.round(size * 0.07),
        border: "1px solid var(--line2)",
        flexShrink: 0,
      }}
    />
  );
}

// ─── PROFILE AVATAR ───────────────────────────────────────────────────────────
function ProfileAvatar({ profile, size = 100 }) {
  const [failed, setFailed] = useState(false);
  const letter = profile.name?.charAt(0) || "?";

  if (profile.has_photo && !failed) {
    return (
      <img
        src={`${API}/photo/${profile.user_id}`}
        alt={profile.name}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "center 15%", display: "block", border: "2px solid var(--line2)", margin: "0 auto 18px" }}
      />
    );
  }

  return (
    <div style={{ width: size, height: size, borderRadius: "50%", margin: "0 auto 18px", background: "linear-gradient(135deg, var(--accent), var(--rose))", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "var(--serif)", fontSize: size * 0.4, color: "#fff", fontWeight: 500 }}>{letter}</span>
    </div>
  );
}

// ─── PHOTO UPLOAD FIELD ───────────────────────────────────────────────────────
function PhotoUploadField({ photo, setPhoto }) {
  const preview = photo ? URL.createObjectURL(photo) : null;
  return (
    <div>
      <label style={{ fontSize: 12.5, color: "var(--text3)", fontWeight: 500, display: "block", marginBottom: 10, letterSpacing: "0.02em" }}>Profile Photo</label>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div onClick={() => document.getElementById("photo-upload").click()}
          style={{ width: 68, height: 68, borderRadius: "50%", cursor: "pointer", flexShrink: 0, background: preview ? "transparent" : "var(--bg3)", border: `1.5px dashed ${preview ? "var(--accent)" : "var(--line2)"}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transition: "border-color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = preview ? "var(--accent)" : "var(--line2)"}>
          {preview
            ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Icon name="camera" size={20} color="var(--text3)" />}
        </div>
        <div>
          <div style={{ fontSize: 13, color: photo ? "var(--accent)" : "var(--text2)", fontWeight: 500 }}>{photo ? photo.name : "Click to upload"}</div>
          <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 3 }}>JPG, PNG or WebP · appears on your portfolio</div>
          {photo && <button onClick={() => setPhoto(null)} style={{ background: "none", color: "var(--text3)", fontSize: 11.5, marginTop: 5, textDecoration: "underline" }}>Remove</button>}
        </div>
        <input id="photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => setPhoto(e.target.files[0])} />
      </div>
    </div>
  );
}

// ─── GITHUB REPO PICKER ───────────────────────────────────────────────────────
const LANG_COLORS = {
  Python: "#3572A5", JavaScript: "#f7df1e", TypeScript: "#3178c6",
  "Jupyter Notebook": "#DA5B0B", HTML: "#e34c26", CSS: "#264de4",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", Shell: "#89e051",
};

function GithubRepoPicker({ onConfirm }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  const extractUsername = (input) => {
    const m = input.match(/github\.com\/([^/\s]+)\/?$/);
    if (m) return m[1];
    if (!input.includes("/") && !input.includes(".")) return input.trim();
    return null;
  };

  const fetchRepos = async () => {
    const uname = extractUsername(url.trim());
    if (!uname) { setError("Enter a GitHub profile URL like github.com/username"); return; }
    setLoading(true); setError(""); setRepos([]); setSelected(new Set());
    try {
      const res = await axios.get(`${API}/github/repos?username=${uname}`);
      setRepos(res.data.repos); setUsername(uname);
      setSelected(new Set(res.data.repos.map(r => r.url)));
    } catch (e) { setError(e.response?.data?.detail || "Could not fetch repos."); }
    finally { setLoading(false); }
  };

  const toggle = (u) => { const s = new Set(selected); s.has(u) ? s.delete(u) : s.add(u); setSelected(s); };

  return (
    <div>
      <label style={{ fontSize: 12.5, color: "var(--text3)", fontWeight: 500, display: "block", marginBottom: 10, letterSpacing: "0.02em" }}>GitHub Profile</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input placeholder="github.com/username" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchRepos()} />
        <button onClick={fetchRepos} disabled={loading || !url.trim()} style={{ background: "var(--accent)", color: "#fff", borderRadius: "var(--r-md)", padding: "0 18px", fontSize: 13, fontWeight: 600, flexShrink: 0, opacity: loading || !url.trim() ? 0.45 : 1, display: "flex", alignItems: "center", gap: 6 }}>
          {loading ? <Spinner size={14} color="#fff" /> : "Fetch"}
        </button>
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      {repos.length > 0 && (
        <div style={{ animation: "fadeUp 0.25s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, color: "var(--text3)" }}><span style={{ color: "var(--text)", fontWeight: 600 }}>{repos.length}</span> repos · <span style={{ color: "var(--accent)" }}>@{username}</span></span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text3)" }}>{selected.size} selected</span>
              <button onClick={() => selected.size === repos.length ? setSelected(new Set()) : setSelected(new Set(repos.map(r => r.url)))}
                style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-sm)", padding: "4px 10px", fontSize: 11.5 }}>
                {selected.size === repos.length ? "Deselect all" : "Select all"}
              </button>
            </div>
          </div>

          <div style={{ maxHeight: 270, overflowY: "auto", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", marginBottom: 12 }}>
            {repos.map((repo, i) => (
              <div key={repo.url} onClick={() => toggle(repo.url)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderBottom: i < repos.length - 1 ? "1px solid var(--line)" : "none",
                cursor: "pointer", background: selected.has(repo.url) ? "var(--accent-d)" : "transparent", transition: "background 0.12s"
              }}>
                <div style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${selected.has(repo.url) ? "var(--accent)" : "var(--line2)"}`, background: selected.has(repo.url) ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}>
                  {selected.has(repo.url) && <Icon name="check" size={10} color="#fff" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{repo.name}</span>
                    {repo.stars > 0 && <span style={{ fontSize: 11, color: "var(--text3)", display: "flex", alignItems: "center", gap: 3 }}><Icon name="star" size={10} color="var(--amber)" />{repo.stars}</span>}
                  </div>
                  {repo.description && <div style={{ fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{repo.description}</div>}
                </div>
                {repo.language && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text3)", flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: LANG_COLORS[repo.language] || "var(--accent)" }} />
                    {repo.language}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Btn onClick={() => onConfirm(repos.filter(r => selected.has(r.url)).map(r => r.url), username)} disabled={selected.size === 0} style={{ width: "100%" }}>
            Add {selected.size} repo{selected.size !== 1 ? "s" : ""} to portfolio
          </Btn>
        </div>
      )}
    </div>
  );
}

// ─── SETUP PAGE ───────────────────────────────────────────────────────────────
function SetupPage({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({ name: "", title: "", bio: "" });
  const [photo, setPhoto] = useState(null);
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [githubUsername, setGithubUsername] = useState("");
  const [linkedinFile, setLinkedinFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);
  const [indexing, setIndexing] = useState(false);
  const [indexed, setIndexed] = useState(false);

  const STEPS = ["Profile", "LinkedIn", "Documents", "Build"];

  const createProfile = async () => {
    if (!profile.name) return setError("Name is required");
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API}/setup/profile`, { name: profile.name, title: profile.title, bio: profile.bio, github_urls: selectedRepos, github_username: githubUsername });
      const uid = res.data.user_id;
      setUserId(uid);
      if (photo) { const f = new FormData(); f.append("file", photo); await axios.post(`${API}/upload/photo/${uid}`, f); }
      setStep(2);
    } catch { setError("Could not connect to the backend. Please try again."); }
    finally { setLoading(false); }
  };

  const uploadLinkedin = async () => {
    if (!linkedinFile) return setStep(3);
    setLoading(true);
    try { const f = new FormData(); f.append("file", linkedinFile); await axios.post(`${API}/upload/linkedin/${userId}`, f); setStep(3); }
    catch { setError("LinkedIn upload failed"); }
    finally { setLoading(false); }
  };

  const uploadExtras = async () => {
    setLoading(true);
    try {
      for (const file of extraFiles) { const f = new FormData(); f.append("file", file); await axios.post(`${API}/upload/document/${userId}`, f); }
      setStep(4);
    } catch { setError("Document upload failed"); }
    finally { setLoading(false); }
  };

  const buildIndex = async () => {
    setIndexing(true); setError(null);
    try { await axios.post(`${API}/index/${userId}`); setIndexed(true); }
    catch (e) { setError(e.response?.data?.detail || "Indexing failed"); }
    finally { setIndexing(false); }
  };

  const portfolioUrl = userId ? `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(profile.name)}-${userId}` : "";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", background: "var(--bg)" }}>
      {/* Brand */}
      <div style={{ marginBottom: 52, textAlign: "center", animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text)" }}>
          preznt<span style={{ color: "var(--accent)", fontStyle: "italic" }}>.ai</span>
        </div>
        <div style={{ color: "var(--text3)", fontSize: 13.5, marginTop: 8, fontWeight: 400, letterSpacing: "0.01em" }}>
          Your AI portfolio, built from everything you've created
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: i + 1 < step ? "var(--accent)" : i + 1 === step ? "transparent" : "transparent",
                border: i + 1 <= step ? "1.5px solid var(--accent)" : "1.5px solid var(--line2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s"
              }}>
                {i + 1 < step
                  ? <Icon name="check" size={12} color="#fff" />
                  : <span style={{ fontSize: 11, fontWeight: 600, color: i + 1 === step ? "var(--accent)" : "var(--text3)" }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize: 12.5, color: i + 1 === step ? "var(--text)" : "var(--text3)", fontWeight: i + 1 === step ? 600 : 400 }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: "var(--line2)", margin: "0 12px" }} />}
          </div>
        ))}
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 540, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "32px 36px", animation: "fadeUp 0.4s ease" }}>

        {step === 1 && (
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>Tell us about yourself</div>
            <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 28 }}>This is your first impression — make it count</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="Full name *" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
              <input placeholder="Professional title (optional) — e.g. Data Analyst, AI Engineer" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} />
              <textarea rows={3} placeholder="Short bio (optional)" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
              <PhotoUploadField photo={photo} setPhoto={setPhoto} />
              <Divider my={4} />
              <GithubRepoPicker onConfirm={(urls, uname) => { setSelectedRepos(urls); setGithubUsername(uname); }} />
              {selectedRepos.length > 0 && (
                <div style={{ background: "var(--accent-d)", border: "1px solid var(--accent-b)", borderRadius: "var(--r-md)", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>{selectedRepos.length} repos from @{githubUsername}</span>
                  <button onClick={() => { setSelectedRepos([]); setGithubUsername(""); }} style={{ background: "none", color: "var(--text3)", fontSize: 12 }}>Clear</button>
                </div>
              )}
            </div>
            {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 14 }}>{error}</div>}
            <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
              <Btn onClick={createProfile} disabled={loading} icon={loading ? null : null}>{loading ? <Spinner size={14} color="#fff" /> : "Continue"} {!loading && <Icon name="arrow" size={14} color="#fff" />}</Btn>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 6 }}>LinkedIn export</div>
            <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 14 }}>We use your LinkedIn PDF to extract experience, education, and skills.</div>
            <div style={{ background: "var(--bg3)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", marginBottom: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>How to download your LinkedIn PDF</div>
              {[
                ["Go to your LinkedIn profile", "Click your profile photo at the top → View Profile"],
                ['Click the "…" button', 'Below your name, click the three-dot "More" button'],
                ['Select "Save to PDF"', "It downloads your profile as a PDF instantly"],
              ].map(([title, desc], i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 10 : 0, alignItems: "flex-start" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{i + 1}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{title}</div>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div onClick={() => document.getElementById("li-upload").click()} style={{ border: `2px dashed ${linkedinFile ? "var(--accent)" : "var(--line2)"}`, borderRadius: "var(--r-lg)", padding: "28px 20px", textAlign: "center", cursor: "pointer", background: linkedinFile ? "var(--accent-d)" : "transparent", transition: "all 0.2s" }}>
              <Icon name="file" size={28} color={linkedinFile ? "var(--accent)" : "var(--text3)"} style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 13.5, color: linkedinFile ? "var(--accent)" : "var(--text3)", fontWeight: 500 }}>{linkedinFile ? linkedinFile.name : "Drop your LinkedIn PDF here or click to upload"}</div>
              <input id="li-upload" type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setLinkedinFile(e.target.files[0])} />
            </div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 10, textAlign: "center" }}>You can skip this step</div>
            {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 12 }}>{error}</div>}
            <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
              <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
              <Btn onClick={uploadLinkedin} disabled={loading}>{loading ? <Spinner size={14} color="#fff" /> : linkedinFile ? "Upload & Continue" : "Skip"} {!loading && <Icon name="arrow" size={14} color="#fff" />}</Btn>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Additional documents</div>
            <div style={{ background: "var(--teal-d)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: "var(--r-md)", padding: "11px 14px", marginBottom: 20, fontSize: 12.5, color: "var(--teal)", lineHeight: 1.6 }}>
              <strong>Upload your resume</strong> — we'll automatically extract all projects and skills not on LinkedIn or GitHub.
            </div>
            <div onClick={() => document.getElementById("ex-upload").click()} style={{ border: "2px dashed var(--line2)", borderRadius: "var(--r-lg)", padding: "24px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--line2)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line2)"}>
              <Icon name="file" size={24} color="var(--text3)" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: "var(--text3)" }}>PDF, DOCX, PPTX accepted</div>
              <input id="ex-upload" type="file" multiple accept=".pdf,.docx,.pptx,.txt" style={{ display: "none" }} onChange={e => setExtraFiles([...extraFiles, ...Array.from(e.target.files)])} />
            </div>
            {extraFiles.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                {extraFiles.map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg2)", border: "1px solid var(--line)", padding: "8px 12px", borderRadius: "var(--r-sm)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Icon name="file" size={14} color="var(--text3)" />
                      <span style={{ fontSize: 13, color: "var(--text2)" }}>{f.name}</span>
                    </div>
                    <button onClick={() => setExtraFiles(extraFiles.filter((_, j) => j !== i))} style={{ background: "none", color: "var(--text3)" }}><Icon name="x" size={14} /></button>
                  </div>
                ))}
              </div>
            )}
            {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 12 }}>{error}</div>}
            <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
              <Btn variant="ghost" onClick={() => setStep(2)}>← Back</Btn>
              <Btn onClick={uploadExtras} disabled={loading}>{loading ? <Spinner size={14} color="#fff" /> : "Continue"} {!loading && <Icon name="arrow" size={14} color="#fff" />}</Btn>
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Build your AI portfolio</div>
            <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 36, lineHeight: 1.6 }}>We'll index all your data, summarise your experience, and generate descriptions</div>
            {!indexed ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 24, lineHeight: 1 }}>🧠</div>
                <Btn onClick={buildIndex} disabled={indexing} style={{ margin: "0 auto" }}>
                  {indexing ? <><Spinner size={14} color="#fff" /> Building · ~45 seconds</> : <><Icon name="zap" size={14} color="#fff" /> Build Portfolio</>}
                </Btn>
                {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 16 }}>{error}</div>}
                {!indexing && (
                  <div style={{ marginTop: 20 }}>
                    <Btn variant="ghost" onClick={() => setStep(3)}>← Back</Btn>
                  </div>
                )}
              </>
            ) : (
              <div style={{ animation: "fadeUp 0.4s ease" }}>
                <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, marginBottom: 6 }}>Ready.</div>
                <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24 }}>Share this link with anyone — it's live right now</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
                  <div style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--accent-b)", borderRadius: "var(--r-md)", padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "var(--accent)", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{portfolioUrl}</div>
                  <button onClick={() => navigator.clipboard.writeText(portfolioUrl)} style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-md)", padding: "10px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    <Icon name="copy" size={13} /> Copy
                  </button>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <Btn onClick={() => window.open(portfolioUrl, "_blank")}><Icon name="link" size={14} color="#fff" /> Open in new tab</Btn>
                  <Btn variant="ghost" onClick={() => onComplete(userId)}>View here</Btn>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SKILL CLUSTERING ────────────────────────────────────────────────────────
// Clusters come from the backend (LLM-generated, field-appropriate).
// Falls back to a single "Skills" bucket if not yet available.
function getSkillClusters(profile) {
  const clusters = profile.skill_clusters;
  if (clusters && Object.keys(clusters).length > 0) return clusters;
  if (profile.skills?.length > 0) return { "Skills": profile.skills };
  return {};
}

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
function Overview({ profile }) {
  const hasContent = profile.experience?.length || profile.education?.length || profile.skills?.length;
  if (!hasContent) return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      <Icon name="file" size={36} color="var(--text3)" style={{ marginBottom: 16 }} />
      <div style={{ color: "var(--text3)", fontSize: 14 }}>Upload your LinkedIn PDF in setup to populate this section.</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {(profile.bio || profile.linkedin_summary) && (
        <div>
          <SecHead>About</SecHead>
          <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.85, fontWeight: 400 }}>{profile.bio || profile.linkedin_summary}</div>
        </div>
      )}

      {profile.experience?.length > 0 && (
        <div>
          <SecHead>Experience</SecHead>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {profile.experience.map((exp, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 28 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 42 }}>
                  <OrgLogo name={exp.company || exp.title} size={42} />
                  {i < profile.experience.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--line)", marginTop: 12 }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", lineHeight: 1.3 }}>{exp.title}</div>
                  <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 4, fontWeight: 600 }}>{exp.company}</div>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4, fontWeight: 400 }}>{exp.dates}</div>
                  {exp.description && (
                    <div style={{ color: "var(--text2)", fontSize: 13.5, marginTop: 12, lineHeight: 1.75, padding: "12px 16px", background: "var(--bg2)", borderRadius: "var(--r-md)", borderLeft: "2px solid var(--accent-b)" }}>
                      {exp.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.education?.length > 0 && (
        <div>
          <SecHead>Education</SecHead>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {profile.education.map((edu, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 42 }}>
                  <OrgLogo name={edu.school} size={42} />
                  {i < profile.education.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--line)", marginTop: 12 }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{edu.school}</div>
                  {edu.degree && <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>{edu.degree}</div>}
                  {edu.dates && <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4 }}>{edu.dates}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.skills?.length > 0 && (
        <div>
          <SecHead>Skills</SecHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(getSkillClusters(profile)).map(([cat, skills]) => (
              <div key={cat}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{cat}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {skills.map((s, i) => <Pill key={i} size="md">{s}</Pill>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROJECTS TAB (with sub-tabs) ────────────────────────────────────────────
function Projects({ profile }) {
  const githubRepos = profile.github_repos || [];
  const resumeProjects = profile.resume_projects || [];
  const [sub, setSub] = useState(githubRepos.length > 0 ? "github" : "resume");

  useEffect(() => {
    if (githubRepos.length > 0) setSub("github");
    else if (resumeProjects.length > 0) setSub("resume");
  }, [profile]);

  const hasAny = githubRepos.length > 0 || resumeProjects.length > 0;
  if (!hasAny) return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      <Icon name="code" size={36} color="var(--text3)" style={{ marginBottom: 16 }} />
      <div style={{ color: "var(--text3)", fontSize: 14 }}>No projects found. Add GitHub repos in setup or upload your resume in Documents.</div>
    </div>
  );

  const SubTab = ({ id, label, count }) => (
    <button onClick={() => setSub(id)} style={{
      background: sub === id ? "var(--bg3)" : "transparent",
      border: sub === id ? "1px solid var(--line2)" : "1px solid transparent",
      color: sub === id ? "var(--text)" : "var(--text3)",
      padding: "7px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: sub === id ? 600 : 400,
      transition: "all 0.15s", display: "flex", alignItems: "center", gap: 7
    }}>
      <Icon name={id === "github" ? "github" : "file"} size={14} color={sub === id ? "var(--text)" : "var(--text3)"} />
      {label}
      <span style={{ background: sub === id ? "var(--accent-d)" : "var(--bg3)", color: sub === id ? "var(--accent)" : "var(--text3)", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 100, border: sub === id ? "1px solid var(--accent-b)" : "1px solid var(--line)" }}>
        {count}
      </span>
    </button>
  );

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 4, width: "fit-content" }}>
        {githubRepos.length > 0 && <SubTab id="github" label="GitHub" count={githubRepos.length} />}
        {resumeProjects.length > 0 && <SubTab id="resume" label="From Resume" count={resumeProjects.length} />}
      </div>

      {/* GitHub repos */}
      {sub === "github" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.2s ease" }}>
          {githubRepos.map((repo, i) => (
            <a key={i} href={repo.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px", transition: "border-color 0.18s, transform 0.15s, background 0.15s", cursor: "pointer" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "var(--bg2)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "var(--bg1)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: repo.description ? 10 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="github" size={16} color="var(--text2)" />
                    <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{repo.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    {repo.stars > 0 && <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="star" size={12} color="var(--amber)" />{repo.stars}</span>}
                    {repo.forks > 0 && <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="fork" size={12} color="var(--text3)" />{repo.forks}</span>}
                    <span style={{ fontSize: 12, color: "var(--accent)", background: "var(--accent-d)", border: "1px solid var(--accent-b)", padding: "3px 10px", borderRadius: 100, fontWeight: 600 }}>↗ View</span>
                  </div>
                </div>
                {repo.description && <div style={{ color: "var(--text2)", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 }}>{repo.description}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {repo.language && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--text2)" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: LANG_COLORS[repo.language] || "var(--accent)" }} />
                      {repo.language}
                    </div>
                  )}
                  {repo.topics?.slice(0, 4).map((t, j) => <Pill key={j} color="var(--teal)" size="sm">{t}</Pill>)}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Resume projects */}
      {sub === "resume" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.2s ease" }}>
          {resumeProjects.map((proj, i) => (
            <div key={i} style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: proj.description ? 10 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon name="code" size={16} color="var(--text2)" />
                  <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{proj.name}</span>
                </div>
                {proj.type && <Pill color="var(--rose)" size="sm">{proj.type}</Pill>}
              </div>
              {proj.description && <div style={{ color: "var(--text2)", fontSize: 13.5, lineHeight: 1.7, marginBottom: proj.tech_stack?.length ? 14 : 0 }}>{proj.description}</div>}
              {proj.tech_stack?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {proj.tech_stack.map((t, j) => <Pill key={j} size="sm">{t}</Pill>)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CHATBOT ─────────────────────────────────────────────────────────────────
function Chatbot({ userId, userName }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hi — I'm ${userName}'s portfolio assistant. Ask me anything about their background, projects, or skills.` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const SUGGESTIONS = ["What's your background?", "What projects have you built?", "What are your strongest skills?", "Tell me about your most recent role", "What tools do you work with?", "What are you looking for next?"];

  const send = async (text) => {
    const q = text || input;
    if (!q.trim() || loading) return;
    setInput("");
    setMessages(p => [...p, { role: "user", content: q }]);
    setLoading(true);
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post(`${API}/chat`, { user_id: userId, question: q, history });
      setMessages(p => [...p, { role: "assistant", content: res.data.answer }]);
    } catch { setMessages(p => [...p, { role: "assistant", content: "• Sorry, I couldn't process that right now." }]); }
    finally { setLoading(false); }
  };

  const renderMsg = (content) => {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length <= 1) return <span style={{ lineHeight: 1.6 }}>{content}</span>;
    return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{lines.map((l, i) => <div key={i} style={{ lineHeight: 1.55 }}>{l}</div>)}</div>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.2s ease" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-d)", border: "1px solid var(--accent-b)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 10, marginTop: 2 }}>
                <Icon name="zap" size={13} color="var(--accent)" />
              </div>
            )}
            <div style={{
              maxWidth: "78%",
              background: msg.role === "user" ? "var(--accent)" : "var(--bg2)",
              color: msg.role === "user" ? "#fff" : "var(--text2)",
              padding: "11px 15px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              fontSize: 13.5, border: msg.role === "assistant" ? "1px solid var(--line2)" : "none"
            }}>{renderMsg(msg.content)}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-d)", border: "1px solid var(--accent-b)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="zap" size={13} color="var(--accent)" />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text3)", animation: "pulse 1.2s ease infinite", animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
      </div>

      {!loading && (
        <div style={{ padding: "10px 16px 8px", display: "flex", flexWrap: "wrap", gap: 6, borderTop: "1px solid var(--line)" }}>
          {SUGGESTIONS.filter(s => !messages.some(m => m.content === s)).slice(0, 4).map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{ background: "var(--bg2)", border: "1px solid var(--line2)", color: "var(--text3)", borderRadius: 100, padding: "5px 13px", fontSize: 12, fontWeight: 500, transition: "all 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.background = "var(--accent-d)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.background = "var(--bg2)"; }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything..." style={{ flex: 1, borderRadius: 100, padding: "10px 18px" }} />
        <button onClick={() => send()} disabled={loading || !input.trim()} style={{ background: "var(--accent)", color: "#fff", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", opacity: loading || !input.trim() ? 0.35 : 1, flexShrink: 0 }}>
          <Icon name="arrow" size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ─── GAP ANALYSIS ─────────────────────────────────────────────────────────────
function GapAnalysis({ userId }) {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!role.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try { const res = await axios.post(`${API}/gap-analysis`, { user_id: userId, target_role: role }); setResult(res.data); }
    catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  };

  const FIT_COLOR = { "Strong": "var(--green)", "Moderate": "var(--amber)", "Weak": "var(--red)" };

  const Section = ({ title, color, children }) => (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px" }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: color || "var(--text)", marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div>
      <SecHead>Role Gap Analysis</SecHead>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 18 }}>Get a personalised breakdown of how you compare against any role</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input value={role} onChange={e => setRole(e.target.value)} onKeyDown={e => e.key === "Enter" && analyze()} placeholder="e.g. Senior Data Analyst, ML Engineer, Product Manager" />
        <Btn onClick={analyze} disabled={loading || !role.trim()} style={{ flexShrink: 0 }}>
          {loading ? <Spinner size={14} color="#fff" /> : <><Icon name="target" size={14} color="#fff" /> Analyze</>}
        </Btn>
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {result && !result.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp 0.35s ease" }}>
          <Section title="Overall Fit">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Pill color={FIT_COLOR[result.overall_fit] || "var(--accent)"} size="md">{result.overall_fit}</Pill>
            </div>
            <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.75 }}>{result.summary}</div>
          </Section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Section title="Matching Skills" color="var(--teal)">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{result.matching_skills?.map((s, i) => <Pill key={i} color="var(--teal)">{s}</Pill>)}</div>
            </Section>
            <Section title="Strengths" color="var(--accent)">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{result.strengths?.map((s, i) => <div key={i} style={{ fontSize: 13, color: "var(--text2)", display: "flex", gap: 8 }}><Icon name="check" size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: 1 }} />{s}</div>)}</div>
            </Section>
          </div>

          {result.missing_skills?.length > 0 && (
            <Section title="Skills to Develop" color="var(--amber)">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.missing_skills.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "12px 14px", background: "var(--bg2)", borderRadius: "var(--r-md)" }}>
                    <div><div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{s.skill}</div><div style={{ color: "var(--text3)", fontSize: 12.5, marginTop: 3 }}>{s.reason}</div></div>
                    <Pill color={s.importance === "Must Have" ? "var(--red)" : "var(--amber)"}>{s.importance}</Pill>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {result.recommended_projects?.length > 0 && (
            <Section title="Recommended Projects" color="var(--rose)">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.recommended_projects.map((p, i) => (
                  <div key={i} style={{ padding: "12px 14px", background: "var(--bg2)", borderRadius: "var(--r-md)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{p.title}</div>
                      <Pill color="var(--rose)">{p.difficulty}</Pill>
                    </div>
                    <div style={{ color: "var(--text2)", fontSize: 13 }}>{p.description}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {result.quick_wins?.length > 0 && (
            <Section title="Quick Wins">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.quick_wins.map((w, i) => (
                  <div key={i} style={{ fontSize: 13.5, color: "var(--text2)", display: "flex", gap: 10 }}>
                    <Icon name="trending" size={14} color="var(--teal)" style={{ flexShrink: 0, marginTop: 2 }} /> {w}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PORTFOLIO PAGE ───────────────────────────────────────────────────────────
function PortfolioPage({ userId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get(`${API}/profile/${userId}`)
      .then(res => setProfile(res.data)).catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size={24} /></div>;
  if (!profile) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ color: "var(--text3)", fontSize: 14 }}>Portfolio not found</div>
      {onBack && <Btn variant="ghost" onClick={onBack}>← Go Back</Btn>}
    </div>
  );

  const TABS = [
    { id: "overview", label: "Overview", icon: "user" },
    { id: "projects", label: "Projects", icon: "code" },
    { id: "chat", label: "Ask AI", icon: "chat" },
    { id: "gap", label: "Gap Analysis", icon: "target" },
  ];

  const portfolioUrl = `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(profile.name)}-${userId}`;
  const totalProjects = (profile.github_repos?.length || 0) + (profile.resume_projects?.length || 0);

  const copyLink = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{ background: "var(--bg1)", borderBottom: "1px solid var(--line)", padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20, backdropFilter: "blur(12px)" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 500, letterSpacing: "-0.01em" }}>
          preznt<span style={{ color: "var(--accent)", fontStyle: "italic" }}>.ai</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="subtle" onClick={copyLink}>
            <Icon name={copied ? "check" : "copy"} size={13} color={copied ? "var(--teal)" : "var(--text2)"} />
            {copied ? "Copied!" : "Copy link"}
          </Btn>
          {onBack && <Btn variant="ghost" onClick={onBack} style={{ padding: "7px 14px", fontSize: 12.5 }}>← New Portfolio</Btn>}
        </div>
      </header>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 32px", display: "grid", gridTemplateColumns: "272px 1fr", gap: 28, alignItems: "start" }}>

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 73 }}>

          {/* Profile */}
          <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 22px 22px", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
            <ProfileAvatar profile={profile} size={100} />
            <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2 }}>{profile.name}</div>
            <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 6, fontWeight: 600, letterSpacing: "0.01em" }}>{profile.title}</div>
            {profile.tagline && (
              <div style={{ color: "var(--text3)", fontSize: 12.5, marginTop: 8, lineHeight: 1.4, textAlign: "center" }}>
                {profile.tagline}
              </div>
            )}
            {(profile.github_username || profile.has_resume) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
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
                    <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", border: "none", color: "#fff", borderRadius: "var(--r-md)", padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                      <Icon name="file" size={15} color="#fff" /> Download Resume
                    </button>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Top skills - clustered */}
          {profile.skills?.length > 0 && (
            <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "18px 20px", animation: "fadeUp 0.44s ease" }}>
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

          {/* Current / Recent role */}
          {profile.experience?.[0] && (() => {
            const isCurrentRole = /present|current/i.test(profile.experience[0].dates || "");
            return (
            <div style={{ background: "var(--accent-d)", border: "1px solid var(--accent-b)", borderRadius: "var(--r-lg)", padding: "16px 20px", animation: "fadeUp 0.46s ease" }}>
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

          {/* Open to */}
          {profile.target_roles?.length > 0 && (
            <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "18px 20px", animation: "fadeUp 0.48s ease" }}>
              <SecHead style={{ marginBottom: 12 }}>Open to</SecHead>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {profile.target_roles.map((r, i) => <Pill key={i} color="var(--rose)">{r}</Pill>)}
              </div>
            </div>
          )}
        </div>

        {/* ── MAIN ─────────────────────────────────────────────────────────── */}
        <div style={{ animation: "fadeUp 0.38s ease" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 2, marginBottom: 22, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "4px", width: "fit-content" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? "var(--bg3)" : "transparent",
                color: tab === t.id ? "var(--text)" : "var(--text3)",
                padding: "9px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
                transition: "all 0.15s", display: "flex", alignItems: "center", gap: 7,
                border: tab === t.id ? "1px solid var(--line2)" : "1px solid transparent",
                boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.3)" : "none"
              }}>
                <Icon name={t.icon} size={14} color={tab === t.id ? "var(--accent)" : "var(--text3)"} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Content panel */}
          <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 30px", minHeight: 520 }}>
            {tab === "overview" && <Overview profile={profile} />}
            {tab === "projects" && <Projects profile={profile} />}
            {tab === "chat" && <div style={{ height: 540, margin: "-28px -30px" }}><Chatbot userId={userId} userName={profile.name} /></div>}
            {tab === "gap" && <GapAnalysis userId={userId} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const initial = getRouteFromHash();
  const [page, setPage] = useState(initial.page);
  const [userId, setUserId] = useState(initial.userId);

  useEffect(() => {
    const h = () => { const r = getRouteFromHash(); setPage(r.page); setUserId(r.userId); };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  const goToPortfolio = (id) => { window.location.hash = `#/portfolio/${id}`; setUserId(id); setPage("portfolio"); };

  return (
    <>
      <GlobalStyle />
      {page === "setup" && <SetupPage onComplete={goToPortfolio} />}
      {page === "portfolio" && <PortfolioPage userId={userId} onBack={() => { window.location.hash = ""; setPage("setup"); setUserId(null); }} />}
    </>
  );
}
