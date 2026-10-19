"use client";
// CSV / TSV paste import (BRIEF §19.4), ported from Upcreate's CsvImportClient: header detection,
// column mapping, the multiple per row, rows at or above the outlier threshold pre-selected, bulk save.
import { useMemo, useState } from "react";
import { Caption, Field, FormGrid, Input, Select, Textarea, Table, THead, TH, TR, TD, cx } from "@/components/ui";
import { ActionForm, SubmitButton } from "@/components/ui/client";
import { importOutliers } from "@/lib/actions/studio-research";
import { autoMap, parseSheet, previewRows, type Mapping } from "@/lib/studio/csv";

const KEYS: [keyof Mapping, string][] = [
  ["views", "Views"],
  ["link", "Link"],
  ["followers", "Followers"],
  ["handle", "Handle"],
  ["caption", "Caption"],
];

export function CsvImport({ threshold }: { threshold: number }) {
  const [raw, setRaw] = useState("");
  const [handle, setHandle] = useState("");
  const [followers, setFollowers] = useState("");
  const [niche, setNiche] = useState("");
  const [override, setOverride] = useState<Partial<Mapping>>({});
  const [picked, setPicked] = useState<Record<number, boolean>>({});

  const sheet = useMemo(() => parseSheet(raw), [raw]);
  const map = useMemo(() => ({ ...autoMap(sheet.headers), ...override }), [sheet.headers, override]);
  const rows = useMemo(() => previewRows(sheet, map, { followers: Number(followers) || 0, handle, threshold }), [sheet, map, followers, handle, threshold]);
  const isPicked = (i: number, outlier: boolean) => picked[i] ?? outlier;
  const chosen = rows.filter((r) => isPicked(r.i, r.outlier));

  return (
    <div className="space-y-4">
      <FormGrid className="max-w-3xl">
        <Field label="Creator handle" hint="Used when the sheet has no handle column">
          <Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@creator" />
        </Field>
        <Field label="Their followers" hint="Used when the sheet has no follower column">
          <Input type="number" min={0} value={followers} onChange={(e) => setFollowers(e.target.value)} className="max-w-48" />
        </Field>
        <Field label="Niche keyword">
          <Input value={niche} onChange={(e) => setNiche(e.target.value)} />
        </Field>
        <Field label="Paste CSV or TSV" hint="First row is headers">
          <Textarea
            rows={6}
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setOverride({});
              setPicked({});
            }}
            className="font-mono text-[12px]"
          />
        </Field>
      </FormGrid>

      {sheet.headers.length ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 max-w-4xl">
          {KEYS.map(([k, label]) => (
            <label key={k} className="block">
              <span className="t-label block mb-1">{label}</span>
              <Select value={map[k] ?? ""} onChange={(e) => setOverride((o) => ({ ...o, [k]: e.target.value === "" ? null : Number(e.target.value) }))}>
                <option value="">—</option>
                {sheet.headers.map((h, i) => (
                  <option key={i} value={i}>
                    {h || `Column ${i + 1}`}
                  </option>
                ))}
              </Select>
            </label>
          ))}
        </div>
      ) : null}

      {sheet.headers.length && map.views === null ? <Caption tone="alert">Pick the views column.</Caption> : null}
      {map.views !== null && map.followers === null && !Number(followers) ? <Caption>Enter their follower count to compute multiples.</Caption> : null}

      {rows.length ? (
        <>
          <Caption>
            {rows.length} rows · {rows.filter((r) => r.outlier).length} at {threshold}× or more · {chosen.length} selected
          </Caption>
          <div className="max-h-[420px] overflow-y-auto border-y border-rule">
            <Table>
              <THead>
                <TH className="w-8"> </TH>
                <TH>Handle</TH>
                <TH>Link</TH>
                <TH align="right">Views</TH>
                <TH align="right">Followers</TH>
                <TH align="right">Multiple</TH>
              </THead>
              <tbody>
                {rows.map((r) => (
                  <TR key={r.i} className={cx(!isPicked(r.i, r.outlier) && "text-fg-3")}>
                    <TD>
                      <input type="checkbox" checked={isPicked(r.i, r.outlier)} onChange={(e) => setPicked((p) => ({ ...p, [r.i]: e.target.checked }))} aria-label={`Select row ${r.i + 1}`} className="accent-[var(--pink)]" />
                    </TD>
                    <TD>{r.handle || "—"}</TD>
                    <TD className="max-w-[280px] truncate">{r.link || r.caption || `Row ${r.i + 1}`}</TD>
                    <TD align="right">{r.views.toLocaleString("en-IN")}</TD>
                    <TD align="right">{r.followers ? r.followers.toLocaleString("en-IN") : "—"}</TD>
                    <TD align="right" className={r.outlier ? "font-semibold" : undefined}>
                      {r.multiple.toFixed(1)}×
                    </TD>
                  </TR>
                ))}
              </tbody>
            </Table>
          </div>
          <ActionForm action={importOutliers}>
            <input type="hidden" name="nicheKeyword" value={niche} />
            <input type="hidden" name="rows" value={JSON.stringify(chosen.map((r) => ({ creatorHandle: r.handle, link: r.link, followerCount: r.followers, views: r.views, notes: r.caption })))} />
            <SubmitButton variant="plain">{`Save ${chosen.length} ${chosen.length === 1 ? "row" : "rows"}`}</SubmitButton>
          </ActionForm>
        </>
      ) : null}
    </div>
  );
}
