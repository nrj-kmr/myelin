import React, { useState } from "react";
import { BookOpen, Coins, Calendar } from "lucide-react";
import { DayLog, CURRENCY_SYMBOLS } from "@myelin/core";

interface NarrativeWorkspaceProps {
  logs: Record<string, DayLog>;
  currency: string;
  selectedDateKey: string;
  onSelectDate: (date: Date) => void;
}

export function NarrativeWorkspace({
  logs,
  currency,
  selectedDateKey,
  onSelectDate,
}: NarrativeWorkspaceProps) {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"journal" | "expenditure">("journal");

  const formatKeyDate = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const handleDateClick = (key: string) => {
    const [y, m, d] = key.split("-").map(Number);
    onSelectDate(new Date(y, m - 1, d));
  };

  return (
    <div className="bg-card/65 backdrop-blur-md border border-border p-6 rounded-2xl shadow-xl flex flex-col gap-5 min-h-[380px]">
      {/* Tab Header Selector */}
      <div className="flex justify-between items-center pb-3 border-b border-border">
        <div className="flex gap-1 bg-muted p-0.5 border border-border rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveWorkspaceTab("journal")}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px] ${
              activeWorkspaceTab === "journal"
                ? "bg-card shadow-sm text-amber-400 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Journal Logs
          </button>
          <button
            onClick={() => setActiveWorkspaceTab("expenditure")}
            className={`px-4 py-2 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-mono uppercase tracking-wider text-[10px] ${
              activeWorkspaceTab === "expenditure"
                ? "bg-card shadow-sm text-chart-2 font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Coins className="w-3.5 h-3.5" /> Expenditure
          </button>
        </div>
      </div>

      {/* Workspace Content rendering based on Tab */}
      <div className="flex flex-col flex-1">
        {/* 1. JOURNAL LOGS TAB */}
        {activeWorkspaceTab === "journal" && (
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1 animate-fadeIn">
            {Object.keys(logs).filter((key) => logs[key].journal || (logs[key].events && logs[key].events.length > 0) || (logs[key].expenses && logs[key].expenses.length > 0)).length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-10">Your journal feed is empty. Select a date on the calendar and write down your thoughts.</p>
            ) : (
              Object.entries(logs)
                .filter(([_, log]) => log.journal || (log.events && log.events.length > 0) || (log.expenses && log.expenses.length > 0))
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([key, log]) => {
                  const hasEvents = log.events && log.events.length > 0;
                  const hasExpenses = log.expenses && log.expenses.length > 0;
                  const isSelectedDate = key === selectedDateKey;
                  const dayExpensesTotal = log.expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;

                  return (
                    <div
                      key={key}
                      onClick={() => handleDateClick(key)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-2.5 ${
                        isSelectedDate
                          ? "bg-primary/5 border-primary shadow-sm"
                          : "bg-muted/40 border-border/40 hover:border-secondary/40 hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono font-semibold">
                        <span className="text-secondary">{formatKeyDate(key)}</span>
                        {log.mood && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase text-[9px] tracking-wide font-mono">
                            {log.mood}
                          </span>
                        )}
                      </div>
                      
                      {log.journal ? (
                        <p className="text-xs text-foreground font-light leading-relaxed">{log.journal}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic font-light">No thoughts logged for this day.</p>
                      )}

                      {(hasEvents || hasExpenses) && (
                        <div className="flex flex-wrap gap-2 pt-2.5 border-t border-border/30 mt-1">
                          {hasEvents && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-secondary/5 border border-secondary/15 text-[10px] text-secondary font-mono">
                              <Calendar className="w-3 h-3" />
                              <span>{log.events?.length} schedules</span>
                            </div>
                          )}
                          {hasExpenses && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded bg-primary/5 border border-primary/15 text-[10px] text-primary font-mono">
                              <Coins className="w-3 h-3" />
                              <span>{CURRENCY_SYMBOLS[currency]}{dayExpensesTotal.toFixed(2)} spent</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* 2. EXPENDITURE TAB */}
        {activeWorkspaceTab === "expenditure" && (
          <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1 animate-fadeIn">
            {Object.keys(logs).filter((key) => logs[key].expenses && logs[key].expenses.length > 0).length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-10">No transactions recorded. Select a date on the calendar and log expenses under Ledger.</p>
            ) : (
              Object.entries(logs)
                .filter(([_, log]) => log.expenses && log.expenses.length > 0)
                .sort((a, b) => b[0].localeCompare(a[0]))
                .map(([key, log]) => {
                  const dayExpensesTotal = log.expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
                  const isSelectedDate = key === selectedDateKey;

                  return (
                    <div
                      key={key}
                      onClick={() => handleDateClick(key)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-2.5 ${
                        isSelectedDate
                          ? "bg-secondary/5 border-secondary shadow-sm"
                          : "bg-muted/40 border-border/40 hover:border-secondary/40 hover:bg-muted/70"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono font-semibold">
                        <span className="text-secondary">{formatKeyDate(key)}</span>
                        <span className="text-primary font-bold">
                          Total: {CURRENCY_SYMBOLS[currency]}{dayExpensesTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-1.5 mt-1">
                        {log.expenses?.map((exp, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-border/20 last:border-0">
                            <span className="text-foreground font-light">{exp.title}</span>
                            <span className="font-mono font-semibold text-muted-foreground">-{CURRENCY_SYMBOLS[currency]}{exp.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
