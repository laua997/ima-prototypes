"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ResetSample({ onReset }: { onReset: () => void }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button type="button" variant="quiet" size="sm" onClick={() => setOpen(true)}>
        Clear saved work
      </Button>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-2 text-sm">
      <span>Clear what you saved in this prototype?</span>
      <Button type="button" variant="line" size="sm" onClick={onReset}>
        Clear it
      </Button>
      <Button type="button" variant="quiet" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </span>
  );
}
