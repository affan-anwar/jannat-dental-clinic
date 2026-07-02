'use client';

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { PortalShell } from '../../../components/dashboard/portal-shell';

type Clinic = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
};

type Doctor = {
  id: string;
  fullName: string;
  qualification: string | null;
  specialization: string | null;
  experienceYears: number | null;
  isVerified: boolean;
  isPublic: boolean;
  isActive: boolean;
  clinic?: Clinic | null;
};

type Applicant = {
  firstName: string;
  lastName: string | null;
  email: string;
};

type Application = {
  id: string;
  clinicName: string;
  qualification: string | null;
  specialization: string | null;
  experienceYears: number | null;
  status: string;
  applicant?: Applicant | null;
};

type DoctorStatusUpdate = Partial<
  Pick<Doctor, 'isVerified' | 'isPublic' | 'isActive'>
>;

type ApplicationStatus = 'APPROVED' | 'NEEDS_CHANGES' | 'REJECTED';

type AlertMessage = {
  type: 'success' | 'error';
  text: string;
} | null;

function getOptionalText(value: FormDataEntryValue | null) {
  const text = String(value ?? '').trim();
  return text || undefined;
}

function getRequiredText(value: FormDataEntryValue | null) {
  return String(value ?? '').trim();
}

async function readResponseData(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function getErrorMessage(data: unknown, fallback = 'Request failed') {
  if (typeof data !== 'object' || data === null || !('message' in data)) {
    return fallback;
  }

  const message = (data as { message?: unknown }).message;

  if (Array.isArray(message)) {
    return message.map(String).join(', ');
  }

  if (typeof message === 'string') {
    return message;
  }

  return fallback;
}

const inputClassName =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-950';

const labelClassName =
  'mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200';

const secondaryButtonClassName =
  'rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800';

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  const [alert, setAlert] = useState<AlertMessage>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [doctorResponse, applicationResponse, clinicResponse] =
        await Promise.all([
          fetch('/api/admin/doctors', {
            cache: 'no-store',
            credentials: 'include',
          }),
          fetch('/api/admin/doctor-applications', {
            cache: 'no-store',
            credentials: 'include',
          }),
          fetch('/api/clinics', {
            cache: 'no-store',
            credentials: 'include',
          }),
        ]);

      const [doctorData, applicationData, clinicData] = await Promise.all([
        readResponseData(doctorResponse),
        readResponseData(applicationResponse),
        readResponseData(clinicResponse),
      ]);

      if (!doctorResponse.ok) {
        throw new Error(
          getErrorMessage(doctorData, 'Unable to load doctors'),
        );
      }

      if (!applicationResponse.ok) {
        throw new Error(
          getErrorMessage(
            applicationData,
            'Unable to load doctor applications',
          ),
        );
      }

      if (!clinicResponse.ok) {
        throw new Error(
          getErrorMessage(clinicData, 'Unable to load clinics'),
        );
      }

      setDoctors(Array.isArray(doctorData) ? (doctorData as Doctor[]) : []);
      setApplications(
        Array.isArray(applicationData)
          ? (applicationData as Application[])
          : [],
      );
      setClinics(Array.isArray(clinicData) ? (clinicData as Clinic[]) : []);
    } catch (error) {
      setAlert({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Unable to load doctor management data.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function createDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const experienceText = getRequiredText(
      formData.get('experienceYears'),
    );

    const payload = {
      clinicId: getRequiredText(formData.get('clinicId')),
      firstName: getRequiredText(formData.get('firstName')),
      lastName: getOptionalText(formData.get('lastName')),
      email: getRequiredText(formData.get('email')),
      phone: getOptionalText(formData.get('phone')),
      password: getRequiredText(formData.get('password')),
      fullName: getRequiredText(formData.get('fullName')),
      qualification: getOptionalText(formData.get('qualification')),
      specialization: getOptionalText(formData.get('specialization')),
      experienceYears: experienceText
        ? Number(experienceText)
        : undefined,
      registrationNumber: getOptionalText(
        formData.get('registrationNumber'),
      ),
      bio: getOptionalText(formData.get('bio')),
    };

    setAlert(null);
    setIsCreating(true);

    try {
      const response = await fetch('/api/admin/doctors', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await readResponseData(response);

      if (!response.ok) {
        setAlert({
          type: 'error',
          text: getErrorMessage(data, 'Unable to create doctor'),
        });
        return;
      }

      formElement.reset();

      setAlert({
        type: 'success',
        text: 'Doctor account created successfully.',
      });

      await loadData();
    } catch {
      setAlert({
        type: 'error',
        text: 'Unable to connect to the server.',
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function updateDoctor(
    doctorId: string,
    body: DoctorStatusUpdate,
    actionName: string,
  ) {
    const actionId = `${doctorId}-${actionName}`;

    setAlert(null);
    setActiveAction(actionId);

    try {
      const response = await fetch(
        `/api/admin/doctors/${doctorId}/status`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      );

      const data = await readResponseData(response);

      if (!response.ok) {
        setAlert({
          type: 'error',
          text: getErrorMessage(data, 'Unable to update doctor'),
        });
        return;
      }

      setAlert({
        type: 'success',
        text: 'Doctor status updated successfully.',
      });

      await loadData();
    } catch {
      setAlert({
        type: 'error',
        text: 'Unable to connect to the server.',
      });
    } finally {
      setActiveAction(null);
    }
  }

  async function reviewApplication(
    applicationId: string,
    status: ApplicationStatus,
  ) {
    const actionId = `${applicationId}-${status}`;

    setAlert(null);
    setActiveAction(actionId);

    try {
      const response = await fetch(
        `/api/admin/doctor-applications/${applicationId}/review`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await readResponseData(response);

      if (!response.ok) {
        setAlert({
          type: 'error',
          text: getErrorMessage(
            data,
            'Unable to review doctor application',
          ),
        });
        return;
      }

      setAlert({
        type: 'success',
        text: `Application marked as ${status
          .replaceAll('_', ' ')
          .toLowerCase()}.`,
      });

      await loadData();
    } catch {
      setAlert({
        type: 'error',
        text: 'Unable to connect to the server.',
      });
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <header>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600 dark:text-teal-400">
            Administration
          </p>

          <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">
            Manage Doctors
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
            Create doctor accounts, review doctor applications and
            control which doctors are visible to patients.
          </p>
        </header>

        {alert ? (
          <div
            aria-live="polite"
            className={`mt-5 rounded-2xl border p-4 font-semibold ${
              alert.type === 'success'
                ? 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-200'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200'
            }`}
          >
            {alert.text}
          </div>
        ) : null}

        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white">
            Create doctor account
          </h2>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Fill in the doctor&apos;s personal, professional and login
            information.
          </p>

          <form
            onSubmit={createDoctor}
            className="mt-5 grid gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-3"
          >
            <div>
              <label className={labelClassName} htmlFor="clinicId">
                Clinic <span className="text-red-500">*</span>
              </label>

              <select
                id="clinicId"
                name="clinicId"
                required
                disabled={isCreating}
                defaultValue=""
                className={inputClassName}
              >
                <option value="" disabled>
                  Select clinic
                </option>

                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                    {clinic.city ? ` - ${clinic.city}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClassName} htmlFor="firstName">
                First name <span className="text-red-500">*</span>
              </label>

              <input
                id="firstName"
                name="firstName"
                required
                minLength={2}
                disabled={isCreating}
                placeholder="Enter first name"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="lastName">
                Last name
              </label>

              <input
                id="lastName"
                name="lastName"
                disabled={isCreating}
                placeholder="Enter last name"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="email">
                Login email <span className="text-red-500">*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                disabled={isCreating}
                placeholder="doctor@example.com"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="phone">
                Phone number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                disabled={isCreating}
                placeholder="Enter phone number"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="password">
                Temporary password{' '}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isCreating}
                placeholder="Minimum 8 characters"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="fullName">
                Doctor display name{' '}
                <span className="text-red-500">*</span>
              </label>

              <input
                id="fullName"
                name="fullName"
                required
                minLength={2}
                disabled={isCreating}
                placeholder="Dr. Full Name"
                className={inputClassName}
              />
            </div>

            <div>
              <label
                className={labelClassName}
                htmlFor="qualification"
              >
                Qualification
              </label>

              <input
                id="qualification"
                name="qualification"
                disabled={isCreating}
                placeholder="Example: BDS, MDS"
                className={inputClassName}
              />
            </div>

            <div>
              <label
                className={labelClassName}
                htmlFor="specialization"
              >
                Specialization
              </label>

              <input
                id="specialization"
                name="specialization"
                disabled={isCreating}
                placeholder="Example: Orthodontist"
                className={inputClassName}
              />
            </div>

            <div>
              <label
                className={labelClassName}
                htmlFor="experienceYears"
              >
                Experience in years
              </label>

              <input
                id="experienceYears"
                name="experienceYears"
                type="number"
                min={0}
                max={80}
                step={1}
                disabled={isCreating}
                placeholder="Example: 5"
                className={inputClassName}
              />
            </div>

            <div>
              <label
                className={labelClassName}
                htmlFor="registrationNumber"
              >
                Registration number
              </label>

              <input
                id="registrationNumber"
                name="registrationNumber"
                disabled={isCreating}
                placeholder="Medical registration number"
                className={inputClassName}
              />
            </div>

            <div>
              <label className={labelClassName} htmlFor="bio">
                Short bio
              </label>

              <input
                id="bio"
                name="bio"
                disabled={isCreating}
                placeholder="Short professional introduction"
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={isCreating || clinics.length === 0}
              className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 xl:col-span-3"
            >
              {isCreating
                ? 'Creating doctor account...'
                : 'Create verified doctor'}
            </button>

            {!isLoading && clinics.length === 0 ? (
              <p className="text-sm font-medium text-red-600 dark:text-red-400 xl:col-span-3">
                No clinics are available. Create a clinic before adding a
                doctor.
              </p>
            ) : null}
          </form>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              Doctor applications
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {applications.length} application
              {applications.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            {isLoading ? (
              <p className="rounded-3xl border border-dashed border-slate-300 p-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Loading doctor applications...
              </p>
            ) : applications.length > 0 ? (
              applications.map((application) => {
                const applicantName = application.applicant
                  ? `${application.applicant.firstName} ${
                      application.applicant.lastName ?? ''
                    }`.trim()
                  : application.clinicName;

                return (
                  <article
                    key={application.id}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-col justify-between gap-5 lg:flex-row">
                      <div>
                        <h3 className="text-xl font-black text-slate-950 dark:text-white">
                          {applicantName}
                        </h3>

                        {application.applicant?.email ? (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {application.applicant.email}
                          </p>
                        ) : null}

                        <p className="mt-3 text-slate-600 dark:text-slate-300">
                          {application.qualification ||
                            'Qualification not provided'}
                          {' · '}
                          {application.specialization ||
                            'Specialization not provided'}
                          {' · '}
                          {application.experienceYears ?? 0} years
                        </p>

                        <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                          Status:{' '}
                          <span className="text-teal-600 dark:text-teal-400">
                            {application.status.replaceAll('_', ' ')}
                          </span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-start gap-2">
                        <button
                          type="button"
                          disabled={activeAction !== null}
                          onClick={() =>
                            reviewApplication(
                              application.id,
                              'APPROVED',
                            )
                          }
                          className="rounded-xl bg-teal-600 px-4 py-2 font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {activeAction ===
                          `${application.id}-APPROVED`
                            ? 'Approving...'
                            : 'Approve'}
                        </button>

                        <button
                          type="button"
                          disabled={activeAction !== null}
                          onClick={() =>
                            reviewApplication(
                              application.id,
                              'NEEDS_CHANGES',
                            )
                          }
                          className={secondaryButtonClassName}
                        >
                          {activeAction ===
                          `${application.id}-NEEDS_CHANGES`
                            ? 'Updating...'
                            : 'Needs changes'}
                        </button>

                        <button
                          type="button"
                          disabled={activeAction !== null}
                          onClick={() =>
                            reviewApplication(
                              application.id,
                              'REJECTED',
                            )
                          }
                          className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                        >
                          {activeAction ===
                          `${application.id}-REJECTED`
                            ? 'Rejecting...'
                            : 'Reject'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="rounded-3xl border border-dashed border-slate-300 p-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No doctor applications found.
              </p>
            )}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              Doctors
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {doctors.length} doctor{doctors.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            {isLoading ? (
              <p className="rounded-3xl border border-dashed border-slate-300 p-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Loading doctors...
              </p>
            ) : doctors.length > 0 ? (
              doctors.map((doctor) => (
                <article
                  key={doctor.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    <div>
                      <h3 className="text-xl font-black text-slate-950 dark:text-white">
                        {doctor.fullName}
                      </h3>

                      {doctor.clinic ? (
                        <p className="mt-1 text-sm font-medium text-teal-600 dark:text-teal-400">
                          {doctor.clinic.name}
                          {doctor.clinic.city
                            ? ` · ${doctor.clinic.city}`
                            : ''}
                        </p>
                      ) : null}

                      <p className="mt-3 text-slate-600 dark:text-slate-300">
                        {doctor.qualification || 'No qualification'}
                        {' · '}
                        {doctor.specialization || 'No specialization'}
                        {' · '}
                        {doctor.experienceYears ?? 0} years
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
                        <span
                          className={`rounded-full px-3 py-1 ${
                            doctor.isVerified
                              ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {doctor.isVerified
                            ? 'Verified'
                            : 'Not verified'}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 ${
                            doctor.isPublic
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {doctor.isPublic ? 'Public' : 'Hidden'}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 ${
                            doctor.isActive
                              ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                              : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-start gap-2">
                      <button
                        type="button"
                        disabled={activeAction !== null}
                        onClick={() =>
                          updateDoctor(
                            doctor.id,
                            {
                              isVerified: !doctor.isVerified,
                            },
                            'verification',
                          )
                        }
                        className={secondaryButtonClassName}
                      >
                        {activeAction ===
                        `${doctor.id}-verification`
                          ? 'Updating...'
                          : doctor.isVerified
                            ? 'Unverify'
                            : 'Verify'}
                      </button>

                      <button
                        type="button"
                        disabled={activeAction !== null}
                        onClick={() =>
                          updateDoctor(
                            doctor.id,
                            {
                              isPublic: !doctor.isPublic,
                            },
                            'visibility',
                          )
                        }
                        className={secondaryButtonClassName}
                      >
                        {activeAction === `${doctor.id}-visibility`
                          ? 'Updating...'
                          : doctor.isPublic
                            ? 'Hide public'
                            : 'Show public'}
                      </button>

                      <button
                        type="button"
                        disabled={activeAction !== null}
                        onClick={() =>
                          updateDoctor(
                            doctor.id,
                            {
                              isActive: !doctor.isActive,
                            },
                            'active',
                          )
                        }
                        className={
                          doctor.isActive
                            ? 'rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-950 dark:text-red-300'
                            : 'rounded-xl bg-green-600 px-4 py-2 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50'
                        }
                      >
                        {activeAction === `${doctor.id}-active`
                          ? 'Updating...'
                          : doctor.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-3xl border border-dashed border-slate-300 p-8 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                No doctors found.
              </p>
            )}
          </div>
        </section>
      </main>
    </PortalShell>
  );
}