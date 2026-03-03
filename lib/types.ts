export type UserRole = "RESIDENT" | "ADMIN"

export type RequestStatus =
  | "CREATED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  apartment?: string
  phone?: string
  createdAt?: string
  updatedAt?: string
}

export interface ServiceType {
  id: number
  name: string
  description: string
  icon?: string
}

export interface ServiceRequest {
  id: number
  userId?: number
  serviceType?: ServiceType
  serviceTypeId?: number
  description?: string
  status: RequestStatus
  priority?: string
  createdAt: string
  updatedAt: string
}

export interface StatusHistory {
  id: number
  requestId: number
  status: string
  changedBy?: number
  changedAt: string
  notes?: string
}

export interface Notification {
  id: number
  userId: number
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
  serviceTypeId: number
  description: string
  priority?: string
  userId?: number
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
