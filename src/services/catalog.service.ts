import apiClient from '../api/client';
import type { ApiResponse } from '../types/common';
import type { Device, Status } from '../types/serviceJob';

const catalogService = {
  getDevices: async (): Promise<ApiResponse<Device[]>> => {
    const response = await apiClient.get('/services/devices');
    return response.data;
  },

  getServiceStatuses: async (): Promise<ApiResponse<Status[]>> => {
    const response = await apiClient.get('/services/statuses');
    return response.data;
  },

  getPhoneStatuses: async (): Promise<ApiResponse<Status[]>> => {
    const response = await apiClient.get('/phones/statuses');
    return response.data;
  },
};

export default catalogService;
