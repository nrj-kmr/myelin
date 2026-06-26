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
