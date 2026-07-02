'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';
import { PortalShell } from '../../../components/dashboard/portal-shell';

interface Clinic {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

interface Profile {
  role: string;
}

interface DoctorProfile {
  clinic: Clinic;
}

interface ClinicService {
  id: string;
  clinicId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string | number | null;
  isActive: boolean;
  clinic: Clinic;
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

export default function ManageServicesPage() {
  const [services, setServices] = useState<ClinicService[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [role, setRole] = useState('');
  const [doctorClinicId, setDoctorClinicId] =
    useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    const [serviceResponse, clinicResponse, profileResponse] =
      await Promise.all([
        fetch('/api/services', {
          cache: 'no-store',
        }),
        fetch('/api/clinics', {
          cache: 'no-store',
        }),
        fetch('/api/auth/profile', {
          cache: 'no-store',
        }),
      ]);

    if (serviceResponse.ok) {
      setServices(
        (await serviceResponse.json()) as ClinicService[],
      );
    }

    if (clinicResponse.ok) {
      setClinics(
        (await clinicResponse.json()) as Clinic[],
      );
    }

    if (profileResponse.ok) {
      const profile =
        (await profileResponse.json()) as Profile;
      setRole(profile.role);

      if (profile.role === 'DOCTOR') {
        const doctorResponse = await fetch(
          '/api/doctors/me',
          {
            cache: 'no-store',
          },
        );

        if (doctorResponse.ok) {
          const doctor =
            (await doctorResponse.json()) as DoctorProfile;
          setDoctorClinicId(doctor.clinic.id);
        }
      }
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function createService(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const clinicId =
      role === 'DOCTOR'
        ? doctorClinicId
        : String(form.get('clinicId') ?? '');
    const price = String(form.get('price') ?? '').trim();
    const duration = String(
      form.get('durationMinutes') ?? '',
    ).trim();

    const payload = {
      clinicId,
      name: String(form.get('name') ?? ''),
      description: String(
        form.get('description') ?? '',
      ),
      ...(price ? { price: Number(price) } : {}),
      ...(duration
        ? { durationMinutes: Number(duration) }
        : {}),
      isActive: true,
    };

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
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

      setMessage('Service created successfully.');
      event.currentTarget.reset();
      await load();
    } catch {
      setMessage('Unable to create service.');
    } finally {
      setSaving(false);
    }
  }

  async function updateService(
    service: ClinicService,
    field: 'price' | 'isActive',
    value: number | boolean,
  ) {
    const response = await fetch(
      `/api/services/${service.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: value,
        }),
      },
    );

    const data: unknown = await response.json();

    if (!response.ok) {
      setMessage(messageFrom(data));
      return;
    }

    setMessage('Service updated.');
    await load();
  }

  const editableServices =
    role === 'DOCTOR'
      ? services.filter(
          (service) =>
            service.clinicId === doctorClinicId,
        )
      : services;

  const inputClass =
    'w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-teal-500';

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">
          Doctor and admin
        </p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">
          Manage services and charges
        </h1>
        <p className="mt-3 text-slate-600">
          Patients can view these services and prices,
          but cannot change them.
        </p>

        <form
          onSubmit={createService}
          className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 xl:grid-cols-5"
        >
          {role !== 'DOCTOR' ? (
            <select
              className={inputClass}
              name="clinicId"
              required
            >
              <option value="">
                Select clinic
              </option>
              {clinics.map((clinic) => (
                <option
                  key={clinic.id}
                  value={clinic.id}
                >
                  {clinic.name}
                </option>
              ))}
            </select>
          ) : (
            <div className={`${inputClass} bg-slate-50`}>
              Doctor clinic selected automatically
            </div>
          )}

          <input
            className={inputClass}
            name="name"
            required
            placeholder="Service name"
          />

          <input
            className={inputClass}
            name="durationMinutes"
            type="number"
            min="5"
            max="480"
            placeholder="Duration minutes"
          />

          <input
            className={inputClass}
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
          />

          <button
            type="submit"
            disabled={saving || !role}
            className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white disabled:opacity-60"
          >
            Add service
          </button>

          <textarea
            className={`${inputClass} md:col-span-2 xl:col-span-5`}
            name="description"
            rows={3}
            placeholder="Service description"
          />
        </form>

        {message ? (
          <p className="mt-5 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            {message}
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          {editableServices.map((service) => (
            <article
              key={service.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">
                    {service.clinic.name}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    {service.name}
                  </h2>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    service.isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {service.isActive
                    ? 'ACTIVE'
                    : 'INACTIVE'}
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {service.description ||
                  'No description'}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={
                    service.price ?? ''
                  }
                  className="w-40 rounded-xl border border-slate-300 px-3 py-2"
                  onBlur={(event) => {
                    const value = Number(
                      event.target.value,
                    );

                    if (
                      Number.isFinite(value) &&
                      value >= 0
                    ) {
                      void updateService(
                        service,
                        'price',
                        value,
                      );
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    void updateService(
                      service,
                      'isActive',
                      !service.isActive,
                    )
                  }
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
                >
                  {service.isActive
                    ? 'Deactivate'
                    : 'Activate'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </PortalShell>
  );
}
