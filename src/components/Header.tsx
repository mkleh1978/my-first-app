"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { LogOut, Shield, Star } from "lucide-react";

interface HeaderProps {
  totalCount?: number;
}

export default function Header({ totalCount }: HeaderProps) {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useFavorites();

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-8">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              European FinTech Database
            </h1>
            <p className="text-sm text-white/60">
              House of Finance & Tech Berlin
            </p>
          </div>
          <nav className="flex items-center gap-1">
            <Link
              href="/"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              Database
            </Link>
            <Link
              href="/reporting"
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/reporting"
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              Reporting
            </Link>
            <Link
              href="/watchlist"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                pathname === "/watchlist"
                  ? "bg-orange/20 text-orange-light"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Star className="h-3.5 w-3.5" />
              Watchlist{count > 0 && ` (${count})`}
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === "/admin"
                    ? "bg-white/15 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {totalCount !== undefined && (
            <div className="flex items-center gap-2 text-sm text-white/70">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              {totalCount.toLocaleString()} Companies
            </div>
          )}
          {user && (
            <div className="flex items-center gap-3 border-l border-white/20 pl-4">
              <span className="text-sm text-white/60">{user.email}</span>
              {isAdmin && (
                <span className="rounded bg-orange/20 px-1.5 py-0.5 text-xs font-semibold text-orange-light">
                  Admin
                </span>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                title="Abmelden"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
