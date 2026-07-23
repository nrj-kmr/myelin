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


      {/* Tab Selector */}
      {!forceTab && (
        <div className='z-10 flex gap-2 w-full'>
          <div className='flex flex-1 gap-1 bg-muted p-0.5 border border-border rounded-md overflow-hidden font-semibold text-xs'>
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
          {!isDedicatedPage && (
            <Link
              href='/insights'
              className='group flex justify-center items-center hover:bg-muted bg-card px-3 border border-border rounded-md text-muted-foreground hover:text-primary transition-colors shrink-0'
              title='View Full Insights'
            >
              <ArrowRight className='w-4 h-4 group-hover:scale-105 transition-transform' />
            </Link>
          )}
        </div>
      )}
    </>
  )
}
