import { create } from 'zustand'
import { EmailItem, CalendarEventItem } from '@myelin/core'

export type EditingEvent = {
  dateKey: string
  index: number
  title: string
  time: string
}

interface InsightsState {
  activeTab: 'mail' | 'calendar'
  setActiveTab: (tab: 'mail' | 'calendar') => void

  googleConnected: boolean
  setGoogleConnected: (connected: boolean) => void

  editingEvent: EditingEvent | null
  setEditingEvent: (event: EditingEvent | null) => void

  addingEventDate: string | null
  setAddingEventDate: (date: string | null) => void

  newEventTitle: string
  setNewEventTitle: (title: string) => void

  newEventTime: string
  setNewEventTime: (time: string) => void
}

export const useInsightsStore = create<InsightsState>((set) => ({
  activeTab: typeof window !== 'undefined' ? (sessionStorage.getItem('myelin_insights_tab') as 'mail' | 'calendar' || 'mail') : 'mail',
  setActiveTab: (tab) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('myelin_insights_tab', tab)
    }
    set({ activeTab: tab })
  },

  googleConnected: false,
  setGoogleConnected: (connected) => set({ googleConnected: connected }),

  editingEvent: null,
  setEditingEvent: (event) => set({ editingEvent: event }),

  addingEventDate: null,
  setAddingEventDate: (date) => set({ addingEventDate: date }),

  newEventTitle: '',
  setNewEventTitle: (title) => set({ newEventTitle: title }),

  newEventTime: '12:00',
  setNewEventTime: (time) => set({ newEventTime: time }),
}))
