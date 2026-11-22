# Campus Lost and Found

A complete, production-ready, verified Lost and Found web application designed specifically for college campuses. Built for serverless deployment on Vercel with serverless PostgreSQL (Neon or Supabase).

---

## 1. Architecture and Tech Stack

- Framework: Next.js 14+ (App Router, Server Components by default, Server Actions, Route Handlers)
- Database: PostgreSQL with Prisma ORM
- Connection Strategy: Pooled connection string (`DATABASE_URL` via PgBouncer / Neon pooler) and direct connection (`DIRECT_URL` for migrations)
- Authentication: Auth.js (NextAuth v5) with credentials provider, JWT sessions in httpOnly cookies, and pure JavaScript `bcryptjs`
- Styling: Tailwind CSS
- Icons: lucide-react (tree-shaken line icons)
- Image Storage: PostgreSQL `bytea` stored directly in the `Image` table with separate full image and 400px thumbnail blobs
- Client-Side Compression: Adaptive quality degradation loop, WebP encoding, OffscreenCanvas, dynamic `heic2any` import for HEIC/HEIF files
- Rate Limiting: PostgreSQL-backed atomic SQL rate limiter using `prisma.$queryRaw`
- Background Tasks: Vercel Cron routes secured by `CRON_SECRET` bearer token
- Messaging: SWR polling with adaptive intervals (3-4s chat, 10s inbox, 25s notices, `refreshWhenHidden: false`)

---

## 2. Key Features

1. Student Anti-Spam Verification: Mandatory physical ID card photograph upload during registration. Pending students can browse, but cannot post, comment, claim, or chat until verified by a campus administrator.
2. Blind Ownership Verification: Posters of FOUND items set private verification details that are never shown publicly. Claimants must describe and answer blindly to prove genuine ownership.
3. 6-Digit Handover Verification: When a claim is approved, a 6-digit handover code is generated for the claimant. At the meeting spot (Security Office or Library Desk), the poster enters the code to mark the item RETURNED.
4. In-App Direct Coordination: Chat threads can only be initiated directly from a post. No free-form spam DMs.
5. Administrative Moderation: Full dashboard with database image storage tracking, student ID review queue, post moderation, reports triage, and an audit trail.

---

## 3. Local Development Setup

### Prerequisites
- Node.js 18.17+ or 20+
- PostgreSQL database (local instance or cloud database such as Neon or Supabase)

### Step 1: Clone and Install
```bash
git clone <repository-url>
cd "Lost and found items"
npm install
```

### Step 2: Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://user:password@ep-pooler.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@ep.neon.tech/neondb?sslmode=require"
AUTH_SECRET="generate-a-secure-32-byte-secret-key-here"
AUTH_URL="http://localhost:3000"
CRON_SECRET="generate-a-secure-cron-secret-token"
```

To generate `AUTH_SECRET`:
```bash
openssl rand -base64 33
```

### Step 3: Run Migrations and Seed
```bash
npx prisma migrate dev --name init
npm run seed
```

Default seeded credentials:
- Administrator: `admin@campus.edu` / `admin123`
- Student 1 (Verified): `rahul.sharma@campus.edu` / `password123`
- Student 2 (Verified): `ananya.patel@campus.edu` / `password123`
- Student 3 (Pending ID Review): `vikram.singh@campus.edu` / `password123`

### Step 4: Run Compression Unit Tests
```bash
npm run test:compress
```

### Step 5: Start the Development Server
```bash
npm run dev
```
Visit http://localhost:3000 in your browser.

---

## 4. Deploying to Vercel

### Step 1: Create Database
1. Provision a serverless PostgreSQL database on Neon (via Vercel Marketplace or directly at neon.tech) or Supabase.
2. Select a database region close to your target users (e.g., AWS Mumbai `ap-south-1` for Indian campuses).
3. Copy both connection strings:
   - Pooled connection string (with `?pgbouncer=true` or pooler host)
   - Direct connection string

### Step 2: Configure Vercel Project
1. Push your repository to GitHub or GitLab.
2. Import the project into Vercel.
3. In Project Settings -> General -> Build & Development Settings, configure the Build Command:
   ```text
   prisma generate && prisma migrate deploy && next build
   ```
4. Set the Function Region in `vercel.json` to match your database location (e.g., `bom1` for Mumbai).

### Step 3: Configure Environment Variables in Vercel
Add the following environment variables in the Vercel dashboard:
- `DATABASE_URL`: The pooled PostgreSQL connection string.
- `DIRECT_URL`: The direct PostgreSQL connection string.
- `AUTH_SECRET`: A generated 32+ character random string.
- `AUTH_URL`: Your production canonical URL (e.g., `https://your-domain.vercel.app`).
- `CRON_SECRET`: A generated random string for authenticating cron jobs.

### Step 4: First-Time Seed and Admin Setup
The seed script runs locally only and never automatically on production deployments. To seed initial accounts or create your first administrator in production:
```bash
DATABASE_URL="<pooled-url>" DIRECT_URL="<direct-url>" npx tsx prisma/seed.ts
```
Or register a regular account through the UI and update their role in the database:
```sql
UPDATE "User" SET "role" = 'ADMIN', "status" = 'VERIFIED' WHERE "email" = 'your-email@campus.edu';
```

### Step 5: Verify Cron Jobs and Analytics
- Vercel automatically registers the cron jobs defined in `vercel.json` (`/api/cron/expire-handovers` at 02:00 UTC and `/api/cron/cleanup` at 02:30 UTC).
- Ensure `@vercel/analytics` and `@vercel/speed-insights` are active in your Vercel project dashboard.

---

## 5. Free-Tier Resource Limits and Monitoring

When running on the free tier of Neon/Supabase and Vercel, watch these primary limits:

1. Database Storage (PostgreSQL Bytea Images):
   - Neon Free Tier includes 500 MB of storage.
   - Client-side compression enforces strict targets: under 300 KB for post photos, under 500 KB for ID cards, and under 40 KB for thumbnails.
   - The `/admin` dashboard displays current database binary usage.
   - The daily cleanup cron (`/api/cron/cleanup`) automatically deletes abandoned unreferenced uploads after 24 hours, and strips image binaries from posts that have been returned or closed for over 90 days.

2. Serverless Function Invocations (SWR Polling):
   - SWR polling is tuned conservatively: 3-4s in open chat, 10s in inbox, 25s for notification counts.
   - `refreshWhenHidden: false` pauses polling when browser tabs are minimized or in the background.

---

## 6. Migration Abstractions

### Migrating Images to External Object Storage
Binary storage in the database is abstracted inside `src/lib/imageStore.ts`.
To migrate images to AWS S3, Supabase Storage, or Vercel Blob:
1. Update `imageStore.ts` to implement the `ImageStoreProvider` interface using your preferred SDK (`@vercel/blob` or `@aws-sdk/client-s3`).
2. Store the resulting object URL in the `Image` record while continuing to serve through `/api/images/[id]` to preserve access control.

### Migrating Realtime Polling to WebSockets or PubSub
Polling is abstracted inside `src/lib/realtime.ts`.
To migrate from SWR polling to Pusher, Ably, or Supabase Realtime:
1. Implement the `RealtimeProvider` interface in `src/lib/realtime.ts`.
2. Trigger publication events inside `src/app/actions/chat.ts` when messages are saved.
3. Replace the SWR hook in `ChatContainer.tsx` with a channel subscriber.
