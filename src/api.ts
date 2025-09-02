import axios from 'axios';
import { MintRequest, UpdateRequest, BurnRequest, MintResponse, UpdateResponse, BurnResponse, HistoryOperation, ServerStatus } from './types';

// Use Vite env var in production, fallback to localhost for dev
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:10000/api";

console.log("🔗 Using API base:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  withCredentials: false, // enable if server requires cookies
});

export const apiClient = {
  uploadImage: async (dataUrl: string, filename: string): Promise<{ ipfsUri: string, httpUrl: string }> => {
    const response = await api.post('/upload-image', { dataUrl, filename });
    return response.data;
  },
  mint: async (data: MintRequest): Promise<MintResponse> => {
    const response = await api.post('/mint', data);
    return response.data;
  },

  update: async (data: UpdateRequest): Promise<UpdateResponse> => {
    const response = await api.post('/update', data);
    return response.data;
  },

  burn: async (data: BurnRequest): Promise<BurnResponse> => {
    const response = await api.post('/burn', data);
    return response.data;
  },

  getHistory: async (): Promise<HistoryOperation[]> => {
    const response = await api.get('/history');
    return response.data;
  },

  getStatus: async (): Promise<ServerStatus> => {
    const response = await api.get('/status');
    return response.data;
  }
};