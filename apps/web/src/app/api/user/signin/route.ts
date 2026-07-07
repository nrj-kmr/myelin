import { NextResponse } from "next/server";
import { db, users } from "@myelin/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required to sign in" }, { status: 400 });
    }

    // Query user by email
    const matchedUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (matchedUsers.length === 0) {
      return NextResponse.json(
        { error: "No calibrated profile found for this email address. Please register/calibrate your workspace first." },
        { status: 404 }
      );
    }

    const user = matchedUsers[0];
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Sign In API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to query database profile" }, { status: 500 });
  }
}
