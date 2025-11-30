export interface UserName {
  first?: string
  last?: string
  display?: string
}

export interface UserInfo {
  id: string
  login_id: string
  email: string
  name: UserName
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface LoginRequest {
  login_id: string
  password: string
}

export interface LoginResponse {
  user: UserInfo
  tokens: TokenResponse
}

export interface RegisterRequest {
  login_id: string
  email: string
  password: string
  name: UserName
}

export interface RegisterResponse {
  message: string
  user: UserInfo
  tokens: TokenResponse
}

export interface MeResponse {
  user: UserInfo
  roles: string[]
}

export interface ErrorResponse {
  error: string
  message: string
}
