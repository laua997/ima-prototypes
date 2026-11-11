import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Three prototypes",
};

const prototypes = [
  {
    href: "/tangents",
    kicker: "01",
    title: "prototype",
    task: "Start, search the sample pages, open one, and save it with one click. You can also screenshot the part you like.",
    meta: "Search, open, save",
    className: "bg-[#f3efe6] text-[#1c1915]",
    rule: "bg-[#6e8b5a]",
  },
  {
    href: "/notes",
    kicker: "02",
    title: "prototype",
    task: "Take a screenshot of the part you like, then write what you liked about it. Saved screenshots stay in a list you can edit.",
    meta: "Screenshot, note, list",
    className: "bg-[#f7f1e8] text-[#1a120e]",
    rule: "bg-[#8e2a1c]",
  },
  {
    href: "/deck",
    kicker: "03",
    title: "prototype",
    task: "Choose a few pictures, draw a box, add a note and a source, put the cards in order, and print a sheet you can cut.",
    meta: "Choose, cards, print",
    className: "bg-[#e4ddd2] text-[#1b1a17]",
    rule: "bg-[#1d4e89]",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f3efe6] text-[#1c1915]">
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
        <p className="font-grotesk text-xs tracking-[0.18em] uppercase">NYU IMA · design research</p>
        <h1 className="mt-3 max-w-2xl font-grotesk text-4xl leading-tight font-medium tracking-tight md:text-5xl">
          Three ways to keep a picture nearby
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed">
          Three short tasks for a class session. Each one uses sample pictures and has its own reset. Nothing is uploaded.
        </p>
        <ol className="mt-12 space-y-5">
          {prototypes.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`block p-5 md:p-8 ${item.className}`}>
                <span className={`mb-6 block h-1 w-12 ${item.rule}`} aria-hidden="true" />
                <span className="font-grotesk text-xs tracking-[0.16em] uppercase">{item.kicker}</span>
                <span className="mt-2 block font-fraunces text-3xl lowercase">{item.title}</span>
                <span className="mt-4 block max-w-2xl text-base leading-relaxed">{item.task}</span>
                <span className="mt-4 block font-grotesk text-xs tracking-[0.14em] uppercase">{item.meta}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-[#3f3a34]">
          The pictures are public-domain or Creative Commons, with credit on each one. Clear saved work removes only that prototype’s saved work in this browser.
        </p>
      </div>
    </main>
  );
}
