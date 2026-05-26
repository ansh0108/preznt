// ─── BrandFeatureItem ─────────────────────────────────────────────────────────
function BrandFeatureItem({ title, desc }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", lineHeight: 1.5 }}>{desc}</div>
      </div>
    </div>
  );
}

const FEATURES = [
  ["AI portfolio in minutes", "We read your GitHub, LinkedIn, and docs to write your story."],
  ["Always up to date", "Your portfolio updates as your career grows — automatically."],
  ["Share a single link", "One elegant URL that showcases everything you've built."],
];

// ─── AuthBrandPanel ───────────────────────────────────────────────────────────
function AuthBrandPanel() {
  return (
    <div style={{ width: "45%", background: "var(--bg2)", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 56px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 500, height: 500, borderRadius: "50%", background: "rgba(129,140,248,0.08)", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -120, right: -80, width: 360, height: 360, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, right: -20, width: 240, height: 240, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      <div style={{ fontFamily: "var(--serif)", fontSize: 52, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: 16, position: "relative" }}>Prolio</div>
      <div style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 18, color: "rgba(255,255,255,0.70)", marginBottom: 52, lineHeight: 1.5, fontWeight: 400, position: "relative" }}>Your work speaks — let it.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
        {FEATURES.map(([title, desc], i) => <BrandFeatureItem key={i} title={title} desc={desc} />)}
      </div>
    </div>
  );
}

export default AuthBrandPanel;
