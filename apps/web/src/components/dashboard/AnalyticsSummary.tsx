import React from 'react'
import { Clock, Coins, Calendar as CalIcon, TrendingUp } from 'lucide-react'

interface AnalyticsSummaryProps {
  totalJournalEntries: number
  totalExpenses: number
  totalEvents: number
  consistencyScore: number
  currencySymbol?: string
}

export function AnalyticsSummary ({
  totalJournalEntries,
  totalExpenses,
  totalEvents,
  consistencyScore,
  currencySymbol = '$'
}: AnalyticsSummaryProps) {
  return (
    <div className='gap-4 grid grid-cols-2 md:grid-cols-4 w-full'>
      {/* Time Logged Card */}
      <div className='flex items-center gap-5 bg-card/65 backdrop-blur-md p-2 pl-4 border border-border rounded-md'>
        <div className='flex justify-center items-center bg-primary/10 rounded-lg w-10 h-10 text-primary shrink-0'>
          <Clock className='w-5 h-5' />
        </div>
        <div>
          <p className='font-semibold text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>
            Days Logged
          </p>
          <p className='mt-0.5 font-mono font-bold text-foreground text-sm'>
            {totalJournalEntries} days
          </p>
        </div>
      </div>

      {/* Expenses Card */}
      <div className='flex items-center gap-5 bg-card/65 backdrop-blur-md p-2 pl-4 border border-border rounded-md'>
        <div className='flex justify-center items-center bg-secondary rounded-lg w-10 h-10 text-primary shrink-0'>
          <Coins className='w-5 h-5' />
        </div>
        <div>
          <p className='font-semibold text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>
            Total Spent
          </p>
          <p className='mt-0.5 font-mono font-bold text-primary text-sm'>
            {currencySymbol}
            {totalExpenses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Upcoming Events Card */}
      <div className='flex items-center gap-5 bg-card/65 backdrop-blur-md p-2 pl-4 border border-border rounded-md'>
        <div className='flex justify-center items-center bg-secondary rounded-lg w-10 h-10 text-primary shrink-0'>
          <CalIcon className='w-5 h-5' />
        </div>
        <div>
          <p className='font-semibold text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>
            Schedules
          </p>
          <p className='mt-0.5 font-mono font-bold text-foreground text-sm'>
            {totalEvents} {totalEvents > 1 ? 'events' : 'event'}
          </p>
        </div>
      </div>

      {/* Consistency Card */}
      <div className='flex items-center gap-5 bg-card/65 backdrop-blur-md p-2 pl-4 border border-border rounded-md'>
        <div className='flex justify-center items-center bg-secondary rounded-lg w-10 h-10 text-primary shrink-0'>
          <TrendingUp className='w-5 h-5' />
        </div>
        <div>
          <p className='font-semibold text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider'>
            Reflex Score
          </p>
          <p className='mt-0.5 font-mono font-bold text-primary text-sm'>
            {consistencyScore}%
          </p>
        </div>
      </div>
    </div>
  )
}
