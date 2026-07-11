export interface EmailItem {
  sender: string
  subject: string
  summary: string
  content?: string
  isHtml?: boolean
  time: string
}

export interface CalendarEventItem {
  title: string
  time: string
  platform: string
  dateKey?: string
  originalIndex?: number
}
