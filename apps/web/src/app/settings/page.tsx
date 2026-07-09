'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  Key,
  Mail,
  Coins,
  User,
  ShieldCheck,
  LogOut
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@myelin/core'
import { useUserSession } from '@/hooks/useUserSession'
import { Button } from '@myelin/ui'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function SettingsPage () {
  const router = useRouter()
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Profile States
  const [password, setPassword] = useState('')
  const [hasDbPassword, setHasDbPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Google Integration States
  const [googleConnected, setGoogleConnected] = useState(false)

  const {
    isLoaded: isSessionLoaded,
    theme,
    handleToggleTheme,
    userName: sessionName,
    userEmail: email,
    currency: sessionCurrency,
    emailPermission: sessionEmailPermission,
    calendarPermission: sessionCalendarPermission
  } = useUserSession()

  // Local Editable Form States
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [emailPermission, setEmailPermission] = useState(false)
  const [calendarPermission, setCalendarPermission] = useState(false)

  // Extra states not in useUserSession
  const [isExtraLoaded, setIsExtraLoaded] = useState(false)

  // Sync session state to local form state
  useEffect(() => {
    if (isSessionLoaded) {
      setName(sessionName)
      setCurrency(sessionCurrency)
      setEmailPermission(sessionEmailPermission)
      setCalendarPermission(sessionCalendarPermission)
    }
  }, [isSessionLoaded, sessionName, sessionCurrency, sessionEmailPermission, sessionCalendarPermission])

  useEffect(() => {
    const loadExtraPreferences = async () => {
      if (!isSessionLoaded) return

      let isGoogle = false
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          isGoogle = session?.user?.app_metadata?.provider === 'google'
        } catch (e) {
          console.warn('Failed to check Google session:', e)
        }
      } else {
        isGoogle = localStorage.getItem('myelin_google_connected') === 'true'
      }
      setGoogleConnected(isGoogle)

      if (email) {
        try {
          const res = await fetch('/api/user/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })

          if (res.ok) {
            const data = await res.json()
            setHasDbPassword(!!data.user.password)
          }
        } catch (err) {
          console.warn('Failed to fetch extra preferences from Postgres:', err)
        }
      }

      setIsExtraLoaded(true)
    }

    loadExtraPreferences()
  }, [isSessionLoaded, email])

  const isLoaded = isSessionLoaded && isExtraLoaded

  const handleGoogleDisconnect = async () => {
    if (
      confirm(
        'Are you sure you want to disconnect your Google integration? This will log you out if you signed in with Google.'
      )
    ) {
      setGoogleConnected(false)

      localStorage.removeItem('myelin_google_connected')
      localStorage.removeItem('myelin_google_email')
      localStorage.removeItem('myelin_google_name')
      localStorage.setItem('myelin_email_permission', 'false')
      localStorage.setItem('myelin_calendar_permission', 'false')

      // Sign out from Supabase client if enabled
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut()
      }

      // Sync disconnect to Postgres
      if (email) {
        try {
          await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              emailPermission: false,
              calendarPermission: false
            })
          })
        } catch (e) {
          console.warn('Google Disconnect DB sync deferred:', e)
        }
      }
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      const keysToRemove = [
        'myelin_onboarded',
        'myelin_user_name',
        'myelin_user_email',
        'myelin_currency',
        'myelin_email_permission',
        'myelin_calendar_permission',
        'myelin_google_connected',
        'myelin_google_email',
        'myelin_google_name'
      ]
      keysToRemove.forEach(key => localStorage.removeItem(key))

      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut()
      }

      router.push('/signin')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword && newPassword !== confirmPassword) {
      alert('New passwords do not match!')
      return
    }

    // Save profile to local storage for speed
    localStorage.setItem('myelin_user_name', name)
    localStorage.setItem('myelin_user_email', email)
    localStorage.setItem('myelin_currency', currency)
    localStorage.setItem(
      'myelin_email_permission',
      emailPermission ? 'true' : 'false'
    )
    localStorage.setItem(
      'myelin_calendar_permission',
      calendarPermission ? 'true' : 'false'
    )

    // Sync profile preferences directly to PostgreSQL
    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          currency,
          theme,
          emailPermission,
          calendarPermission
        })
      })
    } catch (err) {
      console.warn('PostgreSQL preferences sync failed, saved locally.', err)
    }

    if (newPassword) {
      setPassword('••••••••••••')
      setNewPassword('')
      setConfirmPassword('')
    }

    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
    }, 3000)
  }

  return (
    <div className='relative bg-background min-h-screen font-sans text-foreground transition-colors duration-300'>
      {/* Header */}
      <header className='top-0 z-50 sticky bg-card/70 backdrop-blur-md border-border border-b w-full'>
        <div className='flex justify-between items-center mx-auto px-6 max-w-3xl h-16'>
          <div className='flex items-center gap-4'>
            <Link
              href='/dashboard'
              className='flex items-center gap-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/5 p-2 rounded-lg font-mono font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400 text-xs uppercase tracking-wider transition-all cursor-pointer'
            >
              <ArrowLeft className='w-4 h-4' /> Back to Dashboard
            </Link>
            <span className='font-light text-zinc-700'>|</span>
            <span className='font-mono font-bold text-foreground text-sm uppercase tracking-tight'>
              User Settings
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <ThemeToggle />
            <Button
              onClick={handleSignOut}
              className='flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20border border-red-500/10 rounded-lg font-mono font-semibold text-red-500 text-xs transition-all cursor-pointer'
            >
              <LogOut className='w-3.5 h-3.5' /> SIGN OUT
            </Button>
          </div>
        </div>
      </header>

      {/* Main Settings Panel */}
      <main className='mx-auto px-6 py-10 max-w-3xl'>
        {saveSuccess && (
          <div className='flex items-center gap-2 bg-secondary mb-6 p-4 border border-secondary rounded-xl font-mono font-bold text-primary text-xs tracking-wide animate-fadeIn'>
            <Check className='w-4 h-4' /> PREFERENCES_CALIBRATED_SUCCESSFULLY
          </div>
        )}

        <form onSubmit={handleSave} className='flex flex-col gap-8'>
          {/* Profile Section */}
          <div className='flex flex-col gap-4 bg-card/65 shadow-xl backdrop-blur-md p-6 border border-border rounded-2xl'>
            <h2 className='flex items-center gap-2 pb-2 border-border border-b font-mono font-bold text-primary text-xs uppercase tracking-widest'>
              <User className='w-4 h-4' /> 01. Profile Details
            </h2>

            <div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                  Display Name
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className='bg-background px-4 py-2.5 border border-border focus:border-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 w-full text-foreground text-xs transition-all'
                  required
                />
              </div>
              <div className='flex flex-col gap-1.5'>
                <label className='font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={email}
                  disabled
                  className='bg-background/50 px-4 py-2.5 border border-border rounded-xl w-full text-muted-foreground text-xs cursor-not-allowed'
                  required
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className='flex flex-col gap-4 bg-card/65 shadow-xl backdrop-blur-md p-6 border border-border rounded-2xl'>
            <h2 className='flex items-center gap-2 pb-2 border-border border-b font-mono font-bold text-primary text-xs uppercase tracking-widest'>
              <Coins className='w-4 h-4' /> 02. Ledger Preferences
            </h2>

            <div className='flex flex-col gap-1.5 max-w-xs'>
              <label className='font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                Display Currency
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className='bg-background px-4 py-2.5 border border-border focus:border-secondary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/15 w-full text-foreground text-xs transition-all cursor-pointer'
              >
                <option value='USD'>USD ($) - US Dollar</option>
                <option value='INR'>INR (₹) - Indian Rupee</option>
                <option value='EUR'>EUR (€) - Euro</option>
                <option value='THB'>THB (฿) - Thai Baht</option>
                <option value='JPY'>JPY (¥) - Japanese Yen</option>
                <option value='GBP'>GBP (£) - British Pound</option>
              </select>
            </div>
          </div>

          {/* Google Integration Card (only visible if googleConnected is verified) */}
          {googleConnected && (
            <div className='flex flex-col gap-4 bg-card shadow-xl backdrop-blur-md p-6 border border-border rounded-2xl'>
              <h2 className='flex items-center gap-2 pb-2 border-border border-b font-mono font-bold text-primary text-xs uppercase tracking-widest'>
                <Mail className='w-4 h-4' /> 03. Google Integrations
              </h2>

              <div className='flex flex-col gap-4'>
                {/* Connection Status */}
                <div className='flex justify-between items-center bg-secondary/10 p-3.5 border border-secondary/20 rounded-xl'>
                  <div className='flex items-center gap-3'>
                    <div className='flex justify-center items-center bg-secondary rounded-full w-8 h-8 font-bold text-primary text-sm'>
                      {sessionName ? sessionName[0] : 'G'}
                    </div>
                    <div className='flex flex-col'>
                      <span className='font-bold text-primary text-xs'>
                        {sessionName}
                      </span>
                      <span className='font-mono text-[10px] text-primary'>
                        {email}
                      </span>
                    </div>
                  </div>
                  <button
                    type='button'
                    onClick={handleGoogleDisconnect}
                    className='flex items-center gap-1 hover:bg-red-500/10 px-3 py-1.5 border border-transparent hover:border-red-500/20 rounded-lg font-mono font-bold text-[10px] text-red-500 uppercase tracking-wide transition-all cursor-pointer'
                  >
                    <LogOut className='w-3.5 h-3.5' /> Disconnect
                  </button>
                </div>


              </div>
            </div>
          )}

          {/* Password Security Section (only applicable if they registered with credentials) */}
          {!googleConnected && (
            <div className='flex flex-col gap-4 bg-card shadow-xl backdrop-blur-md p-6 border border-border rounded-2xl'>
              <h2 className='flex items-center gap-2 pb-2 border-border border-b font-mono font-bold text-primary text-xs uppercase tracking-widest'>
                <Key className='w-4 h-4' /> 03. Security Configuration
              </h2>

              <div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
                {hasDbPassword && (
                  <>
                    <div className='flex flex-col gap-1.5'>
                      <label className='font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                        Current Password
                      </label>
                      <input
                        type='password'
                        value={password}
                        disabled
                        className='bg-background/50 px-4 py-2.5 border border-border rounded-xl w-full text-muted-foreground/60 text-xs'
                      />
                    </div>
                    <div className='hidden md:flex flex-col gap-1.5' />
                  </>
                )}

                <div className='flex flex-col gap-1.5'>
                  <label className='font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                    New Password
                  </label>
                  <input
                    type='password'
                    placeholder='Enter new password'
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className='bg-background px-4 py-2.5 border border-border focus:border-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 w-full text-foreground text-xs transition-all'
                  />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label className='font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
                    Confirm New Password
                  </label>
                  <input
                    type='password'
                    placeholder='Confirm new password'
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className='bg-background px-4 py-2.5 border border-border focus:border-primary/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 w-full text-foreground text-xs transition-all'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className='flex justify-between items-center pt-4 border-border border-t'>
            <span className='flex items-center gap-1 font-mono text-[10px] text-muted-foreground'>
              <ShieldCheck className='w-3.5 h-3.5' /> Settings Calibrated
              Locally
            </span>

            <div className='flex gap-3'>
              <Link
                href='/dashboard'
                className='bg-muted hover:bg-accent px-6 py-2.5 border border-border rounded-xl font-mono font-bold text-xs text-center tracking-wider transition-all cursor-pointer'
              >
                CANCEL
              </Link>
              <button
                type='submit'
                className='bg-primary hover:opacity-90 shadow-md shadow-primary/25 px-6 py-2.5 rounded-xl font-mono font-bold text-primary-foreground text-xs tracking-wider active:scale-95 transition-all cursor-pointer'
              >
                SAVE PREFERENCES
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
