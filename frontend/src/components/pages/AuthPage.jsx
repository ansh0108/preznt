import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { saveAuth } from "../../lib/auth";
import { Spinner, Btn } from "../ui/primitives";
import Icon from "../ui/Icon";

function UserTypeToggle({ userType, setUserType }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
      {[["seeker", "Job Seeker"], ["recruiter", "Recruiter"]].map(([val, label]) => (
        <button key={val} onClick={() => setUserType(val)} className="b-tab" data-active={userType === val} style={{
          flex: 1, padding: "10px 0", borderRadius: "var(--r-md)", fontSize: 13, fontWeight: 600,
          background: userType === val ? "var(--accent)" : "var(--bg2)",
          color: userType === val ? "#fff" : "var(--text3)",
          border: userType === val ? "1px solid var(--accent)" : "1px solid var(--line2)",
          cursor: "pointer",
        }}>{label}</button>
      ))}
    </div>
  );
}

function AuthInputFields({ email, setEmail, password, setPassword, confirm, setConfirm, isLogin, onSubmit }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
          <Icon name="mail" size={15} color="var(--text3)" />
        </div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email"
          onKeyDown={e => e.key === "Enter" && onSubmit()} style={{ paddingLeft: 38 }} />
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
          <Icon name="lock" size={15} color="var(--text3)" />
        </div>
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password"
          onKeyDown={e => e.key === "Enter" && onSubmit()} style={{ paddingLeft: 38 }} />
      </div>
      {!isLogin && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }}>
            <Icon name="lock" size={15} color="var(--text3)" />
          </div>
          <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password" type="password"
            onKeyDown={e => e.key === "Enter" && onSubmit()} style={{ paddingLeft: 38 }} />
        </div>
      )}
    </div>
  );
}

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
      saveAuth(res.data);
      onSuccess(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <button onClick={onBack} style={{ background: "transparent", border: "none", color: "var(--text3)", fontSize: 13, cursor: "pointer", marginBottom: 32, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="arrow" size={13} color="var(--text3)" style={{ transform: "rotate(180deg)" }} /> Back
        </button>
        <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
          {isLogin ? "Welcome back" : "Create your account"}
        </div>
        <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 32 }}>
          {isLogin ? "Sign in to your prolio account." : "Join prolio and start building your AI portfolio."}
        </div>
        {!isLogin && <UserTypeToggle userType={userType} setUserType={setUserType} />}
        <AuthInputFields email={email} setEmail={setEmail} password={password} setPassword={setPassword}
          confirm={confirm} setConfirm={setConfirm} isLogin={isLogin} onSubmit={submit} />
        {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <Btn onClick={submit} disabled={loading} style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}>
          {loading ? <><Spinner size={14} color="#fff" /> {isLogin ? "Signing in…" : "Creating account…"}</> : isLogin ? "Sign in" : "Create account"}
        </Btn>
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={onSwitch} style={{ background: "transparent", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
