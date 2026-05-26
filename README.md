# betterdev

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase (member registration)

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` → `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. In the Supabase SQL editor, run the migration: `supabase/migrations/001_members.sql`.
4. Restart `npm run dev` and complete onboarding — rows are stored in `public.members`.

You can add columns later with `ALTER TABLE` as BetterDev evolves. Profile edit + Auth linking will use the same `members` row.
