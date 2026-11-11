import type { Metadata } from "next";
import { FieldScreen } from "@/components/tangents/field-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export default function Page() {
  return <FieldScreen />;
}
