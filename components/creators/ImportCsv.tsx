"use client";
// Import CSV — the current pipeline document as Scout / Watchlist records (§15 M1).
// Paste or upload, map columns, preview, then import. Duplicates by handle are skipped.
// The preview runs the same pure rules the server re-runs on import.
import { useMemo, useState } from "react";
import { Field, Select, Textarea, Table, THead, TH, TR, TD, Caption, Button } from "@/components/ui";
import { Sheet, ActionForm, SubmitButton } from "@/components/ui/client";
import { importCreatorsCsv } from "@/lib/actions/creators";
import { parseCsv, guessMapping, prepareImport, validateMapping, IMPORT_FIELDS, type Mapping, type ImportField } from "@/lib/rules/creator-import";
import { SUB_CATEGORY_LABEL } from "@/lib/format";
import { SOURCE_LABEL, PLATFORM_LABEL } from "./labels";

const FIELD_LABEL: Record<ImportField, string> = {
  name: "Name",
  handle: "Handle",
  platform: "Platform",
  sub_category: "Sub-category",
  source: "Source",
  notes: "Notes",
  city: "City",
  stage: "Stage",
  consent: "Consent",
  aesthetics: "Aesthetics",
  taste: "Taste",
  personality: "Personality",
  sentence: "Filter sentence",
};

export function ImportCsv({ handles }: { handles: string[] }) {
  const [open, setOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [mapping, setMapping] = useState<Mapping>({});
  const [headerKey, setHeaderKey] = useState("");
  const [defSource, setDefSource] = useState("");
  const [defSub, setDefSub] = useState("");
  const [defPlatform, setDefPlatform] = useState("instagram");

  const parsed = useMemo(() => parseCsv(csv), [csv]);
  const header = parsed[0] ?? [];
  const rows = parsed.slice(1);
  const hk = header.join("\u0001");
  if (hk !== headerKey) {
    setHeaderKey(hk);
    setMapping(guessMapping(header));
  }
  const mapErr = header.length ? validateMapping(mapping, header.length) : [];
  const prepared = useMemo(
    () =>
      header.length && !mapErr.length ? prepareImport(rows, mapping, { source: (defSource || null) as never, subCategory: (defSub || null) as never, platform: defPlatform as never }, handles) : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [csv, mapping, defSource, defSub, defPlatform, handles],
  );
  const counts = { new: prepared.filter((r) => r.status === "new").length, dup: prepared.filter((r) => r.status === "duplicate").length, bad: prepared.filter((r) => r.status === "invalid").length };

  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="Import CSV"
      width={920}
      trigger={
        <Button type="button" size="sm">
          Import CSV
        </Button>
      }
    >
      <div className="px-5 py-4 space-y-4">
        <Field label="File">
          <input
            type="file"
            accept=".csv,.tsv,.txt,text/csv"
            className="block text-fg-2 file:mr-3 file:h-8 file:px-3 file:border-0 file:bg-block file:text-fg"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setCsv(await f.text());
            }}
          />
        </Field>
        <Field label="Or paste">
          <Textarea rows={5} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="name,handle,platform,sub_category,source,notes,city" className="font-mono text-[12px]" />
        </Field>

        {header.length ? (
          <>
            <section>
              <h3 className="t-label mb-2">Columns</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {IMPORT_FIELDS.map((f) => (
                  <Field key={f} label={FIELD_LABEL[f]}>
                    <Select
                      value={mapping[f] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setMapping((m) => {
                          const next = { ...m };
                          if (v === "") delete next[f];
                          else next[f] = Number(v);
                          return next;
                        });
                      }}
                    >
                      <option value="">—</option>
                      {header.map((h, i) => (
                        <option key={i} value={i}>
                          {h || `Column ${i + 1}`}
                        </option>
                      ))}
                    </Select>
                  </Field>
                ))}
              </div>
            </section>
            <section>
              <h3 className="t-label mb-2">When a row is blank</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <Field label="Source">
                  <Select value={defSource} onChange={(e) => setDefSource(e.target.value)}>
                    <option value="">From file</option>
                    {Object.entries(SOURCE_LABEL).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Sub-category">
                  <Select value={defSub} onChange={(e) => setDefSub(e.target.value)}>
                    <option value="">From file</option>
                    {Object.entries(SUB_CATEGORY_LABEL).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Platform">
                  <Select value={defPlatform} onChange={(e) => setDefPlatform(e.target.value)}>
                    {Object.entries(PLATFORM_LABEL).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </section>
            {mapErr.length ? (
              <Caption tone="alert">{mapErr[0]}</Caption>
            ) : (
              <section>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="t-label">Preview</h3>
                  <span className="t-caption">
                    {counts.new} new · {counts.dup} duplicates · {counts.bad} invalid
                  </span>
                </div>
                <Table>
                  <THead>
                    <TH align="right">Line</TH>
                    <TH>Name</TH>
                    <TH>Handle</TH>
                    <TH>Sub-category</TH>
                    <TH>Source</TH>
                    <TH>Stage</TH>
                    <TH>Status</TH>
                  </THead>
                  <tbody>
                    {prepared.slice(0, 100).map((r) => (
                      <TR key={r.line}>
                        <TD align="right" className="text-fg-3">
                          {r.line}
                        </TD>
                        <TD>{r.name || "—"}</TD>
                        <TD className="text-fg-2">{r.handle ? `@${r.handle}` : "—"}</TD>
                        <TD>{r.subCategory ? SUB_CATEGORY_LABEL[r.subCategory] : "—"}</TD>
                        <TD>{r.source ? SOURCE_LABEL[r.source] : "—"}</TD>
                        <TD className="text-fg-2">{r.wantsWatchlist ? "Watchlist if gate passes" : "Scout"}</TD>
                        <TD className={r.status === "invalid" ? "text-pink-fg" : r.status === "duplicate" ? "text-fg-3" : ""}>
                          {r.status === "new" ? "New" : r.status === "duplicate" ? "Skip · duplicate" : r.reason}
                        </TD>
                      </TR>
                    ))}
                  </tbody>
                </Table>
                {prepared.length > 100 ? <Caption className="mt-2">Showing 100 of {prepared.length} rows.</Caption> : null}
              </section>
            )}
          </>
        ) : null}

        <ActionForm action={importCreatorsCsv} onDone={() => setOpen(false)}>
          <input type="hidden" name="csv" value={csv} />
          <input type="hidden" name="mapping" value={JSON.stringify(mapping)} />
          <input type="hidden" name="defaultSource" value={defSource} />
          <input type="hidden" name="defaultSubCategory" value={defSub} />
          <input type="hidden" name="defaultPlatform" value={defPlatform} />
          <div className="flex items-center gap-3">
            <SubmitButton pendingLabel="Importing…">{counts.new ? `Import ${counts.new}` : "Import"}</SubmitButton>
            <Caption>Watchlist rows still need Filter ≥ threshold and consent.</Caption>
          </div>
        </ActionForm>
      </div>
    </Sheet>
  );
}
