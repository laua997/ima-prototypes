import type { Metadata } from "next";
import { MakeScreen } from "@/components/deck/make-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <MakeScreen />;
}
