'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@myelin/ui'
import { useUserSession } from '@/hooks/useUserSession'

export function Hero () {
  const { isLoaded, isOnboarded } = useUserSession();

  return (
    <section className='z-10 relative pt-24 pb-16 w-full overflow-hidden'>
      {/* Centered content container positioned above the canvas */}
      <div className='z-10 relative flex flex-col items-center mx-auto px-6 max-w-4xl text-center animate-fadeIn'>
        {/* Visual Badge */}
        <div className='group inline-flex relative items-center mb-8 p-[1.5px] rounded-full overflow-hidden font-semibold text-primary text-xs animate-float'>
          {/* Slow Revolving Blue Light Border Beam */}
          <div
            className='z-0 absolute inset-[-400%] animate-[spin_10s_linear_infinite] pointer-events-none'
            style={{
              background:
                'conic-gradient(from 0deg, transparent 65%, #00c3eb 88%, transparent 100%)'
            }}
          />

          {/* Inner content */}
          <div className='inline-flex z-10 relative items-center gap-1.5 bg-background/95 backdrop-blur-md px-3 py-1 rounded-full w-full h-full'>
            <div className='absolute inset-0 bg-primary/10 rounded-full' />
            <Sparkles className='relative w-3.5 h-3.5 group-hover:text-amber-300 transition-colors' />
            <span className='relative'>Modular Cross-Platform Suite</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className='mb-2 font-serif font-extrabold text-foreground text-4xl sm:text-6xl italic leading-[1.1] tracking-wide'>
          Clarity for your <br />
          <span className='bg-clip-text bg-linear-to-r from-primary/90 to-primary/50 text-transparent'>
            mind and money.
          </span>
        </h1>

        {/* Minimal Subtitle */}
        <p className='mb-10 max-w-lg font-sans text-muted-foreground text-sm sm:text-base leading-relaxed'>
          A unified, lightning-fast workspace to journal your thoughts,
          brainstorm ideas, and track every penny with ease.
        </p>

        {/* Get Started Button */}
        <div className='flex sm:flex-row flex-col justify-center items-center gap-4'>
          <Button
            asChild
            variant='outline'
            className='rounded-md cursor-pointer'
          >
            <Link href={isLoaded && isOnboarded ? '/dashboard' : '/signin'}>
              {isLoaded && isOnboarded ? 'Go to Dashboard' : 'Get Started'} <ArrowRight className='w-4 h-4' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
