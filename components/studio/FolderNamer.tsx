"use client";
// Batch folder namer (BRIEF §19.9): YYYY-MM-DD_topic-slug/
import { useState } from "react";
import { Input } from "@/components/ui";
import { CopyButton } from "@/components/ui/client";
import { folderName } from "@/lib/studio/parse";

export function FolderNamer({ today, topic = "" }: { today: string; topic?: string }) {
  const [d, setD] = useState(today);
  const [t, setT] = useState(topic);
  const name = folderName(d, t);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[160px_1fr] gap-2">
        <Input type="date" value={d} onChange={(e) => setD(e.target.value)} aria-label="Shoot date" />
        <Input value={t} onChange={(e) => setT(e.target.value)} placeholder="Topic" aria-label="Topic" />
      </div>
      <div className="flex items-center gap-2">
        <code className="flex-1 h-9 px-3 bg-block flex items-center font-mono text-[12px] truncate">{name}</code>
        <CopyButton text={name} label="Copy" />
      </div>
    </div>
  );
}
