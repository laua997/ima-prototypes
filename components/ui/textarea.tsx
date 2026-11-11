import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y border-b border-current/30 bg-transparent px-0 py-2 text-base outline-none placeholder:text-current/40 focus-visible:border-current",
        className,
      )}
      {...props}
    />
  );
}
