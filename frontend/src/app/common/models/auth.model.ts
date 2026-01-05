export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  data: TokenResponseData;
}

export interface TokenResponseData {
  access_token: string;
  token_type: string;
  expires_in: number;
  email: string;
}

export interface AuthState {
  token: string | null;
  email: string | null;
  expiresAt: number | null;
}
