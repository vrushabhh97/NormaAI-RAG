import os
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from openai import OpenAI
from flask_cors import CORS
load_dotenv()
from rag_utils import upload_pdf_to_pinecone

from faiss_routes import query_compare, ask_sop, upload_to_faiss

app = Flask(__name__)
# Configure CORS to allow requests from your frontend
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})

#openai.api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

UPLOAD_FOLDER = "/Users/vrushabhdeogirikar/Downloads/FDA Original.pdf"


#making csv checklist
@app.route('/make_actionable', methods=['POST'])
def make_actionable():
    data = request.get_json()
    issue = data.get('issue', '')

    if not issue or not isinstance(issue, str):
        return jsonify({"error": "No issue provided"}), 400

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": f"""
You are an expert in FDA compliance.

Given the following issue in a hospital SOP:
"{issue}"

Convert it into a short, clear, actionable checklist item. 
Respond with just the action sentence.
"""}
            ]
        )
        return jsonify({"action": response.choices[0].message['content'].strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


#uploading FDA doc to pinecone
@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    try:
        file = request.files['file']
        label = request.form.get('label') or secure_filename(file.filename)
        source_label = f"user_{label}"  # this will be stored in metadata

        file_path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
        file.save(file_path)

        count = upload_pdf_to_pinecone(file_path, source_label)
        os.remove(file_path)

        return jsonify({"message": f"Uploaded {count} chunks from '{label}' to Pinecone."})

    except Exception as e:
        print(f"❌ Upload error: {e}")
        return jsonify({"error": str(e)}), 500


#uploading SOP to FAISS for session-based RAG and comparing with FDA
@app.route('/upload_to_faiss', methods=['POST'])
def upload_sop_route():
    try:
        # First, perform the upload
        upload_result = upload_to_faiss()
        
        # If upload was successful, continue with query_compare
        if isinstance(upload_result, tuple) and upload_result[1] != 200:
            return upload_result  # Return the error if upload failed
            
        # Extract session_id from the upload result
        upload_data = upload_result.get_json()
        session_id = upload_data.get('session_id')
        
        if not session_id:
            return jsonify({"error": "Session ID missing from upload result"}), 500
        
        # Create a request context for query_compare
        with app.test_request_context(
            '/query_compare', 
            method='POST',
            json={'session_id': session_id}
        ):
            # Call the query_compare function 
            compare_result = query_compare()
            
            # Check if the comparison was successful
            if isinstance(compare_result, tuple) and compare_result[1] != 200:
                # Return a partial success with the upload data but noting comparison failed
                upload_data['comparison_status'] = 'failed'
                upload_data['comparison_error'] = compare_result.get_json().get('error', 'Unknown error')
                return jsonify(upload_data)
            
            # Get the comparison data
            comparison_data = compare_result.get_json()
            
        # Build the combined response
        response = {
            "upload_status": "success",
            "session_id": session_id,
            "chunks": upload_data.get('chunks'),
            "comparison": comparison_data.get('answer')
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": f"Error in combined upload and compare: {str(e)}"}), 500

#chatting with RAG with session id
@app.route('/ask_sop', methods=['POST'])
def ask_sop_route():
    try:
        # Validate that the request contains JSON data
        if not request.is_json:
            return jsonify({"error": "Request must contain JSON data"}), 400
            
        # Call the ask_sop function
        return ask_sop()
    except Exception as e:
        return jsonify({"error": f"Error in ask_sop route: {str(e)}"}), 500

if __name__ == '__main__':
    #main()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

