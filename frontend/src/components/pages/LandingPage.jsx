// Design tokens — Prolio Light Luxury (mirrors Stitch design system)
const P    = "#4648d4";
const T1   = "#111c2d";
const T2   = "#464554";
const T3   = "#767586";
const BG   = "#f9f9ff";
const BG1  = "#ffffff";
const BG2  = "#f0f3ff";
const BGC  = "#e7eeff";
const BGH  = "#dee8ff";
const BGFIX = "#e1e0ff";
const BD   = "rgba(0,0,0,0.06)";
const glass = {
  background: "rgba(255,255,255,0.70)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: `1px solid ${BD}`,
  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
};

function Nav({ onLogin }) {
  return (
    <nav style={{
      background: "rgba(249,249,255,0.85)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.05)",
      position: "sticky", top: 0, zIndex: 50, height: 80,
      display: "flex", alignItems: "center",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 40px", width: "100%", maxWidth: 1280, margin: "0 auto",
      }}>
        <span style={{ fontFamily: "var(--serif)", color: P, fontSize: 40, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
          Prolio
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {["Discover", "Analytics", "Templates", "Help"].map(l => (
            <a key={l} href="#" onClick={e => e.preventDefault()}
              style={{ color: T2, textDecoration: "none", fontSize: 16, transition: "color 0.15s", fontFamily: "var(--sans)" }}
              onMouseEnter={e => e.target.style.color = P}
              onMouseLeave={e => e.target.style.color = T2}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onLogin} style={{ background: "none", border: "none", color: T2, fontSize: 14, fontWeight: 600, padding: "8px 16px", cursor: "pointer", fontFamily: "var(--sans)", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = P}
            onMouseLeave={e => e.currentTarget.style.color = T2}>
            Sign In
          </button>
          <button onClick={onLogin} style={{ background: P, color: "#fff", border: "none", borderRadius: 100, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)", boxShadow: "0 0 20px 4px rgba(70,72,212,0.15)", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Upgrade
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero({ onLogin, onViewExamples }) {
  return (
    <section style={{ padding: "96px 40px 128px", maxWidth: 1280, margin: "0 auto", position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: "50%", height: "100%",
        background: "radial-gradient(ellipse at top right, rgba(225,224,255,0.35), transparent 65%)",
        filter: "blur(40px)", opacity: 0.6, zIndex: 0, pointerEvents: "none",
      }} />
      <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 24, alignItems: "center", position: "relative", zIndex: 1 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: BG2, padding: "8px 16px", borderRadius: 100, width: "fit-content", border: `1px solid ${BD}` }}>
            <span style={{ fontSize: 16, color: P }}>✦</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: T2, fontFamily: "var(--sans)" }}>Introducing AI-Driven Portfolios</span>
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: T1, maxWidth: 640, margin: 0 }}>
            The Future of Your Career,<br />
            <em style={{ color: P, fontStyle: "italic" }}>Curated by AI.</em>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: T2, maxWidth: 520, margin: 0, fontFamily: "var(--sans)" }}>
            Elevate your professional narrative with a dynamic, editorial-grade portfolio that adapts to the opportunities you seek. Designed for high-achieving professionals.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 16 }}>
            <button onClick={onLogin}
              style={{ background: P, color: "#fff", border: "none", borderRadius: 100, padding: "16px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)", boxShadow: "0 0 20px 4px rgba(70,72,212,0.15)", transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Start Building Free
            </button>
            <button onClick={onViewExamples}
              style={{ background: "transparent", color: T1, border: "1px solid rgba(0,0,0,0.05)", borderRadius: 100, padding: "16px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(70,72,212,0.3)"; e.currentTarget.style.background = BG1; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)"; e.currentTarget.style.background = "transparent"; }}>
              View Editorial Examples
            </button>
          </div>
        </div>

        {/* Right column — rotated glass card */}
        <div style={{ position: "relative", paddingBottom: 32 }}>
          <div style={{ ...glass, borderRadius: 12, padding: 8, transform: "rotate(2deg)", transition: "transform 0.5s ease", cursor: "default" }}
            onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg)"}
            onMouseLeave={e => e.currentTarget.style.transform = "rotate(2deg)"}>
            <div style={{ width: "100%", aspectRatio: "4/5", borderRadius: 8, overflow: "hidden", background: `linear-gradient(135deg, ${BGH} 0%, ${BG2} 100%)`, position: "relative" }}>
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80"
                alt="Professional headshot"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", background: `linear-gradient(to top, rgba(222,232,255,0.6), transparent)`, pointerEvents: "none" }} />
            </div>
            {/* Floating badge */}
            <div style={{
              position: "absolute", bottom: -24, left: -24,
              ...glass, borderRadius: 12, padding: "16px 24px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: BGFIX, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: P, fontSize: 16, fontWeight: 700 }}>↑</span>
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 500, color: T2, margin: 0, fontFamily: "var(--sans)" }}>Profile Views</p>
                <p style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, margin: 0 }}>+240%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatIcon({ children }) {
  return (
    <div style={{ width: 48, height: 48, borderRadius: "50%", background: BGH, border: `1px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, fontSize: 20, flexShrink: 0 }}>
      {children}
    </div>
  );
}

function Features() {
  return (
    <section id="features" style={{ padding: "48px 40px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em", color: T1, marginBottom: 16, margin: "0 0 16px" }}>
          Crafted for Excellence
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: T2, maxWidth: 640, margin: "0 auto", fontFamily: "var(--sans)" }}>
          Move beyond static resumes. Our AI analyzes your experience and constructs a tailored, magazine-quality presentation.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, gridAutoRows: "minmax(250px, auto)" }}>
        {/* Feature 1 — col-span-2 */}
        <div style={{ gridColumn: "span 2", ...glass, borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", minHeight: 250 }}>
          <div style={{ position: "relative", zIndex: 1, maxWidth: 440 }}>
            <FeatIcon>⊞</FeatIcon>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12 }}>Fluid Editorial Layouts</h3>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: T2, fontFamily: "var(--sans)", margin: 0 }}>Dynamic grids that automatically adjust to showcase your strongest assets, resembling a premium digital publication rather than a template.</p>
          </div>
          <div style={{ position: "absolute", right: -80, bottom: -80, width: 320, height: 320, background: "rgba(225,224,255,0.30)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        </div>

        {/* Feature 2 */}
        <div style={{ ...glass, borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", minHeight: 250 }}>
          <FeatIcon>🧠</FeatIcon>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12 }}>AI Narrative Engine</h3>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: T2, fontFamily: "var(--sans)", margin: 0 }}>Our AI doesn't just format; it rewrites your bullet points into compelling professional narratives.</p>
        </div>

        {/* Feature 3 */}
        <div style={{ ...glass, borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", minHeight: 250 }}>
          <FeatIcon>📊</FeatIcon>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12 }}>Deep Analytics</h3>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: T2, fontFamily: "var(--sans)", margin: 0 }}>Track exactly which sections of your portfolio hold the attention of recruiters and executives.</p>
        </div>

        {/* Feature 4 — col-span-2 */}
        <div style={{ gridColumn: "span 2", ...glass, borderRadius: 12, padding: 32, display: "flex", flexDirection: "row", alignItems: "center", gap: 24, minHeight: 250 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12 }}>Zero-Friction Branding</h3>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: T2, marginBottom: 24, fontFamily: "var(--sans)" }}>Select a mood—Minimalist, Corporate, or Creative—and watch the typography, color palette, and spacing align perfectly across your entire presence.</p>
            <button style={{ background: "none", border: "none", color: P, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, padding: 0, fontFamily: "var(--sans)" }}>
              Explore Brand Styles →
            </button>
          </div>
          <div style={{ flex: 1, height: 192, background: BGC, borderRadius: 8, border: `1px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: BG1, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontSize: 24, color: P }}>A</div>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: BG, border: `1px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: T3, fontFamily: "var(--sans)" }}>a</div>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: BGFIX }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: BG, borderTop: "1px solid rgba(0,0,0,0.05)", padding: "48px 40px", marginTop: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1280, margin: "0 auto", gap: 24, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1 }}>Prolio</span>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Career Advice", "Media Kit"].map(l => (
            <a key={l} href="#" onClick={e => e.preventDefault()}
              style={{ color: T2, textDecoration: "none", fontSize: 14, fontWeight: 600, transition: "color 0.15s", fontFamily: "var(--sans)" }}
              onMouseEnter={e => e.target.style.color = P}
              onMouseLeave={e => e.target.style.color = T2}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 14, color: "#5c5f60", fontFamily: "var(--sans)" }}>© 2024 Prolio Excellence. All rights reserved.</span>
      </div>
    </footer>
  );
}

function LandingPage({ onLogin }) {
  const scrollToFeatures = () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "var(--sans)" }}>
      <Nav onLogin={onLogin} />
      <Hero onLogin={onLogin} onViewExamples={scrollToFeatures} />
      <Features />
      <Footer />
    </div>
  );
}

export default LandingPage;
