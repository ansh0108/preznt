import { nameToSlug } from "../../lib/utils";
import { Pill } from "../ui/primitives";
import Icon from "../ui/Icon";

const P    = "var(--accent)";
const T1   = "var(--text)";
const T2   = "var(--text2)";
const T3   = "var(--text3)";
const BG   = "var(--bg)";
const BG1  = "var(--bg1)";
const BG2  = "var(--bg2)";
const BGH  = "var(--bg3)";
const BGFIX = "var(--bg4)";
const BD   = "var(--line)";
const hairline = { border: `1px solid ${BD}` };
const luxShadow = "0 8px 28px rgba(129,140,248,0.18)";

function ProfileCard({ profile: p }) {
  const slug = `${nameToSlug(p.name)}-${p.user_id}`;
  const url = `${window.location.origin}${window.location.pathname}#/portfolio/${slug}`;
  return (
    <div style={{ background: BG1, border: `1px solid ${BD}`, borderRadius: 12, padding: "22px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.boxShadow = luxShadow; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = BD; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 600, color: T1, marginBottom: 3, fontFamily: "var(--serif)" }}>{p.name}</div>
        {p.current_role && <div style={{ fontSize: 13, color: T2 }}>{p.current_role}</div>}
        {p.tagline && <div style={{ fontSize: 12, color: T3, marginTop: 3, fontStyle: "italic" }}>{p.tagline}</div>}
      </div>
      {p.skills?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{p.skills.slice(0, 6).map((s, i) => <Pill key={i} color={P}>{s}</Pill>)}</div>}
      <a href={url} target="_blank" rel="noreferrer" style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: P, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
        View portfolio <Icon name="external" size={13} color={P} />
      </a>
    </div>
  );
}

export default ProfileCard;
