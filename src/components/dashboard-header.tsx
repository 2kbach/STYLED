"use client";

import { signOut } from "next-auth/react";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <h1 className="text-xl font-bold tracking-tight">STYLED</h1>
      <div className="flex items-center gap-3">
        {user.image && (
          <img
            src={user.image}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        )}
        <button
          onClick={() => signOut()}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
