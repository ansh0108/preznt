import { Spinner, Btn } from "../ui/primitives";
import Icon from "../ui/Icon";

// ─── StepRow ──────────────────────────────────────────────────────────────────
function StepRow({ step, i, totalSteps, uploadFile, setAddingGithub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < totalSteps - 1 ? "1px solid var(--line)" : "none", background: step.done ? "rgba(13,148,136,0.08)" : "transparent" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: step.done ? "rgba(13,148,136,0.12)" : "var(--bg3)", border: `1px solid ${step.done ? "rgba(13,148,136,0.35)" : "var(--line2)"}` }}>
        {step.done
          ? <Icon name="check" size={13} color="var(--teal)" />
          : step.action === "none" && step.building
          ? <Spinner size={12} color="var(--accent)" />
          : <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)" }}>{i + 1}</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: step.done ? "var(--teal)" : "var(--text)" }}>{step.label}</div>
        <div style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 2 }}>{step.hint}</div>
      </div>
      {step.action === "upload" && !step.done && (
        <label htmlFor={step.id} style={{ cursor: "pointer", flexShrink: 0 }}>
          <div style={{ background: "var(--accent)", color: "#fff", borderRadius: "var(--r-md)", padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>Upload</div>
          <input id={step.id} type="file" accept={step.accept} style={{ display: "none" }} onChange={e => e.target.files[0] && uploadFile(e.target.files[0], step.type)} />
        </label>
      )}
      {step.action === "upload" && step.done && (
        <label htmlFor={`${step.id}-replace`} style={{ cursor: "pointer", flexShrink: 0 }}>
          <div style={{ background: "var(--bg3)", color: "var(--text3)", border: "1px solid var(--line2)", borderRadius: "var(--r-md)", padding: "5px 12px", fontSize: 11 }}>Replace</div>
          <input id={`${step.id}-replace`} type="file" accept={step.accept} style={{ display: "none" }} onChange={e => e.target.files[0] && uploadFile(e.target.files[0], step.type)} />
        </label>
      )}
      {step.action === "github" && !step.done && (
        <button onClick={() => setAddingGithub(true)} style={{ background: "var(--accent)", color: "#fff", borderRadius: "var(--r-md)", padding: "6px 14px", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", flexShrink: 0 }}>Connect</button>
      )}
    </div>
  );
}

// ─── OnboardingSteps ──────────────────────────────────────────────────────────
function OnboardingSteps({ hasLinkedin, hasResume, hasGithub, hasLinks, built, building, buildError, uploadFile, setAddingGithub, buildPortfolio }) {
  const steps = [
    { label: "Upload LinkedIn PDF", done: hasLinkedin, id: "onb-li", accept: ".pdf", type: "linkedin", action: "upload", hint: "Go to your LinkedIn profile → More → Save to PDF" },
    { label: "Upload Resume", done: hasResume, id: "onb-cv", accept: ".pdf,.docx,.pptx,.txt", type: "resume", action: "upload", hint: "PDF, Word, or plain text — any format works" },
    { label: "Connect GitHub", done: hasGithub, action: "github", hint: "Shows your projects on the portfolio — optional but recommended" },
    { label: "Links & Credentials", done: hasLinks, action: "none", hint: hasLinks ? "Links added — visible in your portfolio" : "Add product links, certs, or publications from the left sidebar" },
    { label: "Portfolio built", done: built, action: "none", building, hint: building ? "Building your AI portfolio now…" : "Happens automatically after each upload" },
  ];
  const allDone = steps.every(s => s.done);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 0, background: "var(--bg1)", border: "1px solid var(--line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
        {steps.map((step, i) => <StepRow key={i} step={step} i={i} totalSteps={steps.length} uploadFile={uploadFile} setAddingGithub={setAddingGithub} />)}
      </div>
      {buildError && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 10 }}>{buildError}</div>}
      {allDone && (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Btn variant="ghost" onClick={buildPortfolio} disabled={building} style={{ fontSize: 12 }}>
            {building ? <><Spinner size={12} color="var(--accent)" /> Rebuilding…</> : "↺ Rebuild"}
          </Btn>
          <span style={{ fontSize: 12, color: "var(--text3)" }}>Run this if you've replaced a document and want to refresh the AI.</span>
        </div>
      )}
    </div>
  );
}

export default OnboardingSteps;
