"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, Pencil, Copy } from "lucide-react";
import { PhotoGallery } from "./photo-gallery";
import { PhotoCapture } from "./photo-capture";
import { EditSessionForm } from "./edit-session-form";

interface SessionData {
  id: string;
  date: string;
  notes: string | null;
  clientId: string;
  client: { name: string };
  formulas: {
    id: string;
    name: string;
    developer: string | null;
    ratio: string | null;
    processingMin: number | null;
    notes: string | null;
    components: {
      id: string;
      product: string;
      amount: number;
      unit: string;
    }[];
  }[];
  photos: {
    id: string;
    url: string;
    angle: string | null;
    timing: string | null;
    lighting: string | null;
  }[];
}

export function SessionDetailClient({
  session,
  startEditing = false,
  startPhotos = false,
  isTestMode = false,
}: {
  session: SessionData;
  startEditing?: boolean;
  startPhotos?: boolean;
  isTestMode?: boolean;
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState(session.photos);
  const [showCapture, setShowCapture] = useState(startPhotos);
  const [editing, setEditing] = useState(startEditing);
  const [duplicating, setDuplicating] = useState(false);

  async function handleDuplicate() {
    setDuplicating(true);
    const res = await fetch(`/api/sessions/${session.id}/duplicate`, {
      method: "POST",
    });
    if (res.ok) {
      const { id } = await res.json();
      router.push(`/dashboard/sessions/${id}?edit=1`);
    } else {
      setDuplicating(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this session? This cannot be undone.")) return;

    const res = await fetch(`/api/sessions/${session.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push(`/dashboard/clients/${session.clientId}`);
      router.refresh();
    }
  }

  const refreshPhotos = useCallback(async () => {
    const res = await fetch(`/api/photos?sessionId=${session.id}`);
    if (res.ok) {
      const data = await res.json();
      setPhotos(data);
    }
  }, [session.id]);

  function handleSaved() {
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <Link
            href={`/dashboard/clients/${session.clientId}`}
            className="inline-flex items-center gap-1 text-accent text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {session.client.name}
          </Link>
          {!editing && !isTestMode && (
            <div className="flex gap-3">
              <button
                onClick={handleDuplicate}
                disabled={duplicating}
                className="inline-flex items-center gap-1 text-accent text-sm font-medium disabled:opacity-50"
              >
                <Copy className="w-4 h-4" /> {duplicating ? "..." : "Repeat"}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 text-accent text-sm font-medium"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold mt-1">
          {new Date(session.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h1>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {editing ? (
          <EditSessionForm
            session={session}
            onSave={handleSaved}
            onCancel={() => setEditing(false)}
            onDelete={handleDelete}
          />
        ) : (
          <>
            {/* Payment summary */}
            {(() => {
              const orderMatch = session.notes?.match(/Order #(\d+) — Total: \$([0-9,.]+)(?:.*?Grat: \$([0-9,.]+))?/);
              if (!orderMatch) return null;
              const total = parseFloat(orderMatch[2].replace(/,/g, ""));
              const grat = orderMatch[3] ? parseFloat(orderMatch[3].replace(/,/g, "")) : null;
              return (
                <div className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">Order #{orderMatch[1]}</p>
                    <p className="text-xl font-bold">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                  {grat && (
                    <div className="text-right">
                      <p className="text-sm text-muted">Gratuity</p>
                      <p className="text-xl font-bold text-accent">+${grat.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Session notes */}
            {(() => {
              const cleanNotes = session.notes
                ?.split("\n")
                .filter(l => !l.startsWith("Order #") && !l.startsWith("Imported from Boulevard"))
                .join("\n")
                .trim();
              return cleanNotes ? (
                <div className="bg-card border border-border rounded-xl px-4 py-3">
                  <p className="text-sm text-muted mb-1">Session Notes</p>
                  <p className="whitespace-pre-line">{cleanNotes}</p>
                </div>
              ) : null;
            })()}

            {/* Formulas */}
            {session.formulas.map((formula) => (
              <div
                key={formula.id}
                className="bg-card border border-border rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{formula.name}</h3>
                  <div className="flex gap-2 text-sm">
                    {formula.developer && (
                      <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                        {formula.developer}
                      </span>
                    )}
                    {formula.ratio && (
                      <span className="bg-muted/20 text-muted px-2 py-0.5 rounded-full">
                        {formula.ratio}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {formula.components.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between pl-3 border-l-2 border-accent-light py-1"
                    >
                      <p className="font-medium">{comp.product}</p>
                      <span className="font-mono text-lg font-semibold">
                        {comp.amount} {comp.unit}
                      </span>
                    </div>
                  ))}
                </div>

                {(formula.processingMin || formula.notes) && (
                  <div className="pt-2 border-t border-border space-y-1">
                    {formula.processingMin && (
                      <p className="text-sm text-muted">
                        Processing:{" "}
                        <span className="text-foreground font-medium">
                          {formula.processingMin} min
                        </span>
                      </p>
                    )}
                    {formula.notes && (
                      <p className="text-sm text-muted whitespace-pre-line">
                        {formula.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Photos — at the bottom */}
            {photos.length > 0 && <PhotoGallery photos={photos} />}

            {showCapture ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted">Add Photos</h3>
                  <button
                    onClick={() => setShowCapture(false)}
                    className="text-sm text-accent"
                  >
                    Done
                  </button>
                </div>
                <PhotoCapture
                  sessionId={session.id}
                  existingPhotos={photos}
                  onPhotoAdded={refreshPhotos}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowCapture(true)}
                className="touch-target w-full flex items-center justify-center gap-2 bg-accent/10 text-accent font-medium rounded-xl py-3 hover:bg-accent/20 transition-colors"
              >
                <Camera className="w-5 h-5" />
                {photos.length > 0 ? "Add more photos" : "Add photos"}
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
