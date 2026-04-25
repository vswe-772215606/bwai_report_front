import { apiClient } from "./client";
import type { LoginRequest, RegisterRequest, TokenResponse, User } from "../types/auth";

interface UserResponse {
  id: number;
  email: string;
  created_at: string;
}

function normalizeUser(user: UserResponse): User {
  return {
    id: String(user.id),
    email: user.email,
    created_at: user.created_at,
  };
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  const res = await apiClient.post<TokenResponse>("/auth/login", data);
  return res.data;
}

export async function register(data: RegisterRequest): Promise<User> {
  const res = await apiClient.post<UserResponse>("/auth/register", data);
  return normalizeUser(res.data);
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<UserResponse>("/auth/me");
  return normalizeUser(res.data);
}
