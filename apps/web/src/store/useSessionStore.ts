import { create } from 'zustand'
import { supabase, isSupabaseConfigured, UserSessionData, LS_KEYS } from '@myelin/core'

interface SessionState {
  isLoaded: boolean
  isOnboarded: boolean
  userName: string
  userEmail: string
  currency: string
  theme: 'light' | 'dark'
  emailPermission: boolean
  calendarPermission: boolean

  // Actions
  initSession: () => Promise<void>
  toggleTheme: () => void
  setCurrency: (currency: string) => void
  grantPermission: (type: 'email' | 'calendar') => void
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isLoaded: false,
  isOnboarded: false,
  userName: '',
  userEmail: '',
  currency: 'USD',
  theme: 'dark',
  emailPermission: false,
  calendarPermission: false,

  initSession: async () => {
    // Already loaded? skip
    if (get().isLoaded) return

    const savedTheme = typeof window !== 'undefined' && document.documentElement.classList.contains('light') ? 'light' : 'dark'
    set({ theme: savedTheme })

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const user = session.user
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Google User'
          const email = user.email || ''

          if (user.app_metadata?.provider === 'google' || user.app_metadata?.providers?.includes('google')) {
            localStorage.setItem(LS_KEYS.GOOGLE_CONNECTED, 'true')
            localStorage.setItem(LS_KEYS.GOOGLE_EMAIL, email)
            localStorage.setItem(LS_KEYS.GOOGLE_NAME, name)
          }

          try {
            const userRes = await fetch('/api/user/signin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            })
            
            if (userRes.ok) {
              const userData = await userRes.json()
              const dbUser = userData.user as UserSessionData
              set({
                isOnboarded: true,
                userName: dbUser.name,
                userEmail: dbUser.email,
                currency: dbUser.currency,
                emailPermission: dbUser.emailPermission,
                calendarPermission: dbUser.calendarPermission,
                isLoaded: true
              })
              
              localStorage.setItem(LS_KEYS.ONBOARDED, 'true')
              localStorage.setItem(LS_KEYS.USER_NAME, dbUser.name)
              localStorage.setItem(LS_KEYS.USER_EMAIL, dbUser.email)
              localStorage.setItem(LS_KEYS.CURRENCY, dbUser.currency)
              localStorage.setItem(LS_KEYS.EMAIL_PERMISSION, dbUser.emailPermission ? 'true' : 'false')
              localStorage.setItem(LS_KEYS.CALENDAR_PERMISSION, dbUser.calendarPermission ? 'true' : 'false')
              return
            }
          } catch (err) {
            console.warn('DB user check failed, using session defaults:', err)
          }

          // Fallback
          set({
            isOnboarded: true,
            userName: name,
            userEmail: email,
            currency: 'USD',
            theme: savedTheme,
            emailPermission: true,
            calendarPermission: true,
            isLoaded: true
          })
          
          localStorage.setItem(LS_KEYS.ONBOARDED, 'true')
          localStorage.setItem(LS_KEYS.USER_NAME, name)
          localStorage.setItem(LS_KEYS.USER_EMAIL, email)
          localStorage.setItem(LS_KEYS.CURRENCY, 'USD')
          localStorage.setItem(LS_KEYS.EMAIL_PERMISSION, 'true')
          localStorage.setItem(LS_KEYS.CALENDAR_PERMISSION, 'true')
          return
        }
      } catch (e) {
        console.warn('Supabase session verification failed, falling back to local storage.', e)
      }
    }

    // Local storage fallback
    const savedOnboarded = localStorage.getItem(LS_KEYS.ONBOARDED) === 'true'
    set({ isOnboarded: savedOnboarded })
    
    if (savedOnboarded) {
      const emailVal = localStorage.getItem(LS_KEYS.USER_EMAIL) || ''
      const emailPrefix = emailVal.split('@')[0] || ''
      const formattedFallback = emailPrefix.replace(/[\._\+\-\s]+/g, ' ').trim().split(/\s+/).join('_').toLowerCase()
      
      set({
        userName: localStorage.getItem(LS_KEYS.USER_NAME) || formattedFallback || 'user',
        userEmail: emailVal,
        currency: localStorage.getItem(LS_KEYS.CURRENCY) || 'USD',
        theme: savedTheme,
        emailPermission: localStorage.getItem(LS_KEYS.EMAIL_PERMISSION) === 'true',
        calendarPermission: localStorage.getItem(LS_KEYS.CALENDAR_PERMISSION) === 'true',
        isOnboarded: true
      })
    }
    set({ isLoaded: true })
  },

  toggleTheme: () => {
    const state = get()
    const targetTheme = state.theme === 'light' ? 'dark' : 'light'
    
    if (targetTheme === 'dark') {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
      localStorage.setItem(LS_KEYS.THEME, 'dark')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      localStorage.setItem(LS_KEYS.THEME, 'light')
    }
    
    set({ theme: targetTheme })

    if (state.userEmail) {
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.userEmail, theme: targetTheme }),
      }).catch((e) => console.warn('Theme DB sync deferred:', e))
    }
  },

  setCurrency: (newCurrency: string) => {
    const state = get()
    set({ currency: newCurrency })
    localStorage.setItem(LS_KEYS.CURRENCY, newCurrency)
    
    if (state.userEmail) {
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.userEmail, currency: newCurrency }),
      }).catch((err) => console.warn('Currency DB sync deferred:', err))
    }
  },

  grantPermission: (type: 'email' | 'calendar') => {
    const state = get()
    const isEmail = type === 'email'
    
    if (isEmail) {
      localStorage.setItem(LS_KEYS.EMAIL_PERMISSION, 'true')
      set({ emailPermission: true })
    } else {
      localStorage.setItem(LS_KEYS.CALENDAR_PERMISSION, 'true')
      set({ calendarPermission: true })
    }
    
    if (state.userEmail) {
      fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: state.userEmail, 
          emailPermission: isEmail ? true : state.emailPermission,
          calendarPermission: !isEmail ? true : state.calendarPermission
        }),
      }).catch((e) => console.warn('Scope DB sync deferred:', e))
    }
  }
}))
