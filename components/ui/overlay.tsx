"use client";
// Sheet, Popover. Sheets carry a one-sentence consequence for irreversible actions;
// reversible actions never confirm (⌘Z within 10 s instead).
import * as Dialog from "@radix-ui/react-dialog";
import * as RPopover from "@radix-ui/react-popover";
import type { ReactNode } from "react";
import { cx } from "./primitives";

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  side = "right",
  trigger,
  width = 520,
}: {
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
  title: string;
  children: ReactNode;
  side?: "right" | "center";
  trigger?: ReactNode;
  width?: number;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          style={{ maxWidth: width }}
          className={cx(
            "fixed z-50 bg-raised text-fg border-l border-rule flex flex-col outline-none",
            side === "right" ? "right-0 top-0 h-full w-full" : "left-1/2 top-[12vh] -translate-x-1/2 w-[calc(100%-32px)] max-h-[76vh] border",
          )}
        >
          <div className="flex items-center justify-between px-5 h-14 border-b border-rule shrink-0">
            <Dialog.Title className="t-title">{title}</Dialog.Title>
            <Dialog.Close className="w-8 h-8 inline-flex items-center justify-center text-fg-2 hover:text-fg hover:bg-block" aria-label="Close">
              <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
          <div className="overflow-y-auto flex-1">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Popover({ trigger, children, align = "start" }: { trigger: ReactNode; children: ReactNode; align?: "start" | "end" | "center" }) {
  return (
    <RPopover.Root>
      <RPopover.Trigger asChild>{trigger}</RPopover.Trigger>
      <RPopover.Portal>
        <RPopover.Content align={align} sideOffset={6} className="z-50 bg-raised border border-rule p-3 max-w-[360px] outline-none">
          {children}
        </RPopover.Content>
      </RPopover.Portal>
    </RPopover.Root>
  );
}
