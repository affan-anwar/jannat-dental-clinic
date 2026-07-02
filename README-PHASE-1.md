# Phase 1 — Real password reset + AI clinic assistant

This patch was built against the uploaded `jannat-current-code.zip`.

## Adds

- Forgot password link
- Email OTP with Resend
- SMS OTP with Twilio Verify
- OTP verification and secure reset JWT
- Password reset page
- Rate limiting
- Authenticated AI clinic assistant using OpenAI Responses API
- Clinic/database context for branches, services, timings and the logged-in patient's appointments

## Does not add yet

Doctor admin, patient record editing, payments, file uploads, prescriptions and role-management are Phase 2 onward.

## Extract

Extract this ZIP into:

`C:\Users\mdaff\Desktop\jannat-dental-clinic`

Allow replacement of files.

## Backend install

```cmd
cd C:\Users\mdaff\Desktop\jannat-dental-clinic\apps\api
npm install openai
npm install
```

## Backend `.env`

Add these values. Never paste real secrets into chat or GitHub.

```env
JWT_RESET_SECRET="GENERATE_A_DIFFERENT_RANDOM_64_BYTE_SECRET"
JWT_RESET_EXPIRES_SECONDS=600

OPENAI_API_KEY="YOUR_PRIVATE_OPENAI_API_KEY"
OPENAI_MODEL="gpt-5.4-mini"

RESEND_API_KEY="YOUR_PRIVATE_RESEND_KEY"
RESET_EMAIL_FROM="Jannat Dental Clinic <onboarding@resend.dev>"
RESET_OTP_EXPIRES_MINUTES=10
RESET_OTP_MAX_ATTEMPTS=5
RESET_OTP_RESEND_SECONDS=60

TWILIO_ACCOUNT_SID="YOUR_ACCOUNT_SID"
TWILIO_AUTH_TOKEN="YOUR_PRIVATE_AUTH_TOKEN"
TWILIO_VERIFY_SERVICE_SID="YOUR_VERIFY_SERVICE_SID"
```

Generate JWT reset secret locally:

```cmd
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Build backend

```cmd
npx prisma validate
npx prisma generate
npm run lint
npm run build
npm run test
npm run start:dev
```

No Prisma migration is needed for Phase 1 because `PasswordResetOtp` already exists in the uploaded schema.

## Build frontend

```cmd
cd C:\Users\mdaff\Desktop\jannat-dental-clinic\apps\web
rmdir /s /q .next
npm install
npm run build
npm run dev -- --webpack
```

## Test email reset

1. Open `/login`.
2. Click `Forgot password?`.
3. Choose Email OTP.
4. During Resend onboarding mode, use the email linked to the Resend account.
5. Enter OTP, set a new password, then log in.

## Test SMS reset

1. Trial Twilio accounts usually require the recipient phone number to be verified.
2. User phone should be a real Indian mobile number; this patch normalizes 10 digits or `0` + 10 digits to `+91...`.
3. Choose SMS OTP, enter the Twilio code and reset the password.

## Test AI assistant

1. Log in.
2. Open Clinic assistant.
3. Ask in English, Hindi, Hinglish or Urdu.
4. It can answer clinic and general dental-education questions.
5. It deliberately does not diagnose or prescribe medicine.
