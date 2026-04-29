import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API } from "../../lib/api";
import { Spinner } from "../ui/primitives";
import Icon from "../ui/Icon";

const SUGGESTIONS = [
  "What's your background?", "What projects have you built?", "What are your strongest skills?",
  "Tell me about your most recent role", "What tools do you work with?", "What are you looking for next?",
];

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
    requestAnimationFrame(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (loading) scrollToBottom();
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

  const renderMsg = (content) => {
    const lines = content.split('\n').filter(l => l.trim());
    if (lines.length <= 1) return <span style={{ lineHeight: 1.6 }}>{content}</span>;
    return <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{lines.map((l, i) => <div key={i} style={{ lineHeight: 1.55 }}>{l}</div>)}</div>;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeUp 0.2s ease" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-d)", border: "1px solid var(--accent-b)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 10, marginTop: 2 }}>
                <Icon name="zap" size={13} color="var(--accent)" />
              </div>
            )}
            <div style={{
              maxWidth: "78%",
              background: msg.isError ? "rgba(248,113,113,0.08)" : msg.role === "user" ? "var(--accent)" : "var(--bg2)",
              color: msg.isError ? "var(--red)" : msg.role === "user" ? "#fff" : "var(--text2)",
              padding: "11px 15px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              fontSize: 13.5, border: msg.isError ? "1px solid rgba(248,113,113,0.25)" : msg.role === "assistant" ? "1px solid var(--line2)" : "none"
            }}>{renderMsg(msg.content)}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-d)", border: "1px solid var(--accent-b)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="zap" size={13} color="var(--accent)" />
            </div>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: "16px 16px 16px 4px", padding: "10px 15px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text3)" }}>Thinking</span>
              <div style={{ display: "flex", gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", opacity: 0.7, animation: "chatDot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {!loading && (
        <div style={{ padding: "10px 16px 8px", display: "flex", flexWrap: "wrap", gap: 6, borderTop: "1px solid var(--line)" }}>
          {SUGGESTIONS.filter(s => !messages.some(m => m.content === s)).slice(0, 4).map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{ background: "var(--bg2)", border: "1px solid var(--line2)", color: "var(--text3)", borderRadius: 100, padding: "5px 13px", fontSize: 12, fontWeight: 500, transition: "all 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--accent-b)"; e.currentTarget.style.background = "var(--accent-d)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text3)"; e.currentTarget.style.borderColor = "var(--line2)"; e.currentTarget.style.background = "var(--bg2)"; }}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about my background, skills, or projects…" style={{ flex: 1, borderRadius: 100, padding: "10px 18px" }} />
        <button onClick={() => send()} disabled={loading || cooldown || !input.trim()} style={{ background: "var(--accent)", color: "#fff", borderRadius: "50%", width: 42, height: 42, display: "flex", alignItems: "center", justifyContent: "center", opacity: loading || cooldown || !input.trim() ? 0.35 : 1, flexShrink: 0 }}>
          <Icon name="arrow" size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
