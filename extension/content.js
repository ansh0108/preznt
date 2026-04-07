// ── Prolio Content Script ─────────────────────────────────────────────────────
// Runs on LinkedIn job pages. Scrapes job data and injects the Prolio button.

let lastUrl = location.href;
let buttonInjected = false;

function scrapeJobData() {
  // Job title
  const titleEl =
    document.querySelector(".job-details-jobs-unified-top-card__job-title h1") ||
    document.querySelector(".jobs-unified-top-card__job-title h1") ||
    document.querySelector("h1.t-24") ||
    document.querySelector("h1");
  const title = titleEl?.innerText?.trim() || "";

  // Company name
  const companyEl =
    document.querySelector(".job-details-jobs-unified-top-card__company-name a") ||
    document.querySelector(".jobs-unified-top-card__company-name a") ||
    document.querySelector(".jobs-unified-top-card__subtitle-primary-grouping a");
  const company = companyEl?.innerText?.trim() || "";

  // Job description
  const descEl =
    document.querySelector(".jobs-description__content .jobs-box__html-content") ||
    document.querySelector(".jobs-description-content__text") ||
    document.querySelector("#job-details") ||
    document.querySelector(".jobs-description");
  const description = descEl?.innerText?.trim() || "";

  return { title, company, description };
}

function injectButton() {
  if (buttonInjected && document.getElementById("prolio-btn")) return;

  // Find the apply button area to inject next to it
  const applyArea =
    document.querySelector(".jobs-apply-button--top-card") ||
    document.querySelector(".jobs-unified-top-card__content--two-pane") ||
    document.querySelector(".job-details-jobs-unified-top-card__container--two-pane");

  if (!applyArea) return;

  // Don't inject twice
  if (document.getElementById("prolio-btn")) return;

  const btn = document.createElement("button");
  btn.id = "prolio-btn";
  btn.innerHTML = `<span class="prolio-icon">⚡</span> Analyze with Prolio`;

  btn.addEventListener("click", () => {
    const job = scrapeJobData();
    if (!job.description) {
      alert("Could not read the job description. Please make sure the job details are fully loaded.");
      return;
    }
    // Store job in session and open side panel
    chrome.runtime.sendMessage({ type: "JOB_DATA", data: job }, () => {
      chrome.runtime.sendMessage({ type: "OPEN_PANEL" });
    });
    // Also store locally for immediate side panel access
    chrome.storage.session.set({ pendingJob: job });
  });

  applyArea.appendChild(btn);
  buttonInjected = true;
}

// Observe DOM changes (LinkedIn is a SPA)
const observer = new MutationObserver(() => {
  const currentUrl = location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    buttonInjected = false;
  }
  if (location.href.includes("/jobs/")) {
    injectButton();
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial inject
if (location.href.includes("/jobs/")) {
  setTimeout(injectButton, 1500);
}
