'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Brain,
  ArrowRight,
  Mail,
  Calendar,
  Sparkles,
  Loader2
} from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@myelin/ui'
import { supabase, isSupabaseConfigured } from '@myelin/core'
import { LS_KEYS } from '@myelin/core'
import { GoogleIcon } from '@/components/icons/google-icon'
import { useUserSession } from '@/hooks/useUserSession'

export default function AuthPage () {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  // Sign In States
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')

  // Sign Up States (Multi-step)
  const [signUpName, setSignUpName] = useState('')
  const [signUpEmail, setSignUpEmail] = useState('')
  const [signUpPassword, setSignUpPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isGoogleSignUp, setIsGoogleSignUp] = useState(false)

  const [successMessage, setSuccessMessage] = useState('')
  const {emailPermission, calendarPermission, currency, theme} = useUserSession();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    if (!signInEmail || !signInPassword) {
      setErrorMessage('Please enter both email and password.')
      return
    }
    setErrorMessage('')
    setIsAuthLoading(true)

    if (isSupabaseConfigured && supabase) {
      try {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: signInEmail,
          password: signInPassword
        })
        if (error) {
          setErrorMessage(error.message)
          setIsAuthLoading(false)
          return
        }

        // Call backend to sync / create user session
        const res = await fetch('/api/user/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: signInEmail })
        })

        if (res.ok) {
          router.push('/dashboard')
        } else {
          setErrorMessage('Failed to load user profile.')
          setIsAuthLoading(false)
        }
      } catch (err: any) {
        setErrorMessage(err.message)
        setIsAuthLoading(false)
      }
    } else {
      // Local fallback without mock emails
      try {
        const res = await fetch('/api/user/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: signInEmail, password: signInPassword })
        })

        if (res.ok) {
          const userData = await res.json()
          // Store in LS
          localStorage.setItem(LS_KEYS.ONBOARDED, 'true')
          localStorage.setItem(LS_KEYS.USER_EMAIL, userData.user.email)
          localStorage.setItem(LS_KEYS.USER_NAME, userData.user.name)
          router.push('/dashboard')
        } else {
          setErrorMessage('Invalid credentials or user does not exist.')
          setIsAuthLoading(false)
        }
      } catch (err: any) {
        setErrorMessage('An error occurred while signing in locally.')
        setIsAuthLoading(false)
      }
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setErrorMessage('Please fill in all profile fields.')
      return
    }
    if (signUpPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match!')
      return
    }
    setErrorMessage('')
    setSuccessMessage('')

    if (isSupabaseConfigured && supabase) {
      setIsAuthLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            full_name: signUpName
          }
        }
      })

      if (error) {
        setErrorMessage(error.message)
        setIsAuthLoading(false)
        return
      }

      if (data?.user && data.session === null) {
        setSuccessMessage('Registration successful! Please check your email inbox to confirm your account before signing in.')
        setIsAuthLoading(false)
        return
      }
    }

    await handleFinalizeCalibration()
  }

  const handleAuthorizeAndConnect = async () => {
    setIsAuthLoading(true)
    if (isSupabaseConfigured && supabase) {
      const scopes: string[] = []
      if (emailPermission)
        scopes.push('https://www.googleapis.com/auth/gmail.readonly')
      if (calendarPermission)
        scopes.push('https://www.googleapis.com/auth/calendar.events')

      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            scopes: scopes.join(' '),
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) {
          setErrorMessage(
            `Supabase Google Authentication failed: ${error.message}`
          )
          setIsAuthLoading(false)
        }
      } catch (err: any) {
        setErrorMessage(`Authentication Error: ${err.message}`)
        setIsAuthLoading(false)
      }
    } else {
      // Sandbox fallback mode - skip real OAuth
      setTimeout(() => {
        setIsAuthLoading(false)
      }, 1000)
    }
  }

  const handleFinalizeCalibration = async () => {
    setIsAuthLoading(true)

    // Save locally
    localStorage.setItem(LS_KEYS.ONBOARDED, 'true')
    localStorage.setItem(LS_KEYS.USER_NAME, signUpName)
    localStorage.setItem(LS_KEYS.USER_EMAIL, signUpEmail)
    localStorage.setItem(LS_KEYS.CURRENCY, currency)
    localStorage.setItem(
      LS_KEYS.EMAIL_PERMISSION,
      emailPermission ? 'true' : 'false'
    )
    localStorage.setItem(
      LS_KEYS.CALENDAR_PERMISSION,
      calendarPermission ? 'true' : 'false'
    )
    if (isGoogleSignUp) {
      localStorage.setItem(LS_KEYS.GOOGLE_CONNECTED, 'true')
      localStorage.setItem(LS_KEYS.GOOGLE_EMAIL, signUpEmail)
      localStorage.setItem(LS_KEYS.GOOGLE_NAME, signUpName)
    }

    if (theme === 'light') {
      document.documentElement.classList.add('light')
      localStorage.setItem(LS_KEYS.THEME, 'light')
    } else {
      document.documentElement.classList.remove('light')
      localStorage.setItem(LS_KEYS.THEME, 'dark')
    }

    // Sync to PostgreSQL backend
    try {
      await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName,
          email: signUpEmail,
          currency,
          theme,
          emailPermission,
          calendarPermission
        })
      })
    } catch (e) {
      console.warn(
        'DB synchronization deferred. Running on local client cache.',
        e
      )
    }

    setIsAuthLoading(false)
    router.push('/dashboard')
  }

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true)
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            scopes: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.events',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            redirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) {
          setErrorMessage(error.message)
          setIsAuthLoading(false)
        }
      } catch (err: any) {
        setErrorMessage(err.message)
        setIsAuthLoading(false)
      }
    } else {
      setErrorMessage('Google Auth is not configured locally.')
      setIsAuthLoading(false)
    }
  }

  return (
    <div className='relative flex flex-col justify-start items-center bg-background p-4 pt-[15vh] min-h-screen overflow-hidden text-foreground select-none'>
      {/* Background neon blur lights */}
      <div className='-top-24 -right-24 absolute bg-primary/10 blur-[120px] rounded-full w-60 h-60 pointer-events-none' />
      <div className='-bottom-24 -left-24 absolute bg-secondary/10 blur-[120px] rounded-full w-60 h-60 pointer-events-none' />

      <Tabs
        defaultValue='signin'
        className='z-10 flex flex-col w-full max-w-sm'
      >
        <TabsList className='grid grid-cols-2 bg-card/65 backdrop-blur-md border border-border rounded-xl w-full h-10'>
          <TabsTrigger
            value='signin'
            className='data-[state=active]:bg-primary data-[state=active]:shadow-md rounded-lg font-mono font-bold text-muted-foreground data-[state=active]:text-primary-foreground text-xs uppercase tracking-wider transition-all'
            onClick={() => setErrorMessage('')}
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger
            value='signup'
            className='data-[state=active]:bg-primary data-[state=active]:shadow-md rounded-lg font-mono font-bold text-muted-foreground data-[state=active]:text-primary-foreground text-xs uppercase tracking-wider transition-all'
            onClick={() => {
              setErrorMessage('')
            }}
          >
            Sign Up
          </TabsTrigger>
        </TabsList>

        <div className='z-10 flex flex-col justify-center gap-3 mt-1 w-full max-w-sm'>
          <Button
            type='button'
            variant='outline'
            size='lg'
            onClick={handleGoogleSignIn}
            disabled={isAuthLoading}
            className='py-2 rounded-md w-full'
          >
            <GoogleIcon size={16} />
            Continue with Google
          </Button>
          <div className='flex items-center gap-3 font-mono font-bold text-[9px] text-muted-foreground/40 uppercase'>
            <div className='flex-1 bg-border h-px' />
            <span>Or Create your credentials</span>
            <div className='flex-1 bg-border h-px' />
          </div>
        </div>

        <TabsContent value='signin' className='outline-none'>
          <Card className='relative bg-card/65 p-5 border dark:border border-border rounded-3xl w-full max-w-sm overflow-hidden transition-all duration-300'>
            <CardHeader className='pb-4'>
              <CardTitle className='font-extrabold text-2xl tracking-tight'>
                Sign In.
              </CardTitle>
              <CardDescription className='text-xs'>
                Load your calibrated ledger workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-6'>
              {errorMessage && (
                <div className='bg-red-500/5 p-2 border border-red-500/20 rounded-md font-mono text-red-500 text-xs leading-relaxed'>
                  {errorMessage}
                </div>
              )}
              <form onSubmit={handleSignIn} className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1.5'>
                  <label className='font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                    Email Address
                  </label>
                  <input
                    type='email'
                    placeholder='name@example.com'
                    value={signInEmail}
                    onChange={e => setSignInEmail(e.target.value)}
                    className='bg-background px-4 py-2.5 border border-border focus:border-primary/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 w-full text-foreground text-xs transition-all'
                    required
                  />
                </div>
                <div className='flex flex-col gap-1.5'>
                  <label className='font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                    Password
                  </label>
                  <input
                    type='password'
                    placeholder='p@ssw0rd'
                    value={signInPassword}
                    onChange={e => setSignInPassword(e.target.value)}
                    className='bg-background px-4 py-2.5 border border-border focus:border-primary/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 w-full text-foreground text-xs transition-all'
                    required
                  />
                </div>
                <Button
                  type='submit'
                  variant='default'
                  disabled={isAuthLoading}
                  className='mt-2 py-2 rounded-md w-full'
                  size='lg'
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className='mr-2 w-4 h-4 animate-spin' />{' '}
                      Validating Session...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight className='ml-1 w-3.5 h-3.5' />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='signup' className='outline-none'>
          <Card className='relative bg-card/65 mt-4 p-5 border dark:border border-border rounded-3xl w-full max-w-sm overflow-hidden transition-all duration-300'>
            <CardHeader className='pb-4'>
              <CardTitle className='font-extrabold text-2xl tracking-tight'>
                Sign Up.
              </CardTitle>
              <CardDescription className='text-xs'>
                Initialize your cognitive database profile.
              </CardDescription>
            </CardHeader>
            <CardContent className='flex flex-col gap-6'>
              {errorMessage && (
                <div className='bg-red-500/5 p-2 border border-red-500/20 rounded-md font-mono text-red-500 text-sm leading-relaxed'>
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className='bg-green-500/5 p-2 border border-green-500/20 rounded-md font-sans text-green-500 text-sm leading-relaxed'>
                  {successMessage}
                </div>
              )}

              <div className='flex flex-col justify-center py-2'>
                <div className='flex flex-col gap-4 animate-fadeIn'>
                  <form
                    onSubmit={handleEmailSignUp}
                    className='flex flex-col gap-3.5'
                  >
                    <div className='flex flex-col gap-1'>
                      <label className='font-mono font-bold text-[9px] text-muted-foreground uppercase tracking-wider'>
                        Display Name
                      </label>
                      <input
                        type='text'
                        placeholder='e.g. Neeraaj'
                        value={signUpName}
                        onChange={e => setSignUpName(e.target.value)}
                        className='bg-background px-4 py-2 border border-border focus:border-primary/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 w-full text-foreground text-xs transition-all'
                        required
                      />
                    </div>
                    <div className='flex flex-col gap-1'>
                      <label className='font-mono font-bold text-[9px] text-muted-foreground uppercase tracking-wider'>
                        Email Address
                      </label>
                      <input
                        type='email'
                        placeholder='name@example.com'
                        value={signUpEmail}
                        onChange={e => setSignUpEmail(e.target.value)}
                        className='bg-background px-4 py-2 border border-border focus:border-primary/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 w-full text-foreground text-xs transition-all'
                        required
                      />
                    </div>
                    <div className='gap-3.5 grid grid-cols-1'>
                      <div className='flex flex-col gap-1'>
                        <label className='font-mono font-bold text-[9px] text-muted-foreground uppercase tracking-wider'>
                          Password
                        </label>
                        <input
                          type='password'
                          placeholder='••••••••'
                          value={signUpPassword}
                          onChange={e => setSignUpPassword(e.target.value)}
                          className='bg-background px-4 py-2 border border-border focus:border-primary/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 w-full text-foreground text-xs transition-all'
                          required
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <label className='font-mono font-bold text-[9px] text-muted-foreground uppercase tracking-wider'>
                          Confirm Password
                        </label>
                        <input
                          type='password'
                          placeholder='••••••••'
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className='bg-background px-4 py-2 border border-border focus:border-primary/50 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/20 w-full text-foreground text-xs transition-all'
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type='submit'
                      disabled={isAuthLoading}
                      className='mt-2 py-2 rounded-md w-full'
                      size='lg'
                    >
                      {isAuthLoading ? (
                        <>
                          <Loader2 className='mr-2 w-4 h-4 animate-spin' />{' '}
                          Initializing...
                        </>
                      ) : (
                        <>
                          Create Account{' '}
                          <ArrowRight className='ml-1 w-3.5 h-3.5' />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
