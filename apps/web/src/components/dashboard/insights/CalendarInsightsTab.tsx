'use client'

import React, { useState } from 'react'
import { Calendar, RefreshCw, Loader2, AlertCircle, Plus, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CalendarEventItem } from '@myelin/core'
import { useInsightsStore } from '@/store/useInsightsStore'
import { GoogleConnectPrompt } from './GoogleConnectPrompt'
interface CalendarInsightsTabProps {
  googleConnected: boolean
  loadingCalendar: boolean
  calendarError: string
  calendarEvents: CalendarEventItem[]
  fetchGoogleData: (forceRefresh: boolean, target: 'all' | 'email' | 'calendar') => void
  handleReauthenticate: () => void
  isDedicatedPage?: boolean
  selectedDate?: Date
  viewingMonth?: Date
  onAddEvent?: (dateKey: string, title: string, time: string) => void
  onEditEvent?: (dateKey: string, index: number, title: string, time: string) => void
  onDeleteEvent?: (dateKey: string, index: number) => void
}

export function CalendarInsightsTab({
  googleConnected,
  loadingCalendar,
  calendarError,
  calendarEvents,
  fetchGoogleData,
  handleReauthenticate,
  isDedicatedPage,
  selectedDate,
  viewingMonth,
  onAddEvent,
  onEditEvent,
  onDeleteEvent
}: CalendarInsightsTabProps) {
  const router = useRouter()
  const {
    newEventTitle,
    setNewEventTitle,
    newEventTime,
    setNewEventTime
  } = useInsightsStore()

  const [addingEventDate, setAddingEventDate] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<{
    dateKey: string;
    index: number;
    title: string;
    time: string;
  } | null>(null)

  return (
    <div className='flex flex-col gap-3 h-full overflow-hidden'>
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
              className={`w-3 h-3 ${loadingCalendar ? 'animate-spin text-primary' : ''}`}
            />
          </button>
        )}
      </div>

      {!googleConnected ? (
        <GoogleConnectPrompt />
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
        <div className='flex flex-col gap-2 h-full overflow-hidden'>
          <div
            onClick={() => {
              if (!isDedicatedPage) router.push('/insights')
            }}
            className={`bg-muted/30 p-4 border border-border/40 rounded-xl w-full overflow-hidden ${!isDedicatedPage ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
          >
            {(() => {
              let selectedDateKey = ''
              if (selectedDate) {
                const y = selectedDate.getFullYear()
                const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
                const d = String(selectedDate.getDate()).padStart(2, '0')
                selectedDateKey = `${y}-${m}-${d}`
              }

              if (!isDedicatedPage) {
                const today = new Date()
                const y = today.getFullYear()
                const m = String(today.getMonth() + 1).padStart(2, '0')
                const d = String(today.getDate()).padStart(2, '0')
                const todayKey = `${y}-${m}-${d}`

                const nextWeek = new Date(today)
                nextWeek.setDate(today.getDate() + 7)
                const ny = nextWeek.getFullYear()
                const nm = String(nextWeek.getMonth() + 1).padStart(2, '0')
                const nd = String(nextWeek.getDate()).padStart(2, '0')
                const nextWeekKey = `${ny}-${nm}-${nd}`

                const next7DaysEvents = calendarEvents.filter(
                  (e) => e.dateKey && e.dateKey >= todayKey && e.dateKey <= nextWeekKey
                )
                const uniqueDays = Array.from(new Set(next7DaysEvents.map(e => e.dateKey))).slice(0, 3)
                const displayEvents = next7DaysEvents.filter(e => uniqueDays.includes(e.dateKey))

                return (
                  <div className='flex flex-col flex-1 min-h-0'>
                    <p className='mb-2 font-medium text-foreground text-sm'>
                      You have {next7DaysEvents.length} event{next7DaysEvents.length !== 1 ? 's' : ''} scheduled for the next 7 days.
                    </p>
                    {displayEvents.length > 0 ? (
                      <div className='flex flex-col flex-1 gap-3 pr-1 pb-1 overflow-y-auto'>
                        {uniqueDays.map(dayKey => {
                          const dayEvents = displayEvents.filter(e => e.dateKey === dayKey)
                          return (
                            <div key={dayKey} className='flex flex-col gap-1.5'>
                              <span className='font-semibold text-[10px] text-muted-foreground uppercase tracking-widest'>
                                {dayKey === todayKey ? 'Today' : dayKey}
                              </span>
                              <div className='flex flex-col gap-1'>
                                {dayEvents.map((evt, i) => (
                                  <div key={i} className='flex justify-between items-center bg-muted/40 hover:bg-muted/60 p-1.5 border-primary/50 border-l-2 rounded text-xs transition-colors'>
                                    <span className='pr-2 font-medium text-foreground wrap-break-words line-clamp-1'>
                                      {evt.title}
                                    </span>
                                    <span className='font-mono text-[10px] text-primary whitespace-nowrap'>
                                      {evt.time}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                        {next7DaysEvents.length > displayEvents.length && (
                          <div className='mt-1 pt-1 text-center'>
                            <span className='text-[10px] text-muted-foreground italic'>
                              + {next7DaysEvents.length - displayEvents.length} more later this week
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className='text-muted-foreground text-xs leading-relaxed'>
                        Your week looks completely clear!
                      </p>
                    )}
                  </div>
                )
              }

              // Dedicated Page Logic
              const todayKey = new Date().toISOString().split('T')[0]
              const selectedDayEvents = calendarEvents.filter(
                (e) => e.dateKey === selectedDateKey
              )
              const upcomingEvents = calendarEvents
                .filter((e) => e.dateKey && e.dateKey >= todayKey)
                .sort((a, b) => a.dateKey!.localeCompare(b.dateKey!))
              const nextEvent = upcomingEvents[0]

              if (selectedDateKey && selectedDayEvents.length === 0) {
                return (
                  <>
                    <p className='mb-1 font-medium text-foreground text-sm'>
                      You don't have any events scheduled for this day.
                    </p>
                    {nextEvent && (
                      <p className='text-muted-foreground text-xs wrap-break-words leading-relaxed'>
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

              const displayEvents = selectedDayEvents
              const firstEvent = displayEvents[0]

              return (
                <>
                  <p className='mb-1 font-medium text-foreground text-sm'>
                    You have {displayEvents.length} event
                    {displayEvents.length !== 1 ? 's' : ''} scheduled for this day.
                  </p>
                  {firstEvent && (
                    <p className='text-muted-foreground text-xs wrap-break-words leading-relaxed'>
                      First event is{' '}
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
            <div className='flex flex-col flex-1 gap-4 mt-2 w-full overflow-hidden'>
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
                      const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
                      const d = String(selectedDate.getDate()).padStart(2, '0')
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
              <div className='flex flex-col flex-1 gap-2 pr-2 pb-4 overflow-y-auto'>
                {addingEventDate && (
                  <div className='flex flex-col gap-2 bg-muted/60 p-3 border border-primary/40 rounded-md animate-fadeIn'>
                    <div className='flex items-center gap-2 font-mono font-bold text-[10px] text-primary uppercase tracking-widest'>
                      <Calendar className='w-3 h-3' /> New Event (
                      {selectedDate && `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                      )
                    </div>
                    <input
                      autoFocus
                      placeholder='Event title'
                      className='bg-background px-2 py-1 border border-border focus:border-primary rounded focus:outline-none w-full text-foreground text-xs'
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                    />
                    <div className='flex items-center gap-2'>
                      <input
                        type='time'
                        className='flex-1 bg-background px-2 py-1 border border-border focus:border-primary rounded focus:outline-none text-foreground text-xs'
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          if (onAddEvent && newEventTitle.trim() && selectedDate) {
                            const y = selectedDate.getFullYear()
                            const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
                            const d = String(selectedDate.getDate()).padStart(2, '0')
                            onAddEvent(`${y}-${m}-${d}`, newEventTitle.trim(), newEventTime)
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
                    const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
                    const d = String(selectedDate.getDate()).padStart(2, '0')
                    isSelectedDay = evt.dateKey === `${y}-${m}-${d}`
                  }

                  const isCustom = evt.platform === 'Custom'

                  if (isEditing) {
                    return (
                      <div
                        key={idx}
                        className='flex flex-col gap-2 bg-muted/60 p-3 border border-primary/40 rounded-xl animate-fadeIn'
                      >
                        <div className='flex items-center gap-2 font-mono font-bold text-[10px] text-primary uppercase tracking-widest'>
                          <Pencil className='w-3 h-3' /> Edit Event ({evt.dateKey})
                        </div>
                        <input
                          autoFocus
                          placeholder='Event title'
                          className='bg-background px-2 py-1 border border-border focus:border-primary rounded focus:outline-none w-full text-foreground text-xs'
                          value={editingEvent.title}
                          onChange={(e) =>
                            setEditingEvent({ ...editingEvent, title: e.target.value })
                          }
                        />
                        <div className='flex items-center gap-2'>
                          <input
                            type='time'
                            className='flex-1 bg-background px-2 py-1 border border-border focus:border-primary rounded focus:outline-none text-foreground text-xs'
                            value={editingEvent.time}
                            onChange={(e) =>
                              setEditingEvent({ ...editingEvent, time: e.target.value })
                            }
                          />
                          <button
                            onClick={() => {
                              if (onEditEvent && editingEvent.title.trim()) {
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
                      className={`shrink-0 group/item flex items-center justify-between gap-3 p-3 border rounded-md transition-all ${
                        isSelectedDay
                          ? 'bg-muted-foreground/15 border-primary/30 shadow-[0_0_15px_rgba(0,195,235,0.1)]'
                          : 'bg-muted/30 hover:bg-muted/75 border-border/40'
                      }`}
                    >
                      <div className='flex items-center gap-3 overflow-hidden'>
                        <div
                          className={`flex justify-center items-center rounded w-8 h-8 ${
                            isCustom
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted-foreground/20 text-muted-foreground'
                          }`}
                        >
                          <Calendar className='w-4 h-4' />
                        </div>
                        <div className='flex flex-col min-w-0'>
                          <p className='font-semibold text-foreground text-xs line-clamp-1'>
                            {evt.title}
                          </p>
                          <div className='flex items-center gap-2 text-[10px] text-muted-foreground'>
                            <span>{evt.time}</span>
                            <span>•</span>
                            <span className='truncate'>{evt.platform}</span>
                            {!isSelectedDay && (
                              <>
                                <span>•</span>
                                <span>{evt.dateKey}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {isCustom && (
                        <div className='flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity'>
                          {onEditEvent && (
                            <button
                              onClick={() => {
                                setEditingEvent({
                                  dateKey: evt.dateKey as string,
                                  index: evt.originalIndex as number,
                                  title: evt.title,
                                  time: evt.time
                                })
                                setAddingEventDate(null)
                              }}
                              className='hover:bg-primary/20 p-1.5 rounded text-muted-foreground hover:text-primary transition-colors'
                              title='Edit Event'
                            >
                              <Pencil className='w-3 h-3' />
                            </button>
                          )}
                          {onDeleteEvent && (
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this event?')) {
                                  onDeleteEvent(evt.dateKey as string, evt.originalIndex as number)
                                }
                              }}
                              className='hover:bg-red-500/20 p-1.5 rounded text-muted-foreground hover:text-red-500 transition-colors'
                              title='Delete Event'
                            >
                              <Trash2 className='w-3 h-3' />
                            </button>
                          )}
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
  )
}
