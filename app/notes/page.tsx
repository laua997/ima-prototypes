import type { Metadata } from "next";
import { ShelfScreen } from "@/components/notes/shelf-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <ShelfScreen />;
}
