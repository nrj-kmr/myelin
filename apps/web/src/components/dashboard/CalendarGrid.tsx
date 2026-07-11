import React from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Calendar as CalIcon, Coins } from "lucide-react";
import { DayLog } from "@myelin/core";

interface CalendarGridProps {
  selectedDate: Date;
  viewingMonth: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (month: Date) => void;
  logs: Record<string, DayLog>;
  isFlexible?: boolean;
  onContextMenuDay?: (date: Date, e: React.MouseEvent) => void;
}

export function CalendarGrid({
  selectedDate,
  viewingMonth,
  onDateSelect,
  onMonthChange,
  logs,
  isFlexible = false,
  onContextMenuDay,
}: CalendarGridProps) {
  const year = viewingMonth.getFullYear();
  const month = viewingMonth.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Create dates list
  const days = [];
  // Add empty slots for the start of the month
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  // Add actual days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const handlePrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const formatDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getDayTooltip = (log?: DayLog) => {
    const lines: string[] = [];

    if (log?.journal) {
      lines.push(`Journal: ${log.journal}`);
    }

    if (log?.mood) {
      lines.push(`Mood: ${log.mood}`);
    }

    if (log?.events?.length) {
      lines.push(
        `Events: ${log.events.map((event) => `${event.time} ${event.title}`).join(" | ")}`
      );
    }

    if (log?.expenses?.length) {
      lines.push(
        `Expenses: ${log.expenses.map((expense) => `${expense.title} $${expense.amount.toFixed(2)}`).join(" | ")}`
      );
    }

    return lines.length > 0 ? lines.join("\n") : "Add event, journal, or expense";
  };

  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="flex flex-col bg-card/65 backdrop-blur-md p-4 border border-border rounded-lg w-full flex-none">
      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-4 px-2 w-full">
        <button
          onClick={handlePrevMonth}
          className="hover:bg-accent p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2
          className="font-bold text-foreground hover:text-primary text-sm text-center uppercase tracking-tight transition-colors cursor-pointer"
          onClick={() => {
            const now = new Date();
            onMonthChange(new Date(now.getFullYear(), now.getMonth(), 1));
          }}
          title="Return to current month"
        >
          {monthNames[month]} <span className="font-mono font-medium text-foreground">{year}</span>
        </h2>
        <button
          onClick={handleNextMonth}
          className="hover:bg-accent p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Titles */}
      <div className="gap-1 grid grid-cols-7 mb-2 text-center">
        {weekdays.map((day, idx) => (
          <div key={idx} className="py-1 font-mono font-bold text-[10px] text-primary uppercase tracking-normal">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className={`flex-1 gap-1 md:gap-1.5 grid grid-cols-7 select-none ${isFlexible ? 'auto-rows-fr' : ''}`}>
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className={isFlexible ? '' : 'aspect-square'} />;
          }

          const key = formatDateKey(date);
          const log = logs[key];
          const hasJournal = !!log?.journal;
          const hasEvents = log?.events && log.events.length > 0;
          const hasExpenses = log?.expenses && log.expenses.length > 0;

          const active = isSelected(date);
          const current = isToday(date);
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <button
              key={key}
              onClick={() => onDateSelect(date)}
              onContextMenu={(e) => {
                if (onContextMenuDay) {
                  e.preventDefault();
                  onContextMenuDay(date, e);
                }
              }}
              title={getDayTooltip(log)}
              className={`${isFlexible ? 'min-h-14 md:min-h-20 h-full' : 'aspect-square'} overflow-hidden min-h-0 rounded-sm p-1 md:p-1.5 flex flex-col justify-between border text-left transition-all duration-200 cursor-pointer relative group ${active
                ? "bg-primary/10 border-primary/50 shadow-lg shadow-primary/5 text-foreground"
                : current
                  ? "bg-accent border-secondary/40 text-foreground font-bold"
                  : "bg-card border-border hover:bg-muted text-muted-foreground"
                }`}
            >
              {/* Day Number */}
              <span className={`text-xs font-mono font-bold ${active ? "text-primary" : current ? "text-foreground" : isPast ? "text-muted-foreground/60" : "text-muted-foreground"
                }`}>
                {date.getDate()}
              </span>

              {/* Day Indicators */}
              <div className="flex gap-0.5 mt-auto h-1.5 shrink-0">
                {hasJournal && (
                  <span
                    className="bg-amber-500 dark:bg-amber-300 rounded-full w-1.5 h-1.5 shrink-0"
                    title="Journal Logged"
                  />
                )}
                {hasEvents && (
                  <span
                    className="bg-pink-400 rounded-full w-1.5 h-1.5 shrink-0"
                    title="Event Scheduled"
                  />
                )}
                {hasExpenses && (
                  <span
                    className="bg-green-600 dark:bg-green-400 rounded-full w-1.5 h-1.5 shrink-0"
                    title="Expense Tracked"
                  />
                )}
              </div>

              {/* Micro hover indicator */}
              <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/10 rounded-xl transition-colors pointer-events-none" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
