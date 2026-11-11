"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        "peer mt-0.5 size-4 shrink-0 rounded-[3px] border border-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 data-[state=checked]:bg-[#1c1915] data-[state=checked]:text-[#f6f1e6]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <Check className="size-3" strokeWidth={3} aria-hidden="true" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
