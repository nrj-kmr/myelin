import React from 'react'

const renderLineWithLinks = (line: string) => {
  const urlRegex = /(https?:\/\/[^\s)]+)/g
  const parts = line.split(urlRegex)

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target='_blank'
          rel='noopener noreferrer'
          className='font-medium text-primary hover:underline break-all'
        >
          {part}
        </a>
      )
    }
    return <React.Fragment key={i}>{part}</React.Fragment>
  })
}

export const FormattedEmailContent = ({ content }: { content: string }) => {
  if (!content) return <span>No text content available for this email.</span>

  // Clean up excessive newlines and weird artifacts
  let cleaned = content
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/Â /g, ' ')

  // Split by paragraphs
  const paragraphs = cleaned.split('\n\n')

  return (
    <div className='flex flex-col gap-4 font-sans text-foreground/80 text-sm leading-relaxed'>
      {paragraphs.map((p, i) => {
        // If paragraph is mostly quoted text, style it
        if (p.trim().startsWith('>')) {
          return (
            <blockquote
              key={i}
              className='pl-3 border-primary/40 border-l-2 text-muted-foreground wrap-break-word italic'
            >
              {renderLineWithLinks(p.replace(/^>\s*/gm, ''))}
            </blockquote>
          )
        }

        // Render normal paragraph, breaking on single newlines
        return (
          <p key={i} className='wrap-break-word'>
            {p.split('\n').map((line, j) => (
              <React.Fragment key={j}>
                {renderLineWithLinks(line)}
                {j < p.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        )
      })}
    </div>
  )
}
