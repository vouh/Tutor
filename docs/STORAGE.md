# Firebase Storage CORS and local emulator

This file explains how to enable uploads during local development and in production.

## 1) If you want to use your real Firebase Storage bucket (production/dev)

1. Create `storage-cors.json` in the repo root (already present).
2. Ensure `gsutil` is installed (part of Google Cloud SDK):

```bash
# macOS / Linux
curl https://sdk.cloud.google.com | bash
# Windows: follow https://cloud.google.com/sdk/docs/install
```

3. Authenticate and set CORS on your bucket (replace the bucket name):

```bash
gcloud auth login
gsutil cors set storage-cors.json gs://tutor-ba90d.appspot.com
```

4. Find the bucket in Firebase Console:

- Open Firebase Console and select your project.
- Go to `Build` -> `Storage`.
- You will see the bucket name near the top of the page.
- Use that exact bucket name in the `gsutil cors set ...` command.

5. If uploads still fail after setting CORS, check these common causes:

- The app is using a different bucket in `.env` than the one you updated.
- The origin is missing from `storage-cors.json`.
- You ran `npm install gsutil ...` instead of installing Google Cloud SDK.
- The bucket CORS was not applied successfully to the live bucket.

6. Verify the preflight response (example):

```bash
curl -i -X OPTIONS "https://firebasestorage.googleapis.com/v0/b/tutor-ba90d.appspot.com/o?name=temp.pdf" \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"
```

## 2) Use Firebase Storage emulator (recommended for local dev)

1. Ensure `firebase-tools` is installed:

```bash
npm install -g firebase-tools
```

2. Start the emulator:

```bash
firebase emulators:start --only storage
```

3. Enable the emulator in your local environment by setting env vars (in `.env`):

```
VITE_USE_STORAGE_EMULATOR=true
VITE_STORAGE_EMULATOR_HOST=localhost
VITE_STORAGE_EMULATOR_PORT=9199
```

4. Restart the dev server.

Notes:
- Emulator avoids any CORS issues and is ideal for local testing of upload flows.
- If you prefer a server-side proxy, implement a Cloud Function that accepts file upload and uses the Admin SDK to store to GCS (no CORS in that flow).

Developer helper:
- Use the client helper at `src/lib/storage.ts` to upload PDF files, get download URLs, and delete files during development. It wraps `uploadBytesResumable`, `getDownloadURL`, and `deleteObject`.