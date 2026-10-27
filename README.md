# StillWord

A slow-reading blog built with Next.js 16, React 19, TypeScript, Tiptap 3 and Supabase.

## Local setup

Use Node.js 24 and npm. Copy `.env.example` to `.env.local`, fill the three Supabase variables, then run:

```sh
npm ci
npm run dev
```

Keep `.env.local` private. Only `NEXT_PUBLIC_*` values reach the browser. The service-role client is protected with `server-only` and is used for visitor/event writes and the sign-up availability check.

## Database and access

Versioned schema changes are in `supabase/migrations`. Apply them to the selected Supabase project with the Supabase CLI or MCP, then regenerate `lib/supabase/database.types.ts`. All four tables use RLS. Public clients can read published posts; authenticated members of `admins` can manage posts and read analytics. Storage accepts admin uploads of supported raster images up to 5 MB.

`/admin/sign-up` is available only while `admins` is empty. An Auth database trigger serializes the first-account transaction and creates its membership. Subsequent account creation is rejected even through the direct Auth API. With email confirmation enabled, the first pending account reserves the admin slot until confirmed. Email callbacks support PKCE codes and token hashes. Existing users are not automatically promoted.

In Supabase Auth URL Configuration, set the Site URL to the production origin and allow `http://localhost:3000/auth/callback` and the production `/auth/callback` URL. Keep email confirmation enabled. Use `/admin/login` after confirming the first account.

## Editing and analytics

`/admin/editor` creates posts; `/admin/editor/[id]` edits them. Slugs are generated once, preserve published links, and retry collisions against the database unique constraint. Read time uses 200 words/minute, rounded up. Because the approved editor has no author/category inputs, new posts use category `Essays`, author `Maxime Bourgault`, role `Writer`; edits preserve existing metadata.

Anonymous visitors use an HTTP-only UUID cookie lasting one year. Public landing visits and post loads register visitors. Views and reads are deduplicated per visitor, post, event type and UTC day by a database constraint. A read means the 90% article marker enters the viewport; it measures scrolling, not comprehension. A read also ensures its corresponding daily view exists. Totals are all-time; the visitor chart covers the latest 14 UTC dates. Cookie deletion, multiple browsers, and bots can inflate anonymous visitor counts.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
npm run test:integration
```

Integration checks require `.env.local` and a running local app. They create and clean up temporary published/draft posts and an anonymous visitor. They verify RLS, sanitization, draft 404s, admin redirects including forged headers, event validation/deduplication, upload access, and the closed-signup rule once an admin exists. Set `TEST_ORIGIN` to test another origin.

`scripts/verification-session.mjs` requires the service-role key and `TEST_ADMIN_EMAIL` for an existing confirmed admin. It generates a one-time local testing link in ignored `.artifacts/`; it never changes a password or sends email. Treat that file as a credential.

## Deployment

Connect the GitHub repository to Vercel, use Node.js 24 and `npm ci`, and configure the variables listed in `.env.example` for production. Store `SUPABASE_SERVICE_ROLE_KEY` as a server-only Vercel Secret. Set Supabase Auth URLs to the assigned production domain. Keep staging credentials separate if adding preview deployments.

The approved CSS rules and page layouts are retained. Only an appended auth rule resets the sign-out button to the existing navigation style; the requested Save draft and Sign out actions use existing classes.
