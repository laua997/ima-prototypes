"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTangents } from "@/components/tangents/use-tangents";
import { recordSearch } from "@/lib/tangents";

export function SearchBox({ initial = "", large = false }: { initial?: string; large?: boolean }) {
  const router = useRouter();
  const { value, commit } = useTangents();
  const [query, setQuery] = useState(initial);
  const [synced, setSynced] = useState(initial);
  if (synced !== initial) {
    setSynced(initial);
    setQuery(initial);
  }

  return (
    <form
      className={large ? "mx-auto w-full max-w-xl" : "w-full max-w-2xl"}
      onSubmit={(event) => {
        event.preventDefault();
        const text = query.trim();
        if (!text) return;
        if (value.startedAt) commit(recordSearch(value, text));
        router.push(`/tangents/search?q=${encodeURIComponent(text)}`);
      }}
    >
      <label htmlFor="search-box" className="sr-only">
        Search
      </label>
      <div className="flex items-center gap-2 rounded-full border border-[#1c1915]/15 bg-white px-4 py-2 shadow-[0_1px_4px_rgba(28,25,21,0.06)]">
        <input
          id="search-box"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try drapery folds, shell, or plaster"
          className={`min-w-0 flex-1 bg-transparent outline-none ${large ? "h-12 text-lg" : "h-10 text-base"}`}
        />
        <button id="search-go" type="submit" className="rounded-full bg-[#1c1915] px-4 py-2 text-sm text-[#f6f1e6]">
          Search
        </button>
      </div>
    </form>
  );
}
