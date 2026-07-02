import { PortalShell } from '../../components/dashboard/portal-shell';
import { ChatAssistant } from '../../components/clinic/chat-assistant';
import { WhatsAppButton } from '../../components/clinic/whatsapp-button';
import { ServiceCard } from '../../components/clinic/service-card';
import {
  services as fallbackServices,
} from '../../lib/clinic-data';

interface DatabaseService {
  id: string;
  name: string;
  description: string | null;
  price: string | number | null;
  isActive: boolean;
  clinic: {
    name: string;
    city: string | null;
    state: string | null;
  };
}

async function getServices(): Promise<DatabaseService[]> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return [];
  }

  const response = await fetch(`${apiUrl}/services`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as DatabaseService[];
}

export default async function ServicesPage() {
  const databaseServices = (
    await getServices()
  ).filter((service) => service.isActive);

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">
          Services
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Dental care categories
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          Diagnosis and final treatment require clinical
          assessment. Prices shown here are maintained by
          authorised doctors or administrators.
        </p>

        {databaseServices.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {databaseServices.map((service, index) => (
              <article
                key={service.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div
                  className={`h-2 ${
                    [
                      'bg-teal-500',
                      'bg-violet-500',
                      'bg-orange-500',
                      'bg-rose-500',
                      'bg-emerald-500',
                      'bg-blue-500',
                    ][index % 6]
                  }`}
                />
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
                    {service.clinic.name}
                  </p>
                  <h2 className="mt-3 text-xl font-black text-slate-950">
                    {service.name}
                  </h2>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">
                    {service.description ||
                      'Details available during consultation.'}
                  </p>
                  <p className="mt-5 font-black text-slate-950">
                    {service.price !== null
                      ? `₹${String(service.price)}`
                      : 'Price after assessment'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {fallbackServices.map((service) => (
              <ServiceCard
                key={service.name}
                {...service}
              />
            ))}
          </div>
        )}
      </main>
      <WhatsAppButton />
      <ChatAssistant />
    </PortalShell>
  );
}
