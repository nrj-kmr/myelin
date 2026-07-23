export interface EmailItem {
  id: string
  sender: string
  subject: string
  summary: string
  content?: string
  isHtml?: boolean
  time: string
  isUnread?: boolean
  markedReadLocally?: boolean
  markedDeletedLocally?: boolean
  inlineAttachments?: { cid: string; attachmentId: string | null; data?: string | null; mimeType: string }[]
  attachments?: { attachmentId: string; filename: string; mimeType: string; size: number }[]
}

export interface CalendarEventItem {
  title: string
  time: string
  platform: string
  dateKey?: string
  originalIndex?: number
}
