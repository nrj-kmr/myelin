import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google'
import { cn } from '@myelin/core'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading'
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans'
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
      className={cn('font-sans', plusJakartaSans.variable, outfit.variable)}
    >
      <head>
        <link rel='icon' href='/favicon.ico' sizes='any' />
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
      <body className='antialiased'>{children}</body>
    </html>
  )
}
