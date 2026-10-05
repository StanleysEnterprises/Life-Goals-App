# Tegan & Will

A calm, shared goal-setting app for two. Mobile-first, installable on iPhone, synced live between both phones.

**Stack:** React + Vite · Tailwind CSS · Supabase (realtime sync) · Vercel

## What's in it

- **Tegan / Will tabs** at the top: each person has their own space.
- **Bottom bar** for each person:
  - **Today**: greeting, today's rhythm bar, daily habits, weekly targets, upcoming milestones, a daily quote, and an inspiration prompt with your intention for the day
  - **Goals**: all goals grouped by Daily / Weekly / Milestone, filterable by category, with an Edit mode to remove goals
  - **Progress**: today ring, streak, weekly consistency, the week at a glance, a 4-week mosaic, weekly-target bars, and the *Quiet Wins* journal
  - **Notes**: a simple private journal per person
  - **Compare**: Tegan and Will side by side, with today, this week, streaks, a dual week chart, shared goals and wins together
- **+ button** adds a goal in two taps: type a title, then tap *Add goal*. Defaults are the current person and a daily habit.
- Goals for **Both** appear in both tabs. Each person ticks them off separately.

## 1. Run it locally (optional)

```bash
npm install
npm run dev
```

Without Supabase keys the app runs in **"This phone only"** mode, with data saved in the browser. That's fine for trying it out.

## 2. Put it on GitHub

Create a new repo (e.g. `tegan-will-goals`) and upload this whole folder, or:

```bash
git init && git add . && git commit -m "Initial app"
git branch -M main
git remote add origin https://github.com/<you>/tegan-will-goals.git
git push -u origin main
```

## 3. Set up Supabase (for syncing between phones)

1. Create a free project at supabase.com.
2. Open **SQL Editor → New query**, paste in `supabase/schema.sql` and run it.
3. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key.

## 4. Deploy on Vercel

1. On vercel.com, choose **Add New → Project** and import the GitHub repo. Vercel detects Vite automatically.
2. Under **Environment Variables** add:
   - `VITE_SUPABASE_URL` = your Project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Deploy. Every push to `main` redeploys automatically.

The little status label on the Today screen will say **Synced** once it's connected.

## 5. Add to your iPhone home screens

Open the Vercel URL in Safari → Share → **Add to Home Screen**. It opens full screen like an app.

## Security note

The database policies are open: anyone with your site URL could read and write. That's fine for a private link shared between two people. To lock it down, add Supabase Auth (magic-link email) and tighten the policies.

## Project structure

```
src/
  App.jsx                 layout shell: person tabs, view, bottom nav
  lib/
    store.jsx             data + Supabase realtime sync (falls back to local storage)
    stats.js              streaks, consistency, quiet wins
    dates.js              local-date helpers (weeks start Monday)
    inspiration.js        daily quotes + prompts
    constants.js          people, categories, goal types
  components/             PersonTabs, BottomNav, GoalItem, AddGoalSheet, ui bits
  views/                  Today, Goals, Progress, Notes, Compare
supabase/schema.sql       database tables, policies, realtime
tailwind.config.js        the palette: canvas, sand, taupe, sage
```
