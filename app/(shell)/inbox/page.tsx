import Link from "next/link";
import { requireCrew } from "@/lib/session";
import { can } from "@/lib/rules/visibility";
import { getConfig } from "@/lib/settings";
import { listThreads, threadCounts, getThread, inboxCreators, brandOptions, inboundDomain, declineTemplate } from "@/lib/queries/inbox";
import { canConvert, canForward, isPastSla, prescreenFlags } from "@/lib/rules/inbox";
import { RISK_FLAGS } from "@/lib/rules/campaigns";
import { ScreenHeader, Section, Table, THead, TH, TR, TD, EmptyState, Meta, Alert, Caption, Kvs, Kv, Markdown, InspectorTitle, WithInspector, selHref } from "@/components/ui";
import { KeyRows, SegmentedControl } from "@/components/ui/client";
import { CaptureSheet } from "@/components/inbox/CaptureSheet";
import { ThreadActions } from "@/components/inbox/ThreadActions";
import { InspectorGroup, PhoneInspector } from "@/components/campaigns/fields";
import { dateTime, humanize, DEAL_STAGE_LABEL, label } from "@/lib/format";
import { formatInTimeZone } from "date-fns-tz";

export const metadata = { title: "Inbox" };
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;

const CHANNEL: Record<string, string> = { email: "Email", instagram_dm: "Instagram DM", linkedin: "LinkedIn", x: "X", whatsapp: "WhatsApp", form: "Form" };

function slaText(sla: Date, now: Date) {
  const mins = Math.round((sla.getTime() - now.getTime()) / 60_000);
  if (mins <= 0) {
    const over = Math.max(1, Math.round(-mins / 60));
    return `${over}h over`;
  }
  return mins < 60 ? `${mins}m left` : `${Math.round(mins / 60)}h left`;
}

async function ThreadInspector({ id, role }: { id: string; role: string }) {
  const row = await getThread(id);
  if (!row) return <Caption>Thread not found.</Caption>;
  const { t, creatorName, brand, dealTitle, dealStage } = row;
  const cfg = await getConfig();
  const [brands, declineMd] = await Promise.all([brandOptions(), declineTemplate(creatorName)]);
  const now = new Date();
  const past = isPastSla({ slaDueAt: t.slaDueAt, status: t.status }, now);
  const open = t.status === "new" || t.status === "triaged";
  const conv = canConvert(t);
  const fwd = canForward(t);
  const flags = prescreenFlags(t.noListPrescreen as Record<string, boolean | string | null> | null);
  const brandFlags = brand?.riskFlags.filter((f) => f.startsWith("blocklist_")) ?? [];
  const flagLabel = Object.fromEntries(RISK_FLAGS.map((f) => [f.key, f.label]));
  return (
    <div>
      <InspectorTitle sub={`${CHANNEL[t.channel]} · ${t.fromName ?? "Unknown"}${t.fromAddress ? ` · ${t.fromAddress}` : ""}`}>{t.subject || "No subject"}</InspectorTitle>
      <Kvs>
        <Kv k="For" v={creatorName ?? "Crew"} />
        <Kv k="Brand" v={brand ? <Link href={`/brands/${brand.id}`} className="hover:underline underline-offset-2">{brand.name}</Link> : <Meta>Not identified</Meta>} />
        <Kv k="Received" v={dateTime(t.receivedAt)} />
        {open ? <Kv k="SLA" v={past ? <Alert>Past SLA · {slaText(t.slaDueAt, now)}</Alert> : `${dateTime(t.slaDueAt)} · ${slaText(t.slaDueAt, now)}`} /> : <Kv k="Status" v={humanize(t.status)} />}
        <Kv k="Pre-screen" v={t.noListPrescreen ? (flags.length ? <Alert>{flags.join(", ")}</Alert> : "Clear") : <Meta>Not done</Meta>} />
        {t.dealId ? <Kv k="Deal" v={<Link href={`/deals/${t.dealId}`} className="hover:underline underline-offset-2">{dealTitle} · {label(DEAL_STAGE_LABEL, dealStage)}</Link>} /> : null}
        {t.forwardedToCreatorAt ? <Kv k="Forwarded" v={dateTime(t.forwardedToCreatorAt)} /> : null}
      </Kvs>
      {brandFlags.length ? (
        <p className="t-caption mt-2">
          <Alert>Blocklisted brand</Alert> · {brandFlags.map((f) => flagLabel[f] ?? f).join(", ")}
        </p>
      ) : null}
      <InspectorGroup label="Message">
        <div className="bg-block p-3 max-h-[260px] overflow-y-auto">
          <Markdown source={t.firstMessageMd} />
        </div>
      </InspectorGroup>
      {t.replyMd ? (
        <InspectorGroup label={t.status === "declined" ? "Declined" : "Crew's reply"} aside={t.repliedAt ? dateTime(t.repliedAt) : undefined}>
          <div className="bg-block p-3">
            <Markdown source={t.replyMd} />
          </div>
        </InspectorGroup>
      ) : null}
      <InspectorGroup label="Actions">
        <ThreadActions
          id={t.id}
          closed={t.status === "declined" || t.status === "spam"}
          brandId={t.brandId}
          brands={brands}
          noList={cfg.noList}
          blocklist={cfg.blocklist}
          prescreen={t.noListPrescreen as Record<string, boolean | string | null> | null}
          replyMd={t.replyMd}
          declineMd={declineMd}
          convertReason={conv.ok ? null : conv.reasons[0]}
          canConvertRole={can(role, "writeDeals")}
          convertTitle={`${brand?.name ?? "Brand"} — ${t.subject || "inbound"}`}
          forwardReason={fwd.ok ? null : fwd.reasons[0]}
          forwarded={!!t.forwardedToCreatorAt}
        />
      </InspectorGroup>
    </div>
  );
}

export default async function InboxPage({ searchParams }: { searchParams: Promise<SP> }) {
  const me = await requireCrew("inbox");
  const sp = await searchParams;
  const view = sp.view === "done" || sp.view === "all" ? sp.view : "open";
  const [rows, counts, creators] = await Promise.all([listThreads(view), threadCounts(), inboxCreators()]);
  const openRows = view === "open" ? rows : await listThreads("open");
  const late = openRows.filter((r) => r.pastSla).length;
  const selId = typeof sp.sel === "string" ? sp.sel : null;
  const now = new Date();
  const domain = inboundDomain();
  const inspector = selId ? <ThreadInspector id={selId} role={me.role} /> : undefined;
  return (
    <WithInspector
      closeHref={selHref("/inbox", sp, null)}
      inspector={inspector}
      main={
        <>
          <ScreenHeader
            title="Inbox"
            number={late || undefined}
            numberCaption={late ? "past SLA" : undefined}
            action={<CaptureSheet creators={creators} defaultOpen={sp.new === "1"} now={formatInTimeZone(now, "Asia/Kolkata", "yyyy-MM-dd'T'HH:mm")} />}
          >
            <Caption>
              Gmail forwards to <span className="num text-fg-2">handle@{domain}</span> — routed to that creator.
            </Caption>
          </ScreenHeader>
          <Section>
            <SegmentedControl
              param="view"
              value={view}
              options={[
                { value: "open", label: "Open", count: counts.open },
                { value: "done", label: "Handled", count: counts.done },
                { value: "all", label: "All", count: counts.all },
              ]}
            />
          </Section>
          {rows.length === 0 ? (
            <EmptyState>{view === "open" ? "Nothing waiting on a reply." : "No threads here."}</EmptyState>
          ) : (
            <KeyRows>
              <Table>
                <THead>
                  <TH>SLA</TH>
                  <TH>From</TH>
                  <TH>Subject</TH>
                  <TH>For</TH>
                  <TH className="hidden md:table-cell">Channel</TH>
                  <TH className="hidden md:table-cell">Status</TH>
                </THead>
                <tbody>
                  {rows.map((r) => {
                    const open = r.status === "new" || r.status === "triaged";
                    return (
                      <TR key={r.id} href={selHref("/inbox", sp, r.id)} selected={r.id === selId}>
                        <TD className="whitespace-nowrap">{open ? r.pastSla ? <Alert>Past SLA</Alert> : slaText(r.slaDueAt, now) : <Meta>{dateTime(r.receivedAt)}</Meta>}</TD>
                        <TD className="max-w-[180px] truncate">
                          {r.fromName ?? "—"}
                          {r.brandName ? <span className="t-caption ml-2">{r.brandName}</span> : null}
                        </TD>
                        <TD className="max-w-[320px] truncate">{r.subject || <Meta>{r.firstMessageMd.slice(0, 60)}</Meta>}</TD>
                        <TD className="whitespace-nowrap">{r.creatorName ?? <Meta>Crew</Meta>}</TD>
                        <TD className="hidden md:table-cell">{CHANNEL[r.channel]}</TD>
                        <TD className="hidden md:table-cell">
                          {humanize(r.status)}
                          {r.forwardedToCreatorAt ? <span className="t-caption ml-2">forwarded</span> : null}
                        </TD>
                      </TR>
                    );
                  })}
                </tbody>
              </Table>
            </KeyRows>
          )}
          <PhoneInspector>{inspector}</PhoneInspector>
        </>
      }
    />
  );
}
