# Vercel API setup

## Environment Variables
Add these in Vercel Project Settings > Environment Variables:
- FIREBASE_SERVICE_ACCOUNT_JSON
- NOMERA_BASE_URL
- NOMERA_API_KEY
- PAYMENT_CREATE_URL
- PAYMENT_API_KEY
- PAYMENT_WEBHOOK_SECRET
- APP_URL

Do not put live secrets in `src/` or GitHub.

## Firebase service account
Firebase Console > Project settings > Service accounts > Generate new private key. Keep the JSON private. Paste the full JSON as the value of FIREBASE_SERVICE_ACCOUNT_JSON.

## Payment provider
SayaBayar's public site confirms API key and webhook support, but the exact create-invoice endpoint and webhook signature contract must come from your SayaBayar dashboard/docs. This project intentionally does not invent those values.

## Available server routes
- GET /api/nomera/catalog
- GET /api/nomera/quote?serviceId=...&countryId=...&offerKey=...
- POST /api/nomera/create-order
- POST /api/nomera/status
- POST /api/nomera/cancel
- POST /api/nomera/resend
- POST /api/deposit/create
- POST /api/webhooks/payment
