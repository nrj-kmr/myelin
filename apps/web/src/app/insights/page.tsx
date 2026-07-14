'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Calendar as CalIcon, Brain, Sparkles, ArrowLeft, Paperclip } from 'lucide-react'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { IntelligentInsights } from '@/components/dashboard/IntelligentInsights'
import { EmailItem, supabase } from '@myelin/core'
import { CalendarGrid } from '@/components/dashboard/CalendarGrid'

import { useUserSession } from '@/hooks/useUserSession'
import { useLogs } from '@/hooks/useLogs'

const renderLineWithLinks = (line: string) => {
  const urlRegex = /(https?:\/\/[^\s)]+)/g
  const parts = line.split(urlRegex)

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target='_blank'
          rel='noopener noreferrer'
          className='font-medium text-primary hover:underline break-all'
        >
          {part}
        </a>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

const FormattedEmailContent = ({ content }: { content: string }) => {
  if (!content) return <span>No text content available for this email.</span>

  // Clean up excessive newlines and weird artifacts
  let cleaned = content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/Â /g, ' ')

  // Split by paragraphs
  const paragraphs = cleaned.split('\n\n')

  return (
    <div className='flex flex-col gap-4 font-sans text-foreground/80 text-sm leading-relaxed'>
      {paragraphs.map((p, i) => {
        // If paragraph is mostly quoted text, style it
        if (p.trim().startsWith('>')) {
          return (
            <blockquote
              key={i}
              className='pl-3 border-primary/40 border-l-2 text-muted-foreground wrap-break-word italic'
            >
              {renderLineWithLinks(p.replace(/^>\s*/gm, ''))}
            </blockquote>
          )
        }

        // Render normal paragraph, breaking on single newlines
        return (
          <p key={i} className='wrap-break-word'>
            {p.split('\n').map((line, j) => (
              <React.Fragment key={j}>
                {renderLineWithLinks(line)}
                {j < p.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}

export default function InsightsPage () {
  const router = useRouter()
  const {
    isLoaded: isSessionLoaded,
    isOnboarded,
    userName,
    userEmail,
    currency,
    theme,
    handleToggleTheme,
    handleChangeCurrency
  } = useUserSession()

  const {
    logs,
    fetchLogs,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent
  } = useLogs(userEmail)

  const [isMounted, setIsMounted] = useState(false)
  const [activePageTab, setActivePageTab] = useState<'mail' | 'calendar'>(
    () => {
      if (typeof window !== 'undefined') {
        return (
          (sessionStorage.getItem('myelin_insights_tab') as
            | 'mail'
            | 'calendar') || 'mail'
        )
      }
      return 'mail'
    }
  )

  // sync tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('myelin_insights_tab', activePageTab)
    }
  }, [activePageTab])

  // Calendar State
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('myelin_selected_date')
      if (saved) return new Date(saved)
    }
    return new Date()
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('myelin_selected_date', selectedDate.toISOString())
    }
  }, [selectedDate])
  const [viewingMonth, setViewingMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )

  // Quick Add Event State
  const [quickAddEvent, setQuickAddEvent] = useState<{
    date: Date
    x: number
    y: number
  } | null>(null)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventTime, setNewEventTime] = useState('12:00')

  // Google Data State
  const [googleEvents, setGoogleEvents] = useState<any[]>([])
  const [googleEmails, setGoogleEmails] = useState<EmailItem[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null)
  const [resolvedEmailHtml, setResolvedEmailHtml] = useState<string>('')
  const [showMobileCalendarDetail, setShowMobileCalendarDetail] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Resolve inline attachments (cid: images) when an email is selected
  useEffect(() => {
    if (!selectedEmail || !selectedEmail.isHtml || !selectedEmail.content) {
      setResolvedEmailHtml(selectedEmail?.content || '')
      return
    }

    const resolveImages = async () => {
      let html = selectedEmail.content!

      // OPTIMISTIC RENDER: Show the email instantly before resolving heavy network images
      setResolvedEmailHtml(html)

      if (
        !selectedEmail.inlineAttachments ||
        selectedEmail.inlineAttachments.length === 0
      ) {
        return
      }

      try {
        const {
          data: { session }
        } = (await supabase?.auth?.getSession()) || { data: { session: null } }
        const token =
          session?.provider_token ||
          sessionStorage.getItem('google_access_token')

        for (const att of selectedEmail.inlineAttachments) {
          if (html.includes(`cid:${att.cid}`)) {
            if (att.data) {
              // Image data was small enough to be included natively
              const base64 = att.data.replace(/-/g, '+').replace(/_/g, '/')
              html = html.split(`cid:${att.cid}`).join(`data:${att.mimeType};base64,${base64}`)
            } else if (token && att.attachmentId) {
              // Image data needs to be fetched from Google API
              const res = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${selectedEmail.id}/attachments/${att.attachmentId}`,
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              )
              if (res.ok) {
                const data = await res.json()
                if (data.data) {
                  const base64 = data.data.replace(/-/g, '+').replace(/_/g, '/')
                  html = html.split(`cid:${att.cid}`).join(`data:${att.mimeType};base64,${base64}`)
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Error resolving inline images', e)
      }
      // FINAL RENDER: Update with fully loaded images
      setResolvedEmailHtml(html)
    }

    resolveImages()
  }, [selectedEmail])

  // Initialize logs
  useEffect(() => {
    if (isOnboarded) {
      fetchLogs(userEmail)
    }
  }, [isOnboarded, userEmail, fetchLogs])

  // Protect route
  useEffect(() => {
    if (isSessionLoaded && !isOnboarded) {
      router.push('/signin')
    }
  }, [isSessionLoaded, isOnboarded, router])

  const activeEmails = googleEmails.filter(
    (e) => !e.markedReadLocally && !e.markedDeletedLocally
  )

  // Merge logs with Google Calendar events
  const augmentedLogs = useMemo(() => {
    if (!logs) return {}
    const newLogs = JSON.parse(JSON.stringify(logs))

    googleEvents.forEach(gEvent => {
      const { dateKey } = gEvent
      if (dateKey) {
        if (!newLogs[dateKey]) {
          newLogs[dateKey] = { events: [], expenses: [], journal: '' }
        }
        if (!newLogs[dateKey].events) {
          newLogs[dateKey].events = []
        }
        if (
          !newLogs[dateKey].events.some(
            (e: any) => e.title === gEvent.title && e.time === gEvent.time
          )
        ) {
          newLogs[dateKey].events.push(gEvent)
        }
      }
    })
    return newLogs
  }, [logs, googleEvents])

  if (!isMounted || !isSessionLoaded) {
    return (
      <div className='flex justify-center items-center bg-background min-h-screen text-foreground'>
        <div className='border-primary border-t-2 border-b-2 rounded-full w-8 h-8 animate-spin'></div>
      </div>
    )
  }

  return (
    <div className='flex flex-col bg-background selection:bg-primary/20 h-screen overflow-hidden font-sans text-foreground transition-colors duration-300'>
      <DashboardHeader
        userName={userName}
        userEmail={userEmail}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currency={currency}
        onChangeCurrency={handleChangeCurrency}
      />

      <main className='flex flex-col flex-1 gap-2.5 mx-auto px-6 py-2.5 w-full max-w-[1600px] overflow-hidden'>
        {/* Page Header */}
        <div className='flex flex-col justify-center items-center gap-4 text-center shrink-0'>
          {/* Top Level Tab Selector */}
          <div className='flex gap-1 bg-muted p-1 border border-border rounded-lg w-fit font-semibold text-xs'>
            <button
              onClick={() => setActivePageTab('mail')}
              className={`px-5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-2 font-mono uppercase tracking-wider text-[11px] ${
                activePageTab === 'mail'
                  ? 'bg-card shadow-sm text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <Mail className='w-4 h-4' /> Mailbox
            </button>
            <button
              onClick={() => setActivePageTab('calendar')}
              className={`px-5 py-2 rounded-md transition-all cursor-pointer flex items-center gap-2 font-mono uppercase tracking-wider text-[11px] ${
                activePageTab === 'calendar'
                  ? 'bg-card shadow-sm text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              <CalIcon className='w-4 h-4' /> Calendar
            </button>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className='flex-1 gap-6 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 min-h-0 overflow-hidden'>
          {/* Left Sidebar: Data Feed (Intelligent Insights Component) */}
          <div className={`flex flex-col gap-6 lg:col-span-1 min-w-0 h-full overflow-hidden transition-all duration-300 ${activePageTab === 'mail' && selectedEmail ? 'hidden lg:flex' : ''} ${activePageTab === 'calendar' && !showMobileCalendarDetail ? 'hidden lg:flex' : ''}`}>
            {activePageTab === 'calendar' && showMobileCalendarDetail && (
              <button
                onClick={() => setShowMobileCalendarDetail(false)}
                className='lg:hidden flex items-center gap-2 hover:bg-muted/50 -mb-2 p-2 rounded-md w-fit text-muted-foreground hover:text-foreground transition-colors'
              >
                <ArrowLeft className='w-4 h-4' /> Back to Calendar
              </button>
            )}
            <IntelligentInsights
              userName={userName}
              borderless={false}
              isDedicatedPage={true}
              forceTab={activePageTab}
              onGoogleEventsFetched={setGoogleEvents}
              onEmailsFetched={setGoogleEmails}
              onEmailSelect={setSelectedEmail}
              selectedDate={
                activePageTab === 'calendar' ? selectedDate : undefined
              }
              viewingMonth={viewingMonth}
              logs={logs}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>

          {/* Main Content Area */}
          <div className={`flex flex-col lg:col-span-2 xl:col-span-3 pr-2 min-w-0 h-full overflow-hidden transition-all duration-300 ${activePageTab === 'mail' && !selectedEmail ? 'hidden lg:flex' : ''} ${activePageTab === 'calendar' && showMobileCalendarDetail ? 'hidden lg:flex' : ''}`}>
            {activePageTab === 'mail' && (
              <div
                className={`flex flex-col flex-1 bg-card/65 shadow-xl backdrop-blur-md px-6 pt-6 pb-2 border border-border rounded-md min-h-125 ${
                  !selectedEmail
                    ? 'justify-center items-center text-center'
                    : ''
                }`}
              >
                {selectedEmail ? (
                  <div className='flex flex-col w-full h-full animate-fadeIn'>
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className='lg:hidden flex items-center gap-2 hover:bg-muted/50 mb-4 -ml-2 p-2 rounded-md w-fit text-muted-foreground hover:text-foreground transition-colors'
                    >
                      <ArrowLeft className='w-4 h-4' /> Back to Inbox
                    </button>
                    <div className='flex items-center gap-4 pb-3 border-border/50 border-b'>
                      <div className='flex justify-center items-center bg-secondary/60 rounded-full w-12 h-12 text-muted-foreground shrink-0'>
                        <Mail className='w-5 h-5' />
                      </div>
                      <div className='flex flex-col'>
                        <h2 className='font-bold text-foreground text-xl tracking-tight'>
                          {selectedEmail.subject}
                        </h2>
                        <p className='mt-1 text-muted-foreground text-sm'>
                          From:{' '}
                          <span className='font-medium text-foreground'>
                            {selectedEmail.sender}
                          </span>{' '}
                          • {selectedEmail.time}
                        </p>
                      </div>
                    </div>

                    <div className='bg-secondary shadow-sm my-2 px-5 py-2.5 border border-secondary/20 rounded-md'>
                      <div className='flex items-center gap-2 mb-1 text-muted-foreground'>
                        <Sparkles className='w-4 h-4' />
                        <span className='font-bold text-xs uppercase tracking-wider'>
                          AI Summary
                        </span>
                      </div>
                      <p
                        className='text-foreground/90 text-sm leading-relaxed'
                        dangerouslySetInnerHTML={{
                          __html: selectedEmail.summary || ''
                        }}
                      />
                    </div>

                    <div className='flex flex-col flex-1'>
                      <div className='flex flex-col flex-1 bg-background/50 border border-border/50 rounded-md overflow-hidden'>
                        {selectedEmail.isHtml ? (
                          <iframe
                            srcDoc={resolvedEmailHtml}
                            className='flex-1 bg-white px-6 py-4 border-none rounded-md w-full'
                            sandbox='allow-popups allow-popups-to-escape-sandbox allow-same-origin'
                            title='Email Content'
                          />
                        ) : (
                          <div className='flex-1 overflow-y-auto'>
                            <FormattedEmailContent
                              content={selectedEmail.content || ''}
                            />
                          </div>
                        )}
                        {/* Attachments Section */}
                        {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                          <div className='bg-muted/30 p-4 border-border/50 border-t'>
                            <h4 className='mb-3 font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                              Attachments ({selectedEmail.attachments.length})
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              {selectedEmail.attachments.map((att: any, idx: number) => (
                                <div key={idx} className='flex items-center gap-2 bg-background px-3 py-2 border border-border rounded-md text-sm transition-colors'>
                                  <Paperclip className='w-4 h-4 text-muted-foreground' />
                                  <span className='max-w-50 text-foreground text-xs line-clamp-1'>
                                    {att.filename}
                                  </span>
                                  <span className='text-[10px] text-muted-foreground'>
                                    ({Math.round(att.size / 1024)} KB)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeEmails.length > 0 ? (
                  <div className='flex flex-col items-center max-w-2xl animate-fadeIn'>
                    <div className='flex justify-center items-center bg-secondary/60 mb-6 rounded-full w-16 h-16 text-muted-foreground'>
                      <Sparkles className='w-8 h-8' />
                    </div>
                    <h2 className='mb-4 font-mono font-bold text-2xl tracking-tight'>
                      Inbox Intelligence
                    </h2>
                    <p className='mb-6 text-muted-foreground leading-relaxed'>
                      You currently have{' '}
                      <span className='font-bold text-foreground'>
                        {activeEmails.length} unread messages.
                      </span>{' '}
                      <br />
                      Recent senders include:{' '}
                      <span className='font-medium text-foreground'>
                        {Array.from(new Set(activeEmails.map(e => e.sender)))
                          .slice(0, 3)
                          .join(', ')}
                        .
                      </span>
                      <br /> Select an email from the sidebar to view its
                      detailed AI summary, <br /> or review your top summary
                      below.
                    </p>

                    {activeEmails.length > 0 && activeEmails[0]?.summary && (
                      <div className='flex flex-col bg-muted/40 p-4 px-8 border border-border/50 rounded-xl w-full text-left'>
                        <span className='mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest'>
                          Latest Insights
                        </span>
                        <div className='flex flex-col gap-2'>
                          {activeEmails.slice(0, 2).map((email, idx) =>
                            email.summary ? (
                              <div
                                key={idx}
                                className='flex flex-col hover:bg-muted/60 -mx-4 px-4 py-3 rounded-xl transition-colors cursor-pointer'
                                onClick={() => setSelectedEmail(email)}
                              >
                                <div className='flex justify-between items-start gap-4 mb-1'>
                                  <h4 className='font-bold text-lg line-clamp-1 leading-tight'>
                                    {email.subject}
                                  </h4>
                                </div>
                                <span className='mb-2 font-mono text-[10px] text-primary/80 uppercase tracking-wider'>
                                  From: {email.sender}
                                </span>
                                <p
                                  className='text-muted-foreground text-sm line-clamp-3 leading-relaxed'
                                  dangerouslySetInnerHTML={{
                                    __html: `"${email.summary}"`
                                  }}
                                />
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className='flex flex-col items-center opacity-60'>
                    <Mail className='mb-4 w-12 h-12 text-muted-foreground' />
                    <h3 className='font-mono text-lg'>Your inbox is clear</h3>
                    <p className='text-sm'>
                      Connect Google and check back later for summaries.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activePageTab === 'calendar' && (
              <div className='relative flex justify-center items-start w-full h-full animate-fadeIn'>
                <div className='w-full h-full'>
                  <CalendarGrid
                    selectedDate={selectedDate}
                    viewingMonth={viewingMonth}
                    onDateSelect={(date) => {
                      setSelectedDate(date)
                      setShowMobileCalendarDetail(true)
                    }}
                    onMonthChange={setViewingMonth}
                    logs={augmentedLogs}
                    isFlexible={true}
                    onContextMenuDay={(date, e) => {
                      setQuickAddEvent({
                        date,
                        x: e.clientX,
                        y: e.clientY
                      })
                    }}
                  />
                </div>

                {quickAddEvent && (
                  <>
                    {/* Invisible overlay to close modal on click outside */}
                    <div
                      className='z-40 fixed inset-0'
                      onClick={() => setQuickAddEvent(null)}
                      onContextMenu={e => {
                        e.preventDefault()
                        setQuickAddEvent(null)
                      }}
                    />
                    <div
                      className='z-50 fixed bg-card shadow-2xl p-4 border border-border rounded-xl w-64 animate-in duration-200 fade-in zoom-in-95'
                      style={{
                        top: Math.min(
                          quickAddEvent.y,
                          window.innerHeight - 200
                        ),
                        left: Math.min(quickAddEvent.x, window.innerWidth - 270)
                      }}
                    >
                      <h4 className='flex items-center gap-2 mb-3 font-bold text-foreground text-sm'>
                        <CalIcon className='w-4 h-4 text-primary' />
                        Add Event
                      </h4>
                      <form
                        onSubmit={e => {
                          e.preventDefault()
                          if (!newEventTitle.trim()) return
                          const y = quickAddEvent.date.getFullYear()
                          const m = String(
                            quickAddEvent.date.getMonth() + 1
                          ).padStart(2, '0')
                          const d = String(
                            quickAddEvent.date.getDate()
                          ).padStart(2, '0')
                          handleAddEvent(
                            `${y}-${m}-${d}`,
                            newEventTitle.trim(),
                            newEventTime
                          )
                          setNewEventTitle('')
                          setQuickAddEvent(null)
                        }}
                      >
                        <input
                          autoFocus
                          type='text'
                          placeholder='Event Title...'
                          value={newEventTitle}
                          onChange={e => setNewEventTitle(e.target.value)}
                          className='bg-background mb-3 px-3 py-2 border border-border focus:border-primary rounded-md focus:outline-none w-full text-foreground text-sm'
                        />
                        <div className='flex gap-2'>
                          <input
                            type='time'
                            value={newEventTime}
                            onChange={e => setNewEventTime(e.target.value)}
                            className='flex-1 bg-background px-2 py-2 border border-border focus:border-primary rounded-md focus:outline-none text-foreground text-sm'
                          />
                          <button
                            type='submit'
                            className='bg-primary hover:bg-primary/90 px-4 py-2 rounded-md font-semibold text-primary-foreground text-sm transition-colors'
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
