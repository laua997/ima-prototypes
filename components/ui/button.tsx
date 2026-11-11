import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  {
    variants: {
      variant: {
        ink: "bg-[#1c1915] text-[#f6f1e6] hover:bg-[#322c24] focus-visible:outline-[#e2b340]",
        quiet: "bg-transparent text-current hover:bg-black/5",
        white: "bg-white text-[#1c1915] shadow-sm hover:bg-[#fffaf2]",
        vermilion: "bg-[#8e2a1c] text-white hover:bg-[#742216] focus-visible:outline-[#8e2a1c]",
        cobalt: "bg-[#1d4e89] text-white hover:bg-[#163e6e] focus-visible:outline-[#1d4e89]",
        line: "border border-current bg-transparent hover:bg-black/5",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: { variant: "ink", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
