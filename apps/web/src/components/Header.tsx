"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Sun, Moon } from "lucide-react";

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Read the current theme class applied by blocking script
    if (document.documentElement.classList.contains("light")) {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("light")) {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem("myelin_theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("myelin_theme", "light");
      setTheme("light");
    }
  };

  return (
    <header className="top-0 z-50 sticky bg-card/70 backdrop-blur-md border-border/20 border-b w-full transition-all duration-300">
      <div className="flex justify-between items-center mx-auto px-6 max-w-6xl h-16">

        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="flex justify-center items-center bg-linear-to-tr from-primary to-secondary shadow-lg shadow-primary/20 rounded-lg w-8 h-8">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground text-high-contrast text-lg tracking-tight">
            Myelin<span className="text-secondary">.</span>
          </span>
        </div>

        <nav className="hidden sm:flex items-center gap-8 font-medium text-muted-high-contrast text-xs uppercase tracking-wide">
          <a href="#features" className="hover:text-enhanced-contrast transition-colors">Features</a>
          <Link href="/dashboard" className="font-semibold text-secondary hover:text-enhanced-contrast transition-colors">Try App Demo</Link>
        </nav>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex justify-center items-center bg-muted hover:bg-accent p-2 border border-border rounded-lg focus-ring-enhanced text-muted-foreground hover:text-enhanced-contrast transition-all cursor-pointer"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>

          {/* Access Trigger Button */}
          <button
            onClick={() => {
              const inputEl = document.getElementById("waitlist-email");
              if (inputEl) {
                inputEl.focus({ preventScroll: true });
                inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="bg-muted hover:bg-accent px-4 py-2 border border-border rounded-lg focus-ring-enhanced font-semibold text-enhanced-contrast text-xs transition-all cursor-pointer"
          >
            Get Access
          </button>
        </div>

      </div>
    </header>
  );
}
