import React from 'react'
import Link from 'next/link'
import { Brain, ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div className='flex flex-col min-h-screen bg-background text-foreground font-sans selection:bg-primary/20'>
      <header className='top-0 z-50 sticky bg-background/80 backdrop-blur-md border-border/50 border-b transition-colors duration-300'>
        <div className='flex justify-between items-center mx-auto px-6 max-w-7xl h-20'>
          <Link href='/' className='group flex items-center gap-2'>
            <div className='flex justify-center items-center bg-accent/10 border border-accent/20 rounded-lg w-8 h-8 group-hover:scale-110 transition-transform duration-300'>
              <Brain className='w-4 h-4 text-accent-foreground' />
            </div>
            <span className='font-mono text-foreground text-sm uppercase tracking-widest'>
              Myelin
            </span>
          </Link>
        </div>
      </header>

      <main className='flex-1 mx-auto py-16 px-6 max-w-3xl w-full animate-fadeIn'>
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors font-mono text-sm uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className='mb-8 font-bold font-mono text-4xl tracking-tight'>
          Terms of Service
        </h1>
        
        <div className='flex flex-col gap-8 text-muted-foreground leading-relaxed'>
          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>1. Agreement to Terms</h2>
            <p>
              By accessing or using Myelin, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
            </p>
          </section>

          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>2. Description of Service</h2>
            <p>
              Myelin is a productivity dashboard that integrates with Google APIs to provide intelligent insights, email summaries, and calendar management. We utilize AI models to process data fetched from your connected accounts.
            </p>
          </section>

          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>3. Google API Services</h2>
            <p>
              Our application uses Google APIs. By linking your Google account, you grant Myelin permission to access your emails and calendar data. We adhere strictly to the Google API Services User Data Policy. For more details on how we handle your data, please review our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>4. User Responsibilities</h2>
            <p>
              You are responsible for safeguarding the password and authentication methods that you use to access the Service. You must not use the Service for any illegal or unauthorized purpose.
            </p>
          </section>

          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>5. Termination</h2>
            <p>
              We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. All provisions of the Terms which by their nature should survive termination shall survive.
            </p>
          </section>
          
          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>6. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>7. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at: mrneeraaj@gmail.com
            </p>
          </section>
          
          <p className='pt-8 border-t border-border/50 text-sm'>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </main>
    </div>
  )
}
