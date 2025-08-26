import axios from 'axios';
import { MintRequest, UpdateRequest, BurnRequest, MintResponse, UpdateResponse, BurnResponse, HistoryOperation, ServerStatus } from './types';

// const API_BASE = 'http://localhost:3001/api';
const API_BASE = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const apiClient = {
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