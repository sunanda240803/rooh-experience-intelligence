import axios from 'axios';
import {
  Experience,
  DashboardStats,
  ExperienceListResponse,
  AnalyzeRequest,
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export const api = {
  // Analyze URL or trigger Demo mode
  analyzeExperience: async (payload: AnalyzeRequest): Promise<Experience> => {
    const res = await axios.post<Experience>(`${API_BASE}/experiences/analyze`, payload);
    return res.data;
  },

  // Get overview stats
  getStats: async (): Promise<DashboardStats> => {
    const res = await axios.get<DashboardStats>(`${API_BASE}/experiences/stats`);
    return res.data;
  },

  // Query list of experiences with search and filters
  getExperiences: async (params?: {
    search?: string;
    category?: string;
    status?: string;
    skip?: number;
    limit?: number;
  }): Promise<ExperienceListResponse> => {
    const res = await axios.get<ExperienceListResponse>(`${API_BASE}/experiences`, { params });
    return res.data;
  },

  // Get single experience detail by ID
  getExperienceById: async (id: string): Promise<Experience> => {
    const res = await axios.get<Experience>(`${API_BASE}/experiences/${id}`);
    return res.data;
  },

  // Update experience details
  updateExperience: async (id: string, payload: Partial<Experience>): Promise<Experience> => {
    const res = await axios.put<Experience>(`${API_BASE}/experiences/${id}`, payload);
    return res.data;
  },

  // Approve experience
  approveExperience: async (id: string): Promise<Experience> => {
    const res = await axios.post<Experience>(`${API_BASE}/experiences/${id}/approve`);
    return res.data;
  },

  // Reject experience
  rejectExperience: async (id: string): Promise<Experience> => {
    const res = await axios.post<Experience>(`${API_BASE}/experiences/${id}/reject`);
    return res.data;
  },

  // Delete experience
  deleteExperience: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE}/experiences/${id}`);
  },

  // Seed sample demo experiences
  seedDemo: async (): Promise<Experience[]> => {
    const res = await axios.post<Experience[]>(`${API_BASE}/experiences/seed-demo`);
    return res.data;
  }
};
