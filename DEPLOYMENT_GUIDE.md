# Deployment guide

This project is deployed as:

- **Frontend**: Vercel (Vite build)
- **Backend**: Vercel Serverless Functions in `api/*`

## Important security note

Do **not** store real credentials in git (docs included). Use Vercel Environment Variables.

## Vercel environment variables

Set these in Vercel  Project  Settings  Environment Variables:

```text
CONSUMER_KEY=...
CONSUMER_SECRET=...
BusinessShortCode=...
MPESA_PASSKEY=...
TILL_NUMBER=...
DOMAIN=https://your-domain.com   # optional

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
VITE_API_BASE_URL=https://your-backend-host.com
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...
VITE_EMAILJS_CONTACT_TEMPLATE_ID=...
```

## Build settings

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## API routes

- `POST /api/stk-push`
- `POST /api/query-status`
- `POST /api/callback`
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
