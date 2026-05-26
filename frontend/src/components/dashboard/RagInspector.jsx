import { useState, useEffect } from "react";
import { API } from "../../lib/api";

// ─── ScoreBar ──────────────────────────────────────────────────────────────────
function ScoreBar({ label, value, max = 5 }) {
  const pct = value ? (value / max) * 100 : 0;
  const color = value >= 4 ? "var(--teal, #2dd4bf)" : value >= 3 ? "var(--amber, #f59f00)" : "var(--red, #ef4444)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: "var(--text3)", width: 110, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: "var(--bg3)", borderRadius: 100, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 100, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, width: 30, textAlign: "right", flexShrink: 0 }}>
        {value ? `${value}/5` : "—"}
      </span>
    </div>
  );
}

// ─── RagMetricGrid ─────────────────────────────────────────────────────────────
function RagMetricGrid({ stats }) {
  const avg = stats?.averages;
  const items = [
    { label: "Total Evals", value: stats?.total_evaluations, suffix: "" },
    { label: "Faithfulness", value: avg?.faithfulness, suffix: "/5" },
    { label: "Relevancy", value: avg?.relevancy, suffix: "/5" },
    { label: "Context Quality", value: avg?.context_quality, suffix: "/5" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
      {items.map(({ label, value, suffix }) => {
        const num = typeof value === "number" ? value : null;
        const color = num >= 4 ? "var(--teal, #2dd4bf)" : num >= 3 ? "var(--amber, #f59f00)" : num !== null ? "var(--red, #ef4444)" : "var(--accent)";
        return (
          <div key={label} style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color }}>
              {num !== null ? `${num.toFixed(1)}${suffix}` : value ?? "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── RagEvalsTable ─────────────────────────────────────────────────────────────
function RagEvalsTable({ recent }) {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", display: "grid", gridTemplateColumns: "1fr 50px 50px 50px" }}>
        <span>Question</span><span style={{ textAlign: "center" }}>Faith</span><span style={{ textAlign: "center" }}>Relev</span><span style={{ textAlign: "center" }}>Ctx</span>
      </div>
      {recent.slice(0, 8).map((r, i) => (
        <div key={i} style={{ padding: "8px 14px", borderBottom: i < Math.min(7, recent.length - 1) ? "1px solid var(--line)" : "none", display: "grid", gridTemplateColumns: "1fr 50px 50px 50px", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.question}</span>
          {[r.faithfulness, r.relevancy, r.context_quality].map((v, j) => (
            <span key={j} style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: v >= 4 ? "var(--teal, #2dd4bf)" : v >= 3 ? "var(--amber, #f59f00)" : "var(--red, #ef4444)" }}>{v ?? "—"}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── RagResultDisplay ─────────────────────────────────────────────────────────
function RagResultDisplay({ result }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Generated Answer</div>
        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{result.answer}</div>
      </div>
      {result.judge && Object.keys(result.judge).length > 0 && (
        <div style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: 10, padding: "14px 16px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>LLM-as-Judge Scores</div>
          <ScoreBar label="Faithfulness" value={result.judge.faithfulness} />
          <ScoreBar label="Relevancy" value={result.judge.relevancy} />
          <ScoreBar label="Context Quality" value={result.judge.context_quality} />
          {result.judge.reasoning && (
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)", fontStyle: "italic", borderTop: "1px solid var(--line)", paddingTop: 10 }}>{result.judge.reasoning}</div>
          )}
        </div>
      )}
      <div style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Retrieved Chunks ({result.chunks.length})
        </div>
        {result.chunks.map((chunk, i) => (
          <div key={i} style={{ padding: "12px 14px", borderBottom: i < result.chunks.length - 1 ? "1px solid var(--line)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, background: "var(--accent)", color: "#fff", borderRadius: 100, padding: "2px 7px" }}>#{chunk.rank}</span>
              <span style={{ fontSize: 11, color: "var(--text3)", flex: 1 }}>{chunk.source}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: chunk.score > 0.5 ? "var(--teal, #2dd4bf)" : chunk.score > 0.25 ? "var(--amber, #f59f00)" : "var(--text3)", background: "var(--bg3)", padding: "2px 8px", borderRadius: 100 }}>
                {chunk.score.toFixed(3)}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5, fontFamily: "var(--mono, monospace)" }}>{chunk.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RagInspector ─────────────────────────────────────────────────────────────
export function RagInspector({ userId }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/rag/stats/${userId}`)
      .then(r => r.json()).then(d => setStats(d)).catch(() => {}).finally(() => setStatsLoading(false));
  }, [userId]);

  const run = async () => {
    if (!question.trim() || loading) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${API}/rag/inspect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, question: question.trim() }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || "Failed"); }
      const data = await res.json();
      setResult(data);
      fetch(`${API}/rag/stats/${userId}`).then(r => r.json()).then(setStats).catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>RAG Performance Overview</div>
      {statsLoading ? (
        <div style={{ fontSize: 13, color: "var(--text3)" }}>Loading stats…</div>
      ) : stats?.total_evaluations === 0 ? (
        <div style={{ fontSize: 13, color: "var(--text3)", padding: "16px", background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--line)" }}>No evaluations yet — run an inspect query below to start collecting scores.</div>
      ) : (
        <>
          <RagMetricGrid stats={stats} />
          {stats?.recent?.length > 0 && <RagEvalsTable recent={stats.recent} />}
        </>
      )}
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", margin: "28px 0 12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>RAG Inspector</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && run()}
          placeholder="Ask any question to inspect retrieval…"
          style={{ flex: 1, borderRadius: 8, padding: "10px 14px", background: "var(--bg1)", border: "1px solid var(--line)", color: "var(--text2)", fontFamily: "var(--sans)", fontSize: 13, outline: "none" }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(129,140,248,0.4)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--line)"; }}
        />
        <button onClick={run} disabled={loading || !question.trim()}
          style={{ padding: "10px 18px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: loading || !question.trim() ? "not-allowed" : "pointer", opacity: loading || !question.trim() ? 0.5 : 1, whiteSpace: "nowrap", fontFamily: "var(--sans)" }}>
          {loading ? "Running…" : "Run"}
        </button>
      </div>
      {error && <div style={{ fontSize: 13, color: "var(--red)", marginBottom: 16 }}>{error}</div>}
      {result && <RagResultDisplay result={result} />}
    </div>
  );
}

export default RagInspector;
