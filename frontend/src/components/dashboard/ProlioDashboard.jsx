import { useState } from "react";
import Icon from "../ui/Icon";

const P = "#4648d4";
const PL = "rgba(70,72,212,0.08)";
const PB = "rgba(70,72,212,0.2)";
const BG = "#f9f9ff";
const S0 = "#ffffff";
const T1 = "#111c2d";
const T2 = "#3a3a50";
const T3 = "#7a7a96";
const BD = "rgba(0,0,0,0.06)";
const BD2 = "rgba(0,0,0,0.10)";
const SH = "0 2px 12px rgba(0,0,0,0.06)";

const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",  icon: "chart" },
  { id: "portfolios", label: "Portfolios", icon: "file" },
  { id: "editor",     label: "Visual Editor", icon: "eye" },
  { id: "analytics",  label: "Analytics",  icon: "trending" },
  { id: "ai",         label: "AI Engine",  icon: "zap" },
  { id: "settings",   label: "Settings",   icon: "wrench" },
];

const CHART_DATA = [
  { month: "Oct", v: 62 }, { month: "Nov", v: 78 }, { month: "Dec", v: 55 },
  { month: "Jan", v: 88 }, { month: "Feb", v: 72 }, { month: "Mar", v: 100 },
];

function Sidebar({ nav, setNav, auth, onLogout }) {
  return (
    <aside style={{ width: 220, flexShrink: 0, background: S0, borderRight: `1px solid ${BD}`, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
      <div style={{ padding: "22px 24px 16px", borderBottom: `1px solid ${BD}` }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: T1, letterSpacing: "-0.02em" }}>
          prolio<span style={{ color: P }}>.</span>
        </div>
      </div>
      <nav style={{ flex: 1, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setNav(item.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: nav === item.id ? PL : "transparent", border: "none", color: nav === item.id ? P : T3, fontSize: 13.5, fontWeight: nav === item.id ? 700 : 500, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
            onMouseEnter={e => { if (nav !== item.id) { e.currentTarget.style.background = "#f3f3fa"; e.currentTarget.style.color = T1; } }}
            onMouseLeave={e => { if (nav !== item.id) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T3; } }}>
            <Icon name={item.icon} size={16} color={nav === item.id ? P : T3} />
            {item.label}
          </button>
        ))}
      </nav>
      <div style={{ padding: "14px 12px", borderTop: `1px solid ${BD}` }}>
        <button onClick={onLogout}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 10, background: "transparent", border: "none", color: T3, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fff0f0"; e.currentTarget.style.color = "#dc2626"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T3; }}>
          <Icon name="logout" size={15} color="currentColor" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

function MetricCard({ label, value, change, positive, icon }) {
  return (
    <div style={{ flex: 1, minWidth: 160, background: S0, border: `1px solid ${BD}`, borderRadius: 18, padding: "22px 24px", boxShadow: SH }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: T3, letterSpacing: "0.01em" }}>{label}</div>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: PL, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={16} color={P} />
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: T1, fontFamily: "var(--serif)", letterSpacing: "-0.025em", marginBottom: 8 }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: positive ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
        <span>{positive ? "↑" : "↓"}</span>
        <span>{change}</span>
        <span style={{ color: T3, fontWeight: 400 }}>vs last month</span>
      </div>
    </div>
  );
}

function AudienceChart({ range, setRange }) {
  const max = Math.max(...CHART_DATA.map(d => d.v));
  return (
    <div style={{ background: S0, border: `1px solid ${BD}`, borderRadius: 20, padding: "26px 28px", boxShadow: SH }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T1, marginBottom: 3 }}>Audience Growth</div>
          <div style={{ fontSize: 13, color: T3 }}>Portfolio view trends</div>
        </div>
        <div style={{ display: "flex", background: BG, border: `1px solid ${BD2}`, borderRadius: 10, overflow: "hidden" }}>
          {["1M", "3M", "1Y"].map(r => (
            <button key={r} onClick={() => setRange(r)}
              style={{ padding: "6px 16px", background: range === r ? P : "transparent", color: range === r ? "#fff" : T3, border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, transition: "all 0.15s" }}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 140 }}>
        {CHART_DATA.slice(-({ "1M": 1, "3M": 3, "1Y": 6 }[range] || 6)).map((d, i, arr) => (
          <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: "100%", borderRadius: "6px 6px 0 0", background: i === arr.length - 1 ? P : PB, height: `${(d.v / max) * 112}px`, transition: "height 0.4s ease", minHeight: 8, position: "relative" }}
              title={`${d.v}% of peak`}>
              {i === arr.length - 1 && (
                <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)", background: T1, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" }}>
                  +14.2%
                </div>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: T3, fontWeight: 500 }}>{d.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioRow({ name, stage, assets, rating, built }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 0", borderBottom: `1px solid ${BD}` }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: PL, border: `1px solid ${PB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="file" size={18} color={P} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
        <div style={{ fontSize: 12, color: T3 }}>{stage} · {assets} assets</div>
      </div>
      {rating && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "#d97706", fontWeight: 700, flexShrink: 0 }}>
          <Icon name="star" size={13} color="#d97706" /> {rating}
        </div>
      )}
      <div style={{ flexShrink: 0 }}>
        {built
          ? <span style={{ background: "rgba(13,148,136,0.1)", color: "#0d9488", border: "1px solid rgba(13,148,136,0.22)", borderRadius: 100, padding: "3px 10px", fontSize: 11.5, fontWeight: 600 }}>Live</span>
          : <span style={{ background: PL, color: P, border: `1px solid ${PB}`, borderRadius: 100, padding: "3px 10px", fontSize: 11.5, fontWeight: 600 }}>Draft</span>}
      </div>
    </div>
  );
}

function DashboardHome({ auth, onSwitchToFull }) {
  const [range, setRange] = useState("3M");
  const name = auth?.profile_name || auth?.email?.split("@")[0] || "there";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 36px", background: BG }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: T3, marginBottom: 6 }}>Good morning ✦</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 700, color: T1, letterSpacing: "-0.02em" }}>
            {name.charAt(0).toUpperCase() + name.slice(1)}'s Portfolio Hub
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, marginBottom: 28, flexWrap: "wrap" }}>
          <MetricCard label="Total Views" value="124.5k" change="+14.2% MoM" positive icon="eye" />
          <MetricCard label="Engagement Rate" value="8.7%" change="+2.1 pts" positive icon="trending" />
          <MetricCard label="Active Proposals" value="24" change="4 awaiting sign-off" positive icon="star" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>
          <AudienceChart range={range} setRange={setRange} />

          <div style={{ background: S0, border: `1px solid ${BD}`, borderRadius: 20, padding: "24px", boxShadow: SH }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Active Portfolios</div>
              <button onClick={onSwitchToFull}
                style={{ background: "transparent", border: "none", color: P, fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: "4px 0" }}>
                View All →
              </button>
            </div>
            <div style={{ fontSize: 12.5, color: T3, marginBottom: 20 }}>Your published work</div>
            <PortfolioRow name="Enterprise SaaS Redesign" stage="Q3 Deliverables" assets={12} rating="4.9" built />
            <PortfolioRow name="Fintech Mobile App" stage="Concept Phase" assets={8} rating={null} built={false} />
            <button onClick={onSwitchToFull}
              style={{ width: "100%", marginTop: 16, padding: "10px", borderRadius: 10, background: BG, border: `1px dashed ${BD2}`, color: T3, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = PB; e.currentTarget.style.color = P; e.currentTarget.style.background = PL; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BD2; e.currentTarget.style.color = T3; e.currentTarget.style.background = BG; }}>
              + Draft New Portfolio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProlioDashboard({ auth, onLogout, onSwitchToFull, onOpenEditor }) {
  const [nav, setNav] = useState("dashboard");

  const handleNav = (id) => {
    if (id === "portfolios" && onSwitchToFull) { onSwitchToFull(); return; }
    if (id === "editor" && onOpenEditor) { onOpenEditor(); return; }
    setNav(id);
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: BG, fontFamily: "var(--sans)" }}>
      <Sidebar nav={nav} setNav={handleNav} auth={auth} onLogout={onLogout} />
      <DashboardHome auth={auth} onSwitchToFull={onSwitchToFull} />
    </div>
  );
}

export default ProlioDashboard;
