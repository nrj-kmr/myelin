'use client'

import React from 'react'
import { EmailItem, CalendarEventItem } from '@myelin/core'
import { useGoogleInsights } from '@/hooks/useGoogleInsights'
import { useInsightsStore } from '@/store/useInsightsStore'
import { InsightsHeader } from './insights/InsightsHeader'
import { EmailInsightsTab } from './insights/EmailInsightsTab'
import { CalendarInsightsTab } from './insights/CalendarInsightsTab'

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
  const { activeTab } = useInsightsStore()

  // Ensure forceTab overrides local state tab if provided
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

  const renderContent = () => (
    <>
      <InsightsHeader isDedicatedPage={isDedicatedPage} forceTab={forceTab} />

      <div className='z-10 flex flex-col flex-1 mt-4 min-w-0 overflow-hidden'>
        {currentTab === 'mail' && (
          <EmailInsightsTab
            googleConnected={googleConnected}
            loadingEmails={loadingEmails}
            emailError={emailError}
            emails={emails}
            fetchGoogleData={fetchGoogleData}
            handleReauthenticate={handleReauthenticate}
            isDedicatedPage={isDedicatedPage}
            onEmailSelect={onEmailSelect}
          />
        )}

        {currentTab === 'calendar' && (
          <CalendarInsightsTab
            googleConnected={googleConnected}
            loadingCalendar={loadingCalendar}
            calendarError={calendarError}
            calendarEvents={calendarEvents}
            fetchGoogleData={fetchGoogleData}
            handleReauthenticate={handleReauthenticate}
            isDedicatedPage={isDedicatedPage}
            selectedDate={selectedDate}
            viewingMonth={viewingMonth}
            onAddEvent={onAddEvent}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
          />
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
    <div className={`group relative flex flex-col bg-card/10 shadow-xl p-[1.5px] border rounded-md w-full overflow-hidden transition-all duration-300 flex-1 h-full min-h-0`}>
      {/* Slow Revolving Blue Light Border Beam */}
      <div
        className='z-0 absolute inset-[-400%] animate-[spin_10s_linear_infinite] pointer-events-none'
        style={{
          background:
            'conic-gradient(from 0deg, transparent 65%, #00c3eb 88%, transparent 100%)'
        }}
      />

      {/* Inner Card Panel Cover */}
      <div className='z-10 relative flex flex-col flex-1 gap-5 bg-card/95 backdrop-blur-md px-5 py-4 rounded-md w-full min-w-0 h-full'>
        {/* Background neon blur lights inside card */}
        <div className='-top-24 -left-24 z-0 absolute bg-secondary/5 blur-[60px] rounded-md w-40 h-40 pointer-events-none' />
        <div className='-right-24 -bottom-24 z-0 absolute bg-primary/5 blur-[60px] rounded-md w-40 h-40 pointer-events-none' />

        {renderContent()}
      </div>
    </div>
  )
}
