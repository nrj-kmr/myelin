'use client'

import React from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Mail, Calendar } from 'lucide-react'
import { useInsightsStore } from '@/store/useInsightsStore'

interface InsightsHeaderProps {
  isDedicatedPage: boolean
  forceTab?: 'mail' | 'calendar'
}

export function InsightsHeader({ isDedicatedPage, forceTab }: InsightsHeaderProps) {
  const { activeTab, setActiveTab } = useInsightsStore()

  return (
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
                ? 'bg-card shadow-sm text-pink-600 dark:text-pink-400 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className='w-3.5 h-3.5 shrink-0' />{' '}
            <span className='truncate'>Upcoming Events</span>
          </button>
        </div>
      )}
    </>
  )
}
