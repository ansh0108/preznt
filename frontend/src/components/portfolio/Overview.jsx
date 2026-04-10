import { getSkillClusters } from "../../lib/utils";
import { SecHead, BulletText, Pill } from "../ui/primitives";
import Icon from "../ui/Icon";
import OrgLogo from "../ui/OrgLogo";

function Overview({ profile, hideSections = [] }) {
  const hasContent = profile.experience?.length || profile.education?.length || profile.skills?.length;
  if (!hasContent) return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      <Icon name="file" size={36} color="var(--text3)" style={{ marginBottom: 16 }} />
      <div style={{ color: "var(--text3)", fontSize: 14 }}>Upload your LinkedIn PDF in setup to populate this section.</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {(profile.bio || profile.linkedin_summary) && !hideSections.includes("about") && (
        <div>
          <SecHead>About</SecHead>
          <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.85, fontWeight: 400 }}>{profile.bio || profile.linkedin_summary}</div>
        </div>
      )}

      {profile.experience?.length > 0 && !hideSections.includes("experience") && (
        <div>
          <SecHead>Experience</SecHead>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {profile.experience.map((exp, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 28 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 42 }}>
                  <OrgLogo name={exp.company || exp.title} size={42} />
                  {i < profile.experience.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--line)", marginTop: 12 }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", lineHeight: 1.3 }}>{exp.title}</div>
                  <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 4, fontWeight: 600 }}>{exp.company}</div>
                  <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4, fontWeight: 400 }}>{exp.dates}</div>
                  {exp.description && (
                    <div className="c-hover" style={{ color: "var(--text2)", fontSize: 13.5, marginTop: 12, lineHeight: 1.75, padding: "12px 16px", background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", borderLeft: "2px solid var(--accent-b)" }}>
                      <BulletText text={exp.description} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.education?.length > 0 && !hideSections.includes("education") && (
        <div>
          <SecHead>Education</SecHead>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {profile.education.map((edu, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingBottom: 24 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 42 }}>
                  <OrgLogo name={edu.school} size={42} />
                  {i < profile.education.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--line)", marginTop: 12 }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{edu.school}</div>
                  {edu.degree && <div style={{ color: "var(--text2)", fontSize: 13, marginTop: 4 }}>{edu.degree}</div>}
                  {edu.dates && <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 4 }}>{edu.dates}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.skills?.length > 0 && !hideSections.includes("skills") && (
        <div>
          <SecHead>Skills</SecHead>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(getSkillClusters(profile)).map(([cat, skills]) => (
              <div key={cat}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{cat}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {skills.map((s, i) => <Pill key={i} size="md">{s}</Pill>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile.links?.length > 0 && !hideSections.includes("links") && (() => {
        const TYPE_META = {
          publication: { label: "Publications", color: "var(--rose)", icon: "file" },
          certificate: { label: "Certifications", color: "var(--teal)", icon: "check" },
          award:       { label: "Awards", color: "var(--amber)", icon: "star" },
          other:       { label: "Other Links", color: "var(--accent)", icon: "link" },
        };
        const grouped = {};
        for (const l of profile.links) {
          const t = l.type || "other";
          if (!grouped[t]) grouped[t] = [];
          grouped[t].push(l);
        }
        return (
          <div>
            <SecHead>Publications & Credentials</SecHead>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {["publication", "certificate", "award", "other"].filter(t => grouped[t]).map(type => {
                const meta = TYPE_META[type];
                return (
                  <div key={type}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>{meta.label}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {grouped[type].map((l, i) => (
                        <div key={i} className="c-hover" style={{ display: "flex", gap: 14, padding: "14px 16px", background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", borderLeft: `2px solid ${meta.color}` }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{l.title}</div>
                            {l.issuer && <div style={{ fontSize: 12.5, color: meta.color, marginTop: 3 }}>{l.issuer}</div>}
                            {l.date && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{l.date}</div>}
                            {l.description && <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 6, lineHeight: 1.6 }}>{l.description}</div>}
                          </div>
                          {l.url && (
                            <a href={l.url} target="_blank" rel="noreferrer" style={{ flexShrink: 0, alignSelf: "flex-start", paddingTop: 2, textDecoration: "none" }}>
                              <span style={{ fontSize: 11, color: meta.color, background: meta.color + "18", border: `1px solid ${meta.color}40`, padding: "3px 10px", borderRadius: 100, fontWeight: 600, whiteSpace: "nowrap" }}>↗ View</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default Overview;
