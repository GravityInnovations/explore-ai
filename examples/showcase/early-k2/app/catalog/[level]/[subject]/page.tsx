import { notFound } from "next/navigation";
import { PageTemplate, ChoiceList } from "@/components/PageTemplate";
import { getCatalog, displayKey, catalogLessonRoute } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function SubjectPage({ params }: { params: Promise<{ level: string; subject: string }> }) {
  const { level, subject } = await params;
  const group = (await getCatalog()).levels.find((item) => item.level === level);
  const selected = group?.subjects.find((item) => item.subject === subject);
  if (!group || !selected) notFound();
  return <PageTemplate eyebrow="Choose a lesson" title={displayKey(selected.subject)} intro="Pick a lesson. Take it at your own pace." crumbs={[{ label: "Home", href: "/" }, { label: "Catalog", href: "/catalog" }, { label: displayKey(group.level), href: group.href }, { label: displayKey(selected.subject) }]}>
    <ChoiceList items={selected.lessons.map((lesson) => ({ href: catalogLessonRoute(lesson), title: lesson.title, detail: "Explore this lesson →" }))} />
  </PageTemplate>;
}
