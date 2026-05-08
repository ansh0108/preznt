import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner } from "../ui/primitives";
import Icon from "../ui/Icon";

// ── Prolio Light Luxury design tokens ──────────────────────────────────────
const P     = "#4648d4";
const T2    = "#464554";
const T3    = "#767586";
const BG    = "#f9f9ff";
const BG1   = "#ffffff";
const BG2   = "#f0f3ff";
const BGFIX = "#e1e0ff";
const BD    = "rgba(0,0,0,0.06)";
// ───────────────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "What's your background?", "What projects have you built?", "What are your strongest skills?",
  "Tell me about your most recent role", "What tools do you work with?", "What are you looking for next?",
];

function renderInline(text) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: T2, fontWeight: 600 }}>{part}</strong> : part
  );
}

function renderMsg(content) {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length <= 1) return <span style={{ lineHeight: 1.6 }}>{renderInline(content)}</span>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {lines.map((l, i) => {
        const isBullet = /^[-•]\s/.test(l);
        if (isBullet) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, lineHeight: 1.6, alignItems: "flex-start" }}>
              <span style={{ color: P, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>
              <span>{renderInline(l.replace(/^[-•]\s/, ""))}</span>
            </div>
          );
        }
        return <div key={i} style={{ lineHeight: 1.6 }}>{renderInline(l)}</div>;
      })}
    </div>
  );
}

function MessageBubble({ msg }) {
  return (
    <div style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.2s ease" }}>
      {msg.role === "assistant" && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: BGFIX, border: "1px solid rgba(70,72,212,0.20)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginRight: 10, marginTop: 2,
        }}>
          <Icon name="zap" size={13} color={P} />
        </div>
      )}
      <div style={{
        maxWidth: "78%",
        background: msg.isError
          ? "rgba(239,68,68,0.08)"
          : msg.role === "user"
          ? P
          : BG2,
        color: msg.isError
          ? "#ef4444"
          : msg.role === "user"
          ? "#fff"
          : T2,
        padding: "11px 15px",
        borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        fontSize: 13.5,
        fontFamily: "var(--sans)",
        border: msg.isError
          ? "1px solid rgba(239,68,68,0.25)"
          : msg.role === "assistant"
          ? `1px solid ${BD}`
          : "none",
      }}>
        {renderMsg(msg.content)}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: BGFIX, border: "1px solid rgba(70,72,212,0.20)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon name="zap" size={13} color={P} />
      </div>
      <div style={{
        background: BG2, border: `1px solid ${BD}`,
        borderRadius: "16px 16px 16px 4px", padding: "10px 15px",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 13, color: T3, fontFamily: "var(--sans)" }}>Thinking</span>
        <div style={{ display: "flex", gap: 3 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: P, opacity: 0.7, animation: "chatDot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Chatbot({ userId, userName, messages: messagesProp, setMessages: setMessagesProp }) {
  const defaultMsg = [{ role: "assistant", content: `Hi — I'm ${userName}'s portfolio assistant. Ask me anything about their background, projects, or skills.` }];
  const [localMessages, setLocalMessages] = useState(defaultMsg);
  const messages = messagesProp ?? localMessages;
  const setMessages = setMessagesProp ? (v) => { setMessagesProp(typeof v === "function" ? prev => v(prev) : v); } : setLocalMessages;

  useEffect(() => { if (setMessagesProp && messagesProp === null) setMessagesProp(defaultMsg); }, []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const chatContainerRef = useRef(null);
  const isFirstRender = useRef(true);

  const scrollToBottom = () => {
    // Use 99999 — browser clamps to max valid scrollTop automatically
    if (chatContainerRef.current) chatContainerRef.current.scrollTop = 99999;
  };

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    // Defer past React paint so scrollHeight reflects new content
    setTimeout(scrollToBottom, 30);
  }, [messages]);

  useEffect(() => {
    if (loading) setTimeout(scrollToBottom, 30);
  }, [loading]);

  const send = async (text) => {
    const q = text || input;
    if (!q.trim() || loading || cooldown) return;
    setInput("");
    setMessages(p => [...p, { role: "user", content: q }]);
    setLoading(true);
    setCooldown(true);
    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await axios.post(`${API}/chat`, { user_id: userId, question: q, history });
      setMessages(p => [...p, { role: "assistant", content: res.data.answer }]);
    } catch (err) {
      const msg = err?.response?.data?.detail || "I'm having trouble connecting right now — please try again in a moment.";
      setMessages(p => [...p, { role: "assistant", content: msg, isError: true }]);
    } finally {
      setLoading(false);
      setTimeout(() => setCooldown(false), 2000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: BG, borderRadius: 16, overflow: "hidden" }}>
      {/* Message list */}
      <div
        ref={chatContainerRef}
        style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}
      >
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
      </div>

      {/* Suggestion chips */}
      {!loading && (
        <div style={{ padding: "10px 16px 8px", display: "flex", flexWrap: "wrap", gap: 6, borderTop: `1px solid ${BD}` }}>
          {SUGGESTIONS.filter(s => !messages.some(m => m.content === s)).slice(0, 4).map((s, i) => (
            <button
              key={i}
              onClick={() => send(s)}
              style={{
                background: BG2, border: `1px solid ${BD}`,
                color: T3, borderRadius: 100, padding: "5px 13px",
                fontSize: 12, fontWeight: 500, transition: "all 0.12s",
                fontFamily: "var(--sans)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = P;
                e.currentTarget.style.borderColor = "rgba(70,72,212,0.20)";
                e.currentTarget.style.background = "rgba(70,72,212,0.08)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = T3;
                e.currentTarget.style.borderColor = BD;
                e.currentTarget.style.background = BG2;
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${BD}`, display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about my background, skills, or projects…"
          style={{
            flex: 1, borderRadius: 100, padding: "10px 18px",
            background: BG1, border: `1px solid ${BD}`,
            fontFamily: "var(--sans)", fontSize: 13.5, color: T2,
            outline: "none", transition: "border-color 0.15s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(70,72,212,0.40)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = BD; }}
        />
        <button
          onClick={() => send()}
          disabled={loading || cooldown || !input.trim()}
          style={{
            background: P, color: "#fff", borderRadius: "50%",
            width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: loading || cooldown || !input.trim() ? 0.35 : 1,
            flexShrink: 0, border: "none", cursor: loading || cooldown || !input.trim() ? "not-allowed" : "pointer",
            transition: "opacity 0.15s",
          }}
        >
          <Icon name="arrow" size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
