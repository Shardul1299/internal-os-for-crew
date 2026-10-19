import type { ReactNode } from "react";
import { ScreenHeader, Caption } from "@/components/ui";
import { SettingsNav } from "./SettingsNav";

/** One title for every Settings section; the section's one action sits on the right. */
export function SettingsHeader({ action, readOnly, caption }: { action?: ReactNode; readOnly?: boolean; caption?: ReactNode }) {
  return (
    <>
      <ScreenHeader title="Settings" action={action}>
        {readOnly ? <Caption>Read only — only the Owner changes this.</Caption> : caption ? <Caption>{caption}</Caption> : null}
      </ScreenHeader>
      <SettingsNav />
    </>
  );
}
