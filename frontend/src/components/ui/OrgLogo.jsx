import { useState } from "react";
import { guessDomain } from "../../lib/utils";

// Student groups / internal orgs with no logo — show initials directly
const INITIALS_ONLY = new Set([
  "business intelligence group (uiuc)",
  "business intelligence group",
]);

const PALETTE = ["#818cf8", "#f472b6", "#2dd4bf", "#fbbf24", "#a78bfa", "#34d399"];

function OrgLogo({ name, size = 40 }) {
  const lower = (name || "").toLowerCase().trim();
  const isInitialsOnly = INITIALS_ONLY.has(lower);
  const [tier, setTier] = useState(isInitialsOnly ? 4 : 0);
  const domain = guessDomain(name);

  const color = PALETTE[(name?.charCodeAt(0) || 0) % PALETTE.length];

  const initials = (name || "")
    .split(/\s+/)
    .filter(w => !["of", "the", "and", "at", "&", "pvt", "ltd", "inc", "j.", "j", "dr."].includes(w.toLowerCase()))
    .slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

  if (tier >= 4) {
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.22, flexShrink: 0, background: `${color}20`, border: `1.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.35, fontWeight: 700, color, fontFamily: "var(--sans)", letterSpacing: "-0.02em" }}>{initials}</span>
      </div>
    );
  }

  const token = import.meta.env.VITE_LOGO_DEV_TOKEN;
  const src = tier === 0
    ? `https://img.logo.dev/${domain}?token=${token}&size=200&format=png`
    : tier === 1
    ? `https://logo.clearbit.com/${domain}?size=200`
    : tier === 2
    ? `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`
    : `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return (
    <img
      src={src}
      alt={name}
      onError={() => setTier(t => t + 1)}
      style={{
        width: size, height: size,
        borderRadius: size * 0.22,
        objectFit: "contain",
        background: "#fff",
        padding: Math.round(size * 0.07),
        border: "1px solid var(--line2)",
        flexShrink: 0,
      }}
    />
  );
}

export default OrgLogo;
