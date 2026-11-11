import type { Metadata } from "next";
import { MapScreen } from "@/components/tangents/map-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <MapScreen />;
}
