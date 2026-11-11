import type { Metadata } from "next";
import { PlateScreen } from "@/components/tangents/plate-screen";
import { plates } from "@/lib/samples";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export function generateStaticParams() {
  return plates.map((plate) => ({ id: plate.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PlateScreen id={id} />;
}
