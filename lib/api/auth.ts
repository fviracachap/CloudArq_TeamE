import { apiClient } from "./client"
import type {
  LoginRequest,
  LoginResponse,
  User,
  UpdateUserPayload,
} from "../types"

export async function login(data: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getUser(id: number): Promise<User> {
  return apiClient<User>(`/users/${id}`)
}

export async function updateUser(
  id: number,
  data: UpdateUserPayload
): Promise<User> {
  return apiClient<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}
export type RegisterRequest = {
  name: string
  email: string
  password: string
  apartment?: string
  phone?: string
}

export async function registerUser(data: RegisterRequest): Promise<unknown> {
  return apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
