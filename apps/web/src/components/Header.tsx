'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Brain,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  LayoutDashboard
} from 'lucide-react'
import { useUserSession } from '@/hooks/useUserSession'
import { ThemeToggle } from '@/components/ThemeToggle'
import { supabase, isSupabaseConfigured, LS_KEYS } from '@myelin/core'

export function Header () {
  const router = useRouter()
  const { isOnboarded, userName } = useUserSession()

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      const keysToRemove = [
        LS_KEYS.ONBOARDED,
        LS_KEYS.USER_NAME,
        LS_KEYS.USER_EMAIL,
        LS_KEYS.CURRENCY,
        LS_KEYS.EMAIL_PERMISSION,
        LS_KEYS.CALENDAR_PERMISSION,
        LS_KEYS.GOOGLE_CONNECTED,
        LS_KEYS.GOOGLE_EMAIL,
        LS_KEYS.GOOGLE_NAME
      ]
      keysToRemove.forEach(key => localStorage.removeItem(key))

      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut()
      }

      window.location.reload()
    }
  }

  return (
    <header className='top-0 z-50 sticky bg-card/70 backdrop-blur-md border-border border-b w-full transition-all duration-300'>
      <div className='flex justify-between items-center mx-auto px-6 max-w-6xl h-16'>
        <Link href='/' className='group flex items-center gap-2.5'>
          <div className='flex justify-center items-center bg-secondary shadow-lg shadow-primary/20 rounded-lg w-8 h-8 group-hover:scale-105 transition-all'>
            <Brain className='w-4 h-4' />
          </div>
          <span className='font-mono font-bold text-foreground text-lg tracking-tight'>
            Myelin.
          </span>
        </Link>

        <nav className='hidden sm:flex items-center gap-8 font-medium text-muted-foreground text-xs uppercase tracking-wide'>
          <a
            href='#features'
            className='hover:text-foreground transition-colors'
          >
            Features
          </a>
          <Link
            href='/dashboard'
            className='hover:text-foreground transition-colors'
          >
            Dashboard
          </Link>
        </nav>

        <div className='flex items-center gap-3'>
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Conditional Auth Actions */}
          {isOnboarded ? (
            <div className='group relative'>
              <button className='flex items-center gap-2 bg-muted hover:bg-accent px-3 py-1 border border-border rounded-md hover:scale-105 transition-all cursor-pointer'>
                <span className='font-mono font-semibold text-foreground text-xs'>
                  {userName || 'User'}
                </span>
                <div className='flex justify-center items-center bg-primary/20 rounded-full w-6 h-6 text-primary'>
                  <User className='w-3 h-3' />
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className='invisible group-hover:visible top-full right-0 z-50 absolute flex flex-col bg-card opacity-0 group-hover:opacity-100 shadow-xl mt-2 border border-border rounded-xl w-48 scale-95 group-hover:scale-100 origin-top-right transition-all duration-200 transform'>
                <Link
                  href='/dashboard'
                  className='flex items-center gap-2 hover:bg-muted px-4 py-2 rounded-t-xl text-muted-foreground hover:text-foreground text-xs transition-colors'
                >
                  <LayoutDashboard className='w-3.5 h-3.5' /> Dashboard
                </Link>
                <Link
                  href='/settings'
                  className='flex items-center gap-2 hover:bg-muted px-4 py-2 text-muted-foreground hover:text-foreground text-xs transition-colors'
                >
                  <Settings className='w-3.5 h-3.5' /> Settings
                </Link>
                <div className='border-border border-t' />
                <button
                  onClick={handleSignOut}
                  className='flex items-center gap-2 hover:bg-red-500/10 px-4 py-2 rounded-b-xl w-full text-red-500 text-xs text-left transition-colors'
                >
                  <LogOut className='w-3.5 h-3.5' /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                href='/signin'
                className='bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-lg font-medium text-primary-foreground text-sm hover:scale-105 transition-all cursor-pointer'
              >
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
