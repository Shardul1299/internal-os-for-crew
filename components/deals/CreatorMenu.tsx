"use client";
// Status menu for a creator on a deal: accept / propose / declined, role swap, remove.
import { useRouter } from "next/navigation";
import { MenuPill, useResultFeedback, type MenuOption } from "@/components/ui/client";
import { updateDealCreator, removeDealCreator } from "@/lib/actions/deals";

const LABEL: Record<string, string> = { proposed: "Proposed", accepted: "Accepted", declined_by_creator: "Declined" };

export function CreatorMenu({ linkId, status, role, canSwapRole }: { linkId: string; status: string; role: "primary" | "upsell"; canSwapRole: boolean }) {
  const router = useRouter();
  const feedback = useResultFeedback();
  const options: MenuOption[] = [
    ...Object.entries(LABEL)
      .filter(([k]) => k !== status)
      .map(([k, l]) => ({ value: `status:${k}`, label: l })),
    ...(canSwapRole ? [{ value: "role", label: role === "primary" ? "Make upsell" : "Make primary" }] : []),
    { value: "remove", label: "Remove", hint: "Only without quote lines" },
  ];
  return (
    <MenuPill
      value={status}
      label={LABEL[status] ?? status}
      options={options}
      onSelect={async (v) => {
        const fd = new FormData();
        fd.set("linkId", linkId);
        let r;
        if (v === "remove") r = await removeDealCreator(null, fd);
        else {
          if (v === "role") fd.set("role", role === "primary" ? "upsell" : "primary");
          else fd.set("status", v.slice("status:".length));
          r = await updateDealCreator(null, fd);
        }
        if (r.ok) {
          feedback(r);
          router.refresh();
          return { ok: true };
        }
        return { ok: false, error: r.error };
      }}
    />
  );
}
