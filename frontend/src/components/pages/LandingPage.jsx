const P    = "var(--accent)";
const T1   = "var(--text)";
const T2   = "var(--text2)";
const T3   = "var(--text3)";
const BG   = "var(--bg)";
const BG1  = "var(--bg1)";
const BG2  = "var(--bg2)";
const BGC  = "var(--bg3)";
const BGH  = "var(--bg3)";
const BGFIX = "var(--bg4)";
const BD   = "var(--line)";
const glass = {
  background: "rgba(13,14,20,0.70)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid var(--line)",
  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
};

function Nav({ onLogin, onGetStarted }) {
  return (
    <nav style={{
      background: "rgba(18,19,25,0.85)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)",
      position: "sticky", top: 0, zIndex: 50, height: 80,
      display: "flex", alignItems: "center",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 40px", width: "100%", maxWidth: 1280, margin: "0 auto",
      }}>
        <span style={{ fontFamily: "var(--serif)", color: P, fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1 }}>
          Prolio
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onLogin}
            style={{ background: "none", border: "none", color: T2, fontSize: 14, fontWeight: 600, padding: "8px 16px", cursor: "pointer", fontFamily: "var(--sans)", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = P}
            onMouseLeave={e => e.currentTarget.style.color = T2}>
            Sign In
          </button>
          <button onClick={onGetStarted}
            style={{ background: P, color: "#fff", border: "none", borderRadius: 100, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)", boxShadow: "0 0 20px 4px rgba(129,140,248,0.20)", transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Get Started Free
          </button>
        </div>
      </div>
    </nav>
  );
}

function ProfileIllustration() {
  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", paddingBottom: 32 }}>
      <div className="float" style={{
        ...glass, borderRadius: 20, padding: 10,
        transform: "rotate(2deg)", transition: "transform 0.5s ease", cursor: "default",
        width: 260,
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "rotate(0deg)"}
        onMouseLeave={e => e.currentTarget.style.transform = "rotate(2deg)"}
      >
        {/* Avatar area */}
        <div style={{
          width: "100%", height: 240, borderRadius: 12, overflow: "hidden",
          background: "linear-gradient(160deg, rgba(129,140,248,0.08) 0%, rgba(129,140,248,0.15) 50%, rgba(129,140,248,0.08) 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: "50%",
            background: "rgba(129,140,248,0.12)", border: "2px solid rgba(129,140,248,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <svg viewBox="0 0 60 60" width="60" height="60" aria-hidden="true">
              <circle cx="30" cy="21" r="11" fill="var(--accent)" opacity="0.85" />
              <path d="M4 60 Q7 37 30 32 Q53 37 56 60 Z" fill="var(--accent)" opacity="0.75" />
            </svg>
          </div>
          <div style={{ width: 110, height: 11, borderRadius: 6, background: "rgba(255,255,255,0.10)", marginBottom: 7 }} />
          <div style={{ width: 76, height: 9, borderRadius: 5, background: "rgba(129,140,248,0.20)" }} />
        </div>
        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "12px 8px 6px" }}>
          {["AI Engineer", "Python", "Machine Learning"].map(tag => (
            <span key={tag} style={{
              background: BGFIX, border: "1px solid rgba(129,140,248,0.18)",
              color: P, borderRadius: 100, padding: "4px 11px",
              fontSize: 11, fontWeight: 600, fontFamily: "var(--sans)",
            }}>{tag}</span>
          ))}
        </div>
        {/* Status */}
        <div style={{
          margin: "4px 8px 8px", padding: "9px 12px", background: BG2,
          borderRadius: 10, display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0d9488", flexShrink: 0, display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T2, fontFamily: "var(--sans)" }}>Portfolio Live</span>
        </div>
      </div>

      {/* Floating chip */}
      <div style={{
        position: "absolute", bottom: 0, right: -10,
        ...glass, borderRadius: 12, padding: "12px 18px",
        display: "flex", alignItems: "center", gap: 10,
        boxShadow: "0 8px 24px -6px rgba(129,140,248,0.18)",
      }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: BGFIX, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>🎯</span>
        </div>
        <div>
          <div style={{ fontSize: 11, color: T3, fontFamily: "var(--sans)", marginBottom: 1 }}>AI Gap Analysis</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T1, fontFamily: "var(--serif)" }}>Strong Fit</div>
        </div>
      </div>
    </div>
  );
}

function Hero({ onGetStarted, onViewExamples }) {
  return (
    <section style={{ padding: "96px 40px 128px", maxWidth: 1280, margin: "0 auto", position: "relative", overflow: "hidden" }}>
      {/* Ambient glow orb — top right */}
      <div style={{
        position: "absolute",
        top: -60,
        right: -60,
        width: 480,
        height: 480,
        borderRadius: "50%",
        background: "rgba(129,140,248,0.06)",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      {/* Ambient glow orb — bottom left */}
      <div style={{
        position: "absolute",
        bottom: -80,
        left: -80,
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "rgba(129,140,248,0.06)",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 24, alignItems: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: BG2, padding: "8px 16px", borderRadius: 100, width: "fit-content", border: `1px solid ${BD}` }}>
            <span style={{ fontSize: 16, color: P }}>✦</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: T2, fontFamily: "var(--sans)" }}>AI-Powered Career Portfolios</span>
          </div>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, color: T1, maxWidth: 640, margin: 0 }}>
            The Future of Your Career,<br />
            <em style={{ color: P, fontStyle: "italic" }}>Curated by AI.</em>
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: T2, maxWidth: 520, margin: 0, fontFamily: "var(--sans)" }}>
            Upload your resume and LinkedIn. Prolio builds your live portfolio, scores job fit, writes cover letters, and preps you for interviews — from your actual background.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 16 }}>
            <button onClick={onGetStarted}
              style={{ background: P, color: "#fff", border: "none", borderRadius: 100, padding: "16px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)", boxShadow: "0 0 20px 4px rgba(129,140,248,0.20)", transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Start Building Free
            </button>
            <button onClick={onViewExamples}
              style={{ background: "transparent", color: T1, border: "1px solid var(--line2)", borderRadius: 100, padding: "16px 32px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.background = BG1; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.background = "transparent"; }}>
              See How It Works
            </button>
          </div>
        </div>

        <ProfileIllustration />
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
          Everything You Need to Land the Role
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: T2, maxWidth: 640, margin: "0 auto", fontFamily: "var(--sans)" }}>
          From building your portfolio to acing the interview — Prolio's AI works from your actual resume and experience, not templates.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, gridAutoRows: "minmax(250px, auto)" }}>
        <div style={{ gridColumn: "span 2", ...glass, borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden", minHeight: 250 }}>
          <div style={{ position: "relative", zIndex: 1, maxWidth: 440 }}>
            <FeatIcon>⊞</FeatIcon>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12 }}>AI Portfolio Builder</h3>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: T2, fontFamily: "var(--sans)", margin: 0 }}>Upload your resume and LinkedIn PDF. Prolio extracts your experience, projects, and skills and publishes a live portfolio — automatically. Share a single link with recruiters.</p>
          </div>
          <div style={{ position: "absolute", right: -80, bottom: -80, width: 320, height: 320, background: "rgba(129,140,248,0.06)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
        </div>

        <div style={{ ...glass, borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", minHeight: 250 }}>
          <FeatIcon>🎯</FeatIcon>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12 }}>JD Fit & Gap Analysis</h3>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: T2, fontFamily: "var(--sans)", margin: 0 }}>Paste any job description and get your ATS score, matching keywords, and a clear list of what's missing.</p>
        </div>

        <div style={{ ...glass, borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", minHeight: 250 }}>
          <FeatIcon>📄</FeatIcon>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12 }}>AI Cover Letters</h3>
          <p style={{ fontSize: 16, lineHeight: 1.5, color: T2, fontFamily: "var(--sans)", margin: 0 }}>Generate tailored, editable cover letters grounded in your actual background — not generic boilerplate.</p>
        </div>

        <div style={{ gridColumn: "span 2", ...glass, borderRadius: 12, padding: 32, display: "flex", flexDirection: "row", alignItems: "center", gap: 24, minHeight: 250 }}>
          <div style={{ flex: 1 }}>
            <FeatIcon>🧠</FeatIcon>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12 }}>Interview Prep</h3>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: T2, marginBottom: 24, fontFamily: "var(--sans)" }}>Personalized interview questions with talking points drawn from your actual profile — behavioral, technical, system design, and more.</p>
          </div>
          <div style={{ flex: 1, height: 192, background: BGC, borderRadius: 8, border: `1px solid ${BD}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "80%" }}>
              {["Behavioral", "Technical", "System Design"].map((t, i) => (
                <div key={t} style={{ background: BG1, borderRadius: 8, padding: "10px 14px", border: `1px solid ${BD}`, display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: ["var(--accent)", "#0d9488", "#d97706"][i], flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: T2, fontFamily: "var(--sans)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "var(--bg1)", borderTop: "1px solid var(--line)", padding: "40px", marginTop: 48 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1280, margin: "0 auto", gap: 24, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 700, color: T1 }}>Prolio</span>
        <span style={{ fontSize: 13, color: T3, fontFamily: "var(--sans)" }}>© 2025 Prolio. All rights reserved.</span>
      </div>
    </footer>
  );
}

function LandingPage({ onSeeker, onLogin }) {
  const scrollToFeatures = () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "var(--sans)" }}>
      <Nav onLogin={onLogin} onGetStarted={onSeeker || onLogin} />
      <Hero onGetStarted={onSeeker || onLogin} onViewExamples={scrollToFeatures} />
      <Features />
      <Footer />
    </div>
  );
}

export default LandingPage;
