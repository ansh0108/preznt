import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner, Btn, SecHead } from "../ui/primitives";
import Icon from "../ui/Icon";

const INTERVIEW_TYPES = [
  { id: "behavioral", label: "Behavioral", color: "var(--rose)" },
  { id: "technical", label: "Technical / Coding", color: "var(--teal)" },
  { id: "case_study", label: "Case Study", color: "var(--amber)" },
  { id: "system_design", label: "System Design", color: "var(--accent)" },
  { id: "hr_culture", label: "HR / Culture", color: "var(--green)" },
];

function InterviewPrep({ userId, jd: initialJd }) {
  const [jd, setJd] = useState(initialJd || "");
  const [selectedTypes, setSelectedTypes] = useState(["behavioral", "technical"]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const TYPE_COLOR = Object.fromEntries(INTERVIEW_TYPES.map(t => [t.id, t.color]));
  const TYPE_LABEL = Object.fromEntries(INTERVIEW_TYPES.map(t => [t.id, t.label]));

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
      <SecHead>Interview Prep</SecHead>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        Select interview types, paste a job description, and get targeted questions with talking points drawn from your actual profile.
      </div>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Interview Types (select all that apply)</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {INTERVIEW_TYPES.map(t => {
            const active = selectedTypes.includes(t.id);
            return (
              <button key={t.id} onClick={() => toggleType(t.id)}
                style={{
                  padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: active ? t.color + "18" : "var(--bg2)",
                  border: `1.5px solid ${active ? t.color : "var(--line2)"}`,
                  color: active ? t.color : "var(--text3)",
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6,
                }}>
                {active && <Icon name="check" size={12} color={t.color} />}
                {t.label}
              </button>
            );
          })}
        </div>
        {selectedTypes.length > 1 && (
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--text3)" }}>
            ~{Math.ceil(8 / selectedTypes.length)} questions per type · {selectedTypes.length * Math.ceil(8 / selectedTypes.length)} total
          </div>
        )}
      </div>

      <textarea value={jd} onChange={e => setJd(e.target.value)}
        placeholder="Paste the job description here..."
        rows={6} style={{ width: "100%", marginBottom: 12, resize: "vertical" }} />
      <Btn onClick={generate} disabled={loading || !jd.trim()} style={{ marginBottom: 24 }}>
        {loading ? <><Spinner size={14} color="#fff" /> Generating questions…</> : <><Icon name="zap" size={14} color="#fff" /> Generate Questions</>}
      </Btn>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "fadeUp 0.3s ease" }}>
          {result.map((q, i) => {
            const color = TYPE_COLOR[q.type] || "var(--accent)";
            return (
              <div key={i} className="c-hover" style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px", borderLeft: `3px solid ${color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color, background: color + "18", border: `1px solid ${color}40`, padding: "2px 8px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {TYPE_LABEL[q.type] || q.type}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>Q{i + 1}</span>
                  </div>
                  <button onClick={() => copyQ(i, `Q: ${q.question}\n\nTalking point: ${q.talking_point}`)}
                    className="b-ghost"
                    style={{ background: "transparent", border: "1px solid var(--line2)", borderRadius: "var(--r-sm)", color: copied === i ? "var(--teal)" : "var(--text3)", padding: "3px 9px", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Icon name={copied === i ? "check" : "copy"} size={11} color={copied === i ? "var(--teal)" : "var(--text3)"} />
                    {copied === i ? "Copied" : "Copy"}
                  </button>
                </div>
                <div style={{ fontWeight: 600, fontSize: 14.5, color: "var(--text)", marginBottom: 8, lineHeight: 1.5 }}>"{q.question}"</div>
                {q.why_asked && (
                  <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 10, fontStyle: "italic" }}>
                    Why asked: {q.why_asked}
                  </div>
                )}
                <div style={{ background: "var(--bg1)", borderRadius: "var(--r-md)", padding: "12px 14px", borderLeft: `2px solid ${color}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Your talking point</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.75 }}>{q.talking_point}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default InterviewPrep;
