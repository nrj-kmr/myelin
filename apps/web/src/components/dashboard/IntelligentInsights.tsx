'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Mail,
  Calendar,
  Check,
  Loader2,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@myelin/core'

interface EmailItem {
  sender: string
  subject: string
  summary: string
  time: string
}

interface CalendarEventItem {
  title: string
  time: string
  platform: string
  dateKey?: string
}

interface IntelligentInsightsProps {
  userName: string
  borderless?: boolean
  onGoogleEventsFetched?: (events: any[]) => void
}

export function IntelligentInsights ({
  userName,
  borderless = false,
  onGoogleEventsFetched
}: IntelligentInsightsProps) {
  const [googleConnected, setGoogleConnected] = useState(false)

  // Live Google API states
  const [emails, setEmails] = useState<EmailItem[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [loadingCalendar, setLoadingCalendar] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [calendarError, setCalendarError] = useState('')

  const CACHE_KEY = 'myelin_google_data_cache'
  const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

  useEffect(() => {
    // Optimistically load from cache immediately on mount to prevent UI flashing
    const cachedStr = sessionStorage.getItem(CACHE_KEY)
    if (cachedStr) {
      try {
        const cached = JSON.parse(cachedStr)
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          setEmails(cached.emails || [])
          setCalendarEvents((cached.calendarEvents || []).slice(0, 5))
          if (onGoogleEventsFetched)
            onGoogleEventsFetched(cached.calendarEvents || [])
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
        const providerToken = session?.provider_token
        const isGoogle =
          session?.user?.app_metadata?.provider === 'google' ||
          session?.user?.app_metadata?.providers?.includes('google')

        if (isGoogle && providerToken) {
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
              if (onGoogleEventsFetched)
                onGoogleEventsFetched(cached.calendarEvents || [])
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
      const providerToken = session?.provider_token

      if (!providerToken) {
        setEmailError('OAuth session expired. Re-authenticate to access Gmail.')
        setCalendarError(
          'OAuth session expired. Re-authenticate to access Calendar.'
        )
        return
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
          const res = await fetch(
            'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=5',
            {
              headers: { Authorization: `Bearer ${providerToken}` }
            }
          )
          if (res.ok) {
            const data = await res.json()
            if (data.messages && data.messages.length > 0) {
              const detailPromises = data.messages.map(async (m: any) => {
                const detailRes = await fetch(
                  `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`,
                  {
                    headers: { Authorization: `Bearer ${providerToken}` }
                  }
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

                return {
                  sender: senderName,
                  subject: subjectHeader,
                  summary: detail.snippet || '',
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
            } else {
              fetchedEmails = []
              setEmails([])
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

          const calRes = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=30&timeMin=${timeMinISO}&timeMax=${timeMaxISO}&singleEvents=true&orderBy=startTime`,
            {
              headers: { Authorization: `Bearer ${providerToken}` }
            }
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
              setCalendarEvents(fetchedEvents.slice(0, 5))
              if (onGoogleEventsFetched) onGoogleEventsFetched(fetchedEvents)
            } else {
              fetchedEvents = []
              setCalendarEvents([])
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

  // Main inner content renderer
  const renderContent = () => (
    <>
      {/* Title Header */}
      <div className='z-10 flex justify-between items-center pb-2 border-border border-b'>
        <div className='flex items-center gap-2'>
          <Sparkles className='w-5 h-5 text-primary animate-pulse' />
          <h4 className='font-mono font-bold text-foreground text-sm uppercase tracking-tight'>
            Intelligent AI Insights
          </h4>
        </div>
      </div>

      {/* Grid of integrations */}
      <div className='z-10 gap-6 grid grid-cols-1 md:grid-cols-2'>
        {/* Email integration (Inbox Insights) */}
        <div className='flex flex-col gap-3'>
          <div className='flex justify-between items-center'>
            <span className='flex items-center gap-1.5 font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
              <Mail className='w-3.5 h-3.5 text-secondary' /> Mail Summaries
            </span>
            {googleConnected && (
              <button
                type='button'
                onClick={() => fetchGoogleData(true, 'email')}
                disabled={loadingEmails}
                className='flex justify-center items-center hover:bg-muted p-1 rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer'
                title='Refresh Gmail Inbox'
              >
                <RefreshCw
                  className={`w-3 h-3 ${
                    loadingEmails ? 'animate-spin text-secondary' : ''
                  }`}
                />
              </button>
            )}
          </div>

          {!googleConnected ? (
            <div className='flex flex-col justify-center items-center gap-2 bg-muted/20 p-4 border border-border border-dashed rounded-xl min-h-28 text-center'>
              <Lock className='w-5 h-5 text-muted-foreground/60' />
              <span className='text-[10px] text-muted-foreground leading-relaxed'>
                Login with Google to see insights
              </span>
            </div>
          ) : loadingEmails ? (
            <div className='flex flex-col justify-center items-center gap-2 bg-muted/10 py-6 rounded-xl min-h-28 text-muted-foreground text-xs text-center'>
              <Loader2 className='w-5 h-5 text-secondary animate-spin' />
              <span className='font-mono text-[9px]'>
                Connecting to Google Gmail...
              </span>
            </div>
          ) : emailError ? (
            <div className='flex flex-col items-center gap-1 bg-red-500/5 p-4 border border-red-500/20 rounded-xl font-mono text-[10px] text-red-500 text-center'>
              <AlertCircle className='mb-1 w-4 h-4 text-red-500' />
              <span>{emailError}</span>
            </div>
          ) : emails.length === 0 ? (
            <div className='flex justify-center items-center bg-muted/10 p-4 border border-border/40 rounded-xl min-h-28 text-[10px] text-muted-foreground text-center italic'>
              No email data available.
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              <div className='bg-muted/30 p-4 border border-border/40 rounded-xl'>
                <p className='mb-1 font-medium text-foreground text-sm'>
                  You have {emails.length} unread emails.
                </p>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  Recent senders include:{' '}
                  <span className='font-medium text-foreground'>
                    {Array.from(new Set(emails.map(e => e.sender)))
                      .slice(0, 3)
                      .join(', ')}
                  </span>
                  .
                </p>
                {emails[0]?.summary && (
                  <p className='mt-2 text-muted-foreground text-xs italic line-clamp-2'>
                    "{emails[0].summary}"
                  </p>
                )}
              </div>
              <details className='group mt-1'>
                <summary className='flex items-center gap-1 font-medium text-muted-foreground hover:text-primary text-xs cursor-pointer list-none'>
                  <span className='group-open:hidden'>View Recent Emails</span>
                  <span className='hidden group-open:inline'>
                    Hide Recent Emails
                  </span>
                </summary>
                <div className='flex flex-col gap-2 mt-3 pr-1 max-h-48 overflow-y-auto'>
                  {emails.map((mail, idx) => (
                    <div
                      key={idx}
                      className='group/item flex flex-col gap-1 bg-muted/40 hover:bg-muted/75 p-3 border border-border/40 rounded-xl transition-all cursor-pointer'
                    >
                      <div className='flex justify-between items-center font-mono font-semibold text-[10px] text-secondary'>
                        <span>{mail.sender}</span>
                        <span className='text-[9px] text-muted-foreground/60'>
                          {mail.time}
                        </span>
                      </div>
                      <p className='font-bold text-foreground group-hover/item:text-primary text-xs line-clamp-1 transition-colors'>
                        {mail.subject}
                      </p>
                      <p className='mt-0.5 font-light text-[11px] text-muted-foreground leading-relaxed'>
                        {mail.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Calendar integration (Events Overlay) */}
        <div className='flex flex-col gap-3'>
          <div className='flex justify-between items-center'>
            <span className='flex items-center gap-1.5 font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
              <Calendar className='w-3.5 h-3.5 text-primary' /> Schedules
            </span>
            {googleConnected && (
              <button
                type='button'
                onClick={() => fetchGoogleData(true, 'calendar')}
                disabled={loadingCalendar}
                className='flex justify-center items-center hover:bg-muted p-1 rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer'
                title='Refresh Calendar'
              >
                <RefreshCw
                  className={`w-3 h-3 ${
                    loadingCalendar ? 'animate-spin text-primary' : ''
                  }`}
                />
              </button>
            )}
          </div>

          {!googleConnected ? (
            <div className='flex flex-col justify-center items-center gap-2 bg-muted/20 p-4 border border-border border-dashed rounded-xl min-h-28 text-center'>
              <Lock className='w-5 h-5 text-muted-foreground/60' />
              <span className='text-[10px] text-muted-foreground leading-relaxed'>
                Login with Google to see insights
              </span>
            </div>
          ) : loadingCalendar ? (
            <div className='flex flex-col justify-center items-center gap-2 bg-muted/10 py-6 rounded-xl min-h-28 text-muted-foreground text-xs text-center'>
              <Loader2 className='w-5 h-5 text-secondary animate-spin' />
              <span className='font-mono text-[9px]'>
                Connecting to Google Calendar...
              </span>
            </div>
          ) : calendarError ? (
            <div className='flex flex-col items-center gap-1 bg-red-500/5 p-4 border border-red-500/20 rounded-xl font-mono text-[10px] text-red-500 text-center'>
              <AlertCircle className='mb-1 w-4 h-4 text-red-500' />
              <span>{calendarError}</span>
            </div>
          ) : calendarEvents.length === 0 ? (
            <div className='flex justify-center items-center bg-muted/10 p-4 border border-border/40 rounded-xl min-h-28 text-[10px] text-muted-foreground text-center italic'>
              No calendar data available.
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              <div className='bg-muted/30 p-4 border border-border/40 rounded-xl'>
                <p className='mb-1 font-medium text-foreground text-sm'>
                  You have {calendarEvents.length} upcoming events scheduled.
                </p>
                {calendarEvents[0] && (
                  <p className='text-muted-foreground text-xs leading-relaxed'>
                    Your next event is{' '}
                    <span className='font-medium text-foreground'>
                      "{calendarEvents[0].title}"
                    </span>{' '}
                    at {calendarEvents[0].time}.
                  </p>
                )}
              </div>
              <details className='group mt-1'>
                <summary className='flex items-center gap-1 font-medium text-muted-foreground hover:text-primary text-xs cursor-pointer list-none'>
                  <span className='group-open:hidden'>
                    View Upcoming Schedule
                  </span>
                  <span className='hidden group-open:inline'>
                    Hide Upcoming Schedule
                  </span>
                </summary>
                <div className='flex flex-col gap-2 mt-3 pr-1 max-h-48 overflow-y-auto'>
                  {calendarEvents.map((evt, idx) => (
                    <div
                      key={idx}
                      className='group/item flex items-center gap-3 bg-muted/40 hover:bg-muted/75 p-3 border border-border/40 rounded-xl transition-all cursor-pointer'
                    >
                      <div className='flex flex-col justify-center items-center bg-secondary/10 border border-secondary/20 rounded-lg w-9 h-9 shrink-0'>
                        <Calendar className='w-4 h-4 text-secondary' />
                      </div>
                      <div>
                        <p className='font-bold text-foreground group-hover/item:text-primary text-xs line-clamp-1 transition-colors'>
                          {evt.title}
                        </p>
                        <p className='mt-0.5 font-mono text-[10px] text-muted-foreground'>
                          {evt.time} • {evt.platform}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
        </div>
      </div>
    </>
  )

  if (borderless) {
    return (
      <div className='relative flex flex-col gap-6 w-full transition-all duration-300'>
        {renderContent()}
      </div>
    )
  }

  return (
    <div className='group relative bg-card/10 shadow-xl p-[1.5px] border rounded-md w-full overflow-hidden transition-all duration-300'>
      {/* Slow Revolving Blue Light Border Beam */}
      <div
        className='z-0 absolute inset-[-400%] animate-[spin_10s_linear_infinite] pointer-events-none'
        style={{
          background:
            'conic-gradient(from 0deg, transparent 65%, #00c3eb 88%, transparent 100%)'
        }}
      />

      {/* Inner Card Panel Cover */}
      <div className='z-10 relative flex flex-col gap-6 bg-card/95 backdrop-blur-md px-6 py-4 rounded-md w-full h-full'>
        {/* Background neon blur lights inside card */}
        <div className='-top-24 -left-24 z-0 absolute bg-secondary/5 blur-[60px] rounded-md w-40 h-40 pointer-events-none' />
        <div className='-right-24 -bottom-24 z-0 absolute bg-primary/5 blur-[60px] rounded-md w-40 h-40 pointer-events-none' />

        {renderContent()}
      </div>
    </div>
  )
}
