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

const FEATURES = [
  { icon: "zap",       title: "AI Narrative Engine",   desc: "Converts bullet points into compelling professional stories that resonate with decision-makers." },
  { icon: "code",      title: "Dynamic Layouts",        desc: "Editorial-grade templates that adapt to each opportunity — like having a personal creative director." },
  { icon: "chart",     title: "Recruiter Analytics",    desc: "See who's viewing your portfolio, which sections hold attention, and when to follow up." },
  { icon: "target",    title: "Intelligent Branding",   desc: "Three distinct moods — Minimalist, Corporate, Creative — to match any industry or role." },
];

const STATS = [
  { value: "240%", label: "More profile views" },
  { value: "10k+", label: "Portfolios created" },
  { value: "Top 100", label: "Companies hiring" },
];

const MOODS = [
  { name: "Minimalist", accent: "#374151", bg: "#ffffff", surface: "#f9fafb", desc: "Clean lines, maximum clarity" },
  { name: "Corporate",  accent: "#1d4ed8", bg: "#eff6ff", surface: "#dbeafe", desc: "Professional authority" },
  { name: "Creative",   accent: "#7c3aed", bg: "#faf5ff", surface: "#ede9fe", desc: "Bold, distinct, memorable" },
];

function cardHover(el, on) {
  el.style.transform = on ? "translateY(-4px)" : "";
  el.style.boxShadow = on ? `0 12px 40px rgba(70,72,212,0.11)` : "";
  el.style.borderColor = on ? PB : BD;
}

function Nav({ onLogin, onSeeker }) {
  const NAV = ["Discover", "Analytics", "Templates", "Help"];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(249,249,255,0.9)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${BD}`, padding: "0 40px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: T1, letterSpacing: "-0.02em" }}>
        prolio<span style={{ color: P }}>.</span>
      </div>
      <nav style={{ display: "flex", gap: 30, alignItems: "center" }}>
        {NAV.map(l => (
          <a key={l} href="#" onClick={e => e.preventDefault()}
            style={{ fontSize: 14, color: T3, textDecoration: "none", fontWeight: 500, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = T1)}
            onMouseLeave={e => (e.currentTarget.style.color = T3)}>
            {l}
          </a>
        ))}
      </nav>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={onLogin}
          style={{ background: "transparent", border: "none", color: T3, fontSize: 14, fontWeight: 500, cursor: "pointer", padding: "7px 14px", borderRadius: 8, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.background = "#f3f3fa"; }}
          onMouseLeave={e => { e.currentTarget.style.color = T3; e.currentTarget.style.background = "transparent"; }}>
          Sign In
        </button>
        <button onClick={onSeeker}
          style={{ background: P, color: "#fff", border: "none", borderRadius: 10, padding: "9px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", boxShadow: `0 4px 16px rgba(70,72,212,0.32)` }}
          onMouseEnter={e => { e.currentTarget.style.background = "#3a3cbf"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 22px rgba(70,72,212,0.42)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = P; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 16px rgba(70,72,212,0.32)"; }}>
          Get Started Free
        </button>
      </div>
    </header>
  );
}

function Hero({ onSeeker, onRecruiter }) {
  return (
    <section style={{ padding: "96px 40px 80px", maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: PL, border: `1px solid ${PB}`, borderRadius: 100, padding: "5px 16px", marginBottom: 28 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: P, display: "inline-block" }} />
        <span style={{ fontSize: 12.5, fontWeight: 600, color: P, letterSpacing: "0.04em" }}>AI-Powered Portfolio Platform</span>
      </div>

      <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(38px, 5vw, 64px)", fontWeight: 700, color: T1, lineHeight: 1.1, letterSpacing: "-0.025em", marginBottom: 22, maxWidth: 760, margin: "0 auto 22px" }}>
        Your career narrative,<br />
        <span style={{ color: P }}>elevated to editorial.</span>
      </h1>

      <p style={{ fontSize: 18, color: T3, lineHeight: 1.7, maxWidth: 540, margin: "0 auto 44px", fontWeight: 400 }}>
        Transform your resume into an AI-powered living portfolio that speaks directly to hiring decision-makers — and adapts to every opportunity.
      </p>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 72 }}>
        <button onClick={onSeeker}
          style={{ background: P, color: "#fff", border: "none", borderRadius: 12, padding: "15px 34px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 26px rgba(70,72,212,0.36)", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 8 }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 34px rgba(70,72,212,0.46)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 6px 26px rgba(70,72,212,0.36)"; }}>
          Create My Portfolio <Icon name="arrow" size={16} color="#fff" />
        </button>
        <button onClick={onRecruiter}
          style={{ background: S0, color: T2, border: `1px solid rgba(0,0,0,0.1)`, borderRadius: 12, padding: "15px 30px", fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", transition: "all 0.18s", display: "flex", alignItems: "center", gap: 8 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = PB; e.currentTarget.style.color = P; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)"; e.currentTarget.style.color = T2; e.currentTarget.style.transform = ""; }}>
          <Icon name="people" size={15} color="currentColor" /> I'm a Recruiter
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ padding: "0 36px", borderRight: i < STATS.length - 1 ? `1px solid ${BD}` : "none", textAlign: "center" }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: T1, fontFamily: "var(--serif)", letterSpacing: "-0.03em" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: T3, marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section style={{ background: S0, padding: "80px 40px", borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: P, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Why Prolio</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 700, color: T1, letterSpacing: "-0.02em" }}>
            Intelligence meets editorial craft
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i}
              style={{ background: BG, border: `1px solid ${BD}`, borderRadius: 20, padding: "28px 26px", transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s", cursor: "default" }}
              onMouseEnter={e => cardHover(e.currentTarget, true)}
              onMouseLeave={e => cardHover(e.currentTarget, false)}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: PL, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <Icon name={f.icon} size={22} color={P} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T1, marginBottom: 10, letterSpacing: "-0.01em" }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: T3, lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MoodShowcase() {
  const [active, setActive] = useState(1);
  return (
    <section style={{ padding: "80px 40px", background: BG }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: P, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Portfolio Moods</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 700, color: T1, letterSpacing: "-0.02em" }}>
            Match any industry, any role
          </h2>
        </div>
        <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          {MOODS.map((m, i) => (
            <div key={i} onClick={() => setActive(i)}
              style={{ flex: "1 1 260px", maxWidth: 320, background: S0, border: `2px solid ${i === active ? m.accent : BD}`, borderRadius: 22, padding: "28px 24px", cursor: "pointer", transition: "all 0.22s", boxShadow: i === active ? `0 10px 36px ${m.accent}20` : "0 2px 10px rgba(0,0,0,0.04)" }}>
              <div style={{ width: "100%", height: 108, borderRadius: 14, background: m.bg, border: `1px solid rgba(0,0,0,0.05)`, marginBottom: 20, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 16, left: 20, width: 44, height: 6, borderRadius: 3, background: m.accent, opacity: 0.85 }} />
                <div style={{ position: "absolute", top: 30, left: 20, width: 68, height: 3, borderRadius: 2, background: m.accent, opacity: 0.28 }} />
                <div style={{ position: "absolute", top: 40, left: 20, width: 52, height: 3, borderRadius: 2, background: m.accent, opacity: 0.18 }} />
                <div style={{ position: "absolute", top: 18, right: 20, width: 26, height: 26, borderRadius: "50%", background: m.surface, border: `2px solid ${m.accent}40` }} />
                <div style={{ position: "absolute", bottom: 14, left: 20, right: 20, height: 26, borderRadius: 7, background: m.accent, opacity: 0.08 }} />
                <div style={{ position: "absolute", bottom: 14, left: 20, width: "55%", height: 26, borderRadius: 7, background: m.accent, opacity: 0.14 }} />
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: T1, marginBottom: 5 }}>{m.name}</div>
              <div style={{ fontSize: 13, color: T3, lineHeight: 1.5 }}>{m.desc}</div>
              {i === active && (
                <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: m.accent, display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon name="check" size={12} color={m.accent} /> Selected
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const items = [
    { quote: "Prolio turned my flat resume into something I'm genuinely proud to share.", name: "Sarah K.", role: "Product Manager at Stripe" },
    { quote: "Got 3x more recruiter responses in the first two weeks after switching.", name: "James R.", role: "Senior Engineer at Figma" },
    { quote: "The AI actually captures how I think and work — not just what I've done.", name: "Priya M.", role: "Design Lead at Notion" },
  ];
  return (
    <section style={{ background: S0, padding: "80px 40px", borderTop: `1px solid ${BD}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: P, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Testimonials</div>
          <h2 style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 700, color: T1, letterSpacing: "-0.02em" }}>
            Trusted by ambitious professionals
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {items.map((t, i) => (
            <div key={i} style={{ background: BG, border: `1px solid ${BD}`, borderRadius: 20, padding: "28px 26px" }}>
              <div style={{ fontSize: 22, color: PB, fontFamily: "var(--serif)", marginBottom: 14, lineHeight: 1 }}>"</div>
              <p style={{ fontSize: 14.5, color: T2, lineHeight: 1.7, marginBottom: 22, fontStyle: "italic" }}>{t.quote}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: PL, border: `1px solid ${PB}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="user" size={16} color={P} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: T3, marginTop: 2 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ onSeeker }) {
  return (
    <section style={{ background: P, padding: "96px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 60% 50%, rgba(255,255,255,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 600, margin: "0 auto", position: "relative" }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 40, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.025em", marginBottom: 18, lineHeight: 1.18 }}>
          Ready to elevate your career narrative?
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, marginBottom: 40 }}>
          Join 10,000+ professionals who've transformed their career stories with Prolio.
        </p>
        <button onClick={onSeeker}
          style={{ background: "#ffffff", color: P, border: "none", borderRadius: 12, padding: "16px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", transition: "all 0.18s", display: "inline-flex", alignItems: "center", gap: 8 }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.28)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)"; }}>
          Create My Portfolio Free <Icon name="arrow" size={16} color={P} />
        </button>
      </div>
    </section>
  );
}

function LandingPage({ onSeeker, onRecruiter, onLogin }) {
  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "var(--sans)" }}>
      <Nav onLogin={onLogin} onSeeker={onSeeker} />
      <Hero onSeeker={onSeeker} onRecruiter={onRecruiter} />
      <Features />
      <MoodShowcase />
      <SocialProof />
      <CtaSection onSeeker={onSeeker} />
      <footer style={{ background: BG, borderTop: `1px solid ${BD}`, padding: "28px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 700, color: T1 }}>prolio<span style={{ color: P }}>.</span></div>
        <div style={{ fontSize: 12.5, color: T3 }}>© 2025 Prolio — AI-powered career portfolios</div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" onClick={e => e.preventDefault()} style={{ fontSize: 12.5, color: T3, textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = T1)} onMouseLeave={e => (e.currentTarget.style.color = T3)}>{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
