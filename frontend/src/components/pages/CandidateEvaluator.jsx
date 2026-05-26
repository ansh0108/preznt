import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { nameToSlug } from "../../lib/utils";
import { Spinner, Btn, Pill } from "../ui/primitives";
import Icon from "../ui/Icon";

const P    = "var(--accent)";
const T1   = "var(--text)";
const T2   = "var(--text2)";
const T3   = "var(--text3)";
const BG   = "var(--bg)";
const BG1  = "var(--bg1)";
const BG2  = "var(--bg2)";
const BGH  = "var(--bg3)";
const BGFIX = "var(--bg4)";
const BD   = "var(--line)";
const hairline = { border: `1px solid ${BD}` };
const luxShadow = "0 20px 40px -10px rgba(0,0,0,0.4)";

function SLabel({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: T3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
    </div>
  );
}

function FitScoreHeader({ score, scoreColor, fitColor, fitResult }) {
  return (
    <div style={{ background: BG2, border: `1px solid ${fitColor}40`, borderRadius: 16, padding: "18px 20px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ textAlign: "center", flexShrink: 0 }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: scoreColor, lineHeight: 1, fontFamily: "var(--serif)" }}>{score}</div>
        <div style={{ fontSize: 11, color: T3, marginTop: 4, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>ATS Score</div>
        <div style={{ marginTop: 8, width: 64, height: 4, background: BGH, borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${score}%`, background: scoreColor, borderRadius: 2 }} />
        </div>
        <div style={{ marginTop: 8 }}><Pill color={fitColor}>{fitResult.overall_fit} Fit</Pill></div>
      </div>
      <div style={{ flex: 1, minWidth: 180 }}>
        <SLabel>Summary</SLabel>
        <div style={{ color: T2, fontSize: 14, lineHeight: 1.7 }}>{fitResult.summary}</div>
      </div>
    </div>
  );
}

function KeywordsGrid({ fitResult }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: "14px 16px" }}>
        <SLabel>Matching Keywords</SLabel>
        {fitResult.matching_keywords?.length > 0
          ? <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{fitResult.matching_keywords.map((k, i) => <Pill key={i} color="#0d9488">{k}</Pill>)}</div>
          : <div style={{ fontSize: 13, color: T3 }}>No matches found.</div>}
      </div>
      <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: "14px 16px" }}>
        <SLabel>Missing Keywords</SLabel>
        {fitResult.missing_keywords?.length > 0
          ? <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {fitResult.missing_keywords.map((k, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 10px", background: BGH, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: T1 }}>{k.keyword}</div>
                    <div style={{ color: T3, fontSize: 12, marginTop: 2 }}>{k.context}</div>
                  </div>
                  <Pill color={k.importance === "Must Have" ? "#ef4444" : "#d97706"}>{k.importance}</Pill>
                </div>
              ))}
            </div>
          : <div style={{ fontSize: 13, color: T3 }}>No critical gaps!</div>}
      </div>
    </div>
  );
}

function StrengthsList({ strengths }) {
  if (!strengths?.length) return null;
  return (
    <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: "14px 16px" }}>
      <SLabel>Strengths</SLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {strengths.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "10px 12px", background: BG2, borderRadius: 8 }}>
            <Icon name="check" size={14} color="#0d9488" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: T1, marginBottom: 2 }}>{s.point}</div>
              <div style={{ fontSize: 13, color: T3, lineHeight: 1.6 }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FitResult({ fitResult }) {
  const score = fitResult.ats_score;
  const scoreColor = score >= 70 ? "#0d9488" : score >= 45 ? "#d97706" : "#ef4444";
  const fitColor = fitResult.overall_fit === "Strong" ? "#0d9488" : fitResult.overall_fit === "Moderate" ? "#d97706" : "#ef4444";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.3s ease" }}>
      <FitScoreHeader score={score} scoreColor={scoreColor} fitColor={fitColor} fitResult={fitResult} />
      <KeywordsGrid fitResult={fitResult} />
      <StrengthsList strengths={fitResult.strengths} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {fitResult.suggested_skills?.length > 0 && (
          <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: "14px 16px" }}>
            <SLabel>Skills Gaps</SLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{fitResult.suggested_skills.map((s, i) => <Pill key={i} color="#d97706">{s}</Pill>)}</div>
          </div>
        )}
        {fitResult.quick_wins?.length > 0 && (
          <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: "14px 16px" }}>
            <SLabel>Quick Wins</SLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {fitResult.quick_wins.map((w, i) => <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: T2, lineHeight: 1.5 }}><span style={{ color: P, flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>{w}</div>)}
            </div>
          </div>
        )}
      </div>
      {fitResult.tone_feedback && (
        <div style={{ background: BG2, border: `1px solid ${BD}`, borderRadius: 12, padding: "14px 16px" }}>
          <SLabel>Positioning Feedback</SLabel>
          <div style={{ fontSize: 13, color: T2, lineHeight: 1.7 }}>{fitResult.tone_feedback}</div>
        </div>
      )}
    </div>
  );
}

function EvalCardHeader({ c, tab, setTab, onRemove }) {
  return (
    <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BD}`, background: BG2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T1, fontFamily: "var(--serif)" }}>{c.name}</div>
          {c.experience?.[0] && <div style={{ fontSize: 12, color: T2 }}>{c.experience[0].title} at {c.experience[0].company}</div>}
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {c.skills?.slice(0, 4).map((s, i) => <Pill key={i} color={P}>{s}</Pill>)}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 2, background: BG, border: `1px solid ${BD}`, borderRadius: 8, padding: "3px" }}>
          {[{ id: "portfolio", label: "View Portfolio" }, { id: "fit", label: "JD Fit" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ background: tab === t.id ? BG1 : "transparent", color: tab === t.id ? T1 : T3, padding: "5px 13px", borderRadius: 8, fontSize: 12, fontWeight: tab === t.id ? 600 : 400, border: tab === t.id ? `1px solid ${BD}` : "1px solid transparent", cursor: "pointer" }}>{t.label}</button>
          ))}
        </div>
        <button onClick={onRemove} style={{ background: BG1, border: `1px solid ${BD}`, borderRadius: 8, color: T3, padding: "5px 8px", cursor: "pointer", fontSize: 11 }}>✕</button>
      </div>
    </div>
  );
}

function CandidateEvaluator({ candidate: c, onRemove }) {
  const [tab, setTab] = useState("portfolio");
  const [jd, setJd] = useState("");
  const [fitResult, setFitResult] = useState(null);
  const [fitLoading, setFitLoading] = useState(false);
  const [fitError, setFitError] = useState(null);
  const portfolioUrl = `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(c.name)}-${c.user_id}`;

  const runFit = async () => {
    if (!jd.trim()) return;
    setFitLoading(true); setFitError(null);
    try { const res = await axios.post(`${API}/gap-analysis`, { user_id: c.user_id, job_description: jd.trim() }); setFitResult(res.data); }
    catch { setFitError("Analysis failed. Please try again."); }
    finally { setFitLoading(false); }
  };

  return (
    <div style={{ background: BG1, border: `1px solid ${BD}`, borderRadius: 12, overflow: "hidden", animation: "fadeUp 0.3s ease" }}>
      <EvalCardHeader c={c} tab={tab} setTab={setTab} onRemove={onRemove} />
      {tab === "portfolio" && (
        <div style={{ padding: "18px 20px" }}>
          {c.is_temp
            ? <div style={{ fontSize: 13, color: T3, marginBottom: 12, fontStyle: "italic" }}>Evaluated from uploaded files — no prolio portfolio.</div>
            : <a href={portfolioUrl} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: P, fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 12 }}>Open full portfolio <Icon name="external" size={13} color={P} /></a>}
          {c.tagline && <div style={{ fontSize: 13, color: T3, fontStyle: "italic", marginBottom: 12 }}>{c.tagline}</div>}
          {c.skills?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{c.skills.slice(0, 14).map((s, i) => <Pill key={i} color={P}>{s}</Pill>)}</div>}
          {c.experience?.[0] && <div style={{ marginTop: 12, fontSize: 13, color: T2 }}>{c.experience[0].title} at <span style={{ color: P }}>{c.experience[0].company}</span></div>}
        </div>
      )}
      {tab === "fit" && (
        <div style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: 13, color: T3, marginBottom: 12 }}>Paste a job description to see how well {c.name} fits.</div>
          <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste job description or role requirements…" rows={5} style={{ width: "100%", marginBottom: 12, resize: "vertical", background: BG1, border: `1px solid ${BD}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: T1, outline: "none", boxSizing: "border-box", fontFamily: "var(--sans)" }} />
          <Btn onClick={runFit} disabled={fitLoading || !jd.trim()} style={{ marginBottom: 16 }}>
            {fitLoading ? <><Spinner size={14} color="#fff" /> Analyzing…</> : <><Icon name="target" size={14} color="#fff" /> Analyze Fit</>}
          </Btn>
          {fitError && <div style={{ color: "#ef4444", fontSize: 14 }}>{fitError}</div>}
          {fitResult && !fitResult.error && <FitResult fitResult={fitResult} />}
        </div>
      )}
    </div>
  );
}

export default CandidateEvaluator;
