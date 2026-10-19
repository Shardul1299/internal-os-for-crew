"use client";
// ActionForm — every write is a server action (§14). Errors render as one inline caption.
// Reversible actions show a single undo line for 10 seconds (⌘Z); there is no toast stack.
import { createContext, useActionState, useCallback, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
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

// ActionForm submits through a transition (so React doesn't wipe the inputs on an error), which
// useFormStatus can't see — the pending state is passed down through this context instead.
const PendingCtx = createContext<boolean | null>(null);

export function SubmitButton({ children, variant = "primary", size, className, pendingLabel }: { children: ReactNode; variant?: "primary" | "plain" | "quiet" | "danger"; size?: "sm" | "md"; className?: string; pendingLabel?: string }) {
  const { pending: formPending } = useFormStatus();
  const ctxPending = useContext(PendingCtx);
  const pending = ctxPending ?? formPending;
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
  const feedback = useResultFeedback();
  const router = useRouter();
  // Feedback and redirects run as soon as the action returns, so they still happen when the
  // revalidated page no longer renders this form (e.g. an "Activate" button that disappears).
  const run = useCallback(
    async (prev: ActionResult | null, fd: FormData) => {
      const r = await action(prev, fd);
      if (r.ok) {
        feedback(r);
        if (r.redirect) router.push(r.redirect);
      }
      return r;
    },
    [action, feedback, router],
  );
  const [state, formAction, isPending] = useActionState(run, null);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  const last = useRef<ActionResult | null>(null);
  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.ok) {
      // React used to reset every action form after it ran; keep that on success only, so a failed
      // submit keeps what the person typed. resetOnSuccess is kept for API compatibility.
      void resetOnSuccess;
      ref.current?.reset();
      onDone?.(state);
    }
  }, [state, onDone, resetOnSuccess]);
  return (
    <PendingCtx.Provider value={isPending}>
      <form
        ref={ref}
        action={formAction}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
          startTransition(() => formAction(fd));
        }}
        className={className}
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
