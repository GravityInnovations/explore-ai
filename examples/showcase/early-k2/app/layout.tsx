import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { CSSProperties } from "react";
import "@fontsource/fredoka/400.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/nunito-sans/400.css";
import "@fontsource/nunito-sans/700.css";
import profile from "@/design/profile.json";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExploreAI Early K–2",
  description: "A little space for big curiosity. ExploreAI for Kindergarten through Grade 2.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{
        "--background": profile.colors.background, "--text": profile.colors.text,
        "--accent": profile.colors.accent, "--muted": profile.colors.muted,
        "--heading-font": profile.typography.headingFamily, "--body-font": profile.typography.bodyFamily,
        "--base-size": `${profile.typography.baseSize}px`, "--line-height": profile.typography.lineHeight,
        "--unit": `${profile.spacing.unit}px`, "--content-width": `${profile.spacing.contentWidth}px`,
        "--duration": `${profile.motion.duration}s`, "--label-size": `${profile.labels.size}px`,
      } as CSSProperties}><AppShell>{children}</AppShell></body>
    </html>
  );
}
