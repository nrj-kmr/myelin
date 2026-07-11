'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'

import { CalendarGrid } from '@/components/dashboard/CalendarGrid'
import { DayDetailPanel } from '@/components/dashboard/DayDetailPanel'
import { AnalyticsSummary } from '@/components/dashboard/AnalyticsSummary'
import { IntelligentInsights } from '@/components/dashboard/IntelligentInsights'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { NarrativeWorkspace } from '@/components/dashboard/NarrativeWorkspace'

import { useUserSession } from '@/hooks/useUserSession'
import { useLogs } from '@/hooks/useLogs'
import { CURRENCY_SYMBOLS } from '@myelin/core'

export default function DashboardPage () {
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
    isLogsLoaded,
    fetchLogs,
    handleSaveJournal,
    handleAddEvent,
    handleDeleteEvent,
    handleAddExpense,
    handleDeleteExpense
  } = useLogs(userEmail)

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

  const [isMounted, setIsMounted] = useState(false)
  const [googleEvents, setGoogleEvents] = useState<any[]>([])

  // State to control DayDetailPanel tabs from NarrativeWorkspace
  const [requestedDayTab, setRequestedDayTab] = useState<
    'journal' | 'schedule' | 'ledger'
  >('journal')
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize logs once session is available
  useEffect(() => {
    if (isOnboarded) {
      fetchLogs(userEmail)
    }
  }, [isOnboarded, userEmail, fetchLogs])

  // Protect route redirect effect
  useEffect(() => {
    if (isSessionLoaded && !isOnboarded) {
      router.push('/signin')
    }
  }, [isSessionLoaded, isOnboarded, router])

  // Augment logs with Google Calendar events dynamically
  const augmentedLogs = useMemo(() => {
    if (!logs) return {}
    const newLogs = JSON.parse(JSON.stringify(logs)) // deep clone to avoid mutating local cache

    // Merge google events
    googleEvents.forEach(gEvent => {
      const { dateKey } = gEvent
      if (dateKey) {
        if (!newLogs[dateKey]) {
          newLogs[dateKey] = { events: [], expenses: [], journal: '' }
        }
        if (!newLogs[dateKey].events) {
          newLogs[dateKey].events = []
        }
        // Avoid duplicates if fetched multiple times
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

  const selectedDateKey = (() => {
    const y = selectedDate.getFullYear()
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const d = String(selectedDate.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })()

  // Compute analytics totals
  const totalJournalEntries = Object.values(augmentedLogs).filter(
    (l: any) => !!l.journal
  ).length
  const totalExpenses = Object.values(augmentedLogs)
    .flatMap((l: any) => l.expenses || [])
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  const totalEvents = Object.values(augmentedLogs).flatMap(
    (l: any) => l.events || []
  ).length

  // Consistency score calculation
  const consistencyScore = Math.min(
    100,
    Math.max(50, 85 + totalJournalEntries * 3 - (totalExpenses > 100 ? 5 : 0))
  )

  const selectedDayLog = augmentedLogs[selectedDateKey] || {}

  if (!isMounted) {
    return null // Prevent hydration mismatch on Date and sessionStorage
  }

  return (
    <div className='flex flex-col bg-background selection:bg-primary/20 min-h-screen font-sans text-foreground transition-colors duration-300'>
      <DashboardHeader
        userName={userName}
        userEmail={userEmail}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currency={currency}
        onChangeCurrency={handleChangeCurrency}
      />

      {/* Main Container */}
      <main className='space-y-6 mx-auto px-4 md:px-6 py-4 md:py-5 max-w-[1600px]'>
        {/* Top Summary Stats */}
        <AnalyticsSummary
          totalJournalEntries={totalJournalEntries}
          totalExpenses={totalExpenses}
          totalEvents={totalEvents}
          consistencyScore={consistencyScore}
          currencySymbol={CURRENCY_SYMBOLS[currency] || '$'}
        />

        {/* Main Dashboard Grid: 3 Panes (1/4 - 2/4 - 1/4 layout) */}
        <div className='gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-stretch'>
          {/* Left Sidebar: Calendar & Insights */}
          <div className='flex flex-col gap-6 order-1 md:col-span-1 lg:col-span-1 h-full'>
            <CalendarGrid
              selectedDate={selectedDate}
              viewingMonth={viewingMonth}
              onDateSelect={setSelectedDate}
              onMonthChange={setViewingMonth}
              logs={augmentedLogs}
            />

            <IntelligentInsights
              userName={userName}
              borderless={false}
              onGoogleEventsFetched={events => setGoogleEvents(events)}
              selectedDate={selectedDate}
              logs={logs}
            />
          </div>

          {/* Center Content: Narrative Workspace */}
          <div className='flex flex-col gap-6 order-3 lg:order-2 md:col-span-2 lg:col-span-2 h-full'>
            <NarrativeWorkspace
              logs={augmentedLogs}
              currency={currency}
              selectedDateKey={selectedDateKey}
              onSelectDate={setSelectedDate}
              onActionClick={tab => setRequestedDayTab(tab)}
            />
          </div>

          {/* Right Sidebar: Day Details & Logging */}
          <div className='flex flex-col gap-6 order-2 lg:order-3 md:col-span-1 lg:col-span-1 h-full'>
            <DayDetailPanel
              selectedDate={selectedDate}
              log={selectedDayLog}
              requestedTab={requestedDayTab}
              onSaveJournal={handleSaveJournal}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              currencySymbol={CURRENCY_SYMBOLS[currency] || '$'}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
