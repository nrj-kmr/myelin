import { NextResponse } from "next/server";
import { db, ensureTablesExist, journalEntries, expenses, events } from "@myelin/db";
import { eq, and } from "drizzle-orm";

// GET handler: retrieve all logs for a user email in frontend-ready map structure
export async function GET(request: Request) {
  try {
    await ensureTablesExist();

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email");

    if (!userEmail) {
      return NextResponse.json({ error: "User email parameter is required" }, { status: 400 });
    }

    // Fetch database records
    const dbJournals = await db.select().from(journalEntries).where(eq(journalEntries.userEmail, userEmail));
    const dbExpenses = await db.select().from(expenses).where(eq(expenses.userEmail, userEmail));
    const dbEvents = await db.select().from(events).where(eq(events.userEmail, userEmail));

    const formattedLogs: Record<string, {
      journal: string;
      mood: string;
      events: { title: string; time: string }[];
      expenses: { title: string; amount: number }[];
    }> = {};

    // 1. Map journals
    for (const j of dbJournals) {
      if (!formattedLogs[j.dateKey]) {
        formattedLogs[j.dateKey] = { journal: "", mood: "neutral", events: [], expenses: [] };
      }
      formattedLogs[j.dateKey].journal = j.journal;
      formattedLogs[j.dateKey].mood = j.mood;
    }

    // 2. Map expenses
    for (const exp of dbExpenses) {
      if (!formattedLogs[exp.dateKey]) {
        formattedLogs[exp.dateKey] = { journal: "", mood: "neutral", events: [], expenses: [] };
      }
      formattedLogs[exp.dateKey].expenses.push({
        title: exp.title,
        amount: Number(exp.amount),
      });
    }

    // 3. Map events
    for (const evt of dbEvents) {
      if (!formattedLogs[evt.dateKey]) {
        formattedLogs[evt.dateKey] = { journal: "", mood: "neutral", events: [], expenses: [] };
      }
      formattedLogs[evt.dateKey].events.push({
        title: evt.title,
        time: evt.time,
      });
    }

    return NextResponse.json({ logs: formattedLogs });
  } catch (error: any) {
    console.error("Fetch Logs Endpoint Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch user logs from PostgreSQL" }, { status: 500 });
  }
}

// POST handler: write changes (journals, events, expenses) directly to PostgreSQL
export async function POST(request: Request) {
  try {
    await ensureTablesExist();

    const body = await request.json();
    const { action, userEmail, dateKey, payload } = body;

    if (!userEmail || !dateKey || !action) {
      return NextResponse.json({ error: "Missing required parameters (action, userEmail, dateKey)" }, { status: 400 });
    }

    switch (action) {
      case "saveJournal": {
        const { journal, mood } = payload;
        
        // Find existing journal entry
        const existing = await db.select()
          .from(journalEntries)
          .where(and(eq(journalEntries.userEmail, userEmail), eq(journalEntries.dateKey, dateKey)))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(journalEntries).values({
            userEmail,
            dateKey,
            journal: journal || "",
            mood: mood || "neutral",
          });
        } else {
          await db.update(journalEntries)
            .set({
              journal: journal || "",
              mood: mood || "neutral",
            })
            .where(and(eq(journalEntries.userEmail, userEmail), eq(journalEntries.dateKey, dateKey)));
        }
        break;
      }

      case "addEvent": {
        const { title, time } = payload;
        await db.insert(events).values({
          userEmail,
          dateKey,
          title,
          time,
        });
        break;
      }

      case "deleteEvent": {
        const { title, time } = payload;
        await db.delete(events).where(
          and(
            eq(events.userEmail, userEmail),
            eq(events.dateKey, dateKey),
            eq(events.title, title),
            eq(events.time, time)
          )
        );
        break;
      }

      case "addExpense": {
        const { title, amount } = payload;
        await db.insert(expenses).values({
          userEmail,
          dateKey,
          title,
          amount: String(amount),
        });
        break;
      }

      case "deleteExpense": {
        const { title, amount } = payload;
        await db.delete(expenses).where(
          and(
            eq(expenses.userEmail, userEmail),
            eq(expenses.dateKey, dateKey),
            eq(expenses.title, title),
            eq(expenses.amount, String(amount))
          )
        );
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown write action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save Log Action Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process database write action" }, { status: 500 });
  }
}
