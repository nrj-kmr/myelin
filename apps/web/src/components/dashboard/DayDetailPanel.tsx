'use client'

import React, { useState, useEffect } from 'react'
import {
  MessageSquare,
  Calendar as CalIcon,
  Coins,
  Trash2,
  Plus,
  Smile,
  Mic,
  MicOff
} from 'lucide-react'
import { DayLog } from '@myelin/core'

interface DayDetailPanelProps {
  selectedDate: Date
  log?: DayLog
  requestedTab?: 'journal' | 'schedule' | 'ledger'
  onSaveJournal: (dateKey: string, journal: string, mood: string) => void
  onAddEvent: (dateKey: string, title: string, time: string) => void
  onDeleteEvent: (dateKey: string, index: number) => void
  onAddExpense: (dateKey: string, title: string, amount: number) => void
  onDeleteExpense: (dateKey: string, index: number) => void
  currencySymbol?: string
}

export function DayDetailPanel ({
  selectedDate,
  log = {},
  requestedTab,
  onSaveJournal,
  onAddEvent,
  onDeleteEvent,
  onAddExpense,
  onDeleteExpense,
  currencySymbol = '$'
}: DayDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'journal' | 'schedule' | 'ledger'>(
    'journal'
  )

  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab)
    }
  }, [requestedTab])

  useEffect(() => {
    if (activeTab === 'journal') {
      // Small timeout ensures the DOM has rendered the textarea after tab switch
      setTimeout(() => {
        document.getElementById('journal-input')?.focus()
      }, 50)
    }
  }, [activeTab, selectedDate])

  // Local form inputs
  const [journal, setJournal] = useState('')
  const [mood, setMood] = useState('')
  const [eventTitle, setEventTitle] = useState('')
  const [eventTime, setEventTime] = useState('10:00')
  const [expenseTitle, setExpenseTitle] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition()
        rec.continuous = true
        rec.interimResults = false
        rec.lang = 'en-US'

        rec.onstart = () => setIsListening(true)
        rec.onend = () => setIsListening(false)
        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          if (event.error === 'not-allowed') {
            alert(
              'Microphone access blocked. Please allow microphone permissions in your browser settings.'
            )
          } else if (event.error === 'network') {
            alert(
              'Speech recognition network failed. If you are using Brave or Chromium, Web Speech API might be disabled. Try using standard Google Chrome, or check your internet/VPN connection.'
            )
          }
        }
        rec.onresult = (event: any) => {
          const results = event.results
          const text = results[results.length - 1][0].transcript
          if (text) {
            setJournal(prev => (prev ? prev + ' ' + text : text))
          }
        }
        setRecognition(rec)
      } catch (e) {
        console.error('SpeechRecognition initialization failed', e)
      }
    }
  }, [])

  const toggleSpeechInput = () => {
    if (!recognition) {
      alert(
        'Speech recognition is not supported in this browser. Try Google Chrome.'
      )
      return
    }
    if (isListening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  }

  const dateKey = (() => {
    const y = selectedDate.getFullYear()
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const d = String(selectedDate.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })()

  // Synchronize inputs when selectedDate changes
  useEffect(() => {
    setJournal(log?.journal || '')
    setMood(log?.mood || 'neutral')
    setEventTitle('')
    setExpenseTitle('')
    setExpenseAmount('')
  }, [dateKey, log])

  const handleJournalSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSaveJournal(dateKey, journal, mood)
  }

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle.trim()) return
    onAddEvent(dateKey, eventTitle.trim(), eventTime)
    setEventTitle('')
  }

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(expenseAmount)
    if (!expenseTitle.trim() || isNaN(amt) || amt <= 0) return
    onAddExpense(dateKey, expenseTitle.trim(), amt)
    setExpenseTitle('')
    setExpenseAmount('')
  }

  const formatHeaderDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const moods = [
    { label: 'Productive 🧠', value: 'productive' },
    { label: 'Neutral 😐', value: 'neutral' },
    { label: 'Relaxed 🌊', value: 'relaxed' },
    { label: 'Stressed ⚡', value: 'stressed' },
    { label: 'Tired 😴', value: 'tired' }
  ]

  return (
    <div className='flex flex-col gap-5 bg-card/65 backdrop-blur-md px-5 py-3 border border-border rounded-md h-full'>
      {/* Date Header */}
      <div>
        <p className='font-mono font-bold card-text-contrast text-[10px] uppercase tracking-widest'>
          Selected Day
        </p>
        <h3 className='mt-0.5 font-bold card-text-contrast text-foreground text-sm'>
          {formatHeaderDate(selectedDate)}
        </h3>
      </div>

      {/* Tabs */}
      <div className='flex gap-1 bg-muted p-0.5 border border-border rounded-md text-xs'>
        <button
          onClick={() => setActiveTab('journal')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'journal'
              ? 'bg-card shadow-sm text-amber-300'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className='w-3.5 h-3.5' /> Journal
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'bg-card shadow-sm text-pink-400'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CalIcon className='w-3.5 h-3.5' /> Schedules
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'ledger'
              ? 'bg-card shadow-sm text-chart-2'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Coins className='w-3.5 h-3.5' /> Ledger
        </button>
      </div>

      {/* Tab Contents */}
      <div className='flex flex-col flex-1 min-h-75 overflow-y-auto'>
        {activeTab === 'journal' && (
          <form
            onSubmit={handleJournalSave}
            className='flex flex-col flex-1 gap-3'
          >
            {/* Mood Picker */}
            <div className='space-y-1.5'>
              <span className='block font-semibold card-text-contrast text-[10px] uppercase tracking-wider'>
                How was the flow?
              </span>
              <div className='gap-1.5 grid grid-cols-2 mt-2'>
                {moods.map(m => (
                  <button
                    key={m.value}
                    type='button'
                    onClick={() => setMood(m.value)}
                    className={`py-1.5 px-2 rounded-md border text-left text-xs font-medium cursor-pointer transition-all ${
                      mood === m.value
                        ? 'bg-primary/10 border-primary/45 text-primary shadow-sm'
                        : 'bg-card border-border card-text-contrast hover:bg-muted'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className='flex flex-col flex-1 space-y-1.5'>
              <div className='flex justify-between items-center'>
                <span className='font-semibold card-text-contrast text-[10px] uppercase tracking-wider'>
                  Write your thoughts
                </span>
                <button
                  type='button'
                  onClick={toggleSpeechInput}
                  className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider font-mono cursor-pointer transition-all flex items-center gap-1 ${
                    isListening
                      ? 'bg-primary/20 border-primary/40 text-primary animate-pulse shadow-sm shadow-primary/10'
                      : 'bg-muted border-border text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                  title='Voice Input (Speech to Text)'
                >
                  {isListening ? (
                    <>
                      <MicOff className='w-3 h-3 text-primary' /> Listening
                    </>
                  ) : (
                    <>
                      <Mic className='w-3 h-3' /> Voice Input
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="journal-input"
                value={journal}
                onChange={e => setJournal(e.target.value)}
                placeholder='Log your achievements, blockages, or lessons today...'
                className='flex-1 bg-card p-3 border border-border focus:border-primary/40 rounded-md focus:outline-none w-full min-h-35 card-text-contrast text-foreground text-xs resize-none placeholder-muted-foreground'
              />
            </div>

            <button
              type='submit'
              className='bg-primary hover:opacity-90 shadow py-2.5 rounded-md focus-ring-enhanced w-full font-semibold text-primary-foreground text-xs uppercase tracking-wider transition-all cursor-pointer'
            >
              Save Daily Journal
            </button>
          </form>
        )}

        {activeTab === 'schedule' && (
          <div className='flex flex-col flex-1 gap-4'>
            {/* Event List */}
            <div className='flex-1 space-y-2.5'>
              <span className='block font-semibold card-text-contrast text-[10px] uppercase tracking-wider'>
                Upcoming Items
              </span>
              {!log?.events || log.events.length === 0 ? (
                <p className='card-text-contrast text-muted-foreground text-xs italic'>
                  No events scheduled for today. <br /> Schedule Below.
                </p>
              ) : (
                <div className='space-y-1.5 pr-1 max-h-45 overflow-y-auto'>
                  {log.events.map((evt, idx) => (
                    <div
                      key={idx}
                      className='group flex justify-between items-center bg-card p-2 border border-border hover:border-secondary/40 rounded-md'
                    >
                      <div>
                        <p className='font-medium card-text-contrast text-foreground text-xs'>
                          {evt.title}
                        </p>
                        <p className='mt-0.5 font-mono card-text-contrast text-[10px] text-primary/80'>
                          {evt.time}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteEvent(dateKey, idx)}
                        className='hover:bg-destructive/10 opacity-0 group-hover:opacity-100 p-1 rounded focus-ring-enhanced card-text-contrast hover:text-destructive transition-all cursor-pointer'
                        title='Delete Event'
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Event */}
            <form
              onSubmit={handleAddEventSubmit}
              className='space-y-2 pt-3 border-border border-t'
            >
              <span className='block font-semibold card-text-contrast text-[10px] uppercase tracking-wider'>
                Quick Add Schedule
              </span>
              <div className='flex gap-2'>
                <input
                  type='text'
                  placeholder='Review schema...'
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  className='flex-1 bg-card px-2.5 py-1.5 border border-border focus:border-secondary/40 rounded-md focus:outline-none card-text-contrast text-foreground text-xs placeholder-muted-foreground'
                />
                <input
                  type='time'
                  value={eventTime}
                  onChange={e => setEventTime(e.target.value)}
                  className='bg-card px-2 py-1.5 border border-border rounded-md focus:outline-none font-mono card-text-contrast text-foreground text-xs'
                />
                <button
                  type='submit'
                  className='bg-secondary hover:bg-secondary/90 p-2 rounded-md focus-ring-enhanced text-primary transition-colors cursor-pointer'
                >
                  <Plus className='w-4 h-4' />
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className='flex flex-col flex-1 gap-4'>
            {/* Expense List */}
            <div className='flex-1 space-y-2.5'>
              <span className='block font-semibold card-text-contrast text-[10px] uppercase tracking-wider'>
                Expenses Logged
              </span>
              {!log?.expenses || log.expenses.length === 0 ? (
                <p className='card-text-contrast text-muted-foreground text-xs italic'>
                  No transactions logged for today. <br /> Add below.
                </p>
              ) : (
                <div className='space-y-1.5 pr-1 max-h-45 overflow-y-auto'>
                  {log.expenses.map((exp, idx) => (
                    <div
                      key={idx}
                      className='group flex justify-between items-center bg-card p-2 border border-border hover:border-chart-2/40 rounded-md'
                    >
                      <div>
                        <p className='font-medium card-text-contrast text-foreground text-xs'>
                          {exp.title}
                        </p>
                        <p className='mt-0.5 font-mono card-text-contrast text-[10px] text-chart-2'>
                          {currencySymbol}
                          {exp.amount.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteExpense(dateKey, idx)}
                        className='hover:bg-destructive/10 opacity-0 group-hover:opacity-100 p-1 rounded focus-ring-enhanced card-text-contrast hover:text-destructive transition-all cursor-pointer'
                        title='Delete Transaction'
                      >
                        <Trash2 className='w-3.5 h-3.5' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Expense */}
            <form
              onSubmit={handleAddExpenseSubmit}
              className='space-y-2 pt-3 border-border border-t'
            >
              <span className='block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider'>
                Record Transaction
              </span>
              <div className='flex gap-2'>
                <input
                  type='text'
                  placeholder='Hosting server...'
                  value={expenseTitle}
                  onChange={e => setExpenseTitle(e.target.value)}
                  className='flex-1 bg-card px-2.5 py-1.5 border border-border focus:border-chart-2/40 rounded-lg focus:outline-none text-foreground text-xs placeholder-muted-foreground'
                />
                <input
                  type='number'
                  placeholder={`${currencySymbol}0.00`}
                  step='0.01'
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  className='bg-card px-2 py-1.5 border border-border focus:border-chart-2/40 rounded-md focus:outline-none w-20 font-mono text-foreground text-xs placeholder-muted-foreground'
                />
                <button
                  type='submit'
                  className='bg-chart-2/10 hover:bg-chart-2/20 p-2 rounded-md text-chart-2 transition-colors cursor-pointer'
                >
                  <Plus className='w-4 h-4' />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
