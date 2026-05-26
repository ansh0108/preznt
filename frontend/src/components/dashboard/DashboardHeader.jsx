import Icon from "../ui/Icon";

// ─── ShareButtons ──────────────────────────────────────────────────────────────
function ShareButtons({ built, shareUrl, copied, onCopy }) {
  if (!built) return null;
  return (
    <>
      <button onClick={onCopy}
        style={{ background: copied ? "rgba(13,148,136,0.08)" : "var(--bg1)", border: `1px solid ${copied ? "rgba(13,148,136,0.35)" : "var(--line)"}`, borderRadius: "var(--r-md)", color: copied ? "var(--teal)" : "var(--text2)", padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
        <Icon name={copied ? "check" : "link"} size={13} color={copied ? "var(--teal)" : "var(--text2)"} />
        {copied ? "Copied!" : "Share Portfolio"}
      </button>
      <a href={shareUrl} target="_blank" rel="noreferrer"
        style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", color: "var(--text3)", padding: "7px 14px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
        <Icon name="external" size={13} color="var(--text3)" /> View Live
      </a>
    </>
  );
}

// ─── DashboardHeader ───────────────────────────────────────────────────────────
function DashboardHeader({ auth, built, shareUrl, copied, onLogout, onCopy }) {
  return (
    <div style={{ borderBottom: "1px solid var(--line)", padding: "0 40px", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(18,19,25,0.85)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 10 }}>
      <div style={{ fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: 28, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1 }}>
        Prolio
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ShareButtons built={built} shareUrl={shareUrl} copied={copied} onCopy={onCopy} />
        <div style={{ fontSize: 13, color: "var(--text3)", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>{auth.email}</div>
        <button onClick={onLogout}
          style={{ background: "transparent", border: "1px solid var(--line)", borderRadius: "var(--r-md)", color: "var(--text3)", padding: "7px 14px", fontSize: 12, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
          <Icon name="logout" size={13} color="var(--text3)" /> Sign out
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;
