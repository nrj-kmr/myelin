import { NextResponse } from "next/server";
import { db, ensureTablesExist, users } from "@myelin/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    await ensureTablesExist();

    const body = await request.json();
    const { name, email, currency, theme, emailPermission, calendarPermission } = body;

    if (!email) {
      return NextResponse.json({ error: "User email is required for database synchronization" }, { status: 400 });
    }

    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    let userRecord;
    let isNewUser = false;

    if (existingUsers.length === 0) {
      isNewUser = true;
      
      const emailPrefix = email.split("@")[0] || "";
      const formattedName = emailPrefix
        .replace(/[\._\+\-\s]+/g, " ")
        .trim()
        .split(/\s+/)
        .join("_")
        .toLowerCase();

      // Register new user
      const inserted = await db.insert(users).values({
        name: name || formattedName,
        email: email,
        currency: currency || "USD",
        theme: theme || "dark",
        emailPermission: emailPermission !== undefined ? emailPermission : false,
        calendarPermission: calendarPermission !== undefined ? calendarPermission : false,
      }).returning();
      
      userRecord = inserted[0];

      console.log(`✅ Welcome email bypassed (using Supabase).`);
    } else {
      // Update fields explicitly only if they are sent in the payload
      const updated = await db.update(users)
        .set({          
          name: name !== undefined ? name : existingUsers[0].name,
          currency: currency !== undefined ? currency : existingUsers[0].currency,
          theme: theme !== undefined ? theme : existingUsers[0].theme,
          emailPermission: emailPermission !== undefined ? emailPermission : existingUsers[0].emailPermission,
          calendarPermission: calendarPermission !== undefined ? calendarPermission : existingUsers[0].calendarPermission,
        })
        .where(eq(users.email, email))
        .returning();
      
      userRecord = updated[0];
    }

    return NextResponse.json({ user: userRecord, isNewUser });
  } catch (error: any) {
    console.error("User Sync Endpoint Error:", error);
    return NextResponse.json({ error: error.message || "Failed to sync user preferences to PostgreSQL" }, { status: 500 });
  }
}
