import type { Metadata } from "next";
import { ChooseScreen } from "@/components/deck/choose-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <ChooseScreen />;
}
