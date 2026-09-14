export type CatalogEntry = {
  level: string;
  subject: string;
  topicKey: string;
  slug: string;
  lessonId: string;
  route: string;
  title: string;
};

export function buildCatalogRoutes(entries: readonly CatalogEntry[]) {
  const levels = new Map<string, Map<string, CatalogEntry[]>>();
  for (const entry of entries) {
    const subjects = levels.get(entry.level) ?? new Map<string, CatalogEntry[]>();
    const lessons = subjects.get(entry.subject) ?? [];
    lessons.push(entry);
    lessons.sort((a, b) => a.route.localeCompare(b.route));
    subjects.set(entry.subject, lessons);
    levels.set(entry.level, subjects);
  }
  return [...levels.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([level, subjects]) => ({
    level,
    subjects: [...subjects.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([subject, lessons]) => ({ subject, lessons })),
  }));
}
