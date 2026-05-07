import { useState } from "react";
import MinimalProfileSetup from "../pages/MinimalProfileSetup";
import SeekerProfileDashboard from "./SeekerProfileDashboard";
import ProlioDashboard from "./ProlioDashboard";
import ProlioEditor from "../portfolio/ProlioEditor";

function SeekerDashboard({ auth, setAuth, onLogout }) {
  const portfolioId = auth.portfolio_id || null;
  const [view, setView] = useState("overview"); // "overview" | "full" | "editor"

  if (!portfolioId) return <MinimalProfileSetup auth={auth} setAuth={setAuth} onLogout={onLogout} />;

  if (view === "editor") return <ProlioEditor profile={null} onBack={() => setView("overview")} />;

  if (view === "full") return <SeekerProfileDashboard auth={auth} setAuth={setAuth} onLogout={onLogout} initialPortfolioId={portfolioId} />;

  return (
    <ProlioDashboard
      auth={auth}
      onLogout={onLogout}
      onSwitchToFull={() => setView("full")}
      onOpenEditor={() => setView("editor")}
    />
  );
}

export default SeekerDashboard;
