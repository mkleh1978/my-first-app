"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur"
    >
      <h2 className="mb-6 text-lg font-semibold text-white">Sign In</h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-white/70"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-white/70"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            placeholder="Minimum 8 characters"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-teal py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-light disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link
          href="/register"
          className="text-teal-light hover:text-white transition-colors"
        >
          Create account
        </Link>
        <Link
          href="/reset-password"
          className="text-white/50 hover:text-white transition-colors"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
