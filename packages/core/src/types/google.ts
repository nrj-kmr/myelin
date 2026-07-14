export interface EmailItem {
  id: string
  sender: string
  subject: string
  summary: string
  content?: string
  isHtml?: boolean
  time: string
  markedReadLocally?: boolean
  markedDeletedLocally?: boolean
  inlineAttachments?: { cid: string; attachmentId: string | null; data?: string | null; mimeType: string }[]
}

export interface CalendarEventItem {
  title: string
  time: string
  platform: string
  dateKey?: string
  originalIndex?: number
}
