import Icon from "../ui/Icon";

function LandingPage({ onSeeker, onRecruiter, onLogin }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 12 }}>
          prolio<span style={{ color: "var(--accent)" }}>.</span>
        </div>
        <div style={{ fontSize: 17, color: "var(--text3)", maxWidth: 420, lineHeight: 1.6 }}>
          Your AI-powered portfolio — built from your resume, LinkedIn, and GitHub.
        </div>
      </div>

      <div style={{ display: "flex", gap: 20, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
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

export default LandingPage;
