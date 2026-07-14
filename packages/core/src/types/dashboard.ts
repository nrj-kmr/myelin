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
