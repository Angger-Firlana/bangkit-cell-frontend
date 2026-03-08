import apiClient from '../api/client';
import type { ApiResponse, Paginated } from '../types/common';
import type { CreateListingPhoneRequest, ListingPhone } from '../types/phone';

const phoneService = {
  getListings: async (params?: any): Promise<ApiResponse<Paginated<ListingPhone>>> => {
    const response = await apiClient.get('/phones', { params });
    return response.data;
  },

  createListing: async (payload: CreateListingPhoneRequest): Promise<ApiResponse<ListingPhone>> => {
    const formData = new FormData();
    if (payload.device_id) formData.append('device_id', String(payload.device_id));
    if (payload.device_query) formData.append('device_query', payload.device_query);
    formData.append('purchased_price', String(payload.purchased_price));
    formData.append('price', String(payload.price));
    formData.append('condition', payload.condition);
    formData.append('serial_number', payload.serial_number);
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const response = await apiClient.post('/phones', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  markSold: async (id: number): Promise<ApiResponse<ListingPhone>> => {
    const response = await apiClient.patch(`/phones/${id}/sold`);
    return response.data;
  },
};

export default phoneService;
