export type UserRole = "RESIDENT" | "ADMIN"

export type RequestStatus =
  | "CREATED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  apartment?: string
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export interface ServiceType {
  id: string
  name: string
  description: string
  icon?: string
}

export interface ServiceRequest {
  id: string
  userId: string
  serviceType: string
  serviceTypeId: string
  description: string
  status: RequestStatus
  priority?: string
  createdAt: string
  updatedAt: string
}

export interface StatusHistory {
  id: string
  requestId: string
  status: RequestStatus
  changedBy: string
  changedAt: string
  notes?: string
}

export interface Notification {
  id: string
  userId: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface CreateRequestPayload {
  serviceTypeId: string
  description: string
  priority?: string
}

export interface UpdateRequestPayload {
  description?: string
  priority?: string
}

export interface UpdateUserPayload {
  name?: string
  phone?: string
  apartment?: string
}
