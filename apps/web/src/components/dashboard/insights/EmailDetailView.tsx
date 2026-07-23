'use client'

import React, { useState, useEffect } from 'react'
import {
  Mail,
  Sparkles,
  ArrowLeft,
  Paperclip,
  X,
  ExternalLink,
  Download,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { EmailItem } from '@myelin/core'

import { FormattedEmailContent } from './FormattedEmailContent'
import { useEmailHtml } from '@/hooks/useEmailHtml'
import { useEmailAttachments } from '@/hooks/useEmailAttachments'

interface EmailDetailViewProps {
  selectedEmail: EmailItem
  onClose: () => void
  localTheme: 'light' | 'dark'
  isMounted: boolean
}

export function EmailDetailView({
  selectedEmail,
  onClose,
  localTheme,
  isMounted
}: EmailDetailViewProps) {
  const [showSummaryPanel, setShowSummaryPanel] = useState(false)

  // Use custom hooks for heavy lifting
  const { finalHtml } = useEmailHtml(selectedEmail, localTheme)
  const { downloadingAttachment, handleAttachmentAction } = useEmailAttachments(
    selectedEmail
  )

  // Reset summary panel when email changes
  useEffect(() => {
    setShowSummaryPanel(false)
  }, [selectedEmail])

  return (
    <div className='flex flex-col w-full h-full animate-fadeIn'>
      {/* Back button for mobile */}
      <button
        onClick={onClose}
        className='lg:hidden flex items-center gap-2 hover:bg-muted/50 mb-4 -ml-2 p-2 rounded-md w-fit text-muted-foreground hover:text-foreground transition-colors'
      >
        <ArrowLeft className='w-4 h-4' /> Back to Inbox
      </button>
      
      <div className='relative flex items-center gap-4 pb-4 border-border/50 border-b'>
        <div className='flex justify-center items-center bg-secondary/60 shrink-0 rounded-full w-12 h-12 text-muted-foreground'>
          <Mail className='w-5 h-5' />
        </div>
        <div className='flex flex-col flex-1 pr-24 min-w-0'>
          <h2 className='font-bold text-foreground text-xl line-clamp-1 tracking-tight'>
            {selectedEmail.subject}
          </h2>
          <p className='mt-1 text-muted-foreground text-sm line-clamp-1'>
            From:{' '}
            <span className='font-medium text-foreground'>
              {selectedEmail.sender}
            </span>{' '}
            • {selectedEmail.time}
          </p>
        </div>

        {selectedEmail.summary && (
          <button
            onClick={() => setShowSummaryPanel(!showSummaryPanel)}
            className='top-2 right-0 absolute flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-md font-bold text-primary text-xs transition-colors'
          >
            {showSummaryPanel ? (
              <X className='w-3.5 h-3.5' />
            ) : (
              <Sparkles className='w-3.5 h-3.5' />
            )}
            {showSummaryPanel ? 'Hide Summary' : 'Summarize'}
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSummaryPanel && selectedEmail.summary && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 16 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className='overflow-hidden'
          >
            <div className='relative flex flex-col bg-card/20 shadow-lg mt-4 px-6 py-5 border border-primary/20 rounded-lg'>
              <div className='absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-transparent pointer-events-none' />
              <div className='relative flex items-center gap-2 mb-3 text-primary'>
                <Sparkles className='w-4 h-4' />
                <h3 className='font-bold text-xs uppercase tracking-widest'>
                  AI Summary
                </h3>
              </div>
              <div className='relative'>
                <p
                  className='text-foreground/90 text-sm leading-relaxed'
                  dangerouslySetInnerHTML={{
                    __html: selectedEmail.summary
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className='flex flex-col flex-1 pt-4'>
        <div className='flex flex-col flex-1 bg-background/30 rounded-md overflow-hidden'>
          {selectedEmail.isHtml ? (
            <iframe
              key={`iframe-${selectedEmail.id}-${localTheme}`}
              srcDoc={finalHtml}
              className='flex-1 bg-transparent px-6 py-4 border-none rounded-md w-full transition-all'
              style={{
                opacity: isMounted ? 1 : 0
              }}
              sandbox='allow-popups allow-popups-to-escape-sandbox allow-same-origin'
              title='Email Content'
            />
          ) : (
            <div className='flex-1 overflow-y-auto'>
              <FormattedEmailContent content={selectedEmail.content || ''} />
            </div>
          )}
          
          {/* Attachments Section */}
          {selectedEmail.attachments &&
            selectedEmail.attachments.length > 0 && (
              <div className='bg-muted/30 p-4 border-border/50 border-t'>
                <h4 className='mb-3 font-mono font-bold text-muted-foreground text-xs uppercase tracking-wider'>
                  Attachments ({selectedEmail.attachments.length})
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {selectedEmail.attachments.map((att: any, idx: number) => (
                    <div
                      key={idx}
                      className='group relative flex items-center gap-2 bg-background hover:bg-background/80 py-2 pr-16 pl-3 border border-border rounded-md overflow-hidden text-sm transition-colors'
                    >
                      <div className='flex items-center gap-2'>
                        <Paperclip className='w-4 h-4 text-muted-foreground' />
                        <span className='max-w-40 text-foreground text-xs truncate line-clamp-1'>
                          {att.filename}
                        </span>
                        <span className='text-[10px] text-muted-foreground whitespace-nowrap'>
                          ({Math.round(att.size / 1024)} KB)
                        </span>
                      </div>
                      <div className='top-0 right-0 bottom-0 absolute flex items-center gap-1 bg-background/95 opacity-0 group-hover:opacity-100 backdrop-blur-sm px-2 transition-opacity'>
                        <button
                          onClick={() => handleAttachmentAction(att, 'open')}
                          disabled={
                            downloadingAttachment?.id ===
                            (att.attachmentId || att.filename)
                          }
                          className='hover:bg-primary/20 disabled:opacity-50 p-1.5 rounded-md text-primary transition-colors cursor-pointer disabled:cursor-not-allowed'
                          title='Open Native'
                        >
                          {downloadingAttachment?.id ===
                            (att.attachmentId || att.filename) &&
                          downloadingAttachment?.action === 'open' ? (
                            <Loader2 className='w-3.5 h-3.5 animate-spin' />
                          ) : (
                            <ExternalLink className='w-3.5 h-3.5' />
                          )}
                        </button>
                        <button
                          onClick={() => handleAttachmentAction(att, 'download')}
                          disabled={
                            downloadingAttachment?.id ===
                            (att.attachmentId || att.filename)
                          }
                          className='hover:bg-primary/20 disabled:opacity-50 p-1.5 rounded-md text-primary transition-colors cursor-pointer disabled:cursor-not-allowed'
                          title='Download Native'
                        >
                          {downloadingAttachment?.id ===
                            (att.attachmentId || att.filename) &&
                          downloadingAttachment?.action === 'download' ? (
                            <Loader2 className='w-3.5 h-3.5 animate-spin' />
                          ) : (
                            <Download className='w-3.5 h-3.5' />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
