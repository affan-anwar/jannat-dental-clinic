import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PortalShell } from '../../components/dashboard/portal-shell';
import { ClinicCard } from '../../components/clinic/clinic-card';
import { ChatAssistant } from '../../components/clinic/chat-assistant';
import { ServiceCard } from '../../components/clinic/service-card';
import { WhatsAppButton } from '../../components/clinic/whatsapp-button';
import { services } from '../../lib/clinic-data';

type UserProfile = { firstName: string; lastName: string | null; status: string };
type Clinic = { id: string; name: string; addressLine1: string | null; addressLine2: string | null; city: string | null; state: string | null; postalCode: string | null; phone: string | null };

async function getData(): Promise<{ user: UserProfile; clinics: Clinic[] }> {
  const apiUrl = process.env.API_URL;
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;
  if (!token) redirect('/login');
  if (!apiUrl) throw new Error('API_URL is not configured');
  const [profileResponse, clinicsResponse] = await Promise.all([
    fetch(`${apiUrl}/auth/profile`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
    fetch(`${apiUrl}/clinics`, { cache: 'no-store' }),
  ]);
  if (!profileResponse.ok) redirect('/login');
  return {
    user: (await profileResponse.json()) as UserProfile,
    clinics: clinicsResponse.ok ? ((await clinicsResponse.json()) as Clinic[]) : [],
  };
}

export default async function DashboardPage() {
  const { user, clinics } = await getData();
  const userName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return (
    <PortalShell userName={userName}>
      <main>
        <section className="relative overflow-hidden bg-slate-950 px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-24">
          <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="relative grid items-center gap-10 xl:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-teal-300">Calm care. Clear choices.</p>
              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Your dental care, appointments and clinic information in one secure place.</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">Choose a branch, review available services and send an appointment request without losing access to your patient profile.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/appointments" className="rounded-2xl bg-teal-400 px-6 py-3 font-black text-slate-950 hover:bg-teal-300">Book appointment</Link>
                <Link href="/services" className="rounded-2xl border border-white/20 px-6 py-3 font-black text-white hover:bg-white/10">Explore services</Link>
              </div>
            </div>
            <div className="relative mx-auto h-80 w-full max-w-md">
              <div className="absolute inset-8 rounded-[4rem] bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 opacity-90 shadow-2xl" />
              <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full drop-shadow-2xl" aria-hidden="true">
                <path d="M84 45c28-15 44 8 66 8s39-23 67-8c37 20 35 67 21 103-12 31-18 102-44 104-24 2-22-55-44-55s-20 57-44 55c-26-2-32-73-44-104C38 112 47 65 84 45Z" fill="white" />
                <path d="M101 77c18-8 31 5 49 5s31-13 49-5" fill="none" stroke="#99f6e4" strokeLinecap="round" strokeWidth="9" />
              </svg>
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 lg:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">Our branches</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">Choose the clinic nearest to you</h2>
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {clinics.length ? clinics.map((clinic) => <ClinicCard key={clinic.id} clinic={clinic} />) : <p className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">Clinic branches are temporarily unavailable.</p>}
          </div>
        </section>

        <section className="bg-white px-5 py-14 sm:px-8 lg:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">Dental services</p>
          <h2 className="mt-2 max-w-3xl text-3xl font-black text-slate-950">Care designed around assessment, comfort and informed decisions</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => <ServiceCard key={service.name} {...service} />)}</div>
        </section>

        <section className="px-5 py-14 sm:px-8 lg:px-12">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-teal-700 to-slate-950 p-8 text-white sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-200">Meet your dentist</p>
            <h2 className="mt-3 text-4xl font-black">Dr. Syeda Bibi Tarannum Parveen</h2>
            <p className="mt-5 max-w-2xl leading-7 text-slate-200">The portal avoids unverified awards, degrees and experience claims. Authorised clinic staff can add verified information later.</p>
            <Link href="/doctor" className="mt-7 inline-flex rounded-2xl bg-white px-6 py-3 font-black text-slate-950">Doctor profile</Link>
          </div>
        </section>
      </main>
      <WhatsAppButton />
      <ChatAssistant />
    </PortalShell>
  );
}
