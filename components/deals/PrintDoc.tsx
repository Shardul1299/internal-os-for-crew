// Print styling for brand-facing documents (quote, SOW): white paper, black ink, the shell hidden.
import type { ReactNode } from "react";

const PRINT_CSS = `@media print {
  :root, :root[data-theme="light"] { --bg:#fff; --raised:#fff; --block:#f2f2f2; --fg:#000; --fg-2:#222; --fg-3:#555; --rule:#ccc; --head-bg:#000; --head-fg:#fff; --pink-fg:#000; }
  @page { margin: 18mm; }
  .print-break { break-before: page; }
  .print-doc { max-width: none !important; padding: 0 !important; }
}`;

export function PrintDoc({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{PRINT_CSS}</style>
      <article className="print-doc max-w-[820px] px-5 py-8">{children}</article>
    </>
  );
}
