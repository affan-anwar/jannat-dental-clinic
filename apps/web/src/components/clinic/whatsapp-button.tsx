'use client';

export function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_CLINIC_WHATSAPP?.replace(/\D/g, '');
  if (!number) return null;
  const message = encodeURIComponent('Hello Jannat Dental Clinic, I want help with an appointment.');
  return (
    <a href={`https://wa.me/${number}?text=${message}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white shadow-2xl transition hover:scale-105 hover:bg-emerald-600">☎</a>
  );
}
