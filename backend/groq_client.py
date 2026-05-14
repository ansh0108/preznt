import os
import json
import requests

_key_index = 0

# For cover letters / gap analysis — quality matters, lower volume
QUALITY_MODEL = "llama-3.3-70b-versatile"
# For chatbot Q&A — 14,400 RPD vs 1,000 RPD on free tier; still great quality
CHAT_MODEL = "llama-3.1-8b-instant"


def _get_keys():
    keys = []
    primary = os.getenv("GROQ_API_KEY", "").strip()
    if primary:
        keys.append(primary)
    for i in range(2, 10):
        key = os.getenv(f"GROQ_API_KEY_{i}", "").strip()
        if key:
            keys.append(key)
    return keys


def _try_keys(keys, model, messages, max_tokens, temperature):
    """Try all keys with a given model. Returns (result, key_idx) or raises."""
    global _key_index
    start_idx = _key_index % len(keys)
    for i in range(len(keys)):
        key_idx = (start_idx + i) % len(keys)
        key = keys[key_idx]
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                json={"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens},
                timeout=30
            )
            if resp.status_code == 429:
                print(f"[Groq] Key #{key_idx + 1} rate limited on {model}, trying next...")
                continue
            resp.raise_for_status()
            _key_index = (key_idx + 1) % len(keys)
            return resp.json()["choices"][0]["message"]["content"].strip()
        except requests.exceptions.HTTPError:
            if resp.status_code == 429:
                continue
            if resp.status_code == 413:
                raise Exception("payload_too_large")
            raise
    return None


def _call_with_fallback(primary: str, fallback: str, messages: list, max_tokens: int, temperature: float) -> str:
    keys = _get_keys()
    if not keys:
        raise Exception("No Groq API keys configured")
    result = _try_keys(keys, primary, messages, max_tokens, temperature)
    if result is not None:
        return result
    print(f"[Groq] All keys rate limited on {primary}, falling back to {fallback}")
    result = _try_keys(keys, fallback, messages, max_tokens, temperature)
    if result is not None:
        return result
    raise Exception("rate_limited")


def call_groq(messages: list, max_tokens: int = 500, temperature: float = 0.2) -> str:
    """For cover letters / gap analysis — use quality model, fall back to chat model."""
    return _call_with_fallback(QUALITY_MODEL, CHAT_MODEL, messages, max_tokens, temperature)


def call_groq_chat(messages: list, max_tokens: int = 300, temperature: float = 0.3) -> str:
    """For chatbot Q&A — use fast model (14,400 RPD) first, fall back to quality model."""
    return _call_with_fallback(CHAT_MODEL, QUALITY_MODEL, messages, max_tokens, temperature)


def call_groq_stream(messages: list, max_tokens: int = 400, temperature: float = 0.3):
    """Generator that yields text chunks for streaming chat. Uses fast chat model."""
    keys = _get_keys()
    if not keys:
        yield "Error: No API keys configured"
        return

    global _key_index
    key = keys[_key_index % len(keys)]
    _key_index = (_key_index + 1) % len(keys)

    try:
        resp = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json={"model": CHAT_MODEL, "messages": messages, "temperature": temperature, "max_tokens": max_tokens, "stream": True},
            stream=True,
            timeout=30,
        )
        resp.raise_for_status()
        for line in resp.iter_lines():
            if not line:
                continue
            decoded = line.decode("utf-8")
            if not decoded.startswith("data: "):
                continue
            payload = decoded[6:]
            if payload == "[DONE]":
                break
            try:
                delta = json.loads(payload)["choices"][0]["delta"].get("content", "")
                if delta:
                    yield delta
            except (json.JSONDecodeError, KeyError, IndexError):
                continue
    except Exception as e:
        yield f"\n\n[Error: {e}]"
