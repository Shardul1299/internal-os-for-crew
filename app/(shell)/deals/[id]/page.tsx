import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCrew } from "@/lib/session";
import { getDealRecord, type DealRecord } from "@/lib/queries/deals";
import { can } from "@/lib/rules/visibility";
import { isAtLeast, nextStage, type DealStage } from "@/lib/rules/deals";
import { ScreenHeader, Stepper, WithInspector, type Step } from "@/components/ui";
import { StageControl } from "@/components/deals/StageControl";
import { QualifyStep, BriefStep, MatchStep } from "@/components/deals/StepsEarly";
import { QuoteStep, TermsStep, SignatureStep } from "@/components/deals/StepsMiddle";
import { MoneyStep, DeliveryStep, ReportStep, OverridesStep, ActivityPane } from "@/components/deals/StepsLate";
import { DEAL_STAGE_LABEL, label, moneyShort, humanize } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rec = /^[0-9a-f-]{36}$/.test(id) ? await getDealRecord(id) : null;
  return { title: rec ? rec.deal.title : "Deal" };
}

const STEPS = ["qualify", "brief", "match", "quote", "terms", "signature", "money", "delivery", "report"] as const;
type StepKey = (typeof STEPS)[number] | "overrides";
const STEP_LABEL: Record<StepKey, string> = {
  qualify: "Qualify",
  brief: "Brief",
  match: "Match",
  quote: "Quote",
  terms: "Terms",
  signature: "Signature & PO",
  money: "Money",
  delivery: "Delivery",
  report: "Report & close",
  overrides: "Overrides",
};

/** The step that holds the work needed to leave the current stage. */
function stepForStage(stage: DealStage): StepKey {
  switch (stage) {
    case "lead":
      return "qualify";
    case "qualified":
      return "brief";
    case "brief_received":
      return "match";
    case "creator_matched":
    case "proposal_sent":
      return "quote";
    case "negotiation":
      return "terms";
    case "signed":
      return "money";
    case "advance_received":
      return "signature";
    case "in_production":
      return "delivery";
    default:
      return "report";
  }
}

function doneFor(rec: DealRecord, key: StepKey): boolean {
  const st = rec.deal.stage;
  if (st === "declined" || st === "lost") return false;
  switch (key) {
    case "qualify":
      return isAtLeast(st, "qualified");
    case "brief":
      return isAtLeast(st, "brief_received");
    case "match":
      return isAtLeast(st, "creator_matched");
    case "quote":
      return isAtLeast(st, "proposal_sent") && st !== "proposal_sent";
    case "terms":
      return isAtLeast(st, "signed");
    case "signature":
      return isAtLeast(st, "in_production");
    case "money":
      return st === "paid_in_full" || (isAtLeast(st, "advance_received") && !isAtLeast(st, "reported"));
    case "delivery":
      return isAtLeast(st, "reported");
    case "report":
      return st === "paid_in_full";
    default:
      return false;
  }
}

export default async function DealPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const me = await requireCrew("readDeals");
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const rec = await getDealRecord(id);
  if (!rec) notFound();
  const { deal, brand } = rec;
  const canWrite = can(me.role, "writeDeals");
  const canWriteMoney = can(me.role, "writeMoney");
  const canSeeMoney = can(me.role, "money");
  const closed = ["declined", "lost", "paid_in_full"].includes(deal.stage);
  const current = closed ? (deal.stage === "paid_in_full" ? "report" : "qualify") : stepForStage(deal.stage);
  const active: StepKey = (STEPS as readonly string[]).includes(sp.step ?? "") || sp.step === "overrides" ? (sp.step as StepKey) : current;
  const pendingOverrides = rec.overrides.filter((o) => !o.approvedAt && !o.rejectedAt).length;

  const steps: Step[] = [
    ...STEPS.map((k) => {
      const done = doneFor(rec, k);
      const isCurrent = !closed && k === current;
      const state: Step["state"] = isCurrent ? (rec.blocker ? "blocked" : "current") : done ? "done" : "todo";
      return { key: k, label: STEP_LABEL[k], state, href: `/deals/${deal.id}?step=${k}`, caption: isCurrent ? (rec.blocker ?? undefined) : undefined };
    }),
    { key: "overrides", label: "Overrides", state: pendingOverrides ? "blocked" : "todo", href: `/deals/${deal.id}?step=overrides`, caption: pendingOverrides ? `${pendingOverrides} pending` : undefined },
  ];

  const next = nextStage(deal.stage);
  const warning = rec.nextGate?.warnings?.[0] ?? null;
  const total = deal.signedTotalPaise ?? (rec.lines.length ? rec.quoteTotal : deal.quotedTotalPaise);

  const body = (() => {
    switch (active) {
      case "qualify":
        return <QualifyStep rec={rec} canWrite={canWrite} />;
      case "brief":
        return <BriefStep rec={rec} canWrite={canWrite} />;
      case "match":
        return <MatchStep rec={rec} canWrite={canWrite} />;
      case "quote":
        return <QuoteStep rec={rec} canWrite={canWrite} />;
      case "terms":
        return <TermsStep rec={rec} canWrite={canWrite} />;
      case "signature":
        return <SignatureStep rec={rec} canWrite={canWrite || canWriteMoney} />;
      case "money":
        return <MoneyStep rec={rec} canWriteMoney={canWriteMoney} canSeeMoney={canSeeMoney} />;
      case "delivery":
        return <DeliveryStep rec={rec} />;
      case "report":
        return <ReportStep rec={rec} canWrite={canWrite} />;
      case "overrides":
        return <OverridesStep rec={rec} role={me.role} />;
    }
  })();

  const activity = <ActivityPane rec={rec} canNote={canWrite || canWriteMoney} />;

  return (
    <WithInspector
      main={
        <>
          <ScreenHeader
            title={deal.title}
            number={moneyShort(total, deal.currency)}
            numberCaption={deal.signedTotalPaise ? "signed" : rec.lines.length ? "quoted" : "expected"}
            action={
              <StageControl
                dealId={deal.id}
                stage={deal.stage}
                stageLabel={label(DEAL_STAGE_LABEL, deal.stage)}
                next={next}
                nextLabel={next ? label(DEAL_STAGE_LABEL, next) : null}
                nextReason={rec.nextGate && !rec.nextGate.ok ? rec.nextGate.reasons[0] : null}
                warning={warning}
                canWrite={canWrite}
                closed={closed}
                expectedRupees={Math.round(total / 100)}
              />
            }
          >
            <span className="t-caption">
              <Link href={`/brands/${brand.id}`} className="hover:underline underline-offset-2 text-fg-2">
                {brand.name}
              </Link>
              {" · "}
              {deal.type ? humanize(deal.type) : "No type"}
              {" · "}
              {humanize(deal.origin)}
              {deal.stage === "declined" ? ` · ${deal.declinedReason}` : deal.stage === "lost" ? ` · ${deal.lostReason}` : ""}
            </span>
          </ScreenHeader>
          <div className="lg:flex min-h-0">
            <aside className="lg:w-[200px] shrink-0 lg:border-r border-b lg:border-b-0 border-rule">
              <details className="lg:hidden px-5 py-2" open={false}>
                <summary className="cursor-pointer text-fg-2">{STEP_LABEL[active]}</summary>
                <Stepper steps={steps} active={active} />
              </details>
              <div className="hidden lg:block">
                <Stepper steps={steps} active={active} />
              </div>
            </aside>
            <div className="flex-1 min-w-0 pb-12">
              {body}
              <div className="lg:hidden px-5 py-4 border-t border-rule">{activity}</div>
            </div>
          </div>
        </>
      }
      inspector={activity}
    />
  );
}
