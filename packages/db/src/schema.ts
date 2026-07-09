import { pgTable, serial, text, varchar, boolean, timestamp, decimal } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  theme: varchar("theme", { length: 10 }).default("dark").notNull(),
  emailPermission: boolean("email_permission").default(false).notNull(),
  calendarPermission: boolean("calendar_permission").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email", { length: 255 }).references(() => users.email, { onDelete: "cascade" }).notNull(),
  dateKey: varchar("date_key", { length: 20 }).notNull(),
  journal: text("journal").default("").notNull(),
  mood: varchar("mood", { length: 50 }).default("neutral").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email", { length: 255 }).references(() => users.email, { onDelete: "cascade" }).notNull(),
  dateKey: varchar("date_key", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userEmail: varchar("user_email", { length: 255 }).references(() => users.email, { onDelete: "cascade" }).notNull(),
  dateKey: varchar("date_key", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  time: varchar("time", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
