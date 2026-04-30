import { useState, useEffect } from "react";
import { extractTechTags } from "../../lib/utils";
import { BulletText, Pill } from "../ui/primitives";
import Icon from "../ui/Icon";

function GithubProjectCard({ repo, featuredRepos }) {
  return (
    <a href={repo.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
      <div className="card-glow" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px", cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: repo.description ? 10 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name="github" size={16} color="var(--text2)" />
            <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{repo.name}</span>
            {featuredRepos.includes(repo.name) && <Pill color="var(--accent)" size="sm">Featured</Pill>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {repo.stars > 0 && <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="star" size={12} color="var(--amber)" />{repo.stars}</span>}
            {repo.forks > 0 && <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}><Icon name="fork" size={12} color="var(--text3)" />{repo.forks}</span>}
            <span style={{ fontSize: 12, color: "var(--accent)", background: "var(--accent-d)", border: "1px solid var(--accent-b)", padding: "3px 10px", borderRadius: 100, fontWeight: 600 }}>↗ View</span>
          </div>
        </div>
        {repo.description && <BulletText text={repo.description} style={{ color: "var(--text2)", fontSize: 13.5, lineHeight: 1.75, marginBottom: 14 }} />}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {extractTechTags(repo.description, repo.topics, repo.language).map((tag, j) => (
            <Pill key={j} color="var(--teal)" size="sm">{tag}</Pill>
          ))}
        </div>
      </div>
    </a>
  );
}

function ResumeProjectCard({ proj }) {
  return (
    <div className="c-hover" style={{ background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-lg)", padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: proj.description ? 10 : 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="code" size={16} color="var(--text2)" />
          <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 15, color: "var(--text)" }}>{proj.name}</span>
        </div>
        {proj.type && <Pill color="var(--rose)" size="sm">{proj.type}</Pill>}
      </div>
      {proj.description && <BulletText text={proj.description} style={{ color: "var(--text2)", fontSize: 13.5, lineHeight: 1.75, marginBottom: proj.tech_stack?.length ? 14 : 0 }} />}
      {proj.tech_stack?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {proj.tech_stack.map((t, j) => <Pill key={j} size="sm">{t}</Pill>)}
        </div>
      )}
    </div>
  );
}

function Projects({ profile, hideSections = [], featuredRepos = [] }) {
  const githubRepos = [...(profile.github_repos || [])].sort((a, b) => {
    const aF = featuredRepos.includes(a.name) ? 0 : 1;
    const bF = featuredRepos.includes(b.name) ? 0 : 1;
    return aF - bF;
  });
  const resumeProjects = profile.resume_projects || [];
  const showGithub = !hideSections.includes("github") && githubRepos.length > 0;
  const showResume = !hideSections.includes("resume_projects") && resumeProjects.length > 0;
  const [sub, setSub] = useState(showGithub ? "github" : "resume");

  useEffect(() => {
    if (showGithub) setSub("github");
    else if (showResume) setSub("resume");
  }, [profile]);

  const hasAny = showGithub || showResume;
  if (!hasAny) return (
    <div style={{ textAlign: "center", padding: "64px 20px" }}>
      <Icon name="code" size={36} color="var(--text3)" style={{ marginBottom: 16 }} />
      <div style={{ color: "var(--text3)", fontSize: 14 }}>No projects found. Add GitHub repos in setup or upload your resume in Documents.</div>
    </div>
  );

  const SubTab = ({ id, label, count }) => (
    <button onClick={() => setSub(id)} className="b-tab" data-active={sub === id} style={{
      background: sub === id ? "var(--bg3)" : "transparent",
      border: sub === id ? "1px solid var(--line2)" : "1px solid transparent",
      color: sub === id ? "var(--text)" : "var(--text3)",
      padding: "7px 18px", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: sub === id ? 600 : 400,
      display: "flex", alignItems: "center", gap: 7
    }}>
      <Icon name={id === "github" ? "github" : "file"} size={14} color={sub === id ? "var(--text)" : "var(--text3)"} />
      {label}
      <span style={{ background: sub === id ? "var(--accent-d)" : "var(--bg3)", color: sub === id ? "var(--accent)" : "var(--text3)", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 100, border: sub === id ? "1px solid var(--accent-b)" : "1px solid var(--line)" }}>
        {count}
      </span>
    </button>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: 4, width: "fit-content" }}>
        {showGithub && <SubTab id="github" label="GitHub" count={githubRepos.length} />}
        {showResume && <SubTab id="resume" label="From Resume" count={resumeProjects.length} />}
      </div>

      {sub === "github" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.2s ease" }}>
          {githubRepos.map((repo, i) => (
            <GithubProjectCard key={i} repo={repo} featuredRepos={featuredRepos} />
          ))}
        </div>
      )}

      {sub === "resume" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.2s ease" }}>
          {resumeProjects.map((proj, i) => (
            <ResumeProjectCard key={i} proj={proj} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
