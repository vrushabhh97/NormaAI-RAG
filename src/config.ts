// API configuration
export const API_BASE_URL = 'https://normaai-rag-production.up.railway.app'; // Replace with your Flask backend URL

// API endpoints
export const API_ENDPOINTS = {
  UPLOAD_TO_FAISS: `${API_BASE_URL}/upload_to_faiss`,
  ASK_SOP: `${API_BASE_URL}/ask_sop`,
  MAKE_ACTIONABLE: `${API_BASE_URL}/make_actionable`,
  UPLOAD_PDF: `${API_BASE_URL}/upload_pdf`
}; 