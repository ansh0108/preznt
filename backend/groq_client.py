import os
import requests

_key_index = 0

PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"


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
            raise
    return None


def call_groq(messages: list, max_tokens: int = 500, temperature: float = 0.2) -> str:
    """Call Groq API with round-robin key rotation. Falls back to smaller model if rate limited."""
    keys = _get_keys()
    if not keys:
        raise Exception("No Groq API keys configured")

    # Try primary model first
    result = _try_keys(keys, PRIMARY_MODEL, messages, max_tokens, temperature)
    if result is not None:
        return result

    # All keys rate limited on primary — try faster/lighter fallback model
    print(f"[Groq] All keys rate limited on {PRIMARY_MODEL}, falling back to {FALLBACK_MODEL}")
    result = _try_keys(keys, FALLBACK_MODEL, messages, max_tokens, temperature)
    if result is not None:
        return result

    raise Exception("rate_limited")
