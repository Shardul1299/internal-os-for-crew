// Filter & Tier: score form, history, roster-gate verdict, tier proposal → Owner approval, signals, evidence.
// Tier is internal (§0.1 #6): hidden from roles that can't see it.
import { Section, Table, THead, TH, TR, TD, Caption, Kvs, Kv, Field, Input, Select, Alert } from "@/components/ui";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/client";
import { SheetForm } from "../SheetForm";
import { ScoreForm } from "../ScoreForm";
import { proposeTier, decideTier, addSignal, removeSignal, addEvidence, removeEvidence } from "@/lib/actions/creators";
import { canEditCreator, canScoreFilter, canEditSignals, filterContextFor } from "@/lib/rules/creator-flow";
import { canApproveTier } from "@/lib/rules/creators";
import { can } from "@/lib/rules/visibility";
import type { RulesConfig } from "@/lib/rules/config";
import { date } from "@/lib/format";
import { CONTEXT_LABEL, SIGNAL_LABEL, EVIDENCE_LABEL } from "../labels";
import type { CreatorSummary, creatorFilterTier } from "@/lib/queries/creators";

type Data = Awaited<ReturnType<typeof creatorFilterTier>>;

export function FilterTierTab({ summary, data, role, cfg }: { summary: CreatorSummary; data: Data; role: string; cfg: RulesConfig }) {
  const c = summary.creator;
  const canTier = can(role, "tier");
  const canScore = canScoreFilter(role).ok && canEditCreator(role, c.stage).ok;
  const canSignals = canEditSignals(role).ok;
  const canEvidence = canEditCreator(role, c.stage).ok;
  const approve = canApproveTier({ role: role as never }, { tier: c.tierProposed, signalCount: summary.facts.tierSignalCount });
  const name = (id: string | null) => (id ? data.names.get(id) || "—" : "—");
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2">
      <div className="xl:border-r border-rule">
        <Section title="Roster gate">
          <p className="t-headline">{summary.verdict}</p>
          <ul className="mt-2 space-y-0.5">
            {summary.gate.met.map((m) => (
              <li key={m.key} className="text-fg-2">
                ✓ {m.label}
              </li>
            ))}
            {summary.gate.missing.map((m) => (
              <li key={m.key}>
                <Alert>Missing</Alert> <span className="text-fg-2">{m.reason}</span>
              </li>
            ))}
          </ul>
          <Caption className="mt-2">Owner approval is always the last step.</Caption>
        </Section>
        {canScore ? (
          <Section title="Score the Filter">
            <span id="score" />
            <ScoreForm creatorId={c.id} defaultContext={filterContextFor(c.stage)} threshold={cfg.filter.watchlist} />
          </Section>
        ) : null}
      </div>
      <div>
        {canTier ? (
          <Section title="Tier">
            <Kvs>
              <Kv k="Tier" v={c.tier ?? "—"} />
              <Kv k="Reviewed" v={c.tierReviewedAt ? `${date(c.tierReviewedAt)} · ${name(c.tierApprovedBy)}` : null} />
              <Kv k="Next review" v={c.tierNextReviewAt ? date(c.tierNextReviewAt) : null} />
              {c.tierProposed ? <Kv k="Proposed" v={`${c.tierProposed} · ${name(c.tierProposedBy)}`} /> : null}
            </Kvs>
            {c.tierProposed ? (
              <div className="mt-3 flex items-start gap-2">
                {role === "owner" ? (
                  <>
                    {approve.ok ? (
                      <ActionButton action={decideTier} fields={{ id: c.id, decision: "approve" }}>
                        Approve {c.tierProposed}
                      </ActionButton>
                    ) : (
                      <Caption>{approve.reasons[0]}</Caption>
                    )}
                    <ActionButton action={decideTier} fields={{ id: c.id, decision: "reject" }} variant="quiet">
                      Reject
                    </ActionButton>
                  </>
                ) : (
                  <Caption>Awaiting the Owner.</Caption>
                )}
              </div>
            ) : canSignals ? (
              <ActionForm action={proposeTier} className="mt-3 flex items-center gap-2">
                <input type="hidden" name="id" value={c.id} />
                <Select name="tier" defaultValue={c.tier ?? ""} className="max-w-[120px]" aria-label="Tier">
                  <option value="" disabled>
                    Tier
                  </option>
                  {["T0", "T1", "T2", "T3"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
                <SubmitButton variant="plain" size="sm">
                  Propose
                </SubmitButton>
              </ActionForm>
            ) : null}
            <Caption className="mt-2">Set by signals, never follower counts.</Caption>
          </Section>
        ) : null}
      </div>
      <div className="xl:col-span-2 border-t border-rule">
        <Section title="History" flush>
          {data.scores.length ? (
            <Table>
              <THead>
                <TH>Date</TH>
                <TH>Context</TH>
                <TH align="right">Aes</TH>
                <TH align="right">Taste</TH>
                <TH align="right">Pers</TH>
                <TH align="right">Total</TH>
                <TH>Sentence</TH>
                <TH>By</TH>
              </THead>
              <tbody>
                {data.scores.map((s) => (
                  <TR key={s.id}>
                    <TD className="whitespace-nowrap">{date(s.scoredAt, "d MMM yy")}</TD>
                    <TD className="text-fg-2 whitespace-nowrap">{CONTEXT_LABEL[s.context]}</TD>
                    <TD align="right">{s.aesthetics}</TD>
                    <TD align="right">{s.taste}</TD>
                    <TD align="right">{s.personality}</TD>
                    <TD align="right" className="font-semibold">
                      {s.total}
                    </TD>
                    <TD className="min-w-[220px]">{s.sentence}</TD>
                    <TD className="text-fg-3 whitespace-nowrap">{name(s.scoredBy)}</TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="px-5 t-caption">Not scored yet. Nobody leaves Scout without a Filter score.</p>
          )}
        </Section>
      </div>
      <div className="xl:col-span-2 border-t border-rule">
        <div>
          {canTier ? (
            <Section title="Tier signals" aside={canSignals ? <AddSignal id={c.id} /> : `${data.signals.length}`} flush>
              {data.signals.length ? (
                <Table>
                  <THead>
                    <TH>Kind</TH>
                    <TH>Signal</TH>
                    <TH>Date</TH>
                    <TH align="right">Weight</TH>
                    <TH />
                  </THead>
                  <tbody>
                    {data.signals.map((s) => (
                      <TR key={s.id}>
                        <TD className="whitespace-nowrap text-fg-2">{SIGNAL_LABEL[s.kind]}</TD>
                        <TD>
                          {s.url ? (
                            <a href={s.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                              {s.description}
                            </a>
                          ) : (
                            s.description
                          )}
                        </TD>
                        <TD className="whitespace-nowrap">{date(s.date, "MMM yy")}</TD>
                        <TD align="right">{s.weight}</TD>
                        <TD align="right">
                          {canSignals ? (
                            <ActionButton action={removeSignal} fields={{ id: c.id, rowId: s.id }} variant="quiet">
                              Remove
                            </ActionButton>
                          ) : null}
                        </TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="px-5 t-caption">No signals recorded.</p>
              )}
            </Section>
          ) : null}
        </div>
        <div>
          <Section title="Evidence" aside={canEvidence ? <AddEvidence id={c.id} /> : `${data.evidence.length}`} flush>
            {data.evidence.length ? (
              <Table>
                <THead>
                  <TH>Kind</TH>
                  <TH>Proof</TH>
                  <TH>Date</TH>
                  <TH />
                </THead>
                <tbody>
                  {data.evidence.map((e) => (
                    <TR key={e.id}>
                      <TD className="whitespace-nowrap text-fg-2">{EVIDENCE_LABEL[e.kind]}</TD>
                      <TD>
                        {e.url ? (
                          <a href={e.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                            {e.title}
                          </a>
                        ) : (
                          e.title
                        )}
                      </TD>
                      <TD className="whitespace-nowrap">{date(e.date, "MMM yy")}</TD>
                      <TD align="right">
                        {canEvidence ? (
                          <ActionButton action={removeEvidence} fields={{ id: c.id, rowId: e.id }} variant="quiet">
                            Remove
                          </ActionButton>
                        ) : null}
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p className="px-5 t-caption">No evidence yet.</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function AddSignal({ id }: { id: string }) {
  return (
    <SheetForm title="Add signal" trigger="Add" action={addSignal} submitLabel="Record signal" width={480}>
      <input type="hidden" name="id" value={id} />
      <Field label="Kind">
        <Select name="kind" defaultValue="inbound_founder">
          {Object.entries(SIGNAL_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Signal">
        <Input name="description" required maxLength={300} />
      </Field>
      <Field label="URL">
        <Input name="url" type="url" placeholder="https://" />
      </Field>
      <Field label="Date">
        <Input name="date" type="date" />
      </Field>
      <Field label="Weight">
        <Select name="weight" defaultValue="1">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </Select>
      </Field>
    </SheetForm>
  );
}

function AddEvidence({ id }: { id: string }) {
  return (
    <SheetForm title="Add evidence" trigger="Add" action={addEvidence} submitLabel="Add evidence" width={480}>
      <input type="hidden" name="id" value={id} />
      <Field label="Kind">
        <Select name="kind" defaultValue="shipped_product">
          {Object.entries(EVIDENCE_LABEL).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Title">
        <Input name="title" required maxLength={200} />
      </Field>
      <Field label="URL">
        <Input name="url" type="url" placeholder="https://" />
      </Field>
      <Field label="Date">
        <Input name="date" type="date" />
      </Field>
    </SheetForm>
  );
}
