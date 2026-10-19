// Inbound email webhook — the v1 Gmail capture path (BRIEF §6.1, §11). Gmail forwards brand mail to a
// per-creator address `<handle>@<domain>`; the forwarder POSTs JSON here and the thread lands in the Inbox
// with a 24h SLA. Mail to any other address is addressed to Crew. Communication only.
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import * as s from "@/lib/db/schema";
import { getConfig } from "@/lib/settings";
import { slaDueAt, routeInbound } from "@/lib/rules/inbox";
import { brandForSender, creatorHandles, inboundDomain } from "@/lib/queries/inbox";

export const dynamic = "force-dynamic";

const Body = z.object({
  to: z.string().min(3).max(1000),
  from: z.string().min(3).max(320),
  fromName: z.string().max(200).optional().nullable(),
  subject: z.string().max(500).optional().nullable(),
  text: z.string().min(1).max(50_000),
});

function secretOk(given: string | null): boolean {
  const want = process.env.INBOUND_EMAIL_SECRET;
  if (!want || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  if (!process.env.INBOUND_EMAIL_SECRET) return NextResponse.json({ error: "Inbound email is not configured" }, { status: 503 });
  if (!secretOk(req.headers.get("x-inbound-secret"))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Expected {to, from, fromName, subject, text}" }, { status: 400 });
  const m = parsed.data;
  const cfg = await getConfig();
  const [creatorId, brandId] = await Promise.all([creatorHandles().then((c) => routeInbound(m.to, inboundDomain(), c)), brandForSender(m.from)]);
  const receivedAt = new Date();
  const fromAddress = m.from.match(/[^\s<>"]+@[^\s<>"]+/)?.[0] ?? m.from;
  const [row] = await db
    .insert(s.inboxThreads)
    .values({
      channel: "email",
      creatorId,
      brandId,
      fromName: m.fromName?.trim() || fromAddress,
      fromAddress,
      subject: m.subject?.trim() ?? "",
      firstMessageMd: m.text.trim(),
      receivedAt,
      slaDueAt: slaDueAt(cfg, receivedAt),
      status: "new",
      createdBy: "inbound-email",
    })
    .returning({ id: s.inboxThreads.id });
  return NextResponse.json({ id: row.id, routedTo: creatorId ? "creator" : "crew" }, { status: 201 });
}
