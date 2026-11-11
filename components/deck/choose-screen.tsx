"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlateImage } from "@/components/plate-image";
import { DeckShell } from "@/components/deck/shell";
import { useDeck } from "@/components/deck/use-deck";
import { Button } from "@/components/ui/button";
import { buildDeck, type DeckCard } from "@/lib/deck";
import { createId } from "@/lib/utils";
import { readImageFile } from "@/lib/read-image";
import { plates } from "@/lib/samples";

export function ChooseScreen() {
  const { value, commit, reset } = useDeck();
  const router = useRouter();
  const signature = value.cards.map((card) => card.plateId ?? "").join("|");
  const [seed, setSeed] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);
  const [error, setError] = useState("");

  if (signature !== seed) {
    setSeed(signature);
    setOrder(value.cards.filter((card) => card.plateId).map((card) => card.plateId as string));
  }

  const uploads = value.cards.filter((card) => !card.plateId);

  function toggle(id: string) {
    setOrder((current) => {
      const list = current ?? [];
      return list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
    });
  }

  return (
    <DeckShell onReset={reset}>
      <section className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h1 className="max-w-xl font-baskerville text-4xl leading-tight">Choose pictures to print</h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed">
          Pick a few sample pictures, or upload one of your own. Draw a box, add a note and where it came from, put the cards in order, and print a sheet you can cut.
        </p>
        <div className="mt-6">
          <label className="inline-flex cursor-pointer items-center gap-2 font-plex text-sm text-[#1d4e89] underline underline-offset-4">
            Upload an image
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
                  const card: DeckCard = {
                    id: createId("card"),
                    plateId: null,
                    title: image.alt,
                    imageSrc: image.src,
                    alt: image.alt,
                    crop: { x: 20, y: 20, w: 60, h: 60 },
                    note: "",
                    source: "You uploaded this picture. Write where it came from before you print.",
                  };
                  commit({ cards: [...value.cards, card] });
                  setError("");
                } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "That image could not be opened.");
                }
              }}
            />
          </label>
          {error ? (
            <p role="alert" className="mt-2 text-sm">
              {error}
            </p>
          ) : null}
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plates.map((plate) => {
            const selected = order.includes(plate.id);
            return (
              <li key={plate.id}>
                <label className={`block cursor-pointer bg-[#f7f4ee] p-2 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#1d4e89] ${selected ? "outline outline-2 outline-[#1d4e89]" : ""}`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected}
                    onChange={() => toggle(plate.id)}
                  />
                  <PlateImage src={plate.src} alt={plate.alt} className="aspect-[4/3] w-full object-cover" />
                  <span className="mt-2 flex items-center justify-between gap-2 font-plex text-sm">
                    <span>{plate.title}</span>
                    <span className="text-[#1d4e89]">{selected ? "Selected" : "Add"}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        {uploads.length > 0 ? (
          <ul className="mt-6 space-y-2 font-plex text-sm">
            {uploads.map((card) => (
              <li key={card.id} className="flex items-center justify-between gap-3 bg-[#f7f4ee] px-3 py-2">
                <span>{card.title}</span>
                <button
                  type="button"
                  className="underline"
                  onClick={() => commit({ cards: value.cards.filter((item) => item.id !== card.id) })}
                >
                  Remove upload
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button
            variant="cobalt"
            type="button"
            disabled={order.length + uploads.length === 0}
              onClick={() => {
              commit({ cards: buildDeck(value.cards, order, uploads) });
              router.push("/deck/make");
            }}
          >
            Make the cards
          </Button>
          <p className="text-sm">{order.length + uploads.length} selected</p>
        </div>
      </section>
    </DeckShell>
  );
}
