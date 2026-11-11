import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full border-b border-current/30 bg-transparent px-0 text-base outline-none placeholder:text-current/40 focus-visible:border-current",
        className,
      )}
      {...props}
    />
  );
}
