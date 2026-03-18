# UAL Public Forms

Two public-facing apps for Ultimate Auto Lease.

## Apps

| Folder | What it is | Deploy as |
|---|---|---|
| `broker-form/` | Broker lead submission form | Vercel project: `broker-form` (root dir: `broker-form`) |
| `credit-app/` | Client credit application | Vercel project: `credit-app` (root dir: `credit-app`) |

## Deploying on Vercel (Monorepo)

Each app is a separate Vercel project pointing to this same GitHub repo.

**Broker Form:**
- Go to Vercel → Add New Project → import this repo
- Set Root Directory: `broker-form`
- Framework: Vite

**Credit App:**
- Go to Vercel → Add New Project → import this repo again
- Set Root Directory: `credit-app`
- Framework: Vite

## Supabase Setup

Run `credit-app/SUPABASE_SETUP.sql` in Supabase SQL Editor before first deploy.
