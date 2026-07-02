
"use client";

import { FormEvent, useEffect, useState } from 'react';
import { PortalShell } from '../../components/dashboard/portal-shell';

type Staff = { id: string; name: string; role: string; phone: string; permissions: string; active: boolean };
const KEY = 'jannat_staff_v1';

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) setStaff(JSON.parse(stored) as Staff[]);
  }, []);
  function save(next: Staff[]) { setStaff(next); localStorage.setItem(KEY, JSON.stringify(next)); }
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item: Staff = {
      id: crypto.randomUUID(),
      name: String(form.get('name') ?? '').trim(),
      role: String(form.get('role') ?? '').trim() || 'Clinic staff',
      phone: String(form.get('phone') ?? '').trim(),
      permissions: String(form.get('permissions') ?? '').trim(),
      active: true,
    };
    if (!item.name) return;
    save([item, ...staff]);
    event.currentTarget.reset();
  }
  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">Operations</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Staff management</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">Add staff members and record their operational permissions for the clinic.</p>
        <form onSubmit={add} className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-4">
          <input name="name" required placeholder="Staff name" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="role" placeholder="Designation" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="phone" placeholder="Phone" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="permissions" placeholder="Permissions" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <button className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white md:col-span-2 xl:col-span-4">Add staff</button>
        </form>
        <section className="mt-8 grid gap-4">
          {staff.length ? staff.map((item) => (
            <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div><h2 className="text-xl font-black dark:text-white">{item.name}</h2><p className="text-slate-600 dark:text-slate-300">{item.role} · {item.phone || 'No phone'}</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{item.permissions || 'No permissions recorded'}</p></div>
                <div className="flex gap-2"><button onClick={() => save(staff.map((s) => s.id === item.id ? { ...s, active: !s.active } : s))} className="rounded-xl border px-4 py-2 font-bold">{item.active ? 'Active' : 'Inactive'}</button><button onClick={() => save(staff.filter((s) => s.id !== item.id))} className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600">Delete</button></div>
              </div>
            </article>
          )) : <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900"><p className="text-xl font-black dark:text-white">No staff added yet</p></div>}
        </section>
      </main>
    </PortalShell>
  );
}
