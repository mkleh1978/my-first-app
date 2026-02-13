"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    // Always show success — don't reveal whether email exists
    setSent(true);
    setLoading(false);
  }

  if (sent) {
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
          Email gesendet
        </h2>
        <p className="mb-6 text-sm text-white/60">
          Falls ein Account mit dieser Email existiert, wurde ein
          Passwort-Reset-Link gesendet.
        </p>
        <Link
          href="/login"
          className="text-sm text-teal-light hover:text-white transition-colors"
        >
          Zurück zum Login
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur"
    >
      <h2 className="mb-2 text-lg font-semibold text-white">
        Passwort zurücksetzen
      </h2>
      <p className="mb-6 text-sm text-white/60">
        Gib deine Email-Adresse ein und wir senden dir einen Link zum
        Zurücksetzen.
      </p>

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
          placeholder="name@beispiel.de"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-teal py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-light disabled:opacity-50"
      >
        {loading ? "Senden..." : "Reset-Link senden"}
      </button>

      <p className="mt-4 text-center text-sm text-white/50">
        <Link
          href="/login"
          className="text-teal-light hover:text-white transition-colors"
        >
          Zurück zum Login
        </Link>
      </p>
    </form>
  );
}
