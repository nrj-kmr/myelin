import React from 'react'
import { Clock, Coins, Activity, Feather } from 'lucide-react'

export function Features () {
  return (
    <section id='features' className='relative py-24 md:py-32 min-h-[70vh] overflow-hidden'>
      <div className='mx-auto px-6 max-w-7xl'>

        <div className='flex justify-between items-center mb-12'>
          <h2 className='flex flex-wrap items-center gap-2 font-mono text-muted-foreground text-xs uppercase tracking-[0.16em]'>
            <Feather className='w-4 h-4'/>
            Core Capabilities
          </h2>
        </div>

        <div className='gap-6 grid md:grid-cols-3'>

          {/* Feature 1 */}
          <div className='group flex flex-col bg-card hover:bg-secondary hover:shadow-sm p-6 border border-border hover:border-foreground/20 rounded-xl h-full transition-all duration-300'>
            <div className='flex justify-between items-center mb-6'>
              <div className='flex justify-center items-center bg-secondary border border-border rounded-lg w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300'>
                <Clock className='w-5 h-5' />
              </div>
              <span className='bg-background px-2 py-1 border border-border rounded-md font-mono text-[10px] text-muted-foreground uppercase tracking-widest'>
                01
              </span>
            </div>
            <h3 className='mb-3 font-serif text-foreground text-2xl'>Bullet Journaling</h3>
            <p className='font-sans text-muted-foreground text-sm leading-relaxed grow'>
              Quickly log completed tasks and mood. Jot down next-day ideas without the overhead of heavy calendars. Focus on clarity.
            </p>
          </div>

          {/* Feature 2 */}
          <div className='group flex flex-col bg-card hover:bg-secondary hover:shadow-sm p-6 border border-border hover:border-foreground/20 rounded-xl h-full transition-all duration-300'>
            <div className='flex justify-between items-center mb-6'>
              <div className='flex justify-center items-center bg-secondary border border-border rounded-lg w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300'>
                <Coins className='w-5 h-5' />
              </div>
              <span className='bg-background px-2 py-1 border border-border rounded-md font-mono text-[10px] text-muted-foreground uppercase tracking-widest'>
                02
              </span>
            </div>
            <h3 className='mb-3 font-serif text-foreground text-2xl'>Micro Ledger</h3>
            <p className='font-sans text-muted-foreground text-sm leading-relaxed grow'>
              Log expenses instantly. Maintain a visual balance of your daily cash buffer and recurring subscriptions without convoluted spreadsheets.
            </p>
          </div>

          {/* Feature 3 */}
          <div className='group flex flex-col bg-card hover:bg-secondary hover:shadow-sm p-6 border border-border hover:border-foreground/20 rounded-xl h-full transition-all duration-300'>
            <div className='flex justify-between items-center mb-6'>
              <div className='flex justify-center items-center bg-secondary border border-border rounded-lg w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300'>
                <Activity className='w-5 h-5' />
              </div>
              <span className='bg-background px-2 py-1 border border-border rounded-md font-mono text-[10px] text-muted-foreground uppercase tracking-widest'>
                03
              </span>
            </div>
            <h3 className='mb-3 font-serif text-foreground text-2xl'>Systemic Sync</h3>
            <p className='font-sans text-muted-foreground text-sm leading-relaxed grow'>
              Align calendar events directly with costs. Discover how your schedule affects your spending habits with minimal data entry.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
