// Invoice and payout actions shared by the deal Money step and the /money Inspector.
import { Field, Input, NumberField } from "@/components/ui";
import { ActionButton } from "@/components/ui/client";
import { FormSheet } from "@/components/deals/FormSheet";
import { markInvoiceSent, recordPayment, markPayoutPaid } from "@/lib/actions/money";

export function InvoiceActions({ inv, today }: { inv: { id: string; number: string; status: string; amountPaise: number; gstPct: number }; today: string }) {
  if (inv.status === "draft")
    return (
      <ActionButton action={markInvoiceSent} fields={{ invoiceId: inv.id }}>
        Mark sent
      </ActionButton>
    );
  if (inv.status === "sent" || inv.status === "overdue")
    return (
      <FormSheet title={`Record payment · ${inv.number}`} trigger="Record payment" action={recordPayment} fields={{ invoiceId: inv.id }} submit="Record payment" consequence="Generates the creator payouts this receipt triggers.">
        <Field label="Paid amount" hint={`Invoice ${Math.round(inv.amountPaise / 100).toLocaleString("en-IN")} + ${inv.gstPct}% GST`}>
          <NumberField name="amountRupees" unit="₹" min={1} step={1} defaultValue={inv.amountPaise / 100} required />
        </Field>
        <Field label="Paid on">
          <Input name="paidOn" type="date" defaultValue={today} max={today} required />
        </Field>
        <Field label="Reference">
          <Input name="reference" required placeholder="UTR / bank ref" />
        </Field>
      </FormSheet>
    );
  return null;
}

export function PayoutActions({ p, today }: { p: { id: string; status: string; creatorName?: string }; today: string }) {
  if (p.status !== "due") return null;
  return (
    <FormSheet title={`Mark paid${p.creatorName ? ` · ${p.creatorName}` : ""}`} trigger="Mark paid" action={markPayoutPaid} fields={{ payoutId: p.id }} submit="Mark paid">
      <Field label="Paid on">
        <Input name="paidOn" type="date" defaultValue={today} max={today} required />
      </Field>
      <Field label="Reference">
        <Input name="reference" required placeholder="UTR / bank ref" />
      </Field>
    </FormSheet>
  );
}
