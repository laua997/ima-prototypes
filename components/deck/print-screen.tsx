"use client";

import Link from "next/link";
import { CroppedImage } from "@/components/cropped-image";
import { DeckOpening, DeckShell, RegistrationMark } from "@/components/deck/shell";
import { useDeck } from "@/components/deck/use-deck";
import { Button } from "@/components/ui/button";

export function PrintScreen() {
  const { value, ready, reset } = useDeck();

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
          <h1 className="font-baskerville text-4xl">There is nothing to print.</h1>
          <Button className="mt-6" variant="cobalt" asChild>
            <Link href="/deck">Choose pictures</Link>
          </Button>
        </section>
      </DeckShell>
    );
  }

  const sheets: Array<typeof value.cards> = [];
  for (let index = 0; index < value.cards.length; index += 4) {
    sheets.push(value.cards.slice(index, index + 4));
  }

  return (
    <DeckShell onReset={reset}>
      <div className="no-print mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-6 md:px-8">
        <p className="max-w-xl text-sm leading-relaxed">
          This page is what will print. Click the button to open your computer’s print window. If the pictures do not print, turn on background graphics. Use letter-size paper.
        </p>
        <Button type="button" variant="cobalt" onClick={() => window.print()}>
          Print this page
        </Button>
      </div>
      <div className="print-root mx-auto max-w-[8.5in] pb-10">
        {sheets.map((sheet, sheetIndex) => (
          <section key={sheetIndex} className="print-sheet mx-auto bg-white shadow-lg" aria-label={`Print sheet ${sheetIndex + 1}`}>
            {sheet.map((card, index) => {
              const number = sheetIndex * 4 + index + 1;
              return (
                <article key={card.id} className="deck-card">
                  <header className="flex items-start justify-between text-[#1d4e89]">
                    <span className="font-baskerville text-2xl leading-none text-[#1b1a17]">{String(number).padStart(2, "0")}</span>
                    <RegistrationMark className="size-4" />
                  </header>
                  <CroppedImage src={card.imageSrc} alt={card.alt} crop={card.crop} className="mt-2 max-h-36" />
                  <h2 className="mt-2 font-baskerville text-lg leading-tight">{card.title}</h2>
                  {card.note ? <p className="mt-1 text-[12px] leading-snug">{card.note}</p> : null}
                  <p className="mt-1 text-[9px] leading-snug text-[#3c3832]">{card.source || "No source written."}</p>
                  <p className="mt-2 font-plex text-[8px]">prototype</p>
                  <div className="mt-1 space-y-2" aria-hidden="true">
                    <div className="border-b border-[#1b1a17]/40" />
                    <div className="border-b border-[#1b1a17]/40" />
                    <div className="border-b border-[#1b1a17]/40" />
                    <div className="border-b border-[#1b1a17]/40" />
                  </div>
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </DeckShell>
  );
}
