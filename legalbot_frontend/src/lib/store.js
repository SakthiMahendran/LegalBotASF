import { create } from "zustand";
import { authAPI, sessionsAPI, messagesAPI, aiAPI, documentsAPI } from "./api";

// Auth Store
export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(credentials);
      set({ isAuthenticated: true, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Registration failed",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authAPI.logout();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

// Sessions Store
export const useSessionsStore = create((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionsAPI.list();
      set({
        sessions: response.data.results || response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to fetch sessions",
        isLoading: false,
      });
    }
  },

  createSession: async (sessionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await sessionsAPI.create(sessionData);
      const newSession = response.data;
      set((state) => ({
        sessions: [newSession, ...state.sessions],
        currentSession: newSession,
        isLoading: false,
      }));
      return newSession;
    } catch (error) {
      console.error("Session creation error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create session";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  updateSession: async (id, sessionData) => {
    try {
      const response = await sessionsAPI.update(id, sessionData);
      const updatedSession = response.data;
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === id ? updatedSession : s)),
        currentSession:
          state.currentSession?.id === id
            ? updatedSession
            : state.currentSession,
      }));
      return updatedSession;
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to update session" });
      throw error;
    }
  },

  deleteSession: async (id) => {
    try {
      await sessionsAPI.delete(id);
      set((state) => ({
        sessions: state.sessions.filter((s) => s.id !== id),
        currentSession:
          state.currentSession?.id === id ? null : state.currentSession,
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to delete session" });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Messages Store
export const useMessagesStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  fetchMessages: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await messagesAPI.list(sessionId);
      set({
        messages: response.data.results || response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to fetch messages",
        isLoading: false,
      });
    }
  },

  addMessage: async (messageData) => {
    try {
      const response = await messagesAPI.create(messageData);
      const newMessage = response.data;
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
      return newMessage;
    } catch (error) {
      set({ error: error.response?.data?.error || "Failed to send message" });
      throw error;
    }
  },

  addLocalMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => set({ messages: [] }),
  clearError: () => set({ error: null }),
}));

// AI Store
export const useAIStore = create((set, get) => ({
  isGenerating: false,
  isRefining: false,
  isExtracting: false,
  error: null,
  healthStatus: null,

  checkHealth: async () => {
    try {
      const response = await aiAPI.healthCheck();
      set({ healthStatus: response.data });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Health check failed",
        healthStatus: { status: "error" },
      });
    }
  },

  generateDocument: async (data) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await aiAPI.generate(data);
      set({ isGenerating: false });
      return response.data;
    } catch (error) {
      console.error("AI generation error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        "Document generation failed";
      set({
        error: errorMessage,
        isGenerating: false,
      });
      throw error;
    }
  },

  refineDocument: async (data) => {
    set({ isRefining: true, error: null });
    try {
      const response = await aiAPI.refine(data);
      set({ isRefining: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Document refinement failed",
        isRefining: false,
      });
      throw error;
    }
  },

  extractDetails: async (data) => {
    set({ isExtracting: true, error: null });
    try {
      const response = await aiAPI.extractDetails(data);
      set({ isExtracting: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Detail extraction failed",
        isExtracting: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Documents Store
export const useDocumentsStore = create((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  error: null,

  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentsAPI.list();
      set({
        documents: response.data.results || response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to fetch documents",
        isLoading: false,
      });
    }
  },

  createDocument: async (documentData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await documentsAPI.create(documentData);
      const newDocument = response.data;
      set((state) => ({
        documents: [newDocument, ...state.documents],
        currentDocument: newDocument,
        isLoading: false,
      }));
      return newDocument;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to create document",
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentDocument: (document) => {
    set({ currentDocument: document });
  },

  downloadDocument: async (id, format = "docx") => {
    try {
      const response = await documentsAPI.download(id, format);

      // Create blob and download
      const blob = new Blob([response.data], {
        type:
          format === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `legal_document_${id}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return response;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Failed to download document",
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
