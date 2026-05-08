import { useState } from "react";

const P    = "var(--accent)";
const T1   = "var(--text)";
const T2   = "var(--text2)";
const T3   = "var(--text3)";
const BG   = "var(--bg)";
const BG1  = "var(--bg1)";
const BG2  = "var(--bg2)";
const BGC  = "var(--bg3)";
const BGH  = "var(--bg3)";
const BGOV = "var(--bg4)";
const BGFIX = "var(--bg4)";
const BD   = "var(--line)";

const COLORS = [
  { label: "Background", hex: "#121319" },
  { label: "Text Primary", hex: "#e4e1eb" },
  { label: "Accent Color", hex: "#818cf8" },
];

const DENSITIES = ["Compact", "Relaxed", "Airy"];

function TopBar({ onBack, portfolio }) {
  const [saved] = useState(true);
  return (
    <header style={{ height: 64, flexShrink: 0, background: BG1, borderBottom: `1px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 700, color: P, letterSpacing: "-0.02em" }}>Prolio</span>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: T2, cursor: "pointer", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, transition: "color 0.15s", marginLeft: 8 }}
            onMouseEnter={e => e.currentTarget.style.color = T1}
            onMouseLeave={e => e.currentTarget.style.color = T2}>
            ← Dashboard
          </button>
        </div>
        <div style={{ width: 1, height: 24, background: BD }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 12, fontWeight: 500, color: T2, fontFamily: "var(--sans)" }}>Editing Portfolio</span>
          <span style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 600, color: T1, lineHeight: 1.2 }}>{portfolio || "Executive Summary 2024"}</span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {saved && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: T2, marginRight: 12 }}>
            <span style={{ fontSize: 14 }}>☁</span>
            <span style={{ fontSize: 12, fontWeight: 500, fontFamily: "var(--sans)" }}>Saved just now</span>
          </div>
        )}
        <button style={{ padding: "8px 12px", border: `1px solid ${BD}`, borderRadius: 4, background: "transparent", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: T1, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = BG1}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          👁 Preview
        </button>
        <button style={{ padding: "8px 12px", background: P, color: "#fff", border: "none", borderRadius: 4, fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(129,140,248,0.2)", transition: "opacity 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          Publish Updates
        </button>
      </div>
    </header>
  );
}

function ColorRow({ label, hex }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8, borderRadius: 8, margin: "0 -8px", cursor: "pointer", transition: "background 0.15s", background: hov ? "var(--accent-d)" : "transparent" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: hex, border: "1px solid rgba(0,0,0,0.10)", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", flexShrink: 0 }} />
        <span style={{ fontSize: 14, color: hov ? T1 : T2, fontFamily: "var(--sans)", transition: "color 0.15s" }}>{label}</span>
      </div>
      <span style={{ fontSize: 12, fontWeight: 500, color: T2, fontFamily: "var(--sans)", opacity: hov ? 1 : 0, transition: "opacity 0.15s" }}>{hex.toUpperCase()}</span>
    </div>
  );
}

function LeftPanel({ density, setDensity, darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState("Theme");
  return (
    <aside style={{ width: 340, flexShrink: 0, background: BG2, borderRight: `1px solid ${BD}`, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 10 }}>
      {/* Tabs */}
      <div style={{ padding: 8, display: "flex", gap: 8, background: BG2, borderBottom: `1px solid ${BD}`, flexShrink: 0 }}>
        {["Layout", "Theme", "Content"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "6px 0", textAlign: "center", fontSize: 14, fontWeight: 600, cursor: "pointer", borderRadius: 4, fontFamily: "var(--sans)", transition: "all 0.15s",
            background: activeTab === tab ? BG1 : "transparent",
            color: activeTab === tab ? P : T2,
            border: activeTab === tab ? `1px solid ${BD}` : "1px solid transparent",
            boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.02)" : "none",
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable controls */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 48 }}>
        {/* Colors */}
        <section style={{ borderBottom: `1px solid ${BD}`, padding: "24px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: T1, fontFamily: "var(--sans)", margin: 0 }}>Global Colors</h3>
            <button style={{ background: "none", border: "none", color: P, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)" }}>Reset</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {COLORS.map(c => <ColorRow key={c.label} {...c} />)}
          </div>
        </section>

        {/* Typography */}
        <section style={{ borderBottom: `1px solid ${BD}`, padding: "24px 24px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T1, fontFamily: "var(--sans)", marginBottom: 12 }}>Typography</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Headings (Display, Headline)", font: "Playfair Display", serif: true },
              { label: "Body Text (Paragraphs, Labels)", font: "Plus Jakarta Sans", serif: false },
            ].map(({ label, font, serif }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: T2, fontFamily: "var(--sans)" }}>{label}</label>
                <button style={{ width: "100%", background: BG1, border: `1px solid ${BD}`, borderRadius: 4, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-b)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = BD}>
                  <span style={{ fontFamily: serif ? "var(--serif)" : "var(--sans)", fontSize: 16, color: T1, lineHeight: 1 }}>{font}</span>
                  <span style={{ color: T2, fontSize: 16 }}>∨</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Layout density */}
        <section style={{ borderBottom: `1px solid ${BD}`, padding: "24px 24px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: T1, fontFamily: "var(--sans)", marginBottom: 12 }}>Layout Density</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {DENSITIES.map(d => {
              const active = density === d;
              const gap = d === "Compact" ? 2 : d === "Relaxed" ? 4 : 6;
              return (
                <button key={d} onClick={() => setDensity(d)}
                  style={{ padding: "12px 0", border: active ? `1px solid ${P}` : `1px solid ${BD}`, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.15s", background: active ? "var(--accent-d)" : "transparent", boxShadow: active ? "0 0 0 1px rgba(129,140,248,0.2)" : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap }}>
                    {[24, 24, 16].map((w, i) => (
                      <div key={i} style={{ width: w, height: 4, background: active ? P : BGOV, borderRadius: 100 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: active ? P : T2, fontFamily: "var(--sans)" }}>{d}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dark mode toggle */}
        <section style={{ padding: "24px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: T1, fontFamily: "var(--sans)" }}>Enable Dark Mode Toggle</span>
              <span style={{ fontSize: 12, color: T2, fontFamily: "var(--sans)" }}>Allow visitors to switch themes</span>
            </div>
            <div onClick={() => setDarkMode(!darkMode)}
              style={{ width: 40, height: 24, borderRadius: 100, padding: 2, cursor: "pointer", display: "flex", alignItems: "center", border: `1px solid ${BD}`, transition: "background 0.2s", background: darkMode ? P : BGOV, justifyContent: darkMode ? "flex-end" : "flex-start" }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: BG1, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" }} />
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
}

function CanvasPortfolio({ density }) {
  const gap = density === "Compact" ? 16 : density === "Relaxed" ? 24 : 40;
  return (
    <div style={{ width: "100%", maxWidth: 1100, minHeight: 900, background: BG1, boxShadow: "0 24px 80px rgba(0,0,0,0.05)", border: `1px solid ${BD}`, display: "flex", flexDirection: "column", marginBottom: 40 }}>
      {/* Portfolio Nav */}
      <nav style={{ height: 96, padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BD}` }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", color: T1 }}>JM.</span>
        <ul style={{ display: "flex", alignItems: "center", gap: 32, listStyle: "none", margin: 0, padding: 0 }}>
          {["Selected Work", "Philosophy", "Journal"].map((item, i) => (
            <li key={item} style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: i === 0 ? T1 : T2, cursor: "pointer", letterSpacing: "0.02em" }}>{item}</li>
          ))}
        </ul>
        <button style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: T1, background: "none", border: "none", borderBottom: `1px solid ${T1}`, paddingBottom: 2, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = P; e.currentTarget.style.borderColor = P; }}
          onMouseLeave={e => { e.currentTarget.style.color = T1; e.currentTarget.style.borderColor = T1; }}>
          Get in touch
        </button>
      </nav>

      {/* Portfolio Hero */}
      <header style={{ padding: `48px 48px`, display: "flex", gap: 64, alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap }}>
          <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: P, letterSpacing: "0.1em", textTransform: "uppercase" }}>Digital Architect</span>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.05, color: T1, margin: 0 }}>
            Crafting seamless experiences that bridge utility and elegance.
          </h1>
          <p style={{ fontFamily: "var(--sans)", fontSize: 18, lineHeight: 1.6, color: T2, maxWidth: 400, marginTop: 16 }}>
            Senior Product Designer specializing in zero-to-one enterprise applications and high-end editorial interfaces. Based in San Francisco.
          </p>
        </div>
        <div style={{ width: "45%", aspectRatio: "4/5", background: `linear-gradient(135deg, ${BGH} 0%, BGOV 100%)`, flexShrink: 0, overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${BGH} 0%, ${BGOV} 100%)` }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.3 }}>🏛</div>
        </div>
      </header>

      {/* Case Studies */}
      <section style={{ padding: "64px 48px", display: "flex", flexDirection: "column", gap: 48, borderTop: `1px solid ${BD}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em", color: T1, margin: 0 }}>Selected Case Studies</h2>
          <a href="#" onClick={e => e.preventDefault()} style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: T2, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}
            onMouseEnter={e => e.target.style.color = P} onMouseLeave={e => e.target.style.color = T2}>
            View all →
          </a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "8fr 4fr", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, cursor: "pointer" }}>
            <div style={{ width: "100%", aspectRatio: "16/9", background: `linear-gradient(135deg, ${BGH} 0%, ${BG2} 100%)`, border: `1px solid ${BD}`, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, opacity: 0.25 }}>💻</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 8 }}>
              <div>
                <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, color: T1, margin: "0 0 4px" }}>Aura Financial Platform</h3>
                <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: T2, margin: 0 }}>Complete redesign of institutional trading terminal.</p>
              </div>
              <span style={{ fontFamily: "var(--sans)", fontSize: 11, padding: "4px 8px", background: BGH, color: T2, borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Fintech</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, cursor: "pointer" }}>
            <div style={{ width: "100%", aspectRatio: "3/4", background: `linear-gradient(135deg, ${BGOV} 0%, ${BG} 100%)`, border: `1px solid ${BD}`, overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, opacity: 0.25 }}>📱</div>
            </div>
            <div style={{ paddingTop: 8 }}>
              <h3 style={{ fontFamily: "var(--serif)", fontSize: 20, color: T1, margin: "0 0 4px" }}>Lumina App</h3>
              <p style={{ fontFamily: "var(--sans)", fontSize: 14, color: T2, margin: 0 }}>iOS Design System.</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 96, background: BG1 }} />
    </div>
  );
}

function ZoomControl() {
  const [zoom, setZoom] = useState(100);
  return (
    <div style={{ position: "fixed", bottom: 40, right: 40, background: BG1, border: `1px solid ${BD}`, boxShadow: "0 12px 48px rgba(0,0,0,0.06)", borderRadius: 8, display: "flex", alignItems: "center", padding: 4, zIndex: 20 }}>
      <button onClick={() => setZoom(z => Math.max(50, z - 10))}
        style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: T2, cursor: "pointer", borderRadius: 4, fontSize: 18, transition: "all 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background = BGH}
        onMouseLeave={e => e.currentTarget.style.background = "none"}>−</button>
      <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, padding: "0 8px", minWidth: 60, textAlign: "center", color: T1 }}>{zoom}%</span>
      <button onClick={() => setZoom(z => Math.min(150, z + 10))}
        style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", color: T2, cursor: "pointer", borderRadius: 4, fontSize: 18, transition: "all 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.background = BGH}
        onMouseLeave={e => e.currentTarget.style.background = "none"}>+</button>
      <div style={{ width: 1, height: 16, background: "rgba(0,0,0,0.10)", margin: "0 4px" }} />
      {[{ label: "🖥", tip: "Desktop" }, { label: "📱", tip: "Mobile" }].map((m, i) => (
        <button key={m.label} title={m.tip}
          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: i === 0 ? BGH : "none", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 14, opacity: i === 1 ? 0.5 : 1 }}>
          {m.label}
        </button>
      ))}
    </div>
  );
}

function ProlioEditor({ onBack, portfolio }) {
  const [density, setDensity] = useState("Relaxed");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", overflow: "hidden", background: BG, fontFamily: "var(--sans)" }}>
      <TopBar onBack={onBack} portfolio={portfolio} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <LeftPanel density={density} setDensity={setDensity} darkMode={darkMode} setDarkMode={setDarkMode} />
        <section style={{ flex: 1, background: BGC, display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", padding: 40, position: "relative" }}>
          <CanvasPortfolio density={density} />
          <ZoomControl />
        </section>
      </div>
    </div>
  );
}

export default ProlioEditor;
