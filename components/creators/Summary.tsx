// Creator summary for the Inspector (list and record): facts, roster-gate verdict, next stage moves.
import { InspectorTitle, Kvs, Kv, Caption, ButtonLink, Alert, Meta } from "@/components/ui";
import { STAGE_LABEL, SUB_CATEGORY_LABEL, date, pct, int } from "@/lib/format";
import { can } from "@/lib/rules/visibility";
import type { CreatorSummary as Data } from "@/lib/queries/creators";
import { StageMenu } from "./StageMenu";
import { SOURCE_LABEL, CHECKIN_LABEL, PLATFORM_LABEL } from "./labels";

export function CreatorSummaryBlock({ data, role, today, showOpen, inRecord }: { data: Data; role: string; today: string; showOpen?: boolean; inRecord?: boolean }) {
  const { creator: c, filter, verdict, moves, nextCheckin, adherence, platforms, facts, rosterProposed } = data;
  const primary = platforms.find((p) => p.isPrimary) ?? platforms[0];
  const allowed = moves.filter((m) => !m.reasons.length);
  const showGate = c.stage === "watchlist" || c.stage === "incubation";
  return (
    <div>
      {inRecord ? (
        <div className="t-label mb-2 pt-1">Summary</div>
      ) : (
        <>
          <InspectorTitle sub={`${STAGE_LABEL[c.stage]} · ${SUB_CATEGORY_LABEL[c.subCategory]}`}>{c.displayName}</InspectorTitle>
          <div className="mb-3">
            <StageMenu creatorId={c.id} label={STAGE_LABEL[c.stage]} moves={moves} caption={rosterProposed ? "Roster proposed · awaiting the Owner" : undefined} />
          </div>
        </>
      )}
      <Kvs>
        <Kv
          k="Filter"
          v={
            filter ? (
              <span title={filter.sentence}>
                {filter.total}/15 · {date(filter.scoredAt)}
              </span>
            ) : (
              <Alert>Not scored</Alert>
            )
          }
        />
        {filter ? <Kv k="Sentence" v={<span className="text-fg-2">{filter.sentence}</span>} /> : null}
        {can(role, "tier") ? <Kv k="Tier" v={c.tier ?? "—"} /> : null}
        <Kv k="Source" v={SOURCE_LABEL[c.source]} />
        <Kv k="Consent" v={c.consentStatus === "opted_in" ? "Opted in" : c.consentStatus === "withdrawn" ? <Alert>Withdrawn</Alert> : "Not yet"} />
        <Kv
          k="Next check-in"
          v={nextCheckin ? nextCheckin.dueOn < today ? <Alert>Overdue · {date(nextCheckin.dueOn)}</Alert> : `${CHECKIN_LABEL[nextCheckin.type]} · ${date(nextCheckin.dueOn)}` : "—"}
        />
        <Kv k="Open deals" v={String(facts.openDealCount ?? 0)} />
        <Kv k="Adherence" v={pct(adherence)} />
        {primary ? (
          <Kv
            k={PLATFORM_LABEL[primary.platform]}
            v={
              <span>
                @{primary.handle} {primary.followers != null ? <Meta>· {int(primary.followers)}</Meta> : null}
              </span>
            }
          />
        ) : null}
      </Kvs>
      {showGate ? <Caption className="mt-3">{verdict}</Caption> : null}
      <div className="mt-4">
        <div className="t-label mb-1">Next moves</div>
        {allowed.length ? (
          <ul className="space-y-0.5">
            {allowed.map((m) => (
              <li key={m.key}>{m.label}</li>
            ))}
          </ul>
        ) : (
          <p className="text-fg-3">None open</p>
        )}
        {moves
          .filter((m) => m.reasons.length)
          .slice(0, 4)
          .map((m) => (
            <Caption key={m.key}>
              {m.label}: {m.reasons[0]}
            </Caption>
          ))}
      </div>
      {showOpen ? (
        <div className="mt-5">
          <ButtonLink href={`/creators/${c.id}`} size="sm">
            Open record
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
