import * as React from "react";
import { cn } from "@/lib/cn";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function Card({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-zinc-200 bg-white text-zinc-900 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
        className,
      )}
      {...rest}
    />
  );
});

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardHeader({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1.5 p-6 pb-2", className)}
      {...rest}
    />
  );
});

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(function CardTitle({ className, ...rest }, ref) {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...rest}
    />
  );
});

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...rest }, ref) {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
      {...rest}
    />
  );
});

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardContent({ className, ...rest }, ref) {
  return (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...rest} />
  );
});

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardFooter({ className, ...rest }, ref) {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...rest}
    />
  );
});
