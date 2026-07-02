interface Clinic {
  id: string;
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  phone: string | null;
}

export function ClinicCard({ clinic }: { clinic: Clinic }) {
  const address = [clinic.addressLine1, clinic.addressLine2, clinic.city, clinic.state, clinic.postalCode].filter(Boolean).join(', ');
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Clinic branch</p>
          <h3 className="mt-2 text-xl font-black text-slate-950">{clinic.name}</h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Active</span>
      </div>
      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-600">{address || 'Address will be updated by the clinic.'}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {address ? <a href={mapUrl} target="_blank" rel="noreferrer" className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">Directions</a> : null}
        {clinic.phone ? <a href={`tel:${clinic.phone}`} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700">Call</a> : null}
      </div>
    </article>
  );
}
