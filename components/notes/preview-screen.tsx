"use client";

import { useState } from "react";
import Link from "next/link";
import { CroppedImage } from "@/components/cropped-image";
import { NotesOpening, NotesShell } from "@/components/notes/shell";
import { useNotes } from "@/components/notes/use-notes";
import { Button } from "@/components/ui/button";
import { downloadJson, downloadNoteCard } from "@/lib/export-note";
import { assetPath } from "@/lib/utils";

export function PreviewScreen({ id }: { id: string }) {
  const { value, ready, reset } = useNotes();
  const [error, setError] = useState("");
  const item = value.references.find((reference) => reference.id === id);

  if (!ready) {
    return (
      <NotesShell onReset={reset}>
        <NotesOpening />
      </NotesShell>
    );
  }

  if (!item) {
    return (
      <NotesShell onReset={reset}>
        <section className="px-4 py-16 md:px-8">
          <h1 className="font-fraunces text-4xl">That note is not here.</h1>
          <Button className="mt-6" variant="vermilion" asChild>
            <Link href="/notes">Back to your pictures</Link>
          </Button>
        </section>
      </NotesShell>
    );
  }

  const imageIncluded = !item.imageSrc.startsWith("data:") || item.imageSrc.length < 500_000;

  return (
    <NotesShell onReset={reset}>
      <article className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] md:px-8">
        <div>
          <p className="font-outfit text-xs tracking-[0.18em] text-[#8e2a1c] uppercase">{value.projectName}</p>
          <h1 className="mt-2 font-fraunces text-4xl leading-tight">Preview</h1>
          <p className="mt-3 max-w-prose text-lg leading-relaxed">
            This stays on this computer. There is no public link. Download the note or the picture if you want a copy.
          </p>
          <div className="mt-6 bg-[#f7f1e8] p-3">
            <div className="relative">
              <img src={assetPath(item.imageSrc)} alt={item.alt} className="block h-auto w-full" />
              <div
                className="pointer-events-none absolute border-2 border-[#8e2a1c]"
                style={{
                  left: `${item.crop.x}%`,
                  top: `${item.crop.y}%`,
                  width: `${item.crop.w}%`,
                  height: `${item.crop.h}%`,
                }}
              />
            </div>
          </div>
          <p className="mt-2 text-sm text-[#5c463c]">The red box is the part you saved with the note.</p>
        </div>
        <div className="space-y-6 md:pt-16">
          <div>
            <p className="font-outfit text-xs tracking-[0.16em] uppercase">The part you saved</p>
            <CroppedImage src={item.imageSrc} alt="" crop={item.crop} className="mt-3 max-h-64" />
          </div>
          <blockquote className="border-l-2 border-[#8e2a1c] pl-4 font-fraunces text-2xl leading-snug">{item.note}</blockquote>
          <p className="text-sm leading-relaxed text-[#5c463c]">{item.source}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="vermilion"
              onClick={() => {
                downloadJson(`${slug(item.title)}-demo.json`, {
                  demo: true,
                  kind: "reference-note",
                  project: value.projectName,
                  title: item.title,
                  note: item.note,
                  source: item.source,
                  crop: item.crop,
                  image: imageIncluded ? item.imageSrc : undefined,
                  imageIncluded,
                  imageNote: imageIncluded
                    ? "This file was downloaded to this computer."
                    : "The uploaded picture was too large to include. The box and the note are still here.",
                });
              }}
            >
              Download the note
            </Button>
            <Button
              type="button"
              variant="line"
              onClick={async () => {
                try {
                  await downloadNoteCard({
                    filename: `${slug(item.title)}-card.png`,
                    title: item.title,
                    imageSrc: item.imageSrc,
                    crop: item.crop,
                    note: item.note,
                    source: item.source,
                    projectName: value.projectName,
                  });
                  setError("");
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "The card could not be drawn.");
                }
              }}
            >
              Download the picture
            </Button>
          </div>
          {error ? (
            <p role="alert" className="text-sm">
              {error}
            </p>
          ) : null}
          <Button variant="quiet" asChild>
            <Link href={`/notes/mark/${item.id}`}>Edit the note</Link>
          </Button>
        </div>
      </article>
    </NotesShell>
  );
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "reference-note";
}
