import React from 'react'
import Link from 'next/link'
import {
  Brain,
  RefreshCw,
  Sun,
  Moon,
  Settings,
  LogOut,
  LayoutDashboard,
  User,
  ArrowLeft
} from 'lucide-react'
import { supabase, isSupabaseConfigured, LS_KEYS } from '@myelin/core'
import { useUserSession } from '@/hooks/useUserSession'
import { useSessionStore } from '@/store/useSessionStore'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useState } from 'react'

interface DashboardHeaderProps {
  userName: string
  userEmail: string
  theme: 'light' | 'dark'
  currency: string
  onToggleTheme: () => void
  onChangeCurrency: (currency: string) => void
  backLink?: { label: string, href: string }
}

export function DashboardHeader ({
  userName,
  theme,
  currency,
  onToggleTheme,
  onChangeCurrency,
  backLink
}: DashboardHeaderProps) {
  const { isOnboarded } = useUserSession()
  const { avatarUrl, initSession } = useSessionStore()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  React.useEffect(() => {
    initSession()
  }, [initSession])

  const handleSignOut = async () => {
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

      window.location.href = '/'
  }

  return (
    <header className='top-0 z-50 sticky bg-card/70 backdrop-blur-md border-border border-b w-full'>
      <div className='flex justify-between items-center mx-auto px-4 md:px-6 max-w-[1600px] h-16'>
        <div className='flex items-center gap-4'>
          {backLink && (
            <>
              <Link
                href={backLink.href}
                className='flex items-center gap-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/5 p-2 rounded-md font-mono font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400 text-xs uppercase tracking-wider transition-all cursor-pointer'
              >
                <ArrowLeft className='w-4 h-4' /> {backLink.label}
              </Link>
              <span className='hidden sm:inline font-light text-zinc-700'>|</span>
            </>
          )}
          <Link href='/' className='group flex items-center gap-2.5'>
            <div className='flex justify-center items-center bg-secondary shadow-lg shadow-primary/20 rounded-lg w-8 h-8 group-hover:scale-105 transition-all'>
              <Brain className='w-4 h-4' />
            </div>
            <span className='font-mono font-bold text-foreground text-lg tracking-tight'>
              Myelin.
            </span>
          </Link>
          <span className='hidden sm:inline font-light text-zinc-700'>|</span>
          <span className='hidden sm:inline-flex font-semibold text-muted-foreground text-xs'>
            Welcome back,{' '}
            <span className='font-mono text-primary'>{userName}</span>
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <ThemeToggle />

          {/* User Specific Settings Cog */}
          {isOnboarded ? (
            <div
              className='group relative'
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className='flex items-center gap-2 bg-muted hover:bg-accent px-3 py-1 border border-border rounded-md hover:scale-105 transition-all cursor-pointer'
              >
                <span className='hidden sm:inline font-mono font-semibold text-foreground text-xs'>
                  {userName || 'User'}
                </span>
                <div className='flex justify-center items-center bg-primary/20 rounded-full w-6 h-6 overflow-hidden text-primary'>
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className='w-3 h-3' />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              <div
                className={`top-full right-0 z-50 absolute flex flex-col bg-card shadow-xl mt-2 border border-border rounded-md w-48 origin-top-right transition-all duration-200 transform
                  invisible group-hover:visible group-hover:opacity-100 group-hover:scale-100
                  ${isUserMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95'}
                `}
              >
                <Link
                  href='/settings'
                  onClick={() => setIsUserMenuOpen(false)}
                  className='flex items-center gap-2 hover:bg-muted px-4 py-2.5 rounded-t-md text-muted-foreground hover:text-foreground text-xs transition-color'
                >
                  <Settings className='w-3.5 h-3.5' /> Settings
                </Link>
                <div className='border-border border-t' />
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to sign out?')) {
                      handleSignOut()
                    }
                  }}
                  className='flex items-center gap-2 hover:bg-red-500/10 px-4 py-2.5 rounded-b-md w-full text-red-500 text-xs text-left transition-colors'
                >
                  <LogOut className='w-3.5 h-3.5' /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link
                href='/signin'
                className='bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md font-medium text-primary-foreground text-sm hover:scale-105 transition-all cursor-pointer'
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
