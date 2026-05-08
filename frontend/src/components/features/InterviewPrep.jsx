import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
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

function QuestionCard({ q, i, copied, onCopy, typeColor, typeBg, typeBorder, typeLabel }) {
  const color  = typeColor[q.type]  || P;
  const bg     = typeBg?.[q.type]   || "rgba(70,72,212,0.08)";
  const border = typeBorder?.[q.type] || "rgba(70,72,212,0.25)";
  return (
    <div className="c-hover" style={{ background: BG1, ...hairline, borderRadius: 12, padding: "20px 22px", borderLeft: `3px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {typeLabel[q.type] || q.type}
          </span>
          <span style={{ fontSize: 12, color: T3 }}>Q{i + 1}</span>
        </div>
        <button onClick={() => onCopy(i, `Q: ${q.question}\n\nTalking point: ${q.talking_point}`)}
          className="b-ghost"
          style={{ background: BG1, border: `1px solid ${BD}`, borderRadius: 6, color: copied === i ? "#0d9488" : T3, padding: "3px 9px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <Icon name={copied === i ? "check" : "copy"} size={11} color={copied === i ? "#0d9488" : T3} />
          {copied === i ? "Copied" : "Copy"}
        </button>
      </div>
      <div style={{ fontWeight: 600, fontSize: 14.5, color: T1, marginBottom: 8, lineHeight: 1.5 }}>"{q.question}"</div>
      {q.why_asked && (
        <div style={{ fontSize: 12, color: T3, marginBottom: 10, fontStyle: "italic" }}>
          Why asked: {q.why_asked}
        </div>
      )}
      <div style={{ background: BG2, borderRadius: 8, padding: "12px 14px", borderLeft: `2px solid ${color}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Your talking point</div>
        <div style={{ fontSize: 13, color: T2, lineHeight: 1.75 }}>{q.talking_point}</div>
      </div>
    </div>
  );
}

const INTERVIEW_TYPES = [
  { id: "behavioral",    label: "Behavioral",          color: "#db2777",  bg: "rgba(219,39,119,0.08)",   border: "rgba(219,39,119,0.25)" },
  { id: "technical",     label: "Technical / Coding",  color: "#0d9488",  bg: "rgba(13,148,136,0.08)",   border: "rgba(13,148,136,0.25)" },
  { id: "case_study",    label: "Case Study",          color: "#d97706",  bg: "rgba(217,119,6,0.08)",    border: "rgba(217,119,6,0.25)"  },
  { id: "system_design", label: "System Design",       color: P,          bg: "rgba(70,72,212,0.08)",    border: "rgba(70,72,212,0.25)"  },
  { id: "hr_culture",    label: "HR / Culture",        color: "#16a34a",  bg: "rgba(22,163,74,0.08)",    border: "rgba(22,163,74,0.25)"  },
];

function InterviewPrep({ userId, jd: initialJd }) {
  const [jd, setJd] = useState(initialJd || "");
  const [selectedTypes, setSelectedTypes] = useState(["behavioral", "technical"]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const TYPE_COLOR  = Object.fromEntries(INTERVIEW_TYPES.map(t => [t.id, t.color]));
  const TYPE_BG     = Object.fromEntries(INTERVIEW_TYPES.map(t => [t.id, t.bg]));
  const TYPE_BORDER = Object.fromEntries(INTERVIEW_TYPES.map(t => [t.id, t.border]));
  const TYPE_LABEL  = Object.fromEntries(INTERVIEW_TYPES.map(t => [t.id, t.label]));

  const toggleType = (id) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(t => t !== id) : prev) : [...prev, id]
    );
  };

  const generate = async () => {
    if (!jd.trim() || selectedTypes.length === 0) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await axios.post(`${API}/interview-prep`, { user_id: userId, job_description: jd, interview_types: selectedTypes });
      setResult(res.data.questions || []);
    } catch { setError("Failed to generate. Please try again."); }
    finally { setLoading(false); }
  };

  const copyQ = (i, text) => {
    navigator.clipboard.writeText(text);
    setCopied(i); setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 24, color: T1, letterSpacing: "-0.01em", fontWeight: 500, marginBottom: 6 }}>Interview Prep</div>
      <div style={{ color: T3, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        Select interview types, paste a job description, and get targeted questions with talking points drawn from your actual profile.
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Interview Types (select all that apply)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {INTERVIEW_TYPES.map(t => {
            const active = selectedTypes.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggleType(t.id)}
                style={{
                  padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: active ? t.bg : BG2,
                  border: `1.5px solid ${active ? t.color : BD}`,
                  color: active ? t.color : T3,
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
                }}>
                {active && <Icon name="check" size={12} color={t.color} />}
                {t.label}
              </button>
            );
          })}
        </div>
        {selectedTypes.length > 1 && (
          <div style={{ marginTop: 8, fontSize: 12, color: T3 }}>
            ~{Math.ceil(8 / selectedTypes.length)} questions per type · {selectedTypes.length * Math.ceil(8 / selectedTypes.length)} total
          </div>
        )}
      </div>

      <textarea value={jd} onChange={e => setJd(e.target.value)}
        placeholder="Paste the job description here..."
        rows={6}
        style={{ width: "100%", marginBottom: 12, resize: "vertical", background: BG1, border: `1px solid ${BD}`, borderRadius: 8 }} />
      <Btn onClick={generate} disabled={loading || !jd.trim()} style={{ marginBottom: 24 }}>
        {loading ? <><Spinner size={14} color="#fff" /> Generating questions…</> : <><Icon name="zap" size={14} color="#fff" /> Generate Questions</>}
      </Btn>
      {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp 0.3s ease" }}>
          {result.map((q, i) => (
            <QuestionCard key={i} q={q} i={i} copied={copied} onCopy={copyQ} typeColor={TYPE_COLOR} typeBg={TYPE_BG} typeBorder={TYPE_BORDER} typeLabel={TYPE_LABEL} />
          ))}
        </div>
      )}
    </div>
  );
}

export default InterviewPrep;
