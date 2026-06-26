import React from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Calendar as CalIcon, Coins } from "lucide-react";

interface DayLog {
  journal?: string;
  mood?: string;
  events?: Array<{ title: string; time: string }>;
  expenses?: Array<{ title: string; amount: number }>;
}

interface CalendarGridProps {
  selectedDate: Date;
  viewingMonth: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (month: Date) => void;
  logs: Record<string, DayLog>;
}

export function CalendarGrid({
  selectedDate,
  viewingMonth,
  onDateSelect,
  onMonthChange,
  logs,
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

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col p-5 bg-card/65 backdrop-blur-md border border-border rounded-2xl h-full">
      {/* Month Navigation */}
      <div className="flex justify-center items-center gap-3 mb-6">
        <button
          onClick={handlePrevMonth}
          className="hover:bg-accent p-2 rounded-lg focus-ring-enhanced text-muted-foreground hover:text-enhanced-contrast transition-colors cursor-pointer"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="font-bold text-foreground text-lg tracking-tight">
          {monthNames[month]} <span className="font-mono font-medium card-text-contrast text-muted-foreground">{year}</span>
        </h2>
        <button
          onClick={handleNextMonth}
          className="hover:bg-accent p-2 rounded-lg focus-ring-enhanced text-muted-foreground hover:text-enhanced-contrast transition-colors cursor-pointer"
          aria-label="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday Titles */}
      <div className="gap-1 grid grid-cols-7 mb-2 p-1 text-center">
        {weekdays.map((day) => (
          <div key={day} className="bg-secondary/10 py-1 border rounded font-semibold text-primary text-xs uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 gap-1.5 grid grid-cols-7 select-none">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
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
              title={getDayTooltip(log)}
              className={`aspect-square rounded-sm p-1.5 flex flex-col justify-between border text-left transition-all duration-200 cursor-pointer relative group ${active
                ? "bg-primary/10 border-primary/50 shadow-lg shadow-primary/5 text-foreground"
                : current
                  ? "bg-accent border-secondary/40 text-foreground font-bold"
                  : "bg-card border-border hover:bg-muted text-muted-foreground"
                }`}
            >
              {/* Day Number */}
              <span className={`text-xs font-mono font-bold card-text-contrast ${active ? "text-primary" : current ? "text-secondary" : isPast ? "text-muted-foreground/60" : "text-foreground"
                }`}>
                {date.getDate()}
              </span>

              {/* Day Indicators */}
              <div className="flex gap-0.5 mt-auto">
                {hasJournal && (
                  <span
                    className="bg-primary rounded-full w-1.5 h-1.5"
                    title="Journal Logged"
                  />
                )}
                {hasEvents && (
                  <span
                    className="bg-secondary rounded-full w-1.5 h-1.5"
                    title="Event Scheduled"
                  />
                )}
                {hasExpenses && (
                  <span
                    className="bg-chart-2 rounded-full w-1.5 h-1.5"
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
