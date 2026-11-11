import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResults } from "@/components/tangents/search-results";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return (
    <Suspense fallback={<p className="px-6 py-16 text-sm">Opening…</p>}>
      <SearchResults />
    </Suspense>
  );
}
