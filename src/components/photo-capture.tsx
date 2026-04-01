"use client";

import { useState, useRef } from "react";
import { Camera, Plus, X, Loader2 } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  angle: string | null;
  timing: string | null;
}

interface PhotoCaptureProps {
  sessionId: string;
  existingPhotos: Photo[];
  onPhotoAdded: () => void;
  isTestMode?: boolean;
}

const ANGLES = [
  { id: "front", label: "Front" },
  { id: "crown", label: "Crown" },
  { id: "nape", label: "Nape" },
];

const TIMINGS = ["Before", "During", "After"];

export function PhotoCapture({
  sessionId,
  existingPhotos,
  onPhotoAdded,
  isTestMode = false,
}: PhotoCaptureProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [timing, setTiming] = useState("Before");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAngle, setPendingAngle] = useState<string | null>(null);

  function getPhotoForAngle(angle: string) {
    return existingPhotos.find((p) => p.angle === angle);
  }

  async function uploadPhoto(file: File, angle: string | null) {
    const key = angle || "extra";
    setUploading(key);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionId", sessionId);
    if (angle) formData.append("angle", angle);
    formData.append("timing", timing);

    try {
      const res = await fetch(isTestMode ? "/api/photos?test=1" : "/api/photos", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        onPhotoAdded();
      }
    } finally {
      setUploading(null);
      setPendingAngle(null);
    }
  }

  function handleAngleClick(angle: string) {
    setPendingAngle(angle);
    fileInputRef.current?.click();
  }

  function handleExtraClick() {
    setPendingAngle(null);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadPhoto(file, pendingAngle);
    e.target.value = "";
  }

  async function handleDelete(photoId: string) {
    await fetch("/api/photos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId }),
    });
    onPhotoAdded();
  }

  const extraPhotos = existingPhotos.filter(
    (p) => !ANGLES.some((a) => a.id === p.angle)
  );

  return (
    <div className="space-y-4">
      {/* Timing selector */}
      <div className="flex gap-2">
        {TIMINGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTiming(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              timing === t
                ? "bg-accent text-white"
                : "bg-card border border-border text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 3-angle capture row */}
      <div className="grid grid-cols-3 gap-3">
        {ANGLES.map((angle) => {
          const photo = getPhotoForAngle(angle.id);
          const isUploading = uploading === angle.id;

          return (
            <div key={angle.id} className="relative">
              {photo ? (
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border">
                  <img
                    src={photo.url}
                    alt={angle.label}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {angle.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAngleClick(angle.id)}
                  disabled={isUploading}
                  className="touch-target w-full aspect-[3/4] flex flex-col items-center justify-center gap-2 bg-card border-2 border-dashed border-border rounded-xl hover:border-accent transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted" />
                  )}
                  <span className="text-xs font-medium text-muted">
                    {angle.label}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Extra photos grid */}
      {extraPhotos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {extraPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-[3/4] rounded-xl overflow-hidden border border-border"
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
              />
              {photo.timing && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {photo.timing}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(photo.id)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add more button */}
      <button
        type="button"
        onClick={handleExtraClick}
        disabled={uploading !== null}
        className="touch-target w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-muted font-medium hover:border-accent hover:text-accent transition-colors"
      >
        {uploading && !ANGLES.some((a) => a.id === uploading) ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        Add more photos
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
