import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner, Btn, Divider } from "../ui/primitives";
import Icon from "../ui/Icon";
import CandidateEvaluator from "./CandidateEvaluator";
import ProfileCard from "./ProfileCard";
import CandidateProfileView from "./CandidateProfileView";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  primary: "#4648d4",
  text: "#111c2d",
  text2: "#464554",
  text3: "#767586",
  bg: "#f9f9ff",
  card: "#ffffff",
  bg2: "#f0f3ff",
  container: "#e7eeff",
  containerHigh: "#dee8ff",
  primaryFixed: "#e1e0ff",
  hairline: "rgba(0,0,0,0.06)",
  shadow: "0 20px 40px -10px rgba(0,0,0,0.04)",
  r: "12px",
};

// ─── AddByUrl ─────────────────────────────────────────────────────────────────
function AddByUrl({ onAdd }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const add = async () => {
    setError("");
    const idMatch = url.match(/([0-9a-f]{8})(?:[^0-9a-f]|$)/);
    const id = idMatch ? idMatch[1] : url.trim();
    if (!id || id.length !== 8) return setError("Paste a valid portfolio URL.");
    setLoading(true);
    try {
      const r = await axios.get(`${API}/profile/${id}`);
      onAdd(r.data);
      setUrl("");
    } catch { setError("Could not find that portfolio. Check the URL."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div style={{ display: "flex", gap: 10, maxWidth: 640, marginBottom: 8 }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Paste portfolio URL, e.g. prolio.co/#/portfolio/name-id"
          style={{
            flex: 1,
            background: T.card,
            border: `1px solid ${T.hairline}`,
            borderRadius: T.r,
            padding: "10px 14px",
            fontSize: 14,
            color: T.text,
            outline: "none",
            fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
          }}
        />
        <button
          onClick={add}
          disabled={loading || !url.trim()}
          style={{
            background: T.primary,
            color: "#fff",
            border: "none",
            borderRadius: T.r,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            cursor: loading || !url.trim() ? "not-allowed" : "pointer",
            opacity: loading || !url.trim() ? 0.55 : 1,
            display: "flex",
            alignItems: "center",
            gap: 7,
            whiteSpace: "nowrap",
            fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
          }}
        >
          {loading ? <Spinner size={14} color="#fff" /> : "Add Candidate"}
        </button>
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}
    </>
  );
}

// ─── AddByUpload ──────────────────────────────────────────────────────────────
function AddByUpload({ onAdd }) {
  const [name, setName] = useState("");
  const [resume, setResume] = useState(null);
  const [linkedin, setLinkedin] = useState(null);
  const [github, setGithub] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!resume && !linkedin && !github.trim()) return setError("Add at least one file or GitHub URL.");
    setError(""); setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("github_url", github.trim());
      if (resume) fd.append("resume", resume);
      if (linkedin) fd.append("linkedin", linkedin);
      const r = await axios.post(`${API}/evaluate/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      onAdd(r.data);
      setName(""); setResume(null); setLinkedin(null); setGithub("");
    } catch { setError("Upload failed. Please try again."); }
    finally { setLoading(false); }
  };

  const inputSt = {
    width: "100%",
    background: T.card,
    border: `1px solid ${T.hairline}`,
    borderRadius: T.r,
    padding: "9px 12px",
    fontSize: 13,
    color: T.text,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
  };

  const labelSt = {
    fontSize: 11,
    fontWeight: 700,
    color: T.text3,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    display: "block",
    fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
  };

  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.hairline}`,
      borderRadius: T.r,
      padding: "24px",
      maxWidth: 640,
      boxShadow: T.shadow,
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div>
          <span style={labelSt}>Candidate Name</span>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name (optional)" style={inputSt} />
        </div>
        <div>
          <span style={labelSt}>GitHub Profile URL</span>
          <input value={github} onChange={e => setGithub(e.target.value)} placeholder="github.com/username" style={inputSt} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Resume / CV", accept: ".pdf,.docx,.pptx,.txt", file: resume, setFile: setResume },
          { label: "LinkedIn PDF", accept: ".pdf", file: linkedin, setFile: setLinkedin },
        ].map(({ label, accept, file, setFile }) => (
          <label key={label} style={{ cursor: "pointer" }}>
            <span style={labelSt}>{label}</span>
            <div style={{
              border: `1.5px dashed ${file ? T.primary : T.hairline}`,
              borderRadius: T.r,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: file ? T.primaryFixed : T.bg2,
              transition: "all 0.15s",
            }}>
              <Icon name={file ? "check" : "file"} size={14} color={file ? T.primary : T.text3} />
              <span style={{ fontSize: 12.5, color: file ? T.primary : T.text3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
                {file ? file.name : `Upload ${label}`}
              </span>
            </div>
            <input type="file" accept={accept} style={{ display: "none" }} onChange={e => setFile(e.target.files[0] || null)} />
          </label>
        ))}
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <button
        onClick={submit}
        disabled={loading || (!resume && !linkedin && !github.trim())}
        style={{
          background: T.primary,
          color: "#fff",
          border: "none",
          borderRadius: T.r,
          padding: "10px 22px",
          fontSize: 13,
          fontWeight: 600,
          cursor: loading || (!resume && !linkedin && !github.trim()) ? "not-allowed" : "pointer",
          opacity: loading || (!resume && !linkedin && !github.trim()) ? 0.55 : 1,
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
        }}
      >
        {loading
          ? <><Spinner size={14} color="#fff" /> Analyzing…</>
          : <><Icon name="zap" size={14} color="#fff" /> Analyze Candidate</>}
      </button>
    </div>
  );
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────────
function SideNavItem({ icon, label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  const isActive = active || hovered;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        width: "100%",
        background: isActive ? T.bg2 : "transparent",
        border: "none",
        borderRadius: 10,
        padding: "10px 14px",
        cursor: "pointer",
        color: isActive ? T.primary : T.text2,
        fontSize: 14,
        fontWeight: isActive ? 600 : 400,
        textAlign: "left",
        transition: "all 0.14s",
        fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
      }}
    >
      <Icon name={icon} size={16} color={isActive ? T.primary : T.text3} />
      {label}
    </button>
  );
}

// ─── RecruiterDashboard ───────────────────────────────────────────────────────
function RecruiterDashboard({ auth, onLogout }) {
  const [profiles, setProfiles] = useState([]);
  const [poolLoading, setPoolLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [addMode, setAddMode] = useState("url");
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    axios.get(`${API}/profiles/list`)
      .then(r => setProfiles(r.data.profiles || []))
      .catch(() => {})
      .finally(() => setPoolLoading(false));
  }, []);

  const filtered = profiles.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q) || p.tagline?.toLowerCase().includes(q) || p.current_role?.toLowerCase().includes(q) || p.skills?.some(s => s.toLowerCase().includes(q));
  });

  if (selectedProfile) {
    return (
      <CandidateProfileView
        profile={selectedProfile}
        onBack={() => setSelectedProfile(null)}
        onShortlist={() => {}}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 288,
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        background: T.card,
        borderRight: `1px solid ${T.hairline}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
        overflowY: "auto",
      }}>
        {/* Wordmark */}
        <div style={{ padding: "28px 24px 24px" }}>
          <div style={{
            fontFamily: "var(--serif, 'Playfair Display', serif)",
            fontSize: 28,
            fontWeight: 700,
            color: T.primary,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}>
            Prolio
          </div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 4, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)", letterSpacing: "0.04em" }}>
            Recruiter Hub
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "0 12px", flex: 1 }}>
          <SideNavItem icon="search" label="Discover" active={true} />
          <SideNavItem icon="chart" label="Analytics" />
          <SideNavItem icon="file" label="Templates" />
          <SideNavItem icon="zap" label="Help" />
        </nav>

        {/* User card at bottom */}
        <div style={{
          margin: "16px",
          padding: "14px 16px",
          background: T.bg2,
          borderRadius: T.r,
          border: `1px solid ${T.hairline}`,
        }}>
          <div style={{ fontSize: 12, color: T.text2, fontWeight: 600, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
            {auth.email}
          </div>
          <div style={{ fontSize: 11, color: T.text3, marginBottom: 12, fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>Recruiter account</div>
          <button
            onClick={onLogout}
            style={{
              width: "100%",
              background: "transparent",
              border: `1px solid ${T.hairline}`,
              borderRadius: 8,
              color: T.text3,
              padding: "7px 12px",
              fontSize: 12,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
              transition: "all 0.14s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.14)"; e.currentTarget.style.color = T.text2; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.hairline; e.currentTarget.style.color = T.text3; }}
          >
            <Icon name="logout" size={13} color="currentColor" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ marginLeft: 288, flex: 1, padding: "40px 44px", maxWidth: "calc(100% - 288px)", boxSizing: "border-box" }}>

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 40 }}>
          <div>
            <h1 style={{
              fontFamily: "var(--serif, 'Playfair Display', serif)",
              fontSize: 32,
              fontWeight: 700,
              color: T.text,
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}>
              Recruiter Hub
            </h1>
            <p style={{ fontSize: 14, color: T.text3, margin: "8px 0 0", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
              Evaluate candidates and browse the talent pool.
            </p>
          </div>
          <button
            style={{
              background: T.card,
              border: `1px solid ${T.hairline}`,
              borderRadius: T.r,
              color: T.text2,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: T.shadow,
              fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.hairline; }}
          >
            Export Report
          </button>
        </div>

        {/* ── Evaluate a Candidate ── */}
        <section style={{ marginBottom: 52 }}>
          <h2 style={{
            fontFamily: "var(--serif, 'Playfair Display', serif)",
            fontSize: 24,
            fontWeight: 700,
            color: T.text,
            margin: "0 0 6px",
            letterSpacing: "-0.01em",
          }}>
            Evaluate a Candidate
          </h2>
          <p style={{ fontSize: 13, color: T.text3, margin: "0 0 22px", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
            Add a candidate via their Prolio portfolio link, or upload their resume / LinkedIn / GitHub directly.
          </p>

          {/* Mode toggle */}
          <div style={{
            display: "flex",
            gap: 3,
            background: T.container,
            borderRadius: 100,
            padding: "4px",
            width: "fit-content",
            marginBottom: 22,
          }}>
            {[{ id: "url", label: "By Portfolio URL" }, { id: "upload", label: "Upload Files" }].map(m => (
              <button
                key={m.id}
                onClick={() => setAddMode(m.id)}
                style={{
                  background: addMode === m.id ? T.card : "transparent",
                  color: addMode === m.id ? T.primary : T.text3,
                  padding: "7px 18px",
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: addMode === m.id ? 600 : 400,
                  border: addMode === m.id ? `1px solid ${T.hairline}` : "1px solid transparent",
                  boxShadow: addMode === m.id ? "0 1px 4px rgba(0,0,0,0.07)" : "none",
                  cursor: "pointer",
                  transition: "all 0.14s",
                  fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {addMode === "url"
            ? <AddByUrl onAdd={c => setCandidates(prev => [...prev, c])} />
            : <AddByUpload onAdd={c => setCandidates(prev => [...prev, c])} />}

          {candidates.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
              {candidates.map(c => (
                <CandidateEvaluator
                  key={c.user_id}
                  candidate={c}
                  onRemove={() => setCandidates(prev => prev.filter(x => x.user_id !== c.user_id))}
                />
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${T.hairline}`, marginBottom: 48 }} />

        {/* ── Talent Pool ── */}
        <section>
          <h2 style={{
            fontFamily: "var(--serif, 'Playfair Display', serif)",
            fontSize: 24,
            fontWeight: 700,
            color: T.text,
            margin: "0 0 6px",
            letterSpacing: "-0.01em",
          }}>
            Talent Pool
          </h2>
          <p style={{ fontSize: 13, color: T.text3, margin: "0 0 24px", fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)" }}>
            Browse AI-powered portfolios from registered job seekers.
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: 480, marginBottom: 28 }}>
            <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
              <Icon name="search" size={15} color={T.text3} />
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role, or skill…"
              style={{
                width: "100%",
                background: T.card,
                border: `1px solid ${T.hairline}`,
                borderRadius: T.r,
                padding: "10px 14px 10px 40px",
                fontSize: 14,
                color: T.text,
                outline: "none",
                boxSizing: "border-box",
                boxShadow: T.shadow,
                fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
              }}
            />
          </div>

          {/* Grid / states */}
          {poolLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
              <Spinner size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 24px",
              color: T.text3,
              fontSize: 14,
              background: T.card,
              borderRadius: T.r,
              border: `1px solid ${T.hairline}`,
              fontFamily: "var(--sans, 'Plus Jakarta Sans', sans-serif)",
            }}>
              {search ? "No candidates match your search." : "No profiles available yet."}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {filtered.map(p => (
                <div
                  key={p.user_id}
                  onClick={() => setSelectedProfile(p)}
                  style={{ cursor: "pointer" }}
                >
                  <ProfileCard profile={p} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default RecruiterDashboard;
