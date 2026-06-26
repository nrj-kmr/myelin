import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { validateEmail, WaitlistUser } from "@myelin/core";
import { sendMail } from "@/lib/email";

const DB_FILE = process.cwd().includes("apps/web")
  ? path.resolve(process.cwd(), "../../waitlist_db.json")
  : path.join(process.cwd(), "waitlist_db.json");

function getWelcomeEmailHtml(userId: string) {
  return `
    <div style="background-color: #09090b; color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.05em;">Myelin<span style="color: #ec4899;">.</span></span>
      </div>
      <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; text-align: center; margin-bottom: 20px;">You are queued for early access.</h1>
      <p style="font-size: 15px; color: #a1a1aa; line-height: 1.6; text-align: center; margin-bottom: 25px;">
        Thank you for joining the waitlist for <strong>Myelin</strong>. We are developing a digital journal and expense ledger to help you manage your two most vital resources: time and money.
      </p>
      
      <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
        <p style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 8px 0;">Queue Reference</p>
        <span style="font-family: monospace; font-size: 20px; font-weight: 700; color: #a78bfa; letter-spacing: 0.05em;">MYELIN-${userId.toUpperCase()}</span>
      </div>

      <p style="font-size: 14px; color: #71717a; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        Our developer team has scaffolded the monorepo, and the Next.js web application module is up next. We'll send you an invitation when the private beta is ready.
      </p>
      
      <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; text-align: center;">
        <p style="font-size: 11px; color: #52525b; margin: 0;">
          Myelin App © 2026 • Time & Money Optimizations
        </p>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // Read current database
    let users: WaitlistUser[] = [];
    if (fs.existsSync(DB_FILE)) {
      try {
        const data = fs.readFileSync(DB_FILE, "utf-8");
        users = JSON.parse(data);
      } catch (err) {
        console.error("Error reading database file, resetting", err);
      }
    }

    // Check duplicate
    const isDuplicate = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (isDuplicate) {
      return NextResponse.json(
        { message: "You're already registered! We'll email you updates." },
        { status: 200 }
      );
    }

    const userId = Math.random().toString(36).substring(2, 9);
    const newUser: WaitlistUser = {
      id: userId,
      email: email.toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), "utf-8");

    // Send confirmation email
    let previewUrl: string | undefined;
    try {
      const emailResult = await sendMail({
        to: email.toLowerCase(),
        subject: "Welcome to the Myelin Waitlist 🧠",
        html: getWelcomeEmailHtml(userId),
      });
      previewUrl = emailResult.previewUrl;
    } catch (emailErr) {
      // Log the error but don't fail the user registration
      console.error("Failed to send welcome email:", emailErr);
    }

    return NextResponse.json(
      { 
        message: "Successfully joined the waitlist!", 
        userId 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Waitlist API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return NextResponse.json(JSON.parse(data));
    }
    return NextResponse.json([]);
  } catch (error) {
    return NextResponse.json({ error: "Could not retrieve waitlist" }, { status: 500 });
  }
}
