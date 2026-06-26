import React from "react";
import { Clock, Coins, Activity } from "lucide-react";

export function Features() {
  return (
    <section id="features" className="py-20 px-6 max-w-4xl mx-auto border-t border-border relative z-10">

      {/* Mockup Dashboard Card */}
      <div className="w-full rounded-xl border border-border bg-white/50 dark:bg-black/40 p-4 sm:p-5 shadow-2xl relative overflow-hidden mb-16">
        {/* Window controls */}
        <div className="flex items-center justify-between pb-3 border-b border-border mb-5">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[9px] text-zinc-500 dark:text-zinc-600 font-mono tracking-widest">MYELIN_INTERFACE_PREVIEW</span>
          <div className="w-6 h-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">

          {/* Col 1: Time Log */}
          <div className="p-4 rounded-lg bg-card/50 border border-border flex flex-col gap-3">
            <span className="flex items-center gap-1.5 text-[10px] card-text-contrast font-semibold uppercase tracking-wider">
              <Clock className="w-3 h-3 text-primary" /> Time Log
            </span>
            <div className="p-2.5 rounded bg-primary/5 border border-primary/10">
              <p className="text-[10px] text-primary font-semibold">10:00 AM - Dev</p>
              <p className="text-xs card-text-contrast mt-0.5 font-light">Created @myelin/core with shared types.</p>
            </div>
            <div className="p-2.5 rounded bg-muted/45 border border-border">
              <p className="text-[10px] card-text-contrast font-semibold">02:30 PM - Strategy</p>
              <p className="text-xs card-text-contrast mt-0.5 font-light">Refactored landing app into modular components.</p>
            </div>
          </div>

          {/* Col 2: Ledger */}
          <div className="p-4 rounded-lg bg-card/50 border border-border flex flex-col gap-3">
            <span className="flex items-center gap-1.5 text-[10px] card-text-contrast font-semibold uppercase tracking-wider">
              <Coins className="w-3 h-3 text-secondary" /> Ledger
            </span>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs py-1 hover:bg-accent/40 rounded">
                <span className="card-text-contrast font-light">Cloud Server</span>
                <span className="text-secondary font-mono font-medium">-$12.00</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 hover:bg-accent/40 rounded">
                <span className="card-text-contrast font-light">Freelance Deposit</span>
                <span className="text-chart-1 font-mono font-medium">+$2,450.00</span>
              </div>
            </div>
            <div className="mt-auto p-2 rounded bg-secondary/10 border border-secondary/20 flex justify-between items-center">
              <span className="text-[10px] text-secondary card-text-contrast">Remaining</span>
              <span className="text-xs card-text-contrast font-bold font-mono">$482.20</span>
            </div>
          </div>

          {/* Col 3: Balance / Sync */}
          <div className="p-4 rounded-lg bg-card/50 border border-border flex flex-col gap-3 items-center justify-center text-center">
            <span className="flex items-center gap-1.5 text-[10px] card-text-contrast font-semibold uppercase tracking-wider self-start">
              <Activity className="w-3 h-3 text-primary" /> Sync
            </span>
            
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center p-[4px] relative"
              style={{
                background: "conic-gradient(from 0deg, var(--secondary) 0% 94%, rgba(95, 135, 135, 0.15) 94% 100%)"
              }}
            >
              <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                <span className="text-sm font-bold font-mono card-text-contrast">94%</span>
              </div>
            </div>
            
            <p className="text-[10px] card-text-contrast font-light mt-1">Consistency rating is high. Unrecorded cash leak down 42%.</p>
          </div>

        </div>
      </div>

      {/* Feature minimal summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-high-contrast">1. Bullet Journaling</h3>
          <p className="text-muted-high-contrast text-xs leading-relaxed font-light">
            Quickly log completed tasks and mood. Jot down next-day ideas without the overhead of heavy calendars.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-high-contrast">2. Micro Ledger</h3>
          <p className="text-muted-high-contrast text-xs leading-relaxed font-light">
            Log expenses instantly. Maintain a visual balance of your daily cash buffer and recurring subscriptions.
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-high-contrast">3. Systemic Sync</h3>
          <p className="text-muted-high-contrast text-xs leading-relaxed font-light">
            Align calendar events directly with costs. Discover how your schedule affects your spending habits.
          </p>
        </div>
      </div>

    </section>
  );
}
