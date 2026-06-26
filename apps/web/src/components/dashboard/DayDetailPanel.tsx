"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Calendar as CalIcon, Coins, Trash2, Plus, Smile } from "lucide-react";

interface DayLog {
  journal?: string;
  mood?: string;
  events?: Array<{ title: string; time: string }>;
  expenses?: Array<{ title: string; amount: number }>;
}

interface DayDetailPanelProps {
  selectedDate: Date;
  log?: DayLog;
  onSaveJournal: (dateKey: string, journal: string, mood: string) => void;
  onAddEvent: (dateKey: string, title: string, time: string) => void;
  onDeleteEvent: (dateKey: string, index: number) => void;
  onAddExpense: (dateKey: string, title: string, amount: number) => void;
  onDeleteExpense: (dateKey: string, index: number) => void;
  currencySymbol?: string;
}

export function DayDetailPanel({
  selectedDate,
  log = {},
  onSaveJournal,
  onAddEvent,
  onDeleteEvent,
  onAddExpense,
  onDeleteExpense,
  currencySymbol = "$",
}: DayDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"journal" | "schedule" | "ledger">("journal");
  
  // Local form inputs
  const [journal, setJournal] = useState("");
  const [mood, setMood] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventTime, setEventTime] = useState("10:00");
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const dateKey = (() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  // Synchronize inputs when selectedDate changes
  useEffect(() => {
    setJournal(log?.journal || "");
    setMood(log?.mood || "neutral");
    setEventTitle("");
    setExpenseTitle("");
    setExpenseAmount("");
  }, [dateKey, log]);

  const handleJournalSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveJournal(dateKey, journal, mood);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    onAddEvent(dateKey, eventTitle.trim(), eventTime);
    setEventTitle("");
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseTitle.trim() || isNaN(amt) || amt <= 0) return;
    onAddExpense(dateKey, expenseTitle.trim(), amt);
    setExpenseTitle("");
    setExpenseAmount("");
  };

  const formatHeaderDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const moods = [
    { label: "Productive 🧠", value: "productive" },
    { label: "Neutral 😐", value: "neutral" },
    { label: "Relaxed 🌊", value: "relaxed" },
    { label: "Stressed ⚡", value: "stressed" },
    { label: "Tired 😴", value: "tired" }
  ];

  return (
    <div className="flex flex-col gap-5 p-5 bg-card/65 backdrop-blur-md border border-border rounded-2xl h-full">
      {/* Date Header */}
      <div>
        <p className="font-mono font-bold card-text-contrast text-[10px] uppercase tracking-widest">Selected Day</p>
        <h3 className="mt-0.5 font-bold card-text-contrast text-foreground text-sm">{formatHeaderDate(selectedDate)}</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-0.5 border border-border rounded-lg text-xs">
        <button
          onClick={() => setActiveTab("journal")}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "journal" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Journal
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "schedule" ? "bg-card shadow-sm text-secondary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalIcon className="w-3.5 h-3.5" /> Schedules
        </button>
        <button
          onClick={() => setActiveTab("ledger")}
          className={`flex-1 py-1.5 rounded-md font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "ledger" ? "bg-card shadow-sm text-chart-2" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Coins className="w-3.5 h-3.5" /> Ledger
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex flex-col flex-1 min-h-75 overflow-y-auto">
        {activeTab === "journal" && (
          <form onSubmit={handleJournalSave} className="flex flex-col flex-1 gap-4">
            {/* Mood Picker */}
            <div className="space-y-1.5">
              <span className="font-semibold card-text-contrast text-[10px] uppercase tracking-wider">How was the flow?</span>
              <div className="gap-1.5 grid grid-cols-2">
                {moods.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value)}
                    className={`py-1.5 px-2 rounded-lg border text-left text-xs font-medium cursor-pointer transition-all ${
                      mood === m.value
                        ? "bg-primary/10 border-primary/45 text-primary shadow-sm"
                        : "bg-card border-border card-text-contrast hover:bg-muted"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="flex flex-col flex-1 space-y-1.5">
              <span className="font-semibold card-text-contrast text-[10px] uppercase tracking-wider">Write your thoughts</span>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="Log your achievements, blockages, or lessons today..."
                className="flex-1 bg-card p-3 border border-border focus:border-primary/40 rounded-xl focus:outline-none w-full min-h-35 card-text-contrast text-foreground text-xs resize-none placeholder-muted-foreground"
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:opacity-90 shadow py-2.5 rounded-xl focus-ring-enhanced w-full font-semibold text-primary-foreground text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Save Daily Journal
            </button>
          </form>
        )}

        {activeTab === "schedule" && (
          <div className="flex flex-col flex-1 gap-4">
            {/* Event List */}
            <div className="flex-1 space-y-2.5">
              <span className="block font-semibold card-text-contrast text-[10px] uppercase tracking-wider">Upcoming Items</span>
              {!log?.events || log.events.length === 0 ? (
                <p className="py-4 card-text-contrast text-muted-foreground text-xs italic">No events scheduled. Plan your future days.</p>
              ) : (
                <div className="space-y-1.5 pr-1 max-h-45 overflow-y-auto">
                  {log.events.map((evt, idx) => (
                    <div key={idx} className="group flex justify-between items-center bg-card p-2 border border-border hover:border-secondary/40 rounded-lg">
                      <div>
                        <p className="font-medium card-text-contrast text-foreground text-xs">{evt.title}</p>
                        <p className="mt-0.5 font-mono card-text-contrast text-[10px] text-secondary">{evt.time}</p>
                      </div>
                      <button
                        onClick={() => onDeleteEvent(dateKey, idx)}
                        className="hover:bg-destructive/10 opacity-0 group-hover:opacity-100 p-1 rounded focus-ring-enhanced card-text-contrast hover:text-destructive transition-all cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Event */}
            <form onSubmit={handleAddEventSubmit} className="space-y-2 pt-3 border-border border-t">
              <span className="block font-semibold card-text-contrast text-[10px] uppercase tracking-wider">Quick Add Schedule</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Review schema..."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="flex-1 bg-card px-2.5 py-1.5 border border-border focus:border-secondary/40 rounded-lg focus:outline-none card-text-contrast text-foreground text-xs placeholder-muted-foreground"
                />
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="bg-card px-2 py-1.5 border border-border rounded-lg focus:outline-none font-mono card-text-contrast text-foreground text-xs"
                />
                <button
                  type="submit"
                  className="bg-secondary/10 hover:bg-secondary/20 p-2 rounded-lg focus-ring-enhanced text-secondary transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "ledger" && (
          <div className="flex flex-col flex-1 gap-4">
            {/* Expense List */}
            <div className="flex-1 space-y-2.5">
              <span className="block font-semibold card-text-contrast text-[10px] uppercase tracking-wider">Expenses Logged</span>
              {!log?.expenses || log.expenses.length === 0 ? (
                <p className="py-4 card-text-contrast text-muted-foreground text-xs italic">No transactions. Track your spending buffer.</p>
              ) : (
                <div className="space-y-1.5 pr-1 max-h-45 overflow-y-auto">
                  {log.expenses.map((exp, idx) => (
                    <div key={idx} className="group flex justify-between items-center bg-card p-2 border border-border hover:border-chart-2/40 rounded-lg">
                      <div>
                        <p className="font-medium card-text-contrast text-foreground text-xs">{exp.title}</p>
                        <p className="mt-0.5 font-mono card-text-contrast text-[10px] text-chart-2">{currencySymbol}{exp.amount.toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => onDeleteExpense(dateKey, idx)}
                        className="hover:bg-destructive/10 opacity-0 group-hover:opacity-100 p-1 rounded focus-ring-enhanced card-text-contrast hover:text-destructive transition-all cursor-pointer"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Expense */}
            <form onSubmit={handleAddExpenseSubmit} className="space-y-2 pt-3 border-border border-t">
              <span className="block font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">Record Transaction</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Hosting server..."
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  className="flex-1 bg-card px-2.5 py-1.5 border border-border focus:border-chart-2/40 rounded-lg focus:outline-none text-foreground text-xs placeholder-muted-foreground"
                />
                <input
                  type="number"
                  placeholder={`${currencySymbol}0.00`}
                  step="0.01"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="bg-card px-2 py-1.5 border border-border focus:border-chart-2/40 rounded-lg focus:outline-none w-20 font-mono text-foreground text-xs placeholder-muted-foreground"
                />
                <button
                  type="submit"
                  className="bg-chart-2/10 hover:bg-chart-2/20 p-2 rounded-lg text-chart-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
