import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner, Btn, SecHead, Pill } from "../ui/primitives";
import Icon from "../ui/Icon";

function GapAnalysis({ userId, role, setRole, result, setResult, error, setError }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);

  const analyze = async () => {
    if (!role.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await axios.post(`${API}/gap-analysis`, { user_id: userId, job_description: role });
      setResult(res.data);
    }
    catch { setError("Analysis failed. Please try again."); }
    finally { setLoading(false); }
  };

  const copyText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const FIT_COLOR = { "Strong": "var(--teal)", "Moderate": "var(--amber)", "Weak": "var(--red)" };
  const FIT_BG    = { "Strong": "rgba(45,212,191,0.08)", "Moderate": "rgba(251,191,36,0.08)", "Weak": "rgba(248,113,113,0.08)" };

  const Section = ({ title, color, icon, children }) => (
    <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        {icon && <Icon name={icon} size={14} color={color || "var(--text3)"} />}
        <div style={{ fontWeight: 700, fontSize: 13, color: color || "var(--text)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
      </div>
      {children}
    </div>
  );

  const score = result?.ats_score;
  const scoreColor = score >= 70 ? "var(--teal)" : score >= 45 ? "var(--amber)" : "var(--red)";

  return (
    <div>
      <SecHead>ATS Gap Analysis</SecHead>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 18 }}>Paste a full job description to get an ATS-optimised breakdown of your fit — match score, missing keywords, and bullet rewrites.</div>

      <textarea
        value={role}
        onChange={e => setRole(e.target.value)}
        placeholder="Paste the full job description here…"
        rows={7}
        style={{ width: "100%", marginBottom: 12, resize: "vertical", fontSize: 13 }}
      />
      <Btn onClick={analyze} disabled={loading || !role.trim()} style={{ marginBottom: 24 }}>
        {loading
          ? <><Spinner size={14} color="#fff" /> Analyzing…</>
          : <><Icon name="target" size={14} color="#fff" /> Run ATS Analysis</>}
      </Btn>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {result && !result.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadeUp 0.35s ease" }}>
          <div style={{ background: FIT_BG[result.overall_fit] || "var(--bg1)", border: `1px solid ${FIT_COLOR[result.overall_fit] || "var(--line2)"}`, borderRadius: "var(--r-xl)", padding: "22px 24px", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 58, fontWeight: 800, color: scoreColor, lineHeight: 1, fontFamily: "var(--serif)", animation: "scaleIn 0.4s ease" }}>{score}</div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 4, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>ATS Score</div>
              <div style={{ marginTop: 10, width: 80, height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden", margin: "10px auto 10px" }}>
                <div style={{ height: "100%", width: `${score}%`, background: scoreColor, borderRadius: 2 }} />
              </div>
              <Pill color={FIT_COLOR[result.overall_fit]}>{result.overall_fit} Match</Pill>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Summary</div>
              <div style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.75 }}>{result.summary}</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Section title="Matching Keywords" color="var(--teal)" icon="check">
              {result.matching_keywords?.length > 0
                ? <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{result.matching_keywords.map((k, i) => <Pill key={i} color="var(--teal)">{k}</Pill>)}</div>
                : <div style={{ fontSize: 13, color: "var(--text3)" }}>No direct keyword matches found.</div>}
            </Section>
            <Section title="Missing Keywords" color="var(--amber)" icon="target">
              {result.missing_keywords?.length > 0
                ? <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {result.missing_keywords.map((k, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "10px 12px", background: "var(--bg2)", borderRadius: "var(--r-md)" }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{k.keyword}</div>
                          <div style={{ color: "var(--text3)", fontSize: 12, marginTop: 2 }}>{k.context}</div>
                        </div>
                        <Pill color={k.importance === "Must Have" ? "var(--red)" : "var(--amber)"}>{k.importance}</Pill>
                      </div>
                    ))}
                  </div>
                : <div style={{ fontSize: 13, color: "var(--text3)" }}>Great — no critical gaps found!</div>}
            </Section>
          </div>

          {result.strengths?.length > 0 && (
            <Section title="Strengths" color="var(--accent)" icon="star">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {result.strengths.map((s, i) => (
                  <div key={i} className="c-hover" style={{ display: "flex", gap: 12, padding: "12px 14px", background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)" }}>
                    <Icon name="check" size={14} color="var(--teal)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 3 }}>{s.point}</div>
                      <div style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6 }}>{s.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {result.suggested_skills?.length > 0 && (
            <Section title="Skills to Add to Your Resume" color="var(--teal)" icon="plus">
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>
                These tools and skills appear in the JD but are missing from your profile. Add them to your skills section if you have experience with them.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {result.suggested_skills.map((skill, i) => (
                  <button key={i} onClick={() => copyText(skill, `skill-${i}`)}
                    className="b-pill"
                    style={{
                      padding: "6px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      background: copied === `skill-${i}` ? "rgba(45,212,191,0.12)" : "var(--bg2)",
                      border: `1px solid ${copied === `skill-${i}` ? "var(--teal)" : "var(--line2)"}`,
                      color: copied === `skill-${i}` ? "var(--teal)" : "var(--text2)",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                    {copied === `skill-${i}` ? <Icon name="check" size={11} color="var(--teal)" /> : <Icon name="plus" size={11} color="var(--text3)" />}
                    {skill}
                  </button>
                ))}
              </div>
            </Section>
          )}

          {result.bullet_improvements?.filter(b => b.section?.toLowerCase() !== "skills").length > 0 && (
            <Section title="Resume Bullet Rewrites (STAR Format)" color="var(--rose)" icon="wrench">
              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>
                Rewrites match the original length so they slot into your resume without breaking formatting. Click the improved version to copy.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {result.bullet_improvements.filter(b => b.section?.toLowerCase() !== "skills").map((b, i) => (
                  <div key={i} style={{ borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--line2)" }}>
                    <div style={{ padding: "10px 14px", background: "var(--bg2)", borderBottom: "1px solid var(--line)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>{b.section}</div>
                      <div style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", lineHeight: 1.6 }}>{b.original}</div>
                    </div>
                    <div
                      onClick={() => copyText(b.improved, i)}
                      style={{ padding: "12px 14px", background: copied === i ? "rgba(45,212,191,0.1)" : "rgba(129,140,248,0.06)", cursor: "pointer", transition: "background 0.15s" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, flex: 1 }}>{b.improved}</div>
                        <div style={{ flexShrink: 0 }}>
                          <Icon name={copied === i ? "check" : "copy"} size={13} color={copied === i ? "var(--teal)" : "var(--text3)"} />
                        </div>
                      </div>
                      {b.why && <div style={{ fontSize: 11.5, color: "var(--accent)", marginTop: 6, lineHeight: 1.5 }}>{b.why}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {result.tone_feedback && (
              <Section title="Tone & Positioning" color="var(--text2)" icon="user">
                <div style={{ fontSize: 13.5, color: "var(--text2)", lineHeight: 1.75 }}>{result.tone_feedback}</div>
              </Section>
            )}
            {result.differentiation_tips?.length > 0 && (
              <Section title="Stand Out Tips" color="var(--rose)" icon="trending">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.differentiation_tips.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                      <Icon name="arrow" size={13} color="var(--rose)" style={{ flexShrink: 0, marginTop: 3 }} /> {t}
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {result.quick_wins?.length > 0 && (
            <Section title="Quick Wins — Do This Week" color="var(--teal)" icon="zap">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {result.quick_wins.map((w, i) => (
                  <div key={i} className="c-hover" style={{ display: "flex", gap: 10, padding: "10px 12px", background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                    <span style={{ color: "var(--teal)", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span> {w}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}

      {result?.error && (
        <div style={{ color: "var(--red)", fontSize: 13 }}>Analysis error: {result.error}</div>
      )}
    </div>
  );
}

export default GapAnalysis;
