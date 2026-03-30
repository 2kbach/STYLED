"use client";

import Link from "next/link";
import { PlusCircle, ChevronRight } from "lucide-react";

interface ClientWithSessions {
  id: string;
  name: string;
  phone: string | null;
  sessions: { date: Date }[];
}

export function ClientList({ clients }: { clients: ClientWithSessions[] }) {
  if (clients.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
        <p className="text-muted text-lg mb-4">No clients yet</p>
        <Link
          href="/dashboard/clients/new"
          className="touch-target inline-flex items-center gap-2 bg-accent text-white font-semibold rounded-xl px-6 py-4 text-lg hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="w-5 h-5" />
          Add your first client
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Clients</h2>
        <Link
          href="/dashboard/clients/new"
          className="touch-target inline-flex items-center gap-1 text-accent font-medium text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Add
        </Link>
      </div>
      {clients.map((client) => (
        <Link
          key={client.id}
          href={`/dashboard/clients/${client.id}`}
          className="touch-target flex items-center justify-between bg-card rounded-xl border border-border px-4 py-4"
        >
          <div>
            <p className="font-medium text-base">{client.name}</p>
            {client.sessions[0] && (
              <p className="text-sm text-muted">
                Last visit:{" "}
                {new Date(client.sessions[0].date).toLocaleDateString()}
              </p>
            )}
          </div>
          <ChevronRight className="w-5 h-5 text-muted" />
        </Link>
      ))}
    </div>
  );
}
