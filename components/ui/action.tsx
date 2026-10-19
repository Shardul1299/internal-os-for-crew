"use client";
// ActionForm — every write is a server action (§14). Errors render as one inline caption.
// Reversible actions show a single undo line for 10 seconds (⌘Z); there is no toast stack.
import { createContext, startTransition, useActionState, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/actions/result";
import { Button, cx } from "./primitives";

type UndoSlot = { message: string; undo?: () => Promise<unknown> } | null;
const UndoCtx = createContext<{ show: (s: UndoSlot) => void }>({ show: () => {} });

export function useUndo() {
  return useContext(UndoCtx);
}

export function UndoProvider({ children, undoAction }: { children: ReactNode; undoAction: (entity: string, id: string) => Promise<ActionResult> }) {
  const [slot, setSlot] = useState<UndoSlot>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const show = useCallback((s: UndoSlot) => {
    setSlot(s);
    if (timer.current) clearTimeout(timer.current);
    if (s) timer.current = setTimeout(() => setSlot(null), 10_000);
  }, []);
  const doUndo = useCallback(async () => {
    if (!slot?.undo) return;
    const u = slot.undo;
    setSlot({ message: "Undoing…" });
    await u();
    setSlot({ message: "Undone." });
    router.refresh();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSlot(null), 2500);
  }, [slot, router]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && slot?.undo) {
        e.preventDefault();
        void doUndo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slot, doUndo]);
  // Expose a generic undo that calls the audit-backed server action.
  const value = {
    show: (s: UndoSlot) => show(s),
  };
  return (
    <UndoCtx.Provider value={value}>
      <UndoBridge undoAction={undoAction} />
      {children}
      <div aria-live="polite" className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center no-print">
        {slot ? (
          <div className="pointer-events-auto mb-4 bg-head-bg text-head-fg h-9 px-4 flex items-center gap-4">
            <span>{slot.message}</span>
            {slot.undo ? (
              <button type="button" onClick={doUndo} className="font-semibold underline underline-offset-2">
                Undo <span className="opacity-60">⌘Z</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </UndoCtx.Provider>
  );
}

let undoActionRef: ((entity: string, id: string) => Promise<ActionResult>) | null = null;
function UndoBridge({ undoAction }: { undoAction: (entity: string, id: string) => Promise<ActionResult> }) {
  undoActionRef = undoAction;
  return null;
}

/** Shows the result of an action: an undo line on success, nothing else. */
export function useResultFeedback() {
  const { show } = useUndo();
  return useCallback(
    (r: ActionResult | null | undefined) => {
      if (!r || !r.ok) return;
      if (r.message) {
        const u = r.undo;
        show({ message: r.message, undo: u && undoActionRef ? () => undoActionRef!(u.entity, u.id) : undefined });
      }
    },
    [show],
  );
}

// Pending state for forms submitted through ActionForm's onSubmit (useFormStatus only sees native form actions).
const PendingCtx = createContext(false);

export function SubmitButton({ children, variant = "primary", size, className, pendingLabel }: { children: ReactNode; variant?: "primary" | "plain" | "quiet" | "danger"; size?: "sm" | "md"; className?: string; pendingLabel?: string }) {
  const status = useFormStatus();
  const ctxPending = useContext(PendingCtx);
  const pending = status.pending || ctxPending;
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending} className={className}>
      {pending ? (pendingLabel ?? "Saving…") : children}
    </Button>
  );
}

export function ActionForm({
  action,
  children,
  className,
  onDone,
  resetOnSuccess,
}: {
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
  onDone?: (r: ActionResult) => void;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const feedback = useResultFeedback();
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const last = useRef<ActionResult | null>(null);
  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok) {
      feedback(state);
      if (resetOnSuccess) ref.current?.reset();
      if (state.redirect) router.push(state.redirect);
      onDone?.(state);
    }
  }, [state, feedback, onDone, resetOnSuccess, router]);
  // Dispatch from onSubmit rather than the native form action: React resets every uncontrolled field
  // after a form action completes, which wiped the user's input when the server returned an error.
  // Successful submits still reset when `resetOnSuccess` is set (above).
  return (
    <PendingCtx.Provider value={isPending}>
      <form
        ref={ref}
        action={formAction}
        className={className}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
          startTransition(() => formAction(fd));
        }}
      >
        {children}
        {state && !state.ok ? (
          <p className="t-caption text-pink-fg mt-2" role="alert">
            {state.error}
          </p>
        ) : null}
      </form>
    </PendingCtx.Provider>
  );
}

/** A single-button action (e.g. "Approve"), bound with hidden fields. */
export function ActionButton({
  action,
  fields,
  children,
  variant = "plain",
  size = "sm",
  className,
}: {
  action: (prev: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  fields: Record<string, string | number | boolean | null | undefined>;
  children: ReactNode;
  variant?: "primary" | "plain" | "quiet" | "danger";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <ActionForm action={action} className={cx("inline-flex flex-col items-start", className)}>
      {Object.entries(fields).map(([k, v]) => (v == null ? null : <input key={k} type="hidden" name={k} value={String(v)} />))}
      <SubmitButton variant={variant} size={size} pendingLabel="…">
        {children}
      </SubmitButton>
    </ActionForm>
  );
}
