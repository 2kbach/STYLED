"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  angle: string | null;
  timing: string | null;
  lighting: string | null;
}

const ANGLE_ORDER = ["front", "crown", "nape"];

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [fullscreen, setFullscreen] = useState<Photo | null>(null);

  if (photos.length === 0) return null;

  // Sort: angle photos first (front, crown, nape order), then extras
  const sorted = [...photos].sort((a, b) => {
    const aIdx = a.angle ? ANGLE_ORDER.indexOf(a.angle) : 999;
    const bIdx = b.angle ? ANGLE_ORDER.indexOf(b.angle) : 999;
    if (aIdx !== bIdx) return aIdx - bIdx;
    return 0;
  });

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted">Photos</h3>
        <div className="grid grid-cols-3 gap-2">
          {sorted.map((photo) => (
            <button
              key={photo.id}
              onClick={() => setFullscreen(photo)}
              className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border"
            >
              <img
                src={photo.url}
                alt={photo.angle || ""}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
                <div className="flex gap-1">
                  {photo.angle && (
                    <span className="text-white text-[10px] font-medium bg-black/40 px-1.5 py-0.5 rounded-full capitalize">
                      {photo.angle}
                    </span>
                  )}
                  {photo.timing && (
                    <span className="text-white text-[10px] font-medium bg-accent/70 px-1.5 py-0.5 rounded-full">
                      {photo.timing}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setFullscreen(null)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 z-10"
            onClick={() => setFullscreen(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={fullscreen.url}
            alt={fullscreen.angle || ""}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
            {fullscreen.angle && (
              <span className="text-white text-sm bg-black/60 px-3 py-1 rounded-full capitalize">
                {fullscreen.angle}
              </span>
            )}
            {fullscreen.timing && (
              <span className="text-white text-sm bg-accent/70 px-3 py-1 rounded-full">
                {fullscreen.timing}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
