# StillWord

Next.js 14 (App Router, TypeScript). Mock data only, no backend or auth yet.

    npm install
    npm run dev

Routes: `/` blog grid · `/posts/[slug]` reading mode · `/admin/dashboard` · `/admin/editor`

Next steps for the backend:
- `lib/posts.ts` and `lib/analytics.ts` are mock data: replace with database queries.
- `app/admin/layout.tsx`: add the auth guard; add `/admin/login` and `/admin/sign-up`.
- `components/Editor.tsx`: pasted images are data URLs; upload to storage and insert the URL. Publish logs to the console: POST to an API route.
- `components/PostBody.tsx`: sanitize editor HTML on the server before storing.
