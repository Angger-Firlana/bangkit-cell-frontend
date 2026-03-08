import apiClient from '../api/client';
import type { ApiResponse, Paginated } from '../types/common';
import type { CreateListingPhoneRequest, ListingPhone } from '../types/phone';

const phoneService = {
  getListings: async (params?: any): Promise<ApiResponse<Paginated<ListingPhone>>> => {
    const response = await apiClient.get('/phones', { params });
    return response.data;
  },

  createListing: async (payload: CreateListingPhoneRequest): Promise<ApiResponse<ListingPhone>> => {
    const response = await apiClient.post('/phones', payload);
    return response.data;
  },

  markSold: async (id: number): Promise<ApiResponse<ListingPhone>> => {
    const response = await apiClient.patch(`/phones/${id}/sold`);
    return response.data;
  },
};

export default phoneService;
