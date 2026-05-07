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

function Avatar({ name, size = 72 }) {
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: PL, border: `2px solid ${PB}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <span style={{ fontFamily: "var(--serif)", fontSize: size * 0.34, fontWeight: 700, color: P }}>{initials}</span>
    </div>
  );
}

function Tag({ children, color = T3, bg = BG }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 600, color, background: bg, border: `1px solid ${BD}`, borderRadius: 100, padding: "4px 12px" }}>
      {children}
    </span>
  );
}

function StrengthCard({ icon, title, metric, desc }) {
  return (
    <div style={{ background: S0, border: `1px solid ${BD}`, borderRadius: 16, padding: "20px", flex: "1 1 180px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: PL, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={16} color={P} />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T2 }}>{title}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: T1, fontFamily: "var(--serif)", letterSpacing: "-0.02em", marginBottom: 6 }}>{metric}</div>
      <div style={{ fontSize: 12, color: T3, lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}

function ExperienceItem({ company, role, period, current, bullets }) {
  return (
    <div style={{ display: "flex", gap: 18, paddingBottom: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, flexShrink: 0, width: 20 }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: current ? P : PB, border: `2px solid ${current ? P : PB}`, flexShrink: 0, marginTop: 4 }} />
        <div style={{ flex: 1, width: 2, background: BD2, minHeight: 20, marginTop: 4 }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 2 }}>{role}</div>
            <div style={{ fontSize: 13, color: P, fontWeight: 600 }}>{company}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <span style={{ fontSize: 12, color: T3, whiteSpace: "nowrap" }}>{period}</span>
            {current && <Tag color={P} bg={PL}>Current</Tag>}
          </div>
        </div>
        {bullets && (
          <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: T2, lineHeight: 1.6, alignItems: "flex-start" }}>
                <span style={{ color: P, flexShrink: 0, fontWeight: 700, marginTop: 1 }}>•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CandidateProfileView({ profile, onBack, onShortlist }) {
  const [shortlisted, setShortlisted] = useState(false);

  const name = profile?.name || "Elena Rostova";
  const role = profile?.title || profile?.current_role || "SVP, Global Marketing";
  const location = profile?.location || "London, UK";
  const availability = "Immediate";
  const compensation = "£220k Base";
  const tagline = profile?.tagline || "15+ years of fintech & SaaS marketing leadership. Rebranding that delivered 40% brand recognition uplift across EMEA.";
  const skills = profile?.skills || ["Brand Strategy", "Go-to-Market", "Team Leadership", "Performance Marketing", "Budget Allocation", "Digital Transformation"];
  const education = profile?.education || [
    { degree: "MBA in Marketing Strategy", school: "London Business School", year: "2008" },
    { degree: "BSc Economics", school: "University of Oxford", year: "2006" },
  ];
  const experience = profile?.experience || [
    {
      company: "FinTech Innovations Ltd.",
      role: "Global Marketing Director",
      period: "2019 – Present",
      current: true,
      bullets: [
        "Led rebranding across EMEA, increasing brand recognition by 40%",
        "Scaled enterprise leads by 60% while reducing CAC by 25%",
        "Built and managed a $15M+ marketing budget across 12 markets",
      ],
    },
    {
      company: "NovaPay",
      role: "Head of Marketing",
      period: "2015 – 2019",
      bullets: [
        "Built the marketing department from scratch during high-growth phase",
        "Orchestrated omnichannel launch across 6 European markets",
      ],
    },
  ];
  const recruiterNote = profile?.tagline_note || "Elena is a powerhouse. Presents incredibly well, possesses deep industry knowledge, and has a clear vision for how marketing drives enterprise value.";

  const handleShortlist = () => {
    setShortlisted(s => !s);
    if (onShortlist) onShortlist(profile);
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "var(--sans)" }}>
      <div style={{ background: S0, borderBottom: `1px solid ${BD}`, padding: "0 40px", height: 56, display: "flex", alignItems: "center", gap: 20, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: T3, fontSize: 13, fontWeight: 500, cursor: "pointer", padding: "6px 10px", borderRadius: 8, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.color = T1; e.currentTarget.style.background = BG; }}
          onMouseLeave={e => { e.currentTarget.style.color = T3; e.currentTarget.style.background = "transparent"; }}>
          ← Talent Pool
        </button>
        <div style={{ width: 1, height: 20, background: BD }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: T1 }}>Candidate Profile</div>
        <div style={{ flex: 1 }} />
        <button
          style={{ background: "transparent", border: `1px solid ${BD2}`, color: T2, borderRadius: 10, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BD2; e.currentTarget.style.color = T2; }}>
          <Icon name="file" size={14} color="currentColor" /> Download CV
        </button>
        <button
          style={{ background: "transparent", border: `1px solid ${BD2}`, color: T2, borderRadius: 10, padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BD2; e.currentTarget.style.color = T2; }}>
          <Icon name="mail" size={14} color="currentColor" /> Contact
        </button>
        <button onClick={handleShortlist}
          style={{ background: shortlisted ? P : S0, border: `1px solid ${shortlisted ? P : BD2}`, color: shortlisted ? "#fff" : T2, borderRadius: 10, padding: "7px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s", boxShadow: shortlisted ? "0 3px 12px rgba(70,72,212,0.28)" : "none" }}>
          <Icon name="star" size={14} color={shortlisted ? "#fff" : T3} />
          {shortlisted ? "Shortlisted" : "Shortlist"}
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "36px 24px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: S0, border: `1px solid ${BD}`, borderRadius: 22, padding: "28px 24px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Avatar name={name} size={80} />
            </div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, color: T1, letterSpacing: "-0.015em", marginBottom: 5 }}>{name}</div>
            <div style={{ fontSize: 13.5, color: P, fontWeight: 600, marginBottom: 14 }}>{role}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "search", label: location },
                { icon: "zap", label: `Available: ${availability}` },
                { icon: "chart", label: compensation },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T2 }}>
                  <Icon name={icon} size={13} color={T3} /> {label}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${BD}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Open to</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {["EU Markets", "US Markets", "Remote"].map(r => <Tag key={r}>{r}</Tag>)}
              </div>
            </div>
          </div>

          <div style={{ background: S0, border: `1px solid ${BD}`, borderRadius: 20, padding: "22px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Core Skills</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {skills.map(s => <Tag key={s}>{s}</Tag>)}
            </div>
          </div>

          <div style={{ background: S0, border: `1px solid ${BD}`, borderRadius: 20, padding: "22px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Education</div>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: i < education.length - 1 ? 16 : 0, paddingBottom: i < education.length - 1 ? 16 : 0, borderBottom: i < education.length - 1 ? `1px solid ${BD}` : "none" }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T1, marginBottom: 3 }}>{e.degree}</div>
                <div style={{ fontSize: 12.5, color: P, fontWeight: 600 }}>{e.school}</div>
                <div style={{ fontSize: 12, color: T3, marginTop: 2 }}>{e.year}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: S0, border: `1px solid ${BD}`, borderRadius: 22, padding: "24px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Summary</div>
            <p style={{ fontSize: 14.5, color: T2, lineHeight: 1.75 }}>{tagline}</p>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <StrengthCard icon="trending" title="Brand Recognition Uplift" metric="+40%" desc="EMEA-wide rebranding campaign delivered measurable lift in brand recognition." />
            <StrengthCard icon="target" title="CAC Reduction" metric="−25%" desc="Scaled enterprise leads by 60% while significantly reducing acquisition costs." />
            <StrengthCard icon="chart" title="Budget Managed" metric="$15M+" desc="Proven experience allocating and optimising large-scale marketing budgets." />
          </div>

          <div style={{ background: S0, border: `1px solid ${BD}`, borderRadius: 22, padding: "24px 28px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 22 }}>Experience</div>
            {experience.map((exp, i) => (
              <ExperienceItem key={i} {...exp} />
            ))}
          </div>

          <div style={{ background: `linear-gradient(135deg, ${PL}, rgba(70,72,212,0.03))`, border: `1px solid ${PB}`, borderRadius: 22, padding: "24px 28px" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: PB, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="star" size={16} color={P} />
              </div>
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: P, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Recruiter Assessment</div>
                <p style={{ fontSize: 14.5, color: T1, lineHeight: 1.75, fontStyle: "italic" }}>"{recruiterNote}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfileView;
