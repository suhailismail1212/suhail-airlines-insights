import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <Suspense fallback={<div className="w-60 shrink-0 bg-surface border-r border-border min-h-screen" />}>
        <Sidebar />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-surface flex items-center justify-end px-6 gap-4 shrink-0">
          <span className="text-sm text-foreground/60">{session?.user?.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-foreground/60 hover:text-red-600 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 px-8 py-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
