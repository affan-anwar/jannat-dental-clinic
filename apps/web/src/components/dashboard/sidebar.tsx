'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

type Role =
  | 'SUPER_ADMIN'
  | 'DOCTOR'
  | 'STAFF'
  | 'PATIENT';

interface ProfileResponse {
  role?: Role;
}

const patientLinks = [
  ['Dashboard', '/dashboard'],
  ['Book Appointment', '/appointments'],
  ['Services', '/services'],
  ['Doctor', '/doctor'],
  ['Equipment', '/equipment'],
  ['Reports', '/reports'],
  ['Prescriptions', '/prescriptions'],
  ['Profile', '/profile'],
] as const;

const doctorLinks = [
  ['Doctor Dashboard', '/doctor-dashboard'],
  ['Edit Doctor Profile', '/doctor-dashboard/profile'],
  ['Manage Services', '/doctor-dashboard/services'],
  ['Public Doctor Page', '/doctor'],
  ['Account Profile', '/profile'],
] as const;

const adminLinks = [
  ['Dashboard', '/dashboard'],
  ['Create Doctor', '/admin/doctors'],
  ['Services', '/doctor-dashboard/services'],
  ['Doctor Page', '/doctor'],
  ['Account Profile', '/profile'],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>('PATIENT');

  useEffect(() => {
    let active = true;

    fetch('/api/auth/profile', {
      cache: 'no-store',
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return (await response.json()) as ProfileResponse;
      })
      .then((profile) => {
        if (
          active &&
          profile?.role
        ) {
          setRole(profile.role);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const links = useMemo(() => {
    if (role === 'SUPER_ADMIN') {
      return adminLinks;
    }

    if (role === 'DOCTOR') {
      return doctorLinks;
    }

    return patientLinks;
  }, [role]);

  const portalLabel =
    role === 'DOCTOR'
      ? 'Doctor portal'
      : role === 'SUPER_ADMIN'
        ? 'Admin portal'
        : 'Patient portal';

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-5 lg:block">
      <div className="sticky top-5">
        <Link
          href="/dashboard"
          className="block rounded-3xl bg-slate-950 p-5 text-white"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-300">
            Jannat
          </p>
          <p className="mt-1 text-xl font-bold">
            Dental Clinic
          </p>
          <p className="mt-2 text-sm text-slate-300">
            {portalLabel}
          </p>
        </Link>

        <nav className="mt-6 space-y-2">
          {links.map(([label, href]) => {
            const active =
              pathname === href ||
              pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
