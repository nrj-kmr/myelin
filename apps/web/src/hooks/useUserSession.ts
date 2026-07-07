"use client";

import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@myelin/core";
import { UserSessionData, LS_KEYS } from "@myelin/core";

export function useUserSession() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [emailPermission, setEmailPermission] = useState(false);
  const [calendarPermission, setCalendarPermission] = useState(false);

  useEffect(() => {
    // 1. Theme Check Initial
    const savedTheme = document.documentElement.classList.contains("light") ? "light" : "dark";
    setTheme(savedTheme);

    const initializeSession = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const user = session.user;
            const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "Google User";
            const email = user.email || "";

            // Sync Google Connected state to LocalStorage
            if (user.app_metadata?.provider === "google" || user.app_metadata?.providers?.includes("google")) {
              localStorage.setItem(LS_KEYS.GOOGLE_CONNECTED, "true");
              localStorage.setItem(LS_KEYS.GOOGLE_EMAIL, email);
              localStorage.setItem(LS_KEYS.GOOGLE_NAME, name);
            }

            try {
              const userRes = await fetch("/api/user/signin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              
              if (userRes.ok) {
                const userData = await userRes.json();
                const dbUser = userData.user as UserSessionData;

                saveToLocalStorage(dbUser);
                applySessionState(dbUser);
                setIsLoaded(true);
                return;
              }
            } catch (err) {
              console.warn("DB user check failed, using session defaults:", err);
            }

            // Fallback for new Supabase login
            const defaultUser: UserSessionData = {
              name,
              email,
              currency: "USD",
              theme: savedTheme,
              emailPermission: true,
              calendarPermission: true,
            };

            saveToLocalStorage(defaultUser);
            applySessionState(defaultUser);
            setIsLoaded(true);
            return;
          }
        } catch (e) {
          console.warn("Supabase session verification failed, falling back to local storage.", e);
        }
      }

      // Local storage fallback
      const savedOnboarded = localStorage.getItem(LS_KEYS.ONBOARDED) === "true";
      setIsOnboarded(savedOnboarded);
      
      if (savedOnboarded) {
        const emailVal = localStorage.getItem(LS_KEYS.USER_EMAIL) || "";
        const emailPrefix = emailVal.split("@")[0] || "";
        const formattedFallback = emailPrefix
          .replace(/[\._\+\-\s]+/g, " ")
          .trim()
          .split(/\s+/)
          .join("_")
          .toLowerCase();
        
        const localUser: UserSessionData = {
          name: localStorage.getItem(LS_KEYS.USER_NAME) || formattedFallback || "user",
          email: emailVal,
          currency: localStorage.getItem(LS_KEYS.CURRENCY) || "USD",
          theme: savedTheme,
          emailPermission: localStorage.getItem(LS_KEYS.EMAIL_PERMISSION) === "true",
          calendarPermission: localStorage.getItem(LS_KEYS.CALENDAR_PERMISSION) === "true",
        };

        applySessionState(localUser);
      }

      setIsLoaded(true);
    };

    initializeSession();
  }, []);

  const saveToLocalStorage = (user: UserSessionData) => {
    localStorage.setItem(LS_KEYS.ONBOARDED, "true");
    localStorage.setItem(LS_KEYS.USER_NAME, user.name);
    localStorage.setItem(LS_KEYS.USER_EMAIL, user.email);
    localStorage.setItem(LS_KEYS.CURRENCY, user.currency);
    localStorage.setItem(LS_KEYS.EMAIL_PERMISSION, user.emailPermission ? "true" : "false");
    localStorage.setItem(LS_KEYS.CALENDAR_PERMISSION, user.calendarPermission ? "true" : "false");
  };

  const applySessionState = (user: UserSessionData) => {
    setUserName(user.name);
    setUserEmail(user.email);
    setCurrency(user.currency);
    setEmailPermission(user.emailPermission);
    setCalendarPermission(user.calendarPermission);
    setIsOnboarded(true);
  };

  const handleToggleTheme = () => {
    const targetTheme = theme === "light" ? "dark" : "light";
    if (targetTheme === "dark") {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
      localStorage.setItem(LS_KEYS.THEME, "dark");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem(LS_KEYS.THEME, "light");
    }
    setTheme(targetTheme);

    if (userEmail) {
      fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, theme: targetTheme }),
      }).catch((e) => console.warn("Theme DB sync deferred:", e));
    }
  };

  const handleChangeCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    localStorage.setItem(LS_KEYS.CURRENCY, newCurrency);
    if (userEmail) {
      fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, currency: newCurrency }),
      }).catch((err) => console.warn("Currency DB sync deferred:", err));
    }
  };

  const handleGrantPermission = (type: "email" | "calendar") => {
    const isEmail = type === "email";
    if (isEmail) {
      localStorage.setItem(LS_KEYS.EMAIL_PERMISSION, "true");
      setEmailPermission(true);
    } else {
      localStorage.setItem(LS_KEYS.CALENDAR_PERMISSION, "true");
      setCalendarPermission(true);
    }
    
    if (userEmail) {
      fetch("/api/user/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: userEmail, 
          emailPermission: isEmail ? true : emailPermission,
          calendarPermission: !isEmail ? true : calendarPermission
        }),
      }).catch((e) => console.warn("Scope DB sync deferred:", e));
    }
  };

  return {
    isLoaded,
    isOnboarded,
    userName,
    userEmail,
    currency,
    theme,
    emailPermission,
    calendarPermission,
    handleToggleTheme,
    handleChangeCurrency,
    handleGrantPermission,
  };
}
