# Jannat Dental Clinic — Tonight MVP Patch

This patch keeps your working login/signup/JWT and adds:

- A polished protected clinic homepage inside `/dashboard`
- Real clinic branches loaded from PostgreSQL
- Services, doctor, equipment, reports, prescriptions and profile pages
- Appointment requests saved in PostgreSQL
- Patient appointment history and cancellation
- WhatsApp floating button
- Safe clinic FAQ chat assistant

## Honest limitations

This is a working MVP, not a finished production hospital platform. Real email/SMS OTP,
admin uploads, invoice PDFs, generative AI, WhatsApp Business automation and doctor slot
management still require provider credentials and more backend work.

## Install

Extract this ZIP directly inside:

`C:\Users\mdaff\Desktop\jannat-dental-clinic`

Allow replacement of matching files.

### Backend

```cmd
cd C:\Users\mdaff\Desktop\jannat-dental-clinic\apps\api
npx prisma format
npx prisma validate
npx prisma migrate dev --name add_appointments
npx prisma generate
npx prettier --write "src/**/*.ts"
npm run lint
npm run build
npm run start:dev
```

Keep backend running.

### Frontend environment

In `apps/web/.env.local`, keep `API_URL` and add the clinic WhatsApp number:

```env
API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLINIC_WHATSAPP=919876543210
```

Replace the example number with the clinic's real number, including country code.

### Frontend

```cmd
cd C:\Users\mdaff\Desktop\jannat-dental-clinic\apps\web
rmdir /s /q .next
npm run build
npm run dev -- --webpack
```

Open `http://localhost:3000`.
