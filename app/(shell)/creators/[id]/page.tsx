import { notFound, redirect } from "next/navigation";
import { requireCrew } from "@/lib/session";
import { getConfig } from "@/lib/settings";
import {
  creatorSummary,
  creatorOverview,
  creatorFilterTier,
  creatorRates,
  creatorCalendar,
  creatorDeals,
  creatorPerformance,
  creatorCheckins,
  creatorPayments,
  creatorAgreement,
  shippedSince,
  isUuid,
} from "@/lib/queries/creators";
import { ScreenHeader, WithInspector, ButtonLink } from "@/components/ui";
import { SegmentedControl, ActionButton } from "@/components/ui/client";
import { StageMenu } from "@/components/creators/StageMenu";
import { SheetForm } from "@/components/creators/SheetForm";
import { CreatorSummaryBlock } from "@/components/creators/Summary";
import { OverviewTab } from "@/components/creators/tabs/Overview";
import { creatorSundayCadence } from "@/lib/queries/program";
import { FilterTierTab } from "@/components/creators/tabs/FilterTier";
import { RatesTab } from "@/components/creators/tabs/Rates";
import { CalendarTab } from "@/components/creators/tabs/Calendar";
import { DealsTab } from "@/components/creators/tabs/Deals";
import { PerformanceTab } from "@/components/creators/tabs/Performance";
import { CheckinsTab } from "@/components/creators/tabs/Checkins";
import { PaymentsTab } from "@/components/creators/tabs/Payments";
import { AgreementTab } from "@/components/creators/tabs/Agreement";
import { moveStage } from "@/lib/actions/creators";
import { can } from "@/lib/rules/visibility";
import { canRunCheckins, canScoreFilter, canEditCreator, canStartPartnershipNow } from "@/lib/rules/creator-flow";
import { canStartPartnership } from "@/lib/rules/creators";
import { STAGE_LABEL, SUB_CATEGORY_LABEL } from "@/lib/format";
import { sp as one } from "@/lib/search";
import { addDays, toISO, today as todayISO } from "@/lib/dates";
import { SOURCE_LABEL } from "@/components/creators/labels";

export const dynamic = "force-dynamic";

const CREATOR_ROLES = ["owner", "crew_lead", "ops", "strategist", "intern"];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return { title: "Creator" };
  const { db } = await import("@/lib/db");
  const { creators } = await import("@/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const [c] = await db.select({ n: creators.displayName }).from(creators).where(eq(creators.id, id));
  return { title: c?.n ?? "Creator" };
}

export default async function CreatorRecord({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const me = await requireCrew();
  if (!CREATOR_ROLES.includes(me.role)) redirect("/today");
  const { id } = await params;
  const sp = await searchParams;
  const cfg = await getConfig();
  const today = todayISO();
  const summary = await creatorSummary(id, cfg, me.role, today);
  if (!summary) notFound();
  const c = summary.creator;

  const canTier = can(me.role, "tier");
  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "filter", label: canTier ? "Filter & Tier" : "Filter" },
    ...(can(me.role, "money") ? [{ value: "rates", label: "Rates" }] : []),
    { value: "calendar", label: "Calendar" },
    ...(can(me.role, "readDeals") ? [{ value: "deals", label: "Deals" }] : []),
    { value: "performance", label: "Performance" },
    { value: "checkins", label: "Check-ins" },
    ...(can(me.role, "money") ? [{ value: "payments", label: "Payments" }] : []),
    { value: "agreement", label: "Agreement" },
  ];
  const tabRaw = one(sp.tab) ?? "overview";
  const tab = tabs.some((t) => t.value === tabRaw) ? tabRaw : "overview";
  const monthRaw = one(sp.m);
  const month = monthRaw && /^\d{4}-\d{2}$/.test(monthRaw) ? monthRaw : today.slice(0, 7);

  // Primary action, contextual (one per screen).
  const approve = summary.moves.find((m) => m.key === "approve_roster" && !m.reasons.length);
  const propose = summary.moves.find((m) => m.key === "propose_roster" && !m.reasons.length);
  const due = summary.nextCheckin && summary.nextCheckin.dueOn <= addDays(today, 7) && canRunCheckins(me.role).ok ? summary.nextCheckin : null;
  const agreement = tab === "agreement" || tab === "checkins" || me.role === "owner" ? await creatorAgreement(id) : null;
  const partnership = agreement?.status === "pilot" && canStartPartnershipNow(canStartPartnership(cfg, summary.facts, { role: me.role as never, today }), agreement.pilotEndsOn, today).ok;
  let primary: React.ReactNode = null;
  const holding = tab === "checkins" && !!one(sp.hold);
  if (holding) primary = null;
  else if (approve)
    primary = (
      <SheetForm
        title="Approve roster"
        trigger="Approve roster"
        triggerVariant="primary"
        triggerSize="md"
        action={moveStage}
        submitLabel="Approve roster"
        consequence="Starts the exclusive pilot and schedules check-ins. This can't be undone."
        width={460}
      >
        <input type="hidden" name="id" value={c.id} />
        <input type="hidden" name="move" value="approve_roster" />
      </SheetForm>
    );
  else if (propose)
    primary = (
      <ActionButton action={moveStage} fields={{ id: c.id, move: "propose_roster" }} variant="primary" size="md">
        Propose to roster
      </ActionButton>
    );
  else if (partnership)
    primary = (
      <ButtonLink href={`/creators/${c.id}?tab=agreement`} variant="primary">
        Start partnership
      </ButtonLink>
    );
  else if (due)
    primary = (
      <ButtonLink href={`/creators/${c.id}?tab=checkins&hold=${due.id}`} variant="primary">
        Hold check-in
      </ButtonLink>
    );
  else if (canScoreFilter(me.role).ok && canEditCreator(me.role, c.stage).ok)
    primary = (
      <ButtonLink href={`/creators/${c.id}?tab=filter#score`} variant="primary">
        Score
      </ButtonLink>
    );

  let body: React.ReactNode;
  switch (tab) {
    case "filter":
      body = <FilterTierTab summary={summary} data={await creatorFilterTier(id)} role={me.role} cfg={cfg} />;
      break;
    case "rates":
      body = <RatesTab creatorId={id} tier={c.tier} rates={await creatorRates(id)} cfg={cfg} role={me.role} />;
      break;
    case "calendar":
      body = <CalendarTab creatorId={id} month={month} data={await creatorCalendar(id, month)} role={me.role} cfg={cfg} today={today} adherence={summary.adherence} />;
      break;
    case "deals":
      body = <DealsTab rows={await creatorDeals(id)} showMoney={can(me.role, "money")} />;
      break;
    case "performance":
      body = <PerformanceTab data={await creatorPerformance(id)} adherence={summary.adherence} weeks={cfg.n.calendar_window_weeks} />;
      break;
    case "checkins": {
      const data = await creatorCheckins(id);
      const lastHeld =
        data.checkins
          .filter((k) => k.heldOn)
          .map((k) => k.heldOn!)
          .sort()
          .at(-1) ?? null;
      const ft = await creatorFilterTier(id);
      const since = addDays(today, -30);
      const recent = ft.scores.filter((s) => toISO(s.scoredAt)! >= since);
      body = (
        <CheckinsTab
          summary={summary}
          data={data}
          role={me.role}
          today={today}
          hold={one(sp.hold) ?? null}
          shipped={await shippedSince(id, lastHeld, today)}
          scores={(one(sp.hold) ? recent : ft.scores).map((s) => ({ id: s.id, total: s.total, scoredAt: s.scoredAt }))}
          agreement={agreement}
        />
      );
      break;
    }
    case "payments":
      body = <PaymentsTab rows={await creatorPayments(id)} today={today} />;
      break;
    case "agreement":
      body = <AgreementTab summary={summary} agreement={agreement} role={me.role} cfg={cfg} today={today} />;
      break;
    default:
      body = <OverviewTab summary={summary} data={await creatorOverview(id, c.referredByCreatorId)} role={me.role} cadence={await creatorSundayCadence(id)} />;
  }

  return (
    <>
      <ScreenHeader title={c.displayName} action={primary}>
        <div className="flex flex-wrap items-start gap-3">
          <StageMenu creatorId={c.id} label={STAGE_LABEL[c.stage]} moves={summary.moves} caption={summary.rosterProposed ? "Roster proposed · awaiting the Owner" : undefined} />
          <span className="t-caption pt-1.5">
            {SUB_CATEGORY_LABEL[c.subCategory]} · {SOURCE_LABEL[c.source]}
            {c.city ? ` · ${c.city}` : ""}
            {canTier && c.tier ? ` · ${c.tier}` : ""}
          </span>
        </div>
      </ScreenHeader>
      <WithInspector
        inspector={<CreatorSummaryBlock data={summary} role={me.role} today={today} inRecord />}
        main={
          <>
            <div className="px-5 py-3 border-b border-rule">
              <SegmentedControl options={tabs} value={tab} param="tab" />
            </div>
            {body}
          </>
        }
      />
    </>
  );
}
