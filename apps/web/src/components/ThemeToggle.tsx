'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@myelin/ui'
import { useUserSession } from '@/hooks/useUserSession'

export function ThemeToggle () {
  const { theme, handleToggleTheme } = useUserSession()

  return (
    <div className='group flex items-center gap-2.5'>
      <Button
        onClick={handleToggleTheme}
        className='flex justify-center items-center bg-muted hover:bg-accent shadow-lg shadow-primary/20 p-2 border border-border rounded-md w-8 h-8 text-muted-foreground hover:text-foreground group-hover:scale-105 transition-all cursor-pointer'
        title={
          theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'
        }
        aria-label='Toggle Theme'
      >
        {theme === 'light' ? (
          <Moon className='w-4 h-4' />
        ) : (
          <Sun className='w-4 h-4' />
        )}
      </Button>
    </div>
  )
}
