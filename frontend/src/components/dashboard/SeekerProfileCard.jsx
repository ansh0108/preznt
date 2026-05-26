import axios from "axios";
import { API } from "../../lib/api";
import ProfilePhoto from "./ProfilePhoto";

// ─── LiveBadge ────────────────────────────────────────────────────────────────
function LiveBadge() {
  return (
    <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6, background: "var(--teal-d, rgba(13,148,136,0.10))", border: "1px solid rgba(13,148,136,0.28)", borderRadius: 100, padding: "3px 10px", fontSize: 11, color: "var(--teal)", fontWeight: 600, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block", flexShrink: 0 }} />
      Portfolio Live
    </div>
  );
}

// ─── ProfileCard ──────────────────────────────────────────────────────────────
function ProfileCard({ pm }) {
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    try { await axios.post(`${API}/upload/photo/${pm.activePortfolioId}`, fd); pm.loadProfile(); } catch {}
    e.target.value = "";
  };

  return (
    <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "22px", marginBottom: 14, position: "relative", overflow: "hidden", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)" }}>
      {pm.built && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, var(--accent), var(--teal), var(--accent))", backgroundSize: "200% 100%", animation: "gradient-x 3s ease infinite" }} />
      )}
      <div style={{ marginBottom: 14 }}>
        <ProfilePhoto
          key={`photo-${pm.activePortfolioId}-${pm.profile?.photo_ext || "none"}`}
          userId={pm.profile?.has_photo ? pm.activePortfolioId : null}
          name={pm.profile?.name} size={72}
          onUpload={() => document.getElementById("dash-photo-upload").click()}
        />
        <input id="dash-photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 3, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>{pm.profile?.name}</div>
        {pm.profile?.title && <div style={{ fontSize: 12.5, color: "var(--text3)", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>{pm.profile.title}</div>}
        {pm.profile?.tagline && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 5, fontStyle: "italic", lineHeight: 1.5, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>{pm.profile.tagline}</div>}
        {pm.built && <LiveBadge />}
      </div>
    </div>
  );
}

export default ProfileCard;
