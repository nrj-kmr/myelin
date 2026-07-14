'use client'

import React from 'react'
import { Mail, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { EmailItem } from '@myelin/core'
import { GoogleConnectPrompt } from './GoogleConnectPrompt'

interface EmailInsightsTabProps {
  googleConnected: boolean
  loadingEmails: boolean
  emailError: string
  emails: EmailItem[]
  fetchGoogleData: (
    forceRefresh: boolean,
    target: 'all' | 'email' | 'calendar'
  ) => void
  handleReauthenticate: () => void
  isDedicatedPage?: boolean
  onEmailSelect?: (email: EmailItem) => void
  markEmailAsRead?: (id: string) => void
  deleteEmail?: (id: string) => void
}

export function EmailInsightsTab ({
  googleConnected,
  loadingEmails,
  emailError,
  emails,
  fetchGoogleData,
  handleReauthenticate,
  isDedicatedPage,
  onEmailSelect,
  markEmailAsRead,
  deleteEmail
}: EmailInsightsTabProps) {
  const router = useRouter()

  const activeEmails = emails.filter(
    (e) => !e.markedReadLocally && !e.markedDeletedLocally
  )

  return (
    <div className='flex flex-col gap-3 h-full overflow-hidden animate-fadeIn'>
      <div className='flex justify-between items-center'>
        <span className='flex items-center gap-1.5 font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider'>
          <Mail className='w-3.5 h-3.5' /> Mail Summaries
        </span>
        {googleConnected && (
          <button
            type='button'
            onClick={() => fetchGoogleData(true, 'email')}
            disabled={loadingEmails}
            className='flex justify-center items-center hover:bg-muted p-1 rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer'
            title='Refresh Gmail Inbox'
          >
            <RefreshCw
              className={`w-3 h-3 ${
                loadingEmails ? 'animate-spin text-secondary' : ''
              }`}
            />
          </button>
        )}
      </div>

      {!googleConnected ? (
        <GoogleConnectPrompt />
      ) : loadingEmails ? (
        <div className='flex flex-col justify-center items-center gap-2 bg-muted/10 py-6 rounded-xl min-h-28 text-muted-foreground text-xs text-center'>
          <Loader2 className='w-5 h-5 text-secondary animate-spin' />
          <span className='font-mono text-[9px]'>
            Connecting to Google Gmail...
          </span>
        </div>
      ) : emailError ? (
        <div className='flex flex-col items-center gap-2 bg-red-500/5 p-4 border border-red-500/20 rounded-xl font-mono text-[10px] text-red-500 text-center'>
          <AlertCircle className='w-4 h-4 text-red-500' />
          <span>{emailError}</span>
          <button
            onClick={handleReauthenticate}
            className='bg-red-500/10 hover:bg-red-500/20 mt-1 px-4 py-1.5 border border-red-500/20 rounded-lg font-bold transition-colors'
          >
            Sign Out & Reauthenticate
          </button>
        </div>
      ) : activeEmails.length === 0 ? (
        <div className='flex justify-center items-center bg-muted/10 p-4 border border-border/40 rounded-xl min-h-28 text-[10px] text-muted-foreground text-center italic'>
          You're clear, <br /> You have no unread emails.
        </div>
      ) : (
        <div className='flex flex-col gap-2 h-full overflow-hidden'>
          <div
            onClick={() => {
              if (isDedicatedPage && onEmailSelect) {
                onEmailSelect(null as any)
              } else {
                router.push('/insights')
              }
            }}
            className='bg-muted/30 hover:bg-muted/50 p-4 border border-border/40 rounded-xl w-full overflow-hidden transition-colors cursor-pointer'
          >
            <p className='mb-1 font-medium text-foreground text-sm'>
              You have {activeEmails.length} unread emails.
            </p>
            <p className='text-muted-foreground text-xs wrap-break-word leading-relaxed'>
              Recent senders include:{' '}
              <span className='font-medium text-foreground'>
                {Array.from(new Set(activeEmails.map(e => e.sender)))
                  .slice(0, 3)
                  .join(', ')}
              </span>
              .
            </p>
            {activeEmails[0]?.summary && (
              <p className='mt-2 text-muted-foreground text-xs italic line-clamp-2'>
                "
                <span dangerouslySetInnerHTML={{ __html: emails[0].summary }} />
                "
              </p>
            )}
          </div>

          {isDedicatedPage && (
            <div className='flex flex-col flex-1 gap-4 mt-2 w-full overflow-hidden'>
              <div className='flex items-center gap-2 pb-2 border-border/50 border-b text-muted-foreground'>
                <Mail className='w-4 h-4' />
                <h5 className='font-semibold text-sm tracking-tight'>
                  Recent Unread Emails
                </h5>
              </div>
              <div className='flex flex-col flex-1 gap-2 pr-2 pb-4 overflow-y-auto'>
                {emails.map((mail, idx) => {
                  if (mail.markedDeletedLocally) return null

                  return (
                    <div
                      key={idx}
                      className={`shrink-0 group/item relative flex flex-col gap-1 p-2 border border-border/40 rounded-md w-full overflow-hidden transition-all cursor-pointer hover:bg-muted/75 ${
                        mail.markedReadLocally
                          ? 'bg-muted/10 opacity-70'
                          : 'bg-muted/40'
                      }`}
                    >
                      <div
                        onClick={() => onEmailSelect?.(mail)}
                        className='flex-1'
                      >
                        <div className='flex justify-between items-center w-full font-mono font-semibold text-[10px] text-muted-foreground'>
                          <span className='flex items-center gap-2 truncate'>
                            {!mail.markedReadLocally && (
                              <div className='bg-primary rounded-full w-1.5 h-1.5 animate-pulse' />
                            )}
                            {mail.sender}
                          </span>
                          <span className='text-[9px] text-muted-foreground/60'>
                            {mail.time}
                          </span>
                        </div>
                        <p
                          className={`text-foreground text-xs line-clamp-1 transition-colors ${
                            !mail.markedReadLocally
                              ? 'group-hover/item:text-primary font-bold'
                              : 'font-medium'
                          }`}
                        >
                          {mail.subject}
                        </p>
                        <p
                          className='mt-0.5 font-light text-[11px] text-muted-foreground line-clamp-1 leading-relaxed'
                          dangerouslySetInnerHTML={{
                            __html: mail.summary || ''
                          }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className='top-2 right-2 absolute flex gap-1 bg-background/80 opacity-0 group-hover/item:opacity-100 shadow-sm backdrop-blur-sm p-1 rounded transition-opacity'>
                        {!mail.markedReadLocally && markEmailAsRead && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              markEmailAsRead(mail.id)
                            }}
                            className='hover:bg-primary/20 p-1 rounded text-muted-foreground hover:text-primary transition-colors'
                            title='Mark as Read'
                          >
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='12'
                              height='12'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            >
                              <polyline points='20 6 9 17 4 12'></polyline>
                            </svg>
                          </button>
                        )}
                        {deleteEmail && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              if (
                                confirm(
                                  'Are you sure you want to delete this email?'
                                )
                              ) {
                                deleteEmail(mail.id)
                              }
                            }}
                            className='hover:bg-red-500/20 p-1 rounded text-muted-foreground hover:text-red-500 transition-colors'
                            title='Delete Email'
                          >
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='12'
                              height='12'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            >
                              <path d='M3 6h18'></path>
                              <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'></path>
                              <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
