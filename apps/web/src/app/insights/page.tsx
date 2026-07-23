'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { IntelligentInsights } from '@/components/dashboard/IntelligentInsights'
import { EmailItem } from '@myelin/core'
import { CalendarGrid } from '@/components/dashboard/CalendarGrid'

import { useUserSession } from '@/hooks/useUserSession'
import { useLogs } from '@/hooks/useLogs'
import { useInsightsStore } from '@/store/useInsightsStore'

import { EmailDetailView } from '@/components/dashboard/insights/EmailDetailView'
import { InboxIntelligenceWelcome } from '@/components/dashboard/insights/InboxIntelligenceWelcome'
import { CalendarQuickAddOverlay } from '@/components/dashboard/insights/CalendarQuickAddOverlay'

export default function InsightsPage() {
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
  const { activeTab } = useInsightsStore()

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

  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setLocalTheme(
        document.documentElement.classList.contains('light') ? 'light' : 'dark'
      )

      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'class') {
            const isLight = document.documentElement.classList.contains('light')
            setLocalTheme(isLight ? 'light' : 'dark')
          }
        })
      })

      observer.observe(document.documentElement, { attributes: true })
      return () => observer.disconnect()
    }
  }, [])

  // Google Data State
  const [quickAddEvent, setQuickAddEvent] = useState<{
    date: Date
    x: number
    y: number
  } | null>(null)

  const [googleEvents, setGoogleEvents] = useState<any[]>([])
  const [googleEmails, setGoogleEmails] = useState<EmailItem[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null)

  const [showMobileCalendarDetail, setShowMobileCalendarDetail] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
    e => !e.markedReadLocally && !e.markedDeletedLocally
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
        backLink={{ label: 'Dashboard', href: '/dashboard' }}
      />

      <main className='flex flex-col flex-1 gap-2.5 mx-auto px-4 md:px-6 py-2.5 w-full max-w-[1600px] overflow-hidden'>
        {/* Main Layout Grid -> Resizable Panels */}
        <PanelGroup
          direction='horizontal'
          className='flex-1 w-full h-full min-h-0'
        >
          {/* Left Sidebar: Data Feed (IntelligentInsights Component) */}
          <Panel
            defaultSize={25}
            minSize={20}
            maxSize={40}
            className={`flex flex-col min-w-0 h-full overflow-hidden ${
              activeTab === 'mail' && selectedEmail ? 'hidden lg:flex' : ''
            } ${
              activeTab === 'calendar' && !showMobileCalendarDetail
                ? 'hidden lg:flex'
                : ''
            }`}
          >
            {activeTab === 'calendar' && showMobileCalendarDetail && (
              <button
                onClick={() => setShowMobileCalendarDetail(false)}
                className='lg:hidden flex items-center gap-2 hover:bg-muted/50 -mb-2 p-2 rounded-md w-fit text-muted-foreground hover:text-foreground transition-colors'
              >
                <ArrowLeft className='w-4 h-4' /> Back to Calendar
              </button>
            )}
            <div className='flex flex-col flex-1 pr-4 h-full min-h-0'>
              <IntelligentInsights
                userName={userName}
                borderless={true}
                isDedicatedPage={true}
                onGoogleEventsFetched={setGoogleEvents}
                onEmailsFetched={setGoogleEmails}
                onEmailSelect={setSelectedEmail}
                selectedDate={
                  activeTab === 'calendar' ? selectedDate : undefined
                }
                viewingMonth={viewingMonth}
                logs={logs}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            </div>
          </Panel>

          {/* Separator */}
          <PanelResizeHandle className='hover:bg-primary/50 bg-border w-px h-full transition-colors' />

          {/* Main Content Area */}
          <Panel
            className={`flex flex-col min-w-0 h-full overflow-hidden ${
              activeTab === 'mail' && !selectedEmail ? 'hidden lg:flex' : ''
            } ${
              activeTab === 'calendar' && showMobileCalendarDetail
                ? 'hidden lg:flex'
                : ''
            }`}
          >
            <PanelGroup
              direction='horizontal'
              className='flex-1 w-full h-full min-h-0'
            >
              <Panel className='flex flex-col min-w-0 h-full overflow-hidden'>
                {activeTab === 'mail' && (
                  <div
                    className={`flex flex-col flex-1 px-4 lg:px-8 py-4 h-full ${
                      !selectedEmail
                        ? 'justify-center items-center text-center'
                        : ''
                    }`}
                  >
                    {selectedEmail ? (
                      <EmailDetailView
                        selectedEmail={selectedEmail}
                        onClose={() => setSelectedEmail(null)}
                        localTheme={localTheme}
                        isMounted={isMounted}
                      />
                    ) : (
                      <InboxIntelligenceWelcome
                        activeEmails={activeEmails}
                        onEmailSelect={setSelectedEmail}
                      />
                    )}
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <div className='relative flex flex-col items-stretch px-4 lg:px-8 py-4 w-full h-full animate-fadeIn'>
                    <div className='w-full h-full'>
                      <CalendarGrid
                        selectedDate={selectedDate}
                        viewingMonth={viewingMonth}
                        onDateSelect={date => {
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
                      <CalendarQuickAddOverlay
                        quickAddEvent={quickAddEvent}
                        onClose={() => setQuickAddEvent(null)}
                        onSave={(dateStr, title, time) => {
                          handleAddEvent(dateStr, title, time)
                          setQuickAddEvent(null)
                        }}
                      />
                    )}
                  </div>
                )}
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  )
}
