import faiss
import numpy as np
import pickle
import os
from sentence_transformers import SentenceTransformer

try:
    from rank_bm25 import BM25Okapi
    _BM25_AVAILABLE = True
except ImportError:
    _BM25_AVAILABLE = False

_model = None


def get_model():
    global _model
    if _model is None:
        print("Loading sentence transformer model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _tokenize(text: str) -> list:
    return text.lower().split()


def build_index(documents: list, user_id: str, index_dir: str = "./indexes") -> dict:
    """Build FAISS + BM25 hybrid index from documents and save to disk."""
    os.makedirs(index_dir, exist_ok=True)
    model = get_model()

    texts = [doc["text"] for doc in documents]
    embeddings = model.encode(texts, show_progress_bar=False)
    embeddings = np.array(embeddings).astype("float32")

    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    index_path = os.path.join(index_dir, f"{user_id}.index")
    docs_path = os.path.join(index_dir, f"{user_id}.docs")
    faiss.write_index(index, index_path)
    with open(docs_path, "wb") as f:
        pickle.dump(documents, f)

    if _BM25_AVAILABLE:
        tokenized = [_tokenize(t) for t in texts]
        bm25 = BM25Okapi(tokenized)
        bm25_path = os.path.join(index_dir, f"{user_id}.bm25")
        with open(bm25_path, "wb") as f:
            pickle.dump(bm25, f)

    return {"chunks": len(documents), "index_path": index_path}


def search_index(query: str, user_id: str, top_k: int = 6, index_dir: str = "./indexes") -> list:
    """Hybrid BM25+FAISS search using Reciprocal Rank Fusion."""
    index_path = os.path.join(index_dir, f"{user_id}.index")
    docs_path = os.path.join(index_dir, f"{user_id}.docs")

    if not os.path.exists(index_path):
        return []

    model = get_model()
    index = faiss.read_index(index_path)

    with open(docs_path, "rb") as f:
        documents = pickle.load(f)

    n = len(documents)
    fetch_k = min(top_k * 2, n)

    # FAISS semantic search — reciprocal rank scores
    query_embedding = model.encode([query]).astype("float32")
    distances, faiss_indices = index.search(query_embedding, fetch_k)
    faiss_scores = {int(idx): 1.0 / (rank + 1) for rank, idx in enumerate(faiss_indices[0]) if idx < n}

    # BM25 keyword search — reciprocal rank scores
    bm25_scores = {}
    bm25_path = os.path.join(index_dir, f"{user_id}.bm25")
    if _BM25_AVAILABLE and os.path.exists(bm25_path):
        with open(bm25_path, "rb") as f:
            bm25 = pickle.load(f)
        raw_scores = bm25.get_scores(_tokenize(query))
        ranked_bm25 = np.argsort(raw_scores)[::-1][:fetch_k]
        for rank, idx in enumerate(ranked_bm25):
            if raw_scores[idx] > 0:
                bm25_scores[int(idx)] = 1.0 / (rank + 1)

    # Reciprocal Rank Fusion: 60% semantic, 40% keyword
    all_ids = set(faiss_scores.keys()) | set(bm25_scores.keys())
    combined = {
        idx: faiss_scores.get(idx, 0) * 0.6 + bm25_scores.get(idx, 0) * 0.4
        for idx in all_ids
    }

    top_ids = sorted(combined, key=lambda x: combined[x], reverse=True)[:top_k]
    return [
        {**documents[idx], "score": combined[idx]}
        for idx in top_ids if idx < n
    ]


def index_exists(user_id: str, index_dir: str = "./indexes") -> bool:
    return os.path.exists(os.path.join(index_dir, f"{user_id}.index"))
