"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegionMark } from "@/components/region-mark";
import { NotesOpening, NotesShell } from "@/components/notes/shell";
import { useNotes } from "@/components/notes/use-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Crop } from "@/lib/crop";
import { saveReference, type NotesState } from "@/lib/notes";

export function MarkScreen({ referenceId }: { referenceId?: string }) {
  const { value, commit, ready, reset } = useNotes();

  if (!ready) {
    return (
      <NotesShell onReset={reset}>
        <NotesOpening />
      </NotesShell>
    );
  }

  const existing = referenceId ? value.references.find((item) => item.id === referenceId) : undefined;
  const draft = referenceId ? null : value.draft;
  const imageSrc = existing?.imageSrc ?? draft?.imageSrc;

  if (!imageSrc || (referenceId && !existing)) {
    return (
      <NotesShell onReset={reset}>
        <section className="px-4 py-16 md:px-8">
          <h1 className="font-fraunces text-4xl">No picture selected.</h1>
          <p className="mt-3 max-w-prose text-lg">Choose a sample picture first. Uploads and saves stay in this browser.</p>
          <Button className="mt-6" variant="vermilion" asChild>
            <Link href="/notes">Back to the pictures</Link>
          </Button>
        </section>
      </NotesShell>
    );
  }

  return (
    <MarkForm
      key={existing?.id ?? "draft"}
      value={value}
      commit={commit}
      reset={reset}
      referenceId={existing?.id}
      plateId={existing?.plateId ?? draft?.plateId ?? null}
      imageSrc={imageSrc}
      alt={existing?.alt ?? draft?.alt ?? "Reference image"}
      initialTitle={existing?.title ?? draft?.title ?? ""}
      initialNote={existing?.note ?? ""}
      initialSource={existing?.source ?? draft?.source ?? ""}
      initialCrop={existing?.crop ?? null}
      suggested={existing ? undefined : draft?.suggestedCrop}
    />
  );
}

function MarkForm({
  value,
  commit,
  reset,
  referenceId,
  plateId,
  imageSrc,
  alt,
  initialTitle,
  initialNote,
  initialSource,
  initialCrop,
  suggested,
}: {
  value: NotesState;
  commit: (next: NotesState) => void;
  reset: () => void;
  referenceId?: string;
  plateId: string | null;
  imageSrc: string;
  alt: string;
  initialTitle: string;
  initialNote: string;
  initialSource: string;
  initialCrop: Crop | null;
  suggested?: Crop;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [note, setNote] = useState(initialNote);
  const [source, setSource] = useState(initialSource);
  const [crop, setCrop] = useState<Crop | null>(initialCrop);
  const [error, setError] = useState("");

  return (
    <NotesShell onReset={reset}>
      <form
        className="mx-auto grid max-w-6xl gap-10 px-4 py-8 md:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.7fr)] md:px-8"
        onSubmit={(event) => {
          event.preventDefault();
          const result = saveReference(value, {
            id: referenceId,
            plateId,
            title,
            imageSrc,
            alt,
            crop,
            note,
            source,
          });
          if (!result.ok) {
            setError(result.error);
            return;
          }
          commit(result.state);
          router.push(`/notes/preview/${result.id}`);
        }}
      >
        <div>
          <p className="font-outfit text-xs tracking-[0.18em] uppercase">Draw a box</p>
          <h1 className="mt-2 font-fraunces text-4xl leading-tight">{title || "Untitled reference"}</h1>
          <div className="mt-6">
            <RegionMark src={imageSrc} alt={alt} crop={crop} onChange={setCrop} />
          </div>
          {suggested ? (
            <Button type="button" variant="line" className="mt-4" onClick={() => setCrop(suggested)}>
              Use the suggested box
            </Button>
          ) : null}
        </div>
        <div className="space-y-5 md:pt-16">
          <div>
            <Label htmlFor="ref-title" className="font-outfit text-xs tracking-[0.16em] uppercase">
              Title
            </Label>
            <Input id="ref-title" value={title} onChange={(event) => setTitle(event.target.value)} className="font-fraunces text-2xl" />
          </div>
          <div>
            <Label htmlFor="ref-note" className="font-outfit text-xs tracking-[0.16em] uppercase">
              What you noticed
            </Label>
            <Textarea
              id="ref-note"
              required
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="The part this box is for."
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "note-error" : undefined}
            />
          </div>
          <div>
            <Label htmlFor="ref-source" className="font-outfit text-xs tracking-[0.16em] uppercase">
              Where it came from
            </Label>
            <Textarea
              id="ref-source"
              required
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="Who made it, and where you found it."
            />
          </div>
          {error ? (
            <p id="note-error" role="alert" className="text-sm">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="vermilion" disabled={!crop || !note.trim() || !source.trim()}>
            Save the picture and note
          </Button>
          <p className="text-sm leading-relaxed text-[#5c463c]">
            The box, the note, and the source are saved together. The next page shows them still attached.
          </p>
        </div>
      </form>
    </NotesShell>
  );
}
