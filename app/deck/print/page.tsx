import type { Metadata } from "next";
import { PrintScreen } from "@/components/deck/print-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <PrintScreen />;
}