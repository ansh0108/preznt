import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner, SecHead } from "../ui/primitives";

function PortfolioAnalytics({ portfolioId, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API}/analytics/${portfolioId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data))
      .catch(() => setError("Could not load analytics."))
      .finally(() => setLoading(false));
  }, [portfolioId]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>;
  if (error) return <div style={{ color: "var(--red)", fontSize: 13, padding: 20 }}>{error}</div>;

  const maxViews = data.views_by_day.length > 0 ? Math.max(...data.views_by_day.map(d => d.count), 1) : 1;

  const fmtDate = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const fmtTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const tabLabels = { overview: "Overview", projects: "Projects", chat: "Ask AI" };

  return (
    <div style={{ animation: "fadeUp 0.25s ease" }}>
      <SecHead>Portfolio Analytics</SecHead>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Total Views", value: data.total_views, color: "var(--accent)" },
          { label: "AI Questions Asked", value: data.recent_questions.length, color: "var(--teal)" },
          { label: "Tab Interactions", value: Object.values(data.tab_clicks).reduce((a, b) => a + b, 0), color: "var(--rose)" },
        ].map(s => (
          <div key={s.label} className="card-glow" style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color, opacity: 0.5, borderRadius: "var(--r-lg) var(--r-lg) 0 0" }} />
            <div style={{ fontSize: 34, fontWeight: 800, color: s.color, marginBottom: 4, fontFamily: "var(--serif)", animation: "scaleIn 0.4s ease" }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: "var(--text3)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Views over time */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Views — last 14 days</div>
        {data.views_by_day.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text3)" }}>No views recorded yet. Share your portfolio to get started.</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {data.views_by_day.map((d, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 600 }}>{d.count}</div>
                <div title={`${d.count} views on ${fmtDate(d.date)}`}
                  style={{ width: "100%", background: "var(--accent)", borderRadius: "4px 4px 0 0", height: `${Math.max(4, (d.count / maxViews) * 52)}px`, transition: "height 0.3s ease, opacity 0.15s, transform 0.15s", cursor: "default", opacity: 0.75 }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scaleX(1.1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.75"; e.currentTarget.style.transform = "scaleX(1)"; }} />
                <div style={{ fontSize: 9, color: "var(--text3)", whiteSpace: "nowrap" }}>{fmtDate(d.date).split(" ")[1]}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tab breakdown */}
      {Object.keys(data.tab_clicks).length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Tab Breakdown</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.entries(data.tab_clicks).map(([tab, count]) => (
              <div key={tab} style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>{tabLabels[tab] || tab}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent AI questions */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 14 }}>Recent AI Questions</div>
        {data.recent_questions.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text3)" }}>No questions asked yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.recent_questions.slice(0, 15).map((q, i) => (
              <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>{q.question}</span>
                <span style={{ fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap", flexShrink: 0, marginTop: 2 }}>{fmtTime(q.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioAnalytics;
