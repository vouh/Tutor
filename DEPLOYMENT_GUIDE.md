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
```

Optional (frontend):

```text
VITE_API_BASE_URL=https://your-backend-host.com
```

## Build settings

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## API routes

- `POST /api/stk-push`
- `POST /api/query-status`
- `POST /api/callback`
