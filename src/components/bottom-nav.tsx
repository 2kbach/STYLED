"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, PlusCircle, Search } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Clients", icon: Users },
  { href: "/dashboard/new-session", label: "New Session", icon: PlusCircle },
  { href: "/dashboard/search", label: "Search", icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`touch-target flex flex-col items-center justify-center gap-1 py-2 px-4 text-xs font-medium transition-colors ${
                isActive ? "text-accent" : "text-muted"
              }`}
            >
              <Icon className="w-6 h-6" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
