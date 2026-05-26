import { Spinner } from "../ui/primitives";
import Icon from "../ui/Icon";
import ProfileCard from "./ProfileCard";

const T = { r: "12px" };

// ─── CandidateGrid ────────────────────────────────────────────────────────────
function CandidateGrid({ filtered, search, setSelectedProfile }) {
  if (filtered.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", color: "var(--text3)", fontSize: 14, background: "var(--bg1)", borderRadius: T.r, border: "1px solid var(--line)", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
        {search ? "No candidates match your search." : "No profiles available yet."}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
      {filtered.map(p => (
        <div key={p.user_id} onClick={() => setSelectedProfile(p)} style={{ cursor: "pointer" }}>
          <ProfileCard profile={p} />
        </div>
      ))}
    </div>
  );
}

// ─── TalentPool ───────────────────────────────────────────────────────────────
function TalentPool({ profiles, search, setSearch, poolLoading, setSelectedProfile }) {
  const filtered = profiles.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q) || p.tagline?.toLowerCase().includes(q) || p.current_role?.toLowerCase().includes(q) || p.skills?.some(s => s.toLowerCase().includes(q));
  });

  return (
    <section>
      <h2 style={{ fontFamily: "var(--serif, 'Playfair Display', serif)", fontSize: 24, fontWeight: 700, color: "var(--text)", margin: "0 0 6px", letterSpacing: "-0.01em" }}>Talent Pool</h2>
      <p style={{ fontSize: 13, color: "var(--text3)", margin: "0 0 24px", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>Browse AI-powered portfolios from registered job seekers.</p>
      <div style={{ position: "relative", maxWidth: 480, marginBottom: 28 }}>
        <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
          <Icon name="search" size={15} color="var(--text3)" />
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, role, or skill…"
          style={{ width: "100%", background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: T.r, padding: "10px 14px 10px 40px", fontSize: 14, color: "var(--text)", outline: "none", boxSizing: "border-box", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.18)", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}
        />
      </div>
      {poolLoading
        ? <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>
        : <CandidateGrid filtered={filtered} search={search} setSelectedProfile={setSelectedProfile} />}
    </section>
  );
}

export default TalentPool;
