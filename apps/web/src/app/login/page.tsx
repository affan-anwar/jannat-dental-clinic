'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

interface ErrorResponse {
  message?: string | string[];
}

function getErrorMessage(data: ErrorResponse): string {
  if (Array.isArray(data.message)) {
    return data.message.join(', ');
  }

  return data.message ?? 'Login failed';
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as ErrorResponse;

      if (!response.ok) {
        setError(getErrorMessage(data));
        return;
      }

      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError('Unable to connect to the server');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl lg:grid-cols-2">
        <div className="hidden bg-gradient-to-br from-emerald-600 to-teal-800 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-100">
              Jannat Dental Clinic
            </p>

            <h1 className="mt-8 text-4xl font-bold leading-tight">
              Gentle dental care for a healthier smile
            </h1>

            <p className="mt-5 leading-7 text-emerald-50">
              Securely manage appointments, prescriptions, reports and clinic
              information.
            </p>
          </div>

          <p className="text-sm text-emerald-100">
            Bisfi, Madhubani · Meerut, Uttar Pradesh
          </p>
        </div>

        <div className="p-7 sm:p-12">
          <p className="text-sm font-semibold text-emerald-700">
            Welcome back
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            Login to your account
          </h2>

          <p className="mt-3 text-sm text-slate-500">
            Enter your registered email and password.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-slate-700"
                htmlFor="email"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="patient@example.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder="Enter your password"
              />
            </div>

            {error ? (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-600">
            New patient?{' '}
            <Link
              href="/signup"
              className="font-semibold text-emerald-700 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}