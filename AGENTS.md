# AGENTS.md — EasyVille Estates

> Living technical reference for contributors and AI agents. Describes the codebase as it actually exists. See the [Self-update contract](#self-update-contract) at the bottom for maintenance rules.

---

## 1. Project Overview

**EasyVille Estates** is a student housing and roommate-matching platform targeting university students in Warri, Delta State, Nigeria — primarily Federal University of Petroleum Resources, Effurun (FUPRE).

### Core value proposition

Students need to find housing near campus. Agents list properties. The platform earns ₦1,000 per **unlock** — when a student pays to reveal a listing's exact address, full map, and agent contact details. Before payment those details are hidden; only an approximate address and a blurred map preview are shown.

### User roles

| Role | Description |
|------|-------------|
| `student` | Default role. Can browse listings, save listings/roommates, submit unlock payment proofs. |
| `agent` | Lists and manages properties. Earns 70% of each unlock fee (₦700/unlock). Uses a public **codename** instead of their real name until a student unlocks their listing. |
| `owner` | Property owner who can also post roommate listings. |
| `admin` | Platform admin. Approves/rejects payment proofs, manages users, views platform stats. |

### Business rules encoded in the codebase

- Unlock fee: `PLATFORM_CONFIG.UNLOCK_FEE = 1000` (₦1,000) in `src/lib/config/env.ts`
- Agent commission: `PLATFORM_CONFIG.AGENT_COMMISSION_RATE = 0.7` (70%)
- Payment is manual (bank transfer / USSD / POS). User uploads a receipt screenshot. Admin approves or rejects it. On approval, the listing ID is added to `user.unlockedListingIds`.
- `addressFull`, `mapFull`, `landlordName`, `landlordPhone` are **never returned** in public API responses. They are only included when the requesting user's `unlockedListingIds` contains the listing ID.

---

## 2. Architecture Map

```
Browser
  │
  ├── Next.js Middleware (src/middleware.ts)
  │     Edge Runtime, jose JWT verification
  │     Protects: /profile, /dashboard, /unlock
  │     Skips: /api (API routes handle their own auth)
  │
  ├── Next.js Pages (src/app/**/(page|layout).tsx)
  │     'use client' — TanStack Query hooks for data
  │     AuthProvider + AuthGuard (src/components/providers/)
  │     → src/hooks/api/ → src/lib/api/client.ts (Axios)
  │
  └── Next.js API Routes (src/app/api/**/route.ts)
        │
        ├── Auth Guards (src/lib/auth/guards.ts)
        │     withAuth / withRole / withAgent / withAdmin / withOptionalAuth
        │     Reads JWT from httpOnly cookies; handles silent refresh
        │
        ├── Zod Validators (src/lib/validators/*.server.ts)
        │     safeParse on all inputs before DB access
        │
        ├── Services (src/lib/services/*.service.ts)
        │     All business logic lives here
        │     Calls connectDB(), queries Mongoose models
        │
        ├── Mongoose Models (src/lib/db/models/)
        │     User, Listing, PaymentProof, Review, RoommateListing
        │     No external deps except each other + src/lib/config/
        │
        └── Response Helpers (src/lib/api/response.ts)
              successResponse / errorResponse / handleError
              Standardises { success, data } / { success, error, errors }
```

### Layer import rules (strictly enforced)

```
API Routes     → guards, validators, services, response helpers
Services       → models, connectDB, config
Models         → other models, config only
Pages/Components → hooks/api only (never src/lib/db or src/lib/services)
Hooks          → src/lib/api/client.ts → API routes
```

Crossing these boundaries is an architectural violation. See `.cursor/rules/architecture-boundaries.mdc`.

---

## 3. Data Model

### User

```
User {
  email (unique, lowercase)   password (select:false, bcrypt rounds=12)
  name (real, hidden for agents)   codename? (agent public identity)
  phone? (+234XXXXXXXXXX)   role: student|agent|owner|admin
  avatarUrl?   matricNumber?
  isEmailVerified   isVerified (admin verification for agents)
  savedListingIds[]   savedRoommateIds[]   unlockedListingIds[]
  emailVerificationToken? (select:false)   passwordResetToken? (select:false)
  isDeleted   deletedAt?
}
```

Key static methods: `findByEmail(email)` (includes `+password`), `findActiveById(id)`.

### Listing

```
Listing {
  title   description   university (enum: UNIVERSITY_IDS)
  location (must match university via isValidLocationForUniversity)
  propertyType: bedsitter|self-con|1-bedroom|2-bedroom|3-bedroom
  addressApprox (PUBLIC)   addressFull (PRIVATE — unlock only)
  priceYearly (₦50k–₦5M)   bedrooms   bathrooms   walkingMinutes
  amenities[] (from AMENITIES const list)
  availabilityStatus: available_now|available_soon   availableFrom?
  photos[] (1–10)   videos[] (0–3)   coverPhoto   mapPreview (PUBLIC)
  mapFull (PRIVATE — unlock only)   landlordName?   landlordPhone? (PRIVATE)
  agentId (ref: User)   status: available|taken
  rating   reviewsCount   views
  isDeleted   deletedAt?
}
```

Instance methods: `toPublicObject()` (strips private fields), `toUnlockedObject()`.

### PaymentProof

```
PaymentProof {
  listingId (ref: Listing)   userId (ref: User)
  amount (exactly PLATFORM_CONFIG.UNLOCK_FEE = ₦1000)
  method: bank_transfer|ussd|pos   reference   imageUrl
  status: pending|approved|rejected   rejectionReason?
  reviewedByAdminId?   reviewedAt?   submittedAt
}
```

When admin approves a proof: `userId` is added to `listing.unlockedListingIds` (on User model).

### Review

Belongs to a Listing. Created by any authenticated user who has **unlocked** the listing. Contains rating (1–5), comment, agentResponse.

### RoommateListing

Posted by `student` or `owner` role. Contains budget, preferences (gender, cleanliness, studyHours, smoking, pets), moveInDate, photos.

---

## 4. Coding Standards

### Import order

Always use the `@/*` alias. Never use relative `../../` imports.

```typescript
// 1. Next.js / React
import { NextRequest } from 'next/server';
import { useState } from 'react';

// 2. Third-party
import { z } from 'zod';

// 3. Internal — @/* alias only
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import { withAuth } from '@/lib/auth/guards';
import { successResponse } from '@/lib/api/response';
```

### Enum pattern

Use `as const` objects, not TypeScript `enum`:

```typescript
// Correct
export const UserRole = {
  STUDENT: 'student',
  AGENT: 'agent',
} as const;
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Wrong — never use TypeScript enum
enum UserRole { STUDENT = 'student' }
```

### Soft delete

Never call `.deleteOne()` or `.deleteMany()` on production data. Always soft-delete:

```typescript
document.isDeleted = true;
document.deletedAt = new Date();
await document.save();
```

All queries that should exclude deleted records must filter `isDeleted: false` or use the static `findActive*` helpers on models.

### Zod validation

Always `safeParse`, never `parse`:

```typescript
const validation = schema.safeParse(body);
if (!validation.success) {
  return validationErrorResponse(validation.error);
}
// use validation.data
```

### API response shape

Every API route response goes through a helper from `src/lib/api/response.ts`:

```typescript
return successResponse({ listing }, 201);
return errorResponse('Not found', 404);
return validationErrorResponse(zodError);
return handleError(error); // catches and maps known error types
```

Never use raw `NextResponse.json(...)` in route handlers.

### Mongoose model guard

Always use the hot-reload guard to prevent dev-mode recompilation errors:

```typescript
const User: IUserModel =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUser, IUserModel>('User', UserSchema);
```

### connectDB

Every service function that queries the database must call `await connectDB()` first. This is a no-op if already connected (cached connection) but is required for cold serverless starts.

### Validator file naming

Two Zod schema files per domain:

| File | Purpose |
|------|---------|
| `src/lib/validators/listings.server.ts` | API route validation (server-only, may use `z.coerce`, DB types) |
| `src/lib/validators/listings.ts` | Client-side form validation (browser-safe) |

### Currency and phone

- All prices are in **Naira (NGN)**, stored as integer `priceYearly`.
- Phone numbers must match `/^\+234\d{10}$/` — Nigerian international format only.
- Use `formatNaira()` from `src/lib/utils/currency.ts` for display.

---

## 5. Authentication & Auth Flow

### Token lifecycle

```
Login → createTokenPair({ userId, email, role })
      → access_token (HS256 JWT, 15 min, httpOnly cookie)
      → refresh_token (HS256 JWT, 7 days, httpOnly cookie)

API Request → withAuth(handler)
           → reads access_token cookie
           → if expired, tries refresh_token → issues new access_token silently
           → if both fail → 401

Page Navigation → src/middleware.ts (Edge Runtime)
               → reads cookies, verifies with jose
               → redirects to /auth/login?returnUrl=... if unauthenticated
```

### Cookie names

```typescript
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
```

### Guard usage (API routes only)

```typescript
export const GET = withOptionalAuth(async (request, context) => { ... });
export const POST = withAgent(async (request, context) => { ... });
export const DELETE = withAdmin(async (request, context) => { ... });
export const PATCH = withRole(['agent', 'admin'], async (request, context) => { ... });
```

`context.user` contains `{ userId, email, role }`.

---

## 6. Testing Strategy

**Current state:** No tests exist. No CI pipeline.

**Target stack when tests are added:**
- **Unit/integration:** Vitest (compatible with Next.js App Router)
- **E2E:** Playwright
- **API mocking:** MSW (Mock Service Worker) for client-side tests

**Priority order for first tests:**
1. `src/lib/services/listings.service.ts` — unlock logic, privacy filtering
2. `src/lib/services/payments.service.ts` — approval workflow
3. `src/lib/auth/guards.ts` — withAuth, withRole
4. `src/lib/validators/*.server.ts` — Zod schema edge cases
5. Key API routes: `POST /api/payments/proofs`, `GET /api/listings/[id]`

**Testing conventions (when tests exist):**
- Test service functions in isolation — mock `connectDB` and Mongoose models
- Never test Mongoose schemas directly; test via service functions
- API route tests must mock `AuthContext` (inject context, don't hit real DB)
- Test file lives next to the file it tests: `listings.service.test.ts`
- Use `describe('functionName', () => { it('should ...') })` naming

---

## 7. Environment Variables

Copy `.env.example` to `.env.local`. Never commit `.env.local` (it is in `.gitignore`).

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | JWT signing secret (≥32 chars in production) |
| `NEXT_PUBLIC_APP_URL` | Yes (prod) | Public app URL for email links and sitemap |
| `SMTP_HOST` | For emails | SMTP server (default: smtp.titan.email) |
| `SMTP_PORT` | For emails | SMTP port (default: 587) |
| `SMTP_USER` | For emails | SMTP username |
| `SMTP_PASS` | For emails | SMTP password |
| `SMTP_FROM_EMAIL` | For emails | Sender address |
| `SMTP_FROM_NAME` | For emails | Sender display name |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | For uploads | Unsigned upload preset |
| `CLOUDINARY_API_KEY` | Server ops | Cloudinary server-side API key |
| `CLOUDINARY_API_SECRET` | Server ops | Cloudinary server-side API secret |
| `ADMIN_EMAIL` | Seed script | Initial admin account email |
| `ADMIN_PASSWORD` | Seed script | Initial admin account password |
| `ADMIN_NAME` | Seed script | Initial admin display name |
| `ADMIN_PHONE` | Seed script | Initial admin phone number |

### Local setup

```bash
cp .env.example .env.local
# Fill in MONGODB_URI and JWT_SECRET at minimum
npm install
npm run dev
# Seed admin: npm run seed:admin
```

---

## 8. PR and Commit Conventions

Inferred from git history. Follow these exactly:

### Commit format

```
<type>: <short description in lowercase>
```

Types observed: `feat`, `fix`, `chore`. Examples from history:

```
feat: video, listings and locations update from owner
fix: mobile responsiveness and email issues
chore: google maps fix for listings
```

- No scope required (e.g. no `feat(listings):`)
- Description in lowercase after the colon
- No period at end

### Branch naming

Not formally established. Suggested:

```
feat/<short-description>
fix/<short-description>
chore/<short-description>
```

### PR expectations

- No CI gate exists yet — manual review only
- Keep PRs focused on one concern
- Before merging: check that `npm run typecheck` passes
- Do not merge with TypeScript errors

---

## 9. AI Assistance Guidelines

### Safe to auto-edit

- `src/app/**/page.tsx` — page components
- `src/components/` — UI components (except providers)
- `src/hooks/api/` — TanStack Query hooks
- `src/lib/validators/` — Zod schemas
- `src/lib/utils/` — utility functions

### Risky — review carefully

| File/Directory | Risk |
|----------------|------|
| `src/middleware.ts` | Edge Runtime constraints; wrong matcher breaks all routes |
| `src/lib/auth/guards.ts` | Changing guard logic can open auth bypass vulnerabilities |
| `src/lib/db/models/` | Schema changes affect existing data; indexes affect performance |
| `src/lib/auth/jwt.ts` | Token expiry and payload shape affect all sessions |
| `src/lib/auth/cookies.ts` | Cookie options (httpOnly, sameSite, secure) affect security |
| `src/lib/config/env.ts` | Validation logic runs at startup; errors crash the server |

### Common AI mistakes in this codebase

1. **Using `parse` instead of `safeParse`** — will throw uncaught exceptions in route handlers.
2. **Importing `src/lib/db/` or `src/lib/services/` from page/component files** — violates architecture boundaries; these are server-only.
3. **Returning raw `NextResponse.json()` from API routes** — bypasses the standardised response shape.
4. **Using TypeScript `enum`** — the project uses `as const` object enums throughout.
5. **Forgetting `await connectDB()`** in service functions — causes failures on cold serverless starts.
6. **Including `addressFull` or `mapFull` in responses** without checking unlock status — private data leak.
7. **Soft-delete skipped** — calling `.deleteOne()` instead of setting `isDeleted: true`.
8. **Inline query keys** like `['listings', 'list']` instead of using `queryKeys.listings.list(filters)`.
9. **Adding business logic to `src/components/ui/`** — that directory is for shadcn primitives only.
10. **`jose` is used, not `jsonwebtoken`** — they have different APIs; `jose` is async and Edge-compatible.

### Context to provide AI when asking for help

When prompting about:
- **A bug in an API route**: include the route file, the relevant service file, and the validator.
- **A UI issue**: include the page file, the hook used, and the relevant API response shape from `src/lib/api/types.ts`.
- **An auth issue**: include `src/middleware.ts` and `src/lib/auth/guards.ts`.

---

## 10. Self-Update Contract

**Keeping AGENTS.md current**

After every session where you: add a new feature, refactor a module, change a dependency, alter env vars, modify CI, update test strategy, or change architectural patterns — pause and ask:

> "Should AGENTS.md be updated to reflect this change?"

If yes, update it before closing the session. AGENTS.md must always describe the codebase as it actually exists, not as it was when first written.

**Checklist for updates:**

- New env var added → update the env var table in §7
- New domain entity → update the data model in §3
- Layer boundary changed → update the architecture map in §2
- New commit/PR convention → update §8
- New risky file identified → update the AI assistance table in §9
- Test strategy updated → update §6
