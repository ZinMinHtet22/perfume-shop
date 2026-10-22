import * as React from "react";

import { cn } from "@/lib/utils";

function Checkbox({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type="checkbox"
      data-slot="checkbox"
      className={cn(
        "border-input aria-invalid:ring-destructive/20 aria-invalid:border-destructive size-4 shrink-0 rounded-xs shadow-xs outline-none transition-[color,box-shadow] disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "checked:border-primary checked:bg-primary checked:text-primary-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Checkbox };
