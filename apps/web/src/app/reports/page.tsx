
"use client";

import { FormEvent, useEffect, useState } from 'react';
import { PortalShell } from '../../components/dashboard/portal-shell';

type Report = {
  id: string;
  patientName: string;
  reportType: string;
  notes: string;
  fileName: string;
  fileData: string;
  createdAt: string;
};

const STORAGE_KEY = 'jannat_reports_v1';

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setReports(JSON.parse(stored) as Report[]);
  }, []);

  function save(next: Report[]) {
    setReports(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function uploadReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const form = new FormData(event.currentTarget);
    const file = form.get('file');
    if (!(file instanceof File) || !file.name) {
      setMessage('Please select a report file.');
      return;
    }

    const report: Report = {
      id: crypto.randomUUID(),
      patientName: String(form.get('patientName') ?? '').trim() || 'Patient',
      reportType: String(form.get('reportType') ?? '').trim() || 'Dental report',
      notes: String(form.get('notes') ?? '').trim(),
      fileName: file.name,
      fileData: await readFile(file),
      createdAt: new Date().toISOString(),
    };

    save([report, ...reports]);
    event.currentTarget.reset();
    setMessage('Report uploaded successfully.');
  }

  function removeReport(id: string) {
    save(reports.filter((report) => report.id !== id));
  }

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">Patient records</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">Reports</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
          Upload, view and download patient reports. This MVP stores files in the browser for demonstration; production should use secure cloud storage.
        </p>

        <form onSubmit={uploadReport} className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2">
          <input name="patientName" placeholder="Patient name" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="reportType" placeholder="Report type, for example X-ray or blood test" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" required className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <input name="notes" placeholder="Notes" className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950" />
          <button className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white hover:bg-teal-700 md:col-span-2">Upload report</button>
        </form>

        {message ? <p className="mt-4 rounded-2xl bg-teal-50 p-4 font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-200">{message}</p> : null}

        <section className="mt-8 grid gap-4">
          {reports.length ? reports.map((report) => (
            <article key={report.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">{report.reportType}</h2>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">{report.patientName} · {new Date(report.createdAt).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{report.fileName}</p>
                  {report.notes ? <p className="mt-3 text-slate-600 dark:text-slate-300">{report.notes}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={report.fileData} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-300 px-4 py-2 font-bold dark:border-slate-700">View</a>
                  <a href={report.fileData} download={report.fileName} className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Download</a>
                  <button type="button" onClick={() => removeReport(report.id)} className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 dark:bg-red-950 dark:text-red-300">Delete</button>
                </div>
              </div>
            </article>
          )) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xl font-black text-slate-950 dark:text-white">No reports uploaded yet</p>
              <p className="mt-3 text-slate-500 dark:text-slate-400">Use the upload form above to add the first report.</p>
            </div>
          )}
        </section>
      </main>
    </PortalShell>
  );
}
