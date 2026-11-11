"use client";

import { Studio } from "@/components/tangents/studio";

export function PlateScreen({ id }: { id: string }) {
  return <Studio plateId={id} />;
}
