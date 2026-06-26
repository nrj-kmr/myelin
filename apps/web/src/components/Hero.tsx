"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, Mail, Sparkles, ExternalLink, Calendar as CalIcon } from "lucide-react";
import { CursorAsciiEffect } from "./CursorAsciiEffect";

export function Hero() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Auto-dismiss waitlist response message after 8 seconds
  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        setStatus("idle");
        setMessage("");
        setPreviewUrl(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");
    setPreviewUrl(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Welcome to Myelin!");
        setPreviewUrl(data.previewUrl || null);
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Failed to join.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Connection error. Please try again.");
    }
  };

  return (
    <section className="z-10 relative pt-24 pb-16 w-full overflow-hidden">
      <CursorAsciiEffect />
      
      {/* Centered content container positioned above the canvas */}
      <div className="z-10 relative flex flex-col items-center mx-auto px-6 max-w-4xl text-center">
        {/* Visual Badge */}
        <div className="inline-flex relative items-center gap-1.5 bg-primary/10 mb-8 px-3 py-1 border border-primary/20 rounded-full font-semibold text-primary text-xs animate-float">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Modular Cross-Platform Scaffold</span>
        </div>

        {/* Main Headline */}
        <h1 className="mb-6 font-extrabold text-4xl sm:text-6xl leading-[1.1] tracking-tight">
          <span className="bg-clip-text bg-linear-to-r from-primary to-secondary text-transparent">Reclaim your time.</span>
          <br />
          <span className="bg-clip-text bg-linear-to-r from-secondary to-primary text-transparent">Balance your ledger.</span>
        </h1>

        {/* Minimal Subtitle */}
        <p className="mb-10 max-w-lg font-light text-muted-foreground text-sm sm:text-base leading-relaxed">
          A fast, beautiful space to log your day, brainstorm ideas, and track expenses. 
          Speed up your focus, protect your assets.
        </p>

        {/* Waitlist Form */}
        <div id="waitlist-form" className="bg-card/65 backdrop-blur-md mb-6 p-1 border border-border focus-within:border-primary/50 rounded-xl focus-within:ring-2 focus-within:ring-primary/15 w-full max-w-md transition-all duration-300">
          <form onSubmit={handleSubmit} className="flex sm:flex-row flex-col gap-1.5">
            <div className="relative flex flex-1 items-center gap-2 bg-transparent px-3">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <input
                id="waitlist-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent py-2 focus:outline-none w-full text-foreground text-sm"
                required
                disabled={status === "loading"}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex justify-center items-center gap-1.5 bg-linear-to-r from-primary to-secondary hover:opacity-90 shadow-md mr-1 px-5 py-2.5 rounded-lg focus-ring-enhanced font-semibold text-primary-foreground text-xs uppercase tracking-wider active:scale-98 transition-all cursor-pointer"
            >
              {status === "loading" ? "Joining..." : "Join Waitlist"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Response Message Alert */}
        {status !== "idle" && message && (
          <div
            className={`w-full max-w-md p-4 rounded-xl text-xs border mb-6 transition-all animate-float ${
              status === "success"
                ? "bg-card border-emerald-500/30 text-foreground"
                : "bg-card border-destructive/30 text-foreground"
            }`}
          >
            <div className="flex justify-center items-start gap-2">
              {status === "success" && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
              <div className="w-full text-left">
                <p className="font-semibold text-foreground">{message}</p>
                
                {status === "success" && (
                  <div className="flex sm:flex-row flex-col justify-between items-center gap-3 bg-muted mt-3 p-2.5 border border-border rounded-lg">
                    <span className="text-[11px] text-muted-foreground">Explore the interactive dashboard:</span>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-1 bg-primary hover:opacity-90 px-3 py-1.5 rounded-md font-bold text-[11px] text-primary-foreground transition-colors"
                    >
                      Launch App Demo <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}

                {/* Ethereal Mail Sandbox Preview link */}
                {previewUrl && (
                  <div className="mt-2.5 pt-2 border-border border-t">
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[11px] text-primary hover:underline"
                    >
                      View actual email sent (Sandbox Ethereal Inbox) <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
