import apiClient from '../api/client';
import type { ApiResponse } from '../types/common';
import type { AuthResponse, LoginRequest } from '../types/auth';

const authService = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },
};

export default authService;
