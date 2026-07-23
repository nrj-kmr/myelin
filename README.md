# Myelin 🧠

Myelin is a unified, intelligent personal productivity workspace. It serves as a central hub that seamlessly integrates your thoughts, schedule, and communications into a single, beautiful dashboard.

Currently, Myelin intelligently hooks into Google Workspace (Gmail and Calendar) to summarize your emails, track your unread messages, overlay your daily schedule, and provide you with AI-driven action items.

## 🏗 Current Architecture

Myelin is built as a modern, high-performance **Monorepo** using [Turborepo](https://turbo.build/repo). This structure is incredibly powerful because it allows us to decouple our business logic, database schemas, and UI components from the actual front-end application framework.

### Workspace Structure

- **`apps/web`**: The main Next.js 15 web application. This is the consumer-facing dashboard you see in the browser. It handles routing, authentication state (via Supabase), and layouts.
- **`packages/core`**: The absolute brain of the application. Contains all our types, constant configurations, Google API helper functions, and shared business logic.
- **`packages/ui`**: A standalone component library built with Tailwind CSS and Radix (shadcn/ui). This ensures every button, dialog, and layout across any future app looks identical and premium.
- **`packages/db`**: Database configuration, Supabase client initialization, and potentially schema types.

## 🚀 Expanding Beyond the Web App

The true power of this monorepo structure is that **Myelin is not just a web app—it's an ecosystem.** Because all the heavy lifting (`core`, `ui`, `db`) is modularized into packages, we can expand Myelin to any platform with minimal effort.

Here is how Myelin can evolve next:

### 1. Desktop App (`apps/desktop`)

By introducing [Tauri](https://tauri.app/) or [Electron](https://www.electronjs.org/) as a new app in `apps/desktop`, we can build a native macOS/Windows application.

- **How it works:** We simply import the `ui` and `core` packages. The desktop app gets native OS capabilities (like global keyboard shortcuts or menu bar widgets) while sharing 95% of the codebase with `apps/web`.

### 2. Mobile App (`apps/mobile`)

Using [React Native (Expo)](https://expo.dev/), we can build native iOS and Android apps.

- **How it works:** We can share the exact same Supabase database hooks (`packages/db`) and Google token fetching logic (`packages/core`). While we would need to adapt the `ui` package for React Native (or create a `packages/ui-native`), the underlying business logic remains completely unified.

### 3. Browser Extension (`apps/extension`)

A Chrome/Arc extension that sits in your browser.

- **How it works:** Create a new React-based extension app. It can use `packages/ui` to inject a Myelin sidebar into your browser, allowing you to save bookmarks, summarize the current webpage, or quick-add calendar events—all feeding into the exact same database.

### 4. Background Workers (`apps/worker`)

A dedicated Node/Bun server for background processing.

- **How it works:** Right now, the web app handles fetching. A dedicated worker could run on a cron job, using `packages/core` to continuously read your Gmail in the background, run heavy AI summarizations, and push notifications to your devices when an important email arrives.

## 🛠 Getting Started

To run the project locally:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server across all apps and packages:

   ```bash
   npm run dev
   ```

This will concurrently run the Next.js web app and any build watchers for the internal packages.

---

*Designed and engineered to scale.*
