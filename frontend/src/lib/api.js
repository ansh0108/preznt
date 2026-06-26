// Production backend is hardcoded because Vercel's VITE_API_URL held a stale
// Railway URL that could not be edited remotely. The Railway backend domain is
// abundant-harmony-production-2271 (recreated 2026-06-26 after an edge-route
// outage). Local dev still targets the local FastAPI server.
const PROD_API = "https://abundant-harmony-production-2271.up.railway.app";
export const API = import.meta.env.DEV ? "http://localhost:8004" : PROD_API;
