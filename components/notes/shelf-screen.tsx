"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { CroppedImage } from "@/components/cropped-image";
import { NotesOpening, NotesShell } from "@/components/notes/shell";
import { useNotes } from "@/components/notes/use-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clampCrop, type Crop } from "@/lib/crop";
import { removeReference, saveReference } from "@/lib/notes";
import { readImageFile } from "@/lib/read-image";
import { plates, sourceLine } from "@/lib/samples";
import { assetPath } from "@/lib/utils";

type Shot = {
  editingId: string | null;
  plateId: string | null;
  title: string;
  src: string;
  alt: string;
  source: string;
};

export function ShelfScreen() {
  const { value, commit, ready, reset } = useNotes();
  const [shot, setShot] = useState<Shot | null>(null);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [caption, setCaption] = useState("");
  const [dialog, setDialog] = useState(false);
  const [error, setError] = useState("");
  const captionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (dialog) captionRef.current?.focus();
  }, [dialog]);

  useEffect(() => {
    if (!dialog) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDialog(false);
        setError("");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  if (!ready) {
    return (
      <NotesShell onReset={reset}>
        <NotesOpening />
      </NotesShell>
    );
  }

  function openShot(next: Shot) {
    setShot(next);
    setCrop(null);
    setCaption("");
    setDialog(false);
    setError("");
  }

  function openDialog(nextCrop: Crop, nextCaption = caption) {
    setCrop(nextCrop);
    setCaption(nextCaption);
    setDialog(true);
    setError("");
  }

  function saveCaption() {
    if (!shot || !crop) return;
    const result = saveReference(
      value,
      {
        id: shot.editingId ?? undefined,
        plateId: shot.plateId,
        title: shot.title,
        imageSrc: shot.src,
        alt: shot.alt,
        crop,
        note: caption,
        source: shot.source,
      },
      Date.now(),
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    commit(result.state);
    setDialog(false);
    setShot(null);
    setCrop(null);
    setCaption("");
    setError("");
  }

  return (
    <NotesShell onReset={reset}>
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="max-w-2xl">
          <Label htmlFor="project-name" className="font-outfit text-xs tracking-[0.18em] uppercase">
            Project
          </Label>
          <Input
            id="project-name"
            value={value.projectName}
            maxLength={60}
            onChange={(event) => commit({ ...value, projectName: event.target.value })}
            className="mt-1 font-fraunces text-3xl italic"
          />
          <p className="mt-4 max-w-prose text-lg leading-relaxed">
            Take a screenshot of the part you like. A window opens so you can write what you liked about it.
          </p>
        </div>

        <div className="mt-6">
          <Label className="cursor-pointer font-outfit text-sm underline decoration-[#8e2a1c] underline-offset-4">
            Upload a picture
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                try {
                  const image = await readImageFile(file);
                  openShot({
                    editingId: null,
                    plateId: null,
                    title: image.alt,
                    src: image.src,
                    alt: image.alt,
                    source: "You uploaded this picture.",
                  });
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "That image could not be opened.");
                }
              }}
            />
          </Label>
          {error && !dialog ? (
            <p role="alert" className="mt-3 text-sm">
              {error}
            </p>
          ) : null}
        </div>

        {shot && !shot.editingId ? (
          <div className="mt-8 max-w-3xl">
            <p className="text-lg">{shot.title}</p>
            <p className="mt-1 text-sm text-[#5c463c]">Drag across the part you want.</p>
            <div className="mt-3">
              <ShotStage src={shot.src} alt={shot.alt} onPick={(next) => openDialog(next, "")} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" id="use-middle" variant="line" size="sm" onClick={() => openDialog(clampCrop({ x: 30, y: 30, w: 40, h: 40 }), "")}>
                Use the middle
              </Button>
              <Button type="button" variant="quiet" size="sm" onClick={() => setShot(null)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        <h2 className="mt-12 font-outfit text-xs tracking-[0.18em] uppercase">Sample pictures</h2>
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plates.map((plate) => (
            <li key={plate.id}>
              <article className="bg-[#f7f1e8] p-3">
                <img src={assetPath(plate.src)} alt="" className="aspect-[4/5] w-full object-cover" />
                <p className="mt-2 font-fraunces text-xl leading-tight">{plate.title}</p>
                <Button
                  type="button"
                  variant="vermilion"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    openShot({
                      editingId: null,
                      plateId: plate.id,
                      title: plate.title,
                      src: plate.src,
                      alt: plate.alt,
                      source: sourceLine(plate),
                    })
                  }
                >
                  Take a screenshot
                </Button>
              </article>
            </li>
          ))}
        </ul>

        <h2 className="mt-16 font-outfit text-xs tracking-[0.18em] uppercase">Saved screenshots</h2>
        {value.references.length === 0 ? (
          <p className="mt-4 max-w-prose text-lg">No screenshots yet. Drag across a picture to save one.</p>
        ) : (
          <ul className="mt-4 grid gap-8 md:grid-cols-2">
            {value.references.map((item) => (
              <li key={item.id} className="bg-[#f7f1e8] p-4">
                <CroppedImage src={item.imageSrc} alt="" crop={item.crop} className="max-h-72" />
                <p className="mt-4 font-fraunces text-2xl leading-snug">{item.note}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="line"
                    size="sm"
                    onClick={() => {
                      setShot({
                        editingId: item.id,
                        plateId: item.plateId,
                        title: item.title,
                        src: item.imageSrc,
                        alt: item.alt,
                        source: item.source,
                      });
                      openDialog(item.crop, item.note);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="quiet" size="sm" type="button" onClick={() => commit(removeReference(value, item.id))}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {dialog && shot && crop ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#1c1915]/50 p-4 sm:items-center" onMouseDown={() => { setDialog(false); setError(""); }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="caption-title"
            className="w-full max-w-lg bg-[#f7f1e8] p-4 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="caption-title" className="font-grotesk text-xl">
              What did you like about this?
            </h2>
            <CroppedImage src={shot.src} alt="" crop={crop} className="mt-3 max-h-64" />
            <label htmlFor="caption" className="sr-only">
              What did you like about this?
            </label>
            <textarea
              id="caption"
              ref={captionRef}
              value={caption}
              rows={4}
              onChange={(event) => setCaption(event.target.value)}
              className="mt-1 w-full border border-[#1c1915]/20 bg-white p-3 text-base"
            />
            {error ? (
              <p role="alert" className="mt-2 text-sm">
                {error}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="button" id="save-caption" variant="vermilion" onClick={saveCaption}>
                Save
              </Button>
              <Button type="button" variant="quiet" onClick={() => { setDialog(false); setError(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </NotesShell>
  );
}

function rectBetween(a: { x: number; y: number }, b: { x: number; y: number }): Crop {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

function ShotStage({ src, alt, onPick }: { src: string; alt: string; onPick: (crop: Crop) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [box, setBox] = useState<Crop | null>(null);

  function point(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    return {
      x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }

  return (
    <div
      id="shot-stage"
      ref={ref}
      className="relative touch-none overflow-hidden select-none bg-[#1c1915]"
      onPointerDown={(event) => {
        event.preventDefault();
        ref.current?.setPointerCapture(event.pointerId);
        const next = point(event);
        start.current = next;
        setBox({ x: next.x, y: next.y, w: 0, h: 0 });
      }}
      onPointerMove={(event) => {
        if (!start.current) return;
        setBox(rectBetween(start.current, point(event)));
      }}
      onPointerUp={(event) => {
        if (!start.current) return;
        const next = rectBetween(start.current, point(event));
        start.current = null;
        setBox(null);
        if (next.w >= 4 && next.h >= 4) onPick(clampCrop(next));
      }}
      onPointerCancel={() => {
        start.current = null;
        setBox(null);
      }}
    >
      <img src={assetPath(src)} alt={alt} draggable={false} className="pointer-events-none block h-auto w-full" />
      {box && box.w > 0.5 && box.h > 0.5 ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 bg-[#14100c]/60" style={{ height: `${box.y}%` }} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[#14100c]/60" style={{ height: `${Math.max(0, 100 - box.y - box.h)}%` }} />
          <div className="pointer-events-none absolute bg-[#14100c]/60" style={{ top: `${box.y}%`, height: `${box.h}%`, left: 0, width: `${box.x}%` }} />
          <div className="pointer-events-none absolute bg-[#14100c]/60" style={{ top: `${box.y}%`, height: `${box.h}%`, right: 0, width: `${Math.max(0, 100 - box.x - box.w)}%` }} />
          <div
            className="pointer-events-none absolute border-2 border-white"
            style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
          />
        </>
      ) : null}
    </div>
  );
}
