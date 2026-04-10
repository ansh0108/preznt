import { useState } from "react";
import { API } from "../../lib/api";
import Icon from "../ui/Icon";

const PALETTE = ["#818cf8", "#f472b6", "#2dd4bf", "#fbbf24", "#a78bfa", "#34d399"];

function ProfilePhoto({ userId, name, size = 60, onUpload }) {
  const [err, setErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const color = PALETTE[(name?.charCodeAt(0) || 0) % PALETTE.length];
  const initials = (name || "").split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const hasPhoto = userId && !err;

  const inner = hasPhoto
    ? <img src={`${API}/photo/${userId}`} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "center 15%", border: "2px solid var(--line2)", display: "block" }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}20`, border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color }}>
        {initials}
      </div>;

  if (!onUpload) {
    return <div style={{ margin: "0 auto", width: size, height: size }}>{inner}</div>;
  }

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto", cursor: "pointer", borderRadius: "50%", flexShrink: 0 }}
      onClick={onUpload}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      {inner}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: hovered ? "rgba(0,0,0,0.5)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.18s" }}>
        {hovered && <Icon name="camera" size={size * 0.25} color="#fff" />}
      </div>
      {!hasPhoto && !hovered && (
        <div style={{ position: "absolute", bottom: 1, right: 1, width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg1)" }}>
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, lineHeight: 1 }}>+</span>
        </div>
      )}
    </div>
  );
}

export default ProfilePhoto;
