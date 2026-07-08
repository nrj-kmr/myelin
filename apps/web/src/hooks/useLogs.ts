"use client";

import { useState, useCallback } from "react";
import { DayLog, LS_KEYS } from "@myelin/core";

// Generate relative date string offsets for mock data
const getDateOffsetKey = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

export function useLogs(userEmail: string) {
  const [logs, setLogs] = useState<Record<string, DayLog>>({});
  const [isLogsLoaded, setIsLogsLoaded] = useState(false);

  const fetchLogs = useCallback(async (emailToFetch: string) => {
    if (emailToFetch) {
      try {
        const res = await fetch(`/api/user/logs?email=${encodeURIComponent(emailToFetch)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.logs) {
            setLogs(data.logs);
            localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(data.logs));
            setIsLogsLoaded(true);
            return;
          }
        }
      } catch (err) {
        console.warn("PostgreSQL unavailable, failing back to local storage logs cache.", err);
      }
    }

    // Local storage fallback
    const savedLogs = localStorage.getItem(LS_KEYS.DASHBOARD_LOGS);
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (err) {
        console.error("Error parsing saved local logs:", err);
      }
    } else {
      // Initial setup mock data
      const initialMockLogs: Record<string, DayLog> = {
        [getDateOffsetKey(-3)]: {
          journal: "Spent the morning mapping the Turborepo workspace. Shared core TypeScript models and linked app dependencies successfully.",
          mood: "productive",
          expenses: [{ title: "Domain Registration", amount: 12.00 }],
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
        }
      };
      setLogs(initialMockLogs);
      localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(initialMockLogs));
    }
    setIsLogsLoaded(true);
  }, []);

  // Helper to commit log writes to PostgreSQL
  const writeLogToDb = async (dateKey: string, action: string, payload: any) => {
    if (!userEmail) return;
    try {
      await fetch("/api/user/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail,
          dateKey,
          action,
          payload,
        }),
      });
    } catch (err) {
      console.warn("Database log write skipped (PostgreSQL offline). Cache updated.", err);
    }
  };

  const updateLogsLocally = (updated: Record<string, DayLog>) => {
    setLogs(updated);
    localStorage.setItem(LS_KEYS.DASHBOARD_LOGS, JSON.stringify(updated));
  };

  const handleSaveJournal = (dateKey: string, journalText: string, moodVal: string) => {
    const updated = { ...logs };
    if (!updated[dateKey]) updated[dateKey] = {};
    updated[dateKey].journal = journalText;
    updated[dateKey].mood = moodVal;
    
    updateLogsLocally(updated);
    writeLogToDb(dateKey, "saveJournal", { journal: journalText, mood: moodVal });
  };

  const handleAddEvent = (dateKey: string, title: string, time: string) => {
    const updated = { ...logs };
    if (!updated[dateKey]) updated[dateKey] = {};
    if (!updated[dateKey].events) updated[dateKey].events = [];
    updated[dateKey].events.push({ title, time });

    updateLogsLocally(updated);
    writeLogToDb(dateKey, "addEvent", { title, time });
  };

  const handleEditEvent = (dateKey: string, index: number, title: string, time: string) => {
    const updated = { ...logs };
    if (updated[dateKey] && updated[dateKey].events && updated[dateKey].events![index]) {
      updated[dateKey].events![index] = { title, time };
      updateLogsLocally(updated);
      writeLogToDb(dateKey, "editEvent", { index, title, time });
    }
  };

  const handleDeleteEvent = (dateKey: string, index: number) => {
    const updated = { ...logs };
    const event = updated[dateKey]?.events?.[index];
    if (event) {
      updated[dateKey].events!.splice(index, 1);
      updateLogsLocally(updated);
      writeLogToDb(dateKey, "deleteEvent", { title: event.title, time: event.time });
    }
  };

  const handleAddExpense = (dateKey: string, title: string, amount: number) => {
    const updated = { ...logs };
    if (!updated[dateKey]) updated[dateKey] = {};
    if (!updated[dateKey].expenses) updated[dateKey].expenses = [];
    updated[dateKey].expenses.push({ title, amount });

    updateLogsLocally(updated);
    writeLogToDb(dateKey, "addExpense", { title, amount });
  };

  const handleDeleteExpense = (dateKey: string, index: number) => {
    const updated = { ...logs };
    const expense = updated[dateKey]?.expenses?.[index];
    if (expense) {
      updated[dateKey].expenses!.splice(index, 1);
      updateLogsLocally(updated);
      writeLogToDb(dateKey, "deleteExpense", { title: expense.title, amount: expense.amount });
    }
  };

  return {
    logs,
    isLogsLoaded,
    fetchLogs,
    handleSaveJournal,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    handleAddExpense,
    handleDeleteExpense,
  };
}
