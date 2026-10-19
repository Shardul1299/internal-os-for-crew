import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "@fontsource/archivo-black/400.css";
import "@fontsource-variable/inter/index.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Snoball OS", template: "%s · Snoball OS" },
  description: "Crew by OWLED — system of record for creators, deals and partnerships.",
};

export const viewport: Viewport = { themeColor: "#0b0b0b", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";
  return (
    <html lang="en-IN" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
