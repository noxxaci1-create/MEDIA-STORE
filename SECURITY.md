# Security checklist

Never commit live payment or Nomera secret keys.
Rotate any key that has been exposed publicly.
Store secrets only in Vercel server-side environment variables.
Verify webhook signatures from the raw request body.
Use unique event IDs to prevent duplicate balance credits.
Verify amount and settlement status before crediting.
Use Firestore transactions for balance updates.
Never trust a balance supplied by the browser.
