
"use client";

import {
  CalendarDays,
  ChevronDown,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Pill,
  Settings,
  Stethoscope,
  UserCog,
  UserPlus,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type UserRole = "SUPER_ADMIN" | "DOCTOR_ADMIN" | "DOCTOR" | "STAFF" | "PATIENT";

interface CurrentUser {
  firstName: string;
  lastName?: string | null;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}

interface ApiResponse {
  user?: CurrentUser;
  firstName?: string;
  lastName?: string | null;
  email?: string;
  role?: UserRole;
  avatarUrl?: string | null;
}

export function ProfileMenu() {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as ApiResponse;
        const profile = data.user ?? data;
        if (profile.firstName && profile.email && profile.role) {
          setUser({
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            role: profile.role,
            avatarUrl: profile.avatarUrl,
          });
        }
      } catch {
        setUser(null);
      }
    }
    void loadUser();
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "My Profile";
  const initials = user ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() : "U";
  const roleLabel = user?.role?.replaceAll("_", " ") ?? "ACCOUNT";
  const isAdmin = user?.role === "SUPER_ADMIN";
  const isClinical = user?.role === "SUPER_ADMIN" || user?.role === "DOCTOR_ADMIN" || user?.role === "DOCTOR" || user?.role === "STAFF";
  const closeMenu = () => setOpen(false);
  const itemClass = "flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-teal-300";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
      >
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={fullName} className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-sm font-black text-white">{initials}</span>
        )}
        <span className="hidden text-left sm:block">
          <span className="block max-w-44 truncate text-sm font-bold">{fullName}</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">{roleLabel}</span>
        </span>
        <ChevronDown size={17} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+12px)] z-50 max-h-[calc(100vh-110px)] w-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 font-black text-white">{initials}</span>
              <div className="min-w-0">
                <p className="truncate font-bold text-slate-950 dark:text-white">{fullName}</p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user?.email ?? "Loading account..."}</p>
              </div>
            </div>
            <span className="mt-3 inline-flex rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700 dark:bg-teal-950 dark:text-teal-300">{roleLabel}</span>
          </div>

          <nav className="space-y-1 p-3">
            <Link href="/dashboard" onClick={closeMenu} className={itemClass}><LayoutDashboard size={20} />Dashboard</Link>
            {isAdmin ? <Link href="/admin/doctors" onClick={closeMenu} className={itemClass}><UserPlus size={20} />Manage Doctors</Link> : null}
            {isClinical ? <Link href="/doctor-dashboard/services" onClick={closeMenu} className={itemClass}><ListChecks size={20} />Manage Services</Link> : null}
            {isClinical ? <Link href="/staff" onClick={closeMenu} className={itemClass}><UserCog size={20} />Staff Management</Link> : null}
            {isClinical ? <Link href="/payments" onClick={closeMenu} className={itemClass}><CreditCard size={20} />Payments</Link> : null}
            <Link href="/services" onClick={closeMenu} className={itemClass}><ListChecks size={20} />Public Services</Link>
            <Link href="/doctor" onClick={closeMenu} className={itemClass}><Stethoscope size={20} />Doctor Page</Link>
            <Link href="/equipment" onClick={closeMenu} className={itemClass}><Wrench size={20} />Equipment</Link>
            <Link href="/appointments" onClick={closeMenu} className={itemClass}><CalendarDays size={20} />Appointments</Link>
            <Link href="/reports" onClick={closeMenu} className={itemClass}><FileText size={20} />Reports</Link>
            <Link href="/prescriptions" onClick={closeMenu} className={itemClass}><Pill size={20} />Prescriptions</Link>
            {(user?.role === "DOCTOR_ADMIN" || user?.role === "DOCTOR") ? <Link href="/doctor-dashboard/profile" onClick={closeMenu} className={itemClass}><Stethoscope size={20} />Edit Doctor Profile</Link> : null}
            <Link href="/profile" onClick={closeMenu} className={itemClass}><UserRound size={20} />Account Profile</Link>
            <Link href="/settings" onClick={closeMenu} className={itemClass}><Settings size={20} />Settings</Link>
          </nav>

          <div className="border-t border-slate-100 p-3 dark:border-slate-800">
            <button type="button" onClick={() => void logout()} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40">
              <LogOut size={20} />{loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
