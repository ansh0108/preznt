import { Spinner, SecHead } from "../ui/primitives";
import UploadRow from "./UploadRow";
import PortfolioSwitcher from "./PortfolioSwitcher";
import ProfileCard from "./SeekerProfileCard";
import GithubSection from "./GithubSection";
import LinksPanel from "./LinksPanel";

// ─── LeftSidebar ──────────────────────────────────────────────────────────────
function LeftSidebar({ pm, hasLinkedin, hasResume, hasGithub, github, setGithub, link, setLink, links, onReparseLinkedin, reparsingLinkedin }) {
  return (
    <div style={{ width: 300, flexShrink: 0 }}>
      <PortfolioSwitcher
        portfolios={pm.portfolios} activePortfolioId={pm.activePortfolioId}
        setActivePortfolioId={pm.setActivePortfolioId} setProfile={pm.setProfile}
        creatingPortfolio={pm.creatingPortfolio} setCreatingPortfolio={pm.setCreatingPortfolio}
        newRoleName={pm.newRoleName} setNewRoleName={pm.setNewRoleName}
        creatingLoading={pm.creatingLoading} createPortfolio={pm.createPortfolio}
        deletingPortfolioId={pm.deletingPortfolioId} setDeletingPortfolioId={pm.setDeletingPortfolioId}
        deletePortfolio={pm.deletePortfolio} deleteLoading={pm.deleteLoading} setPrimary={pm.setPrimary}
      />
      <ProfileCard pm={pm} />
      <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "18px 20px", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)" }}>
        <SecHead style={{ marginBottom: 14 }}>Data Sources</SecHead>
        <UploadRow label="LinkedIn PDF" icon="user" done={hasLinkedin} accept=".pdf" onFile={f => pm.uploadFile(f, "linkedin")}
          hint={[["Go to your LinkedIn profile", "Click your profile photo → View Profile"], ['Click the "…" More button', "Below your name and headline"], ['Select "Save to PDF"', "Downloads your profile instantly as a PDF"]]} />
        {hasLinkedin && (
          <button onClick={onReparseLinkedin} disabled={reparsingLinkedin}
            style={{ marginTop: -4, marginBottom: 8, marginLeft: 36, background: "transparent", border: "none", cursor: reparsingLinkedin ? "default" : "pointer", fontSize: 11, color: "var(--text3)", padding: 0, display: "flex", alignItems: "center", gap: 4, opacity: reparsingLinkedin ? 0.5 : 1 }}>
            {reparsingLinkedin ? <><Spinner size={9} color="var(--text3)" /> Re-parsing…</> : "↺ Fix parsing issues"}
          </button>
        )}
        <UploadRow label="Resume / CV" icon="file" done={hasResume} accept=".pdf,.docx,.pptx,.txt" onFile={f => pm.uploadFile(f, "resume")} />
        <GithubSection hasGithub={hasGithub} pm={pm} github={github} setGithub={setGithub} />
        <LinksPanel links={links} saveLinks={pm.saveLinks} link={link} setLink={setLink} profile={pm.profile} />
      </div>
    </div>
  );
}

export default LeftSidebar;
