import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured, EmailItem, CalendarEventItem } from '@myelin/core'

const CACHE_KEY = 'myelin_google_data_cache'
const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

export interface UseGoogleInsightsProps {
  isDedicatedPage?: boolean
  selectedDate?: Date
  viewingMonth?: Date
  logs?: Record<string, any>
  onGoogleEventsFetched?: (events: any[]) => void
  onEmailsFetched?: (emails: EmailItem[]) => void
}

export function useGoogleInsights({
  isDedicatedPage = false,
  selectedDate,
  viewingMonth,
  logs,
  onGoogleEventsFetched,
  onEmailsFetched
}: UseGoogleInsightsProps) {
  const router = useRouter()
  const [googleConnected, setGoogleConnected] = useState(false)

  // Live Google API states
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [allCalendarEvents, setAllCalendarEvents] = useState<CalendarEventItem[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [calendarError, setCalendarError] = useState('')

  const handleReauthenticate = async () => {
    localStorage.removeItem('google_refresh_token')
    sessionStorage.removeItem('google_access_token')
    await supabase?.auth?.signOut()
    router.push('/signin')
  }

  const fetchGoogleData = async (
    forceRefresh = false,
    target: 'all' | 'email' | 'calendar' = 'all'
  ) => {
    try {
      // 1. Check Cache First
      if (!forceRefresh && target === 'all') {
        const cachedStr = sessionStorage.getItem(CACHE_KEY)
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr)
            if (Date.now() - cached.timestamp < CACHE_TTL) {
              setEmails(cached.emails || [])
              setCalendarEvents((cached.calendarEvents || []).slice(0, 5))
              if (onGoogleEventsFetched) {
                onGoogleEventsFetched(cached.calendarEvents || [])
              }
              if (onEmailsFetched) {
                onEmailsFetched(cached.emails || [])
              }
              return
            }
          } catch (err) {
            console.warn('Invalid cache data, ignoring.')
          }
        }
      }

      const {
        data: { session }
      } = (await supabase?.auth?.getSession()) || { data: { session: null } }
      let providerToken =
        session?.provider_token || sessionStorage.getItem('google_access_token')

      // Save refresh token to localStorage so it survives page reloads
      if (session?.provider_refresh_token) {
        localStorage.setItem(
          'google_refresh_token',
          session.provider_refresh_token
        )
      }
      const providerRefreshToken =
        session?.provider_refresh_token ||
        localStorage.getItem('google_refresh_token')

      if (!providerToken && !providerRefreshToken) {
        setEmailError('OAuth session expired. Re-authenticate to access Gmail.')
        setCalendarError(
          'OAuth session expired. Re-authenticate to access Calendar.'
        )
        return
      }

      const fetchWithRefresh = async (
        url: string,
        options: RequestInit = {}
      ): Promise<Response> => {
        let currentToken = providerToken

        let res = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${currentToken}`
          }
        })

        if (res.status === 401) {
          try {
            const refreshRes = await fetch('/api/google/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: providerRefreshToken })
            })
            if (refreshRes.ok) {
              const data = await refreshRes.json()
              if (data.access_token) {
                currentToken = data.access_token
                providerToken = currentToken // Update outer token so parallel fetches don't all fail
                sessionStorage.setItem(
                  'google_access_token',
                  currentToken as string
                )
                res = await fetch(url, {
                  ...options,
                  headers: {
                    ...options.headers,
                    Authorization: `Bearer ${currentToken}`
                  }
                })
              }
            } else {
              localStorage.removeItem('google_refresh_token')
              setEmailError(
                'OAuth session expired. Please sign out and sign back in to re-authenticate.'
              )
              setCalendarError(
                'OAuth session expired. Please sign out and sign back in to re-authenticate.'
              )
            }
          } catch (e) {
            console.error('Failed to auto-refresh token', e)
          }
        }
        return res
      }

      // Read existing cache to preserve data we aren't refreshing
      let fetchedEmails: any[] = []
      let fetchedEvents: any[] = []

      const cachedStr = sessionStorage.getItem(CACHE_KEY)
      if (cachedStr) {
        try {
          const cached = JSON.parse(cachedStr)
          fetchedEmails = cached.emails || []
          fetchedEvents = cached.calendarEvents || []
        } catch (e) {}
      }

      // 2. Fetch Gmail unread messages
      if (target === 'all' || target === 'email') {
        setLoadingEmails(true)
        setEmailError('')
        try {
          const res = await fetchWithRefresh(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread'
          )
          if (res.ok) {
            const data = await res.json()
            if (data.messages && data.messages.length > 0) {
              const detailPromises = data.messages.map(async (m: any) => {
                const detailRes = await fetchWithRefresh(
                  `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`
                )
                const detail = await detailRes.json()
                const fromHeader =
                  detail.payload?.headers?.find((h: any) => h.name === 'From')
                    ?.value || 'Unknown Sender'
                const subjectHeader =
                  detail.payload?.headers?.find(
                    (h: any) => h.name === 'Subject'
                  )?.value || 'No Subject'

                const senderName = fromHeader.replace(/<.*>/, '').trim()

                const decodeBase64UTF8 = (data: string) => {
                  try {
                    return decodeURIComponent(
                      escape(atob(data.replace(/-/g, '+').replace(/_/g, '/')))
                    )
                  } catch (e) {
                    return atob(data.replace(/-/g, '+').replace(/_/g, '/'))
                  }
                }

                const getBodyData = (
                  payload: any
                ): { content: string; isHtml: boolean } => {
                  let htmlData = ''
                  let plainData = ''

                  const searchParts = (parts: any[]) => {
                    for (const part of parts) {
                      if (part.mimeType === 'text/html' && part.body?.data) {
                        htmlData = part.body.data
                      } else if (
                        part.mimeType === 'text/plain' &&
                        part.body?.data
                      ) {
                        plainData = part.body.data
                      } else if (part.parts && part.parts.length > 0) {
                        searchParts(part.parts)
                      }
                    }
                  }

                  if (payload.parts && payload.parts.length > 0) {
                    searchParts(payload.parts)
                  } else if (payload.body?.data) {
                    if (payload.mimeType === 'text/html')
                      htmlData = payload.body.data
                    else plainData = payload.body.data
                  }

                  if (htmlData)
                    return { content: decodeBase64UTF8(htmlData), isHtml: true }
                  if (plainData)
                    return {
                      content: decodeBase64UTF8(plainData),
                      isHtml: false
                    }
                  return { content: '', isHtml: false }
                }

                const bodyData = getBodyData(detail.payload)

                return {
                  sender: senderName,
                  subject: subjectHeader,
                  summary: detail.snippet || '',
                  content: bodyData.content,
                  isHtml: bodyData.isHtml,
                  time: new Date(
                    Number(detail.internalDate)
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }
              })
              fetchedEmails = await Promise.all(detailPromises)
              setEmails(fetchedEmails)
              if (onEmailsFetched) onEmailsFetched(fetchedEmails)
            } else {
              fetchedEmails = []
              setEmails([])
              if (onEmailsFetched) onEmailsFetched([])
            }
          } else {
            setEmailError('Failed to fetch inbox from Google API.')
          }
        } catch (err) {
          setEmailError('Error querying Google Gmail endpoint.')
        } finally {
          setLoadingEmails(false)
        }
      }

      // 3. Fetch Google Calendar events
      if (target === 'all' || target === 'calendar') {
        setLoadingCalendar(true)
        setCalendarError('')
        try {
          const now = new Date()
          const timeMinISO = now.toISOString()

          const future = new Date()
          future.setDate(now.getDate() + 40)
          const timeMaxISO = future.toISOString()

          const calRes = await fetchWithRefresh(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=30&timeMin=${timeMinISO}&timeMax=${timeMaxISO}&singleEvents=true&orderBy=startTime`
          )
          if (calRes.ok) {
            const calData = await calRes.json()
            if (calData.items && calData.items.length > 0) {
              fetchedEvents = calData.items.map((item: any) => {
                const start = item.start?.dateTime || item.start?.date || ''
                const dateObj = start ? new Date(start) : new Date()
                const startTimeStr = start
                  ? dateObj.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'All Day'

                const y = dateObj.getFullYear()
                const m = String(dateObj.getMonth() + 1).padStart(2, '0')
                const d = String(dateObj.getDate()).padStart(2, '0')
                const dateKey = `${y}-${m}-${d}`

                return {
                  title: item.summary || 'Untitled Event',
                  time: startTimeStr,
                  platform: item.hangoutLink
                    ? 'Google Meet'
                    : 'Google Calendar',
                  dateKey: dateKey
                }
              })
              setAllCalendarEvents(fetchedEvents)
              if (onGoogleEventsFetched) onGoogleEventsFetched(fetchedEvents)
            } else {
              fetchedEvents = []
              setAllCalendarEvents([])
              if (onGoogleEventsFetched) onGoogleEventsFetched([])
            }
          } else {
            setCalendarError('Failed to fetch events from Google Calendar API.')
          }
        } catch (err) {
          setCalendarError('Error querying Google Calendar endpoint.')
        } finally {
          setLoadingCalendar(false)
        }
      }

      // 4. Save to Cache
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          emails: fetchedEmails,
          calendarEvents: fetchedEvents
        })
      )
    } catch (e) {
      console.warn(
        'Failed to retrieve Supabase session for Google API calls:',
        e
      )
    }
  }

  useEffect(() => {
    // Optimistically load from cache immediately on mount to prevent UI flashing
    const cachedStr = sessionStorage.getItem(CACHE_KEY)
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr)
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          setEmails(cached.emails || [])
          setAllCalendarEvents(cached.calendarEvents || [])
          if (onGoogleEventsFetched) {
            onGoogleEventsFetched(cached.calendarEvents || [])
          }
          if (onEmailsFetched) {
            onEmailsFetched(cached.emails || [])
          }
          setGoogleConnected(true) // Optimistically show connected state
        }
      } catch (e) {}
    }

    const initializeGoogleConnection = async () => {
      if (!isSupabaseConfigured || !supabase) return

      try {
        const {
          data: { session }
        } = await supabase.auth.getSession()
        const isGoogle =
          session?.user?.app_metadata?.provider === 'google' ||
          session?.user?.app_metadata?.providers?.includes('google')

        if (isGoogle) {
          setGoogleConnected(true)
          fetchGoogleData(false)
        } else {
          setGoogleConnected(false)
        }
      } catch (e) {
        console.warn(
          'Failed to retrieve Supabase session for Google API calls:',
          e
        )
      }
    }

    initializeGoogleConnection()
  }, [])

  // Filter calendar events when selectedDate or allCalendarEvents changes
  useEffect(() => {
    let combinedEvents = [...allCalendarEvents]

    // Add custom events from logs
    if (logs) {
      Object.keys(logs).forEach(dateKey => {
        const dayLog = logs[dateKey]
        if (dayLog?.events) {
          dayLog.events.forEach((evt: any, index: number) => {
            combinedEvents.push({
              title: evt.title,
              time: evt.time,
              platform: 'Custom Event',
              dateKey: dateKey,
              originalIndex: index
            })
          })
        }
      })
    }

    // sort combined events by dateKey then time as a string fallback
    combinedEvents.sort((a, b) => {
      if (a.dateKey !== b.dateKey)
        return (a.dateKey || '') > (b.dateKey || '') ? 1 : -1
      return (a.time || '') > (b.time || '') ? 1 : -1
    })

    if (isDedicatedPage && viewingMonth) {
      // Show all events for the viewing month
      const y = viewingMonth.getFullYear()
      const m = String(viewingMonth.getMonth() + 1).padStart(2, '0')
      const monthPrefix = `${y}-${m}`
      const filtered = combinedEvents.filter(e =>
        (e.dateKey || '').startsWith(monthPrefix)
      )
      setCalendarEvents(filtered)
    } else {
      // Filter out past events for the upcoming view
      const today = new Date()
      const y = today.getFullYear()
      const m = String(today.getMonth() + 1).padStart(2, '0')
      const d = String(today.getDate()).padStart(2, '0')
      const todayKey = `${y}-${m}-${d}`
      const upcoming = combinedEvents.filter(e => (e.dateKey || '') >= todayKey)
      setCalendarEvents(upcoming)
    }
  }, [selectedDate, viewingMonth, allCalendarEvents, logs, isDedicatedPage])

  return {
    googleConnected,
    emails,
    calendarEvents,
    loadingEmails,
    loadingCalendar,
    emailError,
    calendarError,
    fetchGoogleData,
    handleReauthenticate
  }
}
