# Rangari React + Node migration

This is the deployable replacement for the legacy PHP gallery. It uses React for the public website and administrator dashboard, Node.js Vercel Functions for protected APIs, Postgres for structured content/users, and Vercel Blob for image files.

## Local development

```powershell
cd C:\Users\rishi\Desktop\gallery2\react-site
npm install
npm run dev
```

The public website works with bundled content before the database is configured. The administrator dashboard needs the API/database stack and should run with `vercel dev` after environment configuration.

## Provision production services

1. Create a Postgres database and run [database/schema.sql](database/schema.sql).
2. Add the variables shown in [.env.example](.env.example) to Vercel. Generate a unique `AUTH_SECRET` of at least 32 characters.
3. Run `npm run seed-db` with `DATABASE_URL` configured to transfer the existing content and cards.
4. Create a public Vercel Blob store and add its `BLOB_READ_WRITE_TOKEN`.
5. Sign in once with the bootstrap credentials to create the first administrator, then remove both bootstrap variables.
6. Deploy `react-site` as the Vercel project root.

## Security model

- Node.js, not React, verifies administrator authentication.
- Passwords are bcrypt hashes in Postgres.
- Sessions are signed JWTs in `HttpOnly`, `SameSite=Lax` cookies.
- Every write/upload endpoint requires an authenticated admin session.
- Browser code contains no database, Blob, or authentication secret.

The PHP application and the static conversion remain untouched outside this folder as migration references. Do not deploy them with `react-site`.
