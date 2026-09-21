import { EmptyState, PageTemplate, ChoiceList } from "@/components/PageTemplate";
import { getCatalog, displayKey } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const catalog = await getCatalog();
  return <PageTemplate eyebrow="One little step at a time" title="Let’s explore." intro="Choose a level to get started." crumbs={[{ label: "Home", href: "/" }, { label: "Catalog" }]}>
    {catalog.levels.length ? <ChoiceList items={catalog.levels.map((level) => ({ href: level.href, title: displayKey(level.level), detail: "Choose a subject →" }))} /> :
      <EmptyState title="A little room to grow"><p>No lessons have been added yet.</p><p>When they’re ready, you’ll find them here.</p></EmptyState>}
  </PageTemplate>;
}
