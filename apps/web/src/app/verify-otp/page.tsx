'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

function readMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const value = (data as { message?: unknown }).message;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') return value;
  }
  return 'OTP verification failed';
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [channel, setChannel] = useState<'EMAIL' | 'SMS'>('EMAIL');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedIdentifier = sessionStorage.getItem('reset_identifier');
    const savedChannel = sessionStorage.getItem('reset_channel');

    if (!savedIdentifier) {
      router.replace('/forgot-password');
      return;
    }

    setIdentifier(savedIdentifier);
    setChannel(savedChannel === 'SMS' ? 'SMS' : 'EMAIL');
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel, otp }),
      });
      const data = (await response.json()) as {
        resetToken?: string;
        message?: string | string[];
      };

      if (!response.ok || !data.resetToken) {
        setMessage(readMessage(data));
        return;
      }

      sessionStorage.setItem('reset_token', data.resetToken);
      router.push('/reset-password');
    } catch {
      setMessage('Unable to connect to the verification service');
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setMessage('');
    const response = await fetch('/api/auth/resend-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, channel }),
    });
    const data: unknown = await response.json();
    setMessage(response.ok ? 'A new OTP was requested.' : readMessage(data));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">
          Verify identity
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Enter the 6-digit OTP
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          OTP requested through {channel === 'EMAIL' ? 'email' : 'SMS'}.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <input
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            value={otp}
            onChange={(event) =>
              setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-4 text-center text-3xl font-black tracking-[0.45em] outline-none focus:border-emerald-500"
            placeholder="000000"
          />

          {message ? (
            <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          ) : null}

          <button
            disabled={loading || otp.length !== 6}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => void resend()}
          className="mt-4 w-full text-sm font-bold text-emerald-700"
        >
          Resend OTP
        </button>
        <Link href="/forgot-password" className="mt-4 block text-center text-sm text-slate-500">
          Change email or phone
        </Link>
      </section>
    </main>
  );
}
