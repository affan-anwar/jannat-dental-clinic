
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PortalShell } from '../../components/dashboard/portal-shell';

type UserProfile = {
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
};

async function getProfile(): Promise<UserProfile> {
  const apiUrl = process.env.API_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) redirect('/login');
  if (!apiUrl) throw new Error('API_URL is not configured');
  const response = await fetch(`${apiUrl}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) redirect('/login');
  return (await response.json()) as UserProfile;
}

function titleForRole(role: string) {
  if (role === 'SUPER_ADMIN') return 'Super Admin Profile';
  if (role === 'DOCTOR_ADMIN') return 'Doctor Admin Profile';
  if (role === 'DOCTOR') return 'Doctor Profile';
  if (role === 'STAFF') return 'Staff Profile';
  return 'Patient Profile';
}

export default async function ProfilePage() {
  const profile = await getProfile();
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const values = [
    ['Full name', fullName],
    ['Email', profile.email],
    ['Phone', profile.phone ?? 'Not provided'],
    ['Role', profile.role.replaceAll('_', ' ')],
    ['Status', profile.status],
    ['Email verification', profile.emailVerified ? 'Verified' : 'Not verified'],
  ];

  return (
    <PortalShell userName={fullName}>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">Account</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">{titleForRole(profile.role)}</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
          This page shows the signed-in account information used for clinic access and permissions.
        </p>
        <section className="mt-8 max-w-4xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-600 text-2xl font-black text-white">
            {profile.firstName.slice(0, 1)}{profile.lastName?.slice(0, 1) ?? ''}
          </div>
          <dl className="mt-8 grid gap-5 sm:grid-cols-2">
            {values.map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</dt>
                <dd className="mt-2 font-bold text-slate-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </PortalShell>
  );
}
