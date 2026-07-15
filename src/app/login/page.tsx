import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { PlaneTakeoff } from "lucide-react";
import { signIn } from "@/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function authenticate(formData: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        username: formData.get("username"),
        password: formData.get("password"),
        redirectTo: "/overview",
      });
    } catch (err) {
      if (err instanceof AuthError) {
        redirect("/login?error=1");
      }
      throw err;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <PlaneTakeoff className="w-6 h-6 text-gold-400" strokeWidth={1.75} />
          <span className="text-gold-400 font-medium tracking-wide text-lg">Suhail Airlines</span>
        </div>

        <div className="bg-navy-900 border border-navy-700 rounded-xl p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-1">Terminal insights</p>
          <h1 className="text-white text-xl font-medium mb-6">Sign in to the dashboard</h1>

          <form action={authenticate} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-xs text-white/50 mb-1.5">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="w-full rounded-lg bg-navy-800 border border-navy-700 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="manager"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs text-white/50 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg bg-navy-800 border border-navy-700 px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-crimson-500 bg-crimson-600/10 border border-crimson-600/30 rounded-lg px-3 py-2">
                Incorrect username or password.
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-gold-500 hover:bg-gold-400 transition-colors text-navy-950 font-medium py-2.5"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">Demo dashboard · mock data only</p>
      </div>
    </div>
  );
}
