"use client";

import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
  isTestMode?: boolean;
}

export function DashboardHeader({ user, isTestMode = false }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function toggleTestMode() {
    await fetch("/api/test-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !isTestMode }),
    });
    setMenuOpen(false);
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <h1 className="text-xl font-bold tracking-tight">STYLED</h1>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full focus:outline-none"
        >
          {user.image ? (
            <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {user.name?.[0] ?? "?"}
            </div>
          )}
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden">
            <button
              onClick={toggleTestMode}
              className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              {isTestMode ? "Exit test mode" : "Enter test mode"}
            </button>
            <div className="border-t border-border" />
            <button
              onClick={() => signOut()}
              className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
