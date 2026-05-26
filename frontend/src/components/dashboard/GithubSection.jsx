import axios from "axios";
import { API } from "../../lib/api";
import Icon from "../ui/Icon";
import GithubRepoPicker from "../setup/GithubRepoPicker";

// ─── GithubSection ────────────────────────────────────────────────────────────
function GithubSection({ hasGithub, pm, github, setGithub }) {
  const handleConfirm = async (urls) => {
    setGithub(g => ({ ...g, loading: true }));
    try {
      for (const url of urls) await axios.post(`${API}/profile/${pm.activePortfolioId}/github`, { github_url: url });
      setGithub(g => ({ ...g, adding: false }));
      await pm.loadProfile();
      pm.buildPortfolio();
    } catch {} finally { setGithub(g => ({ ...g, loading: false })); }
  };

  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: hasGithub ? "rgba(45,212,191,0.1)" : "var(--bg3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="github" size={14} color={hasGithub ? "var(--teal)" : "var(--text3)"} />
          </div>
          <span style={{ fontSize: 13, color: hasGithub ? "var(--text2)" : "var(--text3)", fontWeight: 500 }}>GitHub Repos</span>
        </div>
        <button onClick={() => setGithub(g => ({ ...g, adding: !g.adding }))}
          style={{ background: "var(--bg3)", border: "1px solid var(--line2)", borderRadius: 6, color: "var(--accent)", padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>
          {github.adding ? "Cancel" : "+ Add"}
        </button>
      </div>
      {hasGithub && (
        <div style={{ fontSize: 12, color: "var(--text3)", paddingLeft: 36, marginBottom: 6 }}>
          {pm.profile.github_urls.length} repo{pm.profile.github_urls.length !== 1 ? "s" : ""} added
        </div>
      )}
      {github.adding && (
        <div style={{ marginTop: 12 }}>
          <GithubRepoPicker onConfirm={handleConfirm} />
        </div>
      )}
    </div>
  );
}

export default GithubSection;
