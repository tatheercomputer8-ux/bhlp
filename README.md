# Babul Hawaij Layyah Party
React + TypeScript + Tailwind + Supabase. YouTube metadata is fetched by a Supabase Edge Function (the API key never reaches the browser).
## Setup
1. `npm install`; copy `.env.example` to `.env` and fill the two `VITE_` values.
2. Create a Supabase project; run `supabase/migrations/001_init.sql` in the SQL editor.
3. Auth > Users > add your admin user, then run: `insert into admins(id,email) select id,email from auth.users where email='YOU@EXAMPLE.COM';`
4. Get a YouTube Data API v3 key, then: `supabase link --project-ref REF && supabase secrets set YOUTUBE_API_KEY=KEY && supabase functions deploy youtube-meta`
5. `npm run dev`, open `/admin/login`.
## Deploy (Vercel/Netlify)
Build `npm run build`, output `dist`, set the two `VITE_` env vars, add an SPA rewrite of `/*` to `/index.html`.
## Not yet built / not yet tested
Category, settings and logo-upload screens (the DB, RLS and storage bucket exist), video editing, playlist import, SEO/sitemap, password reset. Nothing here has been run: install, build, and verify each step yourself.
