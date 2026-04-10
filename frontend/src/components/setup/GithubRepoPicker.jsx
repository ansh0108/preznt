import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { extractTechTags } from "../../lib/utils";
import { Spinner, Btn, Pill } from "../ui/primitives";
import Icon from "../ui/Icon";

const LANG_COLORS = {
  Python: "#3572A5", JavaScript: "#f7df1e", TypeScript: "#3178c6",
  "Jupyter Notebook": "#DA5B0B", HTML: "#e34c26", CSS: "#264de4",
  Go: "#00ADD8", Rust: "#dea584", Java: "#b07219", Shell: "#89e051",
};

function GithubRepoPicker({ onConfirm }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");

  const extractUsername = (input) => {
    const m = input.match(/github\.com\/([^/\s]+)\/?$/);
    if (m) return m[1];
    if (!input.includes("/") && !input.includes(".")) return input.trim();
    return null;
  };

  const fetchRepos = async () => {
    const uname = extractUsername(url.trim());
    if (!uname) { setError("Enter a GitHub profile URL like github.com/username"); return; }
    setLoading(true); setError(""); setRepos([]); setSelected(new Set());
    try {
      const res = await axios.get(`${API}/github/repos?username=${uname}`);
      setRepos(res.data.repos); setUsername(uname);
      setSelected(new Set(res.data.repos.map(r => r.url)));
    } catch (e) { setError(e.response?.data?.detail || "Could not fetch repos."); }
    finally { setLoading(false); }
  };

  const toggle = (u) => { const s = new Set(selected); s.has(u) ? s.delete(u) : s.add(u); setSelected(s); };

  return (
    <div>
      <label style={{ fontSize: 12.5, color: "var(--text3)", fontWeight: 500, display: "block", marginBottom: 10, letterSpacing: "0.02em" }}>GitHub Profile</label>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input placeholder="github.com/username" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchRepos()} />
        <button onClick={fetchRepos} disabled={loading || !url.trim()} style={{ background: "var(--accent)", color: "#fff", borderRadius: "var(--r-md)", padding: "0 18px", fontSize: 13, fontWeight: 600, flexShrink: 0, opacity: loading || !url.trim() ? 0.45 : 1, display: "flex", alignItems: "center", gap: 6 }}>
          {loading ? <Spinner size={14} color="#fff" /> : "Fetch"}
        </button>
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginBottom: 10 }}>{error}</div>}

      {repos.length > 0 && (
        <div style={{ animation: "fadeUp 0.25s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, color: "var(--text3)" }}><span style={{ color: "var(--text)", fontWeight: 600 }}>{repos.length}</span> repos · <span style={{ color: "var(--accent)" }}>@{username}</span></span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text3)" }}>{selected.size} selected</span>
              <button onClick={() => selected.size === repos.length ? setSelected(new Set()) : setSelected(new Set(repos.map(r => r.url)))}
                style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-sm)", padding: "4px 10px", fontSize: 11.5 }}>
                {selected.size === repos.length ? "Deselect all" : "Select all"}
              </button>
            </div>
          </div>

          <div style={{ maxHeight: 270, overflowY: "auto", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", marginBottom: 12 }}>
            {repos.map((repo, i) => (
              <div key={repo.url} onClick={() => toggle(repo.url)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                borderBottom: i < repos.length - 1 ? "1px solid var(--line)" : "none",
                cursor: "pointer", background: selected.has(repo.url) ? "var(--accent-d)" : "transparent", transition: "background 0.12s"
              }}>
                <div style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, border: `1.5px solid ${selected.has(repo.url) ? "var(--accent)" : "var(--line2)"}`, background: selected.has(repo.url) ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}>
                  {selected.has(repo.url) && <Icon name="check" size={10} color="#fff" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}>{repo.name}</span>
                    {repo.stars > 0 && <span style={{ fontSize: 11, color: "var(--text3)", display: "flex", alignItems: "center", gap: 3 }}><Icon name="star" size={10} color="var(--amber)" />{repo.stars}</span>}
                  </div>
                  {repo.description && <div style={{ fontSize: 12, color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{repo.description}</div>}
                </div>
                {repo.language && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text3)", flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: LANG_COLORS[repo.language] || "var(--accent)" }} />
                    {repo.language}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Btn onClick={() => onConfirm(repos.filter(r => selected.has(r.url)).map(r => r.url), username)} disabled={selected.size === 0} style={{ width: "100%" }}>
            Add {selected.size} repo{selected.size !== 1 ? "s" : ""} to portfolio
          </Btn>
        </div>
      )}
    </div>
  );
}

export default GithubRepoPicker;
