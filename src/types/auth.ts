export interface User {
  id: number;
  name: string;
  username?: string;
  email: string;
  role_id?: number;
  shop_id?: number | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}
