import React from 'react'
import { Clock, Coins, Activity } from 'lucide-react'

export function Features () {
  return (
    <section
      id='features'
      className='z-10 relative mx-auto px-6 py-20 border-border border-t max-w-4xl'
    >
      {/* Mockup Dashboard Card */}
      <div className='relative bg-white/50 dark:bg-black/40 shadow-2xl mb-16 p-4 sm:p-5 border border-border rounded-xl w-full overflow-hidden'>
        {/* Window controls */}
        <div className='flex justify-between items-center mb-5 pb-3 border-border border-b'>
          <div className='flex gap-1.5'>
            <span className='bg-rose-500/40 rounded-full w-2.5 h-2.5' />
            <span className='bg-amber-500/40 rounded-full w-2.5 h-2.5' />
            <span className='bg-emerald-500/40 rounded-full w-2.5 h-2.5' />
          </div>
          <span className='font-mono text-[9px] text-zinc-600 dark:text-zinc-300 tracking-widest'>
            MYELIN_INTERFACE_PREVIEW
          </span>
          <div className='w-6 h-2' />
        </div>

        <div className='gap-4 grid grid-cols-1 sm:grid-cols-3 text-left'>
          {/* Col 1: Time Log */}
          <div className='flex flex-col gap-3 bg-card/50 p-4 border border-border rounded-lg'>
            <span className='flex items-center gap-1.5 font-semibold card-text-contrast text-[10px] uppercase tracking-wider'>
              <Clock className='w-3 h-3 text-primary' /> Time Log
            </span>
            <div className='bg-primary/5 p-2.5 border border-primary/10 rounded'>
              <p className='font-semibold text-[10px] text-primary'>
                10:00 AM - Dev
              </p>
              <p className='mt-0.5 font-light card-text-contrast text-xs'>
                Created @myelin/core with shared types.
              </p>
            </div>
            <div className='bg-muted/45 p-2.5 border border-border rounded'>
              <p className='font-semibold card-text-contrast text-[10px]'>
                02:30 PM - Strategy
              </p>
              <p className='mt-0.5 font-light card-text-contrast text-xs'>
                Refactored landing app into modular components.
              </p>
            </div>
          </div>

          {/* Col 2: Ledger */}
          <div className='flex flex-col gap-3 bg-card/50 p-4 border border-border rounded-lg'>
            <span className='flex items-center gap-1.5 font-semibold card-text-contrast text-[10px] uppercase tracking-wider'>
              <Coins className='w-3 h-3 text-primary' /> Ledger
            </span>
            <div className='space-y-1.5'>
              <div className='flex justify-between items-center hover:bg-accent/40 py-1 rounded text-xs'>
                <span className='font-light card-text-contrast'>
                  Cloud Server
                </span>
                <span className='font-mono font-medium text-primary'>
                  -$12.00
                </span>
              </div>
              <div className='flex justify-between items-center hover:bg-accent/40 py-1 rounded text-xs'>
                <span className='font-light card-text-contrast'>
                  Freelance Deposit
                </span>
                <span className='font-mono font-medium text-chart-1'>
                  +$2,450.00
                </span>
              </div>
            </div>
            <div className='flex justify-between items-center bg-secondary/10 mt-auto p-2 border border-secondary/20 rounded'>
              <span className='card-text-contrast text-[10px] text-primary'>
                Remaining
              </span>
              <span className='font-mono font-bold card-text-contrast text-xs'>
                $482.20
              </span>
            </div>
          </div>

          {/* Col 3: Balance / Sync */}
          <div className='flex flex-col gap-3 bg-card/50 p-4 border border-border rounded-lg'>
            <span className='flex items-center gap-1.5 font-semibold card-text-contrast text-[10px] uppercase tracking-wider'>
              <Activity className='w-3 h-3 text-primary' /> Sync
            </span>

            <div className='flex flex-col gap-2 w-full'>
              <div className='flex justify-between items-center bg-primary/5 p-2.5 border border-primary/10 rounded'>
                <span className='font-semibold text-[10px] text-primary'>
                  Consistency
                </span>
                <span className='font-mono font-bold text-primary text-xs'>
                  94%
                </span>
              </div>
              <div className='flex justify-between items-center bg-muted/45 p-2.5 border border-border rounded'>
                <span className='font-semibold card-text-contrast text-[10px]'>
                  Cash Leak
                </span>
                <span className='font-mono font-medium text-emerald-500 text-xs'>
                  -42%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature minimal summary */}
      <div className='gap-6 grid grid-cols-1 sm:grid-cols-3 text-left'>
        <div className='space-y-2'>
          <h3 className='font-semibold text-high-contrast text-sm'>
            1. Bullet Journaling
          </h3>
          <p className='font-light text-muted-high-contrast text-xs leading-relaxed'>
            Quickly log completed tasks and mood. Jot down next-day ideas
            without the overhead of heavy calendars.
          </p>
        </div>
        <div className='space-y-2'>
          <h3 className='font-semibold text-high-contrast text-sm'>
            2. Micro Ledger
          </h3>
          <p className='font-light text-muted-high-contrast text-xs leading-relaxed'>
            Log expenses instantly. Maintain a visual balance of your daily cash
            buffer and recurring subscriptions.
          </p>
        </div>
        <div className='space-y-2'>
          <h3 className='font-semibold text-high-contrast text-sm'>
            3. Systemic Sync
          </h3>
          <p className='font-light text-muted-high-contrast text-xs leading-relaxed'>
            Align calendar events directly with costs. Discover how your
            schedule affects your spending habits.
          </p>
        </div>
      </div>
    </section>
  )
}
