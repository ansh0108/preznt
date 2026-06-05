# Prolio — AI Career Portfolio Platform

Prolio turns a candidate's LinkedIn, resume, and GitHub into a single, shareable live portfolio with an embedded AI chatbot that answers recruiter questions grounded in the candidate's real experience. On top of the portfolio, Prolio ships an ATS gap-analysis engine, AI cover-letter generation, interview prep, and a recruiter evaluation flow that requires no candidate signup, all accessible through the web app and a companion Chrome extension.

**Stack:** Python, FastAPI, React 19, FAISS, Sentence Transformers, BM25, Groq (LLaMA 3.1 / 3.3), JWT, SQLite, Chrome Extension, Railway, Vercel

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Chrome Extension](#chrome-extension)
- [Deployment](#deployment)

---

## Features

### Portfolio Builder
- Upload a LinkedIn profile PDF, a resume (PDF, DOCX, PPTX, or TXT), and connect GitHub repositories.
- A structured parser extracts experience, education, skills, projects, and links from raw documents.
- Generates a clean, shareable live portfolio page with a public URL.
- Supports multiple portfolios per account, with a primary-portfolio switcher.

### Grounded AI Chatbot
- An embedded chatbot answers recruiter questions using only the candidate's real profile data.
- **Hybrid retrieval** combines FAISS dense vector search (Sentence Transformers, `all-MiniLM-L6-v2`) with BM25 keyword search for accuracy on both semantic and exact-match queries.
- Responses are streamed token-by-token for a fast, sub-500ms perceived latency.
- Powered by Groq-hosted LLaMA models for low-latency inference.

### ATS Gap Analysis
- Paste any job description and get an ATS-style breakdown of fit.
- A **four-agent parallel system** runs concurrently to produce:
  - An overall ATS fit score and Strong / Moderate / Weak rating.
  - Matching and missing keywords, tagged by importance.
  - STAR / XYZ-formatted resume bullet rewrites that preserve original length.
  - Quick wins, differentiation tips, and tone feedback.
- Results are savable to the account for later reference.

### AI Cover Letter Generator
- Generates a tailored cover letter from the candidate's profile and a target job description.
- Iterative refinement: request changes and regenerate without losing context.
- One-click export to a formatted PDF.

### Interview Prep
- Generates likely interview questions tailored to the candidate's background and the target role.

### Recruiter Evaluation (No Signup Required)
- Recruiters can upload a job description and evaluate candidates directly, without creating an account.
- Backed by a talent pool and candidate profile views, gated by JWT authentication.

### RAG Inspector (Observability)
- An internal admin tool to debug retrieval quality.
- Shows the exact chunks retrieved for any query, their relevance scores, and the final grounded answer.
- An **LLM-as-judge** evaluator scores each response on faithfulness, relevancy, and context quality, persisted to a scores table for monitoring.

### Chrome Extension
- A companion side-panel extension that scrapes job postings on LinkedIn, Indeed, Greenhouse, Lever, Workday, and generic sites.
- Runs gap analysis and cover-letter generation directly against the live posting, then exports a cover letter PDF in place.

### Analytics
- Tracks portfolio views and per-tab engagement so candidates can see how recruiters interact with their page.

---

## How It Works

1. **Ingest** — The candidate uploads a LinkedIn PDF and resume, and optionally links GitHub repos. The parser extracts structured data (experience, education, skills, projects, links).
2. **Index** — Documents are chunked and embedded with Sentence Transformers into a FAISS index, alongside a BM25 keyword index, stored per user.
3. **Serve** — A shareable portfolio page renders the structured profile with an embedded chatbot.
4. **Retrieve & Answer** — Recruiter questions trigger hybrid retrieval (FAISS + BM25); the top chunks are passed to a Groq LLaMA model, which streams a grounded answer.
5. **Analyze** — Job descriptions feed the four-agent gap-analysis pipeline and the cover-letter generator.
6. **Evaluate** — The RAG Inspector and LLM-judge continuously score answer quality for observability.

---

## Architecture

```
                    ┌─────────────────────────────┐
                    │   React 19 SPA (Vercel)      │
                    │   Portfolio · Dashboard ·    │
                    │   Gap Analysis · Recruiter   │
                    └──────────────┬──────────────┘
                                   │  REST / streaming
                    ┌──────────────▼──────────────┐
                    │   FastAPI backend (Railway)  │
                    │                              │
                    │  Parser  ─►  Embeddings      │
                    │              (FAISS + BM25)  │
                    │                │             │
                    │  Chatbot  ◄────┘  hybrid RAG │
                    │  Gap Analysis (4 agents)     │
                    │  Cover Letter · Interview    │
                    │  RAG Eval (LLM judge)        │
                    │  Auth (JWT) · Analytics      │
                    └──────┬───────────────┬───────┘
                           │               │
                    ┌──────▼─────┐   ┌─────▼──────┐
                    │  SQLite    │   │  Groq API  │
                    │  profiles, │   │  LLaMA 3.1 │
                    │  analyses, │   │  / 3.3     │
                    │  rag_scores│   └────────────┘
                    └────────────┘

         ┌──────────────────────────────────────────┐
         │  Chrome Extension (side panel)            │
         │  Scrapes job postings → calls backend API │
         └──────────────────────────────────────────┘
```

**Key design choices:**
- **Hybrid retrieval** (dense + sparse) outperforms either approach alone for profile Q&A, where queries mix semantic intent with exact skill names.
- **Parallel agents** in gap analysis run via `asyncio.gather`, so total latency equals the slowest single agent rather than the sum of all four.
- **Multi-key Groq rotation** spreads load across multiple API keys with retry-on-429 and model fallback, keeping the app responsive under rate limits.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Axios |
| Backend | Python, FastAPI, Uvicorn |
| Retrieval | FAISS, Sentence Transformers (`all-MiniLM-L6-v2`), BM25 (rank-bm25) |
| LLM | Groq — LLaMA 3.3 70B (quality) and LLaMA 3.1 8B (fast/chat) |
| Parsing | PyMuPDF, python-docx, python-pptx |
| Auth | JWT (python-jose), bcrypt |
| Storage | SQLite, local file storage for uploads and indexes |
| Extension | Chrome Manifest V3, jsPDF |
| Deployment | Railway (backend), Vercel (frontend) |

---

## Project Structure

```
preznt/
├── backend/                  # FastAPI application
│   ├── main.py               # API routes and app wiring
│   ├── parser.py             # LinkedIn / resume / GitHub parsing
│   ├── embeddings.py         # FAISS + BM25 hybrid index build/search
│   ├── chatbot.py            # Grounded RAG chat (streaming)
│   ├── gap_analysis.py       # 4-agent ATS gap analysis
│   ├── groq_client.py        # Groq calls, key rotation, model fallback
│   ├── rag_eval.py           # LLM-as-judge evaluation
│   ├── auth.py               # JWT auth
│   ├── analytics.py          # View/tab tracking
│   ├── saved_analyses.py     # Persist gap analyses
│   └── requirements.txt
├── frontend/                 # React 19 + Vite SPA
│   └── src/
│       ├── components/       # dashboard, portfolio, pages, setup, features, ui
│       ├── lib/              # API client
│       └── App.jsx
├── extension/                # Chrome side-panel extension
│   ├── manifest.json
│   ├── background.js         # Job scraping across job boards
│   ├── sidepanel.js          # Gap analysis + cover letter UI
│   └── jspdf.min.js
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com/)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables (see below), then run:
uvicorn main:app --reload --port 8004
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend reads the backend URL from `VITE_API_URL` (defaults to `http://localhost:8004`).

### Chrome Extension

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the `extension/` directory.
4. Update the `API` constant in `extension/sidepanel.js` if pointing at a non-default backend.

---

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Primary Groq API key (required) |
| `GROQ_API_KEY_2`, `GROQ_API_KEY_3`, … | Optional additional keys for rotation under rate limits |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `DATA_DIR` | Base directory for indexes, uploads, and profiles (defaults to `.`) |

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Base URL of the backend API |

> Never commit real keys. Use a local `.env` file and your deployment platform's secret manager.

---

## API Overview

Selected endpoints (see `backend/main.py` for the full set):

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/auth/signup`, `/auth/login` | Account auth, returns JWT |
| `GET` | `/auth/me` | Current user + portfolios |
| `POST` | `/portfolio/create` | Create a portfolio |
| `GET` | `/portfolios/mine` | List the user's portfolios |
| `POST` | `/upload/linkedin/{user_id}` | Upload and parse LinkedIn PDF |
| `POST` | `/upload/document/{user_id}` | Upload and parse resume / doc |
| `POST` | `/profile/{user_id}/github` | Attach GitHub repos |
| `POST` | `/index/{user_id}` | Build the FAISS + BM25 index |
| `POST` | `/chat`, `/chat/stream` | Grounded chatbot (sync / streaming) |
| `POST` | `/gap-analysis` | 4-agent ATS gap analysis |
| `POST` | `/cover-letter` | Generate / refine a cover letter |
| `POST` | `/interview-prep` | Generate interview questions |
| `POST` | `/evaluate/upload` | Recruiter candidate evaluation |
| `POST` | `/rag/inspect` | RAG Inspector retrieval debug |
| `GET` | `/rag/stats/{user_id}` | LLM-judge quality scores |
| `POST` | `/analyses/save` | Save a gap analysis |
| `GET` | `/analytics/{user_id}` | Portfolio engagement analytics |

---

## Chrome Extension

The extension opens a side panel on any tab and:
- Detects and scrapes the current job posting (LinkedIn, Indeed, Greenhouse, Lever, Workday, or a generic fallback).
- Lets you confirm or edit the scraped title, company, and description.
- Runs the same gap analysis and cover-letter generation as the web app, against the live posting.
- Exports the generated cover letter to a formatted PDF without leaving the page.

It authenticates against the same backend using the account's JWT.

---

## Deployment

- **Backend** is containerized (see `backend/Dockerfile`) and deployed on **Railway**, which injects environment variables and exposes a public domain.
- **Frontend** is deployed on **Vercel** with `VITE_API_URL` pointing at the Railway backend.
- Indexes, uploads, and the SQLite database persist under `DATA_DIR` on the backend host.

---

## License

This project is for portfolio and demonstration purposes.
