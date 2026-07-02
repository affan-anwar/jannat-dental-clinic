import type { ReactNode } from "react";
import { Header } from "./header";

export function PortalShell({
  children,
  userName,
}: {
  children: ReactNode;
  userName?: string;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <Header userName={userName} />

      <main className="min-w-0">
        {children}
      </main>
    </div>
  );
}