import Icon from "../ui/Icon";

// ─── DeleteModal ──────────────────────────────────────────────────────────────
function DeleteModal({ portfolioId, portfolios, deleteLoading, onConfirm, onCancel }) {
  const name = portfolios.find(p => p.id === portfolioId)?.role_name;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, animation: "fadeIn 0.15s ease" }}>
      <div style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "28px 32px", maxWidth: 380, width: "90%", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>Delete Portfolio?</div>
        <div style={{ fontSize: 13, color: "var(--text3)", lineHeight: 1.6, marginBottom: 24 }}>
          This will permanently delete <strong style={{ color: "var(--text)" }}>{name}</strong> and all its data. This cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={{ padding: "9px 18px", borderRadius: "var(--r-md)", background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleteLoading} style={{ padding: "9px 18px", borderRadius: "var(--r-md)", background: "var(--red)", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: deleteLoading ? 0.6 : 1 }}>
            {deleteLoading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PortfolioNewForm ──────────────────────────────────────────────────────────
function PortfolioNewForm({ newRoleName, setNewRoleName, creatingLoading, createPortfolio }) {
  return (
    <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
      <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} onKeyDown={e => e.key === "Enter" && createPortfolio()} placeholder="e.g. Data Analyst" autoFocus
        style={{ flex: 1, fontSize: 12, padding: "6px 10px", background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", color: "var(--text)", outline: "none" }} />
      <button onClick={createPortfolio} disabled={!newRoleName.trim() || creatingLoading}
        style={{ padding: "6px 12px", borderRadius: "var(--r-md)", background: "var(--accent)", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: (!newRoleName.trim() || creatingLoading) ? 0.5 : 1 }}>
        {creatingLoading ? "…" : "Create"}
      </button>
    </div>
  );
}

// ─── PortfolioSwitcher ────────────────────────────────────────────────────────
function PortfolioSwitcher({ portfolios, activePortfolioId, setActivePortfolioId, setProfile, creatingPortfolio, setCreatingPortfolio, newRoleName, setNewRoleName, creatingLoading, createPortfolio, deletingPortfolioId, setDeletingPortfolioId, deletePortfolio, deleteLoading, setPrimary }) {
  if (!portfolios.length) return null;
  const activePill = p => p.id === activePortfolioId;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Portfolios</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {portfolios.map(p => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <button onClick={() => { setActivePortfolioId(p.id); setProfile(null); }}
              style={{ padding: "8px 14px", borderRadius: portfolios.length > 1 ? "100px 0 0 100px" : 100, fontSize: 13, fontWeight: 600, cursor: "pointer", background: activePill(p) ? "var(--accent-d)" : "var(--bg2)", border: `1px solid ${activePill(p) ? "var(--accent)" : "var(--line2)"}`, borderRight: portfolios.length > 1 ? "none" : undefined, color: activePill(p) ? "var(--accent)" : "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
              {p.role_name}
              {p.is_primary && <span style={{ fontSize: 10, color: "var(--amber)", fontWeight: 800 }}>★</span>}
              {p.built && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />}
            </button>
            {portfolios.length > 1 && (
              <button onClick={() => setDeletingPortfolioId(p.id)} title="Delete portfolio"
                style={{ padding: "8px 9px", borderRadius: "0 100px 100px 0", fontSize: 13, cursor: "pointer", background: activePill(p) ? "var(--accent-d)" : "var(--bg2)", border: `1px solid ${activePill(p) ? "var(--accent)" : "var(--line2)"}`, color: "var(--text3)", display: "flex", alignItems: "center", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.borderColor = "var(--red)"; e.currentTarget.style.background = "rgba(248,113,113,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.borderColor = activePill(p) ? "var(--accent)" : "var(--line2)"; e.currentTarget.style.background = activePill(p) ? "var(--accent-d)" : "var(--bg2)"; }}>
                <Icon name="x" size={11} color="currentColor" />
              </button>
            )}
          </div>
        ))}
        <button onClick={() => setCreatingPortfolio(v => !v)}
          style={{ padding: "8px 14px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1px dashed var(--line2)", color: "var(--text3)", transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.color = "var(--text3)"; }}>
          + New
        </button>
      </div>
      {creatingPortfolio && <PortfolioNewForm newRoleName={newRoleName} setNewRoleName={setNewRoleName} creatingLoading={creatingLoading} createPortfolio={createPortfolio} />}
      {portfolios.length > 1 && portfolios.find(p => p.id === activePortfolioId && !p.is_primary) && (
        <button onClick={() => setPrimary(activePortfolioId)}
          style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: "var(--text3)", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", cursor: "pointer", padding: "7px 14px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--amber)" }}>★</span> Set as primary portfolio
        </button>
      )}
      {deletingPortfolioId && (
        <DeleteModal portfolioId={deletingPortfolioId} portfolios={portfolios} deleteLoading={deleteLoading}
          onConfirm={() => deletePortfolio(deletingPortfolioId)} onCancel={() => setDeletingPortfolioId(null)} />
      )}
    </div>
  );
}

export default PortfolioSwitcher;
