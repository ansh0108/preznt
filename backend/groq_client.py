import os
import requests

_key_index = 0


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


def call_groq(messages: list, max_tokens: int = 500, temperature: float = 0.2) -> str:
    """Call Groq API with round-robin key rotation and 429 fallback."""
    global _key_index
    keys = _get_keys()
    if not keys:
        raise Exception("No Groq API keys configured")

    start_idx = _key_index % len(keys)

    for i in range(len(keys)):
        key_idx = (start_idx + i) % len(keys)
        key = keys[key_idx]
        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens
                },
                timeout=30
            )
            if resp.status_code == 429:
                print(f"[Groq] Key #{key_idx + 1} rate limited, trying next...")
                continue
            resp.raise_for_status()
            # Advance index for round-robin on next call
            _key_index = (key_idx + 1) % len(keys)
            return resp.json()["choices"][0]["message"]["content"].strip()
        except requests.exceptions.HTTPError:
            if resp.status_code == 429:
                continue
            raise

    raise Exception("All Groq API keys are rate limited")
