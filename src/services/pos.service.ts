import apiClient from '../api/client';
import type { ApiResponse } from '../types/common';
import type { Transaction, CreateTransactionRequest } from '../types/pos';
import type { Paginated } from '../types/common';

const posService = {
  getTransactions: async (params?: any): Promise<ApiResponse<Paginated<Transaction>>> => {
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  },

  getTransactionById: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  checkout: async (data: CreateTransactionRequest): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post('/transactions', data);
    return response.data;
  }
};

export default posService;
