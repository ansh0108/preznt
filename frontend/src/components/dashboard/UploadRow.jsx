import { useState } from "react";
import { Spinner } from "../ui/primitives";
import Icon from "../ui/Icon";

function UploadRow({ label, icon, done, accept, onFile, hint }) {
  const inputId = `upload-${label.replace(/\s/g, "-")}`;
  const [uploading, setUploading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const handle = async (file) => {
    setUploading(true);
    try { await onFile(file); } catch {} finally { setUploading(false); }
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: done ? "rgba(45,212,191,0.1)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name={done ? "check" : icon} size={14} color={done ? "var(--teal)" : "var(--text3)"} />
          </div>
          <span style={{ fontSize: 13, color: done ? "var(--text2)" : "var(--text3)", fontWeight: 500 }}>{label}</span>
          {hint && (
            <button onClick={() => setShowHint(v => !v)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: 11, padding: "0 4px", display: "flex", alignItems: "center", gap: 3, opacity: 0.7 }}>
              <span style={{ fontSize: 13 }}>ⓘ</span>
              <span style={{ fontSize: 11 }}>How?</span>
            </button>
          )}
        </div>
        <label htmlFor={inputId} style={{ cursor: "pointer" }}>
          <div className="b-ghost" style={{ background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: 6, color: done ? "var(--text3)" : "var(--accent)", padding: "3px 10px", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
            {uploading ? <Spinner size={10} color="var(--accent)" /> : done ? "Replace" : "Upload"}
          </div>
          <input id={inputId} type="file" accept={accept} style={{ display: "none" }} onChange={e => e.target.files[0] && handle(e.target.files[0])} />
        </label>
      </div>
      {hint && showHint && (
        <div className="slide-down" style={{ background: "var(--bg3)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "12px 14px", marginTop: 10 }}>
          {hint.map(([title, desc], i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < hint.length - 1 ? 9 : 0, alignItems: "flex-start" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>{i + 1}</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{title}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 1 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadRow;
