import type { Metadata } from "next";
import { MarkScreen } from "@/components/notes/mark-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <MarkScreen />;
}
