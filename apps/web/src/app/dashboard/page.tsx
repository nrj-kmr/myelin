"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, ArrowLeft, RefreshCw, Sun, Moon } from "lucide-react";
import { CalendarGrid } from "@/components/dashboard/CalendarGrid";
import { DayDetailPanel } from "@/components/dashboard/DayDetailPanel";
import { AnalyticsSummary } from "@/components/dashboard/AnalyticsSummary";

interface Event {
  title: string;
  time: string;
}

interface Expense {
  title: string;
  amount: number;
}

interface DayLog {
  journal?: string;
  mood?: string;
  events?: Event[];
  expenses?: Expense[];
}

// Generate relative date string offsets for mock data
const getDateOffsetKey = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewingMonth, setViewingMonth] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isLoaded, setIsLoaded] = useState(false);

  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    THB: "฿",
    JPY: "¥",
    GBP: "£",
  };

  // Initialize and load logs from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem("myelin_dashboard_logs");
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (err) {
        console.error("Error parsing saved logs:", err);
      }
    } else {
      // Default Mock Data centered relative to current date
      const initialMockLogs: Record<string, DayLog> = {
        [getDateOffsetKey(-3)]: {
          journal: "Spent the morning mapping the Turborepo workspace. Shared core TypeScript models and linked app dependencies successfully.",
          mood: "productive",
          expenses: [{ title: "Domain Registration (myelin.app)", amount: 12.00 }],
          events: []
        },
        [getDateOffsetKey(-1)]: {
          journal: "Completed waitlist landing page styling using Tailwind CSS v4. Configured automatic sandboxed email confirmations.",
          mood: "productive",
          expenses: [{ title: "Coffee at Cafe", amount: 4.80 }],
          events: []
        },
        [getDateOffsetKey(0)]: {
          journal: "Today we are building the dashboard calendar system for Myelin!",
          mood: "relaxed",
          expenses: [],
          events: []
        },
        [getDateOffsetKey(2)]: {
          journal: "",
          mood: "neutral",
          expenses: [],
          events: [{ title: "Supabase database schema alignment", time: "10:00" }]
        },
        [getDateOffsetKey(5)]: {
          journal: "",
          mood: "neutral",
          expenses: [],
          events: [{ title: "Expo Mobile boilerplate scaffold", time: "14:00" }]
        }
      };
      setLogs(initialMockLogs);
      localStorage.setItem("myelin_dashboard_logs", JSON.stringify(initialMockLogs));
    }
    const savedCurrency = localStorage.getItem("myelin_currency") || "USD";
    setCurrency(savedCurrency);
    const savedTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    setTheme(savedTheme);
    setIsLoaded(true);
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

  // Save updates helper
  const saveLogs = (updatedLogs: Record<string, DayLog>) => {
    setLogs(updatedLogs);
    localStorage.setItem("myelin_dashboard_logs", JSON.stringify(updatedLogs));
  };

  const handleSaveJournal = (dateKey: string, journalText: string, moodVal: string) => {
    const updated = { ...logs };
    if (!updated[dateKey]) updated[dateKey] = {};
    updated[dateKey].journal = journalText;
    updated[dateKey].mood = moodVal;
    saveLogs(updated);
  };

  const handleAddEvent = (dateKey: string, title: string, time: string) => {
    const updated = { ...logs };
    if (!updated[dateKey]) updated[dateKey] = {};
    if (!updated[dateKey].events) updated[dateKey].events = [];
    updated[dateKey].events.push({ title, time });
    saveLogs(updated);
  };

  const handleDeleteEvent = (dateKey: string, index: number) => {
    const updated = { ...logs };
    if (updated[dateKey]?.events) {
      updated[dateKey].events.splice(index, 1);
      saveLogs(updated);
    }
  };

  const handleAddExpense = (dateKey: string, title: string, amount: number) => {
    const updated = { ...logs };
    if (!updated[dateKey]) updated[dateKey] = {};
    if (!updated[dateKey].expenses) updated[dateKey].expenses = [];
    updated[dateKey].expenses.push({ title, amount });
    saveLogs(updated);
  };

  const handleDeleteExpense = (dateKey: string, index: number) => {
    const updated = { ...logs };
    if (updated[dateKey]?.expenses) {
      updated[dateKey].expenses.splice(index, 1);
      saveLogs(updated);
    }
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all custom logs to default mock data?")) {
      localStorage.removeItem("myelin_dashboard_logs");
      window.location.reload();
    }
  };

  // Compute analytics totals
  const totalJournalEntries = Object.values(logs).filter((l) => !!l.journal).length;
  const totalExpenses = Object.values(logs)
    .flatMap((l) => l.expenses || [])
    .reduce((sum, item) => sum + item.amount, 0);
  const totalEvents = Object.values(logs).flatMap((l) => l.events || []).length;
  
  // Consistency score calculation (baseline 85% + additions)
  const consistencyScore = Math.min(
    100,
    Math.max(50, 85 + (totalJournalEntries * 3) - (totalExpenses > 100 ? 5 : 0))
  );

  const selectedDateKey = (() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const selectedDayLog = logs[selectedDateKey] || {};

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center bg-background min-h-screen font-sans text-foreground">
        <div className="flex flex-col items-center gap-3">
          <Brain className="w-8 h-8 text-primary animate-pulse" />
          <span className="font-mono text-zinc-500 text-xs tracking-wider">LOADING_MYELIN_DESKTOP...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-background selection:bg-primary/30 min-h-screen font-sans text-foreground selection:text-foreground transition-colors duration-300">
      
      {/* Background Blobs Container (clips overflow to prevent empty scrolling/vertical space) */}
      {/* <div className="z-0 absolute inset-0 overflow-hidden pointer-events-none">
        <div className="top-[-10%] left-[-10%] absolute bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full w-[50%] h-[50%]" />
        <div className="right-[-10%] bottom-[-10%] absolute bg-secondary/5 dark:bg-secondary/10 blur-[120px] rounded-full w-[50%] h-[50%]" />
      </div> */}

      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 w-full bg-card/70 backdrop-blur-md border-b border-border">
        <div className="flex justify-between items-center mx-auto px-6 max-w-6xl h-16">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/5 p-2 rounded-lg font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400 text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Waitlist
            </Link>
            <span className="font-light text-zinc-700">|</span>
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground text-sm tracking-tight">Myelin App <span className="bg-secondary/20 ml-1.5 px-1.5 py-1 border border-secondary rounded font-mono font-normal text-xs uppercase tracking-widest">Interactive Demo</span></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex justify-center items-center bg-muted hover:bg-accent p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-3 h-3" />
              ) : (
                <Sun className="w-3 h-3" />
              )}
            </button>

            <div className="flex justify-center items-center bg-muted hover:bg-accent px-2 py-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all cursor-pointer">
              <span className="font-mono font-bold text-[9px] text-zinc-500 uppercase tracking-wider">Currency</span>
              <select
                value={currency}
                onChange={(e) => {
                  const newCur = e.target.value;
                  setCurrency(newCur);
                  localStorage.setItem("myelin_currency", newCur);
                }}
                className="bg-transparent p-0 border-0 focus:outline-none focus:ring-0 font-semibold text-zinc-500 dark:text-zinc-300 text-xs cursor-pointer select-none"
              >
                <option value="USD" className="bg-panel-bg text-foreground">USD ($)</option>
                <option value="INR" className="bg-panel-bg text-foreground">INR (₹)</option>
                <option value="EUR" className="bg-panel-bg text-foreground">EUR (€)</option>
                <option value="THB" className="bg-panel-bg text-foreground">THB (฿)</option>
                <option value="JPY" className="bg-panel-bg text-foreground">JPY (¥)</option>
                <option value="GBP" className="bg-panel-bg text-foreground">GBP (£)</option>
              </select>
            </div>

            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/5 p-2 rounded-lg font-mono font-semibold text-[10px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 uppercase tracking-wider transition-all cursor-pointer"
              title="Reset to initial mock logs"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Demo
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="space-y-6 mx-auto px-6 py-8 max-w-6xl">
        
        {/* Top Summary Stats */}
        <AnalyticsSummary
          totalJournalEntries={totalJournalEntries}
          totalExpenses={totalExpenses}
          totalEvents={totalEvents}
          consistencyScore={consistencyScore}
          currencySymbol={CURRENCY_SYMBOLS[currency]}
        />

        {/* Calendar and Sidebar details */}
        <div className="items-stretch gap-6 grid grid-cols-1 lg:grid-cols-3">
          {/* Calendar Grid takes 2/3 */}
          <div className="lg:col-span-2">
            <CalendarGrid
              selectedDate={selectedDate}
              viewingMonth={viewingMonth}
              onDateSelect={setSelectedDate}
              onMonthChange={setViewingMonth}
              logs={logs}
            />
          </div>

          {/* Details Sidebar takes 1/3 */}
          <div>
            <DayDetailPanel
              selectedDate={selectedDate}
              log={selectedDayLog}
              onSaveJournal={handleSaveJournal}
              onAddEvent={handleAddEvent}
              onDeleteEvent={handleDeleteEvent}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              currencySymbol={CURRENCY_SYMBOLS[currency]}
            />
          </div>
        </div>
      </main>

    </div>
  );
}
