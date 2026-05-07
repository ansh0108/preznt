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

const DENSITIES = ["Compact", "Relaxed", "Airy"];
const SECTIONS = ["Selected Work", "Philosophy", "Journal", "Contact"];
const ACCENT_COLORS = [
  { label: "Indigo",  value: "#4648d4" },
  { label: "Slate",   value: "#374151" },
  { label: "Violet",  value: "#7c3aed" },
  { label: "Rose",    value: "#db2777" },
  { label: "Teal",    value: "#0d9488" },
];

const CASE_STUDIES = [
  { title: "Aura Financial Platform", category: "Fintech", desc: "Institutional trading terminal redesign — zero-latency execution UI for professional traders.", tags: ["Figma", "React", "D3.js"] },
  { title: "Lumina App", category: "Design System", desc: "iOS Design System — scalable component library with 240+ tokens across 3 brand expressions.", tags: ["SwiftUI", "Tokens"] },
];

function SettingsPanel({ accent, setAccent, density, setDensity, darkMode, setDarkMode }) {
  return (
    <aside style={{ width: 250, flexShrink: 0, background: S0, borderRight: `1px solid ${BD}`, overflowY: "auto", padding: "28px 20px", display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Accent Color</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ACCENT_COLORS.map(c => (
            <button key={c.value} onClick={() => setAccent(c.value)} title={c.label}
              style={{ width: 28, height: 28, borderRadius: "50%", background: c.value, border: `2px solid ${accent === c.value ? c.value : "transparent"}`, outline: accent === c.value ? `2px solid ${c.value}40` : "2px solid transparent", outlineOffset: 2, cursor: "pointer", transition: "all 0.15s", transform: accent === c.value ? "scale(1.15)" : "scale(1)" }} />
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Typography</div>
        <div style={{ background: BG, border: `1px solid ${BD}`, borderRadius: 12, padding: "14px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T1, fontFamily: "var(--serif)", marginBottom: 4 }}>Playfair Display</div>
          <div style={{ fontSize: 11.5, color: T3 }}>Headings — editorial serif</div>
          <div style={{ height: 1, background: BD, margin: "12px 0" }} />
          <div style={{ fontSize: 13, fontWeight: 500, color: T1, marginBottom: 4 }}>Plus Jakarta Sans</div>
          <div style={{ fontSize: 11.5, color: T3 }}>Body — geometric sans</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Layout Density</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {DENSITIES.map(d => (
            <button key={d} onClick={() => setDensity(d)}
              style={{ width: "100%", padding: "9px 14px", borderRadius: 10, border: `1px solid ${density === d ? accent : BD}`, background: density === d ? `${accent}10` : S0, color: density === d ? accent : T2, fontSize: 13, fontWeight: density === d ? 700 : 500, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Display Mode</div>
        <button onClick={() => setDarkMode(d => !d)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, border: `1px solid ${BD}`, background: S0, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.background = BG; }}
          onMouseLeave={e => { e.currentTarget.style.background = S0; }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: T1 }}>Dark Mode</span>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: darkMode ? accent : "#d1d5db", transition: "background 0.2s", position: "relative" }}>
            <div style={{ position: "absolute", top: 2, left: darkMode ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
          </div>
        </button>
      </div>
    </aside>
  );
}

function PortfolioCanvas({ accent, density, name, title }) {
  const gap = density === "Compact" ? 20 : density === "Relaxed" ? 32 : 48;
  return (
    <div style={{ flex: 1, overflowY: "auto", background: BG, padding: "32px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", background: S0, borderRadius: 24, border: `1px solid ${BD}`, overflow: "hidden", boxShadow: "0 4px 32px rgba(0,0,0,0.06)" }}>
        <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, ${accent}80)` }} />
        <div style={{ padding: `${gap + 8}px 40px ${gap}px` }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 700, color: T1, letterSpacing: "-0.025em", marginBottom: 8 }}>
            {name || "Your Name"}
          </div>
          <div style={{ fontSize: 15, color: accent, fontWeight: 600, marginBottom: 14 }}>{title || "Your Title"}</div>
          <p style={{ fontSize: 14, color: T2, lineHeight: 1.75, maxWidth: 540, marginBottom: gap }}>
            Senior Product Designer specializing in zero-to-one enterprise applications and high-end editorial interfaces. Based in San Francisco.
          </p>
          <div style={{ display: "flex", gap: 12, marginBottom: gap }}>
            {SECTIONS.map(s => (
              <button key={s}
                style={{ padding: "8px 16px", borderRadius: 100, border: `1px solid ${BD}`, background: "transparent", color: T3, fontSize: 12.5, fontWeight: 500, cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent; e.currentTarget.style.background = `${accent}08`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.color = T3; e.currentTarget.style.background = "transparent"; }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${BD}`, padding: `${gap}px 40px` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: gap }}>Selected Work</div>
          <div style={{ display: "flex", flexDirection: "column", gap: gap - 4 }}>
            {CASE_STUDIES.map((cs, i) => (
              <div key={i} style={{ border: `1px solid ${BD}`, borderRadius: 18, overflow: "hidden", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${accent}40`; e.currentTarget.style.boxShadow = `0 6px 24px ${accent}12`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ height: 140, background: `linear-gradient(135deg, ${accent}12, ${accent}04)`, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${BD}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="briefcase" size={22} color={accent} />
                  </div>
                </div>
                <div style={{ padding: "20px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: accent, letterSpacing: "0.06em", textTransform: "uppercase" }}>{cs.category}</span>
                  </div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 700, color: T1, marginBottom: 8, letterSpacing: "-0.015em" }}>{cs.title}</div>
                  <p style={{ fontSize: 13.5, color: T3, lineHeight: 1.65, marginBottom: 14 }}>{cs.desc}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {cs.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11.5, fontWeight: 600, color: T2, background: BG, border: `1px solid ${BD}`, borderRadius: 100, padding: "3px 10px" }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditorTopBar({ onBack, saving }) {
  const [preview, setPreview] = useState("desktop");
  return (
    <div style={{ height: 54, background: S0, borderBottom: `1px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: T3, fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "6px 10px", borderRadius: 8, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.background = BG; }}
          onMouseLeave={e => { e.currentTarget.style.color = T3; e.currentTarget.style.background = "transparent"; }}>
          ← Back
        </button>
        <div style={{ width: 1, height: 20, background: BD }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: T1 }}>Portfolio Editor</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", background: BG, border: `1px solid ${BD}`, borderRadius: 8, overflow: "hidden" }}>
          {["desktop", "mobile"].map(p => (
            <button key={p} onClick={() => setPreview(p)}
              style={{ padding: "5px 14px", background: preview === p ? P : "transparent", color: preview === p ? "#fff" : T3, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5 }}>
              <Icon name={p === "desktop" ? "eye" : "user"} size={13} color={preview === p ? "#fff" : T3} />
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        {saving && (
          <div style={{ fontSize: 12, color: T3, display: "flex", alignItems: "center", gap: 5 }}>
            <Icon name="check" size={12} color="#16a34a" />
            <span style={{ color: "#16a34a" }}>Saved</span>
          </div>
        )}
        <button style={{ background: P, color: "#fff", border: "none", borderRadius: 10, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 3px 12px rgba(70,72,212,0.3)`, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 5px 18px rgba(70,72,212,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 3px 12px rgba(70,72,212,0.3)"; }}>
          Publish
        </button>
      </div>
    </div>
  );
}

function ProlioEditor({ profile, onBack }) {
  const [accent, setAccent] = useState("#4648d4");
  const [density, setDensity] = useState("Relaxed");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "var(--sans)", background: BG }}>
      <EditorTopBar onBack={onBack} saving />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SettingsPanel accent={accent} setAccent={setAccent} density={density} setDensity={setDensity} darkMode={darkMode} setDarkMode={setDarkMode} />
        <PortfolioCanvas accent={accent} density={density} name={profile?.name} title={profile?.title} />
      </div>
    </div>
  );
}

export default ProlioEditor;
