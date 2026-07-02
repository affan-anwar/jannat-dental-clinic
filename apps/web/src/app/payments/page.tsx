"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PortalShell } from "../../components/dashboard/portal-shell";

type PaymentStatus = "DUE" | "PARTIAL" | "PAID";

type Payment = {
  id: string;
  patientName: string;
  service: string;
  amount: number;
  paid: number;
  status: PaymentStatus;
  createdAt: string;
};

const STORAGE_KEY = "jannat_payments_v2";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function getStatus(amount: number, paid: number): PaymentStatus {
  if (paid >= amount) return "PAID";
  if (paid > 0) return "PARTIAL";
  return "DUE";
}

function isPayment(value: unknown): value is Payment {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Payment>;

  return (
    typeof item.id === "string" &&
    typeof item.patientName === "string" &&
    typeof item.service === "string" &&
    typeof item.amount === "number" &&
    Number.isFinite(item.amount) &&
    typeof item.paid === "number" &&
    Number.isFinite(item.paid) &&
    typeof item.createdAt === "string"
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(STORAGE_KEY) ??
        window.localStorage.getItem("jannat_payments_v1");

      if (!stored) return;

      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) return;

      const valid = parsed.filter(isPayment).map((item) => ({
        ...item,
        status: getStatus(item.amount, item.paid),
      }));

      setPayments(valid);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    } catch {
      setMessage("Saved payment data could not be loaded.");
    }
  }, []);

  function save(next: Payment[]) {
    setPayments(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const totals = useMemo(
    () =>
      payments.reduce(
        (summary, payment) => ({
          amount: summary.amount + payment.amount,
          paid: summary.paid + payment.paid,
        }),
        { amount: 0, paid: 0 },
      ),
    [payments],
  );

  function addPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const patientName = String(form.get("patientName") ?? "").trim();
    const service = String(form.get("service") ?? "").trim();
    const amount = Number(form.get("amount"));
    const enteredPaid = Number(form.get("paid") || 0);

    if (!patientName) {
      setMessage("Patient name is required.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage("Amount must be greater than zero.");
      return;
    }

    if (!Number.isFinite(enteredPaid) || enteredPaid < 0) {
      setMessage("Paid amount cannot be negative.");
      return;
    }

    const paid = Math.min(enteredPaid, amount);

    const payment: Payment = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      patientName,
      service: service || "Clinic service",
      amount,
      paid,
      status: getStatus(amount, paid),
      createdAt: new Date().toISOString(),
    };

    save([payment, ...payments]);
    formElement.reset();
    setMessage("Payment record added successfully.");
  }

  function deletePayment(id: string) {
    save(payments.filter((payment) => payment.id !== id));
    setMessage("Payment record deleted.");
  }

  function exportCsv() {
    if (!payments.length) {
      setMessage("There are no payment records to export.");
      return;
    }

    const quote = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;

    const rows = [
      ["Patient", "Service", "Amount", "Paid", "Due", "Status", "Created"],
      ...payments.map((payment) => [
        payment.patientName,
        payment.service,
        payment.amount,
        payment.paid,
        Math.max(payment.amount - payment.paid, 0),
        payment.status,
        new Date(payment.createdAt).toLocaleString(),
      ]),
    ];

    const csv = rows
      .map((row) => row.map((value) => quote(value)).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jannat-dental-clinic-payments.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <PortalShell>
      <main className="px-5 py-10 sm:px-8 lg:px-12">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-teal-600">
              Billing
            </p>
            <h1 className="mt-2 text-4xl font-black text-slate-950 dark:text-white">
              Payments
            </h1>
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
          >
            Export CSV
          </button>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Total billed</p>
            <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
              {formatCurrency(totals.amount)}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Paid</p>
            <p className="mt-2 text-3xl font-black text-teal-600">
              {formatCurrency(totals.paid)}
            </p>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500">Due</p>
            <p className="mt-2 text-3xl font-black text-red-600">
              {formatCurrency(Math.max(totals.amount - totals.paid, 0))}
            </p>
          </article>
        </section>

        <form
          onSubmit={addPayment}
          className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2 xl:grid-cols-5"
        >
          <input
            name="patientName"
            placeholder="Patient"
            required
            className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            name="service"
            placeholder="Service"
            className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Amount"
            required
            className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
          />
          <input
            name="paid"
            type="number"
            min="0"
            step="0.01"
            placeholder="Paid"
            className="rounded-xl border border-slate-300 px-4 py-3 dark:border-slate-700 dark:bg-slate-950"
          />
          <button className="rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition hover:bg-teal-700">
            Add payment
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-2xl bg-teal-50 p-4 font-semibold text-teal-700 dark:bg-teal-950 dark:text-teal-200">
            {message}
          </p>
        ) : null}

        <section className="mt-8 grid gap-4">
          {payments.length ? (
            payments.map((payment) => {
              const due = Math.max(payment.amount - payment.paid, 0);

              return (
                <article
                  key={payment.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">
                        {payment.patientName}
                      </h2>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        {payment.service} -{" "}
                        {new Date(payment.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-3 font-bold text-slate-800 dark:text-slate-100">
                        Amount {formatCurrency(payment.amount)} | Paid{" "}
                        {formatCurrency(payment.paid)} | Due {formatCurrency(due)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-4 py-2 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {payment.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => deletePayment(payment.id)}
                        className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 dark:bg-red-950 dark:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xl font-black text-slate-950 dark:text-white">
                No payment records yet
              </p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Add the first payment using the form above.
              </p>
            </div>
          )}
        </section>
      </main>
    </PortalShell>
  );
}
