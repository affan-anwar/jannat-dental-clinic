
import { PortalShell } from '../../components/dashboard/portal-shell';
import { ChatAssistant } from '../../components/clinic/chat-assistant';
import { WhatsAppButton } from '../../components/clinic/whatsapp-button';
import { equipment } from '../../lib/clinic-data';

export default function EquipmentPage() {
  return (
    <PortalShell>
      <main className="min-h-screen bg-[#f8f6f1] px-5 py-12 dark:bg-slate-950 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <section className="max-w-5xl">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#b99871]">
              Clinic equipment
            </p>
            <h1
              className="mt-5 text-5xl font-normal leading-[1] tracking-[-0.04em] text-[#12483d] dark:text-white sm:text-6xl lg:text-7xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              Equipment that quietly does the heavy lifting.
            </h1>
            <p className="mt-7 max-w-4xl text-lg leading-8 text-slate-700 dark:text-slate-300">
              Modern, well-maintained tools support clearer diagnosis, safer workflows and more comfortable dental treatment.
            </p>
          </section>

          <section className="mt-14 grid gap-8 md:grid-cols-2">
            {equipment.map((item) => (
              <article
                key={item.name}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="px-7 py-8 sm:px-8">
                  <h2
                    className="text-3xl font-normal text-[#12483d] dark:text-white"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {item.name}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-slate-700 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-10 rounded-3xl border border-[#ddd6ca] bg-white/80 p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Exact equipment brands and model numbers should be verified by authorised clinic staff before public display.
            </p>
          </section>
        </div>
      </main>
      <WhatsAppButton />
      <ChatAssistant />
    </PortalShell>
  );
}
