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

  return data.message ?? 'Signup failed';
}

export default function SignupPage() {
  const router = useRouter();

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      firstName: String(formData.get('firstName') ?? ''),
      lastName: String(formData.get('lastName') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      password,
    };

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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

  const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100';
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-cyan-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Jannat Dental Clinic
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Create patient account
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          Register to manage appointments and dental records.
        </p>

        <form
          className="mt-8 grid gap-5 sm:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <input
            name="firstName"
            required
            minLength={2}
            className={inputClass}
            placeholder="First name"
          />

          <input
            name="lastName"
            className={inputClass}
            placeholder="Last name"
          />

          <input
            name="email"
            type="email"
            required
            className={`${inputClass} sm:col-span-2`}
            placeholder="Email address"
          />

          <input
            name="phone"
            className={`${inputClass} sm:col-span-2`}
            placeholder="Phone number"
          />

          <input
            name="password"
            type="password"
            required
            minLength={8}
            className={inputClass}
            placeholder="Password"
          />

          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className={inputClass}
            placeholder="Confirm password"
          />

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:col-span-2"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link
            href="/login"
            className="font-semibold text-emerald-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}