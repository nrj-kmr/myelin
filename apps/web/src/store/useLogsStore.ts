import { create } from 'zustand'
import { DayLog, LS_KEYS } from '@myelin/core'

// Generate relative date string offsets for mock data
const getDateOffsetKey = (offsetDays: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

interface LogsState {
  logs: Record<string, DayLog>
  isLogsLoaded: boolean

  // Actions
  fetchLogs: (userEmail: string) => Promise<void>
  handleSaveJournal: (userEmail: string, dateKey: string, journalText: string, moodVal: string) => void
  handleAddEvent: (userEmail: string, dateKey: string, title: string, time: string) => void
  handleEditEvent: (userEmail: string, dateKey: string, index: number, title: string, time: string) => void
  handleDeleteEvent: (userEmail: string, dateKey: string, index: number) => void
  handleAddExpense: (userEmail: string, dateKey: string, title: string, amount: number) => void
  handleDeleteExpense: (userEmail: string, dateKey: string, index: number) => void
}

const writeLogToDb = async (userEmail: string, dateKey: string, action: string, payload: any) => {
  if (!userEmail) return
  try {
    await fetch('/api/user/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail,
        dateKey,
        action,
        payload,
      }),
    })
  } catch (err) {
    console.warn('Database log write skipped (PostgreSQL offline). Cache updated.', err)
  }
}

export const useLogsStore = create<LogsState>((set, get) => ({
  logs: {},
  isLogsLoaded: false,

  fetchLogs: async (userEmail: string) => {
    if (get().isLogsLoaded) return

    if (userEmail) {
      try {
        const res = await fetch(`/api/user/logs?email=${encodeURIComponent(userEmail)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.logs) {
            set({ logs: data.logs, isLogsLoaded: true })
            localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(data.logs))
            return
          }
        }
      } catch (err) {
        console.warn('PostgreSQL unavailable, failing back to local storage logs cache.', err)
      }
    }

    // Local storage fallback
    const savedLogs = localStorage.getItem(LS_KEYS.DASHBOARD_LOGS)
    if (savedLogs) {
      try {
        set({ logs: JSON.parse(savedLogs), isLogsLoaded: true })
      } catch (err) {
        console.error('Error parsing saved local logs:', err)
      }
    } else {
      // Initial setup mock data
      const initialMockLogs: Record<string, DayLog> = {
        [getDateOffsetKey(-3)]: {
          journal: 'Spent the morning mapping the Turborepo workspace. Shared core TypeScript models and linked app dependencies successfully.',
          mood: 'productive',
          expenses: [{ title: 'Domain Registration', amount: 12.00 }],
          events: []
        },
        [getDateOffsetKey(-1)]: {
          journal: 'Completed waitlist landing page styling using Tailwind CSS v4. Configured automatic sandboxed email confirmations.',
          mood: 'productive',
          expenses: [{ title: 'Coffee at Cafe', amount: 4.80 }],
          events: []
        },
        [getDateOffsetKey(0)]: {
          journal: 'Today we are building the dashboard calendar system for Myelin!',
          mood: 'relaxed',
          expenses: [],
          events: []
        }
      }
      set({ logs: initialMockLogs, isLogsLoaded: true })
      localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(initialMockLogs))
    }
  },

  handleSaveJournal: (userEmail: string, dateKey: string, journalText: string, moodVal: string) => {
    const { logs } = get()
    const updated = { ...logs }
    if (!updated[dateKey]) updated[dateKey] = {}
    updated[dateKey].journal = journalText
    updated[dateKey].mood = moodVal
    
    set({ logs: updated })
    localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(updated))
    writeLogToDb(userEmail, dateKey, 'saveJournal', { journal: journalText, mood: moodVal })
  },

  handleAddEvent: (userEmail: string, dateKey: string, title: string, time: string) => {
    const { logs } = get()
    const updated = { ...logs }
    if (!updated[dateKey]) updated[dateKey] = {}
    if (!updated[dateKey].events) updated[dateKey].events = []
    updated[dateKey].events!.push({ title, time })

    set({ logs: updated })
    localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(updated))
    writeLogToDb(userEmail, dateKey, 'addEvent', { title, time })
  },

  handleEditEvent: (userEmail: string, dateKey: string, index: number, title: string, time: string) => {
    const { logs } = get()
    const updated = { ...logs }
    if (updated[dateKey] && updated[dateKey].events && updated[dateKey].events![index]) {
      updated[dateKey].events![index] = { title, time }
      set({ logs: updated })
      localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(updated))
      writeLogToDb(userEmail, dateKey, 'editEvent', { index, title, time })
    }
  },

  handleDeleteEvent: (userEmail: string, dateKey: string, index: number) => {
    const { logs } = get()
    const updated = { ...logs }
    const event = updated[dateKey]?.events?.[index]
    if (event) {
      updated[dateKey].events!.splice(index, 1)
      set({ logs: updated })
      localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(updated))
      writeLogToDb(userEmail, dateKey, 'deleteEvent', { title: event.title, time: event.time })
    }
  },

  handleAddExpense: (userEmail: string, dateKey: string, title: string, amount: number) => {
    const { logs } = get()
    const updated = { ...logs }
    if (!updated[dateKey]) updated[dateKey] = {}
    if (!updated[dateKey].expenses) updated[dateKey].expenses = []
    updated[dateKey].expenses!.push({ title, amount })

    set({ logs: updated })
    localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(updated))
    writeLogToDb(userEmail, dateKey, 'addExpense', { title, amount })
  },

  handleDeleteExpense: (userEmail: string, dateKey: string, index: number) => {
    const { logs } = get()
    const updated = { ...logs }
    const expense = updated[dateKey]?.expenses?.[index]
    if (expense) {
      updated[dateKey].expenses!.splice(index, 1)
      set({ logs: updated })
      localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(updated))
      writeLogToDb(userEmail, dateKey, 'deleteExpense', { title: expense.title, amount: expense.amount })
    }
  }
}))
