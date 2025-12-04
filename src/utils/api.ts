import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  MeResponse,
  TokenResponse,
  UserInfo,
} from '@/types/auth'
import type {
  TicketListResponse,
  TicketDetailResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  SearchTicketRequest,
  EntryDetailResponse,
  CreateEntryRequest,
  UpdateEntryRequest,
  Tag,
  PaginatedResponse,
  CreateTagRequest,
  UpdateTagRequest,
  AddTagRequest,
} from '@/types/ticket'
import type {
  ListEmailsResponse,
  GetEmailDetailResponse,
  EwsHealthResponse,
} from '@/types/ews'

const API_BASE = '/api'

class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('accessToken')

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      response.status,
      errorData.message || errorData.error || 'Request failed',
    )
  }

  return response.json()
}

export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<MeResponse>('/auth/me'),

  refresh: () =>
    request<TokenResponse>('/auth/refresh', {
      method: 'POST',
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  logoutAll: () =>
    request<{ message: string }>('/auth/logout-all', {
      method: 'POST',
    }),
}

export const ticketApi = {
  list: (page = 1, limit = 10) =>
    request<PaginatedResponse<TicketListResponse>>(
      `/tickets?page=${page}&limit=${limit}`,
    ),

  get: (id: string) => request<TicketDetailResponse>(`/tickets/${id}`),

  create: (data: CreateTicketRequest) =>
    request<TicketDetailResponse>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTicketRequest) =>
    request<TicketListResponse>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/tickets/${id}`, {
      method: 'DELETE',
    }),

  search: (data: SearchTicketRequest, page = 1, limit = 10) =>
    request<PaginatedResponse<TicketListResponse>>(
      `/tickets/search?page=${page}&limit=${limit}`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
    ),

  addTags: (id: string, data: AddTagRequest) =>
    request<{ message: string }>(`/tickets/${id}/tags`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeTag: (id: string, tagId: number) =>
    request<{ message: string }>(`/tickets/${id}/tags/${tagId}`, {
      method: 'DELETE',
    }),
}

export const entryApi = {
  get: (id: number) => request<EntryDetailResponse>(`/entries/${id}`),

  create: (ticketId: string, data: CreateEntryRequest) =>
    request<EntryDetailResponse>(`/tickets/${ticketId}/entries`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateEntryRequest) =>
    request<EntryDetailResponse>(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/entries/${id}`, {
      method: 'DELETE',
    }),

  addTags: (id: number, data: AddTagRequest) =>
    request<{ message: string }>(`/entries/${id}/tags`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeTag: (id: number, tagId: number) =>
    request<{ message: string }>(`/entries/${id}/tags/${tagId}`, {
      method: 'DELETE',
    }),
}

export const tagApi = {
  list: (page = 1, limit = 10) =>
    request<PaginatedResponse<Tag>>(`/tags?page=${page}&limit=${limit}`),

  get: (id: number) => request<Tag>(`/tags/${id}`),

  create: (data: CreateTagRequest) =>
    request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: UpdateTagRequest) =>
    request<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/tags/${id}`, {
      method: 'DELETE',
    }),
}

export const ewsApi = {
  health: () => request<EwsHealthResponse>('/plugins/ews/health'),

  listEmails: (mailbox: string, folder = 'inbox', limit = 50, offset = 0) =>
    request<ListEmailsResponse>(
      `/plugins/ews/emails?mailbox=${encodeURIComponent(mailbox)}&folder=${folder}&limit=${limit}&offset=${offset}`,
    ),

  getEmailDetail: (mailbox: string, itemId: string) =>
    request<GetEmailDetailResponse>(
      `/plugins/ews/email?mailbox=${encodeURIComponent(mailbox)}&item_id=${encodeURIComponent(itemId)}`,
    ),
}

export const userApi = {
  list: (page = 1, limit = 100) =>
    request<PaginatedResponse<UserInfo>>(`/users?page=${page}&limit=${limit}`),
}

export { ApiError }
