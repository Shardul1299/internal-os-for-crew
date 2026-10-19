"use client";
import { Button } from "@/components/ui";

export function PrintButton({ label = "Print", variant = "primary" }: { label?: string; variant?: "primary" | "plain" }) {
  return (
    <Button type="button" variant={variant} onClick={() => window.print()} data-new="">
      {label}
    </Button>
  );
}
