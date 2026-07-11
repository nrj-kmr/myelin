import React, { useState } from 'react'
import { BookOpen, Coins, Calendar } from 'lucide-react'
import { DayLog, CURRENCY_SYMBOLS } from '@myelin/core'

interface NarrativeWorkspaceProps {
  logs: Record<string, DayLog>
  currency: string
  selectedDateKey: string
  onSelectDate: (date: Date) => void
  onActionClick?: (tab: 'journal' | 'schedule' | 'ledger') => void
}

export function NarrativeWorkspace ({
  logs,
  currency,
  selectedDateKey,
  onSelectDate,
  onActionClick
}: NarrativeWorkspaceProps) {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<
    'journal' | 'expenditure'
  >('journal')

  const formatKeyDate = (key: string) => {
    const [y, m, d] = key.split('-').map(Number)
    const dateObj = new Date(y, m - 1, d)
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleDateClick = (key: string) => {
    const [y, m, d] = key.split('-').map(Number)
    onSelectDate(new Date(y, m - 1, d))
  }

  return (
    <div className='flex flex-col gap-5 bg-card/65 shadow-xl backdrop-blur-md px-6 py-4 border border-border rounded-md min-h-175 h-full flex-1'>
      {/* Tab Header Selector */}
      <div className='flex justify-between items-center pb-3 border-border border-b'>
        <div className='flex gap-1 bg-muted p-0.5 border border-border rounded-md font-semibold text-xs'>
          <button
            onClick={() => setActiveWorkspaceTab('journal')}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px] ${
              activeWorkspaceTab === 'journal'
                ? 'bg-card shadow-sm text-amber-600 dark:text-amber-400 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className='w-3.5 h-3.5' /> Journal Logs
          </button>
          <button
            onClick={() => setActiveWorkspaceTab('expenditure')}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px] ${
              activeWorkspaceTab === 'expenditure'
                ? 'bg-card shadow-sm text-green-600 dark:text-green-400 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className='w-3.5 h-3.5' /> Expenditure
          </button>
        </div>
      </div>

      {/* Workspace Content rendering based on Tab */}
      <div className='flex flex-col flex-1'>
        {/* 1. JOURNAL LOGS TAB */}
        {activeWorkspaceTab === 'journal' && (
          <div className='flex flex-col gap-4 pr-1 max-h-150 overflow-y-auto animate-fadeIn'>
            {Object.keys(logs).filter(
              key =>
                logs[key].journal ||
                (logs[key].events && logs[key].events.length > 0) ||
                (logs[key].expenses && logs[key].expenses.length > 0)
            ).length === 0 ? (
              <p className='py-10 text-muted-foreground text-xs text-center italic'>
                Your journal feed is empty. Select a date on the calendar and
                write down your thoughts.
              </p>
            ) : (
              Object.entries(logs)
                .filter(
                  ([_, log]) =>
                    log.journal ||
                    (log.events && log.events.length > 0) ||
                    (log.expenses && log.expenses.length > 0)
                )
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([key, log]) => {
                  const hasEvents = log.events && log.events.length > 0
                  const hasExpenses = log.expenses && log.expenses.length > 0
                  const isSelectedDate = key === selectedDateKey
                  const dayExpensesTotal =
                    log.expenses?.reduce((sum, item) => sum + item.amount, 0) ||
                    0

                  return (
                    <div
                      key={key}
                      onClick={() => handleDateClick(key)}
                      className={`p-4 rounded-md border transition-all cursor-pointer text-left flex flex-col gap-2.5 ${
                        isSelectedDate
                          ? 'bg-primary/5 border-primary shadow-sm'
                          : 'bg-muted/40 border-border/40 hover:border-secondary/40 hover:bg-muted/70'
                      }`}
                    >
                      <div className='flex justify-between items-center font-mono font-semibold text-[10px]'>
                        <span className='text-primary'>
                          {formatKeyDate(key)}
                        </span>
                        {log.mood && (
                          <span className='bg-primary/10 px-2 py-0.5 rounded-full font-mono text-[9px] text-amber-600 dark:text-amber-400 uppercase tracking-wide'>
                            {log.mood}
                          </span>
                        )}
                      </div>

                      {log.journal && (
                        <p
                          onClick={e => {
                            e.stopPropagation()
                            handleDateClick(key)
                            onActionClick?.('journal')
                          }}
                          className='font-light text-foreground hover:text-primary text-xs leading-relaxed transition-colors cursor-pointer'
                        >
                          {log.journal}
                        </p>
                      )}

                      {(hasEvents || hasExpenses) && (
                        <div className='flex flex-wrap gap-2 mt-1 pt-2.5 border-border/30 border-t'>
                          {hasEvents && (
                            <div
                              onClick={e => {
                                e.stopPropagation()
                                handleDateClick(key)
                                onActionClick?.('schedule')
                              }}
                              className='flex items-center gap-1 bg-secondary/5 hover:bg-secondary/20 px-2 py-1 border border-secondary rounded font-mono text-[10px] text-pink-400 transition-colors cursor-pointer'
                            >
                              <Calendar className='w-3 h-3' />
                              <span>{log.events?.length} schedules</span>
                            </div>
                          )}
                          {hasExpenses && (
                            <div
                              onClick={e => {
                                e.stopPropagation()
                                handleDateClick(key)
                                onActionClick?.('ledger')
                              }}
                              className='flex items-center gap-1 bg-primary/5 hover:bg-primary/20 px-2 py-1 border border-primary/15 rounded font-mono text-[10px] text-green-600 dark:text-green-400 transition-colors cursor-pointer'
                            >
                              <Coins className='w-3 h-3' />
                              <span>
                                {CURRENCY_SYMBOLS[currency] || '$'}
                                {dayExpensesTotal.toFixed(2)} spent
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        )}

        {/* 2. EXPENDITURE TAB */}
        {activeWorkspaceTab === 'expenditure' && (
          <div className='flex flex-col gap-4 pr-1 max-h-150 overflow-y-auto animate-fadeIn'>
            {Object.keys(logs).filter(
              key => logs[key].expenses && logs[key].expenses.length > 0
            ).length === 0 ? (
              <p className='py-10 text-muted-foreground text-xs text-center italic'>
                No transactions recorded. Select a date on the calendar and log
                expenses under Ledger.
              </p>
            ) : (
              Object.entries(logs)
                .filter(([_, log]) => log.expenses && log.expenses.length > 0)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([key, log]) => {
                  const dayExpensesTotal =
                    log.expenses?.reduce((sum, item) => sum + item.amount, 0) ||
                    0
                  const isSelectedDate = key === selectedDateKey

                  return (
                    <div
                      key={key}
                      onClick={() => handleDateClick(key)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-2.5 ${
                        isSelectedDate
                          ? 'bg-secondary/5 border-secondary shadow-sm'
                          : 'bg-muted/40 border-border/40 hover:border-secondary/40 hover:bg-muted/70'
                      }`}
                    >
                      <div className='flex justify-between items-center font-mono font-semibold text-[10px]'>
                        <span className='text-primary'>
                          {formatKeyDate(key)}
                        </span>
                        <span className='font-bold text-primary'>
                          Total: {CURRENCY_SYMBOLS[currency]}
                          {dayExpensesTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className='space-y-1.5 mt-1'>
                        {log.expenses?.map((exp, idx) => (
                          <div
                            key={idx}
                            className='flex justify-between items-center py-1 border-border/20 last:border-0 border-b text-xs'
                          >
                            <span className='font-light text-foreground'>
                              {exp.title}
                            </span>
                            <span className='font-mono font-semibold text-muted-foreground'>
                              -{CURRENCY_SYMBOLS[currency]}
                              {exp.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
