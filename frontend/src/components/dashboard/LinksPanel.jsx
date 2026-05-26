import { useState } from "react";
import Icon from "../ui/Icon";

const linkInputSt = { width: "100%", background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text)", fontSize: 12, padding: "7px 10px", outline: "none" };

const LINK_TYPES = [
  { id: "product", label: "Product / Project" },
  { id: "certificate", label: "Certificate" },
  { id: "publication", label: "Publication" },
  { id: "award", label: "Award" },
  { id: "other", label: "Other" },
];

// ─── LinkAddForm ──────────────────────────────────────────────────────────────
function LinkAddForm({ link, setLink, profile, saveLinks }) {
  const [saveErr, setSaveErr] = useState(null);
  const placeholderFor = (type, field) => {
    if (field === "issuer") return type === "publication" ? "Published in (optional)" : type === "product" ? "Short description (optional)" : "Issued by (optional)";
    return "URL (optional)";
  };

  const handleAdd = async () => {
    setSaveErr(null);
    setLink(l => ({ ...l, saving: true }));
    try {
      await saveLinks([...(profile?.links || []), { ...link.value }]);
      setLink({ adding: false, value: { type: "product", title: "", url: "", issuer: "", date: "" }, saving: false });
    } catch {
      setSaveErr("Failed to save. Please try again.");
      setLink(l => ({ ...l, saving: false }));
    }
  };

  return (
    <div style={{ marginTop: 10, background: "var(--bg2)", borderRadius: "var(--r-md)", border: "1px solid var(--line2)", padding: "14px" }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
        {LINK_TYPES.map(t => (
          <button key={t.id} onClick={() => setLink(l => ({ ...l, value: { ...l.value, type: t.id } }))}
            style={{ padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, cursor: "pointer", background: link.value.type === t.id ? "var(--accent-d)" : "var(--bg3)", border: `1px solid ${link.value.type === t.id ? "var(--accent)" : "var(--line2)"}`, color: link.value.type === t.id ? "var(--accent)" : "var(--text3)" }}>
            {t.label}
          </button>
        ))}
      </div>
      <input value={link.value.title} onChange={e => setLink(l => ({ ...l, value: { ...l.value, title: e.target.value } }))} placeholder="Title *" style={linkInputSt} />
      <input value={link.value.issuer} onChange={e => setLink(l => ({ ...l, value: { ...l.value, issuer: e.target.value } }))} placeholder={placeholderFor(link.value.type, "issuer")} style={{ ...linkInputSt, marginTop: 6 }} />
      <input value={link.value.url} onChange={e => setLink(l => ({ ...l, value: { ...l.value, url: e.target.value } }))} placeholder={placeholderFor(link.value.type, "url")} style={{ ...linkInputSt, marginTop: 6 }} />
      <input value={link.value.date} onChange={e => setLink(l => ({ ...l, value: { ...l.value, date: e.target.value } }))} placeholder="e.g. March 2024 (optional)" style={{ ...linkInputSt, marginTop: 6 }} />
      {saveErr && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>{saveErr}</div>}
      <button disabled={!link.value.title.trim() || link.saving} onClick={handleAdd}
        style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: "var(--r-md)", background: "var(--accent)", border: "none", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", opacity: (!link.value.title.trim() || link.saving) ? 0.5 : 1 }}>
        {link.saving ? "Saving…" : "Add"}
      </button>
    </div>
  );
}

// ─── LinksPanel ───────────────────────────────────────────────────────────────
function LinksPanel({ links, saveLinks, link, setLink, profile }) {
  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: links.length > 0 ? "rgba(45,212,191,0.1)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="link" size={14} color={links.length > 0 ? "var(--teal)" : "var(--text3)"} />
          </div>
          <span style={{ fontSize: 13, color: links.length > 0 ? "var(--text2)" : "var(--text3)", fontWeight: 500 }}>Links & Credentials</span>
        </div>
        <button onClick={() => setLink(l => ({ ...l, adding: !l.adding }))}
          style={{ background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: 6, color: "var(--accent)", padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>
          {link.adding ? "Cancel" : "+ Add"}
        </button>
      </div>
      {links.length > 0 && (
        <div style={{ paddingLeft: 36, display: "flex", flexDirection: "column", gap: 5, marginBottom: link.adding ? 8 : 0 }}>
          {links.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
              <div style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                <span style={{ color: "var(--accent)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginRight: 5 }}>{l.type === "certificate" ? "cert" : l.type}</span>
                {l.title}
              </div>
              <button onClick={() => saveLinks(links.filter((_, j) => j !== i))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text3)", padding: "0 2px", fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      {link.adding && <LinkAddForm link={link} setLink={setLink} profile={profile} saveLinks={saveLinks} />}
    </div>
  );
}

export default LinksPanel;
