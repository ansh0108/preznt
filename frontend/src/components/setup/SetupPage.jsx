import { useState } from "react";
import { Spinner, Btn, Divider } from "../ui/primitives";
import Icon from "../ui/Icon";
import PhotoUploadField from "../ui/PhotoUploadField";
import GithubRepoPicker from "./GithubRepoPicker";
import { useSetupWizard } from "./useSetupWizard";

const STEPS = ["Profile", "LinkedIn", "Documents", "Build"];
const LI_GUIDE = [
  ["Go to your LinkedIn profile", "Click your profile photo at the top → View Profile"],
  ['Click the "…" button', 'Below your name, click the three-dot "More" button'],
  ['Select "Save to PDF"', "It downloads your profile as a PDF instantly"],
];

function StepIndicator({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 44, gap: 0 }}>
      {STEPS.map((s, i) => {
        const isCompleted = i + 1 < step;
        const isActive = i + 1 === step;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: isCompleted ? "var(--accent)" : "transparent", border: isCompleted || isActive ? "2px solid var(--accent)" : "2px solid var(--line2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease", boxShadow: isActive ? "0 0 0 4px var(--accent-d)" : "none" }}>
                {isCompleted
                  ? <Icon name="check" size={13} color="#fff" />
                  : <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--sans)", color: isActive ? "var(--accent)" : "var(--text3)" }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 12, fontFamily: "var(--sans)", fontWeight: isActive ? 600 : 400, color: isActive ? "var(--text)" : isCompleted ? "var(--accent)" : "var(--text3)", whiteSpace: "nowrap", transition: "color 0.2s ease" }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ width: 56, height: 2, background: i + 1 < step ? "var(--accent)" : "var(--line2)", margin: "0 8px", marginBottom: 22, transition: "background 0.3s ease", borderRadius: 2 }} />}
          </div>
        );
      })}
    </div>
  );
}

function ErrMsg({ error }) {
  if (!error) return null;
  return <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 12, fontFamily: "var(--sans)", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)", borderRadius: 8, padding: "9px 13px" }}>{error}</div>;
}

function Step1({ profile, setProfile, photo, setPhoto, error, loading, onCreate }) {
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [githubUsername, setGithubUsername] = useState("");
  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600, marginBottom: 6, color: "var(--text)", letterSpacing: "-0.02em" }}>Tell us about yourself</div>
      <div style={{ color: "var(--text3)", fontSize: 13.5, marginBottom: 28, fontFamily: "var(--sans)", lineHeight: 1.5 }}>This is your first impression — make it count</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input placeholder="Full name *" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
        <input placeholder="Professional title (optional) — e.g. Data Analyst, AI Engineer" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} />
        <textarea rows={3} placeholder="Short bio (optional)" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
        <PhotoUploadField photo={photo} setPhoto={setPhoto} />
        <Divider my={4} />
        <GithubRepoPicker onConfirm={(urls, uname) => { setSelectedRepos(urls); setGithubUsername(uname); }} />
        {selectedRepos.length > 0 && (
          <div style={{ background: "var(--bg4)", border: "1px solid var(--accent-b)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, fontFamily: "var(--sans)" }}>{selectedRepos.length} repos from @{githubUsername}</span>
            <button onClick={() => { setSelectedRepos([]); setGithubUsername(""); }} style={{ background: "none", border: "none", color: "var(--text3)", fontSize: 12, cursor: "pointer", fontFamily: "var(--sans)" }}>Clear</button>
          </div>
        )}
      </div>
      <ErrMsg error={error} />
      <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={() => onCreate(selectedRepos, githubUsername)} disabled={loading}>
          {loading ? <Spinner size={14} color="#fff" /> : "Continue"} {!loading && <Icon name="arrow" size={14} color="#fff" />}
        </Btn>
      </div>
    </div>
  );
}

function LinkedInDownloadGuide() {
  return (
    <div style={{ background: "var(--bg2)", border: "1px solid var(--accent-d)", borderRadius: 12, padding: "16px 18px", marginBottom: 22 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--sans)" }}>How to download your LinkedIn PDF</div>
      {LI_GUIDE.map(([title, desc], i) => (
        <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 12 : 0, alignItems: "flex-start" }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "var(--sans)" }}>{i + 1}</span>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--sans)" }}>{title}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, fontFamily: "var(--sans)", lineHeight: 1.4 }}>{desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Step2({ linkedinFile, setLinkedinFile, error, loading, onBack, onUpload }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600, marginBottom: 6, color: "var(--text)", letterSpacing: "-0.02em" }}>LinkedIn export</div>
      <div style={{ color: "var(--text3)", fontSize: 13.5, marginBottom: 18, fontFamily: "var(--sans)", lineHeight: 1.5 }}>We use your LinkedIn PDF to extract experience, education, and skills.</div>
      <LinkedInDownloadGuide />
      <div
        onClick={() => document.getElementById("li-upload").click()}
        style={{ border: linkedinFile ? "2px solid var(--accent)" : "2px dashed var(--accent-b)", background: linkedinFile ? "var(--accent-d)" : "linear-gradient(135deg, rgba(129,140,248,0.03) 0%, rgba(129,140,248,0.07) 100%)", borderRadius: 14, padding: "32px 24px", textAlign: "center", cursor: "pointer", transition: "all 0.2s ease" }}
        onMouseEnter={e => { if (!linkedinFile) { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-d)"; } }}
        onMouseLeave={e => { if (!linkedinFile) { e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(129,140,248,0.03) 0%, rgba(129,140,248,0.07) 100%)"; } }}
      >
        <div style={{ marginBottom: 10 }}><Icon name="file" size={30} color={linkedinFile ? "var(--accent)" : "var(--text3)"} /></div>
        <div style={{ fontSize: 14, color: linkedinFile ? "var(--accent)" : "var(--text3)", fontWeight: 500, fontFamily: "var(--sans)" }}>{linkedinFile ? linkedinFile.name : "Drop your LinkedIn PDF here or click to upload"}</div>
        {!linkedinFile && <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 6, fontFamily: "var(--sans)" }}>PDF files only</div>}
        <input id="li-upload" type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setLinkedinFile(e.target.files[0])} />
      </div>
      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 10, textAlign: "center", fontFamily: "var(--sans)" }}>You can skip this step</div>
      <ErrMsg error={error} />
      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={onUpload} disabled={loading}>
          {loading ? <Spinner size={14} color="#fff" /> : linkedinFile ? "Upload & Continue" : "Skip"} {!loading && <Icon name="arrow" size={14} color="#fff" />}
        </Btn>
      </div>
    </div>
  );
}

function Step3({ extraFiles, setExtraFiles, error, loading, onBack, onUpload }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600, marginBottom: 6, color: "var(--text)", letterSpacing: "-0.02em" }}>Additional documents</div>
      <div style={{ background: "rgba(45,212,191,0.07)", border: "1px solid rgba(45,212,191,0.22)", borderRadius: 10, padding: "11px 14px", marginBottom: 22, fontSize: 13, color: "var(--teal)", lineHeight: 1.6, fontFamily: "var(--sans)" }}>
        <strong>Upload your resume</strong> — we'll automatically extract all projects and skills not on LinkedIn or GitHub.
      </div>
      <div
        onClick={() => document.getElementById("ex-upload").click()}
        style={{ border: "2px dashed var(--line2)", borderRadius: 14, padding: "28px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s ease, background 0.2s ease" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "var(--accent-d)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ marginBottom: 8 }}><Icon name="file" size={26} color="var(--text3)" /></div>
        <div style={{ fontSize: 13.5, color: "var(--text3)", fontFamily: "var(--sans)" }}>PDF, DOCX, PPTX accepted</div>
        <input id="ex-upload" type="file" multiple accept=".pdf,.docx,.pptx,.txt" style={{ display: "none" }} onChange={e => setExtraFiles(prev => [...prev, ...Array.from(e.target.files)])} />
      </div>
      {extraFiles.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {extraFiles.map((f, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg2)", border: "1px solid var(--accent-d)", padding: "9px 13px", borderRadius: 9 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="file" size={14} color="var(--accent)" />
                <span style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--sans)" }}>{f.name}</span>
              </div>
              <button onClick={() => setExtraFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text3)" }}>
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <ErrMsg error={error} />
      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={onUpload} disabled={loading}>{loading ? <Spinner size={14} color="#fff" /> : "Continue"} {!loading && <Icon name="arrow" size={14} color="#fff" />}</Btn>
      </div>
    </div>
  );
}

function Step4({ portfolioUrl, indexing, indexed, error, onBuild, onBack, onComplete, userId, profileName }) {
  return (
    <div style={{ textAlign: "center" }}>
      {!indexed ? (
        <>
          <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600, color: "var(--text)", marginBottom: 10, letterSpacing: "-0.02em" }}>Build your AI portfolio</div>
          <div style={{ color: "var(--text3)", fontSize: 13.5, marginBottom: 40, lineHeight: 1.6, fontFamily: "var(--sans)", maxWidth: 340, margin: "0 auto 40px" }}>We'll index all your data, summarise your experience, and generate descriptions.</div>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, var(--bg4) 0%, var(--bg3) 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 32px", fontSize: 34 }}>🧠</div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Btn onClick={onBuild} disabled={indexing}>
              {indexing ? <><Spinner size={14} color="#fff" /> Building · ~45 seconds</> : <><Icon name="zap" size={14} color="#fff" /> Build Portfolio</>}
            </Btn>
            <ErrMsg error={error} />
            {!indexing && <Btn variant="ghost" onClick={onBack}>← Back</Btn>}
          </div>
        </>
      ) : (
        <div style={{ animation: "fadeUp 0.5s ease" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 48, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1 }}>Ready.</div>
          <div style={{ color: "var(--text3)", fontSize: 14, marginBottom: 32, fontFamily: "var(--sans)", lineHeight: 1.5 }}>Share this link with anyone — it's live right now</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 28, alignItems: "stretch" }}>
            <div style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--accent-b)", borderRadius: 10, padding: "11px 14px", fontFamily: "monospace", fontSize: 12.5, color: "var(--accent)", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{portfolioUrl}</div>
            <button onClick={() => navigator.clipboard.writeText(portfolioUrl)} style={{ background: "var(--accent)", border: "none", color: "#fff", borderRadius: 10, padding: "11px 16px", fontSize: 13, fontFamily: "var(--sans)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, flexShrink: 0, cursor: "pointer", transition: "filter 0.15s ease" }} onMouseEnter={e => e.currentTarget.style.filter = "brightness(1.1)"} onMouseLeave={e => e.currentTarget.style.filter = ""}>
              <Icon name="copy" size={13} color="#fff" /> Copy
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn onClick={() => window.open(portfolioUrl, "_blank")}><Icon name="link" size={14} color="#fff" /> Open in new tab</Btn>
            <Btn variant="ghost" onClick={() => onComplete(userId, profileName)}>View here</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SetupPage ────────────────────────────────────────────────────────────────
function SetupPage({ onComplete }) {
  const { wizard, setWizard, build, profile, setProfile, photo, setPhoto, linkedinFile, setLinkedinFile, extraFiles, setExtraFiles, portfolioUrl, createProfile, uploadLinkedin, uploadExtras, buildIndex } = useSetupWizard();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "52px 20px", background: "var(--bg)", fontFamily: "var(--sans)" }}>
      <div style={{ marginBottom: 48, textAlign: "center", animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 42, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--accent)", lineHeight: 1, marginBottom: 10 }}>Prolio</div>
        <div style={{ color: "var(--text3)", fontSize: 14, fontFamily: "var(--sans)", fontWeight: 400, letterSpacing: "0.01em" }}>Your AI portfolio, built from everything you've created</div>
      </div>
      <StepIndicator step={wizard.step} />
      <div style={{ width: "100%", maxWidth: 540, background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: 20, padding: "36px 40px", animation: "fadeUp 0.4s ease", boxShadow: "0 20px 40px -10px rgba(0,0,0,0.4)" }}>
        {wizard.step === 1 && <Step1 profile={profile} setProfile={setProfile} photo={photo} setPhoto={setPhoto} error={wizard.error} loading={wizard.loading} onCreate={createProfile} />}
        {wizard.step === 2 && <Step2 linkedinFile={linkedinFile} setLinkedinFile={setLinkedinFile} error={wizard.error} loading={wizard.loading} onBack={() => setWizard(w => ({ ...w, step: 1 }))} onUpload={uploadLinkedin} />}
        {wizard.step === 3 && <Step3 extraFiles={extraFiles} setExtraFiles={setExtraFiles} error={wizard.error} loading={wizard.loading} onBack={() => setWizard(w => ({ ...w, step: 2 }))} onUpload={uploadExtras} />}
        {wizard.step === 4 && <Step4 portfolioUrl={portfolioUrl} indexing={build.indexing} indexed={build.indexed} error={wizard.error} onBuild={buildIndex} onBack={() => setWizard(w => ({ ...w, step: 3 }))} onComplete={onComplete} userId={build.userId} profileName={profile.name} />}
      </div>
    </div>
  );
}

export default SetupPage;
