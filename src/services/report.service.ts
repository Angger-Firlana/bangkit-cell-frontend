import apiClient from '../api/client';
import type { ApiResponse } from '../types/common';
import type { SalesReport, ServiceReport, InventoryReport } from '../types/report';

const reportService = {
  getSalesReport: async (params?: any): Promise<ApiResponse<SalesReport>> => {
    const response = await apiClient.get('/reports/sales', { params });
    return response.data;
  },

  getServiceReport: async (params?: any): Promise<ApiResponse<ServiceReport>> => {
    const response = await apiClient.get('/reports/service', { params });
    return response.data;
  },

  getInventoryReport: async (params?: any): Promise<ApiResponse<InventoryReport>> => {
    const response = await apiClient.get('/reports/inventory', { params });
    return response.data;
  }
};

export default reportService;
