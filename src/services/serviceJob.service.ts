import apiClient from '../api/client';
import type { ApiResponse } from '../types/common';
import type { ServiceJob, CreateServiceJobRequest, UpdateServiceStatusRequest, UpdateServiceStatusResponse } from '../types/serviceJob';
import type { Paginated } from '../types/common';

const serviceJobService = {
  getAll: async (params?: any): Promise<ApiResponse<Paginated<ServiceJob>>> => {
    const response = await apiClient.get('/services/jobs', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<ServiceJob>> => {
    const response = await apiClient.get(`/services/jobs/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceJobRequest): Promise<ApiResponse<ServiceJob>> => {
    const response = await apiClient.post('/services/jobs', data);
    return response.data;
  },

  updateStatus: async (id: number, data: UpdateServiceStatusRequest): Promise<ApiResponse<UpdateServiceStatusResponse>> => {
    const response = await apiClient.patch(`/services/jobs/${id}/status`, data);
    return response.data;
  },
};

export default serviceJobService;
