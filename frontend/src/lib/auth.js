export function loadAuth() {
  try { return JSON.parse(localStorage.getItem("prolio_auth")) || null; } catch { return null; }
}
export function saveAuth(data) { localStorage.setItem("prolio_auth", JSON.stringify(data)); }
export function clearAuth() { localStorage.removeItem("prolio_auth"); }
