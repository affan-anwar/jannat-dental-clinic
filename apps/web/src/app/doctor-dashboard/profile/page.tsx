'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';
import { PortalShell } from '../../../components/dashboard/portal-shell';

interface DoctorProfile {
  fullName: string;
  designation: string | null;
  qualification: string | null;
  specialization: string | null;
  experienceYears: number | null;
  registrationNumber: string | null;
  bio: string | null;
  photoUrl: string | null;
  consultationFee: string | number | null;
  degrees: string[];
  education: string[];
  languages: string[];
  memberships: string[];
  awards: string[];
  websiteUrl: string | null;
  instagramUrl: string | null;
  clinic: {
    name: string;
  };
}

function messageFrom(data: unknown): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data
  ) {
    const value = (data as { message?: unknown }).message;

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (typeof value === 'string') {
      return value;
    }
  }

  return 'Request failed';
}

function lines(value: FormDataEntryValue | null) {
  return String(value ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DoctorProfileEditorPage() {
  const [profile, setProfile] =
    useState<DoctorProfile | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/doctors/me', {
      cache: 'no-store',
    })
      .then(async (response) => {
        const data: unknown = await response.json();

        if (!response.ok) {
          throw new Error(messageFrom(data));
        }

        setProfile(data as DoctorProfile);
      })
      .catch((error: unknown) => {
        setMessage(
          error instanceof Error
            ? error.message
            : 'Unable to load doctor profile',
        );
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const experienceValue = String(
      form.get('experienceYears') ?? '',
    ).trim();
    const feeValue = String(
      form.get('consultationFee') ?? '',
    ).trim();

    const payload = {
      fullName: String(form.get('fullName') ?? ''),
      designation: String(
        form.get('designation') ?? '',
      ),
      qualification: String(
        form.get('qualification') ?? '',
      ),
      specialization: String(
        form.get('specialization') ?? '',
      ),
      ...(experienceValue
        ? {
            experienceYears: Number(experienceValue),
          }
        : {}),
      registrationNumber: String(
        form.get('registrationNumber') ?? '',
      ),
      bio: String(form.get('bio') ?? ''),
      photoUrl: String(form.get('photoUrl') ?? ''),
      ...(feeValue
        ? {
            consultationFee: Number(feeValue),
          }
        : {}),
      degrees: lines(form.get('degrees')),
      education: lines(form.get('education')),
      languages: lines(form.get('languages')),
      memberships: lines(form.get('memberships')),
      awards: lines(form.get('awards')),
      websiteUrl: String(
        form.get('websiteUrl') ?? '',
      ),
      instagramUrl: String(
        form.get('instagramUrl') ?? '',
      ),
    };

    try {
      const response = await fetch('/api/doctors/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        setMessage(messageFrom(data));
        return;
      }

      setProfile(data as DoctorProfile);
      setMessage('Doctor profile updated successfully.');
    } catch {
      setMessage('Unable to save doctor profile.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PortalShell>
        <main className="p-10 text-slate-600">
          Loading doctor profile...
        </main>
      </PortalShell>
    );
  }

  if (!profile) {
    return (
      <PortalShell>
        <main className="p-10">
          <p className="rounded-2xl bg-red-50 p-5 text-red-700">
            {message ||
              'Doctor profile is unavailable.'}
          </p>
        </main>
      </PortalShell>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500';
  const labelClass =
    'mb-2 block text-sm font-bold text-slate-700';

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">
          Doctor workspace
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Edit doctor profile
        </h1>
        <p className="mt-3 text-slate-600">
          Patients can read the saved information, but
          cannot edit it.
        </p>

        <form
          onSubmit={submit}
          className="mt-8 max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className={labelClass}>
                Full display name
              </span>
              <input
                className={inputClass}
                name="fullName"
                required
                defaultValue={profile.fullName}
              />
            </label>

            <label>
              <span className={labelClass}>
                Designation
              </span>
              <input
                className={inputClass}
                name="designation"
                defaultValue={profile.designation ?? ''}
                placeholder="Consultant Dentist"
              />
            </label>

            <label>
              <span className={labelClass}>
                Qualification summary
              </span>
              <input
                className={inputClass}
                name="qualification"
                defaultValue={profile.qualification ?? ''}
                placeholder="Enter verified qualification"
              />
            </label>

            <label>
              <span className={labelClass}>
                Specialization
              </span>
              <input
                className={inputClass}
                name="specialization"
                defaultValue={profile.specialization ?? ''}
              />
            </label>

            <label>
              <span className={labelClass}>
                Experience in years
              </span>
              <input
                className={inputClass}
                name="experienceYears"
                type="number"
                min="0"
                max="80"
                defaultValue={
                  profile.experienceYears ?? ''
                }
              />
            </label>

            <label>
              <span className={labelClass}>
                Registration number
              </span>
              <input
                className={inputClass}
                name="registrationNumber"
                defaultValue={
                  profile.registrationNumber ?? ''
                }
              />
            </label>

            <label>
              <span className={labelClass}>
                Consultation fee
              </span>
              <input
                className={inputClass}
                name="consultationFee"
                type="number"
                min="0"
                step="0.01"
                defaultValue={
                  profile.consultationFee ?? ''
                }
              />
            </label>

            <label>
              <span className={labelClass}>
                Profile photo URL
              </span>
              <input
                className={inputClass}
                name="photoUrl"
                type="url"
                defaultValue={profile.photoUrl ?? ''}
                placeholder="S3/Cloudinary image URL"
              />
            </label>

            <label>
              <span className={labelClass}>
                Website
              </span>
              <input
                className={inputClass}
                name="websiteUrl"
                type="url"
                defaultValue={profile.websiteUrl ?? ''}
              />
            </label>

            <label>
              <span className={labelClass}>
                Instagram
              </span>
              <input
                className={inputClass}
                name="instagramUrl"
                type="url"
                defaultValue={
                  profile.instagramUrl ?? ''
                }
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className={labelClass}>
              Biography
            </span>
            <textarea
              className={inputClass}
              name="bio"
              rows={5}
              defaultValue={profile.bio ?? ''}
            />
          </label>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[
              [
                'degrees',
                'Degrees — one per line',
                profile.degrees,
              ],
              [
                'education',
                'Education — one entry per line',
                profile.education,
              ],
              [
                'languages',
                'Languages — one per line',
                profile.languages,
              ],
              [
                'memberships',
                'Memberships — one per line',
                profile.memberships,
              ],
              [
                'awards',
                'Awards — one per line',
                profile.awards,
              ],
            ].map(([name, label, values]) => (
              <label key={String(name)}>
                <span className={labelClass}>
                  {String(label)}
                </span>
                <textarea
                  className={inputClass}
                  name={String(name)}
                  rows={4}
                  defaultValue={(
                    values as string[]
                  ).join('\n')}
                />
              </label>
            ))}
          </div>

          {message ? (
            <p className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 rounded-xl bg-teal-600 px-6 py-3 font-black text-white disabled:opacity-60"
          >
            {saving
              ? 'Saving...'
              : 'Save doctor profile'}
          </button>
        </form>
      </main>
    </PortalShell>
  );
}
