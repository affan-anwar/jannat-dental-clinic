import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PortalShell } from '../../components/dashboard/portal-shell';

interface Profile {
  firstName: string;
  lastName: string | null;
  role: string;
}

async function getProfile(): Promise<Profile> {
  const apiUrl = process.env.API_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!apiUrl || !token) {
    redirect('/login');
  }

  const response = await fetch(`${apiUrl}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    redirect('/login');
  }

  const profile = (await response.json()) as Profile;

  if (
    profile.role !== 'DOCTOR' &&
    profile.role !== 'SUPER_ADMIN'
  ) {
    redirect('/dashboard');
  }

  return profile;
}

export default async function DoctorDashboardPage() {
  const profile = await getProfile();
  const fullName = [
    profile.firstName,
    profile.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  const cards =
    profile.role === 'SUPER_ADMIN'
      ? [
          {
            title: 'Create doctor account',
            text: 'Create a secure doctor login linked to a clinic.',
            href: '/admin/doctors',
          },
          {
            title: 'Manage services',
            text: 'Add services and update clinic prices.',
            href: '/doctor-dashboard/services',
          },
          {
            title: 'View public profile',
            text: 'Review what patients can see.',
            href: '/doctor',
          },
        ]
      : [
          {
            title: 'Edit doctor profile',
            text: 'Update verified education, registration, biography and consultation fee.',
            href: '/doctor-dashboard/profile',
          },
          {
            title: 'Manage services',
            text: 'Add treatments and maintain charges for your clinic.',
            href: '/doctor-dashboard/services',
          },
          {
            title: 'View public profile',
            text: 'Review the read-only profile visible to patients.',
            href: '/doctor',
          },
        ];

  return (
    <PortalShell userName={fullName}>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">
          {profile.role === 'SUPER_ADMIN'
            ? 'Administration'
            : 'Doctor workspace'}
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          {profile.role === 'SUPER_ADMIN'
            ? 'Clinic administration'
            : 'Doctor dashboard'}
        </h1>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-xl font-black text-slate-950">
                {card.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {card.text}
              </p>
              <p className="mt-6 font-bold text-teal-700">
                Open →
              </p>
            </Link>
          ))}
        </div>
      </main>
    </PortalShell>
  );
}
