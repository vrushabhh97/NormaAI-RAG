# server/rag_utils.py
import os
import openai
from pinecone import Pinecone
from pdfminer.high_level import extract_text
from uuid import uuid4
from dotenv import load_dotenv
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
import fitz  # PyMuPDF

load_dotenv()

from openai import OpenAI
# …
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# Initialize Pinecone client
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))

# Connect to your serverless index
index = pc.Index(os.getenv("PINECONE_INDEX"))

session_vector_store = {}  # session_id → FAISS index

def upload_sop_to_faiss(file_path, session_id):
    from PyPDF2 import PdfReader
    reader = PdfReader(file_path)
    text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

    from langchain.text_splitter import CharacterTextSplitter
    chunks = CharacterTextSplitter(separator="\n\n", chunk_size=1000, chunk_overlap=100).split_text(text)
    
    store = FAISS.from_texts(chunks, OpenAIEmbeddings())
    session_vector_store[session_id] = store
    return len(chunks)

def search_chunks(query_text, top_k=1, namespace=None):
    query_vector = embed_text(query_text)
    results = index.query(
        vector=query_vector,
        top_k=top_k,
        include_metadata=True
    )
    return results['matches']

def fetch_chunks_by_label(label):
    results = index.describe_index_stats()
    all_vectors = []

    for namespace in results.get('namespaces', {}):
        # Note: only searches the stats — not actual metadata
        continue  # skip; SDK v3 doesn't support full metadata query yet

    # So instead, we’ll fetch all vectors by scanning
    # You can replace this later with a better metadata filter when SDK adds support
    return []  # temporary placeholder — will revisit in next iteration


def embed_text(text):
    resp = client.embeddings.create(
        model="text-embedding-3-large",
        input=[text]
    )
    return resp.data[0].embedding


def chunk_text(text, chunk_size=1000, overlap=200):
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    return chunks


def upload_sop(file_path, session_id):
    text = extract_pdf_text(file_path)
    chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 30]
    vector_store = FAISS.from_texts(chunks, OpenAIEmbeddings())
    session_vector_store[session_id] = vector_store
    return len(chunks)

def upload_pdf_to_pinecone(file_path, source_label):
    text = extract_text(file_path)
    chunks = chunk_text(text)

    vectors = []
    for i, chunk in enumerate(chunks):
        vector = embed_text(chunk)
        vectors.append({
            "id": str(uuid4()),
            "values": vector,
            "metadata": {
                "source": source_label,
                "chunk_index": i,
                "text": chunk
            }
        })

    index.upsert(vectors=vectors)
    return len(vectors)

def extract_pdf_text(file_path):
    """Extracts all text from a PDF file using PyMuPDF."""
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text