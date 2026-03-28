import axios from "axios";

// Base API URL - configure in .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Axios instance with default configuration
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to add authentication token
api.interceptors.request.use(
  async (config) => {
    // Here you can add the Clerk token
    // const token = await window.Clerk?.session?.getToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Invalid or expired token
      console.error("Unauthorized - please sign in again");
    }
    return Promise.reject(error);
  }
);

// Example API functions

// Clinical Trials
export const clinicalTrialsApi = {
  // Get trials
  getTrials: async (filters?: any) => {
    const response = await api.get("/trials", { params: filters });
    return response.data;
  },

  // Get trial by ID
  getTrialById: async (id: string) => {
    const response = await api.get(`/trials/${id}`);
    return response.data;
  },

  // Create new trial (researchers)
  createTrial: async (trialData: any) => {
    const response = await api.post("/trials", trialData);
    return response.data;
  },

  // Scrape from clinicaltrials.gov
  scrapeTrial: async (nctId: string) => {
    const response = await api.post("/trials/scrape", { nctId });
    return response.data;
  },
};

// Patients
export const patientsApi = {
  // Upload PDF (medical record)
  uploadMedicalRecord: async (file: File, patientId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", patientId);

    const response = await api.post("/patients/upload-record", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get matches for a patient
  getMatches: async (patientId: string) => {
    const response = await api.get(`/patients/${patientId}/matches`);
    return response.data;
  },

  // Create patient profile
  createPatient: async (patientData: any) => {
    const response = await api.post("/patients", patientData);
    return response.data;
  },
};

// Matching
export const matchingApi = {
  // Find matches between patient and trials
  findMatches: async (patientId: string, filters?: any) => {
    const response = await api.post("/matching/search", {
      patientId,
      ...filters,
    });
    return response.data;
  },

  // Get specific match score
  getMatchScore: async (patientId: string, trialId: string) => {
    const response = await api.get(`/matching/score`, {
      params: { patientId, trialId },
    });
    return response.data;
  },
};

// Messages
export const messagesApi = {
  // Send message
  sendMessage: async (from: string, to: string, message: string) => {
    const response = await api.post("/messages", { from, to, message });
    return response.data;
  },

  // Get user conversations
  getConversations: async (userId: string) => {
    const response = await api.get(`/messages/conversations/${userId}`);
    return response.data;
  },

  // Get conversation messages
  getMessages: async (conversationId: string) => {
    const response = await api.get(`/messages/${conversationId}`);
    return response.data;
  },
};

// Researchers
export const researchersApi = {
  // Verify ORCID
  verifyOrcid: async (orcidId: string) => {
    const response = await api.post("/researchers/verify-orcid", { orcidId });
    return response.data;
  },

  // Claim trial
  claimTrial: async (researcherId: string, trialId: string) => {
    const response = await api.post("/researchers/claim-trial", {
      researcherId,
      trialId,
    });
    return response.data;
  },
};

export default api;