import apiClient from '../api/client';
import type { ApiResponse } from '../types/common';
import type { InventoryItem, StockAdjustmentRequest } from '../types/inventory';
import type { Paginated } from '../types/common';

const inventoryService = {
  getInventory: async (params?: any): Promise<ApiResponse<Paginated<InventoryItem>>> => {
    const response = await apiClient.get('/inventory', { params });
    return response.data;
  },

  adjustStock: async (data: StockAdjustmentRequest): Promise<ApiResponse<InventoryItem>> => {
    const response = await apiClient.post('/inventory/adjust', data);
    return response.data;
  }
};

export default inventoryService;
