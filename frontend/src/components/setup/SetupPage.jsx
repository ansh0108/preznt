import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { nameToSlug } from "../../lib/utils";
import { Spinner, Btn, Divider } from "../ui/primitives";
import Icon from "../ui/Icon";
import PhotoUploadField from "../ui/PhotoUploadField";
import GithubRepoPicker from "./GithubRepoPicker";

const STEPS = ["Profile", "LinkedIn", "Documents", "Build"];

function StepIndicator({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
      {STEPS.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: i + 1 < step ? "var(--accent)" : "transparent",
              border: i + 1 <= step ? "1.5px solid var(--accent)" : "1.5px solid var(--line2)",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s"
            }}>
              {i + 1 < step
                ? <Icon name="check" size={12} color="#fff" />
                : <span style={{ fontSize: 11, fontWeight: 600, color: i + 1 === step ? "var(--accent)" : "var(--text3)" }}>{i + 1}</span>}
            </div>
            <span style={{ fontSize: 12.5, color: i + 1 === step ? "var(--text)" : "var(--text3)", fontWeight: i + 1 === step ? 600 : 400 }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && <div style={{ width: 32, height: 1, background: "var(--line2)", margin: "0 12px" }} />}
        </div>
      ))}
    </div>
  );
}

function Step1({ profile, setProfile, photo, setPhoto, error, loading, onCreate }) {
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [githubUsername, setGithubUsername] = useState("");

  const handleCreate = () => onCreate(selectedRepos, githubUsername);

  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 6, color: "var(--text)" }}>Tell us about yourself</div>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 28 }}>This is your first impression — make it count</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input placeholder="Full name *" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
        <input placeholder="Professional title (optional) — e.g. Data Analyst, AI Engineer" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} />
        <textarea rows={3} placeholder="Short bio (optional)" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
        <PhotoUploadField photo={photo} setPhoto={setPhoto} />
        <Divider my={4} />
        <GithubRepoPicker onConfirm={(urls, uname) => { setSelectedRepos(urls); setGithubUsername(uname); }} />
        {selectedRepos.length > 0 && (
          <div style={{ background: "var(--accent-d)", border: "1px solid var(--accent-b)", borderRadius: "var(--r-md)", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>{selectedRepos.length} repos from @{githubUsername}</span>
            <button onClick={() => { setSelectedRepos([]); setGithubUsername(""); }} style={{ background: "none", color: "var(--text3)", fontSize: 12 }}>Clear</button>
          </div>
        )}
      </div>
      {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 14 }}>{error}</div>}
      <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={handleCreate} disabled={loading}>{loading ? <Spinner size={14} color="#fff" /> : "Continue"} {!loading && <Icon name="arrow" size={14} color="#fff" />}</Btn>
      </div>
    </div>
  );
}

function Step2({ linkedinFile, setLinkedinFile, error, loading, onBack, onUpload }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 6 }}>LinkedIn export</div>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 14 }}>We use your LinkedIn PDF to extract experience, education, and skills.</div>
      <div style={{ background: "var(--bg3)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", marginBottom: 10, letterSpacing: "0.04em", textTransform: "uppercase" }}>How to download your LinkedIn PDF</div>
        {[
          ["Go to your LinkedIn profile", "Click your profile photo at the top → View Profile"],
          ['Click the "…" button', 'Below your name, click the three-dot "More" button'],
          ['Select "Save to PDF"', "It downloads your profile as a PDF instantly"],
        ].map(([title, desc], i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 10 : 0, alignItems: "flex-start" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{i + 1}</span>
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)" }}>{title}</div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div onClick={() => document.getElementById("li-upload").click()} style={{ border: `2px dashed ${linkedinFile ? "var(--accent)" : "var(--line2)"}`, borderRadius: "var(--r-lg)", padding: "28px 20px", textAlign: "center", cursor: "pointer", background: linkedinFile ? "var(--accent-d)" : "transparent", transition: "all 0.2s" }}>
        <Icon name="file" size={28} color={linkedinFile ? "var(--accent)" : "var(--text3)"} style={{ marginBottom: 10 }} />
        <div style={{ fontSize: 13.5, color: linkedinFile ? "var(--accent)" : "var(--text3)", fontWeight: 500 }}>{linkedinFile ? linkedinFile.name : "Drop your LinkedIn PDF here or click to upload"}</div>
        <input id="li-upload" type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setLinkedinFile(e.target.files[0])} />
      </div>
      <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 10, textAlign: "center" }}>You can skip this step</div>
      {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 12 }}>{error}</div>}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={onUpload} disabled={loading}>{loading ? <Spinner size={14} color="#fff" /> : linkedinFile ? "Upload & Continue" : "Skip"} {!loading && <Icon name="arrow" size={14} color="#fff" />}</Btn>
      </div>
    </div>
  );
}

function Step3({ extraFiles, setExtraFiles, error, loading, onBack, onUpload }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 6 }}>Additional documents</div>
      <div style={{ background: "var(--teal-d)", border: "1px solid rgba(45,212,191,0.2)", borderRadius: "var(--r-md)", padding: "11px 14px", marginBottom: 20, fontSize: 12.5, color: "var(--teal)", lineHeight: 1.6 }}>
        <strong>Upload your resume</strong> — we'll automatically extract all projects and skills not on LinkedIn or GitHub.
      </div>
      <div onClick={() => document.getElementById("ex-upload").click()} style={{ border: "2px dashed var(--line2)", borderRadius: "var(--r-lg)", padding: "24px 20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}>
        <Icon name="file" size={24} color="var(--text3)" style={{ marginBottom: 8 }} />
        <div style={{ fontSize: 13, color: "var(--text3)" }}>PDF, DOCX, PPTX accepted</div>
        <input id="ex-upload" type="file" multiple accept=".pdf,.docx,.pptx,.txt" style={{ display: "none" }} onChange={e => setExtraFiles(prev => [...prev, ...Array.from(e.target.files)])} />
      </div>
      {extraFiles.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {extraFiles.map((f, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg2)", border: "1px solid var(--line)", padding: "8px 12px", borderRadius: "var(--r-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="file" size={14} color="var(--text3)" />
                <span style={{ fontSize: 13, color: "var(--text2)" }}>{f.name}</span>
              </div>
              <button onClick={() => setExtraFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", color: "var(--text3)" }}><Icon name="x" size={14} /></button>
            </div>
          ))}
        </div>
      )}
      {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 12 }}>{error}</div>}
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
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 500, marginBottom: 8 }}>Build your AI portfolio</div>
      <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 36, lineHeight: 1.6 }}>We'll index all your data, summarise your experience, and generate descriptions</div>
      {!indexed ? (
        <>
          <div style={{ fontSize: 48, marginBottom: 24, lineHeight: 1 }}>🧠</div>
          <Btn onClick={onBuild} disabled={indexing} style={{ margin: "0 auto" }}>
            {indexing ? <><Spinner size={14} color="#fff" /> Building · ~45 seconds</> : <><Icon name="zap" size={14} color="#fff" /> Build Portfolio</>}
          </Btn>
          {error && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 16 }}>{error}</div>}
          {!indexing && <div style={{ marginTop: 20 }}><Btn variant="ghost" onClick={onBack}>← Back</Btn></div>}
        </>
      ) : (
        <div style={{ animation: "fadeUp 0.4s ease" }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 500, marginBottom: 6 }}>Ready.</div>
          <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 24 }}>Share this link with anyone — it's live right now</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
            <div style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--accent-b)", borderRadius: "var(--r-md)", padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "var(--accent)", textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{portfolioUrl}</div>
            <button onClick={() => navigator.clipboard.writeText(portfolioUrl)} style={{ background: "var(--bg3)", border: "1px solid var(--line2)", color: "var(--text2)", borderRadius: "var(--r-md)", padding: "10px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <Icon name="copy" size={13} /> Copy
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

function SetupPage({ onComplete }) {
  const [wizard, setWizard] = useState({ step: 1, loading: false, error: null });
  const [build, setBuild] = useState({ userId: null, indexing: false, indexed: false });
  const [profile, setProfile] = useState({ name: "", title: "", bio: "" });
  const [photo, setPhoto] = useState(null);
  const [linkedinFile, setLinkedinFile] = useState(null);
  const [extraFiles, setExtraFiles] = useState([]);

  const createProfile = async (selectedRepos, githubUsername) => {
    if (!profile.name) return setWizard(w => ({ ...w, error: "Name is required" }));
    setWizard(w => ({ ...w, loading: true, error: null }));
    try {
      const res = await axios.post(`${API}/setup/profile`, { name: profile.name, title: profile.title, bio: profile.bio, github_urls: selectedRepos, github_username: githubUsername });
      const uid = res.data.user_id;
      setBuild(b => ({ ...b, userId: uid }));
      if (photo) { const f = new FormData(); f.append("file", photo); await axios.post(`${API}/upload/photo/${uid}`, f); }
      setWizard(w => ({ ...w, step: 2 }));
    } catch { setWizard(w => ({ ...w, error: "Could not connect to the backend. Please try again." })); }
    finally { setWizard(w => ({ ...w, loading: false })); }
  };

  const uploadLinkedin = async () => {
    if (!linkedinFile) return setWizard(w => ({ ...w, step: 3 }));
    setWizard(w => ({ ...w, loading: true, error: "" }));
    let lastErr;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const f = new FormData(); f.append("file", linkedinFile);
        await axios.post(`${API}/upload/linkedin/${build.userId}`, f, { timeout: 60000 });
        setWizard(w => ({ ...w, loading: false, step: 3 })); return;
      } catch (e) { lastErr = e; if (attempt < 3) await new Promise(r => setTimeout(r, 1500 * attempt)); }
    }
    setWizard(w => ({ ...w, loading: false, error: "LinkedIn upload failed after 3 attempts. Please try again." }));
  };

  const uploadExtras = async () => {
    setWizard(w => ({ ...w, loading: true }));
    try {
      for (const file of extraFiles) { const f = new FormData(); f.append("file", file); await axios.post(`${API}/upload/document/${build.userId}`, f); }
      setWizard(w => ({ ...w, step: 4 }));
    } catch { setWizard(w => ({ ...w, error: "Document upload failed" })); }
    finally { setWizard(w => ({ ...w, loading: false })); }
  };

  const buildIndex = async () => {
    setBuild(b => ({ ...b, indexing: true })); setWizard(w => ({ ...w, error: null }));
    try { await axios.post(`${API}/index/${build.userId}`); setBuild(b => ({ ...b, indexed: true })); }
    catch (e) { setWizard(w => ({ ...w, error: e.response?.data?.detail || "Indexing failed" })); }
    finally { setBuild(b => ({ ...b, indexing: false })); }
  };

  const portfolioUrl = build.userId ? `${window.location.origin}${window.location.pathname}#/portfolio/${nameToSlug(profile.name)}-${build.userId}` : "";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 20px", background: "var(--bg)" }}>
      <div style={{ marginBottom: 52, textAlign: "center", animation: "fadeUp 0.5s ease" }}>
        <div style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text)" }}>
          prolio<span style={{ color: "var(--accent)", fontStyle: "italic" }}>.co</span>
        </div>
        <div style={{ color: "var(--text3)", fontSize: 13.5, marginTop: 8, fontWeight: 400, letterSpacing: "0.01em" }}>
          Your AI portfolio, built from everything you've created
        </div>
      </div>

      <StepIndicator step={wizard.step} />

      <div style={{ width: "100%", maxWidth: 540, background: "var(--bg1)", border: "1px solid var(--line2)", borderRadius: "var(--r-xl)", padding: "32px 36px", animation: "fadeUp 0.4s ease" }}>
        {wizard.step === 1 && <Step1 profile={profile} setProfile={setProfile} photo={photo} setPhoto={setPhoto} error={wizard.error} loading={wizard.loading} onCreate={createProfile} />}
        {wizard.step === 2 && <Step2 linkedinFile={linkedinFile} setLinkedinFile={setLinkedinFile} error={wizard.error} loading={wizard.loading} onBack={() => setWizard(w => ({ ...w, step: 1 }))} onUpload={uploadLinkedin} />}
        {wizard.step === 3 && <Step3 extraFiles={extraFiles} setExtraFiles={setExtraFiles} error={wizard.error} loading={wizard.loading} onBack={() => setWizard(w => ({ ...w, step: 2 }))} onUpload={uploadExtras} />}
        {wizard.step === 4 && <Step4 portfolioUrl={portfolioUrl} indexing={build.indexing} indexed={build.indexed} error={wizard.error} onBuild={buildIndex} onBack={() => setWizard(w => ({ ...w, step: 3 }))} onComplete={onComplete} userId={build.userId} profileName={profile.name} />}
      </div>
    </div>
  );
}

export default SetupPage;
