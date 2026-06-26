import React from "react";
import { Github, Twitter, Brain } from "lucide-react";

export function Footer() {
  return (
    <footer className="z-10 relative bg-muted/20 py-16 border-border border-t">
      <div className="flex flex-col items-center gap-12 mx-auto px-6 max-w-4xl">

        {/* Top bar with copyright and social links */}
        <div className="flex sm:flex-row flex-col justify-between items-center border-border w-full">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="font-bold text-muted-foreground text-xs tracking-wider">
              MYELIN App © 2026
            </span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://github.com/nrj-kmr"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-enhanced-contrast transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4.5 h-4.5" />
            </a>
            <a
              href="https://twitter.com/neeraaj_"
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-enhanced-contrast transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-4.5 h-4.5" />
            </a>
          </div>
        </div>

        {/* Big myelin logo text wrapped in a glowing circle border */}
        <div className="flex justify-center w-full">
          <span className="font-serif text-8xl tracking-widest text-high-contrast">
            myelin.
          </span>
        </div>

      </div>
    </footer>
  );
}
