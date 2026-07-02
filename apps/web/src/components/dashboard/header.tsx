import Link from "next/link";
import { ProfileMenu } from "./profile-menu";
import { ThemeToggle } from "../theme-toggle";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex items-center justify-between gap-4 px-5 py-3 lg:px-8">
        <div className="min-w-0">
          <Link
            href="/dashboard"
            className="block truncate font-black text-slate-950 dark:text-white"
          >
            Jannat Dental Clinic
          </Link>

          <p className="truncate text-sm text-slate-500 dark:text-slate-400">
            {userName
              ? `Welcome, ${userName}`
              : "Secure clinic portal"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/appointments"
            className="hidden rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 md:inline-flex"
          >
            Book appointment
          </Link>

          <ThemeToggle />

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}