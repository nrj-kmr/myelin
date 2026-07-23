import { useState, useEffect, useMemo } from 'react'
import { EmailItem, supabase } from '@myelin/core'

export function useEmailHtml(
  selectedEmail: EmailItem | null,
  localTheme: 'light' | 'dark'
) {
  const [resolvedEmailHtml, setResolvedEmailHtml] = useState<string>('')

  // Resolve inline attachments (cid: images) when an email is selected
  useEffect(() => {
    if (!selectedEmail || !selectedEmail.isHtml || !selectedEmail.content) {
      setResolvedEmailHtml(selectedEmail?.content || '')
      return
    }

    const resolveImages = async () => {
      let html = selectedEmail.content!

      // OPTIMISTIC RENDER: Show the email instantly before resolving heavy network images
      setResolvedEmailHtml(html)

      try {
        if (
          !selectedEmail.inlineAttachments ||
          selectedEmail.inlineAttachments.length === 0
        ) {
          return
        }

        const {
          data: { session }
        } = (await supabase?.auth?.getSession()) || { data: { session: null } }
        const token =
          session?.provider_token ||
          sessionStorage.getItem('google_access_token')

        for (const att of selectedEmail.inlineAttachments) {
          if (html.includes(`cid:${att.cid}`)) {
            if (att.data) {
              const base64 = att.data.replace(/-/g, '+').replace(/_/g, '/')
              html = html
                .split(`cid:${att.cid}`)
                .join(`data:${att.mimeType};base64,${base64}`)
            } else if (token && att.attachmentId) {
              const res = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${selectedEmail.id}/attachments/${att.attachmentId}`,
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              )
              if (res.ok) {
                const data = await res.json()
                if (data.data) {
                  const base64 = data.data
                    .replace(/-/g, '+')
                    .replace(/_/g, '/')
                  html = html
                    .split(`cid:${att.cid}`)
                    .join(`data:${att.mimeType};base64,${base64}`)
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Error resolving inline images', e)
      }
      // FINAL RENDER: Update with fully loaded images
      setResolvedEmailHtml(html)
    }

    resolveImages()
  }, [selectedEmail])

  const finalHtml = useMemo(() => {
    if (!resolvedEmailHtml) return ''

    const themeCSS = `
      <meta name="color-scheme" content="${
        localTheme === 'dark' ? 'dark' : 'light'
      }">
      <style>
        :root {
          color-scheme: ${localTheme === 'dark' ? 'dark' : 'light'} !important;
        }
        body, html {
          background-color: ${
            localTheme === 'dark' ? '#09090b' : '#ffffff'
          } !important;
          color: ${localTheme === 'dark' ? '#fafafa' : '#09090b'} !important;
        }
        /* Force elements with hardcoded backgrounds to be transparent so the theme bg shows through */
        table, td, th, tr, div, span, p, font, center {
          background-color: transparent !important;
          color: inherit !important;
          border-color: ${
            localTheme === 'dark' ? '#27272a' : '#e4e4e7'
          } !important;
        }
        /* Ensure links remain visible and themed */
        a {
          color: ${localTheme === 'dark' ? '#60a5fa' : '#2563eb'} !important;
        }
        /* Keep images normal */
        img, picture, video {
          background-color: transparent !important;
        }
      </style>
    `

    let newHtml = resolvedEmailHtml
    if (newHtml.includes('</head>')) {
      newHtml = newHtml.replace('</head>', themeCSS + '</head>')
    } else if (newHtml.includes('<body')) {
      newHtml = newHtml.replace('<body', themeCSS + '<body')
    } else {
      newHtml = themeCSS + newHtml
    }
    return newHtml
  }, [resolvedEmailHtml, localTheme])

  return { finalHtml }
}
