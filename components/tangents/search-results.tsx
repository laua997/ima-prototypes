"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TangentsFrame } from "@/components/tangents/frame";
import { SearchBox } from "@/components/tangents/search-box";
import { SidePanel } from "@/components/tangents/side-panel";
import { useTangents } from "@/components/tangents/use-tangents";
import { searchPages } from "@/lib/search";
import { assetPath } from "@/lib/utils";
import { recordSearch } from "@/lib/tangents";

export function SearchResults() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const { value, commit, reset, ready } = useTangents();
  const [tab, setTab] = useState<"all" | "images">("all");
  const hits = searchPages(query);

  useEffect(() => {
    if (!ready || !value.startedAt || !query.trim()) return;
    const next = recordSearch(value, query);
    if (next !== value) commit(next);
  }, [commit, query, ready, value]);

  return (
    <TangentsFrame state={value.startedAt ? value : undefined} onReset={reset}>
      <div className="flex min-h-[calc(100vh-7rem)] flex-col bg-[#fbfaf7] md:flex-row">
        <section className="min-w-0 flex-1 px-4 py-6 md:px-8" aria-label="Search results">
          <SearchBox initial={query} />
          <div className="mt-4 flex gap-2 border-b border-[#1c1915]/10" role="tablist" aria-label="Result type">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "all"}
              className={`px-3 py-2 text-sm ${tab === "all" ? "border-b-2 border-[#1c1915] font-medium" : "text-[#3f3a34]"}`}
              onClick={() => setTab("all")}
            >
              All
            </button>
            <button
              type="button"
              id="images-tab"
              role="tab"
              aria-selected={tab === "images"}
              className={`px-3 py-2 text-sm ${tab === "images" ? "border-b-2 border-[#1c1915] font-medium" : "text-[#3f3a34]"}`}
              onClick={() => setTab("images")}
            >
              Images
            </button>
          </div>
          <p className="mt-4 text-sm text-[#3f3a34]">{hits.length} sample pages</p>
          {tab === "all" ? (
            <ol className="mt-4 max-w-2xl space-y-6">
              {hits.map((hit) => (
                <li key={hit.plateId}>
                  <p className="text-xs text-[#5c564c]">{hit.displayUrl}</p>
                  <Link href={`/tangents/plate/${hit.plateId}`} className="mt-0.5 block text-xl text-[#1c1915] underline-offset-2 hover:underline">
                    {hit.title}
                  </Link>
                  <p className="mt-1 text-sm leading-relaxed text-[#3f3a34]">{hit.snippet}</p>
                </li>
              ))}
            </ol>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {hits.map((hit) => (
                <li key={hit.plateId}>
                  <Link href={`/tangents/plate/${hit.plateId}`} className="block bg-white p-2">
                    <img src={assetPath(hit.src)} alt="" className="aspect-[4/3] w-full object-cover" />
                    <span className="mt-2 block text-sm">{hit.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <SidePanel />
      </div>
    </TangentsFrame>
  );
}
