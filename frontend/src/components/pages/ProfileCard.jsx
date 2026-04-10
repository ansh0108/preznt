import { nameToSlug } from "../../lib/utils";
import { Pill } from "../ui/primitives";
import Icon from "../ui/Icon";

function ProfileCard({ profile: p }) {
  const slug = `${nameToSlug(p.name)}-${p.user_id}`;
  const url = `${window.location.origin}${window.location.pathname}#/portfolio/${slug}`;
  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "22px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--line2)"}
    >
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 3 }}>{p.name}</div>
        {p.current_role && <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{p.current_role}</div>}
        {p.tagline && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 3, fontStyle: "italic" }}>{p.tagline}</div>}
      </div>
      {p.skills?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{p.skills.slice(0, 6).map((s, i) => <Pill key={i} color="var(--accent)">{s}</Pill>)}</div>}
      <a href={url} target="_blank" rel="noreferrer" style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
        View portfolio <Icon name="external" size={13} color="var(--accent)" />
      </a>
    </div>
  );
}

export default ProfileCard;
