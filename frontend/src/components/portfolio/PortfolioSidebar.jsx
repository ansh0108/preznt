import { API } from "../../lib/api";
import { getSkillClusters } from "../../lib/utils";
import { SecHead, Pill } from "../ui/primitives";
import Icon from "../ui/Icon";
import OrgLogo from "../ui/OrgLogo";
import ProfileAvatar from "../ui/ProfileAvatar";

// ─── ProfileLinksButtons ──────────────────────────────────────────────────────
function ProfileLinksButtons({ profile }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
      {profile.linkedin_url && (
        <a href={profile.linkedin_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <button
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--bg2)", border: "1px solid var(--line)", color: "var(--text2)", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--sans)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#0a66c2"; e.currentTarget.style.color = "#0a66c2"; e.currentTarget.style.background = "rgba(10,102,194,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.background = "var(--bg2)"; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn Profile
          </button>
        </a>
      )}
      {profile.github_username && (
        <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
          <button
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--bg2)", border: "1px solid var(--line)", color: "var(--text2)", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--sans)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-d)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.background = "var(--bg2)"; }}
          >
            <Icon name="github" size={15} color="currentColor" /> GitHub Profile
          </button>
        </a>
      )}
      {profile.has_resume && (
        <a href={`${API}/resume/${profile.user_id}`} download style={{ textDecoration: "none" }}>
          <button
            className="b-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", border: "none", color: "#fff", borderRadius: 100, padding: "10px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(129,140,248,0.25)", fontFamily: "var(--sans)" }}
          >
            <Icon name="file" size={15} color="#fff" /> Download Resume
          </button>
        </a>
      )}
    </div>
  );
}

// ─── MainProfileCard ──────────────────────────────────────────────────────────
function MainProfileCard({ profile }) {
  return (
    <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: 16, padding: "28px 22px 22px", textAlign: "center", animation: "fadeUp 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div style={{ borderRadius: "50%", background: "var(--bg4)", display: "inline-flex" }}>
          <ProfileAvatar profile={profile} size={100} />
        </div>
      </div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", lineHeight: 1.2, color: "var(--text)" }}>{profile.name}</div>
      <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 6, fontWeight: 600, letterSpacing: "0.01em" }}>{profile.title}</div>
      {profile.tagline && <div style={{ color: "var(--text3)", fontFamily: "var(--sans)", fontSize: 12.5, marginTop: 8, lineHeight: 1.4, textAlign: "center" }}>{profile.tagline}</div>}
      {(profile.github_username || profile.has_resume || profile.linkedin_url) && <ProfileLinksButtons profile={profile} />}
    </div>
  );
}

// ─── CurrentRoleCard ──────────────────────────────────────────────────────────
function CurrentRoleCard({ experience }) {
  const isCurrentRole = /present|current/i.test(experience.dates || "");
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: 12, padding: "16px 20px", animation: "fadeUp 0.44s ease" }}>
      <SecHead style={{ marginBottom: 12, color: "var(--accent)" }}>{isCurrentRole ? "Currently" : "Recently"}</SecHead>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <OrgLogo name={experience.company || experience.title} size={34} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text)", lineHeight: 1.3 }}>{experience.title}</div>
          <div style={{ fontSize: 12.5, color: "var(--accent)", marginTop: 3, fontWeight: 600 }}>{experience.company}</div>
          <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 3 }}>{experience.dates}</div>
        </div>
      </div>
    </div>
  );
}

// ─── PortfolioLinksCard ───────────────────────────────────────────────────────
const TYPE_COLORS = { product: "var(--accent)", publication: "var(--rose)", certificate: "var(--teal)", award: "var(--amber)", other: "var(--text3)" };

function PortfolioLinksCard({ links }) {
  return (
    <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px", animation: "fadeUp 0.45s ease" }}>
      <SecHead style={{ marginBottom: 12 }}>Links & Credentials</SecHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {links.map((l, i) => {
          const color = TYPE_COLORS[l.type] || "var(--text3)";
          return (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{l.type === "certificate" ? "cert" : l.type || "link"}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</div>
                {l.issuer && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{l.issuer}</div>}
              </div>
              {l.url && (
                <a href={l.url} target="_blank" rel="noreferrer" style={{ flexShrink: 0, textDecoration: "none", paddingTop: 14 }}>
                  <span style={{ fontSize: 11, color, background: `${color}14`, border: `1px solid ${color}33`, padding: "2px 8px", borderRadius: 100, fontWeight: 600, whiteSpace: "nowrap" }}>↗</span>
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SkillsCard ───────────────────────────────────────────────────────────────
function SkillsCard({ profile }) {
  return (
    <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px", animation: "fadeUp 0.46s ease" }}>
      <SecHead style={{ marginBottom: 12 }}>Top Skills</SecHead>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Object.entries(getSkillClusters(profile)).map(([cat, skills]) => (
          <div key={cat}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, fontFamily: "var(--sans)" }}>{cat}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {skills.map((s, i) => <Pill key={i}>{s}</Pill>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PortfolioSidebar ─────────────────────────────────────────────────────────
function PortfolioSidebar({ profile, hideSections }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 73 }}>
      <MainProfileCard profile={profile} />
      {!hideSections.includes("current_role") && profile.experience?.[0] && (
        <CurrentRoleCard experience={profile.experience[0]} />
      )}
      {!hideSections.includes("links") && profile.links?.length > 0 && (
        <PortfolioLinksCard links={profile.links} />
      )}
      {!hideSections.includes("skills") && profile.skills?.length > 0 && (
        <SkillsCard profile={profile} />
      )}
      {profile.target_roles?.length > 0 && (
        <div style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: 12, padding: "18px 20px", animation: "fadeUp 0.48s ease" }}>
          <SecHead style={{ marginBottom: 12 }}>Open to</SecHead>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {profile.target_roles.map((r, i) => <Pill key={i} color="var(--rose)">{r}</Pill>)}
          </div>
        </div>
      )}
    </div>
  );
}

export default PortfolioSidebar;
