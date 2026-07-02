
"use client";

import { FormEvent, useEffect, useState } from 'react';
import { PortalShell } from '../../../components/dashboard/portal-shell';

type Clinic = { id: string; name: string; city: string | null; state: string | null };
type Doctor = { id: string; fullName: string; qualification: string | null; specialization: string | null; experienceYears: number | null; isVerified: boolean; isPublic: boolean; isActive: boolean; clinic?: Clinic };
type Application = { id: string; clinicName: string; qualification: string | null; specialization: string | null; experienceYears: number | null; status: string; applicant?: { firstName: string; lastName: string | null; email: string } };

function messageFrom(data: unknown) {
  if (typeof data === 'object' && data && 'message' in data) {
    const value = (data as { message?: unknown }).message;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') return value;
  }
  return 'Request failed';
}

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [message, setMessage] = useState('');

  async function load() {
    const [doctorResponse, appResponse, clinicResponse] = await Promise.all([
      fetch('/api/admin/doctors', { cache: 'no-store' }),
      fetch('/api/admin/doctor-applications', { cache: 'no-store' }),
      fetch('/api/clinics', { cache: 'no-store' }),
    ]);
    if (doctorResponse.ok) setDoctors((await doctorResponse.json()) as Doctor[]);
    if (appResponse.ok) setApplications((await appResponse.json()) as Application[]);
    if (clinicResponse.ok) setClinics((await clinicResponse.json()) as Clinic[]);
  }

  useEffect(() => { void load(); }, []);

  async function createDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    const payload = {
      clinicId: String(form.get('clinicId') ?? ''),
      firstName: String(form.get('firstName') ?? ''),
      lastName: String(form.get('lastName') ?? ''),
      email: String(form.get('email') ?? ''),
      phone: String(form.get('phone') ?? ''),
      password: String(form.get('password') ?? ''),
      fullName: String(form.get('fullName') ?? ''),
      qualification: String(form.get('qualification') ?? ''),
      specialization: String(form.get('specialization') ?? ''),
      experienceYears: Number(form.get('experienceYears') || 0),
      registrationNumber: String(form.get('registrationNumber') ?? ''),
      bio: String(form.get('bio') ?? ''),
    };
    const response = await fetch('/api/admin/doctors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) { setMessage(messageFrom(data)); return; }
    setMessage('Doctor created successfully.');
    event.currentTarget.reset();
    await load();
  }

  async function updateDoctor(id: string, body: Record<string, boolean>) {
    const response = await fetch(`/api/admin/doctors/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) { setMessage(messageFrom(data)); return; }
    setMessage('Doctor status updated.');
    await load();
  }

  async function reviewApplication(id: string, status: string) {
    const response = await fetch(`/api/admin/doctor-applications/${id}/review`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    const data = await response.json();
    if (!response.ok) { setMessage(messageFrom(data)); return; }
    setMessage(`Application marked as ${status}.`);
    await load();
  }

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">Administration</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Manage Doctors</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">Create doctor accounts, review applications and control public doctor visibility.</p>
        {message ? <p className="mt-4 rounded-2xl bg-teal-50 p-4 font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-200">{message}</p> : null}

        <form onSubmit={createDoctor} className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-3">
          <select name="clinicId" required className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950"><option value="">Select clinic</option>{clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.name}</option>)}</select>
          <input name="firstName" required placeholder="First name" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="lastName" placeholder="Last name" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="email" type="email" required placeholder="Email" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="phone" placeholder="Phone" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="password" type="password" required minLength={8} placeholder="Temporary password" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="fullName" required placeholder="Doctor display name" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="qualification" placeholder="Qualification" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="specialization" placeholder="Specialization" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="experienceYears" type="number" placeholder="Experience years" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="registrationNumber" placeholder="Registration number" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="bio" placeholder="Short bio" className="rounded-xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <button className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white xl:col-span-3">Create verified doctor</button>
        </form>

        <section className="mt-10">
          <h2 className="text-2xl font-black dark:text-white">Doctor applications</h2>
          <div className="mt-4 grid gap-4">{applications.length ? applications.map((app) => <article key={app.id} className="rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><h3 className="text-xl font-black dark:text-white">{app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName ?? ''}` : app.clinicName}</h3><p className="text-slate-600 dark:text-slate-300">{app.qualification || 'Qualification not provided'} · {app.specialization || 'Specialization not provided'} · {app.experienceYears ?? 0} years</p><p className="mt-2 font-bold">Status: {app.status}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => reviewApplication(app.id, 'APPROVED')} className="rounded-xl bg-teal-600 px-4 py-2 font-bold text-white">Approve</button><button onClick={() => reviewApplication(app.id, 'NEEDS_CHANGES')} className="rounded-xl border px-4 py-2 font-bold">Needs changes</button><button onClick={() => reviewApplication(app.id, 'REJECTED')} className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600">Reject</button></div></div></article>) : <p className="rounded-3xl border border-dashed p-8 text-slate-500">No doctor applications found.</p>}</div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black dark:text-white">Doctors</h2>
          <div className="mt-4 grid gap-4">{doctors.length ? doctors.map((doctor) => <article key={doctor.id} className="rounded-3xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><h3 className="text-xl font-black dark:text-white">{doctor.fullName}</h3><p className="text-slate-600 dark:text-slate-300">{doctor.qualification || 'No qualification'} · {doctor.specialization || 'No specialization'} · {doctor.experienceYears ?? 0} years</p><p className="mt-2 text-sm">Verified: {doctor.isVerified ? 'Yes' : 'No'} · Public: {doctor.isPublic ? 'Yes' : 'No'} · Active: {doctor.isActive ? 'Yes' : 'No'}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => updateDoctor(doctor.id, { isVerified: !doctor.isVerified })} className="rounded-xl border px-4 py-2 font-bold">{doctor.isVerified ? 'Unverify' : 'Verify'}</button><button onClick={() => updateDoctor(doctor.id, { isPublic: !doctor.isPublic })} className="rounded-xl border px-4 py-2 font-bold">{doctor.isPublic ? 'Hide public' : 'Show public'}</button><button onClick={() => updateDoctor(doctor.id, { isActive: !doctor.isActive })} className="rounded-xl border px-4 py-2 font-bold">{doctor.isActive ? 'Deactivate' : 'Activate'}</button></div></div></article>) : <p className="rounded-3xl border border-dashed p-8 text-slate-500">No doctors found.</p>}</div>
        </section>
      </main>
    </PortalShell>
  );
}
