import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

const API = import.meta.env.VITE_API_URL || "http://localhost:8004";

function getRouteFromHash() {
  const hash = window.location.hash;
  if (hash.startsWith("#/portfolio/")) {
    const slug = hash.replace("#/portfolio/", "");
    const idMatch = slug.match(/([0-9a-f]{8})$/);
    const userId = idMatch ? idMatch[1] : slug;
    return { page: "portfolio", userId };
  }
  if (hash === "#/login") return { page: "login", userId: null };
  if (hash === "#/signup") return { page: "signup", userId: null };
  if (hash === "#/dashboard") return { page: "dashboard", userId: null };
  return { page: "landing", userId: null };
}

function nameToSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
function loadAuth() {
  try { return JSON.parse(localStorage.getItem("prolio_auth")) || null; } catch { return null; }
}
function saveAuth(data) { localStorage.setItem("prolio_auth", JSON.stringify(data)); }
function clearAuth() { localStorage.removeItem("prolio_auth"); }

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
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    people: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
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

    .light-mode {
      --bg:    #f8f8fb;
      --bg1:   #ffffff;
      --bg2:   #f1f1f5;
      --bg3:   #e8e8ef;
      --bg4:   #dddde8;
      --line:  rgba(0,0,0,0.07);
      --line2: rgba(0,0,0,0.12);
      --text:  #0d0d14;
      --text2: #3a3a50;
      --text3: #7a7a96;
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
    @keyframes glow-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(129,140,248,0); }
      50%       { box-shadow: 0 0 0 4px rgba(129,140,248,0.18); }
    }
    @keyframes dot-ping {
      0%   { transform: scale(1); opacity: 1; }
      70%  { transform: scale(2.2); opacity: 0; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    /* ── hover utilities ── */
    .c-hover { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
    .c-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(0,0,0,0.28); border-color: var(--accent-b) !important; }

    .b-primary { transition: all 0.15s ease; }
    .b-primary:hover:not(:disabled) { filter: brightness(1.13); transform: translateY(-1px); box-shadow: 0 4px 18px rgba(129,140,248,0.38); }
    .b-primary:active:not(:disabled) { transform: translateY(0); filter: brightness(0.95); }

    .b-ghost { transition: all 0.15s ease; }
    .b-ghost:hover:not(:disabled) { border-color: var(--accent-b) !important; color: var(--text) !important; background: var(--bg3) !important; }
    .b-ghost:active:not(:disabled) { transform: scale(0.98); }

    .b-tab { transition: all 0.15s ease; }
    .b-tab:hover:not([data-active="true"]) { background: var(--bg3) !important; color: var(--text) !important; }

    .b-pill { transition: all 0.15s ease; }
    .b-pill:hover { border-color: var(--accent-b) !important; color: var(--text) !important; background: var(--bg3) !important; }

    .b-src { transition: all 0.18s ease; cursor: pointer; }
    .b-src:hover { border-color: var(--accent) !important; background: var(--accent-d) !important; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(129,140,248,0.2); }

    .b-danger { transition: all 0.15s ease; }
    .b-danger:hover:not(:disabled) { background: rgba(248,113,113,0.15) !important; border-color: var(--red) !important; color: var(--red) !important; }

    /* ── live/animated elements ── */
    .live-dot { animation: dot-ping 1.8s ease-in-out infinite; }
    .glow-ring { animation: glow-pulse 2.5s ease-in-out infinite; }
    .float { animation: float 3s ease-in-out infinite; }
    .tab-content { animation: fadeUp 0.22s ease both; }
    .slide-down { animation: slideDown 0.2s ease both; }
    .scale-in { animation: scaleIn 0.18s ease both; }

    /* ── source row ── */
    .src-row { transition: background 0.15s, border-color 0.15s; border-radius: var(--r-md); padding: 6px 8px; margin: 0 -8px; }
    .src-row:hover { background: var(--bg2); }

    /* ── card glow on hover ── */
    .card-glow { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
    .card-glow:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(129,140,248,0.14), 0 2px 8px rgba(0,0,0,0.2); border-color: var(--accent-b) !important; }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.94); }
      to   { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50%      { transform: translateY(-5px); }
    }
    @keyframes live-border {
      0%, 100% { border-color: rgba(45,212,191,0.4); }
      50%      { border-color: rgba(45,212,191,0.9); }
    }
    @keyframes gradient-x {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
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

// Extract recognisable tech keywords from free text to show as tags on project cards
const TECH_KEYWORDS = [
  "Python","JavaScript","TypeScript","React","FastAPI","Flask","Django","Node.js","Node",
  "Next.js","Vue","Angular","Vite","Express","Streamlit","Gradio",
  "SQL","PostgreSQL","MySQL","MongoDB","DuckDB","Snowflake","SQLite","Redis","BigQuery",
  "Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch","Keras","XGBoost","LightGBM",
  "FAISS","Sentence Transformers","HuggingFace","LangChain","OpenAI","Groq",
  "ARIMA","Prophet","LSTM","RAG","NLP","LLM",
  "AWS","Azure","GCP","Docker","Kubernetes","CI/CD","Terraform",
  "Tableau","Power BI","Excel","dbt","Airflow","Spark","Kafka",
  "MATLAB","Scala","Java","Rust","C++","C#","Bash",
  "Salesforce","SAP","Figma","Notion",
];

function extractTechTags(text = "", topics = [], language = "") {
  const found = new Set();
  for (const kw of TECH_KEYWORDS) {
    // Use word boundary so "R" doesn't match "GitHub", "Git" doesn't match "GitHub", etc.
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) found.add(kw);
  }
  // Topics are already discrete tags — include them directly
  for (const t of topics) {
    const label = t.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    if (label.length > 1) found.add(label);
  }
  // Primary language from GitHub is always accurate
  if (language) found.add(language);
  return [...found].slice(0, 6);
}

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
          prolio<span style={{ color: "var(--accent)", fontStyle: "italic" }}>.co</span>
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
                  <Btn variant="ghost" onClick={() => onComplete(userId, profile.name)}>View here</Btn>
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
function Overview({ profile, hideSections = [] }) {
  const hasContent = profile.experience?.length || profile.education?.length || profile.skills?.length;
  if (!hasContent) return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      <Icon name="file" size={36} color="var(--text3)" style={{ marginBottom: 16 }} />
      <div style={{ color: "var(--text3)", fontSize: 14 }}>Upload your LinkedIn PDF in setup to populate this section.</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {(profile.bio || profile.linkedin_summary) && !hideSections.includes("about") && (
        <div>
          <SecHead>About</SecHead>
          <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.85, fontWeight: 400 }}>{profile.bio || profile.linkedin_summary}</div>
        </div>
      )}

      {profile.experience?.length > 0 && !hideSections.includes("experience") && (
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
                    <div className="c-hover" style={{ color: "var(--text2)", fontSize: 13.5, marginTop: 12, lineHeight: 1.75, padding: "12px 16px", background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", borderLeft: "2px solid var(--accent-b)" }}>
                      {exp.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.education?.length > 0 && !hideSections.includes("education") && (
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

      {profile.skills?.length > 0 && !hideSections.includes("skills") && (
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

      {profile.links?.length > 0 && !hideSections.includes("links") && (() => {
        const TYPE_META = {
          publication: { label: "Publications", color: "var(--rose)", icon: "file" },
          certificate: { label: "Certifications", color: "var(--teal)", icon: "check" },
          award:       { label: "Awards", color: "var(--amber)", icon: "star" },
          other:       { label: "Other Links", color: "var(--accent)", icon: "link" },
        };
        const grouped = {};
        for (const l of profile.links) {
          const t = l.type || "other";
          if (!grouped[t]) grouped[t] = [];
          grouped[t].push(l);
        }
        return (
          <div>
            <SecHead>Publications & Credentials</SecHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {["publication", "certificate", "award", "other"].filter(t => grouped[t]).map(type => {
                const meta = TYPE_META[type];
                return (
                  <div key={type}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>{meta.label}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {grouped[type].map((l, i) => (
                        <div key={i} className="c-hover" style={{ display: "flex", gap: 14, padding: "14px 16px", background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", borderLeft: `2px solid ${meta.color}` }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{l.title}</div>
                            {l.issuer && <div style={{ fontSize: 12.5, color: meta.color, marginTop: 3 }}>{l.issuer}</div>}
                            {l.date && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{l.date}</div>}
                            {l.description && <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6, lineHeight: 1.6 }}>{l.description}</div>}
                          </div>
                          {l.url && (
                            <a href={l.url} target="_blank" rel="noreferrer" style={{ flexShrink: 0, alignSelf: "flex-start", paddingTop: 2, textDecoration: "none" }}>
                              <span style={{ fontSize: 11, color: meta.color, background: meta.color + "18", border: `1px solid ${meta.color}40`, padding: "3px 10px", borderRadius: 100, fontWeight: 600, whiteSpace: "nowrap" }}>↗ View</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── PROJECTS TAB (with sub-tabs) ────────────────────────────────────────────
function Projects({ profile, hideSections = [], featuredRepos = [] }) {
  const githubRepos = [...(profile.github_repos || [])].sort((a, b) => {
    const aF = featuredRepos.includes(a.name) ? 0 : 1;
    const bF = featuredRepos.includes(b.name) ? 0 : 1;
    return aF - bF;
  });
  const resumeProjects = profile.resume_projects || [];
  const showGithub = !hideSections.includes("github") && githubRepos.length > 0;
  const showResume = !hideSections.includes("resume_projects") && resumeProjects.length > 0;
  const [sub, setSub] = useState(showGithub ? "github" : "resume");

  useEffect(() => {
    if (showGithub) setSub("github");
    else if (showResume) setSub("resume");
  }, [profile]);

  const hasAny = showGithub || showResume;
  if (!hasAny) return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      <Icon name="code" size={36} color="var(--text3)" style={{ marginBottom: 16 }} />
      <div style={{ color: "var(--text3)", fontSize: 14 }}>No projects found. Add GitHub repos in setup or upload your resume in Documents.</div>
    </div>
  );

  const SubTab = ({ id, label, count }) => (
    <button onClick={() => setSub(id)} className="b-tab" data-active={sub === id} style={{
      background: sub === id ? "var(--bg3)" : "transparent",
      border: sub === id ? "1px solid var(--line2)" : "1px solid transparent",
      color: sub === id ? "var(--text)" : "var(--text3)",
      padding: "7px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: sub === id ? 600 : 400,
      display: "flex", alignItems: "center", gap: 7
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
        {showGithub && <SubTab id="github" label="GitHub" count={githubRepos.length} />}
        {showResume && <SubTab id="resume" label="From Resume" count={resumeProjects.length} />}
      </div>

      {/* GitHub repos */}
      {sub === "github" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.2s ease" }}>
          {githubRepos.map((repo, i) => (
            <a key={i} href={repo.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px", cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: repo.description ? 10 : 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon name="github" size={16} color="var(--text2)" />
                    <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{repo.name}</span>
                    {featuredRepos.includes(repo.name) && <Pill color="var(--accent)" size="sm">Featured</Pill>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    {repo.stars > 0 && <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="star" size={12} color="var(--amber)" />{repo.stars}</span>}
                    {repo.forks > 0 && <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="fork" size={12} color="var(--text3)" />{repo.forks}</span>}
                    <span style={{ fontSize: 12, color: "var(--accent)", background: "var(--accent-d)", border: "1px solid var(--accent-b)", padding: "3px 10px", borderRadius: 100, fontWeight: 600 }}>↗ View</span>
                  </div>
                </div>
                {repo.description && <div style={{ color: "var(--text2)", fontSize: 13.5, lineHeight: 1.7, marginBottom: 14 }}>{repo.description}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {extractTechTags(repo.description, repo.topics, repo.language).map((tag, j) => (
                    <Pill key={j} color="var(--teal)" size="sm">{tag}</Pill>
                  ))}
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
            <div key={i} className="c-hover" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px" }}>
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
function Chatbot({ userId, userName, messages: messagesProp, setMessages: setMessagesProp }) {
  const defaultMsg = [{ role: "assistant", content: `Hi — I'm ${userName}'s portfolio assistant. Ask me anything about their background, projects, or skills.` }];
  const [localMessages, setLocalMessages] = useState(defaultMsg);
  const messages = messagesProp ?? localMessages;
  const setMessages = setMessagesProp ? (v) => { setMessagesProp(typeof v === "function" ? v(messages) : v); } : setLocalMessages;

  // Initialise lifted state on first render
  useEffect(() => { if (setMessagesProp && messagesProp === null) setMessagesProp(defaultMsg); }, []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
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
    if (!q.trim() || loading || cooldown) return;
    setInput("");
    setMessages(p => [...p, { role: "user", content: q }]);
    setLoading(true);
    setCooldown(true);
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post(`${API}/chat`, { user_id: userId, question: q, history });
      setMessages(p => [...p, { role: "assistant", content: res.data.answer }]);
    } catch (err) {
      const msg = err?.response?.data?.detail || "I'm having trouble connecting right now — please try again in a moment.";
      setMessages(p => [...p, { role: "assistant", content: msg, isError: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => setCooldown(false), 2000);
    }
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
              background: msg.isError ? "rgba(248,113,113,0.08)" : msg.role === "user" ? "var(--accent)" : "var(--bg2)",
              color: msg.isError ? "var(--red)" : msg.role === "user" ? "#fff" : "var(--text2)",
              padding: "11px 15px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              fontSize: 13.5, border: msg.isError ? "1px solid rgba(248,113,113,0.25)" : msg.role === "assistant" ? "1px solid var(--line2)" : "none"
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
        <button onClick={() => send()} disabled={loading || cooldown || !input.trim()} style={{ background: "var(--accent)", color: "#fff", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", opacity: loading || cooldown || !input.trim() ? 0.35 : 1, flexShrink: 0 }}>
          <Icon name="arrow" size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

// ─── GAP ANALYSIS ─────────────────────────────────────────────────────────────
function GapAnalysis({ userId, role, setRole, result, setResult, error, setError }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const analyze = async () => {
    if (!role.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await axios.post(`${API}/gap-analysis`, { user_id: userId, job_description: role });
      setResult(res.data);
    }
    catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const FIT_COLOR = { "Strong": "var(--teal)", "Moderate": "var(--amber)", "Weak": "var(--red)" };
  const FIT_BG    = { "Strong": "rgba(45,212,191,0.08)", "Moderate": "rgba(251,191,36,0.08)", "Weak": "rgba(248,113,113,0.08)" };

  const Section = ({ title, color, icon, children }) => (
    <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {icon && <Icon name={icon} size={14} color={color || "var(--text3)"} />}
        <div style={{ fontWeight: 700, fontSize: 13, color: color || "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
      </div>
      {children}
    </div>
  );

  const score = result?.ats_score;
  const scoreColor = score >= 70 ? "var(--teal)" : score >= 45 ? "var(--amber)" : "var(--red)";

  return (
    <div>
      <SecHead>ATS Gap Analysis</SecHead>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 18 }}>Paste a full job description to get an ATS-optimised breakdown of your fit — match score, missing keywords, and bullet rewrites.</div>

      <textarea
        value={role}
        onChange={e => setRole(e.target.value)}
        placeholder="Paste the full job description here…"
        rows={7}
        style={{ width: "100%", marginBottom: 12, resize: "vertical", fontSize: 13 }}
      />
      <Btn onClick={analyze} disabled={loading || !role.trim()} style={{ marginBottom: 24 }}>
        {loading
          ? <><Spinner size={14} color="#fff" /> Analyzing…</>
          : <><Icon name="target" size={14} color="#fff" /> Run ATS Analysis</>}
      </Btn>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {result && !result.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.35s ease" }}>

          {/* Score + Summary */}
          <div style={{ background: FIT_BG[result.overall_fit] || "var(--bg1)", border: `1px solid ${FIT_COLOR[result.overall_fit] || "var(--line2)"}`, borderRadius: "var(--r-xl)", padding: "22px 24px", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 58, fontWeight: 800, color: scoreColor, lineHeight: 1, fontFamily: "var(--serif)", animation: "scaleIn 0.4s ease" }}>{score}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>ATS Score</div>
              {/* Score bar */}
              <div style={{ marginTop: 10, width: 80, height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden", margin: "10px auto 10px" }}>
                <div style={{ height: "100%", width: `${score}%`, background: scoreColor, borderRadius: 2, transition: "width 1s ease", animation: "none" }} />
              </div>
              <Pill color={FIT_COLOR[result.overall_fit]}>{result.overall_fit} Match</Pill>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Summary</div>
              <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.75 }}>{result.summary}</div>
            </div>
          </div>

          {/* Keywords row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Section title="Matching Keywords" color="var(--teal)" icon="check">
              {result.matching_keywords?.length > 0
                ? <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{result.matching_keywords.map((k, i) => <Pill key={i} color="var(--teal)">{k}</Pill>)}</div>
                : <div style={{ fontSize: 13, color: "var(--text3)" }}>No direct keyword matches found.</div>}
            </Section>
            <Section title="Missing Keywords" color="var(--amber)" icon="target">
              {result.missing_keywords?.length > 0
                ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.missing_keywords.map((k, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 12px", background: "var(--bg2)", borderRadius: "var(--r-md)" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{k.keyword}</div>
                          <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>{k.context}</div>
                        </div>
                        <Pill color={k.importance === "Must Have" ? "var(--red)" : "var(--amber)"}>{k.importance}</Pill>
                      </div>
                    ))}
                  </div>
                : <div style={{ fontSize: 13, color: "var(--text3)" }}>Great — no critical gaps found!</div>}
            </Section>
          </div>

          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <Section title="Strengths" color="var(--accent)" icon="star">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.strengths.map((s, i) => (
                  <div key={i} className="c-hover" style={{ display: "flex", gap: 12, padding: "12px 14px", background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
                    <Icon name="check" size={14} color="var(--teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 3 }}>{s.point}</div>
                      <div style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6 }}>{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Bullet improvements */}
          {result.bullet_improvements?.length > 0 && (
            <Section title="Resume Bullet Rewrites (XYZ Format)" color="var(--rose)" icon="wrench">
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>Click the improved version to copy it.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.bullet_improvements.map((b, i) => (
                  <div key={i} style={{ borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--line2)" }}>
                    <div style={{ padding: "10px 14px", background: "var(--bg2)", borderBottom: "1px solid var(--line)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>Section: {b.section}</div>
                      <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", lineHeight: 1.5 }}>Before: {b.original}</div>
                    </div>
                    <div
                      onClick={() => copyText(b.improved, i)}
                      style={{ padding: "12px 14px", background: copied === i ? "rgba(45,212,191,0.1)" : "rgba(129,140,248,0.06)", cursor: "pointer", transition: "background 0.15s" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, flex: 1 }}>{b.improved}</div>
                        <div style={{ flexShrink: 0 }}>
                          <Icon name={copied === i ? "check" : "copy"} size={13} color={copied === i ? "var(--teal)" : "var(--text3)"} />
                        </div>
                      </div>
                      {b.why && <div style={{ fontSize: 11.5, color: "var(--accent)", marginTop: 6 }}>{b.why}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Tone feedback + Differentiation */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {result.tone_feedback && (
              <Section title="Tone & Positioning" color="var(--text2)" icon="user">
                <div style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.75 }}>{result.tone_feedback}</div>
              </Section>
            )}
            {result.differentiation_tips?.length > 0 && (
              <Section title="Stand Out Tips" color="var(--rose)" icon="trending">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.differentiation_tips.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                      <Icon name="arrow" size={13} color="var(--rose)" style={{ flexShrink: 0, marginTop: 3 }} /> {t}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Quick wins */}
          {result.quick_wins?.length > 0 && (
            <Section title="Quick Wins — Do This Week" color="var(--teal)" icon="zap">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.quick_wins.map((w, i) => (
                  <div key={i} className="c-hover" style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                    <span style={{ color: "var(--teal)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span> {w}
                  </div>
                ))}
              </div>
            </Section>
          )}

        </div>
      )}

      {result?.error && (
        <div style={{ color: "var(--red)", fontSize: 13 }}>Analysis error: {result.error}</div>
      )}
    </div>
  );
}

// ─── PROFILE PHOTO ────────────────────────────────────────────────────────────
function ProfilePhoto({ userId, name, size = 60 }) {
  const [err, setErr] = useState(false);
  const PALETTE = ["#818cf8", "#f472b6", "#2dd4bf", "#fbbf24", "#a78bfa", "#34d399"];
  const color = PALETTE[(name?.charCodeAt(0) || 0) % PALETTE.length];
  const initials = (name || "").split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (err || !userId) {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}20`, border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color, margin: "0 auto" }}>
        {initials}
      </div>
    );
  }
  return (
    <img src={`${API}/photo/${userId}`} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "center 15%", border: "2px solid var(--line2)", display: "block", margin: "0 auto" }} />
  );
}

// ─── UPLOAD ROW ───────────────────────────────────────────────────────────────
function UploadRow({ label, icon, done, accept, onFile }) {
  const inputId = `upload-${label.replace(/\s/g, "-")}`;
  const [uploading, setUploading] = useState(false);
  const handle = async (file) => {
    setUploading(true);
    try { await onFile(file); } catch {} finally { setUploading(false); }
  };
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: done ? "rgba(45,212,191,0.1)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={done ? "check" : icon} size={14} color={done ? "var(--teal)" : "var(--text3)"} />
        </div>
        <span style={{ fontSize: 13, color: done ? "var(--text2)" : "var(--text3)", fontWeight: 500 }}>{label}</span>
      </div>
      <label htmlFor={inputId} style={{ cursor: "pointer" }}>
        <div className="b-ghost" style={{ background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: 6, color: done ? "var(--text3)" : "var(--accent)", padding: "3px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
          {uploading ? <Spinner size={10} color="var(--accent)" /> : done ? "Replace" : "Upload"}
        </div>
        <input id={inputId} type="file" accept={accept} style={{ display: "none" }} onChange={e => e.target.files[0] && handle(e.target.files[0])} />
      </label>
    </div>
  );
}

// ─── COVER LETTER ────────────────────────────────────────────────────────────
function extractCompanyFromJD(jd) {
  if (!jd?.trim()) return "";
  const text = jd.trim();
  // "About [Company]" section header
  const aboutM = text.match(/\bAbout\s+([A-Z][A-Za-z0-9\s&,.'"-]{2,40}?)(?:\n|:|\.)/m);
  if (aboutM) return aboutM[1].trim();
  // "[Company] is hiring / looking / seeking"
  const hiringM = text.match(/^([A-Z][A-Za-z0-9\s&.'-]{2,35}?)\s+is\s+(?:hiring|looking|seeking)/m);
  if (hiringM) return hiringM[1].trim();
  // "join / at [Company]"
  const joinM = text.match(/\b(?:join|at)\s+([A-Z][A-Za-z0-9\s&]{2,30}?)(?:\s+(?:and|as|to|team)|[,.\n])/);
  if (joinM) return joinM[1].trim();
  // "Company: [Name]" explicit label
  const labelM = text.match(/\bCompany[:\s]+([A-Z][A-Za-z0-9\s&,.'"-]{2,40}?)(?:\n|$)/m);
  if (labelM) return labelM[1].trim();
  // First line if short and starts with a capital
  const firstLine = text.split("\n")[0].trim();
  if (firstLine.length < 60 && /^[A-Z]/.test(firstLine))
    return firstLine.replace(/[^A-Za-z0-9\s&]/g, "").trim();
  return "";
}

function CoverLetter({ userId, profile, jd, setJd, company, setCompany, role, setRole, result, setResult }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [refinement, setRefinement] = useState("");
  const [refining, setRefining] = useState(false);
  const editorRef = useRef(null);

  // Build contact footer from profile
  const contactLine = [profile?.email, profile?.phone].filter(Boolean).join("  |  ");

  // When result arrives from API, push it into the contentEditable editor
  useEffect(() => {
    if (!editorRef.current || !result) return;
    const contactHeader = contactLine
      ? `<p style="margin:0 0 2px 0;font-size:12px;color:#888">${contactLine}</p><p style="margin:0 0 1.2em 0"> </p>`
      : "";
    const html = result
      .split(/\n\n+/)
      .map(block => `<p style="margin:0 0 1em 0">${block.replace(/\n/g, "<br>")}</p>`)
      .join("");
    editorRef.current.innerHTML = contactHeader + html;
  }, [result]);

  const getEditorText = () => editorRef.current?.innerText || result || "";
  const getEditorHTML = () => editorRef.current?.innerHTML || "";

  const fmt = (cmd) => { document.execCommand(cmd, false, null); editorRef.current?.focus(); };

  const generate = async () => {
    if (!jd.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await axios.post(`${API}/cover-letter`, {
        user_id: userId, job_description: jd, company_name: company, role_name: role
      });
      setResult(res.data.cover_letter);
    } catch { setError("Failed to generate. Please try again."); }
    finally { setLoading(false); }
  };

  const refine = async () => {
    if (!refinement.trim()) return;
    setRefining(true); setError(null);
    const current = getEditorText();
    try {
      const res = await axios.post(`${API}/cover-letter`, {
        user_id: userId, job_description: jd, company_name: company, role_name: role,
        existing_letter: current, refinement: refinement.trim()
      });
      setResult(res.data.cover_letter);
      setRefinement("");
    } catch { setError("Refinement failed. Please try again."); }
    finally { setRefining(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(getEditorText());
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const namePart = (profile?.name || "Cover").replace(/\s+/g, "_");
    const resolvedCompany = company.trim() || extractCompanyFromJD(jd);
    const companyPart = resolvedCompany ? `_${resolvedCompany.replace(/\s+/g, "_")}` : "";
    const filename = `${namePart}${companyPart}_cover_letter.pdf`;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 22;
    const maxW = pageW - margin * 2;
    let y = margin;

    doc.setFont("times", "normal");
    doc.setFontSize(11);

    const raw = getEditorText().trim();
    const paragraphs = raw.split(/\n\n+/).map(p => p.trim()).filter(Boolean);

    for (const para of paragraphs) {
      const lines = doc.splitTextToSize(para, maxW);
      const blockH = lines.length * 6.5;
      if (y + blockH > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.setTextColor(30);
      doc.text(lines, margin, y);
      y += blockH + 5;
    }

    doc.save(filename);
  };

  const FmtBtn = ({ cmd, label }) => (
    <button
      onMouseDown={e => { e.preventDefault(); fmt(cmd); }}
      style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-sm)", padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: cmd === "bold" ? 700 : 400, fontStyle: cmd === "italic" ? "italic" : "normal", textDecoration: cmd === "underline" ? "underline" : "none" }}
    >{label}</button>
  );

  return (
    <div>
      <SecHead>Cover Letter Generator</SecHead>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 18 }}>
        Paste a job description and get a tailored cover letter based on your full portfolio
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)" style={{ flex: 1 }} />
        <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role title (optional)" style={{ flex: 1 }} />
      </div>
      <textarea
        value={jd} onChange={e => setJd(e.target.value)}
        placeholder="Paste the job description here..."
        rows={7} style={{ width: "100%", marginBottom: 12, resize: "vertical" }}
      />
      <Btn onClick={generate} disabled={loading || !jd.trim()} style={{ marginBottom: 24 }}>
        {loading ? <><Spinner size={14} color="#fff" /> Generating…</> : <><Icon name="zap" size={14} color="#fff" /> Generate Cover Letter</>}
      </Btn>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {result && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginRight: 8 }}>Your Cover Letter</div>
              <FmtBtn cmd="bold" label="B" />
              <FmtBtn cmd="italic" label="I" />
              <FmtBtn cmd="underline" label="U" />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={copy} style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: copied ? "var(--teal)" : "var(--text2)", borderRadius: "var(--r-md)", padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <Icon name={copied ? "check" : "copy"} size={13} color={copied ? "var(--teal)" : "var(--text2)"} />
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={download} style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-md)", padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <Icon name="file" size={13} color="var(--text2)" /> Download PDF
              </button>
            </div>
          </div>
          {/* Editable letter body */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "24px 28px", fontSize: 14, lineHeight: 1.85, color: "var(--text2)", marginBottom: 8, outline: "none", minHeight: 260 }}
          />
          {/* Refinement input */}
          <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Want changes? Tell me what to adjust…</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={refinement}
                onChange={e => setRefinement(e.target.value)}
                onKeyDown={e => e.key === "Enter" && refine()}
                placeholder='e.g. "Make it more concise" or "Emphasise my SQL skills more"'
                style={{ flex: 1 }}
              />
              <Btn onClick={refine} disabled={refining || !refinement.trim()} style={{ flexShrink: 0 }}>
                {refining ? <Spinner size={14} color="#fff" /> : "Refine"}
              </Btn>
            </div>
          </div>
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
  const [chatMessages, setChatMessages] = useState(null);

  useEffect(() => {
    axios.get(`${API}/profile/${userId}`)
      .then(res => { setProfile(res.data); axios.post(`${API}/analytics/${userId}/view`).catch(() => {}); })
      .catch(() => setProfile(null)).finally(() => setLoading(false));
  }, [userId]);

  // Must be before any conditional returns — Rules of Hooks
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

  const TABS = [
    { id: "overview", label: "Overview", icon: "user" },
    { id: "projects", label: "Projects", icon: "code" },
    { id: "chat", label: "Ask AI", icon: "chat" },
  ];

  const portfolioUrl = `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(profile.name)}-${userId}`;
  const totalProjects = (profile.github_repos?.length || 0) + (profile.resume_projects?.length || 0);
  const prefs = profile.preferences || {};
  const accent = prefs.accent || "#818cf8";
  const darkMode = prefs.dark_mode !== false;
  const template = prefs.template || "sidebar";
  const hideSections = prefs.hide_sections || [];
  const featuredRepos = prefs.featured_repos || [];

  const copyLink = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
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
          {/* Compact hero */}
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
          {/* Tabs */}
          <div style={{ display: "flex", gap: 2, marginBottom: 22, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "4px", width: "fit-content" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => switchTab(t.id)} className="b-tab" data-active={tab === t.id} style={{ background: tab === t.id ? "var(--bg3)" : "transparent", color: tab === t.id ? "var(--text)" : "var(--text3)", padding: "9px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: tab === t.id ? 600 : 400, display: "flex", alignItems: "center", gap: 7, border: tab === t.id ? "1px solid var(--line2)" : "1px solid transparent" }}>
                <Icon name={t.icon} size={14} color={tab === t.id ? "var(--accent)" : "var(--text3)"} /> {t.label}
              </button>
            ))}
          </div>
          <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 30px", minHeight: 520 }}>
            <div style={{ display: tab === "overview" ? "block" : "none" }}><Overview profile={profile} hideSections={hideSections} /></div>
            <div style={{ display: tab === "projects" ? "block" : "none" }}><Projects profile={profile} hideSections={hideSections} featuredRepos={featuredRepos} /></div>
            <div style={{ display: tab === "chat" ? "block" : "none", height: 540, margin: "-28px -30px" }}>
              <Chatbot userId={userId} userName={profile.name} messages={chatMessages} setMessages={setChatMessages} />
            </div>
          </div>
        </div>
      ) : (
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "40px 48px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 36, alignItems: "start" }}>

        {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 73 }}>

          {/* Profile */}
          <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 22px 22px", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
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
                    <button className="b-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", border: "none", color: "#fff", borderRadius: "var(--r-md)", padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      <Icon name="file" size={15} color="#fff" /> Download Resume
                    </button>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Current / Recent role */}
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

          {/* Top skills - clustered */}
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
              <button key={t.id} onClick={() => switchTab(t.id)}
                className="b-tab" data-active={tab === t.id}
                style={{
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

          {/* Content panel — all tabs stay mounted to preserve state */}
          <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 30px", minHeight: 520 }}>
            <div style={{ display: tab === "overview" ? "block" : "none" }}><Overview profile={profile} hideSections={hideSections} /></div>
            <div style={{ display: tab === "projects" ? "block" : "none" }}><Projects profile={profile} hideSections={hideSections} featuredRepos={featuredRepos} /></div>
            <div style={{ display: tab === "chat" ? "block" : "none", height: 540, margin: "-28px -30px" }}>
              <Chatbot userId={userId} userName={profile.name} messages={chatMessages} setMessages={setChatMessages} />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onSeeker, onRecruiter, onLogin }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      {/* Logo / brand */}
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 12 }}>
          prolio<span style={{ color: "var(--accent)" }}>.</span>
        </div>
        <div style={{ fontSize: 17, color: "var(--text3)", maxWidth: 420, lineHeight: 1.6 }}>
          Your AI-powered portfolio — built from your resume, LinkedIn, and GitHub.
        </div>
      </div>

      {/* Two paths */}
      <div style={{ display: "flex", gap: 20, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
        {/* Job Seeker card */}
        <button onClick={onSeeker} style={{
          background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)",
          padding: "32px 36px", width: 260, textAlign: "left", cursor: "pointer", transition: "border-color 0.2s, transform 0.15s",
          display: "flex", flexDirection: "column", gap: 12,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--accent-d)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="user" size={20} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>I'm a Job Seeker</div>
            <div style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.55 }}>Build your AI portfolio, generate cover letters, and analyze skill gaps.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Get started <Icon name="arrow" size={14} color="var(--accent)" />
          </div>
        </button>

        {/* Recruiter card */}
        <button onClick={onRecruiter} style={{
          background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)",
          padding: "32px 36px", width: 260, textAlign: "left", cursor: "pointer", transition: "border-color 0.2s, transform 0.15s",
          display: "flex", flexDirection: "column", gap: 12,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--rose)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{ width: 44, height: 44, borderRadius: "var(--r-md)", background: "var(--rose-d)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="people" size={20} color="var(--rose)" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>I'm a Recruiter</div>
            <div style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.55 }}>Browse AI-powered portfolios and find the right candidates fast.</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--rose)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Browse talent <Icon name="arrow" size={14} color="var(--rose)" />
          </div>
        </button>
      </div>

      <button onClick={onLogin} style={{ background: "transparent", border: "none", color: "var(--text3)", fontSize: 13, cursor: "pointer" }}>
        Already have an account? <span style={{ color: "var(--accent)", textDecoration: "underline" }}>Sign in</span>
      </button>
    </div>
  );
}

// ─── AUTH PAGE (login / signup) ───────────────────────────────────────────────
function AuthPage({ mode, defaultType = "seeker", onSuccess, onSwitch, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [userType, setUserType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isLogin = mode === "login";

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) return setError("Please fill in all fields.");
    if (!isLogin && password !== confirm) return setError("Passwords do not match.");
    if (!isLogin && password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const body = isLogin ? { email, password } : { email, password, user_type: userType };
      const res = await axios.post(`${API}${endpoint}`, body);
      saveAuth(res.data);
      onSuccess(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Back button */}
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--text3)", fontSize: 13, cursor: "pointer", marginBottom: 32, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="arrow" size={13} color="var(--text3)" style={{ transform: "rotate(180deg)" }} /> Back
        </button>

        <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
          {isLogin ? "Welcome back" : "Create your account"}
        </div>
        <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 32 }}>
          {isLogin ? "Sign in to your prolio account." : "Join prolio and start building your AI portfolio."}
        </div>

        {/* User type selector — only for signup */}
        {!isLogin && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {[["seeker", "Job Seeker"], ["recruiter", "Recruiter"]].map(([val, label]) => (
              <button key={val} onClick={() => setUserType(val)} className="b-tab" data-active={userType === val} style={{
                flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: 600,
                background: userType === val ? "var(--accent)" : "var(--bg2)",
                color: userType === val ? "#fff" : "var(--text3)",
                border: userType === val ? "1px solid var(--accent)" : "1px solid var(--line2)",
                cursor: "pointer",
              }}>{label}</button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
              <Icon name="mail" size={15} color="var(--text3)" />
            </div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
              onKeyDown={e => e.key === "Enter" && submit()}
              style={{ paddingLeft: 38 }} />
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
              <Icon name="lock" size={15} color="var(--text3)" />
            </div>
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
              onKeyDown={e => e.key === "Enter" && submit()}
              style={{ paddingLeft: 38 }} />
          </div>
          {!isLogin && (
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
                <Icon name="lock" size={15} color="var(--text3)" />
              </div>
              <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" type="password"
                onKeyDown={e => e.key === "Enter" && submit()}
                style={{ paddingLeft: 38 }} />
            </div>
          )}
        </div>

        {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <Btn onClick={submit} disabled={loading} style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}>
          {loading ? <><Spinner size={14} color="#fff" /> {isLogin ? "Signing in…" : "Creating account…"}</> : isLogin ? "Sign in" : "Create account"}
        </Btn>

        <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={onSwitch} style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CANDIDATE EVALUATOR (for recruiter) ─────────────────────────────────────
function CandidateEvaluator({ candidate: c, onRemove }) {
  const [tab, setTab] = useState("portfolio");
  const [jd, setJd] = useState("");
  const [fitResult, setFitResult] = useState(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [fitError, setFitError] = useState(null);
  const slug = `${nameToSlug(c.name)}-${c.user_id}`;
  const portfolioUrl = `${window.location.origin}${window.location.pathname}#/portfolio/${slug}`;

  const runFit = async () => {
    if (!jd.trim()) return;
    setFitLoading(true); setFitError(null);
    try {
      const res = await axios.post(`${API}/gap-analysis`, { user_id: c.user_id, job_description: jd.trim() });
      setFitResult(res.data);
    } catch { setFitError("Analysis failed. Please try again."); }
    finally { setFitLoading(false); }
  };

  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", overflow: "hidden", animation: "fadeUp 0.3s ease" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{c.name}</div>
            {c.experience?.[0] && <div style={{ fontSize: 12, color: "var(--text3)" }}>{c.experience[0].title} at {c.experience[0].company}</div>}
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {c.skills?.slice(0, 4).map((s, i) => <Pill key={i} color="var(--accent)">{s}</Pill>)}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", gap: 2, background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "3px" }}>
            {[{ id: "portfolio", label: "View Portfolio" }, { id: "fit", label: "JD Fit" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? "var(--bg3)" : "transparent", color: tab === t.id ? "var(--text)" : "var(--text3)", padding: "5px 13px", borderRadius: 8, fontSize: 12, fontWeight: tab === t.id ? 600 : 400, border: "none", cursor: "pointer" }}>{t.label}</button>
            ))}
          </div>
          <button onClick={onRemove} style={{ background: "transparent", border: "1px solid var(--line2)", borderRadius: 8, color: "var(--text3)", padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>✕</button>
        </div>
      </div>
      {tab === "portfolio" && (
        <div style={{ padding: "18px 20px" }}>
          {c.is_temp ? (
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 12, fontStyle: "italic" }}>Evaluated from uploaded files — no prolio portfolio.</div>
          ) : (
            <a href={portfolioUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 12 }}>
              Open full portfolio <Icon name="external" size={13} color="var(--accent)" />
            </a>
          )}
          {c.tagline && <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", marginBottom: 12 }}>{c.tagline}</div>}
          {c.skills?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{c.skills.slice(0, 14).map((s, i) => <Pill key={i} color="var(--accent)">{s}</Pill>)}</div>}
          {c.experience?.[0] && <div style={{ marginTop: 12, fontSize: 13, color: "var(--text2)" }}>{c.experience[0].title} at <span style={{ color: "var(--accent)" }}>{c.experience[0].company}</span></div>}
        </div>
      )}
      {tab === "fit" && (
        <div style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 12 }}>Paste a job description to see how well {c.name} fits.</div>
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste job description or role requirements…" rows={5} style={{ width: "100%", marginBottom: 12, resize: "vertical" }} />
          <Btn onClick={runFit} disabled={fitLoading || !jd.trim()} style={{ marginBottom: 16 }}>
            {fitLoading ? <><Spinner size={14} color="#fff" /> Analyzing…</> : <><Icon name="target" size={14} color="#fff" /> Analyze Fit</>}
          </Btn>
          {fitError && <div style={{ color: "var(--red)", fontSize: 13 }}>{fitError}</div>}
          {fitResult && !fitResult.error && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: fitResult.overall_fit === "Strong" ? "var(--teal)" : fitResult.overall_fit === "Moderate" ? "var(--amber)" : "var(--red)", marginBottom: 10 }}>
                {fitResult.overall_fit} Fit
              </div>
              <div style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.7, marginBottom: 16 }}>{fitResult.summary}</div>
              {fitResult.matching_skills?.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Matching Skills</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{fitResult.matching_skills.map((s, i) => <Pill key={i} color="var(--teal)">{s}</Pill>)}</div>
                </div>
              )}
              {fitResult.missing_skills?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Gaps</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                    {fitResult.missing_skills.slice(0, 6).map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Pill color={s.importance === "Must Have" ? "var(--red)" : "var(--amber)"}>{s.importance}</Pill>
                        <span style={{ fontSize: 13, color: "var(--text2)" }}>{s.skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RECRUITER DASHBOARD ──────────────────────────────────────────────────────
function RecruiterDashboard({ auth, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [addMode, setAddMode] = useState("url"); // "url" | "upload"
  // URL mode
  const [candidateUrl, setCandidateUrl] = useState("");
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [candidateError, setCandidateError] = useState("");
  // Upload mode
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

          {/* Mode toggle */}
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

// ─── PROFILE CARD (talent pool) ───────────────────────────────────────────────
function ProfileCard({ profile: p }) {
  const slug = `${nameToSlug(p.name)}-${p.user_id}`;
  const url = `${window.location.origin}${window.location.pathname}#/portfolio/${slug}`;
  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "22px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line2)"}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{p.name}</div>
        {p.current_role && <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{p.current_role}</div>}
        {p.tagline && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3, fontStyle: "italic" }}>{p.tagline}</div>}
      </div>
      {p.skills?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{p.skills.slice(0, 6).map((s, i) => <Pill key={i} color="var(--accent)">{s}</Pill>)}</div>}
      <a href={url} target="_blank" rel="noreferrer" style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
        View portfolio <Icon name="external" size={13} color="var(--accent)" />
      </a>
    </div>
  );
}

// ─── MINIMAL PROFILE SETUP ───────────────────────────────────────────────────
function MinimalProfileSetup({ auth, setAuth, onLogout }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reconnectUrl, setReconnectUrl] = useState("");
  const [reconnectError, setReconnectError] = useState("");
  const [showReconnect, setShowReconnect] = useState(false);

  const handlePhoto = (file) => { setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); };

  const submit = async () => {
    if (!name.trim()) return setError("Name is required");
    setLoading(true); setError(null);
    try {
      const res = await axios.post(`${API}/setup/profile`, { name: name.trim(), title: title.trim(), bio: bio.trim(), github_urls: [], github_username: "", target_roles: [] });
      const uid = res.data.user_id;
      if (photo) { const f = new FormData(); f.append("file", photo); await axios.post(`${API}/upload/photo/${uid}`, f); }
      await axios.post(`${API}/auth/link-portfolio`, { portfolio_id: uid }, { headers: { Authorization: `Bearer ${auth.token}` } });
      const updated = { ...auth, portfolio_id: uid, profile_name: name.trim() };
      saveAuth(updated); setAuth(updated);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };

  const handleReconnect = async () => {
    setReconnectError("");
    const idMatch = reconnectUrl.match(/([0-9a-f]{8})(?:[^0-9a-f]|$)/);
    const id = idMatch ? idMatch[1] : reconnectUrl.trim();
    if (!id || id.length !== 8) return setReconnectError("Paste your full portfolio URL.");
    try {
      const r = await axios.get(`${API}/profile/${id}`);
      await axios.post(`${API}/auth/link-portfolio`, { portfolio_id: id }, { headers: { Authorization: `Bearer ${auth.token}` } });
      const updated = { ...auth, portfolio_id: id, profile_name: r.data.name };
      saveAuth(updated); setAuth(updated);
    } catch { setReconnectError("Could not find that portfolio."); }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--line)", padding: "0 40px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg)", zIndex: 10 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>prolio<span style={{ color: "var(--accent)" }}>.</span></div>
        <button onClick={onLogout} style={{ background: "transparent", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text3)", padding: "6px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="logout" size={13} color="var(--text3)" /> Sign out
        </button>
      </div>
      <div style={{ maxWidth: 480, margin: "60px auto", padding: "0 24px" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Set up your profile</div>
        <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 32, lineHeight: 1.6 }}>You can add your resume, LinkedIn and GitHub repos from your dashboard after this.</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <label htmlFor="mps-photo" style={{ cursor: "pointer" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--bg3)", border: "2px dashed var(--line2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {photoPreview ? <img src={photoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="camera" size={22} color="var(--text3)" />}
            </div>
            <input id="mps-photo" type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handlePhoto(e.target.files[0])} />
          </label>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name *" onKeyDown={e => e.key === "Enter" && submit()} />
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Professional title (optional)" />
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Short bio (optional)" rows={3} style={{ resize: "vertical" }} />
        </div>
        {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <Btn onClick={submit} disabled={loading || !name.trim()} style={{ width: "100%", justifyContent: "center", marginBottom: 24 }}>
          {loading ? <><Spinner size={14} color="#fff" /> Creating profile…</> : "Continue to Dashboard"}
        </Btn>
        <div style={{ textAlign: "center" }}>
          <button onClick={() => setShowReconnect(v => !v)} style={{ background: "transparent", border: "none", color: "var(--text3)", fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>
            Already have a portfolio? Reconnect it
          </button>
        </div>
        {showReconnect && (
          <div style={{ marginTop: 16, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "16px" }}>
            <div style={{ fontSize: 12.5, color: "var(--text3)", marginBottom: 10 }}>Paste your portfolio URL to link it to this account.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={reconnectUrl} onChange={e => setReconnectUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && handleReconnect()} placeholder="e.g. prolio.co/#/portfolio/..." style={{ flex: 1, fontSize: 12 }} />
              <Btn onClick={handleReconnect} disabled={!reconnectUrl.trim()} style={{ flexShrink: 0, padding: "10px 14px" }}>Reconnect</Btn>
            </div>
            {reconnectError && <div style={{ color: "var(--red)", fontSize: 12, marginTop: 8 }}>{reconnectError}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PORTFOLIO ANALYTICS ─────────────────────────────────────────────────────
function PortfolioAnalytics({ portfolioId, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API}/analytics/${portfolioId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => setError("Could not load analytics."))
      .finally(() => setLoading(false));
  }, [portfolioId]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>;
  if (error) return <div style={{ color: "var(--red)", fontSize: 13, padding: 20 }}>{error}</div>;

  const maxViews = data.views_by_day.length > 0 ? Math.max(...data.views_by_day.map(d => d.count), 1) : 1;

  const fmtDate = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const fmtTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const tabLabels = { overview: "Overview", projects: "Projects", chat: "Ask AI" };

  return (
    <div style={{ animation: "fadeUp 0.25s ease" }}>
      <SecHead>Portfolio Analytics</SecHead>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Total Views", value: data.total_views, color: "var(--accent)" },
          { label: "AI Questions Asked", value: data.recent_questions.length, color: "var(--teal)" },
          { label: "Tab Interactions", value: Object.values(data.tab_clicks).reduce((a, b) => a + b, 0), color: "var(--rose)" },
        ].map(s => (
          <div key={s.label} className="card-glow" style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.5, borderRadius: "var(--r-lg) var(--r-lg) 0 0" }} />
            <div style={{ fontSize: 34, fontWeight: 800, color: s.color, marginBottom: 4, fontFamily: "var(--serif)", animation: "scaleIn 0.4s ease" }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Views over time */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Views — last 14 days</div>
        {data.views_by_day.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text3)" }}>No views recorded yet. Share your portfolio to get started.</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {data.views_by_day.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600 }}>{d.count}</div>
                <div title={`${d.count} views on ${fmtDate(d.date)}`}
                  style={{ width: "100%", background: "var(--accent)", borderRadius: "4px 4px 0 0", height: `${Math.max(4, (d.count / maxViews) * 52)}px`, transition: "height 0.3s ease, opacity 0.15s, transform 0.15s", cursor: "default", opacity: 0.75 }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scaleX(1.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.75"; e.currentTarget.style.transform = "scaleX(1)"; }} />
                <div style={{ fontSize: 9, color: "var(--text3)", whiteSpace: "nowrap" }}>{fmtDate(d.date).split(" ")[1]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tab breakdown */}
      {Object.keys(data.tab_clicks).length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Tab Breakdown</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(data.tab_clicks).map(([tab, count]) => (
              <div key={tab} style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>{tabLabels[tab] || tab}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent AI questions */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Recent AI Questions</div>
        {data.recent_questions.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text3)" }}>No questions asked yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.recent_questions.slice(0, 15).map((q, i) => (
              <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>{q.question}</span>
                <span style={{ fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>{fmtTime(q.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CUSTOMIZE TAB ────────────────────────────────────────────────────────────
function CustomizeTab({ portfolioId, auth, profile, onPrefsChange }) {
  const DEFAULT_PREFS = { accent: "#818cf8", dark_mode: true, template: "sidebar", hide_sections: [], featured_repos: [] };
  const [prefs, setPrefs] = useState(profile?.preferences || DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const Row = ({ label, children }) => (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", paddingBottom: 22, borderBottom: "1px solid var(--line)", marginBottom: 22, gap: 24, flexWrap: "wrap" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", minWidth: 140 }}>{label}</div>
      <div style={{ flex: 1, minWidth: 220 }}>{children}</div>
    </div>
  );

  const Toggle = ({ on, onClick, label }) => (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}>
      <div style={{ width: 40, height: 22, borderRadius: 100, background: on ? "var(--accent)" : "var(--bg3)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
      </div>
      <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
    </button>
  );

  const githubRepos = profile?.github_repos || [];

  return (
    <div style={{ maxWidth: 680 }}>
      <SecHead>Customize Portfolio</SecHead>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 28 }}>
        Changes save automatically and appear live on your public portfolio.
        {saved && <span style={{ marginLeft: 12, color: "var(--teal)", fontWeight: 600 }}>Saved!</span>}
        {saving && <span style={{ marginLeft: 12, color: "var(--text3)" }}>Saving…</span>}
      </div>

      {/* Accent color */}
      <Row label="Accent Color">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {COLORS.map(c => (
            <button key={c.value} onClick={() => update("accent", c.value)} title={c.label}
              style={{ width: 32, height: 32, borderRadius: "50%", background: c.value, border: prefs.accent === c.value ? "3px solid var(--text)" : "3px solid transparent", cursor: "pointer", transition: "transform 0.15s, border 0.15s", transform: prefs.accent === c.value ? "scale(1.2)" : "scale(1)" }} />
          ))}
        </div>
      </Row>

      {/* Mode */}
      <Row label="Appearance">
        <div style={{ display: "flex", gap: 10 }}>
          {[{ id: true, label: "Dark" }, { id: false, label: "Light" }].map(m => (
            <button key={String(m.id)} onClick={() => update("dark_mode", m.id)}
              style={{ padding: "8px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid", borderColor: prefs.dark_mode === m.id ? "var(--accent)" : "var(--line2)", background: prefs.dark_mode === m.id ? "var(--accent-d)" : "var(--bg2)", color: prefs.dark_mode === m.id ? "var(--accent)" : "var(--text3)", transition: "all 0.15s" }}>
              {m.label}
            </button>
          ))}
        </div>
      </Row>

      {/* Template */}
      <Row label="Layout">
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { id: "sidebar", label: "Sidebar", desc: "Profile sidebar + tabbed main area" },
            { id: "fullwidth", label: "Full Width", desc: "No sidebar — single wide column" },
          ].map(t => (
            <button key={t.id} onClick={() => update("template", t.id)}
              style={{ flex: 1, padding: "14px 16px", borderRadius: "var(--r-lg)", border: `2px solid ${prefs.template === t.id ? "var(--accent)" : "var(--line2)"}`, background: prefs.template === t.id ? "var(--accent-d)" : "var(--bg2)", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              {/* Mini layout preview */}
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
      </Row>

      {/* Sections */}
      <Row label="Visible Sections">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
          {SECTIONS.map(s => (
            <Toggle key={s.id} on={!(prefs.hide_sections || []).includes(s.id)} onClick={() => toggleSection(s.id)} label={s.label} />
          ))}
        </div>
      </Row>

      {/* Featured repos */}
      {githubRepos.length > 0 && (
        <Row label="Featured Projects">
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
        </Row>
      )}
    </div>
  );
}

// ─── INTERVIEW PREP ───────────────────────────────────────────────────────────
const INTERVIEW_TYPES = [
  { id: "behavioral", label: "Behavioral", color: "var(--rose)" },
  { id: "technical", label: "Technical / Coding", color: "var(--teal)" },
  { id: "case_study", label: "Case Study", color: "var(--amber)" },
  { id: "system_design", label: "System Design", color: "var(--accent)" },
  { id: "hr_culture", label: "HR / Culture", color: "var(--green)" },
];

function InterviewPrep({ userId, jd: initialJd }) {
  const [jd, setJd] = useState(initialJd || "");
  const [selectedTypes, setSelectedTypes] = useState(["behavioral", "technical"]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const TYPE_COLOR = Object.fromEntries(INTERVIEW_TYPES.map(t => [t.id, t.color]));
  const TYPE_LABEL = Object.fromEntries(INTERVIEW_TYPES.map(t => [t.id, t.label]));

  const toggleType = (id) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(t => t !== id) : prev) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!jd.trim() || selectedTypes.length === 0) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await axios.post(`${API}/interview-prep`, { user_id: userId, job_description: jd, interview_types: selectedTypes });
      setResult(res.data.questions || []);
    } catch { setError("Failed to generate. Please try again."); }
    finally { setLoading(false); }
  };

  const copyQ = (i, text) => {
    navigator.clipboard.writeText(text);
    setCopied(i); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <SecHead>Interview Prep</SecHead>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        Select interview types, paste a job description, and get targeted questions with talking points drawn from your actual profile.
      </div>

      {/* Type selector */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Interview Types (select all that apply)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {INTERVIEW_TYPES.map(t => {
            const active = selectedTypes.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggleType(t.id)}
                style={{
                  padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: active ? t.color + "18" : "var(--bg2)",
                  border: `1.5px solid ${active ? t.color : "var(--line2)"}`,
                  color: active ? t.color : "var(--text3)",
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
                }}>
                {active && <Icon name="check" size={12} color={t.color} />}
                {t.label}
              </button>
            );
          })}
        </div>
        {selectedTypes.length > 1 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--text3)" }}>
            ~{Math.ceil(8 / selectedTypes.length)} questions per type · {selectedTypes.length * Math.ceil(8 / selectedTypes.length)} total
          </div>
        )}
      </div>

      <textarea value={jd} onChange={e => setJd(e.target.value)}
        placeholder="Paste the job description here..."
        rows={6} style={{ width: "100%", marginBottom: 12, resize: "vertical" }} />
      <Btn onClick={generate} disabled={loading || !jd.trim()} style={{ marginBottom: 24 }}>
        {loading ? <><Spinner size={14} color="#fff" /> Generating questions…</> : <><Icon name="zap" size={14} color="#fff" /> Generate Questions</>}
      </Btn>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp 0.3s ease" }}>
          {result.map((q, i) => {
            const color = TYPE_COLOR[q.type] || "var(--accent)";
            return (
              <div key={i} className="c-hover" style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px", borderLeft: `3px solid ${color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: color + "18", border: `1px solid ${color}40`, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {TYPE_LABEL[q.type] || q.type}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>Q{i + 1}</span>
                  </div>
                  <button onClick={() => copyQ(i, `Q: ${q.question}\n\nTalking point: ${q.talking_point}`)}
                    className="b-ghost"
                    style={{ background: "transparent", border: "1px solid var(--line2)", borderRadius: "var(--r-sm)", color: copied === i ? "var(--teal)" : "var(--text3)", padding: "3px 9px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name={copied === i ? "check" : "copy"} size={11} color={copied === i ? "var(--teal)" : "var(--text3)"} />
                    {copied === i ? "Copied" : "Copy"}
                  </button>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: "var(--text)", marginBottom: 8, lineHeight: 1.5 }}>"{q.question}"</div>
                {q.why_asked && (
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, fontStyle: "italic" }}>
                    Why asked: {q.why_asked}
                  </div>
                )}
                <div style={{ background: "var(--bg1)", borderRadius: "var(--r-md)", padding: "12px 14px", borderLeft: `2px solid ${color}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Your talking point</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.75 }}>{q.talking_point}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SEEKER PROFILE DASHBOARD ────────────────────────────────────────────────
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
  // Lifted AI tab state
  const [gapRole, setGapRole] = useState(""); const [gapResult, setGapResult] = useState(null); const [gapError, setGapError] = useState(null);
  const [clJd, setClJd] = useState(""); const [clCompany, setClCompany] = useState(""); const [clRole, setClRole] = useState(""); const [clResult, setClResult] = useState(null);
  // Multi-portfolio state
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

  const addAllGithubRepos = async () => {
    if (!githubUrl.trim()) return;
    setGithubLoading(true);
    try {
      const m = githubUrl.trim().match(/github\.com\/([^/\s]+)/);
      const username = m ? m[1] : githubUrl.trim();
      const res = await axios.get(`${API}/github/repos?username=${username}`);
      const repos = res.data.repos || [];
      for (const repo of repos) {
        await axios.post(`${API}/profile/${activePortfolioId}/github`, { github_url: repo.url });
      }
      setGithubUrl(""); setAddingGithub(false);
      await loadProfile();
    } catch {} finally { setGithubLoading(false); }
  };

  const uploadFile = async (file, type) => {
    const f = new FormData(); f.append("file", file);
    const ep = type === "linkedin" ? `/upload/linkedin/${activePortfolioId}` : `/upload/document/${activePortfolioId}`;
    await axios.post(`${API}${ep}`, f);
    await loadProfile();
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
            <div style={{ marginBottom: 14 }}><ProfilePhoto userId={activePortfolioId} name={profile?.name} size={72} /></div>
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
            <UploadRow label="LinkedIn PDF" icon="user" done={hasLinkedin} accept=".pdf" onFile={f => uploadFile(f, "linkedin")} />
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

              {/* Customize section inline */}
              <div style={{ marginTop: 36, borderTop: "1px solid var(--line)", paddingTop: 28 }}>
                <CustomizeTab portfolioId={activePortfolioId} auth={auth} profile={profile} onPrefsChange={(p) => setProfile(prev => ({ ...prev, preferences: p }))} />
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

// ─── SEEKER DASHBOARD ─────────────────────────────────────────────────────────
function SeekerDashboard({ auth, setAuth, onLogout }) {
  const portfolioId = auth.portfolio_id || null;
  if (!portfolioId) return <MinimalProfileSetup auth={auth} setAuth={setAuth} onLogout={onLogout} />;
  return <SeekerProfileDashboard auth={auth} setAuth={setAuth} onLogout={onLogout} initialPortfolioId={portfolioId} />;
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const initial = getRouteFromHash();
  const [page, setPage] = useState(initial.page);
  const [userId, setUserId] = useState(initial.userId);
  const [auth, setAuth] = useState(loadAuth);
  const [authMode, setAuthMode] = useState("signup"); // "login" | "signup"
  const [defaultUserType, setDefaultUserType] = useState("seeker");

  useEffect(() => {
    const h = () => {
      const r = getRouteFromHash();
      setPage(r.page);
      setUserId(r.userId);
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  // Verify token on load
  useEffect(() => {
    if (!auth?.token) return;
    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => {
        const updated = { ...auth, ...r.data };
        saveAuth(updated);
        setAuth(updated);
      })
      .catch(() => { clearAuth(); setAuth(null); });
  }, []);

  const logout = () => { clearAuth(); setAuth(null); window.location.hash = ""; setPage("landing"); };

  const goToPortfolio = (id) => {
    window.location.hash = `#/portfolio/${id}`;
    setUserId(id);
    setPage("portfolio");
  };

  // Public portfolio view — no auth required
  if (page === "portfolio") {
    return (
      <>
        <GlobalStyle />
        <PortfolioPage userId={userId} onBack={() => { window.location.hash = ""; setPage("landing"); }} />
      </>
    );
  }

  // Auth pages (login/signup) — only if not logged in
  if ((page === "login" || page === "signup") && !auth) {
    return (
      <>
        <GlobalStyle />
        <AuthPage
          mode={page}
          defaultType={defaultUserType}
          onSuccess={(data) => {
            setAuth(data);
            window.location.hash = "#/dashboard";
            setPage("dashboard");
          }}
          onSwitch={() => {
            const next = page === "login" ? "signup" : "login";
            window.location.hash = `#/${next}`;
            setPage(next);
          }}
          onBack={() => { window.location.hash = ""; setPage("landing"); }}
        />
      </>
    );
  }

  // Dashboard — requires auth
  if (page === "dashboard" || (auth && page === "landing")) {
    if (!auth) {
      return (
        <>
          <GlobalStyle />
          <LandingPage
            onSeeker={() => { setDefaultUserType("seeker"); setAuthMode("signup"); window.location.hash = "#/signup"; setPage("signup"); }}
            onRecruiter={() => { setDefaultUserType("recruiter"); setAuthMode("signup"); window.location.hash = "#/signup"; setPage("signup"); }}
            onLogin={() => { window.location.hash = "#/login"; setPage("login"); }}
          />
        </>
      );
    }
    if (auth.user_type === "recruiter") {
      return (
        <>
          <GlobalStyle />
          <RecruiterDashboard auth={auth} onLogout={logout} />
        </>
      );
    }
    // seeker
    return (
      <>
        <GlobalStyle />
        <SeekerDashboard auth={auth} setAuth={setAuth} onLogout={logout} />
      </>
    );
  }

  // Default landing page
  return (
    <>
      <GlobalStyle />
      <LandingPage
        onSeeker={() => { setDefaultUserType("seeker"); window.location.hash = "#/signup"; setPage("signup"); }}
        onRecruiter={() => { setDefaultUserType("recruiter"); window.location.hash = "#/signup"; setPage("signup"); }}
        onLogin={() => { window.location.hash = "#/login"; setPage("login"); }}
      />
    </>
  );
}
