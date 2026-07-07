"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Mail, Calendar, Check, Loader2, Lock, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@myelin/core";

interface EmailItem {
  sender: string;
  subject: string;
  summary: string;
  time: string;
}

interface CalendarEventItem {
  title: string;
  time: string;
  platform: string;
}

interface IntelligentInsightsProps {
  userName: string;
  borderless?: boolean;
}

export function IntelligentInsights({
  userName,
  borderless = false,
}: IntelligentInsightsProps) {
  const [googleConnected, setGoogleConnected] = useState(false);

  // Live Google API states
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [calendarError, setCalendarError] = useState("");

  useEffect(() => {
    const initializeGoogleConnection = async () => {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        const providerToken = session?.provider_token;
        const isGoogle = session?.user?.app_metadata?.provider === "google" ||
                         session?.user?.app_metadata?.providers?.includes("google");

        if (isGoogle && providerToken) {
          setGoogleConnected(true);
          fetchGoogleData();
        } else {
          setGoogleConnected(false);
        }
      } catch (e) {
        console.warn("Failed to retrieve Supabase session for Google API calls:", e);
      }
    };

    initializeGoogleConnection();
  }, []);

  const fetchGoogleData = async () => {
    try {
      const { data: { session } } = await supabase?.auth?.getSession() || { data: { session: null } };
      const providerToken = session?.provider_token;

      if (!providerToken) {
        setEmailError("OAuth session expired. Re-authenticate to access Gmail.");
        setCalendarError("OAuth session expired. Re-authenticate to access Calendar.");
        return;
      }

      // 1. Fetch Gmail unread messages
      // if (emailPermission) {
        setLoadingEmails(true);
        setEmailError("");
        try {
          const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?q=is:unread&maxResults=5", {
            headers: { Authorization: `Bearer ${providerToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.messages && data.messages.length > 0) {
              const detailPromises = data.messages.map(async (m: any) => {
                const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}`, {
                  headers: { Authorization: `Bearer ${providerToken}` }
                });
                const detail = await detailRes.json();
                const fromHeader = detail.payload?.headers?.find((h: any) => h.name === "From")?.value || "Unknown Sender";
                const subjectHeader = detail.payload?.headers?.find((h: any) => h.name === "Subject")?.value || "No Subject";

                // Extract clean sender name
                const senderName = fromHeader.replace(/<.*>/, "").trim();

                return {
                  sender: senderName,
                  subject: subjectHeader,
                  summary: detail.snippet || "",
                  time: new Date(Number(detail.internalDate)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
              });
              const resolvedEmails = await Promise.all(detailPromises);
              setEmails(resolvedEmails);
            } else {
              setEmails([]);
            }
          } else {
            setEmailError("Failed to fetch inbox from Google API.");
          }
        } catch (err) {
          setEmailError("Error querying Google Gmail endpoint.");
        } finally {
          setLoadingEmails(false);
        }
      // }

      // 2. Fetch Google Calendar events
      // if (calendarPermission) {
        setLoadingCalendar(true);
        setCalendarError("");
        try {
          const nowISO = new Date().toISOString();
          const calRes = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=5&timeMin=${nowISO}&singleEvents=true&orderBy=startTime`, {
            headers: { Authorization: `Bearer ${providerToken}` }
          });
          if (calRes.ok) {
            const calData = await calRes.json();
            if (calData.items && calData.items.length > 0) {
              const eventsList = calData.items.map((item: any) => {
                const start = item.start?.dateTime || item.start?.date || "";
                const startTimeStr = start ? new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "All Day";
                return {
                  title: item.summary || "Untitled Event",
                  time: startTimeStr,
                  platform: item.hangoutLink ? "Google Meet" : "Google Calendar",
                };
              });
              setCalendarEvents(eventsList);
            } else {
              setCalendarEvents([]);
            }
          } else {
            setCalendarError("Failed to fetch events from Google Calendar API.");
          }
        } catch (err) {
          setCalendarError("Error querying Google Calendar endpoint.");
        } finally {
          setLoadingCalendar(false);
        }
      // }

    } catch (e) {
      console.warn("Failed to retrieve Supabase session for Google API calls:", e);
    }
  };

  // Main inner content renderer
  const renderContent = () => (
    <>
      {/* Title Header */}
      <div className="z-10 flex justify-between items-center pb-2 border-border border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <h4 className="font-mono font-bold text-foreground text-sm uppercase tracking-tight">Intelligent AI Insights</h4>
        </div>
      </div>

      {/* AI Growth Prompt Message */}
      <div className="z-10 bg-primary/5 px-4 py-1 border-primary border-l-2 rounded-r-xl text-muted-foreground text-xs italic leading-relaxed animate-fadeIn">
        {googleConnected ? (
          <span>
            Gmail and Calendar are synchronized. Unread email subject headers and meetings are processed locally on your device.
          </span>
        ) : (
          <span>
            No Google account linked. Please sign in with Google to correlation your unread mailbox alerts and schedule logs.
          </span>
        )}
      </div>

      {/* Grid of integrations */}
      <div className="z-10 gap-6 grid grid-cols-1 md:grid-cols-2">

        {/* Email integration (Inbox Insights) */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-secondary" /> Google Mail Summaries
            </span>
            {googleConnected && (
              <button
                type="button"
                onClick={fetchGoogleData}
                disabled={loadingEmails}
                className="flex justify-center items-center hover:bg-muted p-1 rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title="Refresh Gmail Inbox"
              >
                <RefreshCw className={`w-3 h-3 ${loadingEmails ? "animate-spin text-secondary" : ""}`} />
              </button>
            )}
          </div>

          {!googleConnected ? (
            <div className="flex flex-col justify-center items-center gap-2 bg-muted/20 p-4 border border-border border-dashed rounded-xl min-h-28 text-center">
              <Lock className="w-5 h-5 text-muted-foreground/60" />
              <span className="text-[10px] text-muted-foreground leading-relaxed">
                Login with Google to see insights
              </span>
            </div>
          ) : loadingEmails ? (
            <div className="flex flex-col justify-center items-center gap-2 bg-muted/10 py-6 rounded-xl min-h-28 text-muted-foreground text-xs text-center">
              <Loader2 className="w-5 h-5 text-secondary animate-spin" />
              <span className="font-mono text-[9px]">Connecting to Google Gmail...</span>
            </div>
          ) : emailError ? (
            <div className="flex flex-col items-center gap-1 bg-red-500/5 p-4 border border-red-500/20 rounded-xl font-mono text-[10px] text-red-500 text-center">
              <AlertCircle className="mb-1 w-4 h-4 text-red-500" />
              <span>{emailError}</span>
            </div>
          ) : emails.length === 0 ? (
            <div className="flex justify-center items-center bg-muted/10 p-4 border border-border/40 rounded-xl min-h-28 text-[10px] text-muted-foreground text-center italic">
              No email data available.
            </div>
          ) : (
            <div className="flex flex-col gap-2 pr-1 max-h-48 overflow-y-auto">
              {emails.map((mail, idx) => (
                <div key={idx} className="group flex flex-col gap-1 bg-muted/40 hover:bg-muted/75 p-3 border border-border/40 rounded-xl transition-all cursor-pointer">
                  <div className="flex justify-between items-center font-mono font-semibold text-[10px] text-secondary">
                    <span>{mail.sender}</span>
                    <span className="text-[9px] text-muted-foreground/60">{mail.time}</span>
                  </div>
                  <p className="font-bold text-foreground group-hover:text-primary text-xs line-clamp-1 transition-colors">{mail.subject}</p>
                  <p className="mt-0.5 font-light text-[11px] text-muted-foreground leading-relaxed">{mail.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar integration (Events Overlay) */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 font-mono font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-secondary" /> Google Calendar
            </span>
            {googleConnected && (
              <button
                type="button"
                onClick={fetchGoogleData}
                disabled={loadingCalendar}
                className="flex justify-center items-center hover:bg-muted p-1 rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title="Refresh Calendar"
              >
                <RefreshCw className={`w-3 h-3 ${loadingCalendar ? "animate-spin text-secondary" : ""}`} />
              </button>
            )}
          </div>

          {!googleConnected ? (
            <div className="flex flex-col justify-center items-center gap-2 bg-muted/20 p-4 border border-border border-dashed rounded-xl min-h-28 text-center">
              <Lock className="w-5 h-5 text-muted-foreground/60" />
              <span className="text-[10px] text-muted-foreground leading-relaxed">
                Login with Google to see insights
              </span>
            </div>
          ) : loadingCalendar ? (
            <div className="flex flex-col justify-center items-center gap-2 bg-muted/10 py-6 rounded-xl min-h-28 text-muted-foreground text-xs text-center">
              <Loader2 className="w-5 h-5 text-secondary animate-spin" />
              <span className="font-mono text-[9px]">Connecting to Google Calendar...</span>
            </div>
          ) : calendarError ? (
            <div className="flex flex-col items-center gap-1 bg-red-500/5 p-4 border border-red-500/20 rounded-xl font-mono text-[10px] text-red-500 text-center">
              <AlertCircle className="mb-1 w-4 h-4 text-red-500" />
              <span>{calendarError}</span>
            </div>
          ) : calendarEvents.length === 0 ? (
            <div className="flex justify-center items-center bg-muted/10 p-4 border border-border/40 rounded-xl min-h-28 text-[10px] text-muted-foreground text-center italic">
              No calendar data available.
            </div>
          ) : (
            <div className="flex flex-col gap-2 pr-1 max-h-48 overflow-y-auto">
              {calendarEvents.map((evt, idx) => (
                <div key={idx} className="group flex items-center gap-3 bg-muted/40 hover:bg-muted/75 p-3 border border-border/40 rounded-xl transition-all cursor-pointer">
                  <div className="flex flex-col justify-center items-center bg-secondary/10 border border-secondary/20 rounded-lg w-9 h-9 shrink-0">
                    <Calendar className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground group-hover:text-primary text-xs line-clamp-1 transition-colors">{evt.title}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{evt.time} • {evt.platform}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (borderless) {
    return (
      <div className="relative flex flex-col gap-6 w-full transition-all duration-300">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="group relative bg-card/10 shadow-xl p-[1.5px] rounded-2xl w-full overflow-hidden transition-all duration-300">

      {/* Slow Revolving Blue Light Border Beam */}
      <div
        className="z-0 absolute inset-[-400%] animate-[spin_10s_linear_infinite] pointer-events-none"
        style={{
          background: "conic-gradient(from 0deg, transparent 65%, #00c3eb 88%, transparent 100%)",
        }}
      />

      {/* Inner Card Panel Cover */}
      <div className="z-10 relative flex flex-col gap-6 bg-card/95 backdrop-blur-md p-6 rounded-[15px] w-full h-full">

        {/* Background neon blur lights inside card */}
        <div className="-top-24 -left-24 z-0 absolute bg-secondary/5 blur-[60px] rounded-full w-40 h-40 pointer-events-none" />
        <div className="-right-24 -bottom-24 z-0 absolute bg-primary/5 blur-[60px] rounded-full w-40 h-40 pointer-events-none" />

        {renderContent()}
      </div>
    </div>
  );
}
