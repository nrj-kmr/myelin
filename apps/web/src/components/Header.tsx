"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brain,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { useUserSession } from "@/hooks/useUserSession";
import { useSessionStore } from "@/store/useSessionStore";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase, isSupabaseConfigured, LS_KEYS } from "@myelin/core";

export function Header() {
  const router = useRouter();
  const { isLoaded, isOnboarded, userName } = useUserSession();
  const { avatarUrl, initSession } = useSessionStore();

  React.useEffect(() => {
    initSession();
  }, [initSession]);

  const handleSignOut = async () => {
    const keysToRemove = [
      LS_KEYS.ONBOARDED,
      LS_KEYS.USER_NAME,
      LS_KEYS.USER_EMAIL,
      LS_KEYS.CURRENCY,
      LS_KEYS.EMAIL_PERMISSION,
      LS_KEYS.CALENDAR_PERMISSION,
      LS_KEYS.GOOGLE_CONNECTED,
      LS_KEYS.GOOGLE_EMAIL,
      LS_KEYS.GOOGLE_NAME,
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }

    window.location.reload();
  };

  return (
    <header className="top-0 z-50 fixed inset-x-0 bg-background/80 backdrop-blur-md border-border/50 border-b transition-colors duration-300">
      <div className="flex justify-between items-center mx-auto px-6 max-w-7xl h-20">
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex justify-center items-center bg-accent/10 border border-accent/20 rounded-lg w-8 h-8 group-hover:scale-110 transition-transform duration-300">
            <Brain className="w-4 h-4 text-accent-foreground" />
          </div>
          <span className="font-mono text-foreground text-sm uppercase tracking-widest">
            Myelin
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#features"
            className="font-mono text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest transition-colors"
          >
            Features
          </a>
          <Link
            href="/dashboard"
            className="font-mono text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest transition-colors"
          >
            Dashboard
          </Link>
          <div className="flex items-center gap-4 pl-4 border-border/50 border-l">
            <ThemeToggle />
          </div>
        </nav>

        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
        </div>

        <div className="hidden md:flex items-center gap-3">
          {/* Conditional Auth Actions (handling flicker) */}
          {!isLoaded ? (
            <div className="bg-muted/20 border border-border/50 rounded-md w-24 h-8 animate-pulse" />
          ) : isOnboarded ? (
            <div className="group relative">
              <button className="flex items-center gap-2 bg-muted hover:bg-accent px-3 py-1 border border-border rounded-md hover:scale-105 transition-all cursor-pointer">
                <span className="font-mono font-medium text-xs uppercase tracking-wider text-accent-foreground">
                  {userName || "User"}
                </span>
                <div className="flex justify-center items-center bg-primary/20 rounded-full w-6 h-6 overflow-hidden text-primary">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              <div className="invisible group-hover:visible top-full right-0 z-50 absolute flex flex-col bg-card opacity-0 group-hover:opacity-100 shadow-xl mt-2 border border-border rounded-xl w-48 scale-95 group-hover:scale-100 origin-top-right transition-all duration-200 transform">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 hover:bg-muted px-4 py-3 rounded-t-xl text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-2 hover:bg-muted px-4 py-3 text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" /> Settings
                </Link>
                <div className="border-border border-t" />
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to sign out?")) {
                      handleSignOut();
                    }
                  }}
                  className="flex items-center gap-2 hover:bg-red-500/10 px-4 py-3 rounded-b-xl w-full text-red-500 text-xs text-left transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-5 py-2 border border-primary/20 rounded-md font-mono text-primary text-xs uppercase tracking-widest transition-all hover:-translate-y-0.5"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
