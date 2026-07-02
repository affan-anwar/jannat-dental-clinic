
"use client";

import { FormEvent, useEffect, useState } from 'react';
import { PortalShell } from '../../components/dashboard/portal-shell';

type Prescription = {
  id: string;
  patientName: string;
  doctorName: string;
  diagnosis: string;
  medicines: string;
  advice: string;
  followUp: string;
  createdAt: string;
};

const STORAGE_KEY = 'jannat_prescriptions_v1';

export default function PrescriptionsPage() {
  const [items, setItems] = useState<Prescription[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setItems(JSON.parse(stored) as Prescription[]);
  }, []);

  function save(next: Prescription[]) {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function createPrescription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const prescription: Prescription = {
      id: crypto.randomUUID(),
      patientName: String(form.get('patientName') ?? '').trim(),
      doctorName: String(form.get('doctorName') ?? '').trim() || 'Authorised dentist',
      diagnosis: String(form.get('diagnosis') ?? '').trim(),
      medicines: String(form.get('medicines') ?? '').trim(),
      advice: String(form.get('advice') ?? '').trim(),
      followUp: String(form.get('followUp') ?? '').trim(),
      createdAt: new Date().toISOString(),
    };

    if (!prescription.patientName || !prescription.medicines) {
      setMessage('Patient name and prescription details are required.');
      return;
    }

    save([prescription, ...items]);
    event.currentTarget.reset();
    setMessage('Prescription created successfully.');
  }

  function download(prescription: Prescription) {
    const content = `Jannat Dental Clinic\nPrescription\n\nPatient: ${prescription.patientName}\nDoctor: ${prescription.doctorName}\nDate: ${new Date(prescription.createdAt).toLocaleString()}\n\nClinical notes:\n${prescription.diagnosis || 'Not provided'}\n\nMedicines / prescription:\n${prescription.medicines}\n\nAdvice:\n${prescription.advice || 'Not provided'}\n\nFollow-up:\n${prescription.followUp || 'Not provided'}\n\nThis prescription must be issued only by an authorised clinician after assessment.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `prescription-${prescription.patientName.replace(/\s+/g, '-')}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">Clinical documents</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Prescriptions</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
          Create, view and download prescriptions. Only authorised clinicians should issue prescriptions after patient assessment.
        </p>

        <form onSubmit={createPrescription} className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
          <input name="patientName" placeholder="Patient name" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="doctorName" placeholder="Doctor name" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <textarea name="diagnosis" placeholder="Clinical notes" className="min-h-28 rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 md:col-span-2" />
          <textarea name="medicines" placeholder="Medicines / prescription details" required className="min-h-32 rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950 md:col-span-2" />
          <textarea name="advice" placeholder="Advice" className="min-h-24 rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="followUp" placeholder="Follow-up date or instruction" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <button className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700 md:col-span-2">Create prescription</button>
        </form>

        {message ? <p className="mt-4 rounded-2xl bg-teal-50 p-4 font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-200">{message}</p> : null}

        <section className="mt-8 grid gap-4">
          {items.length ? items.map((prescription) => (
            <article key={prescription.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">{prescription.patientName}</h2>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{prescription.doctorName} · {new Date(prescription.createdAt).toLocaleString()}</p>
                  <p className="mt-4 whitespace-pre-wrap text-slate-700 dark:text-slate-200">{prescription.medicines}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => download(prescription)} className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Download</button>
                  <button type="button" onClick={() => save(items.filter((item) => item.id !== prescription.id))} className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 dark:bg-red-950 dark:text-red-300">Delete</button>
                </div>
              </div>
            </article>
          )) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xl font-black text-slate-950 dark:text-white">No prescriptions created yet</p>
              <p className="mt-3 text-slate-500 dark:text-slate-400">Use the form above to create the first prescription.</p>
            </div>
          )}
        </section>
      </main>
    </PortalShell>
  );
}
