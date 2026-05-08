import { useState } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { saveAuth } from "../../lib/auth";
import { Spinner, Btn } from "../ui/primitives";
import Icon from "../ui/Icon";

function UserTypeToggle({ userType, setUserType }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "var(--bg3)", borderRadius: 100, padding: 4 }}>
      {[["seeker", "Job Seeker"], ["recruiter", "Recruiter"]].map(([val, label]) => (
        <button
          key={val}
          onClick={() => setUserType(val)}
          style={{
            flex: 1,
            padding: "8px 0",
            borderRadius: 100,
            fontSize: 13,
            fontFamily: "var(--sans)",
            fontWeight: 600,
            background: userType === val ? "var(--accent)" : "transparent",
            color: userType === val ? "#fff" : "var(--text3)",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            letterSpacing: "0.01em",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AuthInputFields({ email, setEmail, password, setPassword, confirm, setConfirm, isLogin, onSubmit }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon name="mail" size={15} color="var(--text3)" />
        </div>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email address"
          type="email"
          onKeyDown={e => e.key === "Enter" && onSubmit()}
          style={{
            width: "100%",
            paddingLeft: 42,
            paddingRight: 14,
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: 14,
            fontFamily: "var(--sans)",
            color: "var(--text)",
            background: "var(--bg2)",
            border: "1px solid var(--line2)",
            borderRadius: 8,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          }}
          onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-d)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--line2)"; e.target.style.boxShadow = "none"; }}
        />
      </div>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Icon name="lock" size={15} color="var(--text3)" />
        </div>
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          onKeyDown={e => e.key === "Enter" && onSubmit()}
          style={{
            width: "100%",
            paddingLeft: 42,
            paddingRight: 14,
            paddingTop: 12,
            paddingBottom: 12,
            fontSize: 14,
            fontFamily: "var(--sans)",
            color: "var(--text)",
            background: "var(--bg2)",
            border: "1px solid var(--line2)",
            borderRadius: 8,
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          }}
          onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-d)"; }}
          onBlur={e => { e.target.style.borderColor = "var(--line2)"; e.target.style.boxShadow = "none"; }}
        />
      </div>
      {!isLogin && (
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <Icon name="lock" size={15} color="var(--text3)" />
          </div>
          <input
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm password"
            type="password"
            onKeyDown={e => e.key === "Enter" && onSubmit()}
            style={{
              width: "100%",
              paddingLeft: 42,
              paddingRight: 14,
              paddingTop: 12,
              paddingBottom: 12,
              fontSize: 14,
              fontFamily: "var(--sans)",
              color: "var(--text)",
              background: "var(--bg2)",
              border: "1px solid var(--line2)",
              borderRadius: 8,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
            }}
            onFocus={e => { e.target.style.borderColor = "var(--accent)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-d)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--line2)"; e.target.style.boxShadow = "none"; }}
          />
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
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "row", fontFamily: "var(--sans)" }}>
      {/* Left branding panel */}
      <div style={{
        width: "45%",
        background: "var(--bg2)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 56px",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}>
        {/* Ambient indigo glow orb */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(129,140,248,0.08)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }} />
        {/* Bottom decorative ring */}
        <div style={{
          position: "absolute",
          bottom: -120,
          right: -80,
          width: 360,
          height: 360,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: -60,
          right: -20,
          width: 240,
          height: 240,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }} />

        {/* Brand name */}
        <div style={{
          fontFamily: "var(--serif)",
          fontSize: 52,
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginBottom: 16,
          position: "relative",
        }}>
          Prolio
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: "var(--serif)",
          fontStyle: "italic",
          fontSize: 18,
          color: "rgba(255,255,255,0.70)",
          marginBottom: 52,
          lineHeight: 1.5,
          fontWeight: 400,
          position: "relative",
        }}>
          Your work speaks — let it.
        </div>

        {/* Feature bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "relative" }}>
          {[
            ["AI portfolio in minutes", "We read your GitHub, LinkedIn, and docs to write your story."],
            ["Always up to date", "Your portfolio updates as your career grows — automatically."],
            ["Share a single link", "One elegant URL that showcases everything you've built."],
          ].map(([title, desc], i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 1,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff" }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", marginBottom: 2 }}>{title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.60)", lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1,
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 40px",
        position: "relative",
      }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 32,
            left: 36,
            background: "transparent",
            border: "none",
            color: "var(--text3)",
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--sans)",
            fontWeight: 500,
            padding: "6px 10px",
            borderRadius: 6,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text3)"}
        >
          <Icon name="arrow" size={13} color="currentColor" style={{ transform: "rotate(180deg)" }} />
          Back
        </button>

        {/* Form card */}
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Heading */}
          <div style={{
            fontFamily: "var(--serif)",
            fontSize: 32,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 8,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </div>
          <div style={{
            color: "var(--text3)",
            fontSize: 14,
            marginBottom: 32,
            fontFamily: "var(--sans)",
            lineHeight: 1.5,
          }}>
            {isLogin
              ? "Sign in to your Prolio account."
              : "Join Prolio and let your work speak for itself."}
          </div>

          {/* User type toggle (signup only) */}
          {!isLogin && <UserTypeToggle userType={userType} setUserType={setUserType} />}

          {/* Inputs */}
          <AuthInputFields
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            confirm={confirm} setConfirm={setConfirm}
            isLogin={isLogin} onSubmit={submit}
          />

          {/* Error */}
          {error && (
            <div style={{
              color: "var(--red)",
              fontSize: 13,
              marginBottom: 16,
              fontFamily: "var(--sans)",
              background: "rgba(248,113,113,0.10)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 8,
              padding: "10px 14px",
            }}>
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px 0",
              background: loading ? "rgba(99,102,241,0.5)" : "var(--accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: 100,
              fontSize: 14,
              fontFamily: "var(--sans)",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginBottom: 24,
              transition: "background 0.15s ease, box-shadow 0.15s ease",
              boxShadow: loading ? "none" : "0 4px 14px rgba(129,140,248,0.25)",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.opacity = "1"; }}
          >
            {loading
              ? <><Spinner size={14} color="#fff" /> {isLogin ? "Signing in…" : "Creating account…"}</>
              : isLogin ? "Sign in" : "Create account"}
          </button>

          {/* Switch link */}
          <div style={{ textAlign: "center", fontSize: 13, color: "var(--text3)", fontFamily: "var(--sans)" }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={onSwitch}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--accent)",
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--sans)",
                fontWeight: 600,
                textDecoration: "underline",
                textDecorationColor: "rgba(129,140,248,0.35)",
                textUnderlineOffset: 2,
              }}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
