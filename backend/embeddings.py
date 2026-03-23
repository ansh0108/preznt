import faiss
import numpy as np
import pickle
import os
from sentence_transformers import SentenceTransformer

# Load model once
_model = None


def get_model():
    global _model
    if _model is None:
        print("Loading sentence transformer model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def build_index(documents: list, user_id: str, index_dir: str = "./indexes") -> dict:
    """Build FAISS index from documents and save to disk."""
    os.makedirs(index_dir, exist_ok=True)
    model = get_model()

    texts = [doc["text"] for doc in documents]
    embeddings = model.encode(texts, show_progress_bar=False)
    embeddings = np.array(embeddings).astype("float32")

    # Build FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)

    # Save index and documents
    index_path = os.path.join(index_dir, f"{user_id}.index")
    docs_path = os.path.join(index_dir, f"{user_id}.docs")

    faiss.write_index(index, index_path)
    with open(docs_path, "wb") as f:
        pickle.dump(documents, f)

    return {"chunks": len(documents), "index_path": index_path}


def search_index(query: str, user_id: str, top_k: int = 6, index_dir: str = "./indexes") -> list:
    """Search FAISS index for relevant chunks."""
    index_path = os.path.join(index_dir, f"{user_id}.index")
    docs_path = os.path.join(index_dir, f"{user_id}.docs")

    if not os.path.exists(index_path):
        return []

    model = get_model()
    index = faiss.read_index(index_path)

    with open(docs_path, "rb") as f:
        documents = pickle.load(f)

    query_embedding = model.encode([query]).astype("float32")
    distances, indices = index.search(query_embedding, top_k)

    results = []
    for i, idx in enumerate(indices[0]):
        if idx < len(documents):
            results.append({
                **documents[idx],
                "score": float(distances[0][i])
            })

    return results


def index_exists(user_id: str, index_dir: str = "./indexes") -> bool:
    """Check if a user's index exists."""
    return os.path.exists(os.path.join(index_dir, f"{user_id}.index"))
