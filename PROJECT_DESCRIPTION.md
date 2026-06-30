# FlowMind — Project Description

FlowMind is a modern, AI-powered personal productivity and autonomous scheduling application. It combines traditional task management and habit tracking with a smart, agentic AI layer that actively optimizes the user's daily schedule, flags deadline risks, and suggests focus blocks.

---

## 1. Executive Summary

In traditional productivity tools, users must manually organize, prioritize, and schedule their time. FlowMind introduces an **Autonomous Planning Agent** that acts as a personal chief of staff. By analyzing task urgency, cognitive peak hours, and existing routines, FlowMind automatically designs an optimal daily timeline, proactively sends push notifications for at-risk deadlines, and helps users build sustainable habit streaks—all within a private, secure, and modern web interface.

---

## 2. Core Features

### 🧠 Autonomous AI Planning
* **Task Prioritization Agent**: Evaluates tasks based on due dates, estimated effort, and user-defined priority. It assigns a dynamic **AI Score** and flags critical paths.
* **Smart Scheduling Agent**: Matches tasks with the user's peak cognitive hours (e.g., morning focus windows) and automatically inserts focus blocks into the daily timeline.
* **AI Walkthrough**: Shows a step-by-step audit log of the decisions made by the AI, allowing the user to approve, modify, or override any scheduling changes.

### 📅 Daily Briefing & Insights
* **Daily Brief Banner**: An AI-generated morning greeting summarizing the day's focus, outstanding deadlines, and a personalized motivational nudge.
* **AI Insights Feed**: Detailed explanations of why certain tasks were prioritized or deferred, promoting mindful time management.

### 🔄 Habits & Routine Tracker
* **Routine Timeline**: A chronological flow of daily activities, combining fixed routines (e.g., exercise, meals) with AI-scheduled work blocks.
* **Habits Tracker**: Allows users to track daily habits with streak counters and completion logs.
* **Compliance Heat Map**: A visual calendar mapping daily completion rates, helping users track their consistency over time.

### 🔔 Smart Notifications
* **Web Push Notifications**: Leverages the browser-native Web Push API to send instant alerts for upcoming deadlines directly to the user's device (desktop or mobile) without requiring heavy background apps or paid notification services.

---

## 3. Technology Stack

* **Frontend**: Next.js (App Router), React, Tailwind CSS / Vanilla CSS, Framer Motion (for smooth micro-animations).
* **Backend & Database**: Supabase (PostgreSQL) providing:
  * Real-time database updates.
  * Secure Row-Level Security (RLS) policies.
  * Database triggers for automatic profile provisioning.
* **Authentication**: Supabase Auth with Google OAuth (Social Sign-in) and traditional Email/Password fallback.
* **AI Engine**: Google Gemini AI (leveraging the free-tier API for text generation, daily briefs, and task prioritization).
* **Push Notifications**: Web Push Protocol (`web-push` library) using VAPID keys for browser-native push delivery.
* **Deployment**: Vercel (Hobby Tier) utilizing Vercel Cron Jobs for automated daily deadline checks.

---

## 4. Database Schema Design

FlowMind utilizes a relational PostgreSQL schema designed for speed, security, and scalability:

* `profiles`: Stores user settings, timezone, work hours, and peak cognitive focus windows.
* `tasks` & `subtasks`: Stores user tasks, due dates, estimated effort, completion percentage, and AI-computed priority scores.
* `calendar_events`: Stores scheduled events and AI-planned focus blocks.
* `habits` & `habit_logs`: Tracks user habits, recurring target days, streaks, and daily completion history.
* `routines`: Manages recurring daily routines and timeline items.
* `ai_actions`: Logs the chronological decisions and reasoning of the AI planning agent.
* `daily_briefs`: Caches the daily AI-generated greeting and recommendations.
* `push_subscriptions`: Stores encrypted web push subscription tokens for browser notifications.

---

## 5. Security & Privacy

* **Row-Level Security (RLS)**: Every table in the database has strict RLS policies enabled. Users can only read, write, update, or delete their own data (`auth.uid() = user_id`).
* **Environment Isolation**: Sensitive credentials (Gemini API keys, Supabase Service Role keys, VAPID private keys) are kept strictly on the server-side and never exposed to the client.
