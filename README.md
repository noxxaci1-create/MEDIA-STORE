# SULFA MEDIA STORE

Frontend starter: React + Vite + Firebase Auth + Firestore.

## Important
Do NOT put the Nomera or payment secret keys in browser code. They must be server-side environment variables.

Automatic deposit flow:
client -> server -> payment gateway create -> QRIS -> payment webhook -> verify signature/status/amount -> atomic Firestore balance credit.

Nomera order flow:
CREATE_PENDING = retry with the SAME idempotencyKey.
WAITING_OTP = show number and wait for webhook/status sync.
SMS_RECEIVED = read otp.message; resend only when canResend is true.
SUCCESS/COMPLETED = completed.
CANCELED = refund only after provider confirms COMPLETED.
EXPIRED/CREATE_FAILED = released according to provider result.

Firebase project: web-nokosgur
Build command: npm run build
Output: dist

Existing frontend collections: users, products, deposits, purchases.
