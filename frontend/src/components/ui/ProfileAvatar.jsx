import { useState } from "react";
import { API } from "../../lib/api";

function ProfileAvatar({ profile, size = 100 }) {
  const [failed, setFailed] = useState(false);
  const letter = profile.name?.charAt(0) || "?";

  if (profile.has_photo && !failed) {
    return (
      <img
        src={`${API}/photo/${profile.user_id}`}
        alt={profile.name}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "center 15%", display: "block", border: "2px solid var(--line2)", margin: "0 auto 18px" }}
      />
    );
  }

  return (
    <div style={{ width: size, height: size, borderRadius: "50%", margin: "0 auto 18px", background: "linear-gradient(135deg, var(--accent), var(--rose))", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: "var(--serif)", fontSize: size * 0.4, color: "#fff", fontWeight: 500 }}>{letter}</span>
    </div>
  );
}

export default ProfileAvatar;
