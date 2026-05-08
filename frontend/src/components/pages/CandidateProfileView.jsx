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
const BGFIX = "var(--bg4)";
const BD   = "var(--line)";
const BD2  = "var(--line)";
const card = { background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: 12 };

function TopNav({ onBack }) {
  return (
    <nav style={{
      background: "rgba(18,19,25,0.85)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 40px", height: 80, position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 700, color: P }}>Prolio</span>
        <div style={{ display: "flex", gap: 24, marginLeft: 24 }}>
          {["Discover", "Analytics", "Templates", "Help"].map((l, i) => (
            <a key={l} href="#" onClick={e => e.preventDefault()}
              style={{ color: i === 0 ? P : T2, textDecoration: "none", fontSize: 16, fontFamily: "var(--sans)", fontWeight: i === 0 ? 700 : 400, borderBottom: i === 0 ? `2px solid ${P}` : "none", paddingBottom: i === 0 ? 4 : 0, transition: "color 0.15s" }}
              onMouseEnter={e => { if (i > 0) e.target.style.color = P; }}
              onMouseLeave={e => { if (i > 0) e.target.style.color = T2; }}>{l}</a>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <button style={{ background: "none", border: "none", color: T2, fontSize: 16, cursor: "pointer", fontFamily: "var(--sans)", transition: "color 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.color = P}
          onMouseLeave={e => e.currentTarget.style.color = T2}>
          Sign In
        </button>
        <button style={{ background: P, color: "#fff", border: "none", borderRadius: 4, padding: "8px 24px", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
          Upgrade
        </button>
      </div>
    </nav>
  );
}

const DEFAULT_CANDIDATE = {
  name: "Elena Rostova",
  title: "SVP, Global Marketing",
  availability: "Immediate",
  location: "London, UK",
  targetComp: "£220k Base",
  relocation: "Yes (EU/US)",
  summary: "Visionary marketing executive with 15+ years of experience scaling global brands in the fintech and SaaS sectors. Proven track record of orchestrating high-ROI, multi-channel campaigns and building robust, cross-functional teams that consistently exceed aggressive revenue targets. Adept at navigating complex market dynamics with a data-driven, yet highly creative approach.",
  skills: ["Brand Strategy", "Go-To-Market", "Team Leadership", "Performance Mktg", "Budget Allocation", "Digital Transformation"],
  highlightSkills: new Set(["Team Leadership", "Digital Transformation"]),
  experience: [
    { role: "SVP, Global Marketing", org: "FinTech Innovations Ltd.", period: "2019 - Present", active: true, desc: "Spearheaded the rebranding initiative that resulted in a 40% increase in brand recognition across EMEA. Managed a global marketing budget of $15M, optimizing spend across digital, events, and PR to achieve a 25% reduction in CAC while scaling enterprise lead generation by 60%.", tags: ["Brand Strategy", "Budget Mgt"] },
    { role: "VP of Marketing", org: "DataCloud Corp", period: "2015 - 2019", active: false, desc: "Built the marketing department from the ground up during a high-growth phase. Launched three major product lines and orchestrated the marketing strategy for the successful Series C funding round.", tags: [] },
    { role: "Director of Digital Strategy", org: "OmniMedia Group", period: "2010 - 2015", active: false, desc: "Led digital transformation initiatives for Fortune 500 clients, focusing on data-driven customer acquisition and omnichannel marketing frameworks.", tags: [] },
  ],
  education: [
    { degree: "MBA, Marketing Strategy", school: "London Business School", period: "2008 - 2010" },
    { degree: "BSc, Economics", school: "University of Oxford", period: "2004 - 2008" },
  ],
};

function LeftSidebar({ candidate, onShortlist, shortlisted }) {
  const initials = candidate.name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <aside style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Hero card */}
      <div style={{ ...card, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: 128, height: 128, borderRadius: "50%", background: BGFIX, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--serif)", fontSize: 44, fontWeight: 700, color: P, marginBottom: 12, border: `2px solid ${BGC}` }}>
          {initials}
        </div>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em", color: T1, marginBottom: 4, margin: "0 0 4px" }}>{candidate.name}</h1>
        <p style={{ fontFamily: "var(--sans)", fontSize: 18, color: P, marginBottom: 16, margin: "0 0 16px" }}>{candidate.title}</p>
        <div style={{ display: "flex", gap: 8, width: "100%", marginTop: 16 }}>
          <button style={{ flex: 1, background: P, color: "#fff", border: "none", borderRadius: 4, padding: "12px 0", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            ✉ Message
          </button>
          <button style={{ flex: 1, background: "transparent", color: P, border: `1px solid ${BD}`, borderRadius: 4, padding: "12px 0", fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = BG2}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            ↓ Resume
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div style={{ ...card, padding: 24 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T3, fontSize: 18 }}>≡</span> Executive Summary
        </h2>
        <p style={{ fontFamily: "var(--sans)", fontSize: 16, lineHeight: 1.5, color: T2, margin: 0, textAlign: "justify" }}>{candidate.summary}</p>
      </div>

      {/* Core Competencies */}
      <div style={{ ...card, padding: 24 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T3, fontSize: 18 }}>✓</span> Core Competencies
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {candidate.skills.map(skill => {
            const hl = candidate.highlightSkills.has(skill);
            return (
              <span key={skill} style={{ background: hl ? "var(--accent-d)" : BGC, color: hl ? P : T1, border: `1px solid ${hl ? "var(--accent-b)" : BD}`, padding: "4px 12px", borderRadius: 4, fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {skill}
              </span>
            );
          })}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ ...card, padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { label: "Availability", value: candidate.availability },
          { label: "Location", value: candidate.location },
          { label: "Target Comp", value: candidate.targetComp },
          { label: "Willing to Relocate", value: candidate.relocation },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500, color: T3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4, margin: "0 0 4px" }}>{label}</p>
            <p style={{ fontFamily: "var(--sans)", fontSize: 16, color: T1, margin: 0 }}>{value}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}

function RightContent({ candidate }) {
  return (
    <section style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Professional Trajectory */}
      <div style={{ ...card, padding: 48 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em", color: T1, borderBottom: `1px solid ${BD}`, paddingBottom: 16, marginBottom: 48, margin: "0 0 0 0" }}>
          Professional Trajectory
        </h2>
        {/* Timeline */}
        <div style={{ position: "relative", borderLeft: `1px solid ${BD}`, marginLeft: 16, display: "flex", flexDirection: "column", gap: 48, paddingTop: 4 }}>
          {candidate.experience.map((exp, idx) => (
            <div key={idx} style={{ position: "relative", paddingLeft: 32 }}>
              <div style={{
                position: "absolute", width: 12, height: 12, borderRadius: "50%", left: -6, top: 8,
                background: exp.active ? P : BGH,
                boxShadow: `0 0 0 4px ${BG1}`,
              }} />
              <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8, flexWrap: "wrap", gap: 4 }}>
                <div>
                  <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, margin: "0 0 2px" }}>{exp.role}</h3>
                  <p style={{ fontFamily: "var(--sans)", fontSize: 18, color: exp.active ? P : T2, margin: 0 }}>{exp.org}</p>
                </div>
                <span style={{ fontFamily: "var(--sans)", fontSize: 14, fontWeight: 600, color: T3 }}>{exp.period}</span>
              </div>
              <p style={{ fontFamily: "var(--sans)", fontSize: 16, lineHeight: 1.5, color: T2, marginBottom: exp.tags.length ? 16 : 0 }}>{exp.desc}</p>
              {exp.tags.length > 0 && (
                <div style={{ display: "flex", gap: 8 }}>
                  {exp.tags.map(tag => (
                    <span key={tag} style={{ fontFamily: "var(--sans)", fontSize: 12, color: "#5c5f60", background: BG2, padding: "4px 8px", border: `1px solid rgba(0,0,0,0.04)`, borderRadius: 4 }}>{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Education + Recruiter Notes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Education */}
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, borderBottom: `1px solid ${BD}`, paddingBottom: 8, marginBottom: 16 }}>Education</h3>
          {candidate.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: i < candidate.education.length - 1 ? 16 : 0 }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: 18, fontWeight: 700, color: T1, margin: "0 0 2px" }}>{edu.degree}</p>
              <p style={{ fontFamily: "var(--sans)", fontSize: 16, color: P, margin: "0 0 2px" }}>{edu.school}</p>
              <p style={{ fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500, color: T3, margin: 0 }}>{edu.period}</p>
            </div>
          ))}
        </div>

        {/* Recruiter Notes */}
        <div style={{ ...card, padding: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, padding: 16, opacity: 0.10, pointerEvents: "none" }}>
            <span style={{ fontFamily: "var(--serif)", fontSize: 64, color: T1 }}>"</span>
          </div>
          <h3 style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1, borderBottom: `1px solid ${BD}`, paddingBottom: 8, marginBottom: 16, position: "relative", zIndex: 1 }}>Recruiter Notes</h3>
          <p style={{ fontFamily: "var(--sans)", fontSize: 16, lineHeight: 1.5, color: T2, fontStyle: "italic", position: "relative", zIndex: 1, margin: "0 0 16px" }}>
            "Elena is a powerhouse. Presents incredibly well, possesses deep industry knowledge, and has a clear vision for how marketing drives enterprise value. Highly recommended for C-suite roles requiring immediate impact."
          </p>
          <p style={{ fontFamily: "var(--sans)", fontSize: 12, fontWeight: 500, color: T3, position: "relative", zIndex: 1, margin: 0 }}>— Interviewed by J. Montgomery (Oct 12)</p>
        </div>
      </div>
    </section>
  );
}

function CandidateProfileView({ profile, onBack, onShortlist }) {
  const [shortlisted, setShortlisted] = useState(false);
  const candidate = { ...DEFAULT_CANDIDATE, ...(profile || {}) };

  const handleShortlist = () => {
    setShortlisted(s => !s);
    onShortlist?.();
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "var(--sans)" }}>
      <TopNav onBack={onBack} />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 40px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        <LeftSidebar candidate={candidate} onShortlist={handleShortlist} shortlisted={shortlisted} />
        <RightContent candidate={candidate} />
      </main>
      <footer style={{ background: BG, borderTop: "1px solid rgba(0,0,0,0.05)", padding: "48px 40px", marginTop: 48 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1280, margin: "0 auto", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 500, color: T1 }}>Prolio</span>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Career Advice", "Media Kit"].map(l => (
              <a key={l} href="#" onClick={e => e.preventDefault()}
                style={{ color: T2, textDecoration: "none", fontSize: 14, fontWeight: 600, fontFamily: "var(--sans)", transition: "color 0.15s" }}
                onMouseEnter={e => e.target.style.color = P}
                onMouseLeave={e => e.target.style.color = T2}>{l}</a>
            ))}
          </div>
          <span style={{ fontFamily: "var(--sans)", fontSize: 14, color: "#5c5f60" }}>© 2024 Prolio Excellence. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

export default CandidateProfileView;
