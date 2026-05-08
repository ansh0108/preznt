import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import { API } from "../../lib/api";
import { extractCompanyFromJD } from "../../lib/utils";
import { Spinner, Btn, SecHead } from "../ui/primitives";
import Icon from "../ui/Icon";

const P      = "#4648d4";
const T1     = "#111c2d";
const T2     = "#464554";
const T3     = "#767586";
const BG     = "#f9f9ff";
const BG1    = "#ffffff";
const BG2    = "#f0f3ff";
const BGH    = "#dee8ff";
const BD     = "rgba(0,0,0,0.06)";
const hairline = { border: `1px solid ${BD}` };
const luxShadow = "0 20px 40px -10px rgba(0,0,0,0.04)";

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
      style={{ background: BG2, border: `1px solid ${BD}`, color: T2, borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontWeight: cmd === "bold" ? 700 : 400, fontStyle: cmd === "italic" ? "italic" : "normal", textDecoration: cmd === "underline" ? "underline" : "none" }}
    >{label}</button>
  );
}

function LetterToolbar({ copy, copied, onDownload, saveLetter, saving, savedId, fmt }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: T1, marginRight: 8 }}>Your Cover Letter</div>
        <FmtBtn cmd="bold" fmt={fmt} label="B" />
        <FmtBtn cmd="italic" fmt={fmt} label="I" />
        <FmtBtn cmd="underline" fmt={fmt} label="U" />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={copy} style={{ background: BG1, border: `1px solid ${BD}`, color: copied ? "#0d9488" : T2, borderRadius: 8, padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = BG2}
          onMouseLeave={e => e.currentTarget.style.background = BG1}>
          <Icon name={copied ? "check" : "copy"} size={13} color={copied ? "#0d9488" : T2} />
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={onDownload} style={{ background: BG1, border: `1px solid ${BD}`, color: T2, borderRadius: 8, padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}
          onMouseEnter={e => e.currentTarget.style.background = BG2}
          onMouseLeave={e => e.currentTarget.style.background = BG1}>
          <Icon name="file" size={13} color={T2} /> Download PDF
        </button>
        <button onClick={saveLetter} disabled={saving || !!savedId}
          style={{ background: savedId ? "rgba(13,148,136,0.08)" : BG1, border: `1px solid ${savedId ? "#0d9488" : BD}`, color: savedId ? "#0d9488" : T2, borderRadius: 8, padding: "7px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, cursor: saving || savedId ? "default" : "pointer", transition: "all 0.15s" }}>
          <Icon name={savedId ? "check" : "file"} size={13} color={savedId ? "#0d9488" : T2} />
          {saving ? "Saving…" : savedId ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

function RefinementPanel({ value, onChange, onSubmit, refining }) {
  return (
    <div style={{ background: BG2, ...hairline, borderRadius: 12, padding: "16px 18px" }}>
      <div style={{ fontSize: 12, color: T3, marginBottom: 10 }}>Want changes? Tell me what to adjust…</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={value} onChange={e => onChange(e.target.value)} onKeyDown={e => e.key === "Enter" && onSubmit()}
          placeholder='e.g. "Make it more concise" or "Emphasise my SQL skills more"'
          style={{ flex: 1, background: BG1, border: `1px solid ${BD}`, borderRadius: 8 }} />
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
      <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: T1, letterSpacing: "-0.01em", fontWeight: 500, marginBottom: 6 }}>Cover Letter Generator</div>
      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", padding: "40px 20px" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: BGH, ...hairline, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="file" size={22} color={T3} />
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T1 }}>Build your portfolio first</div>
        <div style={{ fontSize: 13, color: T3, maxWidth: 380, lineHeight: 1.65 }}>Upload your LinkedIn PDF and resume, then build your portfolio. The cover letter generator uses your profile to write a personalised letter.</div>
      </div>
    </div>
  );
}

function JobInputForm({ company, setCompany, role, setRole, jd, setJd, onGenerate, loading, error }) {
  return (
    <>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)"
          style={{ flex: 1, background: BG1, border: `1px solid ${BD}`, borderRadius: 8 }} />
        <input value={role} onChange={e => setRole(e.target.value)} placeholder="Role title (optional)"
          style={{ flex: 1, background: BG1, border: `1px solid ${BD}`, borderRadius: 8 }} />
      </div>
      <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description here..." rows={7}
        style={{ width: "100%", marginBottom: 12, resize: "vertical", background: BG1, border: `1px solid ${BD}`, borderRadius: 8 }} />
      <Btn onClick={onGenerate} disabled={loading || !jd.trim()} style={{ marginBottom: 24 }}>
        {loading ? <><Spinner size={14} color="#fff" /> Generating…</> : <><Icon name="zap" size={14} color="#fff" /> Generate Cover Letter</>}
      </Btn>
      {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</div>}
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
      ? `<p style="margin:0 0 2px 0;font-size:12px;color:#767586">${contactLine}</p><p style="margin:0 0 1.2em 0"> </p>`
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
      <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: T1, letterSpacing: "-0.01em", fontWeight: 500, marginBottom: 6 }}>Cover Letter Generator</div>
      <div style={{ color: T3, fontSize: 13, marginBottom: 18 }}>Paste a job description and get a tailored cover letter based on your full portfolio</div>
      <JobInputForm company={company} setCompany={setCompany} role={role} setRole={setRole} jd={jd} setJd={setJd} onGenerate={generate} loading={status.loading} error={status.error} />
      {result && (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          <LetterToolbar copy={copy} copied={copied} onDownload={() => downloadPDF(getEditorText, profile, company, jd)} saveLetter={saveLetter} saving={status.saving} savedId={status.savedId} fmt={fmt} />
          <div ref={editorRef} contentEditable suppressContentEditableWarning
            style={{ background: BG1, border: `1px solid ${BD}`, borderRadius: 12, padding: "24px 28px", fontSize: 14, lineHeight: 1.85, color: T2, marginBottom: 8, outline: "none", minHeight: 260 }} />
          <RefinementPanel value={refinement} onChange={setRefinement} onSubmit={refine} refining={status.refining} />
        </div>
      )}
    </div>
  );
}

export default CoverLetter;
