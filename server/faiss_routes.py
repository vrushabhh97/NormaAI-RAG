import os
from flask import request, jsonify
from werkzeug.utils import secure_filename
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OpenAIEmbeddings
from rag_utils import extract_pdf_text, search_chunks
from openai import OpenAI, APIError, RateLimitError, AuthenticationError
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

session_vector_store = {}  # session_id -> FAISS index

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def upload_sop_to_faiss(file_path, session_id):
    try:
        text = extract_pdf_text(file_path)
        chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 30]
        
        # Check if OpenAI API key is available
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OpenAI API key is missing. Please check your .env file.")
            
        # Create embeddings and vector store with better error handling
        try:
            store = FAISS.from_texts(chunks, OpenAIEmbeddings())
            session_vector_store[session_id] = store
            return len(chunks)
        except AuthenticationError:
            raise ValueError("Invalid OpenAI API key. Please check your API key.")
        except RateLimitError:
            raise ValueError("OpenAI API rate limit exceeded. Please try again later.")
        except APIError as e:
            raise ValueError(f"OpenAI API error: {str(e)}")
    except Exception as e:
        print(f"Error in upload_sop_to_faiss: {str(e)}")
        raise

def upload_to_faiss():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        session_id = request.form.get('session_id')
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
            
        file_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
        file.save(file_path)

        try:
            chunk_count = upload_sop_to_faiss(file_path, session_id)
            os.remove(file_path)
            
            return jsonify({
                "message": f"Successfully uploaded document to session '{session_id}'",
                "chunks": chunk_count,
                "session_id": session_id
            })
        except Exception as e:
            # Make sure to clean up the file even if processing fails
            if os.path.exists(file_path):
                os.remove(file_path)
            # Re-raise the exception with more details
            raise ValueError(f"Failed to process document: {str(e)}")
        
    except ValueError as e:
        # Handle specific validation errors
        print(f"Validation error in upload_to_faiss: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        # Log the full error for debugging
        import traceback
        print(f"Unexpected error in upload_to_faiss: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Server error: {str(e)}"}), 500
    
def query_compare():
    try:
        session_id = request.json.get('session_id')
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
            
        if session_id not in session_vector_store:
            return jsonify({"error": "Session not found or expired"}), 404

        sop_store = session_vector_store[session_id]
        # Get a sample of SOP content for compar
        docs = sop_store.similarity_search("sop document", k=3)  # Using a generic query to get representative chunks
        sop_chunks = [doc.page_content for doc in docs]
        user_chunk = "\n\n".join(sop_chunks)

        # Find the most relevant FDA guidelines for these SOP chunks
        fda_matches = search_chunks(user_chunk, top_k=2)
        if not fda_matches:
            return jsonify({"answer": "No matching FDA content found."})

        fda_chunks = [match['metadata']['text'] for match in fda_matches]
        fda_text = "\n\n".join(fda_chunks)

        prompt = f"""
            You are comparing a hospital's SOP against FDA regulations. 

            Return a JSON object with the following fields:
            - title: A short descriptive title for the overall analysis
            - fda_requirement_summary: A comprehensive summary of FDA's expectations and requirements
            - user_summary: A concise summary of what the hospital's SOP says
            - potential_issues: An array of objects, where each object has the following structure:
                - issue: A specific compliance gap or issue described in a single actionable sentence
                - category: A category for this issue (e.g., "Validation Process", "Equipment Calibration Requirements", "Documentation Requirements", etc.)
                - fda_requirement: The specific FDA requirement related to this particular issue
                - sop_detail: The specific part of the SOP that relates to this issue
            
            Make sure each potential issue is specific, actionable, and includes its own related FDA requirement and SOP detail.
            Your response should be structured so each issue can be displayed independently with its own relevant context.
            
            Aim for 3-5 potential issues, each focusing on a different aspect of compliance.

            Now compare the following SOP content:
            "{user_chunk}"
            
            with the following FDA guideline content:
            "{fda_text}"
            """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )

        return jsonify({"answer": response.choices[0].message.content})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    
def ask_sop():
    try:
        session_id = request.json.get('session_id')
        question = request.json.get('question')
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
            
        if not question:
            return jsonify({"error": "Question is required"}), 400

        if session_id not in session_vector_store:
            return jsonify({"error": "Session not found or expired. Please upload your document first."}), 404

        # Get context from SOP document (FAISS)
        store = session_vector_store[session_id]
        sop_docs = store.similarity_search(question, k=2)
        
        if not sop_docs:
            sop_context = "No relevant information found in your SOP document."
        else:
            sop_context = "\n\n".join([doc.page_content for doc in sop_docs])
        
        # Get context from FDA documents (Pinecone)
        fda_matches = search_chunks(question, top_k=2)
        
        if not fda_matches:
            fda_context = "No relevant FDA guidelines found."
        else:
            fda_context = "\n\n".join([match['metadata']['text'] for match in fda_matches])

        # Combine both contexts with clear separation
        combined_context = f"""
        YOUR SOP DOCUMENT CONTENT:
        {sop_context}
        
        RELEVANT FDA GUIDELINES:
        {fda_context}
        """

        prompt = f"""
        Answer this question based on the following sources:
        
        {combined_context}
        
        QUESTION: {question}
        
        In your answer:
        1. If information comes from the SOP document, specify that
        2. If information comes from FDA guidelines, specify that
        3. If there are discrepancies between the two, highlight them
        4. If the question cannot be answered from either source, say so
        
        Give a clear, direct answer that references the specific sources of information.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )

        return jsonify({"answer": response.choices[0].message.content})
        
    except Exception as e:
        return jsonify({"error": f"Error while processing question: {str(e)}"}), 500
