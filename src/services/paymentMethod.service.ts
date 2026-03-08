import apiClient from '../api/client';
import type { ApiResponse } from '../types/common';
import type { PaymentMethod } from '../types/pos';

const paymentMethodService = {
  getAll: async (): Promise<ApiResponse<PaymentMethod[]>> => {
    const response = await apiClient.get('/payment-methods');
    return response.data;
  },
};

export default paymentMethodService;
