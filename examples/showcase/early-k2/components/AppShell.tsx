"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Project styling of the installed ExploreAI AppShell contract.
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div data-shell="explore-ai" data-route={pathname}>
      <a className="skip-link" href="#main">Skip to page</a>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="ExploreAI home">Explore<span>AI</span><span className="brand-dot" aria-hidden="true" /></Link>
        <nav aria-label="Primary">
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
          <Link href="/catalog" aria-current={pathname.startsWith("/catalog") ? "page" : undefined}>Catalog</Link>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>{children}</main>
      <footer className="site-footer"><span>ExploreAI <span aria-hidden="true">·</span> Early K–2</span><Link href="/design-preview">Design preview</Link></footer>
    </div>
  );
}
