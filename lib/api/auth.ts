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

export async function getUser(id: string): Promise<User> {
  return apiClient<User>(`/users/${id}`)
}

export async function updateUser(
  id: string,
  data: UpdateUserPayload
): Promise<User> {
  return apiClient<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}
