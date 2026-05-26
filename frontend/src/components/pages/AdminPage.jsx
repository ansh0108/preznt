import { useState } from "react";
import { RagInspector } from "../dashboard/RagInspector";

export default function AdminPage({ auth, onBack }) {
  const portfolios = auth?.portfolios || [];
  const [selectedId, setSelectedId] = useState(
    auth?.primary_portfolio_id || portfolios[0]?.id || ""
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg1)",
      color: "var(--text)",
      fontFamily: "var(--sans)",
      padding: "32px 40px",
      maxWidth: 900,
      margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Admin — Internal Only
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>AI Health Monitor</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {portfolios.length > 1 && (
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              style={{
                background: "var(--bg2)", border: "1px solid var(--line)",
                color: "var(--text2)", borderRadius: 8, padding: "7px 12px",
                fontSize: 13, fontFamily: "var(--sans)", outline: "none",
              }}
            >
              {portfolios.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.id}</option>
              ))}
            </select>
          )}
          <button
            onClick={onBack}
            style={{
              background: "var(--bg2)", border: "1px solid var(--line)",
              color: "var(--text3)", borderRadius: 8, padding: "7px 14px",
              fontSize: 13, cursor: "pointer", fontFamily: "var(--sans)",
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {selectedId
        ? <RagInspector userId={selectedId} />
        : <div style={{ fontSize: 13, color: "var(--text3)" }}>No portfolio found. Build your portfolio first.</div>
      }
    </div>
  );
}
