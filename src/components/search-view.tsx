"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ChevronRight, X } from "lucide-react";

interface ClientResult {
  id: string;
  name: string;
  phone: string | null;
  sessions: { date: string }[];
}

interface SessionResult {
  id: string;
  date: string;
  notes: string | null;
  client: { id: string; name: string };
  formulas: {
    name: string;
    developer: string | null;
    components: { product: string; amount: number; unit: string }[];
  }[];
}

interface SearchResults {
  clients: ClientResult[];
  sessions: SessionResult[];
}

export function SearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        setResults(await res.json());
      }
      setLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasResults =
    results && (results.clients.length > 0 || results.sessions.length > 0);
  const noResults = results && !hasResults && query.trim();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients, products, formulas..."
          className="touch-target w-full bg-card border border-border rounded-xl pl-12 pr-10 py-3 text-base focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading && (
        <p className="text-sm text-muted text-center py-4">Searching...</p>
      )}

      {noResults && (
        <p className="text-sm text-muted text-center py-8">
          No results for &ldquo;{query}&rdquo;
        </p>
      )}

      {hasResults && (
        <div className="space-y-6">
          {/* Client matches */}
          {results.clients.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted mb-2">Clients</h3>
              <div className="space-y-2">
                {results.clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className="touch-target flex items-center justify-between bg-card rounded-xl border border-border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{client.name}</p>
                      {client.sessions[0] && (
                        <p className="text-sm text-muted">
                          Last visit:{" "}
                          {new Date(
                            client.sessions[0].date
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Session matches */}
          {results.sessions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted mb-2">Sessions</h3>
              <div className="space-y-2">
                {results.sessions.map((s) => (
                  <Link
                    key={s.id}
                    href={`/dashboard/sessions/${s.id}`}
                    className="touch-target block bg-card rounded-xl border border-border px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{s.client.name}</p>
                          <span className="text-sm text-muted">
                            {new Date(s.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        {s.formulas.length > 0 && (
                          <p className="text-sm text-muted mt-0.5">
                            {s.formulas
                              .map((f) => {
                                const products = f.components
                                  .map(
                                    (c) => `${c.product} ${c.amount}${c.unit}`
                                  )
                                  .join(", ");
                                return `${f.name}${f.developer ? ` (${f.developer})` : ""}: ${products}`;
                              })
                              .join(" | ")}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted shrink-0 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!query && (
        <div className="text-center py-12 text-muted">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>Search by client name, product, color code, or notes</p>
        </div>
      )}
    </div>
  );
}
