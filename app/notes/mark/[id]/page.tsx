import type { Metadata } from "next";
import { MarkScreen } from "@/components/notes/mark-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export function generateStaticParams() {
  return [{ id: "sample" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MarkScreen referenceId={id} />;
}
