import apiClient from '../api/client';
import type { ApiResponse } from '../types/common';
import type { Device, Status } from '../types/serviceJob';
import type { DeviceBrand, DeviceModel } from '../types/deviceCatalog';

const catalogService = {
  getDevices: async (): Promise<ApiResponse<Device[]>> => {
    const response = await apiClient.get('/services/devices');
    return response.data;
  },

  createDevice: async (payload: { name: string; brand_id?: number; level_device_id?: number }): Promise<ApiResponse<{ device: Device } | Device>> => {
    const response = await apiClient.post('/services/devices', payload);
    return response.data;
  },

  getDeviceBrands: async (): Promise<ApiResponse<DeviceBrand[]>> => {
    const response = await apiClient.get('/services/device-brands');
    return response.data;
  },

  createDeviceBrand: async (payload: { name: string }): Promise<ApiResponse<{ brand: DeviceBrand } | DeviceBrand>> => {
    const response = await apiClient.post('/services/device-brands', payload);
    return response.data;
  },

  updateDeviceBrand: async (id: number, payload: { name: string }): Promise<ApiResponse<{ brand: DeviceBrand } | DeviceBrand>> => {
    const response = await apiClient.patch(`/services/device-brands/${id}`, payload);
    return response.data;
  },

  deleteDeviceBrand: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.delete(`/services/device-brands/${id}`);
    return response.data;
  },

  getDeviceModels: async (): Promise<ApiResponse<DeviceModel[]>> => {
    const response = await apiClient.get('/services/device-models');
    return response.data;
  },

  createDeviceModel: async (payload: { name: string; brand_id: number }): Promise<ApiResponse<{ model: DeviceModel } | DeviceModel>> => {
    const response = await apiClient.post('/services/device-models', payload);
    return response.data;
  },

  updateDeviceModel: async (id: number, payload: { name: string; brand_id: number }): Promise<ApiResponse<{ model: DeviceModel } | DeviceModel>> => {
    const response = await apiClient.patch(`/services/device-models/${id}`, payload);
    return response.data;
  },

  deleteDeviceModel: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.delete(`/services/device-models/${id}`);
    return response.data;
  },

  updateDevice: async (id: number, payload: { name: string; brand_id: number; level_device_id: number }): Promise<ApiResponse<{ device: Device } | Device>> => {
    const response = await apiClient.patch(`/services/devices/${id}`, payload);
    return response.data;
  },

  deleteDevice: async (id: number): Promise<ApiResponse<unknown>> => {
    const response = await apiClient.delete(`/services/devices/${id}`);
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
