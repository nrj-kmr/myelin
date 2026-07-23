import React, { useState } from 'react'
import { Calendar as CalIcon } from 'lucide-react'

interface CalendarQuickAddOverlayProps {
  quickAddEvent: { x: number; y: number; date: Date }
  onClose: () => void
  onSave: (dateStr: string, title: string, time: string) => void
}

export function CalendarQuickAddOverlay({
  quickAddEvent,
  onClose,
  onSave
}: CalendarQuickAddOverlayProps) {
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventTime, setNewEventTime] = useState('12:00')

  return (
    <>
      <div
        className='z-40 fixed inset-0'
        onClick={onClose}
        onContextMenu={e => {
          e.preventDefault()
          onClose()
        }}
      />
      <div
        className='z-50 fixed bg-card shadow-2xl p-4 border border-border rounded-xl w-64 animate-in duration-200 fade-in zoom-in-95'
        style={{
          top: Math.min(quickAddEvent.y, window.innerHeight - 200),
          left: Math.min(quickAddEvent.x, window.innerWidth - 270)
        }}
      >
        <h4 className='flex items-center gap-2 mb-3 font-bold text-foreground text-sm'>
          <CalIcon className='w-4 h-4 text-primary' />
          Add Event
        </h4>
        <form
          onSubmit={e => {
            e.preventDefault()
            if (!newEventTitle.trim()) return
            const y = quickAddEvent.date.getFullYear()
            const m = String(quickAddEvent.date.getMonth() + 1).padStart(2, '0')
            const d = String(quickAddEvent.date.getDate()).padStart(2, '0')
            
            onSave(`${y}-${m}-${d}`, newEventTitle.trim(), newEventTime)
          }}
        >
          <input
            autoFocus
            type='text'
            placeholder='Event Title...'
            value={newEventTitle}
            onChange={e => setNewEventTitle(e.target.value)}
            className='bg-background mb-3 px-3 py-2 border border-border focus:border-primary rounded-md focus:outline-none w-full text-foreground text-sm'
          />
          <div className='flex gap-2'>
            <input
              type='time'
              value={newEventTime}
              onChange={e => setNewEventTime(e.target.value)}
              className='flex-1 bg-background px-2 py-2 border border-border focus:border-primary rounded-md focus:outline-none text-foreground text-sm'
            />
            <button
              type='submit'
              className='bg-primary hover:bg-primary/90 px-4 py-2 rounded-md font-semibold text-primary-foreground text-sm transition-colors'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
