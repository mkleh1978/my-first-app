"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith("@hoft.berlin")) {
      setError("Registration is only available with an @hoft.berlin email address.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setError("This email address is already registered.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/20">
          <svg
            className="h-6 w-6 text-teal-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-white">
          Confirmation Email Sent
        </h2>
        <p className="mb-6 text-sm text-white/60">
          Please check your inbox and click the confirmation link to activate
          your account.
        </p>
        <Link
          href="/login"
          className="text-sm text-teal-light hover:text-white transition-colors"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur"
    >
      <h2 className="mb-6 text-lg font-semibold text-white">
        Create Account
      </h2>

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
            placeholder="name@hoft.berlin"
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

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1 block text-sm font-medium text-white/70"
          >
            Confirm Password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            placeholder="Repeat password"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-teal py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-light disabled:opacity-50"
      >
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="mt-4 text-center text-sm text-white/50">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-teal-light hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
