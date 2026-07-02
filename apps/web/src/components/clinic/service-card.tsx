export function ServiceCard({ name, description, accent }: { name: string; description: string; accent: string }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`h-2 bg-gradient-to-r ${accent}`} />
      <div className="p-6">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-2xl text-white`}>✦</div>
        <h3 className="mt-5 text-xl font-black text-slate-950">{name}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Final plan after consultation</p>
      </div>
    </article>
  );
}
