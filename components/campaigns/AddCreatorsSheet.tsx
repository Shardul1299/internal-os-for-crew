"use client";
// Add creators (§8.7): a sheet over stage = roster with one search field; Filter total, sub-category,
// topic-filter conflicts and sponsored-ratio headroom inline. No follower column.
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sheet, ActionForm, SubmitButton } from "@/components/ui/client";
import { Button, Input, Select, Table, THead, TH, TR, TD, Caption, Alert, Meta } from "@/components/ui";
import { addCreatorToCampaign } from "@/lib/actions/campaigns";
import type { Candidate } from "@/lib/queries/campaigns";

const SUB: Record<string, string> = {
  ai_educator: "AI educator",
  builder_engineer: "Builder / engineer",
  founder_operator: "Founder / operator",
  vc_analyst: "VC / analyst",
  enterprise_tech: "Enterprise tech",
};

export function AddCreatorsSheet({ campaignId, candidates, deliverables, defaultOpen }: { campaignId: string; candidates: Candidate[]; deliverables: { key: string; label: string }[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? candidates.filter((c) => c.name.toLowerCase().includes(t) || (SUB[c.subCategory] ?? c.subCategory).toLowerCase().includes(t)) : candidates;
  }, [q, candidates]);
  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && sp.get("add")) {
          const next = new URLSearchParams(sp.toString());
          next.delete("add");
          router.replace(next.toString() ? `${pathname}?${next}` : pathname, { scroll: false });
        }
      }}
      title="Add creators"
      width={860}
      trigger={
        <Button variant="primary" data-new>
          Add creators
        </Button>
      }
    >
      <div className="px-5 py-3 border-b border-rule">
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roster" aria-label="Search roster" />
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 t-headline text-fg-2">No roster creator matches.</p>
      ) : (
        <Table>
          <THead>
            <TH>Creator</TH>
            <TH align="right">Filter</TH>
            <TH>Topic filter</TH>
            <TH align="right">Headroom</TH>
            <TH>Add</TH>
          </THead>
          <tbody>
            {rows.map((c) => (
              <TR key={c.id}>
                <TD>
                  <div className="font-semibold">{c.name}</div>
                  <div className="t-caption">{SUB[c.subCategory] ?? c.subCategory}{c.onCampaign ? " · on this campaign" : ""}</div>
                </TD>
                <TD align="right">{c.filterTotal ?? <Meta>—</Meta>}</TD>
                <TD className="max-w-[180px]">{c.conflicts.length ? <span className="text-fg-2">{c.conflicts.join(", ")}</span> : <Meta>Clear</Meta>}</TD>
                <TD align="right" title="Sponsored posts that still fit this month">
                  {c.headroom > 0 ? c.headroom : <Alert>None</Alert>}
                </TD>
                <TD className="min-w-[340px]">
                  {c.blockedReason ? (
                    <Caption>{c.blockedReason}</Caption>
                  ) : (
                    <ActionForm action={addCreatorToCampaign} className="grid grid-cols-[minmax(0,1fr)_132px_auto] gap-1 items-start">
                      <input type="hidden" name="campaignId" value={campaignId} />
                      <input type="hidden" name="creatorId" value={c.id} />
                      <Select name="deliverableKey" aria-label="Deliverable" className="h-7 text-[12px]" defaultValue={deliverables[0]?.key}>
                        {deliverables.map((d) => (
                          <option key={d.key} value={d.key}>
                            {d.label}
                          </option>
                        ))}
                      </Select>
                      <Input type="date" name="dueOn" aria-label="Due" className="h-7 text-[12px]" />
                      <SubmitButton size="sm" variant="plain" pendingLabel="…">
                        Add
                      </SubmitButton>
                    </ActionForm>
                  )}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
      <p className="px-5 py-3 t-caption">Adding proposes the creator on the deal and briefs one deliverable.</p>
    </Sheet>
  );
}
