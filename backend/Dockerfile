FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install Python deps — no cache to keep image small
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Bind IPv6 dual-stack (::) so Railway's IPv6 private network / edge proxy can reach the container.
# Plain 0.0.0.0 is IPv4-only and becomes unreachable once Railway migrates the service to IPv6 networking.
CMD ["sh", "-c", "uvicorn main:app --host :: --port ${PORT:-8000}"]
