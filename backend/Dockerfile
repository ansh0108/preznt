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

# Launch via start.py, which binds a true dual-stack (IPv4 + IPv6) socket.
# Railway's edge uses IPv6 while its health check path can use IPv4; a single
# 0.0.0.0 or :: bind only satisfies one. See start.py for details.
CMD ["python", "start.py"]
