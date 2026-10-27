# Verification — 27 October 2026

- Next.js 16.4.3, React 19.3.1, Tiptap 3.32.0.
- `npm run lint`, `npm run typecheck`, six Vitest tests, and `npm run build`: passed.
- Production dependency audit: zero known vulnerabilities at verification time.
- Live Supabase integration checks: published-only RLS, anonymous write rejection, draft 404s, server HTML sanitization, protected admin routes including forged headers, upload authentication, event validation, UTC daily deduplication, and closed direct Auth API sign-ups: passed.
- Browser checks against the local production build: confirmed first admin; callback authentication; cover upload; clipboard image upload; draft saving and reopening; publishing; landing card and reading page; duplicate-title slug allocation; real dashboard counts; 90% article scroll producing a completed read; sign-out; protected-page redirect; closed sign-up page: passed.
- Admin account creation and email confirmation were completed by the owner. The automated browser used a one-time admin verification session without requesting or changing the owner's password.
- Screenshot comparison used matching content and a matching 1280 × 720 browser viewport. Landing: 0.00% changed pixels above a 12-level channel threshold. Reading page: 0.01%. Editor: 0.61%, accounting for the requested actions and hydration. Dashboard: 8.02%, accounting for real metrics and the requested sign-out action. Layout, typography, tokens, and existing CSS rules were retained.
- The only CSS addition is an appended `auth` section resetting the sign-out button to the existing `.nav` appearance. Temporary screenshot fixtures and images were removed after comparison.

Analytics intentionally estimate anonymous browser visits, not people. One-year HTTP-only cookies identify visitors; views and reads deduplicate per visitor/post/type/UTC day. Read completion measures scrolling rather than comprehension. New posts use the existing site's author and a default category because the approved editor has no metadata fields.

Production deployment and smoke-test results are recorded after release.
