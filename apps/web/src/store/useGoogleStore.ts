import { create } from 'zustand'
import { supabase, isSupabaseConfigured, EmailItem, CalendarEventItem } from '@myelin/core'

const CACHE_KEY = 'myelin_google_data_cache'
const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

interface GoogleState {
  googleConnected: boolean
  emails: EmailItem[]
  allCalendarEvents: CalendarEventItem[]
  loadingEmails: boolean
  loadingCalendar: boolean
  emailError: string
  calendarError: string

  // Actions
  initializeConnection: () => Promise<void>
  handleReauthenticate: () => Promise<void>
  fetchGoogleData: (forceRefresh?: boolean, target?: 'all' | 'email' | 'calendar') => Promise<void>
  markEmailAsRead: (id: string) => Promise<void>
  deleteEmail: (id: string) => Promise<void>
}

export const useGoogleStore = create<GoogleState>((set, get) => ({
  googleConnected: false,
  emails: [],
  allCalendarEvents: [],
  loadingEmails: false,
  loadingCalendar: false,
  emailError: '',
  calendarError: '',

  initializeConnection: async () => {
    if (!isSupabaseConfigured || !supabase) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const isGoogle =
        session?.user?.app_metadata?.provider === 'google' ||
        session?.user?.app_metadata?.providers?.includes('google')

      if (isGoogle) {
        set({ googleConnected: true })
        get().fetchGoogleData(false)
      } else {
        set({ googleConnected: false })
      }
    } catch (e) {
      console.warn('Failed to retrieve Supabase session for Google API calls:', e)
    }
  },

  handleReauthenticate: async () => {
    localStorage.removeItem('google_refresh_token')
    sessionStorage.removeItem('google_access_token')
    await supabase?.auth?.signOut()
    if (typeof window !== 'undefined') {
      window.location.href = '/signin'
    }
  },

  fetchGoogleData: async (forceRefresh = false, target: 'all' | 'email' | 'calendar' = 'all') => {
    try {
      // 1. Check Cache First
      if (!forceRefresh && target === 'all') {
        const cachedStr = sessionStorage.getItem(CACHE_KEY)
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr)
            if (Date.now() - cached.timestamp < CACHE_TTL) {
              set({
                emails: cached.emails || [],
                allCalendarEvents: cached.allCalendarEvents || cached.calendarEvents || []
              })
              return
            }
          } catch (err) {
            console.warn('Invalid cache data, ignoring.')
          }
        }
      }

      const { data: { session } } = (await supabase?.auth?.getSession()) || { data: { session: null } }
      let providerToken = session?.provider_token || sessionStorage.getItem('google_access_token')

      if (session?.provider_refresh_token) {
        localStorage.setItem('google_refresh_token', session.provider_refresh_token)
      }
      const providerRefreshToken = session?.provider_refresh_token || localStorage.getItem('google_refresh_token')

      if (!providerToken && !providerRefreshToken) {
        set({
          emailError: 'OAuth session expired. Re-authenticate to access Gmail.',
          calendarError: 'OAuth session expired. Re-authenticate to access Calendar.'
        })
        return
      }

      const fetchWithRefresh = async (url: string, options: RequestInit = {}): Promise<Response> => {
        let res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${providerToken}` } })
        
        if (res.status === 401 && providerRefreshToken) {
          try {
            const refreshRes = await fetch('/api/user/refresh-google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: providerRefreshToken })
            })

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json()
              providerToken = refreshData.access_token
              sessionStorage.setItem('google_access_token', refreshData.access_token)
              
              if (refreshData.refresh_token) {
                localStorage.setItem('google_refresh_token', refreshData.refresh_token)
              }

              res = await fetch(url, { ...options, headers: { ...options.headers, Authorization: `Bearer ${providerToken}` } })
            }
          } catch (e) {
            console.error('Failed to refresh token', e)
          }
        }
        return res
      }

      let fetchedEmails: any[] = []
      let fetchedEvents: any[] = []

      const cachedStr = sessionStorage.getItem(CACHE_KEY)
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr)
          fetchedEmails = cached.emails || []
          fetchedEvents = cached.allCalendarEvents || cached.calendarEvents || []
        } catch (e) {}
      }

      // Fetch Emails
      if (target === 'all' || target === 'email') {
        set({ loadingEmails: true, emailError: '' })
        try {
          const res = await fetchWithRefresh('https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread')
          if (res.ok) {
            const data = await res.json()
            if (data.messages && data.messages.length > 0) {
              const detailPromises = data.messages.map(async (m: any) => {
                const detailRes = await fetchWithRefresh(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`)
                const detail = await detailRes.json()
                const fromHeader = detail.payload?.headers?.find((h: any) => h.name === 'From')?.value || 'Unknown Sender'
                const subjectHeader = detail.payload?.headers?.find((h: any) => h.name === 'Subject')?.value || 'No Subject'
                const senderName = fromHeader.replace(/<.*>/, '').trim()

                const decodeBase64UTF8 = (data: string) => {
                  try {
                    return decodeURIComponent(escape(atob(data.replace(/-/g, '+').replace(/_/g, '/'))))
                  } catch (e) {
                    return atob(data.replace(/-/g, '+').replace(/_/g, '/'))
                  }
                }

                const getBodyData = (payload: any): { content: string; isHtml: boolean; inlineAttachments: any[] } => {
                  let htmlData = ''
                  let plainData = ''
                  const inlineAttachments: any[] = []

                  const searchParts = (parts: any[]) => {
                    for (const part of parts) {
                      if (part.mimeType === 'text/html' && part.body?.data) {
                        htmlData = part.body.data
                      } else if (part.mimeType === 'text/plain' && part.body?.data) {
                        plainData = part.body.data
                      } else if (part.headers) {
                        const cidHeader = part.headers.find((h: any) => h.name.toLowerCase() === 'content-id')
                        if (cidHeader && (part.body?.attachmentId || part.body?.data)) {
                          inlineAttachments.push({
                            cid: cidHeader.value.replace(/[<>]/g, ''),
                            attachmentId: part.body?.attachmentId || null,
                            data: part.body?.data || null,
                            mimeType: part.mimeType
                          })
                        }
                      }
                      
                      if (part.parts && part.parts.length > 0) {
                        searchParts(part.parts)
                      }
                    }
                  }

                  if (payload.parts && payload.parts.length > 0) {
                    searchParts(payload.parts)
                  } else if (payload.body?.data) {
                    if (payload.mimeType === 'text/html') htmlData = payload.body.data
                    else plainData = payload.body.data
                  }

                  if (htmlData) return { content: decodeBase64UTF8(htmlData), isHtml: true, inlineAttachments }
                  if (plainData) return { content: decodeBase64UTF8(plainData), isHtml: false, inlineAttachments }
                  return { content: '', isHtml: false, inlineAttachments }
                }

                const bodyData = getBodyData(detail.payload)

                return {
                  id: detail.id,
                  sender: senderName,
                  subject: subjectHeader,
                  summary: detail.snippet || '',
                  content: bodyData.content,
                  isHtml: bodyData.isHtml,
                  inlineAttachments: bodyData.inlineAttachments,
                  time: new Date(Number(detail.internalDate)).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                }
              })
              fetchedEmails = await Promise.all(detailPromises)
              set({ emails: fetchedEmails })
            } else {
              fetchedEmails = []
              set({ emails: [] })
            }
          } else {
            set({ emailError: 'Failed to fetch inbox from Google API.' })
          }
        } catch (err) {
          set({ emailError: 'Error querying Google Gmail endpoint.' })
        } finally {
          set({ loadingEmails: false })
        }
      }

      // Fetch Calendar Events
      if (target === 'all' || target === 'calendar') {
        set({ loadingCalendar: true, calendarError: '' })
        try {
          const now = new Date()
          const timeMinISO = now.toISOString()

          const future = new Date()
          future.setDate(now.getDate() + 40)
          const timeMaxISO = future.toISOString()

          const res = await fetchWithRefresh(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMinISO)}&timeMax=${encodeURIComponent(timeMaxISO)}&singleEvents=true&orderBy=startTime`
          )
          if (res.ok) {
            const data = await res.json()
            if (data.items) {
              fetchedEvents = data.items.map((item: any) => {
                let startStr = item.start?.dateTime || item.start?.date
                if (!startStr) startStr = new Date().toISOString()
                const d = new Date(startStr)
                const y = d.getFullYear()
                const m = String(d.getMonth() + 1).padStart(2, '0')
                const dd = String(d.getDate()).padStart(2, '0')
                
                return {
                  title: item.summary || 'Busy',
                  time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  platform: 'Google Calendar',
                  dateKey: `${y}-${m}-${dd}`
                }
              })
              set({ allCalendarEvents: fetchedEvents })
            }
          } else {
            set({ calendarError: 'Failed to fetch calendar events from Google API.' })
          }
        } catch (err) {
          set({ calendarError: 'Error querying Google Calendar endpoint.' })
        } finally {
          set({ loadingCalendar: false })
        }
      }

      if (target === 'all') {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            emails: fetchedEmails,
            allCalendarEvents: fetchedEvents,
            timestamp: Date.now()
          })
        )
      }
    } catch (e) {}
  },

  markEmailAsRead: async (id: string) => {
    const { emails } = get()
    const newState = emails.map(email => email.id === id ? { ...email, markedReadLocally: true } : email)
    set({ emails: newState })

    try {
      const { data: { session } } = await supabase?.auth?.getSession() || { data: { session: null } }
      const token = session?.provider_token || sessionStorage.getItem('google_access_token')
      if (!token) return

      await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ removeLabelIds: ['UNREAD'] })
      })
    } catch (e) {
      console.error('Failed to mark email as read on Google', e)
    }
  },

  deleteEmail: async (id: string) => {
    const { emails } = get()
    const newState = emails.map(email => email.id === id ? { ...email, markedDeletedLocally: true } : email)
    set({ emails: newState })

    try {
      const { data: { session } } = await supabase?.auth?.getSession() || { data: { session: null } }
      const token = session?.provider_token || sessionStorage.getItem('google_access_token')
      if (!token) return

      await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch (e) {
      console.error('Failed to trash email on Google', e)
    }
  }
}))
