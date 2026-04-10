import MinimalProfileSetup from "../pages/MinimalProfileSetup";
import SeekerProfileDashboard from "./SeekerProfileDashboard";

function SeekerDashboard({ auth, setAuth, onLogout }) {
  const portfolioId = auth.portfolio_id || null;
  if (!portfolioId) return <MinimalProfileSetup auth={auth} setAuth={setAuth} onLogout={onLogout} />;
  return <SeekerProfileDashboard auth={auth} setAuth={setAuth} onLogout={onLogout} initialPortfolioId={portfolioId} />;
}

export default SeekerDashboard;
