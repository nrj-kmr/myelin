import { useState } from 'react'
import { EmailItem, supabase } from '@myelin/core'

export function useEmailAttachments(selectedEmail: EmailItem | null) {
  const [downloadingAttachment, setDownloadingAttachment] = useState<{
    id: string
    action: 'download' | 'open'
  } | null>(null)

  const getMimeTypeFromFilename = (filename: string, fallback: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'application/pdf'
    if (ext === 'jpg') return 'image/jpeg'
    if (['png', 'jpeg', 'gif', 'webp'].includes(ext || ''))
      return `image/${ext}`
    return fallback
  }

  const triggerDownloadOrOpen = (
    blob: Blob,
    filename: string,
    action: 'download' | 'open'
  ) => {
    const actualMimeType = getMimeTypeFromFilename(filename, blob.type)
    const correctedBlob = new Blob([blob], { type: actualMimeType })
    const url = URL.createObjectURL(correctedBlob)

    if (action === 'download') {
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } else {
      window.open(url, '_blank')
    }
  }

  const handleAttachmentAction = async (
    att: any,
    action: 'download' | 'open'
  ) => {
    if (!selectedEmail) return

    try {
      const attId = att.attachmentId || att.filename
      setDownloadingAttachment({ id: attId, action })

      const {
        data: { session }
      } = (await supabase?.auth?.getSession()) || { data: { session: null } }
      const token =
        session?.provider_token || sessionStorage.getItem('google_access_token')

      if (!token) throw new Error('No Google access token found')

      if (att.data) {
        // Use inline data if available
        const base64 = att.data.replace(/-/g, '+').replace(/_/g, '/')
        const blob = await (
          await fetch(`data:${att.mimeType};base64,${base64}`)
        ).blob()
        triggerDownloadOrOpen(blob, att.filename, action)
        return
      }

      if (!att.attachmentId) {
        throw new Error('No attachment ID provided by Gmail API')
      }

      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${selectedEmail.id}/attachments/${att.attachmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (!res.ok) throw new Error('Failed to fetch attachment from Gmail API')

      const data = await res.json()
      if (!data.data) throw new Error('No data returned from attachment fetch')

      const base64 = data.data.replace(/-/g, '+').replace(/_/g, '/')
      const byteCharacters = atob(base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: att.mimeType })

      triggerDownloadOrOpen(blob, att.filename, action)
    } catch (e) {
      console.error('Error downloading attachment:', e)
      alert(
        'Failed to download attachment. Your Google session may have expired.'
      )
    } finally {
      setDownloadingAttachment(null)
    }
  }

  return { downloadingAttachment, handleAttachmentAction }
}
