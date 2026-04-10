import Icon from "./Icon";

function PhotoUploadField({ photo, setPhoto }) {
  const preview = photo ? URL.createObjectURL(photo) : null;
  return (
    <div>
      <label style={{ fontSize: 12.5, color: "var(--text3)", fontWeight: 500, display: "block", marginBottom: 10, letterSpacing: "0.02em" }}>Profile Photo</label>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div onClick={() => document.getElementById("photo-upload").click()}
          style={{ width: 68, height: 68, borderRadius: "50%", cursor: "pointer", flexShrink: 0, background: preview ? "transparent" : "var(--bg3)", border: `1.5px dashed ${preview ? "var(--accent)" : "var(--line2)"}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transition: "border-color 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = preview ? "var(--accent)" : "var(--line2)"}>
          {preview
            ? <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <Icon name="camera" size={20} color="var(--text3)" />}
        </div>
        <div>
          <div style={{ fontSize: 13, color: photo ? "var(--accent)" : "var(--text2)", fontWeight: 500 }}>{photo ? photo.name : "Click to upload"}</div>
          <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 3 }}>JPG, PNG or WebP · appears on your portfolio</div>
          {photo && <button onClick={() => setPhoto(null)} style={{ background: "none", color: "var(--text3)", fontSize: 11.5, marginTop: 5, textDecoration: "underline" }}>Remove</button>}
        </div>
        <input id="photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={e => setPhoto(e.target.files[0])} />
      </div>
    </div>
  );
}

export default PhotoUploadField;
