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
  User
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@myelin/core'
import { LS_KEYS } from '@myelin/core'
import { useUserSession } from '@/hooks/useUserSession'
import { ThemeToggle } from '@/components/ThemeToggle'

interface DashboardHeaderProps {
  userName: string
  theme: 'light' | 'dark'
  currency: string
  onToggleTheme: () => void
  onChangeCurrency: (currency: string) => void
}

export function DashboardHeader ({
  userName,
  theme,
  currency,
  onToggleTheme,
  onChangeCurrency
}: DashboardHeaderProps) {
  const { isOnboarded } = useUserSession()

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
    <header className='top-0 z-50 sticky bg-card/70 backdrop-blur-md border-border border-b w-full'>
      <div className='flex justify-between items-center mx-auto px-6 max-w-6xl h-16'>
        <div className='flex items-center gap-4'>
          <Link href='/' className='group flex items-center gap-2.5'>
            <div className='flex justify-center items-center bg-secondary shadow-lg shadow-primary/20 rounded-lg w-8 h-8 group-hover:scale-105 transition-all'>
              <Brain className='w-4 h-4' />
            </div>
            <span className='font-mono font-bold text-foreground text-lg tracking-tight'>
              Myelin.
            </span>
          </Link>
          <span className='font-light text-zinc-700'>|</span>
          <span className='font-semibold text-muted-foreground text-xs'>
            Welcome back,{' '}
            <span className='font-mono text-primary'>{userName}</span>
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <ThemeToggle />

          {/* Currency Select */}
          <div className='flex justify-center items-center bg-muted hover:bg-accent px-3 py-2 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer'>
            <span className='font-bold text-xs tracking-wider'>
              Currency
            </span>
            <select
              value={currency}
              onChange={e => onChangeCurrency(e.target.value)}
              className='bg-transparent p-0 border-0 focus:outline-none focus:ring-0 font-semibold text-zinc-500 dark:text-zinc-300 text-xs cursor-pointer select-none'
            >
              <option value='USD' className='bg-panel-bg text-foreground'>
                USD ($)
              </option>
              <option value='INR' className='bg-panel-bg text-foreground'>
                INR (₹)
              </option>
              <option value='EUR' className='bg-panel-bg text-foreground'>
                EUR (€)
              </option>
              <option value='THB' className='bg-panel-bg text-foreground'>
                THB (฿)
              </option>
              <option value='JPY' className='bg-panel-bg text-foreground'>
                JPY (¥)
              </option>
              <option value='GBP' className='bg-panel-bg text-foreground'>
                GBP (£)
              </option>
            </select>
          </div>

          {/* User Specific Settings Cog */}
          {isOnboarded ? (
            <div className='group relative'>
              <button className='flex items-center gap-2 bg-muted hover:bg-accent px-3 py-1 border border-border rounded-lg transition-all cursor-pointer'>
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
                  href='/settings'
                  className='flex items-center gap-2 hover:bg-muted px-4 py-2 rounded-t-xl text-muted-foreground hover:text-foreground text-xs transition-color'
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
                className='px-3 py-2 font-semibold text-muted-foreground hover:text-foreground text-xs transition-all cursor-pointer'
              >
                Sign In
              </Link>
              <Link
                href='/signin'
                className='bg-primary hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-primary-foreground text-sm transition-colors cursor-pointer'
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
