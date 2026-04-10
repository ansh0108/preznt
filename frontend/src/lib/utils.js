export function getRouteFromHash() {
  const hash = window.location.hash;
  if (hash.startsWith("#/portfolio/")) {
    const slug = hash.replace("#/portfolio/", "");
    const idMatch = slug.match(/([0-9a-f]{8})$/);
    const userId = idMatch ? idMatch[1] : slug;
    return { page: "portfolio", userId };
  }
  if (hash === "#/login") return { page: "login", userId: null };
  if (hash === "#/signup") return { page: "signup", userId: null };
  if (hash === "#/dashboard") return { page: "dashboard", userId: null };
  return { page: "landing", userId: null };
}

export function nameToSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function guessDomain(name) {
  const ORG_OVERRIDES = {
    "university of illinois system":              "uillinois.edu",
    "university of illinois urbana-champaign":    "illinois.edu",
    "university of illinois":                     "illinois.edu",
    "uiuc":                                       "illinois.edu",
    "dwarkadas j. sanghvi college of engineering":"djsce.ac.in",
    "djsce":                                      "djsce.ac.in",
    "djsce e-cell":                               "djsce.ac.in",
    "djsce acm student chapter":                  "acm.org",
    "acm":                                        "acm.org",
    "cdp india pvt. ltd.":                        "cdpindia.com",
    "cdp india":                                  "cdpindia.com",
    "yearbook canvas":                            "yearbookcanvas.com",
    "choice equity broking":                      "choiceindia.com",
    "choice":                                     "choiceindia.com",
    "polestar":                                   "polestar.com",
    "shree balaji shipping & projects pvt. ltd.": "shreebalajigroup.com",
    "sfc foundations":                            "sfcfoundations.org",
  };
  const lower = (name || "").toLowerCase().trim();
  if (ORG_OVERRIDES[lower]) return ORG_OVERRIDES[lower];
  const clean = lower
    .replace(/\b(inc|llc|ltd|pvt|corp|co\b|group|technologies|solutions|systems|services|the|of|at|and|&|student|chapter|college|university|institute)\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
    .split(" ").filter(Boolean).slice(0, 2).join("") + ".com";
  return clean;
}

export function extractCompanyFromJD(jd) {
  if (!jd?.trim()) return "";
  const text = jd.trim();
  const aboutM = text.match(/\bAbout\s+([A-Z][A-Za-z0-9\s&,.'"-]{2,40}?)(?:\n|:|\.)/m);
  if (aboutM) return aboutM[1].trim();
  const hiringM = text.match(/^([A-Z][A-Za-z0-9\s&.'-]{2,35}?)\s+is\s+(?:hiring|looking|seeking)/m);
  if (hiringM) return hiringM[1].trim();
  const joinM = text.match(/\b(?:join|at)\s+([A-Z][A-Za-z0-9\s&]{2,30}?)(?:\s+(?:and|as|to|team)|[,.\n])/);
  if (joinM) return joinM[1].trim();
  const labelM = text.match(/\bCompany[:\s]+([A-Z][A-Za-z0-9\s&,.'"-]{2,40}?)(?:\n|$)/m);
  if (labelM) return labelM[1].trim();
  const firstLine = text.split("\n")[0].trim();
  if (firstLine.length < 60 && /^[A-Z]/.test(firstLine))
    return firstLine.replace(/[^A-Za-z0-9\s&]/g, "").trim();
  return "";
}

export const TECH_KEYWORDS = [
  "Python","JavaScript","TypeScript","React","FastAPI","Flask","Django","Node.js","Node",
  "Next.js","Vue","Angular","Vite","Express","Streamlit","Gradio",
  "SQL","PostgreSQL","MySQL","MongoDB","DuckDB","Snowflake","SQLite","Redis","BigQuery",
  "Pandas","NumPy","Scikit-learn","TensorFlow","PyTorch","Keras","XGBoost","LightGBM",
  "FAISS","Sentence Transformers","HuggingFace","LangChain","OpenAI","Groq",
  "ARIMA","Prophet","LSTM","RAG","NLP","LLM",
  "AWS","Azure","GCP","Docker","Kubernetes","CI/CD","Terraform",
  "Tableau","Power BI","Excel","dbt","Airflow","Spark","Kafka",
  "MATLAB","Scala","Java","Rust","C++","C#","Bash",
  "Salesforce","SAP","Figma","Notion",
];

export function extractTechTags(text = "", topics = [], language = "") {
  const found = new Set();
  for (const kw of TECH_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) found.add(kw);
  }
  for (const t of topics) {
    const label = t.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    if (label.length > 1) found.add(label);
  }
  if (language) found.add(language);
  return [...found].slice(0, 6);
}

export function getSkillClusters(profile) {
  const clusters = profile.skill_clusters;
  if (clusters && Object.keys(clusters).length > 0) return clusters;
  if (profile.skills?.length > 0) return { "Skills": profile.skills };
  return {};
}
