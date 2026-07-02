'use client';

import { FormEvent, useEffect, useState } from 'react';
import { PortalShell } from '../../components/dashboard/portal-shell';
import { ChatAssistant } from '../../components/clinic/chat-assistant';
import { WhatsAppButton } from '../../components/clinic/whatsapp-button';

type Clinic = { id: string; name: string; city: string | null; state: string | null };
type Appointment = { id: string; serviceName: string; appointmentDate: string; status: string; notes: string | null; clinic: Clinic };
const serviceNames = ['Preventive Dental Care', 'Root Canal Consultation', 'Smile Restoration Consultation', 'Braces and Aligners Consultation', 'Dental Implant Consultation', 'Children’s Dentistry'];

function getMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const value = (data as { message?: unknown }).message;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') return value;
  }
  return 'Request failed';
}

export default function AppointmentsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const [clinicResponse, appointmentResponse] = await Promise.all([fetch('/api/clinics', { cache: 'no-store' }), fetch('/api/appointments', { cache: 'no-store' })]);
    if (clinicResponse.ok) setClinics((await clinicResponse.json()) as Clinic[]);
    if (appointmentResponse.ok) setAppointments((await appointmentResponse.json()) as Appointment[]);
  }

  useEffect(() => { void loadData(); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const element = event.currentTarget;
    const form = new FormData(element);
    const dateValue = String(form.get('appointmentDate') ?? '');
    if (!dateValue) { setMessage('Select date and time'); setLoading(false); return; }
    const payload = {
      clinicId: String(form.get('clinicId') ?? ''),
      serviceName: String(form.get('serviceName') ?? ''),
      appointmentDate: new Date(dateValue).toISOString(),
      notes: String(form.get('notes') ?? ''),
    };
    try {
      const response = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data: unknown = await response.json();
      if (!response.ok) { setMessage(getMessage(data)); return; }
      setMessage('Appointment request created successfully.');
      element.reset();
      await loadData();
    } catch { setMessage('Unable to connect to appointment service.'); }
    finally { setLoading(false); }
  }

  async function cancel(id: string) {
    const response = await fetch(`/api/appointments/${id}/cancel`, { method: 'PATCH' });
    const data: unknown = await response.json();
    if (!response.ok) { setMessage(getMessage(data)); return; }
    setMessage('Appointment cancelled.');
    await loadData();
  }

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">New request</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">Book an appointment</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">The request is saved as pending until clinic staff confirms it.</p>
            <form onSubmit={submit} className="mt-7 space-y-5">
              <select name="clinicId" required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"><option value="">Select a branch</option>{clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.name} — {clinic.city}, {clinic.state}</option>)}</select>
              <select name="serviceName" required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500"><option value="">Select a service</option>{serviceNames.map((service) => <option key={service} value={service}>{service}</option>)}</select>
              <input name="appointmentDate" type="datetime-local" required className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500" />
              <textarea name="notes" rows={4} maxLength={500} className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500" placeholder="Appointment notes. Do not enter emergency medical information." />
              {message ? <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">{message}</p> : null}
              <button type="submit" disabled={loading} className="w-full rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700 disabled:opacity-60">{loading ? 'Submitting...' : 'Submit appointment request'}</button>
            </form>
          </section>
          <section>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">Your history</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Appointment requests</h2>
            <div className="mt-7 space-y-4">
              {appointments.length ? appointments.map((appointment) => <article key={appointment.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-lg font-black text-slate-950">{appointment.serviceName}</h3><p className="mt-1 text-sm text-slate-500">{appointment.clinic.name}</p></div><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">{appointment.status}</span></div><p className="mt-5 font-semibold text-slate-700">{new Date(appointment.appointmentDate).toLocaleString()}</p>{appointment.notes ? <p className="mt-3 text-sm leading-6 text-slate-500">{appointment.notes}</p> : null}{!['CANCELLED', 'COMPLETED'].includes(appointment.status) ? <button type="button" onClick={() => void cancel(appointment.id)} className="mt-5 rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600">Cancel request</button> : null}</article>) : <p className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">No appointment requests yet.</p>}
            </div>
          </section>
        </div>
      </main>
      <WhatsAppButton />
      <ChatAssistant />
    </PortalShell>
  );
}
