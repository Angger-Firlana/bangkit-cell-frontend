import apiClient from '../api/client';
import type { ApiResponse } from '../types/common';
import type {
  ServiceJob,
  CreateServiceJobRequest,
  UpdateServiceStatusRequest,
  UpdateServiceStatusResponse,
  ServiceJobPartsResponse,
  AddServiceJobPartRequest,
} from '../types/serviceJob';
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

  listParts: async (id: number): Promise<ApiResponse<ServiceJobPartsResponse>> => {
    const response = await apiClient.get(`/services/jobs/${id}/parts`);
    return response.data;
  },

  addPart: async (id: number, data: AddServiceJobPartRequest): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/services/jobs/${id}/parts`, data);
    return response.data;
  },

  removePart: async (id: number, partId: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.delete(`/services/jobs/${id}/parts/${partId}`);
    return response.data;
  },

  summary: async (id: number): Promise<ApiResponse<{ service_job_id: number; parts_subtotal: number; service_fee: number; grand_total: number }>> => {
    const response = await apiClient.get(`/services/jobs/${id}/summary`);
    return response.data;
  },
};

export default serviceJobService;
