# M-Pesa STK PUSH Backend Deployment

## Quick Setup on Railway (Recommended)

### 1. Go to [Railway.app](https://railway.app) and sign up with GitHub

### 2. Create New Project
- Click "New Project" → "Deploy from GitHub repo"
- Select your `learn-tutor-design` repo
- Railway will detect it's a monorepo

### 3. Configure the Service
In Railway dashboard, set:

**Root Directory:** `STK PUSH`

**Build Command:** `npm install`

**Start Command:** `npm start`

### 4. Add Environment Variables
In Railway → Your Service → Variables tab, add:

```
CONSUMER_KEY=pcPCW9woTyqlqXynSbPfyohzwppabVlTGviqYiyapwF9k1bb
CONSUMER_SECRET=NF5l8mrop2mUVHZLaJoW7J1k3U8DdXEKKQ8yg2DT2raU71s3H0fU1S0wnEMhn8Lb
BusinessShortCode=3576709
MPESA_PASSKEY=6114fcade61b65eb6970324ff0cce80f785aac053fb12f91eb803f3fc0ca1ee9
TILL_NUMBER=3648019
PORT=8080
```

### 5. Get Your Railway URL
After deployment, Railway gives you a URL like:
`https://stk-push-production-xxxx.railway.app`

Set this as DOMAIN in your Railway env vars:
```
DOMAIN=https://your-railway-url.railway.app
```

### 6. Update Frontend to Use Railway Backend
Your frontend will call this URL for payments.

---

## Alternative: Vercel Serverless (More Complex)

If you prefer keeping everything on Vercel, we'd need to convert your Express routes to Vercel API routes in `/api` folder. This requires code restructuring.

---

## Frontend Vercel Setup

For your existing Vercel project (tu-tor.vercel.app):

### Environment Variables to Add in Vercel Dashboard:

Go to: Vercel → Your Project → Settings → Environment Variables

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tutor-36ee7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tutor-36ee7
VITE_FIREBASE_STORAGE_BUCKET=tutor-36ee7.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_MPESA_API_URL=https://your-railway-url.railway.app
```

### Build Settings (already correct for Vite):
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
