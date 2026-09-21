import Link from "next/link";
import { EmptyState, PageTemplate } from "@/components/PageTemplate";
import { LessonTemplatePreview } from "@/components/LessonTemplate";

export const metadata = { title: "Design preview · ExploreAI", robots: { index: false, follow: false } };

export default function DesignPreview() {
  return <PageTemplate eyebrow="Shared visual template" title="A space for the design." intro="Preview only. No lessons or catalog entries have been added. Design QA and acceptance are still pending." crumbs={[{ label: "Home", href: "/" }, { label: "Design preview" }]}>
    <div className="preview-links"><Link className="button primary" href="/">View Home</Link><Link className="button" href="/catalog">View Catalog</Link></div>
    <section className="preview-section" aria-labelledby="level-preview"><p className="preview-label">Level page template</p><h2 id="level-preview">Choose a subject</h2><p>Only subjects with real lessons will appear.</p><EmptyState title="No subjects yet"><p>This space fills from the catalog.</p></EmptyState></section>
    <section className="preview-section" aria-labelledby="subject-preview"><p className="preview-label">Subject page template</p><h2 id="subject-preview">Choose a lesson</h2><p>Only lessons for the selected level and subject will appear.</p><EmptyState title="No lessons yet"><p>Nothing has been added here.</p></EmptyState></section>
    <section className="preview-section" aria-labelledby="lesson-preview"><p className="preview-label">Lesson page template</p><h2 id="lesson-preview">One stage. Little steps.</h2><p>Try the controls or scroll to view the decorative form. This is a material and layout study, not a teaching activity.</p><LessonTemplatePreview /></section>
  </PageTemplate>;
}
