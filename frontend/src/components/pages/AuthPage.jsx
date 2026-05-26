import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { saveAuth } from "../../lib/auth";
import { Spinner } from "../ui/primitives";
import Icon from "../ui/Icon";
import AuthBrandPanel from "./AuthBrandPanel";

// ─── UserTypeToggle ───────────────────────────────────────────────────────────
function UserTypeToggle({ userType, setUserType }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "var(--bg3)", borderRadius: 100, padding: 4 }}>
      {[["seeker", "Job Seeker"], ["recruiter", "Recruiter"]].map(([val, label]) => (
        <button key={val} onClick={() => setUserType(val)}
          style={{ flex: 1, padding: "8px 0", borderRadius: 100, fontSize: 13, fontFamily: "var(--sans)", fontWeight: 600, background: userType === val ? "var(--accent)" : "transparent", color: userType === val ? "#fff" : "var(--text3)", border: "none", cursor: "pointer", transition: "all 0.2s ease", letterSpacing: "0.01em" }}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── StyledInput ──────────────────────────────────────────────────────────────
function StyledInput({ iconName, value, onChange, placeholder, type, onKeyDown }) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <Icon name={iconName} size={15} color="var(--text3)" />
      </div>
      <input value={value} onChange={onChange} placeholder={placeholder} type={type} onKeyDown={onKeyDown}
        style={{ width: "100%", paddingLeft: 42, paddingRight: 14, paddingTop: 12, paddingBottom: 12, fontSize: 14, fontFamily: "var(--sans)", color: "var(--text)", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: 8, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s ease, box-shadow 0.15s ease" }}
        onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-d)"; }}
        onBlur={e => { e.target.style.borderColor = "var(--line2)"; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

// ─── AuthInputFields ──────────────────────────────────────────────────────────
function AuthInputFields({ email, setEmail, password, setPassword, confirm, setConfirm, isLogin, onSubmit }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
      <StyledInput iconName="mail" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" onKeyDown={e => e.key === "Enter" && onSubmit()} />
      <StyledInput iconName="lock" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" onKeyDown={e => e.key === "Enter" && onSubmit()} />
      {!isLogin && <StyledInput iconName="lock" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" type="password" onKeyDown={e => e.key === "Enter" && onSubmit()} />}
    </div>
  );
}

// ─── AuthPage ─────────────────────────────────────────────────────────────────
function AuthPage({ mode, defaultType = "seeker", onSuccess, onSwitch, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [userType, setUserType] = useState(defaultType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isLogin = mode === "login";

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) return setError("Please fill in all fields.");
    if (!isLogin && password !== confirm) return setError("Passwords do not match.");
    if (!isLogin && password.length < 6) return setError("Password must be at least 6 characters.");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const body = isLogin ? { email, password } : { email, password, user_type: userType };
      const res = await axios.post(`${API}${endpoint}`, body);
      saveAuth(res.data); onSuccess(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row", fontFamily: "var(--sans)" }}>
      <AuthBrandPanel />
      <div style={{ flex: 1, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 40px", position: "relative" }}>
        <button onClick={onBack} style={{ position: "absolute", top: 32, left: 36, background: "transparent", border: "none", color: "var(--text3)", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--sans)", fontWeight: 500, padding: "6px 10px", borderRadius: 6, transition: "color 0.15s ease" }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}>
          <Icon name="arrow" size={13} color="currentColor" style={{ transform: "rotate(180deg)" }} /> Back
        </button>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 700, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </div>
          <div style={{ color: "var(--text3)", fontSize: 14, marginBottom: 32, fontFamily: "var(--sans)", lineHeight: 1.5 }}>
            {isLogin ? "Sign in to your Prolio account." : "Join Prolio and let your work speak for itself."}
          </div>
          {!isLogin && <UserTypeToggle userType={userType} setUserType={setUserType} />}
          <AuthInputFields email={email} setEmail={setEmail} password={password} setPassword={setPassword} confirm={confirm} setConfirm={setConfirm} isLogin={isLogin} onSubmit={submit} />
          {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16, fontFamily: "var(--sans)", background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, padding: "10px 14px" }}>{error}</div>}
          <button onClick={submit} disabled={loading}
            style={{ width: "100%", padding: "13px 0", background: loading ? "rgba(99,102,241,0.5)" : "var(--accent)", color: "#ffffff", border: "none", borderRadius: 100, fontSize: 14, fontFamily: "var(--sans)", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24, transition: "background 0.15s ease, box-shadow 0.15s ease", boxShadow: loading ? "none" : "0 4px 14px rgba(129,140,248,0.25)" }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = "1"; }}>
            {loading ? <><Spinner size={14} color="#fff" /> {isLogin ? "Signing in…" : "Creating account…"}</> : isLogin ? "Sign in" : "Create account"}
          </button>
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)", fontFamily: "var(--sans)" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={onSwitch} style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, fontFamily: "var(--sans)", fontWeight: 600, textDecoration: "underline", textDecorationColor: "rgba(129,140,248,0.35)", textUnderlineOffset: 2 }}>
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
