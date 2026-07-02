'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

function getMessage(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const value = (data as { message?: unknown }).message;
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') return value;
  }
  return 'Password reset failed';
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('reset_token');
    if (!savedToken) {
      router.replace('/forgot-password');
      return;
    }
    setToken(savedToken);
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: token, newPassword: password }),
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        setMessage(getMessage(data));
        return;
      }

      sessionStorage.removeItem('reset_identifier');
      sessionStorage.removeItem('reset_channel');
      sessionStorage.removeItem('reset_token');
      router.replace('/login?reset=success');
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
          Secure reset
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Create a new password
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Use at least 8 characters with uppercase, lowercase and a number.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="New password"
          />
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="Confirm new password"
          />

          {message ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </p>
          ) : null}

          <button
            disabled={loading || !token}
            className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </section>
    </main>
  );
}
