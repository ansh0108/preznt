import { useState } from "react";

const P    = "#4648d4";
const T1   = "#111c2d";
const T2   = "#464554";
const T3   = "#767586";
const BG   = "#f9f9ff";
const BG1  = "#ffffff";
const BG2  = "#f0f3ff";
const BGH  = "#dee8ff";
const BGFIX = "#e1e0ff";
const BD   = "rgba(0,0,0,0.06)";
const hairline = { border: `1px solid ${BD}` };
const luxShadow = "0 20px 40px -10px rgba(0,0,0,0.04)";

const NAV_ITEMS = [
  { icon: "⊟", label: "Dashboard", active: true },
  { icon: "📁", label: "Portfolios" },
  { icon: "📈", label: "Analytics" },
  { icon: "🧠", label: "AI Engine" },
  { icon: "⚙️", label: "Settings" },
];

function SidebarBrand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 8px" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: P, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span style={{ fontSize: 22, color: "#fff" }}>◈</span>
      </div>
      <span style={{ fontFamily: "var(--serif)", color: P, fontSize: 24, fontWeight: 700 }}>Prolio</span>
    </div>
  );
}

function SidebarUserCard({ name, initials }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 12, ...hairline }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: BGFIX, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: P, flexShrink: 0 }}>{initials}</div>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: T1, fontFamily: "var(--sans)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: T2, fontFamily: "var(--sans)" }}>Executive Account</span>
      </div>
    </div>
  );
}

function SidebarPrimaryNav({ onSwitchToFull }) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
      {NAV_ITEMS.map(item => (
        <button key={item.label} onClick={item.label === "Portfolios" ? onSwitchToFull : undefined}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "none", cursor: "pointer", textAlign: "left", width: "100%", fontFamily: "var(--sans)", fontSize: 15, fontWeight: item.active ? 700 : 400, background: item.active ? "rgba(225,224,255,0.4)" : "transparent", color: item.active ? P : T2 }}
          onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = "rgba(216,227,251,0.5)"; }}
          onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = "transparent"; }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>{item.label}
        </button>
      ))}
      <button style={{ width: "100%", marginTop: 12, padding: "12px 16px", background: P, color: "#fff", border: "none", borderRadius: 8, fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        onClick={onSwitchToFull}>Create New Portfolio</button>
    </nav>
  );
}

function SidebarFooterNav({ onLogout }) {
  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 4, borderTop: `1px solid ${BD}`, paddingTop: 12 }}>
      {[{ icon: "❓", label: "Support" }, { icon: "→", label: "Sign Out" }].map(item => (
        <button key={item.label} onClick={item.label === "Sign Out" ? onLogout : undefined}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, border: "none", background: "transparent", color: T2, cursor: "pointer", fontFamily: "var(--sans)", fontSize: 14 }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(216,227,251,0.5)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span>{item.icon}</span>{item.label}
        </button>
      ))}
    </nav>
  );
}

function Sidebar({ auth, onLogout, onSwitchToFull }) {
  const name = auth?.name || "Your Account";
  const initials = name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <aside style={{ background: BG, borderRight: `1px solid ${BD}`, position: "fixed", left: 0, top: 0, height: "100%", width: 288, display: "flex", flexDirection: "column", padding: 24, gap: 24, zIndex: 50 }}>
      <SidebarBrand />
      <SidebarUserCard name={name} initials={initials} />
      <SidebarPrimaryNav onSwitchToFull={onSwitchToFull} />
      <SidebarFooterNav onLogout={onLogout} />
    </aside>
  );
}

function MetricCard({ label, value, trend, icon, sub }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{
      background: BG1, borderRadius: 12, ...hairline, padding: 24,
      display: "flex", flexDirection: "column", justifyContent: "space-between", height: 192,
      transition: "box-shadow 0.2s", boxShadow: hovered ? luxShadow : "none",
    }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T2, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--sans)" }}>{label}</span>
        <div style={{ background: "rgba(225,224,255,0.4)", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
      </div>
      <div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 40, lineHeight: 1, color: T1, marginBottom: 4 }}>{value}</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: trend ? "#494bd6" : T3, display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--sans)" }}>
          {trend && <span>↑</span>}{sub}
        </div>
      </div>
    </div>
  );
}

const BAR_HEIGHTS = [30, 45, 40, 60, 85, 70, 90];
const BAR_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AudienceChart() {
  const [period, setPeriod] = useState("1M");
  return (
    <section style={{ background: BG1, borderRadius: 12, ...hairline, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 8, borderBottom: `1px solid ${BD}` }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, margin: 0 }}>Audience Growth</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {["1M", "3M", "1Y"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: "4px 12px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500, transition: "all 0.15s",
                background: period === p ? "rgba(70,72,212,0.10)" : "transparent",
                color: period === p ? P : T2,
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{ height: 256, width: "100%", position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "32px 16px 0", borderBottom: `1px solid rgba(0,0,0,0.10)`, borderLeft: `1px solid rgba(0,0,0,0.10)` }}>
        {/* Grid lines */}
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ position: "absolute", top: `${i * 25}%`, left: 0, right: 0, borderTop: "1px solid rgba(0,0,0,0.03)", pointerEvents: "none" }} />
        ))}
        {BAR_HEIGHTS.map((h, i) => {
          const isHighlight = i === 4;
          return (
            <div key={i} style={{ width: 48, height: `${h}%`, borderRadius: "4px 4px 0 0", cursor: "pointer", transition: "background 0.15s",
              background: isHighlight ? "rgba(70,72,212,0.80)" : BGH,
              boxShadow: isHighlight ? "0 0 15px rgba(70,72,212,0.3)" : "none",
            }}
              onMouseEnter={e => { if (!isHighlight) e.currentTarget.style.background = P; }}
              onMouseLeave={e => { if (!isHighlight) e.currentTarget.style.background = BGH; }} />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px 0", fontFamily: "var(--sans)" }}>
        {BAR_DAYS.map((d, i) => (
          <span key={d} style={{ fontSize: 12, fontWeight: i === 4 ? 700 : 500, color: i === 4 ? P : T2 }}>{d}</span>
        ))}
      </div>
    </section>
  );
}

const PORTFOLIOS = [
  { title: "Enterprise SaaS Redesign", meta: "Q3 Deliverables • 12 Assets", rating: "4.9" },
  { title: "Fintech Mobile App", meta: "Concept Phase • 8 Assets", rating: null },
];

function PortfolioCard({ title, meta, rating, onOpen }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ cursor: "pointer" }} onClick={onOpen} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ width: "100%", height: 192, borderRadius: 12, background: `linear-gradient(135deg, ${BGH} 0%, ${BG2} 100%)`, marginBottom: 16, overflow: "hidden", ...hairline, position: "relative", transition: "transform 0.5s" }}>
        {rating && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", padding: "4px 8px", borderRadius: 6, ...hairline, display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: T1 }}>
            ⭐ {rating}
          </div>
        )}
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, transform: hov ? "scale(1.05)" : "scale(1)", transition: "transform 0.5s" }}>🗂️</div>
      </div>
      <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 500, color: hov ? P : T1, marginBottom: 4, margin: "0 0 4px", transition: "color 0.15s" }}>{title}</h3>
      <p style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: T2, margin: 0 }}>{meta}</p>
    </div>
  );
}

function NewPortfolioCard({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ cursor: "pointer" }} onClick={onClick}>
      <div style={{ width: "100%", height: 192, borderRadius: 12, border: `2px dashed ${hov ? "rgba(70,72,212,0.5)" : BD}`, background: `linear-gradient(135deg, ${BG} 0%, ${BG} 100%)`, marginBottom: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transition: "border-color 0.15s" }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(225,224,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: P, fontSize: 24 }}>+</div>
        <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: T1 }}>Draft New Portfolio</span>
      </div>
    </div>
  );
}

function ProlioDashboard({ auth, onLogout, onSwitchToFull, onOpenEditor }) {
  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", fontFamily: "var(--sans)" }}>
      <Sidebar auth={auth} onLogout={onLogout} onSwitchToFull={onSwitchToFull} />

      <main style={{ marginLeft: 288, flex: 1, padding: 40, display: "flex", flexDirection: "column", gap: 48, maxWidth: "calc(100vw - 288px)" }}>
        {/* Page header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `1px solid ${BD}`, paddingBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em", color: T1, marginBottom: 8, margin: "0 0 8px" }}>Performance Overview</h1>
            <p style={{ fontSize: 16, color: T2, margin: 0 }}>Your executive summary for the current quarter.</p>
          </div>
          <button style={{ padding: "8px 16px", borderRadius: 8, ...hairline, background: "transparent", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: T1, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = BG2}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            Export Report
          </button>
        </header>

        {/* Metric cards */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          <MetricCard label="Total Views" value="124.5k" icon="👁" trend sub="+14.2% from last month" />
          <MetricCard label="Engagement" value="8.7%" icon="♥" trend sub="+2.1% from last month" />
          <MetricCard label="Active Proposals" value="24" icon="📄" sub="4 awaiting signature" />
        </section>

        {/* Chart */}
        <AudienceChart />

        {/* Active Portfolios */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, margin: 0 }}>Active Portfolios</h2>
            <button onClick={onSwitchToFull}
              style={{ background: "none", border: "none", color: P, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--sans)" }}>
              View All →
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {PORTFOLIOS.map(p => <PortfolioCard key={p.title} {...p} onOpen={onSwitchToFull} />)}
            <NewPortfolioCard onClick={onOpenEditor} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProlioDashboard;
