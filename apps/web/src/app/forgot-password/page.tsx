'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

function getMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const value = (data as { message?: unknown }).message;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') return value;
  }
  return 'Unable to send OTP';
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [channel, setChannel] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        setMessage(getMessage(data));
        return;
      }

      sessionStorage.setItem('reset_identifier', identifier);
      sessionStorage.setItem('reset_channel', channel);
      router.push('/verify-otp');
    } catch {
      setMessage('Unable to connect to the password reset service');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">
          Account recovery
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Forgot your password?
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Enter your registered email or phone and choose where to receive the OTP.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Registered email or phone
            </span>
            <input
              required
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="patient@example.com or +919876543210"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Send OTP by</p>
            <div className="grid grid-cols-2 gap-3">
              {(['EMAIL', 'SMS'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setChannel(value)}
                  className={`rounded-xl border px-4 py-3 font-bold ${
                    channel === value
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-slate-300 text-slate-600'
                  }`}
                >
                  {value === 'EMAIL' ? 'Email OTP' : 'SMS OTP'}
                </button>
              ))}
            </div>
          </div>

          {message ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </p>
          ) : null}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 block text-center text-sm font-bold text-emerald-700"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
