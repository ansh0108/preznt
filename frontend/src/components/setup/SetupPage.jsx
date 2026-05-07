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
    <div style={{ display: "flex", alignItems: "center", marginBottom: 44, gap: 0 }}>
      {STEPS.map((s, i) => {
        const isCompleted = i + 1 < step;
        const isActive = i + 1 === step;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {/* Circle */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: isCompleted ? "#4648d4" : "transparent",
                border: isCompleted ? "2px solid #4648d4" : isActive ? "2px solid #4648d4" : "2px solid rgba(0,0,0,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                boxShadow: isActive ? "0 0 0 4px rgba(70,72,212,0.12)" : "none",
              }}>
                {isCompleted ? (
                  <Icon name="check" size={13} color="#fff" />
                ) : (
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "var(--sans)",
                    color: isActive ? "#4648d4" : "#767586",
                  }}>
                    {i + 1}
                  </span>
                )}
              </div>
              {/* Label */}
              <span style={{
                fontSize: 12,
                fontFamily: "var(--sans)",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#111c2d" : isCompleted ? "#4648d4" : "#767586",
                whiteSpace: "nowrap",
                transition: "color 0.2s ease",
              }}>
                {s}
              </span>
            </div>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                width: 56,
                height: 2,
                background: i + 1 < step ? "#4648d4" : "rgba(0,0,0,0.08)",
                margin: "0 8px",
                marginBottom: 22,
                transition: "background 0.3s ease",
                borderRadius: 2,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Step1({ profile, setProfile, photo, setPhoto, error, loading, onCreate }) {
  const [selectedRepos, setSelectedRepos] = useState([]);
  const [githubUsername, setGithubUsername] = useState("");

  const handleCreate = () => onCreate(selectedRepos, githubUsername);

  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600, marginBottom: 6, color: "#111c2d", letterSpacing: "-0.02em" }}>Tell us about yourself</div>
      <div style={{ color: "#767586", fontSize: 13.5, marginBottom: 28, fontFamily: "var(--sans)", lineHeight: 1.5 }}>This is your first impression — make it count</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input placeholder="Full name *" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
        <input placeholder="Professional title (optional) — e.g. Data Analyst, AI Engineer" value={profile.title} onChange={e => setProfile({ ...profile, title: e.target.value })} />
        <textarea rows={3} placeholder="Short bio (optional)" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
        <PhotoUploadField photo={photo} setPhoto={setPhoto} />
        <Divider my={4} />
        <GithubRepoPicker onConfirm={(urls, uname) => { setSelectedRepos(urls); setGithubUsername(uname); }} />
        {selectedRepos.length > 0 && (
          <div style={{
            background: "#e1e0ff",
            border: "1px solid rgba(70,72,212,0.20)",
            borderRadius: 10,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 13, color: "#4648d4", fontWeight: 500, fontFamily: "var(--sans)" }}>{selectedRepos.length} repos from @{githubUsername}</span>
            <button onClick={() => { setSelectedRepos([]); setGithubUsername(""); }} style={{ background: "none", border: "none", color: "#767586", fontSize: 12, cursor: "pointer", fontFamily: "var(--sans)" }}>Clear</button>
          </div>
        )}
      </div>
      {error && (
        <div style={{ color: "#c0392b", fontSize: 12.5, marginTop: 14, fontFamily: "var(--sans)", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.14)", borderRadius: 8, padding: "9px 13px" }}>
          {error}
        </div>
      )}
      <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={handleCreate} disabled={loading}>
          {loading ? <Spinner size={14} color="#fff" /> : "Continue"} {!loading && <Icon name="arrow" size={14} color="#fff" />}
        </Btn>
      </div>
    </div>
  );
}

function Step2({ linkedinFile, setLinkedinFile, error, loading, onBack, onUpload }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600, marginBottom: 6, color: "#111c2d", letterSpacing: "-0.02em" }}>LinkedIn export</div>
      <div style={{ color: "#767586", fontSize: 13.5, marginBottom: 18, fontFamily: "var(--sans)", lineHeight: 1.5 }}>We use your LinkedIn PDF to extract experience, education, and skills.</div>

      {/* Instructions panel */}
      <div style={{
        background: "#f0f3ff",
        border: "1px solid rgba(70,72,212,0.10)",
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 22,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#4648d4", marginBottom: 12, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--sans)" }}>How to download your LinkedIn PDF</div>
        {[
          ["Go to your LinkedIn profile", "Click your profile photo at the top → View Profile"],
          ['Click the "…" button', 'Below your name, click the three-dot "More" button'],
          ['Select "Save to PDF"', "It downloads your profile as a PDF instantly"],
        ].map(([title, desc], i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 2 ? 12 : 0, alignItems: "flex-start" }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#4648d4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: 1,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "var(--sans)" }}>{i + 1}</span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111c2d", fontFamily: "var(--sans)" }}>{title}</div>
              <div style={{ fontSize: 12, color: "#767586", marginTop: 2, fontFamily: "var(--sans)", lineHeight: 1.4 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => document.getElementById("li-upload").click()}
        style={{
          border: linkedinFile ? "2px solid #4648d4" : "2px dashed rgba(70,72,212,0.35)",
          background: linkedinFile ? "rgba(70,72,212,0.04)" : "linear-gradient(135deg, rgba(70,72,212,0.02) 0%, rgba(224,224,255,0.12) 100%)",
          borderRadius: 14,
          padding: "32px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={e => { if (!linkedinFile) { e.currentTarget.style.borderColor = "rgba(70,72,212,0.60)"; e.currentTarget.style.background = "rgba(70,72,212,0.04)"; } }}
        onMouseLeave={e => { if (!linkedinFile) { e.currentTarget.style.borderColor = "rgba(70,72,212,0.35)"; e.currentTarget.style.background = "linear-gradient(135deg, rgba(70,72,212,0.02) 0%, rgba(224,224,255,0.12) 100%)"; } }}
      >
        <div style={{ marginBottom: 10 }}>
          <Icon name="file" size={30} color={linkedinFile ? "#4648d4" : "#767586"} />
        </div>
        <div style={{ fontSize: 14, color: linkedinFile ? "#4648d4" : "#767586", fontWeight: 500, fontFamily: "var(--sans)" }}>
          {linkedinFile ? linkedinFile.name : "Drop your LinkedIn PDF here or click to upload"}
        </div>
        {!linkedinFile && (
          <div style={{ fontSize: 12, color: "#767586", marginTop: 6, fontFamily: "var(--sans)" }}>PDF files only</div>
        )}
        <input id="li-upload" type="file" accept=".pdf" style={{ display: "none" }} onChange={e => setLinkedinFile(e.target.files[0])} />
      </div>

      <div style={{ fontSize: 12, color: "#767586", marginTop: 10, textAlign: "center", fontFamily: "var(--sans)" }}>You can skip this step</div>
      {error && (
        <div style={{ color: "#c0392b", fontSize: 12.5, marginTop: 12, fontFamily: "var(--sans)", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.14)", borderRadius: 8, padding: "9px 13px" }}>
          {error}
        </div>
      )}
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
      <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600, marginBottom: 6, color: "#111c2d", letterSpacing: "-0.02em" }}>Additional documents</div>

      {/* Info banner */}
      <div style={{
        background: "rgba(45,212,191,0.07)",
        border: "1px solid rgba(45,212,191,0.22)",
        borderRadius: 10,
        padding: "11px 14px",
        marginBottom: 22,
        fontSize: 13,
        color: "var(--teal)",
        lineHeight: 1.6,
        fontFamily: "var(--sans)",
      }}>
        <strong>Upload your resume</strong> — we'll automatically extract all projects and skills not on LinkedIn or GitHub.
      </div>

      {/* Drop zone */}
      <div
        onClick={() => document.getElementById("ex-upload").click()}
        style={{
          border: "2px dashed rgba(0,0,0,0.12)",
          borderRadius: 14,
          padding: "28px 20px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.2s ease, background 0.2s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(70,72,212,0.40)"; e.currentTarget.style.background = "rgba(70,72,212,0.02)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)"; e.currentTarget.style.background = "transparent"; }}
      >
        <div style={{ marginBottom: 8 }}>
          <Icon name="file" size={26} color="#767586" />
        </div>
        <div style={{ fontSize: 13.5, color: "#767586", fontFamily: "var(--sans)" }}>PDF, DOCX, PPTX accepted</div>
        <input id="ex-upload" type="file" multiple accept=".pdf,.docx,.pptx,.txt" style={{ display: "none" }} onChange={e => setExtraFiles(prev => [...prev, ...Array.from(e.target.files)])} />
      </div>

      {extraFiles.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {extraFiles.map((f, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f0f3ff",
              border: "1px solid rgba(70,72,212,0.10)",
              padding: "9px 13px",
              borderRadius: 9,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="file" size={14} color="#4648d4" />
                <span style={{ fontSize: 13, color: "#111c2d", fontFamily: "var(--sans)" }}>{f.name}</span>
              </div>
              <button onClick={() => setExtraFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#767586" }}>
                <Icon name="x" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ color: "#c0392b", fontSize: 12.5, marginTop: 12, fontFamily: "var(--sans)", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.14)", borderRadius: 8, padding: "9px 13px" }}>
          {error}
        </div>
      )}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
        <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        <Btn onClick={onUpload} disabled={loading}>
          {loading ? <Spinner size={14} color="#fff" /> : "Continue"} {!loading && <Icon name="arrow" size={14} color="#fff" />}
        </Btn>
      </div>
    </div>
  );
}

function Step4({ portfolioUrl, indexing, indexed, error, onBuild, onBack, onComplete, userId, profileName }) {
  return (
    <div style={{ textAlign: "center" }}>
      {!indexed ? (
        <>
          <div style={{
            fontFamily: "var(--serif)",
            fontSize: 26,
            fontWeight: 600,
            color: "#111c2d",
            marginBottom: 10,
            letterSpacing: "-0.02em",
          }}>
            Build your AI portfolio
          </div>
          <div style={{ color: "#767586", fontSize: 13.5, marginBottom: 40, lineHeight: 1.6, fontFamily: "var(--sans)", maxWidth: 340, margin: "0 auto 40px" }}>
            We'll index all your data, summarise your experience, and generate descriptions.
          </div>

          {/* Brain icon area */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #e1e0ff 0%, #dee8ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            fontSize: 34,
          }}>
            🧠
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Btn onClick={onBuild} disabled={indexing}>
              {indexing
                ? <><Spinner size={14} color="#fff" /> Building · ~45 seconds</>
                : <><Icon name="zap" size={14} color="#fff" /> Build Portfolio</>}
            </Btn>
            {error && (
              <div style={{ color: "#c0392b", fontSize: 12.5, fontFamily: "var(--sans)", background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.14)", borderRadius: 8, padding: "9px 13px", width: "100%", textAlign: "left" }}>
                {error}
              </div>
            )}
            {!indexing && (
              <Btn variant="ghost" onClick={onBack}>← Back</Btn>
            )}
          </div>
        </>
      ) : (
        <div style={{ animation: "fadeUp 0.5s ease" }}>
          {/* Ready heading */}
          <div style={{
            fontFamily: "var(--serif)",
            fontSize: 48,
            fontWeight: 700,
            color: "#111c2d",
            letterSpacing: "-0.03em",
            marginBottom: 8,
            lineHeight: 1,
          }}>
            Ready.
          </div>
          <div style={{ color: "#767586", fontSize: 14, marginBottom: 32, fontFamily: "var(--sans)", lineHeight: 1.5 }}>
            Share this link with anyone — it's live right now
          </div>

          {/* URL box with copy */}
          <div style={{
            display: "flex",
            gap: 8,
            marginBottom: 28,
            alignItems: "stretch",
          }}>
            <div style={{
              flex: 1,
              background: "#f0f3ff",
              border: "1px solid rgba(70,72,212,0.18)",
              borderRadius: 10,
              padding: "11px 14px",
              fontFamily: "monospace",
              fontSize: 12.5,
              color: "#4648d4",
              textAlign: "left",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {portfolioUrl}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(portfolioUrl)}
              style={{
                background: "#4648d4",
                border: "none",
                color: "#fff",
                borderRadius: 10,
                padding: "11px 16px",
                fontSize: 13,
                fontFamily: "var(--sans)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                cursor: "pointer",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#3a3cb8"}
              onMouseLeave={e => e.currentTarget.style.background = "#4648d4"}
            >
              <Icon name="copy" size={13} color="#fff" /> Copy
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn onClick={() => window.open(portfolioUrl, "_blank")}>
              <Icon name="link" size={14} color="#fff" /> Open in new tab
            </Btn>
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
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "52px 20px",
      background: "#f9f9ff",
      fontFamily: "var(--sans)",
    }}>
      {/* Brand header */}
      <div style={{ marginBottom: 48, textAlign: "center", animation: "fadeUp 0.5s ease" }}>
        <div style={{
          fontFamily: "var(--serif)",
          fontSize: 42,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "#4648d4",
          lineHeight: 1,
          marginBottom: 10,
        }}>
          Prolio
        </div>
        <div style={{
          color: "#767586",
          fontSize: 14,
          fontFamily: "var(--sans)",
          fontWeight: 400,
          letterSpacing: "0.01em",
        }}>
          Your AI portfolio, built from everything you've created
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator step={wizard.step} />

      {/* Wizard card */}
      <div style={{
        width: "100%",
        maxWidth: 540,
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 20,
        padding: "36px 40px",
        animation: "fadeUp 0.4s ease",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.04)",
      }}>
        {wizard.step === 1 && (
          <Step1
            profile={profile} setProfile={setProfile}
            photo={photo} setPhoto={setPhoto}
            error={wizard.error} loading={wizard.loading}
            onCreate={createProfile}
          />
        )}
        {wizard.step === 2 && (
          <Step2
            linkedinFile={linkedinFile} setLinkedinFile={setLinkedinFile}
            error={wizard.error} loading={wizard.loading}
            onBack={() => setWizard(w => ({ ...w, step: 1 }))}
            onUpload={uploadLinkedin}
          />
        )}
        {wizard.step === 3 && (
          <Step3
            extraFiles={extraFiles} setExtraFiles={setExtraFiles}
            error={wizard.error} loading={wizard.loading}
            onBack={() => setWizard(w => ({ ...w, step: 2 }))}
            onUpload={uploadExtras}
          />
        )}
        {wizard.step === 4 && (
          <Step4
            portfolioUrl={portfolioUrl}
            indexing={build.indexing}
            indexed={build.indexed}
            error={wizard.error}
            onBuild={buildIndex}
            onBack={() => setWizard(w => ({ ...w, step: 3 }))}
            onComplete={onComplete}
            userId={build.userId}
            profileName={profile.name}
          />
        )}
      </div>
    </div>
  );
}

export default SetupPage;
