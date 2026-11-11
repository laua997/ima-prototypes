import type { Metadata } from "next";
import { BeforeScreen } from "@/components/tangents/before-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <BeforeScreen />;
}
