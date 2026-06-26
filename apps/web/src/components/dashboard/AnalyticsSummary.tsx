import React from "react";
import { Clock, Coins, Calendar as CalIcon, TrendingUp } from "lucide-react";

interface AnalyticsSummaryProps {
  totalJournalEntries: number;
  totalExpenses: number;
  totalEvents: number;
  consistencyScore: number;
  currencySymbol?: string;
}

export function AnalyticsSummary({
  totalJournalEntries,
  totalExpenses,
  totalEvents,
  consistencyScore,
  currencySymbol = "$",
}: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      
      {/* Time Logged Card */}
      <div className="p-4 rounded-xl bg-card/65 backdrop-blur-md border border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Days Logged</p>
          <p className="text-lg font-bold text-foreground font-mono mt-0.5">{totalJournalEntries} days</p>
        </div>
      </div>

      {/* Expenses Card */}
      <div className="p-4 rounded-xl bg-card/65 backdrop-blur-md border border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Total Spent</p>
          <p className="text-lg font-bold text-secondary font-mono mt-0.5">{currencySymbol}{totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {/* Upcoming Events Card */}
      <div className="p-4 rounded-xl bg-card/65 backdrop-blur-md border border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <CalIcon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Schedules</p>
          <p className="text-lg font-bold text-foreground font-mono mt-0.5">{totalEvents} items</p>
        </div>
      </div>

      {/* Consistency Card */}
      <div className="p-4 rounded-xl bg-card/65 backdrop-blur-md border border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Reflex Score</p>
          <p className="text-lg font-bold text-secondary font-mono mt-0.5">{consistencyScore}%</p>
        </div>
      </div>

    </div>
  );
}
