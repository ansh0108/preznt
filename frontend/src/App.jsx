import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "./lib/api";
import { loadAuth, saveAuth, clearAuth } from "./lib/auth";
import { getRouteFromHash } from "./lib/utils";
import GlobalStyle from "./components/ui/GlobalStyle";
import LandingPage from "./components/pages/LandingPage";
import AuthPage from "./components/pages/AuthPage";
import RecruiterDashboard from "./components/pages/RecruiterDashboard";
import SeekerDashboard from "./components/dashboard/SeekerDashboard";
import PortfolioPage from "./components/portfolio/PortfolioPage";

export default function App() {
  const initial = getRouteFromHash();
  const [page, setPage] = useState(initial.page);
  const [userId, setUserId] = useState(initial.userId);
  const [auth, setAuth] = useState(loadAuth);
  const [defaultUserType, setDefaultUserType] = useState("seeker");

  useEffect(() => {
    const h = () => {
      const r = getRouteFromHash();
      setPage(r.page);
      setUserId(r.userId);
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  // Verify token on load
  useEffect(() => {
    if (!auth?.token) return;
    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => {
        const updated = { ...auth, ...r.data };
        saveAuth(updated);
        setAuth(updated);
      })
      .catch(() => { clearAuth(); setAuth(null); });
  }, []);

  const logout = () => { clearAuth(); setAuth(null); window.location.hash = ""; setPage("landing"); };

  // Public portfolio view — no auth required
  if (page === "portfolio") {
    return (
      <>
        <GlobalStyle />
        <PortfolioPage userId={userId} onBack={() => { window.location.hash = ""; setPage("landing"); }} />
      </>
    );
  }

  // Auth pages (login/signup) — only if not logged in
  if ((page === "login" || page === "signup") && !auth) {
    return (
      <>
        <GlobalStyle />
        <AuthPage
          mode={page}
          defaultType={defaultUserType}
          onSuccess={(data) => {
            setAuth(data);
            window.location.hash = "#/dashboard";
            setPage("dashboard");
          }}
          onSwitch={() => {
            const next = page === "login" ? "signup" : "login";
            window.location.hash = `#/${next}`;
            setPage(next);
          }}
          onBack={() => { window.location.hash = ""; setPage("landing"); }}
        />
      </>
    );
  }

  // Dashboard — requires auth
  if (page === "dashboard" || (auth && page === "landing")) {
    if (!auth) {
      return (
        <>
          <GlobalStyle />
          <LandingPage
            onSeeker={() => { setDefaultUserType("seeker"); window.location.hash = "#/signup"; setPage("signup"); }}
            onRecruiter={() => { setDefaultUserType("recruiter"); window.location.hash = "#/signup"; setPage("signup"); }}
            onLogin={() => { window.location.hash = "#/login"; setPage("login"); }}
          />
        </>
      );
    }
    if (auth.user_type === "recruiter") {
      return (
        <>
          <GlobalStyle />
          <RecruiterDashboard auth={auth} onLogout={logout} />
        </>
      );
    }
    return (
      <>
        <GlobalStyle />
        <SeekerDashboard auth={auth} setAuth={setAuth} onLogout={logout} />
      </>
    );
  }

  // Default landing page
  return (
    <>
      <GlobalStyle />
      <LandingPage
        onSeeker={() => { setDefaultUserType("seeker"); window.location.hash = "#/signup"; setPage("signup"); }}
        onRecruiter={() => { setDefaultUserType("recruiter"); window.location.hash = "#/signup"; setPage("signup"); }}
        onLogin={() => { window.location.hash = "#/login"; setPage("login"); }}
      />
    </>
  );
}
