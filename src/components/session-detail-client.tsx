"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";
import { PhotoGallery } from "./photo-gallery";
import { PhotoCapture } from "./photo-capture";

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

export function SessionDetailClient({ session }: { session: SessionData }) {
  const [photos, setPhotos] = useState(session.photos);
  const [showCapture, setShowCapture] = useState(false);

  const refreshPhotos = useCallback(async () => {
    const res = await fetch(`/api/photos?sessionId=${session.id}`);
    if (res.ok) {
      const data = await res.json();
      setPhotos(data);
    }
  }, [session.id]);

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 py-3 border-b border-border bg-card">
        <Link
          href={`/dashboard/clients/${session.clientId}`}
          className="inline-flex items-center gap-1 text-accent text-sm mb-1"
        >
          <ArrowLeft className="w-4 h-4" /> {session.client.name}
        </Link>
        <h1 className="text-xl font-bold">
          {new Date(session.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </h1>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Photos section */}
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

        {/* Session notes (prep steps, etc.) */}
        {session.notes && (
          <div className="bg-card border border-border rounded-xl px-4 py-3">
            <p className="text-sm text-muted mb-1">Session Notes</p>
            <p className="whitespace-pre-line">{session.notes}</p>
          </div>
        )}

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
                    Processing: <span className="text-foreground font-medium">{formula.processingMin} min</span>
                  </p>
                )}
                {formula.notes && (
                  <p className="text-sm text-muted whitespace-pre-line">{formula.notes}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}
