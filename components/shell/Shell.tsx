// The three-pane shell (sidebar 220 · content · inspector 320). Shared by Crew Desk and the portals.
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Sidebar, type SideItem } from "./Sidebar";
import { UndoProvider, CommandPalette, type Command } from "@/components/ui/client";
import { undoLast } from "@/lib/actions/undo";
import { signOutAction } from "@/lib/actions/auth";

export async function Shell({ items, user, role, commands, searchUrl, brand, children }: { items: SideItem[]; user: string; role: string; commands: Command[]; searchUrl?: string; brand?: string; children: ReactNode }) {
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";
  return (
    <UndoProvider undoAction={undoLast}>
      <div className="min-h-screen lg:flex">
        <Sidebar
          items={items}
          user={user}
          role={role}
          brand={brand}
          theme={theme}
          footer={
            <form action={signOutAction}>
              <button className="h-7 px-2 text-fg-3 hover:text-fg text-[12px]">Sign out</button>
            </form>
          }
        />
        <main id="main" className="flex-1 min-w-0 flex flex-col">
          {children}
        </main>
      </div>
      <CommandPalette commands={commands} searchUrl={searchUrl} />
    </UndoProvider>
  );
}
