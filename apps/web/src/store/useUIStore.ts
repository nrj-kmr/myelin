import { create } from 'zustand'
import { EmailItem } from '@myelin/core'

export type EditingEvent = {
  dateKey: string
  index: number
  title: string
  time: string
}

interface UIState {
  activePageTab: 'mail' | 'calendar'
  setActivePageTab: (tab: 'mail' | 'calendar') => void

  selectedDate: Date
  setSelectedDate: (date: Date) => void

  viewingMonth: Date
  setViewingMonth: (date: Date) => void

  selectedEmail: EmailItem | null
  setSelectedEmail: (email: EmailItem | null) => void

  showMobileCalendarDetail: boolean
  setShowMobileCalendarDetail: (show: boolean) => void

  editingEvent: EditingEvent | null
  setEditingEvent: (event: EditingEvent | null) => void

  addingEventDate: string | null
  setAddingEventDate: (date: string | null) => void

  newEventTitle: string
  setNewEventTitle: (title: string) => void

  newEventTime: string
  setNewEventTime: (time: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  activePageTab: typeof window !== 'undefined' ? (sessionStorage.getItem('myelin_insights_tab') as 'mail' | 'calendar' || 'mail') : 'mail',
  setActivePageTab: (tab) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('myelin_insights_tab', tab)
    }
    set({ activePageTab: tab })
  },

  selectedDate: new Date(),
  setSelectedDate: (date) => set({ selectedDate: date }),

  viewingMonth: new Date(),
  setViewingMonth: (date) => set({ viewingMonth: date }),

  selectedEmail: null,
  setSelectedEmail: (email) => set({ selectedEmail: email }),

  showMobileCalendarDetail: false,
  setShowMobileCalendarDetail: (show) => set({ showMobileCalendarDetail: show }),

  editingEvent: null,
  setEditingEvent: (event) => set({ editingEvent: event }),

  addingEventDate: null,
  setAddingEventDate: (date) => set({ addingEventDate: date }),

  newEventTitle: '',
  setNewEventTitle: (title) => set({ newEventTitle: title }),

  newEventTime: '12:00',
  setNewEventTime: (time) => set({ newEventTime: time }),
}))
