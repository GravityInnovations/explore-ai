import Link from "next/link";
import type { ReactNode } from "react";
import { Illustration } from "./Illustration";

export type Crumb = { label: string; href?: string };

export function PageTemplate({ eyebrow, title, intro, crumbs, children }: {
  eyebrow: string; title: string; intro: string; crumbs: Crumb[]; children: ReactNode;
}) {
  return <div className="page-content">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><ol>{crumbs.map((crumb, index) => <li key={`${index}-${crumb.label}`}>
      {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
    </li>)}</ol></nav>
    <header className="page-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="intro">{intro}</p></header>
    {children}
  </div>;
}

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <section className="empty-state"><Illustration compact /><h2>{title}</h2><div className="muted">{children}</div></section>;
}

export function ChoiceList({ items }: { items: { href: string; title: string; detail: string }[] }) {
  return <ul className="choice-list">{items.map((item) => <li key={item.href}><Link className="choice" href={item.href}>
    <span><span className="choice-title">{item.title}</span><span className="choice-detail">{item.detail}</span></span><span className="choice-arrow" aria-hidden="true">→</span>
  </Link></li>)}</ul>;
}
