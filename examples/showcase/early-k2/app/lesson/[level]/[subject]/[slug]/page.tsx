import { notFound } from "next/navigation";
import { PageTemplate } from "@/components/PageTemplate";
import { getCatalog, getLesson, displayKey } from "@/lib/catalog";
import { ButterflyLifeCycleLesson } from "@/components/ButterflyLifeCycleLesson";
import design from "@/design/profile.json";
import type { Design } from "../../../../../.agents/skills/explore-ai/types/design";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ level: string; subject: string; slug: string }> }) {
  const { level, subject, slug } = await params;
  const catalog = await getCatalog();
  const entry = catalog.entries.find((item) => item.level === level && item.subject === subject && item.slug === slug);
  if (!entry) notFound();
  const lesson = await getLesson(level, subject, slug);
  if (!lesson) notFound();
  const group = catalog.levels.find((item) => item.level === level)!;
  const selected = group.subjects.find((item) => item.subject === subject)!;
  return <PageTemplate eyebrow="ExploreAI lesson" title={entry.title} intro="A space to explore at your own pace." crumbs={[{ label: "Home", href: "/" }, { label: "Catalog", href: "/catalog" }, { label: displayKey(level), href: group.href }, { label: displayKey(subject), href: selected.href }, { label: entry.title }]}>
    <ButterflyLifeCycleLesson lesson={lesson} design={design as unknown as Design} />
  </PageTemplate>;
}
