import Image from 'next/image';
import Link from 'next/link';
import { PortalShell } from '../../components/dashboard/portal-shell';
import { ChatAssistant } from '../../components/clinic/chat-assistant';
import { WhatsAppButton } from '../../components/clinic/whatsapp-button';

interface PublicDoctor {
  id: string;
  fullName: string;
  designation: string | null;
  qualification: string | null;
  specialization: string | null;
  experienceYears: number | null;
  registrationNumber: string | null;
  bio: string | null;
  photoUrl: string | null;
  consultationFee: string | number | null;
  degrees: string[];
  education: string[];
  languages: string[];
  memberships: string[];
  awards: string[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  clinic: {
    name: string;
    city: string | null;
    state: string | null;
  };
}

async function getDoctors(): Promise<PublicDoctor[]> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return [];
  }

  const response = await fetch(`${apiUrl}/doctors`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as PublicDoctor[];
}

export default async function DoctorPage() {
  const doctors = await getDoctors();
  const doctor = doctors[0];

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        {!doctor ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h1 className="text-2xl font-black text-slate-950">
              Doctor profile will appear after an
              authorised admin creates it.
            </h1>
          </section>
        ) : (
          <section className="overflow-hidden rounded-[2.5rem] bg-slate-950 text-white">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative flex min-h-[32rem] items-center justify-center bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 p-10">
                {doctor.photoUrl ? (
                  <Image
                    src={doctor.photoUrl}
                    alt={doctor.fullName}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-64 w-64 items-center justify-center rounded-full border-8 border-white/30 bg-white/20 text-7xl font-black backdrop-blur">
                    {doctor.fullName
                      .split(/\s+/)
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                )}
              </div>

              <div className="p-8 sm:p-12">
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-300">
                  Doctor profile
                </p>
                <h1 className="mt-4 text-4xl font-black sm:text-5xl">
                  {doctor.fullName}
                </h1>

                {doctor.designation ? (
                  <p className="mt-3 text-lg font-bold text-teal-200">
                    {doctor.designation}
                  </p>
                ) : null}

                <div className="mt-6 grid gap-3 text-slate-300 sm:grid-cols-2">
                  {doctor.qualification ? (
                    <p>
                      <strong className="text-white">
                        Qualification:
                      </strong>{' '}
                      {doctor.qualification}
                    </p>
                  ) : null}
                  {doctor.specialization ? (
                    <p>
                      <strong className="text-white">
                        Specialization:
                      </strong>{' '}
                      {doctor.specialization}
                    </p>
                  ) : null}
                  {doctor.experienceYears !== null ? (
                    <p>
                      <strong className="text-white">
                        Experience:
                      </strong>{' '}
                      {doctor.experienceYears} years
                    </p>
                  ) : null}
                  {doctor.registrationNumber ? (
                    <p>
                      <strong className="text-white">
                        Registration:
                      </strong>{' '}
                      {doctor.registrationNumber}
                    </p>
                  ) : null}
                  <p>
                    <strong className="text-white">
                      Primary clinic:
                    </strong>{' '}
                    {doctor.clinic.name}
                  </p>
                  {doctor.consultationFee !== null ? (
                    <p>
                      <strong className="text-white">
                        Consultation fee:
                      </strong>{' '}
                      ₹{String(doctor.consultationFee)}
                    </p>
                  ) : null}
                </div>

                {doctor.bio ? (
                  <p className="mt-6 max-w-3xl leading-8 text-slate-300">
                    {doctor.bio}
                  </p>
                ) : null}

                {doctor.degrees.length ||
                doctor.education.length ? (
                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    {doctor.degrees.length ? (
                      <div className="rounded-2xl bg-white/10 p-5">
                        <h2 className="font-black">
                          Degrees
                        </h2>
                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                          {doctor.degrees.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {doctor.education.length ? (
                      <div className="rounded-2xl bg-white/10 p-5">
                        <h2 className="font-black">
                          Education
                        </h2>
                        <ul className="mt-3 space-y-2 text-sm text-slate-300">
                          {doctor.education.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <Link
                  href="/appointments"
                  className="mt-8 inline-flex rounded-2xl bg-teal-400 px-6 py-3 font-black text-slate-950"
                >
                  Request an appointment
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <WhatsAppButton />
      <ChatAssistant />
    </PortalShell>
  );
}
