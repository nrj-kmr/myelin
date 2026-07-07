'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Brain } from 'lucide-react'

import { Calendar, CalendarDayButton } from '@myelin/ui'
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

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewingMonth, setViewingMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  )

  const [isMounted, setIsMounted] = useState(false)

  // Hydration fix for Date components like Calendar
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

  const selectedDateKey = (() => {
    const y = selectedDate.getFullYear()
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const d = String(selectedDate.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })()

  const selectedDayLog = logs[selectedDateKey] || {}

  // Compute analytics totals
  const totalJournalEntries = Object.values(logs).filter(
    l => !!l.journal
  ).length
  const totalExpenses = Object.values(logs)
    .flatMap(l => l.expenses || [])
    .reduce((sum, item) => sum + item.amount, 0)
  const totalEvents = Object.values(logs).flatMap(l => l.events || []).length

  // Consistency score calculation
  const consistencyScore = Math.min(
    100,
    Math.max(50, 85 + totalJournalEntries * 3 - (totalExpenses > 100 ? 5 : 0))
  )

  return (
    <div className='relative bg-background selection:bg-primary/30 min-h-screen font-sans text-foreground selection:text-foreground transition-colors duration-300'>
      <DashboardHeader
        userName={userName}
        theme={theme}
        currency={currency}
        onToggleTheme={handleToggleTheme}
        onChangeCurrency={handleChangeCurrency}
      />

      {/* Main Container */}
      <main className='space-y-6 mx-auto px-6 py-8 max-w-6xl'>
        {/* Top Summary Stats */}
        <AnalyticsSummary
          totalJournalEntries={totalJournalEntries}
          totalExpenses={totalExpenses}
          totalEvents={totalEvents}
          consistencyScore={consistencyScore}
          currencySymbol={CURRENCY_SYMBOLS[currency] || '$'}
        />

        {/* Grid Area */}
        <div className='items-start gap-6 grid grid-cols-1 lg:grid-cols-3'>
          {/* Left Column: AI insights & Workspace (2/3) */}
          <div className='flex flex-col gap-6 lg:col-span-2'>
            {/* AI Intelligent Insights Widget */}
            <IntelligentInsights userName={userName} borderless={false} />

            {/* Narrative Workspace Container */}
            <NarrativeWorkspace
              logs={logs}
              currency={currency}
              selectedDateKey={selectedDateKey}
              onSelectDate={setSelectedDate}
            />
          </div>

          {/* Right Column: Smaller Calendar & Day Details (1/3) */}
          <div className='flex flex-col gap-6 lg:col-span-1'>
            <div className='flex flex-col bg-card/65 backdrop-blur-md p-4 border border-border rounded-2xl w-full h-full'>
              <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={date => {
                  if (date) setSelectedDate(date)
                }}
                month={viewingMonth}
                onMonthChange={setViewingMonth}
                className='flex-1 w-full'
                classNames={{
                  months: 'w-full flex-col',
                  month: 'w-full',
                  month_grid: 'w-full border-collapse'
                }}
                components={{
                  DayButton: (props) => {
                    const { day, modifiers, children, ...restProps } = props
                    const date = day.date

                    const y = date.getFullYear()
                    const m = String(date.getMonth() + 1).padStart(2, '0')
                    const d = String(date.getDate()).padStart(2, '0')
                    const key = `${y}-${m}-${d}`

                    const log = logs?.[key]
                    const hasJournal = !!log?.journal
                    const hasEvents = log?.events && log.events.length > 0
                    const hasExpenses = log?.expenses && log.expenses.length > 0

                    const getDayTooltip = () => {
                      const lines: string[] = []
                      if (log?.journal) lines.push(`Journal: ${log.journal}`)
                      if (log?.mood) lines.push(`Mood: ${log.mood}`)
                      if (log?.events?.length) lines.push(`Events: ${log.events.map((e) => `${e.time} ${e.title}`).join(' | ')}`)
                      if (log?.expenses?.length) lines.push(`Expenses: ${log.expenses.map((e) => `${e.title} $${e.amount.toFixed(2)}`).join(' | ')}`)
                      return lines.length > 0 ? lines.join('\n') : undefined
                    }

                    return (
                      <CalendarDayButton day={day} modifiers={modifiers} title={getDayTooltip()} {...restProps}>
                        {children}
                        {(hasJournal || hasEvents || hasExpenses) && (
                          <div className="bottom-1.5 absolute flex gap-0.5 pointer-events-none">
                            {hasJournal && <span className="bg-primary rounded-full w-1 h-1" />}
                            {hasEvents && <span className="bg-secondary rounded-full w-1 h-1" />}
                            {hasExpenses && <span className="bg-chart-2 rounded-full w-1 h-1" />}
                          </div>
                        )}
                      </CalendarDayButton>
                    )
                  }
                }}
              />
            </div>

            <DayDetailPanel
              selectedDate={selectedDate}
              log={selectedDayLog}
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
