import Icon from "./Icon";

export const Spinner = ({ size = 16, color = "var(--accent)" }) => (
  <div style={{ width: size, height: size, border: `1.5px solid ${color}30`, borderTop: `1.5px solid ${color}`, borderRadius: "50%", animation: "spin 0.75s linear infinite", display: "inline-block", flexShrink: 0 }} />
);

export const BulletText = ({ text, style: s = {} }) => {
  if (!text) return null;
  const hasBullets = text.includes("•");
  if (!hasBullets) return <div style={{ whiteSpace: "pre-line", ...s }}>{text}</div>;
  const bullets = text.split("•").map(b => b.trim()).filter(Boolean);
  return (
    <div style={s}>
      {bullets.map((b, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < bullets.length - 1 ? 8 : 0 }}>
          <span style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }}>•</span>
          <span>{b}</span>
        </div>
      ))}
    </div>
  );
};

export const Pill = ({ children, color = "var(--accent)", size = "sm" }) => {
  const pad = size === "sm" ? "3px 10px" : "5px 14px";
  const fs = size === "sm" ? 11.5 : 13;
  return (
    <span style={{ background: `${color}18`, border: `1px solid ${color}35`, color, padding: pad, borderRadius: 100, fontSize: fs, fontWeight: 600, display: "inline-block", letterSpacing: "0.01em", lineHeight: 1.5, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
};

export const Divider = ({ my = 24 }) => <div style={{ height: 1, background: "var(--line)", margin: `${my}px 0` }} />;

export const SecHead = ({ children, style: s = {} }) => (
  <div style={{ fontFamily: "var(--sans)", fontSize: 10.5, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18, ...s }}>
    {children}
  </div>
);

export const Btn = ({ children, onClick, variant = "primary", disabled, style: s = {}, icon }) => {
  const styles = {
    primary: {
      background: "var(--accent)", color: "#fff", padding: "10px 22px",
      borderRadius: "var(--r-md)", fontWeight: 600, fontSize: 13.5,
      opacity: disabled ? 0.45 : 1, transition: "opacity 0.15s, transform 0.12s, background 0.15s",
      display: "inline-flex", alignItems: "center", gap: 7,
    },
    ghost: {
      background: "transparent", border: "1px solid var(--line2)", color: "var(--text2)",
      padding: "9px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: 500,
      transition: "border-color 0.15s, color 0.15s", display: "inline-flex", alignItems: "center", gap: 7,
    },
    subtle: {
      background: "var(--bg3)", border: "1px solid var(--line)", color: "var(--text2)",
      padding: "8px 16px", borderRadius: "var(--r-md)", fontSize: 12.5, fontWeight: 500,
      display: "inline-flex", alignItems: "center", gap: 6, transition: "background 0.15s, border-color 0.15s",
    },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], ...s }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = "translateY(-1px)"; if (variant === "primary") e.currentTarget.style.background = "#6d78f0"; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; if (variant === "primary") e.currentTarget.style.background = "var(--accent)"; }}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
};
