import * as React from "react";
import { cn } from "@/lib/cn";

export function Separator({
  orientation = "horizontal",
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-zinc-200 dark:bg-zinc-800",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...rest}
    />
  );
}
