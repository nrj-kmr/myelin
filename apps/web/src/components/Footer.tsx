'use client'

import React from "react";
import { Github, Twitter, Brain } from "lucide-react";
import { useRouter } from "next/navigation";

export function Footer() {
  const router = useRouter();
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <div 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 mb-4 cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center transition-transform group-hover:scale-110">
                <Brain className="w-3 h-3 text-accent-foreground" />
              </div>
              <span className="font-mono text-xs tracking-wider text-foreground uppercase">
                Myelin
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs font-sans">
              A unified workspace to journal thoughts and track your money with ease.
            </p>
          </div>

          <div className="flex md:justify-end gap-16">
            <div className="flex gap-16">
              <div>
                <h4 className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-4">Connect</h4>
                <div className="flex flex-col gap-3">
                  <a
                    href="https://github.com/nrj-kmr"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-foreground/70 hover:text-foreground transition-colors uppercase flex items-center gap-2"
                  >
                    <Github className="w-3.5 h-3.5" /> GitHub
                  </a>
                  <a
                    href="https://twitter.com/neeraaj_"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-foreground/70 hover:text-foreground transition-colors uppercase flex items-center gap-2"
                  >
                    <Twitter className="w-3.5 h-3.5" /> Twitter
                  </a>
                </div>
              </div>
              <div>
                <h4 className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase mb-4">Legal</h4>
                <div className="flex flex-col gap-3">
                  <a
                    href="/privacy"
                    className="font-mono text-xs text-foreground/70 hover:text-foreground transition-colors uppercase flex items-center gap-2"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/terms"
                    className="font-mono text-xs text-foreground/70 hover:text-foreground transition-colors uppercase flex items-center gap-2"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            Myelin App © 2026. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
              Engineered to scale
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
