# Phase 2 — Doctor account, RBAC, profile editor and service charges

This patch adds:

- Secure role guards
- Public signup remains PATIENT only
- SUPER_ADMIN creates doctor accounts
- Doctor login uses the existing login page
- Doctor dashboard
- Editable doctor profile
- Degrees, education, languages, memberships and awards
- Read-only doctor profile for patients
- Doctor/admin-only service and price management
- Clinic write endpoints protected by roles
- Role-aware sidebar

## Not included yet

Patient report file uploads, medical prescriptions, payment due/paid records and
doctor photo file upload require the next database/storage phase. This patch only
supports a trusted hosted image URL for `photoUrl`.

Do not allow public signup to choose DOCTOR. Otherwise any patient could grant
themselves access to clinical and patient data.

## 1. Extract into project root

Extract this ZIP into:

C:\Users\mdaff\Desktop\jannat-dental-clinic

Replace matching files.

## 2. Database migration

Backend terminal:

```cmd
cd C:\Users\mdaff\Desktop\jannat-dental-clinic\apps\api
npx prisma format
npx prisma validate
npx prisma migrate dev --name add_doctor_profile_fields
npx prisma generate
npm run lint
npm run build
npm run test
npm run start:dev
```

## 3. Promote the developer account once

Open another backend terminal:

```cmd
cd C:\Users\mdaff\Desktop\jannat-dental-clinic\apps\api
npx prisma studio
```

Open `User`, locate your developer account, change:

```text
role: PATIENT → SUPER_ADMIN
```

Save. Close Studio.

Logout from the website and login again. A fresh JWT is required because the role
is stored inside the access token.

## 4. Frontend

```cmd
cd C:\Users\mdaff\Desktop\jannat-dental-clinic\apps\web
rmdir /s /q .next
npm run build
npm run dev -- --webpack
```

## 5. Create doctor account

Login as SUPER_ADMIN and open:

http://localhost:3000/admin/doctors

Create the real doctor login. Public signup is for patients only.

The doctor then logs in at:

http://localhost:3000/login

The sidebar will show:

- Doctor Dashboard
- Edit Doctor Profile
- Manage Services
- Public Doctor Page

## 6. Doctor edits profile

Open:

http://localhost:3000/doctor-dashboard/profile

Patients see the saved data read-only at:

http://localhost:3000/doctor

## Next phase

Phase 3 will add private AWS S3 uploads for patient reports and doctor photos,
doctor-created prescriptions, patient prescription viewing, and paid/due payment
records.
