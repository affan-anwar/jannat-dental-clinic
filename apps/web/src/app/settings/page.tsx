
import { PortalShell } from '../../components/dashboard/portal-shell';
import { ThemeToggle } from '../../components/theme-toggle';

export default function SettingsPage() {
  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">Settings</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Portal settings</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
          Manage display preferences and review security settings for this clinic portal.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Appearance</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Switch between light, dark and system theme.</p>
            <div className="mt-5"><ThemeToggle /></div>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Security status</h2>
            <ul className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
              <li>Authentication uses secure HTTP-only cookies.</li>
              <li>Role-based routes are protected by the backend.</li>
              <li>Only authorised clinic users can manage doctors, services, reports and payments.</li>
            </ul>
          </section>
        </div>
      </main>
    </PortalShell>
  );
}
