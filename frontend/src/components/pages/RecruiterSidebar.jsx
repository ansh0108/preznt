import { useState } from "react";
import Icon from "../ui/Icon";

const T = { r: "12px" };

// ─── SideNavItem ──────────────────────────────────────────────────────────────
function SideNavItem({ icon, label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isActive = active || hovered;
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", background: isActive ? "var(--bg2)" : "transparent", border: "none", borderRadius: 10, padding: "10px 14px", cursor: "pointer", color: isActive ? "var(--accent)" : "var(--text2)", fontSize: 14, fontWeight: isActive ? 600 : 400, textAlign: "left", transition: "all 0.14s", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
      <Icon name={icon} size={16} color={isActive ? "var(--accent)" : "var(--text3)"} />
      {label}
    </button>
  );
}

// ─── SideUserCard ─────────────────────────────────────────────────────────────
function SideUserCard({ auth, onLogout }) {
  return (
    <div style={{ margin: "16px", padding: "14px 16px", background: "var(--bg2)", borderRadius: T.r, border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>{auth.email}</div>
      <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>Recruiter account</div>
      <button onClick={onLogout}
        style={{ width: "100%", background: "transparent", border: "1px solid var(--line)", borderRadius: 8, color: "var(--text3)", padding: "7px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)", transition: "all 0.14s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.color = "var(--text2)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text3)"; }}>
        <Icon name="logout" size={13} color="currentColor" /> Sign out
      </button>
    </div>
  );
}

// ─── RecruiterSidebar ─────────────────────────────────────────────────────────
function RecruiterSidebar({ auth, onLogout }) {
  return (
    <aside style={{ width: 288, flexShrink: 0, position: "fixed", top: 0, left: 0, bottom: 0, background: "var(--bg1)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", zIndex: 20, overflowY: "auto" }}>
      <div style={{ padding: "28px 24px 24px" }}>
        <div style={{ fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: 28, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1 }}>Prolio</div>
        <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)", letterSpacing: "0.04em" }}>Recruiter Hub</div>
      </div>
      <nav style={{ padding: "0 12px", flex: 1 }}>
        <SideNavItem icon="search" label="Discover" active={true} />
        <SideNavItem icon="chart" label="Analytics" />
        <SideNavItem icon="file" label="Templates" />
        <SideNavItem icon="zap" label="Help" />
      </nav>
      <SideUserCard auth={auth} onLogout={onLogout} />
    </aside>
  );
}

export default RecruiterSidebar;
