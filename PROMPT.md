# Lisa Kim Todo App

Build a clean, modern todo list web application using React + Vite + TypeScript + Tailwind CSS.

## Requirements

### UI
- Clean, minimal design with brand colors: neon yellow `#e7f900`, white `#ffffff`, black `#111111`
- Dark theme by default (black background)
- Responsive — works on mobile and desktop
- Header with app name "LISA TODO" in bold neon yellow
- All completed tasks should have strikethrough styling

### Task Model
Each task has:
- `id` (auto-generated)
- `title` (string, required)
- `created_at` (timestamp, auto-set)
- `completed` (boolean, default false)
- `completed_at` (timestamp, nullable)

### Features
- **Add task**: Input field at top, press Enter or click Add button
- **Toggle complete**: Click checkbox/toggle to mark done (strikethrough + dimmed)
- **Edit task**: Click edit icon to inline-edit the title, press Enter to save
- **Delete task**: Click delete/trash icon, remove immediately (no confirmation needed)
- **Date display**: Show relative date ("2 hours ago", "Yesterday") under each task
- Tasks sorted: incomplete first (newest first), then completed (newest first)

### Auth
- Use Supabase Auth with Magic Link (passwordless email login)
- Login page with email input + "Send Magic Link" button
- Show "Check your email" message after sending
- Protect the app — redirect to login if not authenticated
- Logout button in header
- Use credentials from `.env.local`:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

### Database (Supabase)
- Create a `todos` table with the task model columns
- Row Level Security: users can only see/edit their own tasks (`auth.uid() = user_id`)
- Add `user_id` column referencing `auth.users`
- Include SQL migration file at `supabase/migrations/001_create_todos.sql`

### Tech Stack
- React 18+ with TypeScript
- Vite for build
- Tailwind CSS v3 for styling
- `@supabase/supabase-js` for client
- No router needed — just conditional render based on auth state

### Files
- `src/App.tsx` — main app with auth check
- `src/components/Login.tsx` — login form
- `src/components/TodoList.tsx` — task list + add form
- `src/components/TodoItem.tsx` — single task row with edit/delete/toggle
- `src/lib/supabase.ts` — Supabase client init
- `supabase/migrations/001_create_todos.sql` — database setup
- `.env.local` — already exists with Supabase credentials (DO NOT modify)
- `.gitignore` — must exclude `.env.local`, `node_modules`, `dist`

## Important
- DO NOT modify `.env.local` — it already has the correct Supabase credentials
- Make sure `.gitignore` excludes `.env.local` — no secrets in git
- Keep it simple — no extra dependencies beyond what's listed
- Use functional components with hooks
- Clean, readable code
