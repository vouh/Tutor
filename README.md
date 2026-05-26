# Tutor

React + Vite app with an M-Pesa STK Push payment flow.

## What do we call this architecture?

This repo uses a **modular monolith** with **serverless API modules**.

- **Modular monolith**: one codebase + one deploy, but split into modules (feature folders) with strict boundaries.
- **Serverless API modules** (Vercel `/api/*`): each route is its own function, so one failing route does not crash the whole site.
- **Microservices**: same modular idea, but each module is deployed independently (separate services/repos/CI). We are *not* fully microservices here because everything still ships together.

If you want “one centralized API server” later, we can deploy a dedicated backend (e.g., Fastify/Express on Render) and keep Vercel as a frontend + API gateway.

## Architecture rules (keep these)

**Module boundaries**

1) Each feature lives in a folder and owns its UI + client logic.
2) Features may import from shared primitives (`src/components/ui`, `src/lib/utils`) but should not import from other features.
3) Backend business logic lives under `api/<module>/` and should not be copied across routes.

**Stable API surface (compatibility shims)**

4) Public Vercel routes stay at `api/*.js` (wrappers). Real logic goes in `api/<module>/*.js`.
5) If we move a frontend component, keep a shim export so old imports don’t break.

**Contracts & errors**

6) Server responses must include `success` + `message`.
7) Client code must treat network errors as expected and show a friendly message.

**Config & secrets**

8) Never commit secrets. Use environment variables (Vercel project settings).
9) Validate required env vars at runtime and return a safe “Server configuration error”.

**Resilience**

10) External calls (Safaricom) must have timeouts and clear errors.
11) Polling should stop after a fixed time (avoid infinite loops).

## Folder map

Frontend:

- `src/features/payments/` – payment feature (UI + client)
- `src/components/` – app-level reusable components (may re-export features as shims)
- `src/pages/` – route pages

Backend (Vercel serverless):

- `api/_core/` – shared serverless utilities (env, CORS, response helpers)
- `api/mpesa/` – M-Pesa module (real handlers)
- `api/*.js` – route wrappers (public endpoints)

## M-Pesa endpoints

- `POST /api/stk-push`
	- body: `{ phoneNumber, amount, courseId?, courseName? }`
	- returns: `{ success, message, checkoutRequestId?, merchantRequestId? }`
- `POST /api/query-status`
	- body: `{ checkoutRequestId }`
	- returns: `{ success, status, message, resultCode? }`
- `POST /api/callback`
	- Safaricom callback receiver

## Environment variables (Vercel)

Set these in Vercel → Project → Settings → Environment Variables:

```text
CONSUMER_KEY=...
CONSUMER_SECRET=...
BusinessShortCode=...
MPESA_PASSKEY=...
TILL_NUMBER=...
DOMAIN=https://your-domain.com   # optional (auto-detected from request when possible)

# OTP signup verification (server-side)
OTP_SIGNING_SECRET=replace-with-a-long-random-secret
EMAILJS_SERVICE_ID=...
EMAILJS_PUBLIC_KEY=...
EMAILJS_PRIVATE_KEY=...
EMAILJS_OTP_TEMPLATE_ID=...
EMAILJS_FROM_NAME=TutorKE
```

Optional (frontend):

```text
VITE_API_BASE_URL=https://your-backend-host.com  # if using an external backend instead of same-origin /api
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
VITE_EMAILJS_CONTACT_TEMPLATE_ID=...
```

## Local dev

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```