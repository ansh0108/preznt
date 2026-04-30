// Open side panel when extension icon is clicked, then scrape the current tab
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });

  // Small delay to let the panel load before we send data
  setTimeout(async () => {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapePageForJob,
      });
      const jobData = results?.[0]?.result;
      if (jobData) {
        chrome.storage.session.set({ pendingJob: jobData, pendingJobTs: Date.now() });
      }
    } catch {
      // silent fail — page may not be a job listing
    }
  }, 600);
});

// This function runs IN the page context — scrapes job info from any site
function scrapePageForJob() {
  const host = location.hostname;

  function scrapeLinkedIn() {
    if (!host.includes("linkedin.com")) return null;
    const title =
      document.querySelector(".job-details-jobs-unified-top-card__job-title h1")?.innerText ||
      document.querySelector(".jobs-unified-top-card__job-title h1")?.innerText ||
      document.querySelector(".jobs-unified-top-card__job-title")?.innerText ||
      document.querySelector("h1.t-24")?.innerText ||
      document.querySelector("h2.t-24")?.innerText || "";
    const company =
      document.querySelector(".job-details-jobs-unified-top-card__company-name a")?.innerText ||
      document.querySelector(".jobs-unified-top-card__company-name a")?.innerText ||
      document.querySelector(".job-details-jobs-unified-top-card__primary-description-without-tagline a")?.innerText ||
      document.querySelector(".jobs-unified-top-card__subtitle-primary-grouping a")?.innerText || "";
    const desc =
      document.querySelector("#job-details")?.innerText ||
      document.querySelector(".jobs-description__content")?.innerText ||
      document.querySelector(".jobs-box__html-content")?.innerText ||
      document.querySelector(".jobs-description")?.innerText || "";
    return (title || desc) ? { title: title.trim(), company: company.trim(), description: desc.trim(), source: "LinkedIn" } : null;
  }

  function scrapeIndeed() {
    if (!host.includes("indeed.com")) return null;
    const title = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.innerText ||
      document.querySelector(".jobsearch-JobInfoHeader-title")?.innerText || "";
    const company = document.querySelector('[data-testid="inlineHeader-companyName"]')?.innerText ||
      document.querySelector(".jobsearch-InlineCompanyRating-companyHeader")?.innerText || "";
    const desc = document.querySelector("#jobDescriptionText")?.innerText || "";
    return (title || desc) ? { title: title.trim(), company: company.trim(), description: desc.trim(), source: "Indeed" } : null;
  }

  function scrapeGreenhouse() {
    if (!host.includes("greenhouse.io") && !host.includes("boards.greenhouse")) return null;
    const title = document.querySelector("h1.app-title")?.innerText || document.querySelector("h1")?.innerText || "";
    const company = document.querySelector(".company-name")?.innerText || "";
    const desc = document.querySelector("#content")?.innerText || document.querySelector(".job-post")?.innerText || "";
    return (title || desc) ? { title: title.trim(), company: company.trim(), description: desc.trim(), source: "Greenhouse" } : null;
  }

  function scrapeLever() {
    if (!host.includes("lever.co")) return null;
    const title = document.querySelector(".posting-headline h2")?.innerText || document.querySelector("h2")?.innerText || "";
    const company = document.querySelector(".main-header-text .main-header-logo")?.getAttribute("alt") || "";
    const desc = document.querySelector(".section-wrapper")?.innerText || document.querySelector(".posting")?.innerText || "";
    return (title || desc) ? { title: title.trim(), company: company.trim(), description: desc.trim(), source: "Lever" } : null;
  }

  function scrapeWorkday() {
    if (!host.includes("myworkdayjobs.com") && !host.includes("workday.com")) return null;
    const title = document.querySelector("[data-automation-id='jobPostingHeader']")?.innerText || document.querySelector("h2")?.innerText || "";
    const desc = document.querySelector("[data-automation-id='jobPostingDescription']")?.innerText || "";
    return (title || desc) ? { title: title.trim(), company: "", description: desc.trim(), source: "Workday" } : null;
  }

  function scrapeGeneric() {
    const pageTitle = document.title || "";
    const h1 = document.querySelector("h1")?.innerText || "";
    const h2 = document.querySelector("h2")?.innerText || "";
    let bestDesc = "";
    const candidates = document.querySelectorAll("article, [class*='job'], [class*='description'], [class*='posting'], [id*='job'], [id*='description'], main");
    let maxLen = 0;
    for (const el of candidates) {
      const text = el.innerText || "";
      if (text.length > maxLen && text.length > 200) {
        maxLen = text.length;
        bestDesc = text;
      }
    }
    if (!bestDesc) bestDesc = document.body.innerText.slice(0, 6000);
    return {
      title: (h1 || h2 || pageTitle).trim().slice(0, 120),
      company: "",
      description: bestDesc.trim().slice(0, 6000),
      source: host,
    };
  }

  return scrapeLinkedIn() || scrapeIndeed() || scrapeGreenhouse() || scrapeLever() || scrapeWorkday() || scrapeGeneric();
}
