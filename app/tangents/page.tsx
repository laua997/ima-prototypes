import type { Metadata } from "next";
import { SearchHome } from "@/components/tangents/search-home";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <SearchHome />;
}
