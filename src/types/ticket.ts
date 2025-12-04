export type TicketStatus =
  | 'OPEN'
  | 'WAITING_FOR_INFO'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type TicketRequestType =
  | 'BUG'
  | 'MAINTENANCE'
  | 'FEATURE_REQUEST'
  | 'GENERAL_INQUIRY'

export type EntryType = 'COMMENT' | 'FILE' | 'SCHEDULE' | 'EVENT'

export type ContentFormat = 'PLAIN_TEXT' | 'MARKDOWN' | 'HTML' | 'NONE'

export interface UserName {
  first?: string
  last?: string
  display?: string
}

export interface Tag {
  id: number
  name: string
  color_code?: string
  category?: string
}

export interface Reference {
  target_type: string
  target_ticket_id?: string
  target_entry_id?: number
  target_user_id?: string
  target_user_name?: UserName
  created_at: string
}

export interface EntryListResponse {
  id: number
  ticket_id?: string
  entry_type: EntryType
  body: string
  format: ContentFormat
  parent_entry_id?: number
  author_user_id: string
  author_user_name?: UserName
  created_at: string
  updated_at: string
}

export interface EntryDetailResponse extends EntryListResponse {
  tags?: Tag[]
  references?: Reference[]
  payload?: Record<string, unknown>
}

export interface TicketListResponse {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  request_type: TicketRequestType
  due_date?: string
  created_at: string
  updated_at: string
}

export interface TicketDetailResponse extends TicketListResponse {
  assigned_user_id?: string
  assigned_user_name?: UserName
  entries?: EntryListResponse[]
  tags?: Tag[]
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  limit: number
  total_count: number
  total_pages: number
}

export interface CreateEntryRequest {
  entry_type?: EntryType
  body: string
  format?: ContentFormat
  parent_entry_id?: number
  tag_ids?: number[]
  references?: CreateReferenceRequest[]
  payload?: Record<string, unknown>
}

export interface CreateReferenceRequest {
  target_ticket_id?: string
  target_entry_id?: number
  target_user_id?: string
}

export interface CreateTicketRequest {
  title: string
  status?: TicketStatus
  priority?: TicketPriority
  request_type?: TicketRequestType
  assigned_user_id?: string
  due_date?: string
  tag_ids?: number[]
  initial_entry: CreateEntryRequest
}

export interface UpdateTicketRequest {
  title?: string
  status?: TicketStatus
  priority?: TicketPriority
  request_type?: TicketRequestType
  assigned_user_id?: string
  due_date?: string
}

export interface UpdateEntryRequest {
  body?: string
  format?: ContentFormat
  payload?: Record<string, unknown>
}

export interface CreateTagRequest {
  name: string
  color_code?: string
}

export interface UpdateTagRequest {
  name?: string
  color_code?: string
}

export interface AddTagRequest {
  tag_ids: number[]
  category?: string
}

export interface SearchTicketRequest {
  query?: string
  status?: TicketStatus[]
  priority?: TicketPriority[]
  request_type?: TicketRequestType[]
  assigned_user_id?: string
  tag_ids?: number[]
  due_date_from?: string
  due_date_to?: string
}
