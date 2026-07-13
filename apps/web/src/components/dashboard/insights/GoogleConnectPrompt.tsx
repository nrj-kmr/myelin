'use client'

import React from 'react'
import { Lock } from 'lucide-react'

export function GoogleConnectPrompt() {
  const handleGoogleConnect = () => {
    window.location.href = '/api/auth/google'
  }

  return (
    <div className='z-10 flex flex-col flex-1 justify-center items-center gap-3 bg-muted/30 px-6 border border-border border-dashed rounded-md min-h-50 text-center'>
      <div className='flex justify-center items-center bg-background/50 shadow-inner backdrop-blur-sm rounded-full w-12 h-12 text-muted-foreground'>
        <Lock className='w-5 h-5' />
      </div>
      <p className='font-mono font-medium text-foreground text-sm tracking-tight'>
        Connect Google Account
      </p>
      <p className='text-muted-foreground text-xs'>
        Securely authorize Gmail and Calendar access to receive AI-powered
        daily briefs and schedule management.
      </p>
      <button
        onClick={handleGoogleConnect}
        className='bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-md font-mono font-bold text-primary text-xs transition-colors'
      >
        Authorize Google
      </button>
    </div>
  )
}
