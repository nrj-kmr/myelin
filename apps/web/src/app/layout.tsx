import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import { Inter, Newsreader, Geist_Mono } from 'next/font/google'
import { cn } from '@myelin/core'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans'
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif'
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono'
})

export const metadata: Metadata = {
  title: 'Myelin | Speed Up Your Time & Money Management',
  description:
    'Myelin is a beautiful digital journal and expense ledger designed to optimize your two most valuable resources: time and money. Join the waitlist today.',
  keywords: [
    'journaling',
    'budgeting',
    'personal finance',
    'time tracking',
    'ideas journal',
    'myelin app'
  ]
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn('font-sans', inter.variable, newsreader.variable, geistMono.variable)}
    >
      <head>
        <link rel='icon' href='/logo.svg' type='image/svg+xml' />
        <Script id='theme-script'>
          {`
            try {
              if (localStorage.getItem('myelin_theme') === 'light') {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
              } else {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
              }
            } catch (_) {}
          `}
        </Script>
      </head>
      <body className='antialiased bg-background text-foreground'>{children}</body>
    </html>
  )
}
