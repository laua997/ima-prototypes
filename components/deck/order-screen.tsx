"use client";

import { useState } from "react";
import Link from "next/link";
import { CroppedImage } from "@/components/cropped-image";
import { DeckOpening, DeckShell } from "@/components/deck/shell";
import { useDeck } from "@/components/deck/use-deck";
import { Button } from "@/components/ui/button";
import { moveCard } from "@/lib/deck";

export function OrderScreen() {
  const { value, commit, ready, reset } = useDeck();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

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
          <h1 className="font-baskerville text-4xl">No cards to reorder.</h1>
          <Button className="mt-6" variant="cobalt" asChild>
            <Link href="/deck">Choose pictures</Link>
          </Button>
        </section>
      </DeckShell>
    );
  }

  return (
    <DeckShell onReset={reset}>
      <section className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <h1 className="font-baskerville text-4xl">Change the order</h1>
        <p className="mt-3 max-w-prose text-lg leading-relaxed">
          Move a card up or down. The numbers follow this order when you print.
        </p>
        <ol className="mt-8 space-y-3">
          {value.cards.map((card, index) => (
            <li
              key={card.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex === null || dragIndex === index) return;
                const direction = dragIndex < index ? 1 : -1;
                let cards = value.cards;
                let cursor = dragIndex;
                while (cursor !== index) {
                  cards = moveCard(cards, cursor, direction);
                  cursor += direction;
                }
                commit({ cards });
                setDragIndex(null);
              }}
              className="flex items-center gap-4 bg-[#f7f4ee] p-3"
            >
              <span className="w-10 font-baskerville text-2xl text-[#1d4e89]">{String(index + 1).padStart(2, "0")}</span>
              <CroppedImage src={card.imageSrc} alt="" crop={card.crop} className="h-16 w-20" />
              <span className="min-w-0 flex-1">
                <span className="block font-baskerville text-lg">{card.title}</span>
                <span className="block truncate text-sm text-[#3c3832]">{card.note || "No note yet. The printed card has lines to write on."}</span>
              </span>
              <span className="flex flex-col gap-1">
                <Button type="button" variant="line" size="sm" disabled={index === 0} onClick={() => commit({ cards: moveCard(value.cards, index, -1) })}>
                  Move up
                </Button>
                <Button
                  type="button"
                  variant="line"
                  size="sm"
                  disabled={index === value.cards.length - 1}
                  onClick={() => commit({ cards: moveCard(value.cards, index, 1) })}
                >
                  Move down
                </Button>
              </span>
            </li>
          ))}
        </ol>
        <Button className="mt-8" variant="cobalt" asChild>
          <Link href="/deck/print">See the print page</Link>
        </Button>
      </section>
    </DeckShell>
  );
}
