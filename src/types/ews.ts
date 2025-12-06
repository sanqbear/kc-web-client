export interface EmailAddress {
  name: string
  address: string
}

export interface EmailListItem {
  item_id: string
  conversation_id?: string
  subject: string
  from: string
  from_email: string
  received_date: string
  has_attachments: boolean
  is_read: boolean
  preview?: string
}

export interface AttachmentInfo {
  attachment_id: string
  name: string
  content_type: string
  content_id?: string
  size: number
  is_inline: boolean
}

export interface EmailDetail {
  item_id: string
  conversation_id?: string
  subject: string
  body: string
  body_type: 'Text' | 'HTML'
  from: EmailAddress
  to_recipients: EmailAddress[]
  cc_recipients?: EmailAddress[]
  bcc_recipients?: EmailAddress[]
  received_date: string
  sent_date: string
  has_attachments: boolean
  is_read: boolean
  importance?: string
  categories?: string[]
  internet_message_id?: string
  attachments?: AttachmentInfo[]
}

export interface ListEmailsResponse {
  emails: EmailListItem[]
  total: number
  limit: number
  offset: number
}

export interface GetEmailDetailResponse {
  email: EmailDetail
  thread?: EmailListItem[]
}

export interface EwsHealthResponse {
  status: string
  message: string
}

export interface EwsErrorResponse {
  error: string
  message: string
}
