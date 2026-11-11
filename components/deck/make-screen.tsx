"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegionMark } from "@/components/region-mark";
import { DeckOpening, DeckShell } from "@/components/deck/shell";
import { useDeck } from "@/components/deck/use-deck";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Crop } from "@/lib/crop";
import { updateCard } from "@/lib/deck";
import { getPlate } from "@/lib/samples";

export function MakeScreen() {
  const { value, commit, ready, reset } = useDeck();
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [crop, setCrop] = useState<Crop | null>(null);
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const [syncedId, setSyncedId] = useState<string | null>(null);
  const card = ready ? value.cards[Math.min(index, Math.max(value.cards.length - 1, 0))] : undefined;

  if (card && card.id !== syncedId) {
    setSyncedId(card.id);
    setCrop(card.crop);
    setNote(card.note);
    setSource(card.source);
  }

  if (!ready) {
    return (
      <DeckShell onReset={reset}>
        <DeckOpening />
      </DeckShell>
    );
  }

  if (value.cards.length === 0) {
    return (
      <DeckShell onReset={reset}>
        <section className="px-4 py-16 md:px-8">
          <h1 className="font-baskerville text-4xl">No cards yet.</h1>
          <p className="mt-3 max-w-prose text-lg">Choose at least one sample picture. You can print without a long note. The card has lines so you can write by hand.</p>
          <Button className="mt-6" variant="cobalt" asChild>
            <Link href="/deck">Choose pictures</Link>
          </Button>
        </section>
      </DeckShell>
    );
  }

  if (!card || !crop) {
    return (
      <DeckShell onReset={reset}>
        <DeckOpening />
      </DeckShell>
    );
  }

  const plate = card.plateId ? getPlate(card.plateId) : undefined;

  function persist(nextIndex?: number) {
    if (!card || !crop) return;
    commit({
      cards: updateCard(value.cards, card.id, { crop, note, source }),
    });
    if (typeof nextIndex === "number") setIndex(nextIndex);
  }

  return (
    <DeckShell onReset={reset}>
      <form
        className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)] md:px-8"
        onSubmit={(event) => {
          event.preventDefault();
          persist();
          router.push("/deck/order");
        }}
      >
        <div>
          <p className="font-plex text-xs tracking-[0.18em] uppercase">
            Card {index + 1} of {value.cards.length}
          </p>
          <h1 className="mt-2 font-baskerville text-4xl">{card.title}</h1>
          <div className="mt-5">
            <RegionMark src={card.imageSrc} alt={card.alt} crop={crop} onChange={setCrop} accent="#1d4e89" />
          </div>
          {plate ? (
            <Button type="button" variant="line" className="mt-4" onClick={() => setCrop(plate.suggestedCrop)}>
              Use the suggested box
            </Button>
          ) : null}
        </div>
        <div className="space-y-5 md:pt-12">
          <div>
            <Label htmlFor="card-note" className="font-plex text-xs tracking-[0.16em] uppercase">
              Note for the card
            </Label>
            <Textarea id="card-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="What do you want to remember?" />
          </div>
          <div>
            <Label htmlFor="card-source" className="font-plex text-xs tracking-[0.16em] uppercase">
              Where it came from
            </Label>
            <Textarea id="card-source" value={source} onChange={(event) => setSource(event.target.value)} />
          </div>
          <p className="text-sm leading-relaxed">You can leave the note blank. The printed card has lines so you can write by hand.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="line" disabled={index === 0} onClick={() => persist(index - 1)}>
              Previous card
            </Button>
            <Button
              type="button"
              variant="line"
              disabled={index >= value.cards.length - 1}
              onClick={() => persist(index + 1)}
            >
              Next card
            </Button>
            <Button type="submit" variant="cobalt">
              Save and put in order
            </Button>
          </div>
        </div>
      </form>
    </DeckShell>
  );
}
