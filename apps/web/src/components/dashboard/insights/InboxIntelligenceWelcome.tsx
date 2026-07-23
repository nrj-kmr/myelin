import React from 'react'
import { Sparkles, Mail } from 'lucide-react'
import { EmailItem } from '@myelin/core'

interface InboxIntelligenceWelcomeProps {
  activeEmails: EmailItem[]
  onEmailSelect: (email: EmailItem) => void
}

export function InboxIntelligenceWelcome({
  activeEmails,
  onEmailSelect
}: InboxIntelligenceWelcomeProps) {
  const unreadCount = activeEmails.filter(e => e.isUnread).length

  if (activeEmails.length === 0) {
    return (
      <div className='flex flex-col items-center opacity-60'>
        <Mail className='mb-4 w-12 h-12 text-muted-foreground' />
        <h3 className='font-mono text-lg'>Your inbox is clear</h3>
        <p className='text-sm'>
          Connect Google and check back later for summaries.
        </p>
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center max-w-2xl animate-fadeIn'>
      <div className='flex justify-center items-center bg-secondary/60 mb-6 rounded-full w-16 h-16 text-muted-foreground'>
        <Sparkles className='w-8 h-8' />
      </div>
      <h2 className='mb-4 font-mono font-bold text-2xl tracking-tight'>
        Inbox Intelligence
      </h2>
      <p className='mb-6 text-muted-foreground leading-relaxed text-center'>
        You currently have{' '}
        <span className='font-bold text-foreground'>
          {unreadCount} unread messages.
        </span>{' '}
        <br />
        Recent senders include:{' '}
        <span className='font-medium text-foreground'>
          {Array.from(new Set(activeEmails.map(e => e.sender)))
            .slice(0, 3)
            .join(', ')}
          .
        </span>
        <br /> Select an email from the sidebar to view its detailed AI
        summary, <br /> or review your top summary below.
      </p>

      {activeEmails.length > 0 && activeEmails[0]?.summary && (
        <div className='flex flex-col bg-muted/40 p-4 px-8 border border-border/50 rounded-xl w-full text-left'>
          <span className='mb-2 font-semibold text-muted-foreground text-xs uppercase tracking-widest'>
            Latest Insights
          </span>
          <div className='flex flex-col gap-2'>
            {activeEmails.slice(0, 2).map((email, idx) =>
              email.summary ? (
                <div
                  key={idx}
                  className='flex flex-col hover:bg-muted/60 -mx-4 px-4 py-3 rounded-xl transition-colors cursor-pointer'
                  onClick={() => onEmailSelect(email)}
                >
                  <div className='flex justify-between items-start gap-4 mb-1'>
                    <h4 className='font-bold text-lg line-clamp-1 leading-tight'>
                      {email.subject}
                    </h4>
                  </div>
                  <span className='mb-2 font-mono text-[10px] text-primary/80 uppercase tracking-wider'>
                    From: {email.sender}
                  </span>
                  <p
                    className='text-muted-foreground text-sm line-clamp-3 leading-relaxed'
                    dangerouslySetInnerHTML={{
                      __html: `"${email.summary}"`
                    }}
                  />
                </div>
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  )
}
