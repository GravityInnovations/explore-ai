import { notFound } from "next/navigation";
import { PageTemplate, ChoiceList } from "@/components/PageTemplate";
import { getCatalog, displayKey } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  const group = (await getCatalog()).levels.find((item) => item.level === level);
  if (!group) notFound();
  return <PageTemplate eyebrow="Choose a subject" title={displayKey(group.level)} intro="What would you like to explore?" crumbs={[{ label: "Home", href: "/" }, { label: "Catalog", href: "/catalog" }, { label: displayKey(group.level) }]}>
    <ChoiceList items={group.subjects.map((subject) => ({ href: subject.href, title: displayKey(subject.subject), detail: "Find a lesson →" }))} />
  </PageTemplate>;
}
