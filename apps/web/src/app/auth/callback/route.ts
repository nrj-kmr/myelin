import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@myelin/core";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code && isSupabaseConfigured && supabase) {
    try {
      // Exchange code for Supabase auth session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error && data?.user) {
        const user = data.user;
        const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Google User";
        const email = user.email || "";
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

        // Synchronize authenticated user profile to local PostgreSQL database
        const syncUrl = new URL("/api/user/sync", requestUrl.origin);
        await fetch(syncUrl.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            avatarUrl,
            currency: "USD",
            theme: "dark",
            emailPermission: true,
            calendarPermission: true,
          }),
        });
      }
    } catch (err) {
      console.error("Failed to exchange OAuth code for session:", err);
    }
  }

  // Redirect back to dashboard to read the user session
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
