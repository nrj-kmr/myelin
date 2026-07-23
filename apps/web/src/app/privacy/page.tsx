import React from 'react'
import Link from 'next/link'
import { Brain, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        
        <div className='flex flex-col gap-8 text-muted-foreground leading-relaxed'>
          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>1. Introduction</h2>
            <p>
              Welcome to Myelin. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
            </p>
          </section>

          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>2. Data We Collect</h2>
            <p className='mb-2'>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className='flex flex-col gap-2 list-disc list-inside'>
              <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
              <li><strong>Contact Data:</strong> includes email address.</li>
              <li><strong>Google API Data:</strong> includes Calendar events and Gmail data. Our application requests restricted scopes to analyze this data to provide AI-driven insights.</li>
            </ul>
          </section>

          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>3. How We Use Your Google Data</h2>
            <p>
              Myelin uses Google APIs to fetch your emails and calendar events. This data is processed to generate summaries, extract action items, and provide intelligent dashboards. <strong>We do not sell your Google data to third parties.</strong> Our use and transfer of information received from Google APIs to any other app will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
            </p>
          </section>

          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>4. Data Security</h2>
            <p>
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. Your data is encrypted in transit and at rest.
            </p>
          </section>

          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>5. Your Legal Rights</h2>
            <p>
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
            </p>
          </section>
          
          <section>
            <h2 className='mb-4 font-bold text-foreground text-xl'>6. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy or our privacy practices, please contact us at: mrneeraaj@gmail.com
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
