'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Mail,
  RefreshCw,
  Loader2,
  Lock,
  ArrowRight,
  Calendar,
  AlertCircle,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useGoogleInsights } from '@/hooks/useGoogleInsights'
import { EmailItem, CalendarEventItem } from '@myelin/core'

interface IntelligentInsightsProps {
  userName: string
  borderless?: boolean
  isDedicatedPage?: boolean
  forceTab?: 'mail' | 'calendar'
  onGoogleEventsFetched?: (events: any[]) => void
  onEmailsFetched?: (emails: EmailItem[]) => void
  onEmailSelect?: (email: EmailItem) => void
  selectedDate?: Date
  viewingMonth?: Date
  logs?: Record<string, any>
  onAddEvent?: (dateKey: string, title: string, time: string) => void
  onEditEvent?: (
    dateKey: string,
    index: number,
    title: string,
    time: string
  ) => void
  onDeleteEvent?: (dateKey: string, index: number) => void
}

export function IntelligentInsights ({
  userName,
  borderless = false,
  isDedicatedPage = false,
  forceTab,
  onGoogleEventsFetched,
  onEmailsFetched,
  onEmailSelect,
  selectedDate,
  viewingMonth,
  logs,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}: IntelligentInsightsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'mail' | 'calendar'>(() => {
    if (typeof window !== 'undefined') {
      return (
        (sessionStorage.getItem('myelin_insights_tab') as
          | 'mail'
          | 'calendar') || 'mail'
      )
    }
    return 'mail'
  })

  // sync tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('myelin_insights_tab', activeTab)
    }
  }, [activeTab])

  const currentTab = forceTab || activeTab

  const {
    googleConnected,
    emails,
    calendarEvents,
    loadingEmails,
    loadingCalendar,
    emailError,
    calendarError,
    fetchGoogleData,
    handleReauthenticate
  } = useGoogleInsights({
    selectedDate,
    viewingMonth,
    isDedicatedPage,
    logs,
    onGoogleEventsFetched,
    onEmailsFetched
  })

  // Inline event editing state
  const [editingEvent, setEditingEvent] = useState<{
    dateKey: string
    index: number
    title: string
    time: string
  } | null>(null)
  const [addingEventDate, setAddingEventDate] = useState<string | null>(null)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventTime, setNewEventTime] = useState('12:00')

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
        {!isDedicatedPage && (
          <Link
            href='/insights'
            className='group flex justify-center items-center hover:bg-muted px-2 py-1 rounded-md text-muted-foreground hover:text-primary transition-colors'
            title='View Full Insights'
          >
            <ArrowRight className='w-4 h-4 group-hover:scale-105 transition-all' />
          </Link>
        )}
      </div>

      {/* Tab Selector */}
      {!forceTab && (
        <div className='z-10 flex gap-1 bg-muted p-0.5 border border-border rounded-md w-full overflow-hidden font-semibold text-xs'>
          <button
            onClick={() => setActiveTab('mail')}
            className={`flex-1 justify-center px-2 py-2 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px] min-w-0 ${
              activeTab === 'mail'
                ? 'bg-card shadow-sm text-amber-600 dark:text-amber-400 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Mail className='w-3.5 h-3.5 shrink-0' />{' '}
            <span className='truncate'>Mail Summaries</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 justify-center px-2 py-2 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px] min-w-0 ${
              activeTab === 'calendar'
                ? 'bg-card shadow-sm text-pink-400 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className='w-3.5 h-3.5 shrink-0' />{' '}
            <span className='truncate'>Upcoming Schedules</span>
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className='z-10 flex flex-col flex-1 mt-4 overflow-hidden'>
        {/* Email integration (Inbox Insights) */}
        {currentTab === 'mail' && (
          <div className='flex flex-col gap-3 h-full overflow-hidden animate-fadeIn'>
            <div className='flex justify-between items-center'>
              <span className='flex items-center gap-1.5 font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                <Mail className='w-3.5 h-3.5' /> Mail Summaries
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
              <div className='flex flex-col items-center gap-2 bg-red-500/5 p-4 border border-red-500/20 rounded-xl font-mono text-[10px] text-red-500 text-center'>
                <AlertCircle className='w-4 h-4 text-red-500' />
                <span>{emailError}</span>
                <button
                  onClick={handleReauthenticate}
                  className='bg-red-500/10 hover:bg-red-500/20 mt-1 px-4 py-1.5 border border-red-500/20 rounded-lg font-bold transition-colors'
                >
                  Sign Out & Reauthenticate
                </button>
              </div>
            ) : emails.length === 0 ? (
              <div className='flex justify-center items-center bg-muted/10 p-4 border border-border/40 rounded-xl min-h-28 text-[10px] text-muted-foreground text-center italic'>
                No email data available.
              </div>
            ) : (
              <div className='flex flex-col gap-2 h-full overflow-hidden'>
                <div
                  onClick={() => {
                    if (isDedicatedPage && onEmailSelect) {
                      onEmailSelect(null as any)
                    } else {
                      router.push('/insights')
                    }
                  }}
                  className='bg-muted/30 hover:bg-muted/50 p-4 border border-border/40 rounded-xl transition-colors cursor-pointer'
                >
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
                      "
                      <span
                        dangerouslySetInnerHTML={{ __html: emails[0].summary }}
                      />
                      "
                    </p>
                  )}
                </div>

                {isDedicatedPage && (
                  <div className='flex flex-col flex-1 gap-4 mt-2 w-full overflow-hidden'>
                    <div className='flex items-center gap-2 pb-2 border-border/50 border-b text-muted-foreground'>
                      <Mail className='w-4 h-4' />
                      <h5 className='font-semibold text-sm tracking-tight'>
                        Recent Unread Emails
                      </h5>
                    </div>
                    <div className='flex flex-col flex-1 gap-2 pr-2 pb-4 overflow-y-auto'>
                      {emails.map((mail, idx) => (
                        <div
                          key={idx}
                          onClick={() => onEmailSelect?.(mail)}
                          className='group/item flex flex-col gap-1 bg-muted/40 hover:bg-muted/75 p-3 border border-border/40 rounded-xl transition-all cursor-pointer'
                        >
                          <div className='flex justify-between items-center font-mono font-semibold text-[10px] text-muted-foreground'>
                            <span>{mail.sender}</span>
                            <span className='text-[9px] text-muted-foreground/60'>
                              {mail.time}
                            </span>
                          </div>
                          <p className='font-bold text-foreground group-hover/item:text-primary text-xs line-clamp-1 transition-colors'>
                            {mail.subject}
                          </p>
                          <p
                            className='mt-0.5 font-light text-[11px] text-muted-foreground line-clamp-1 leading-relaxed'
                            dangerouslySetInnerHTML={{
                              __html: mail.summary || ''
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Calendar integration (Events Overlay) */}
        {currentTab === 'calendar' && (
          <div className='flex flex-col gap-3 animate-fadeIn'>
            <div className='flex justify-between items-center'>
              <span className='flex items-center gap-1.5 font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                <Calendar className='w-3.5 h-3.5' /> Schedules
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
              <div className='flex flex-col items-center gap-2 bg-red-500/5 p-4 border border-red-500/20 rounded-xl font-mono text-[10px] text-red-500 text-center'>
                <AlertCircle className='w-4 h-4 text-red-500' />
                <span>{calendarError}</span>
                <button
                  onClick={handleReauthenticate}
                  className='bg-red-500/10 hover:bg-red-500/20 mt-1 px-4 py-1.5 border border-red-500/20 rounded-lg font-bold transition-colors'
                >
                  Sign Out & Reauthenticate
                </button>
              </div>
            ) : calendarEvents.length === 0 ? (
              <div className='flex justify-center items-center bg-muted/10 p-4 px-4 border border-border/40 rounded-xl min-h-28 text-[10px] text-muted-foreground text-center italic'>
                {selectedDate
                  ? 'No events for the selected day.'
                  : 'No calendar data available.'}
              </div>
            ) : (
              <div className='flex flex-col gap-2'>
                <div
                  onClick={() => router.push('/insights')}
                  className='bg-muted/30 p-4 border border-border/40 rounded-xl cursor-pointer'
                >
                  {(() => {
                    let selectedDateKey = ''
                    if (selectedDate) {
                      const y = selectedDate.getFullYear()
                      const m = String(selectedDate.getMonth() + 1).padStart(
                        2,
                        '0'
                      )
                      const d = String(selectedDate.getDate()).padStart(2, '0')
                      selectedDateKey = `${y}-${m}-${d}`
                    }

                    const todayKey = new Date().toISOString().split('T')[0]
                    const selectedDayEvents = calendarEvents.filter(
                      e => e.dateKey === selectedDateKey
                    )
                    const nextEvent =
                      calendarEvents.find(
                        e => e.dateKey && e.dateKey >= todayKey
                      ) || calendarEvents[0]

                    if (selectedDateKey && selectedDayEvents.length === 0) {
                      return (
                        <>
                          <p className='mb-1 font-medium text-foreground text-sm'>
                            You don't have any events scheduled for this day.
                          </p>
                          {nextEvent && (
                            <p className='text-muted-foreground text-xs leading-relaxed'>
                              Your next event from today is{' '}
                              <span className='font-medium text-pink-400'>
                                "{nextEvent.title}"
                              </span>{' '}
                              on
                              <br />
                              <span className='font-medium text-primary'>
                                {nextEvent.dateKey}{' '}
                              </span>
                              {'   '}
                              at {'  '}
                              <span className='font-medium text-primary'>
                                {nextEvent.time}.
                              </span>
                            </p>
                          )}
                        </>
                      )
                    }

                    const displayEvents =
                      selectedDateKey && isDedicatedPage
                        ? selectedDayEvents
                        : calendarEvents
                    const firstEvent = displayEvents[0]

                    return (
                      <>
                        <p className='mb-1 font-medium text-foreground text-sm'>
                          You have {displayEvents.length} event
                          {displayEvents.length !== 1 ? 's' : ''} scheduled{' '}
                          {selectedDateKey ? 'for this day' : 'upcoming'}.
                        </p>
                        {firstEvent && (
                          <p className='text-muted-foreground text-xs leading-relaxed'>
                            {selectedDateKey ? 'First' : 'Your next'} event is{' '}
                            <span className='font-medium text-pink-400'>
                              "{firstEvent.title}"
                            </span>{' '}
                            at {firstEvent.time}.
                          </p>
                        )}
                      </>
                    )
                  })()}
                </div>

                {isDedicatedPage && (
                  <div className='flex flex-col gap-4 mt-6 w-full'>
                    <div className='flex justify-between items-center pb-2 border-border/50 border-b'>
                      <div className='flex items-center gap-2'>
                        <Calendar className='w-4 h-4 text-primary/70' />
                        <h5 className='font-semibold text-foreground text-sm tracking-tight'>
                          {viewingMonth
                            ? 'Month Schedule'
                            : 'Upcoming Schedule Details'}
                        </h5>
                      </div>
                      {isDedicatedPage && selectedDate && (
                        <button
                          onClick={() => {
                            const y = selectedDate.getFullYear()
                            const m = String(
                              selectedDate.getMonth() + 1
                            ).padStart(2, '0')
                            const d = String(selectedDate.getDate()).padStart(
                              2,
                              '0'
                            )
                            setAddingEventDate(`${y}-${m}-${d}`)
                            setNewEventTitle('')
                            setNewEventTime('12:00')
                            setEditingEvent(null)
                          }}
                          className='flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-2 py-1 rounded font-semibold text-[10px] text-primary transition-colors'
                        >
                          <Plus className='w-3 h-3' /> Add Event
                        </button>
                      )}
                    </div>
                    <div className='flex flex-col gap-2 pr-2 max-h-[calc(100vh-350px)] overflow-y-auto'>
                      {addingEventDate && (
                        <div className='flex flex-col gap-2 bg-muted/60 p-3 border border-primary/40 rounded-md animate-fadeIn'>
                          <div className='flex items-center gap-2 font-mono font-bold text-[10px] text-primary uppercase tracking-widest'>
                            <Calendar className='w-3 h-3' /> New Event (
                            {addingEventDate})
                          </div>
                          <input
                            autoFocus
                            placeholder='Event title'
                            className='bg-background px-2 py-1 border border-border focus:border-primary rounded focus:outline-none w-full text-foreground text-xs'
                            value={newEventTitle}
                            onChange={e => setNewEventTitle(e.target.value)}
                          />
                          <div className='flex items-center gap-2'>
                            <input
                              type='time'
                              className='flex-1 bg-background px-2 py-1 border border-border focus:border-primary rounded focus:outline-none text-foreground text-xs'
                              value={newEventTime}
                              onChange={e => setNewEventTime(e.target.value)}
                            />
                            <button
                              onClick={() => {
                                if (onAddEvent && newEventTitle.trim()) {
                                  onAddEvent(
                                    addingEventDate,
                                    newEventTitle.trim(),
                                    newEventTime
                                  )
                                  setAddingEventDate(null)
                                }
                              }}
                              className='bg-primary hover:bg-primary/90 px-3 py-1 rounded font-semibold text-primary-foreground text-xs transition-colors'
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setAddingEventDate(null)}
                              className='bg-muted hover:bg-muted/80 px-3 py-1 rounded font-semibold text-muted-foreground text-xs transition-colors'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {calendarEvents.map((evt, idx) => {
                        const isEditing =
                          editingEvent &&
                          editingEvent.dateKey === evt.dateKey &&
                          editingEvent.index === evt.originalIndex

                        let isSelectedDay = false
                        if (selectedDate && evt.dateKey) {
                          const y = selectedDate.getFullYear()
                          const m = String(
                            selectedDate.getMonth() + 1
                          ).padStart(2, '0')
                          const d = String(selectedDate.getDate()).padStart(
                            2,
                            '0'
                          )
                          isSelectedDay = evt.dateKey === `${y}-${m}-${d}`
                        }

                        const isCustom = evt.platform === 'Custom Event'

                        if (isEditing) {
                          return (
                            <div
                              key={idx}
                              className='flex flex-col gap-2 bg-muted/60 p-3 border border-primary/40 rounded-xl animate-fadeIn'
                            >
                              <div className='flex items-center gap-2 font-mono font-bold text-[10px] text-primary uppercase tracking-widest'>
                                <Pencil className='w-3 h-3' /> Edit Event (
                                {evt.dateKey})
                              </div>
                              <input
                                autoFocus
                                placeholder='Event title'
                                className='bg-background px-2 py-1 border border-border focus:border-primary rounded focus:outline-none w-full text-foreground text-xs'
                                value={editingEvent.title}
                                onChange={e =>
                                  setEditingEvent({
                                    ...editingEvent,
                                    title: e.target.value
                                  })
                                }
                              />
                              <div className='flex items-center gap-2'>
                                <input
                                  type='time'
                                  className='flex-1 bg-background px-2 py-1 border border-border focus:border-primary rounded focus:outline-none text-foreground text-xs'
                                  value={editingEvent.time}
                                  onChange={e =>
                                    setEditingEvent({
                                      ...editingEvent,
                                      time: e.target.value
                                    })
                                  }
                                />
                                <button
                                  onClick={() => {
                                    if (
                                      onEditEvent &&
                                      editingEvent.title.trim()
                                    ) {
                                      onEditEvent(
                                        editingEvent.dateKey,
                                        editingEvent.index,
                                        editingEvent.title.trim(),
                                        editingEvent.time
                                      )
                                      setEditingEvent(null)
                                    }
                                  }}
                                  className='bg-primary hover:bg-primary/90 px-3 py-1 rounded font-semibold text-primary-foreground text-xs transition-colors'
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingEvent(null)}
                                  className='bg-muted hover:bg-muted/80 px-3 py-1 rounded font-semibold text-muted-foreground text-xs transition-colors'
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={idx}
                            className={`group/item flex items-center justify-between gap-3 p-3 border rounded-md transition-all ${
                              isSelectedDay
                                ? 'bg-muted-foreground/15 border-primary/30 shadow-[0_0_15px_rgba(0,195,235,0.1)]'
                                : 'bg-muted/30 hover:bg-muted/75 border-border/40'
                            }`}
                          >
                            <div className='flex items-center gap-3 overflow-hidden'>
                              <div
                                className={`flex flex-col justify-center items-center rounded-lg w-9 h-9 shrink-0 ${
                                  isSelectedDay
                                    ? 'bg-secondary/70 border border-border'
                                    : 'bg-secondary/30 border border-secondary'
                                }`}
                              >
                                <Calendar
                                  className={`w-4 h-4 ${
                                    isSelectedDay
                                      ? 'text-primary'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              </div>
                              <div className='flex flex-col min-w-0'>
                                <p className='font-bold text-foreground text-xs line-clamp-1 transition-colors'>
                                  {evt.title}
                                </p>
                                <div className='flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-muted-foreground'>
                                  <span>{evt.dateKey}</span>
                                  <span>•</span>
                                  <span>{evt.time}</span>
                                  <span>•</span>
                                  <span
                                    className={`px-1 rounded text-[8px] font-bold ${
                                      isCustom
                                        ? 'bg-green-600/20 text-green-600 dark:text-green-400'
                                        : 'bg-blue-500/20 text-blue-500'
                                    }`}
                                  >
                                    {isCustom ? 'CUSTOM' : 'GOOGLE'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Hover Actions */}
                            {isCustom &&
                              isDedicatedPage &&
                              evt.dateKey &&
                              evt.originalIndex !== undefined && (
                                <div className='flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0'>
                                  <button
                                    onClick={() =>
                                      setEditingEvent({
                                        dateKey: evt.dateKey!,
                                        index: evt.originalIndex!,
                                        title: evt.title,
                                        time: evt.time
                                      })
                                    }
                                    className='hover:bg-primary/10 p-1.5 rounded text-muted-foreground hover:text-primary transition-colors'
                                    title='Edit Event'
                                  >
                                    <Pencil className='w-3.5 h-3.5' />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (onDeleteEvent)
                                        onDeleteEvent(
                                          evt.dateKey!,
                                          evt.originalIndex!
                                        )
                                    }}
                                    className='hover:bg-destructive/10 p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors'
                                    title='Delete Event'
                                  >
                                    <Trash2 className='w-3.5 h-3.5' />
                                  </button>
                                </div>
                              )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )

  if (borderless) {
    return (
      <div className='relative flex flex-col gap-2 w-full transition-all duration-300'>
        {renderContent()}
      </div>
    )
  }

  return (
    <div className='group relative flex flex-col flex-1 bg-card/10 shadow-xl p-[1.5px] border rounded-md w-full h-full overflow-hidden transition-all duration-300'>
      {/* Slow Revolving Blue Light Border Beam */}
      <div
        className='z-0 absolute inset-[-400%] animate-[spin_10s_linear_infinite] pointer-events-none'
        style={{
          background:
            'conic-gradient(from 0deg, transparent 65%, #00c3eb 88%, transparent 100%)'
        }}
      />

      {/* Inner Card Panel Cover */}
      <div className='z-10 relative flex flex-col flex-1 gap-5 bg-card/95 backdrop-blur-md px-5 py-4 rounded-md w-full h-full'>
        {/* Background neon blur lights inside card */}
        <div className='-top-24 -left-24 z-0 absolute bg-secondary/5 blur-[60px] rounded-md w-40 h-40 pointer-events-none' />
        <div className='-right-24 -bottom-24 z-0 absolute bg-primary/5 blur-[60px] rounded-md w-40 h-40 pointer-events-none' />

        {renderContent()}
      </div>
    </div>
  )
}
