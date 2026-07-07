export interface WaitlistUser {
  id: string;
  email: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  content: string; // Markdown or rich text
  mood?: 'productive' | 'neutral' | 'relaxed' | 'stressed' | 'tired';
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'income';
  createdAt: string;
}

// Simple helper validation/utility
export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Dashboard Specific Types
export interface DayLogEvent {
  title: string;
  time: string;
}

export interface DayLogExpense {
  title: string;
  amount: number;
}

export interface DayLog {
  journal?: string;
  mood?: string;
  events?: DayLogEvent[];
  expenses?: DayLogExpense[];
}

export interface UserSessionData {
  name: string;
  email: string;
  currency: string;
  theme: "light" | "dark";
  emailPermission: boolean;
  calendarPermission: boolean;
}

export const LS_KEYS = {
  ONBOARDED: "myelin_onboarded",
  USER_NAME: "myelin_user_name",
  USER_EMAIL: "myelin_user_email",
  CURRENCY: "myelin_currency",
  THEME: "myelin_theme",
  EMAIL_PERMISSION: "myelin_email_permission",
  CALENDAR_PERMISSION: "myelin_calendar_permission",
  GOOGLE_CONNECTED: "myelin_google_connected",
  GOOGLE_EMAIL: "myelin_google_email",
  GOOGLE_NAME: "myelin_google_name",
  DASHBOARD_LOGS: "myelin_dashboard_logs",
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  THB: "฿",
  JPY: "¥",
  GBP: "£",
};

export * from "./supabase";
export * from "./utils";
