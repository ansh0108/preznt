import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { API } from "../../lib/api";
import { extractCompanyFromJD } from "../../lib/utils";
import { Spinner, Btn, SecHead } from "../ui/primitives";
import Icon from "../ui/Icon";

function downloadPDF(getEditorText, profile, company, jd) {
  const namePart = (profile?.name || "Cover").replace(/\s+/g, "_");
  const resolvedCompany = company.trim() || extractCompanyFromJD(jd);
  const companyPart = resolvedCompany ? `_${resolvedCompany.replace(/\s+/g, "_")}` : "";
  const filename = `${namePart}${companyPart}_cover_letter.pdf`;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 22;
  const maxW = pageW - margin * 2;
  let y = margin;

  doc.setFont("times", "normal");
  doc.setFontSize(11);

  const paragraphs = getEditorText().trim().split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  for (const para of paragraphs) {
    const lines = doc.splitTextToSize(para, maxW);
    const blockH = lines.length * 6.5;
    if (y + blockH > pageH - margin) { doc.addPage(); y = margin; }
    doc.setTextColor(30);
    doc.text(lines, margin, y);
    y += blockH + 5;
  }
  doc.save(filename);
}

function FmtBtn({ cmd, fmt, label }) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); fmt(cmd); }}
      style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-sm)", padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: cmd === "bold" ? 700 : 400, fontStyle: cmd === "italic" ? "italic" : "normal", textDecoration: cmd === "underline" ? "underline" : "none" }}
    >{label}</button>
  );
}

function LetterToolbar({ copy, copied, onDownload, saveLetter, saving, savedId, fmt }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)", marginRight: 8 }}>Your Cover Letter</div>
        <FmtBtn cmd="bold" fmt={fmt} label="B" />
        <FmtBtn cmd="italic" fmt={fmt} label="I" />
        <FmtBtn cmd="underline" fmt={fmt} label="U" />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={copy} style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: copied ? "var(--teal)" : "var(--text2)", borderRadius: "var(--r-md)", padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <Icon name={copied ? "check" : "copy"} size={13} color={copied ? "var(--teal)" : "var(--text2)"} />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={onDownload} style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-md)", padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <Icon name="file" size={13} color="var(--text2)" /> Download PDF
        </button>
        <button onClick={saveLetter} disabled={saving || !!savedId}
          style={{ background: savedId ? "rgba(45,212,191,0.1)" : "var(--bg3)", border: `1px solid ${savedId ? "var(--teal)" : "var(--line2)"}`, color: savedId ? "var(--teal)" : "var(--text2)", borderRadius: "var(--r-md)", padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: saving || savedId ? "default" : "pointer", transition: "all 0.15s" }}>
          <Icon name={savedId ? "check" : "file"} size={13} color={savedId ? "var(--teal)" : "var(--text2)"} />
          {saving ? "Saving…" : savedId ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function RefinementPanel({ value, onChange, onSubmit, refining }) {
  return (
    <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10 }}>Want changes? Tell me what to adjust…</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === "Enter" && onSubmit()}
          placeholder='e.g. "Make it more concise" or "Emphasise my SQL skills more"' style={{ flex: 1 }} />
        <Btn onClick={onSubmit} disabled={refining || !value.trim()} style={{ flexShrink: 0 }}>
          {refining ? <Spinner size={14} color="#fff" /> : "Refine"}
        </Btn>
      </div>
    </div>
  );
}

function CoverLetterPlaceholder() {
  return (
    <div>
      <SecHead>Cover Letter Generator</SecHead>
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", padding: "40px 20px" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--bg2)", border: "1px solid var(--line2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="file" size={22} color="var(--text3)" />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Build your portfolio first</div>
        <div style={{ fontSize: 13, color: "var(--text3)", maxWidth: 380, lineHeight: 1.65 }}>Upload your LinkedIn PDF and resume, then build your portfolio. The cover letter generator uses your profile to write a personalised letter.</div>
      </div>
    </div>
  );
}

function JobInputForm({ company, setCompany, role, setRole, jd, setJd, onGenerate, loading, error }) {
  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)" style={{ flex: 1 }} />
        <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role title (optional)" style={{ flex: 1 }} />
      </div>
      <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description here..." rows={7} style={{ width: "100%", marginBottom: 12, resize: "vertical" }} />
      <Btn onClick={onGenerate} disabled={loading || !jd.trim()} style={{ marginBottom: 24 }}>
        {loading ? <><Spinner size={14} color="#fff" /> Generating…</> : <><Icon name="zap" size={14} color="#fff" /> Generate Cover Letter</>}
      </Btn>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}
    </>
  );
}

function CoverLetter({ userId, built, profile, jd, setJd, company, setCompany, role, setRole, result, setResult }) {
  const [status, setStatus] = useState({ loading: false, error: null, refining: false, saving: false, savedId: null });
  const [copied, setCopied] = useState(false);
  const [refinement, setRefinement] = useState("");
  const editorRef = useRef(null);

  const contactLine = [profile?.email, profile?.phone].filter(Boolean).join("  |  ");

  useEffect(() => {
    if (!editorRef.current || !result) return;
    const contactHeader = contactLine
      ? `<p style="margin:0 0 2px 0;font-size:12px;color:#888">${contactLine}</p><p style="margin:0 0 1.2em 0"> </p>`
      : "";
    const html = result.split(/\n\n+/).map(block => `<p style="margin:0 0 1em 0">${block.replace(/\n/g, "<br>")}</p>`).join("");
    editorRef.current.innerHTML = contactHeader + html;
  }, [result]);

  const getEditorText = () => editorRef.current?.innerText || result || "";
  const fmt = (cmd) => { document.execCommand(cmd, false, null); editorRef.current?.focus(); };

  const generate = async () => {
    if (!jd.trim()) return;
    setStatus(s => ({ ...s, loading: true, error: null })); setResult(null);
    try { const res = await axios.post(`${API}/cover-letter`, { user_id: userId, job_description: jd, company_name: company, role_name: role }); setResult(res.data.cover_letter); }
    catch { setStatus(s => ({ ...s, error: "Failed to generate. Please try again." })); }
    finally { setStatus(s => ({ ...s, loading: false })); }
  };

  const refine = async () => {
    if (!refinement.trim()) return;
    setStatus(s => ({ ...s, refining: true, error: null }));
    try { const res = await axios.post(`${API}/cover-letter`, { user_id: userId, job_description: jd, company_name: company, role_name: role, existing_letter: getEditorText(), refinement: refinement.trim() }); setResult(res.data.cover_letter); setRefinement(""); }
    catch { setStatus(s => ({ ...s, error: "Refinement failed. Please try again." })); }
    finally { setStatus(s => ({ ...s, refining: false })); }
  };

  const saveLetter = async () => {
    if (!result || status.saving) return;
    setStatus(s => ({ ...s, saving: true }));
    try {
      const titleRole = role.trim() || "Cover Letter";
      const title = company.trim() ? `${titleRole} — ${company.trim()}` : titleRole;
      const res = await axios.post(`${API}/analyses/save`, { user_id: userId, type: "cover", title: title.slice(0, 80), content: { cover_letter: getEditorText(), company, role } });
      setStatus(s => ({ ...s, savedId: res.data.id }));
    } catch {} finally { setStatus(s => ({ ...s, saving: false })); }
  };

  const copy = () => { navigator.clipboard.writeText(getEditorText()); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (!built) return <CoverLetterPlaceholder />;

  return (
    <div>
      <SecHead>Cover Letter Generator</SecHead>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 18 }}>Paste a job description and get a tailored cover letter based on your full portfolio</div>
      <JobInputForm company={company} setCompany={setCompany} role={role} setRole={setRole} jd={jd} setJd={setJd} onGenerate={generate} loading={status.loading} error={status.error} />
      {result && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <LetterToolbar copy={copy} copied={copied} onDownload={() => downloadPDF(getEditorText, profile, company, jd)} saveLetter={saveLetter} saving={status.saving} savedId={status.savedId} fmt={fmt} />
          <div ref={editorRef} contentEditable suppressContentEditableWarning
            style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "24px 28px", fontSize: 14, lineHeight: 1.85, color: "var(--text2)", marginBottom: 8, outline: "none", minHeight: 260 }} />
          <RefinementPanel value={refinement} onChange={setRefinement} onSubmit={refine} refining={status.refining} />
        </div>
      )}
    </div>
  );
}

export default CoverLetter;
