'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useUserSession } from '@/hooks/useUserSession'

export function Hero () {
  const { isLoaded, isOnboarded } = useUserSession();

  return (
    <section className='relative flex items-center pt-32 pb-20 min-h-screen overflow-hidden'>
      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] opacity-50 bg-size-[16px_16px] pointer-events-none mask-[linear-gradient(to_bottom,white_40%,transparent)]"></div>

      {/* Accent Glow */}
      <div className="top-1/4 left-1/2 absolute bg-primary/10 blur-[120px] rounded-full w-160 h-120 -translate-x-1/2 pointer-events-none mix-blend-screen dark:mix-blend-lighten"></div>

      <div className='z-10 relative flex flex-col items-center mx-auto px-6 w-full max-w-5xl text-center'>

        {/* Top Badge */}
        <div className='slide-in-from-bottom-4 flex items-center gap-3 mb-8 animate-in duration-700 fade-in'>
          <span className='inline-flex items-center bg-accent px-3 py-1 border border-border rounded-md font-mono font-medium text-foreground text-xs uppercase tracking-widest transition-colors'>
            Digital Ledger & Journal
          </span>
        </div>

        {/* Headline */}
        <h1 className='slide-in-from-bottom-6 mb-6 font-serif text-foreground text-5xl md:text-7xl lg:text-8xl text-balance leading-[1.05] tracking-tight animate-in duration-1000 fade-in'>
          Clarity for your <br />
          <span className='bg-clip-text bg-linear-to-r from-primary to-primary/60 text-transparent'>
            mind and money.
          </span>
        </h1>

        {/* Subtitle */}
        <p className='slide-in-from-bottom-6 mb-10 max-w-xl font-sans text-muted-foreground text-lg md:text-xl leading-relaxed animate-in duration-1000 fade-in'>
          A unified, lightning-fast workspace to journal your thoughts, brainstorm ideas, and track every penny with ease. Built for focus.
        </p>

        {/* CTA */}
        <div className='slide-in-from-bottom-6 flex flex-wrap gap-4 animate-in duration-1000 fade-in'>
          <Link
            href={isLoaded && isOnboarded ? '/dashboard' : '/signin'}
            className='group inline-flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm px-6 py-3.5 border border-primary/20 hover:border-primary rounded-md font-mono font-medium text-primary-foreground text-sm transition-all hover:-translate-y-0.5 duration-200'
          >
            <span className='z-10 relative uppercase tracking-wider'>
              {isLoaded && isOnboarded ? 'Go to Dashboard' : 'Start tracking'}
            </span>
            <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-1 duration-300' />
          </Link>
          <a
            href='#features'
            className='group inline-flex items-center gap-2 bg-secondary hover:bg-secondary/80 shadow-sm px-6 py-3.5 border border-border hover:border-foreground/20 rounded-md font-mono font-medium text-foreground text-sm uppercase tracking-wider transition-all hover:-translate-y-0.5 duration-200'
          >
            Learn More
          </a>
        </div>

      </div>
    </section>
  )
}
