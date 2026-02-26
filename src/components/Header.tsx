"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { LogOut, Menu, Shield, Star, X } from "lucide-react";

interface HeaderProps {
  totalCount?: number;
}

export default function Header({ totalCount }: HeaderProps) {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useFavorites();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        href="/"
        onClick={() => setMobileOpen(false)}
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
        onClick={() => setMobileOpen(false)}
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
        onClick={() => setMobileOpen(false)}
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
          onClick={() => setMobileOpen(false)}
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
    </>
  );

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold tracking-tight">
              European FinWell Database
            </h1>
            <p className="text-sm text-white/60">
              House of Finance & Tech Berlin
            </p>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks}
          </nav>
        </div>

        {/* Right: Stats + User + Mobile toggle */}
        <div className="flex items-center gap-4">
          {totalCount !== undefined && (
            <div className="hidden items-center gap-2 text-sm text-white/70 sm:flex">
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
            <div className="hidden items-center gap-3 border-l border-white/20 pl-4 sm:flex">
              <span className="max-w-[180px] truncate text-sm text-white/60">
                {user.email}
              </span>
              {isAdmin && (
                <span className="rounded bg-orange/20 px-1.5 py-0.5 text-xs font-semibold text-orange-light">
                  Admin
                </span>
              )}
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 px-6 pb-4 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks}
          </nav>
          {user && (
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm text-white/60">
                  {user.email}
                </span>
                {isAdmin && (
                  <span className="mt-1 inline-block rounded bg-orange/20 px-1.5 py-0.5 text-xs font-semibold text-orange-light">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={signOut}
                className="ml-3 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sign out</span>
              </button>
            </div>
          )}
          {totalCount !== undefined && (
            <div className="mt-2 flex items-center gap-2 text-sm text-white/50">
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
        </div>
      )}
    </header>
  );
}
