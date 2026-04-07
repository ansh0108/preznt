// ── Config ────────────────────────────────────────────────────────────────────
const API = "https://abundant-harmony-production-9091.up.railway.app";

// ── State ─────────────────────────────────────────────────────────────────────
let authToken = null;
let userId = null;
let userName = null;
let currentJob = null;
let lastJobTs = 0;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const viewLogin = document.getElementById("view-login");
const viewMain = document.getElementById("view-main");
const loginBtn = document.getElementById("login-btn");
const loginError = document.getElementById("login-error");
const logoutBtn = document.getElementById("logout-btn");
const userNameEl = document.getElementById("user-name");

const jobBar = document.getElementById("job-bar");
const jobTitleDisplay = document.getElementById("job-title-display");
const jobCompanyDisplay = document.getElementById("job-company-display");
const editJobBtn = document.getElementById("edit-job-btn");

const jobInputArea = document.getElementById("job-input-area");
const inputTitle = document.getElementById("input-title");
const inputCompany = document.getElementById("input-company");
const inputDesc = document.getElementById("input-desc");
const confirmJobBtn = document.getElementById("confirm-job-btn");

const tabBar = document.getElementById("tab-bar");

const runGapBtn = document.getElementById("run-gap-btn");
const gapLoading = document.getElementById("gap-loading");
const gapResult = document.getElementById("gap-result");

const runCoverBtn = document.getElementById("run-cover-btn");
const coverLoading = document.getElementById("cover-loading");
const coverResult = document.getElementById("cover-result");
const coverText = document.getElementById("cover-text");
const refineInput = document.getElementById("refine-input");
const refineBtn = document.getElementById("refine-btn");
const copyBtn = document.getElementById("copy-btn");
const copyConfirm = document.getElementById("copy-confirm");

// ── Init ──────────────────────────────────────────────────────────────────────
chrome.storage.local.get(["token", "userId", "userName"], async (data) => {
  if (data.token) {
    authToken = data.token;
    userId = data.userId;
    userName = data.userName;
    // Re-validate and refresh portfolio ID via /auth/me
    try {
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const me = await res.json();
        userName = me.profile_name || me.name || userName;
        userId = me.primary_portfolio_id || me.portfolio_ids?.[0] || userId;
        chrome.storage.local.set({ userId, userName });
      } else {
        // Token expired
        chrome.storage.local.remove(["token", "userId", "userName"]);
        showLogin(); return;
      }
    } catch (e) { /* offline, use cached values */ }
    showMain();
    pollForJob();
  } else {
    showLogin();
  }
});

// Poll for job scraped by background.js
function pollForJob() {
  chrome.storage.session.get(["pendingJob", "pendingJobTs"], (data) => {
    const ts = data.pendingJobTs || 0;
    if (data.pendingJob && ts > lastJobTs) {
      lastJobTs = ts;
      populateJobInput(data.pendingJob);
    }
  });
  setTimeout(pollForJob, 800);
}

function populateJobInput(job) {
  inputTitle.value = job.title || "";
  inputCompany.value = job.company || "";
  inputDesc.value = job.description || "";
  // If we got a good scrape, auto-confirm it
  if (job.description && job.description.length > 100) {
    confirmJob(job);
  }
}

// ── Auth ──────────────────────────────────────────────────────────────────────
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  if (!email || !password) { loginError.textContent = "Enter email and password."; return; }

  loginBtn.disabled = true;
  loginBtn.textContent = "Signing in…";
  loginError.textContent = "";

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");

    authToken = data.token;
    // gap-analysis/cover-letter use portfolio ID not user ID
    userId = data.primary_portfolio_id || data.portfolio_id || data.user_id;
    userName = data.name || email.split("@")[0];

    chrome.storage.local.set({ token: authToken, userId, userName });
    showMain();
    pollForJob();
  } catch (e) {
    loginError.textContent = e.message;
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "Sign In";
  }
});

logoutBtn.addEventListener("click", () => {
  authToken = null; userId = null; userName = null;
  chrome.storage.local.remove(["token", "userId", "userName"]);
  showLogin();
});

// ── Views ─────────────────────────────────────────────────────────────────────
function showLogin() {
  viewLogin.classList.remove("hidden");
  viewMain.classList.add("hidden");
}

function showMain() {
  viewLogin.classList.add("hidden");
  viewMain.classList.remove("hidden");
  userNameEl.textContent = userName || "";
  // Default: show input area for manual entry
  showInputArea();
}

function showInputArea() {
  jobBar.classList.add("hidden");
  jobInputArea.classList.remove("hidden");
  tabBar.classList.add("hidden");
}

function showJobConfirmed() {
  jobBar.classList.remove("hidden");
  jobInputArea.classList.add("hidden");
  tabBar.classList.remove("hidden");
}

// ── Job input ─────────────────────────────────────────────────────────────────
confirmJobBtn.addEventListener("click", () => {
  const desc = inputDesc.value.trim();
  if (!desc) {
    inputDesc.style.borderColor = "var(--red)";
    return;
  }
  inputDesc.style.borderColor = "";
  confirmJob({
    title: inputTitle.value.trim(),
    company: inputCompany.value.trim(),
    description: desc,
  });
});

editJobBtn.addEventListener("click", () => {
  showInputArea();
  // Restore previous values
  if (currentJob) {
    inputTitle.value = currentJob.title || "";
    inputCompany.value = currentJob.company || "";
    inputDesc.value = currentJob.description || "";
  }
});

function confirmJob(job) {
  currentJob = job;
  jobTitleDisplay.textContent = job.title || "Untitled Role";
  jobCompanyDisplay.textContent = job.company || "";
  showJobConfirmed();
  // Clear previous results
  gapResult.innerHTML = "";
  gapResult.classList.add("hidden");
  coverResult.classList.add("hidden");
  coverText.value = "";
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    document.getElementById("tab-gap").classList.toggle("hidden", tab !== "gap");
    document.getElementById("tab-cover").classList.toggle("hidden", tab !== "cover");
  });
});

// ── Gap Analysis ──────────────────────────────────────────────────────────────
runGapBtn.addEventListener("click", async () => {
  if (!currentJob?.description) return;

  runGapBtn.disabled = true;
  gapLoading.classList.remove("hidden");
  gapResult.classList.add("hidden");

  try {
    const res = await fetch(`${API}/gap-analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ user_id: userId, job_description: currentJob.description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Analysis failed");
    renderGapResult(data);
  } catch (e) {
    gapResult.innerHTML = `<div class="error-msg" style="text-align:left">${e.message}</div>`;
    gapResult.classList.remove("hidden");
  } finally {
    runGapBtn.disabled = false;
    gapLoading.classList.add("hidden");
  }
});

function scoreColor(score) {
  if (score >= 75) return "#4ade80";
  if (score >= 50) return "#fbbf24";
  return "#f87171";
}

function renderGapResult(data) {
  const score = data.ats_score || 0;
  const fit = data.overall_fit || "";
  const fitColor = fit === "Strong" ? "#4ade80" : fit === "Moderate" ? "#fbbf24" : "#f87171";
  const fitBg = fit === "Strong" ? "rgba(74,222,128,0.1)" : fit === "Moderate" ? "rgba(251,191,36,0.1)" : "rgba(248,113,113,0.1)";
  const col = scoreColor(score);

  let html = `
    <div class="score-row">
      <div>
        <div class="score-num" style="color:${col}">${score}</div>
        <div class="score-label">ATS Score</div>
      </div>
      <div class="score-right">
        <span class="fit-badge" style="color:${fitColor};background:${fitBg}">${fit} Match</span>
        <div class="score-bar-bg"><div class="score-bar-fill" style="width:${score}%;background:${col}"></div></div>
      </div>
    </div>`;

  if (data.summary) html += `<div class="card">${data.summary}</div>`;

  if (data.matching_keywords?.length) {
    html += `<div class="section-title">Matching Keywords</div><div class="pill-row">`;
    data.matching_keywords.slice(0, 10).forEach(k => { html += `<span class="pill match">${k}</span>`; });
    html += `</div>`;
  }

  if (data.missing_keywords?.length) {
    html += `<div class="section-title">Gaps</div><div class="pill-row">`;
    data.missing_keywords.slice(0, 8).forEach(k => {
      const kw = typeof k === "string" ? k : k.keyword;
      html += `<span class="pill missing">${kw}</span>`;
    });
    html += `</div>`;
  }

  if (data.strengths?.length) {
    html += `<div class="section-title">Strengths</div>`;
    data.strengths.slice(0, 3).forEach(s => {
      const point = typeof s === "string" ? s : s.point;
      const detail = typeof s === "object" ? s.detail : "";
      html += `<div class="card"><div class="card-title">✓ ${point}</div>${detail ? `<div>${detail}</div>` : ""}</div>`;
    });
  }

  if (data.quick_wins?.length) {
    html += `<div class="section-title">Quick Wins</div><div class="card">`;
    data.quick_wins.slice(0, 3).forEach((w, i) => {
      html += `<div class="quick-win"><span class="qw-num">${i + 1}</span><span>${w}</span></div>`;
    });
    html += `</div>`;
  }

  gapResult.innerHTML = html;
  gapResult.classList.remove("hidden");
}

// ── Cover Letter ──────────────────────────────────────────────────────────────
runCoverBtn.addEventListener("click", () => generateCoverLetter());
refineBtn.addEventListener("click", () => {
  const refinement = refineInput.value.trim();
  if (refinement) generateCoverLetter(refinement);
});

async function generateCoverLetter(refinement = null) {
  if (!currentJob?.description) return;

  runCoverBtn.disabled = true;
  coverLoading.classList.remove("hidden");
  coverResult.classList.add("hidden");

  try {
    const body = {
      user_id: userId,
      job_description: currentJob.description,
      role_name: currentJob.title || "",
      company_name: currentJob.company || "",
    };
    if (refinement) {
      body.refinement = refinement;
      body.existing_letter = coverText.value;
    }

    const res = await fetch(`${API}/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Generation failed");

    coverText.value = data.cover_letter;
    refineInput.value = "";
    coverResult.classList.remove("hidden");
  } catch (e) {
    coverResult.innerHTML = `<div class="error-msg">${e.message}</div>`;
    coverResult.classList.remove("hidden");
  } finally {
    runCoverBtn.disabled = false;
    coverLoading.classList.add("hidden");
  }
}

copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(coverText.value).then(() => {
    copyConfirm.classList.remove("hidden");
    setTimeout(() => copyConfirm.classList.add("hidden"), 2000);
  });
});
