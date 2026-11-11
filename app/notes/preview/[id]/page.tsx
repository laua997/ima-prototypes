import type { Metadata } from "next";
import { PreviewScreen } from "@/components/notes/preview-screen";

export const metadata: Metadata = { title: { absolute: "prototype" } };

export function generateStaticParams() {
  return [{ id: "sample" }];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PreviewScreen id={id} />;
}
