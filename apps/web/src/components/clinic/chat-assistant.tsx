
'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';

type Message = { id: number; from: 'assistant' | 'user'; text: string };
function getErrorMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const value = (data as { message?: unknown }).message;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') return value;
  }
  return 'Clinic assistant is unavailable.';
}

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 1, from: 'assistant', text: 'Hello. I can help with clinic branches, services, appointments, doctor information and general dental-care guidance. I do not provide diagnosis or prescriptions.' }]);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || loading) return;
    const userMessage: Message = { id: Date.now(), from: 'user', text: question };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, history: messages.slice(-8).map((m) => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text })) }) });
      const data = await response.json() as { answer?: string; message?: string | string[] };
      setMessages((current) => [...current, { id: Date.now() + 1, from: 'assistant', text: response.ok && data.answer ? data.answer : getErrorMessage(data) }]);
    } catch {
      setMessages((current) => [...current, { id: Date.now() + 1, from: 'assistant', text: 'Clinic assistant is temporarily unavailable.' }]);
    } finally { setLoading(false); }
  }
  return <>
    <button type="button" onClick={() => setOpen((value) => !value)} className="fixed bottom-5 right-5 z-50 flex h-14 items-center gap-2 rounded-full bg-slate-950 px-5 font-bold text-white shadow-2xl transition hover:scale-105"><span aria-hidden="true" className="text-xs">AI</span><span className="hidden sm:inline">Clinic assistant</span></button>
    {open ? <section className="fixed bottom-24 right-4 z-50 flex h-[34rem] w-[calc(100%-2rem)] max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <header className="bg-slate-950 p-4 text-white"><div className="flex items-start justify-between gap-3"><div><p className="font-black">Jannat Clinic Assistant</p><p className="text-xs text-slate-300">English-only clinic help - not a medical diagnosis</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-lg bg-white/10 px-3 py-1">X</button></div></header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950">{messages.map((message) => <p key={message.id} className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.from === 'assistant' ? 'bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200' : 'ml-auto bg-teal-600 text-white'}`}>{message.text}</p>)}{loading ? <p className="w-fit rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:bg-slate-900">Thinking...</p> : null}<div ref={endRef} /></div>
      <div className="border-t border-slate-200 p-3 dark:border-slate-800"><Link href="/appointments" className="mb-2 block rounded-xl bg-teal-50 px-3 py-2 text-center text-xs font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-200">Book appointment</Link><form onSubmit={submit} className="flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} maxLength={2000} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950" placeholder="Ask in English only..." /><button type="submit" disabled={loading || !input.trim()} className="rounded-xl bg-slate-950 px-4 text-sm font-bold text-white disabled:opacity-50">Send</button></form></div>
    </section> : null}
  </>;
}
