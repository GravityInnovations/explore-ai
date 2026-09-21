export type CatalogEntry = {
  level: string;
  subject: string;
  topicKey: string;
  slug: string;
  lessonId: string;
  route: string;
  title: string;
};

export type CatalogSubjectRoute = {
  subject: string;
  href: string;
  lessons: readonly CatalogEntry[];
};

export type CatalogLevelRoute = {
  level: string;
  href: string;
  subjects: readonly CatalogSubjectRoute[];
};

export type CatalogRouteModel = {
  home: { href: "/" };
  catalog: { href: "/catalog" };
  levels: readonly CatalogLevelRoute[];
};

export function catalogLevelRoute(level: string) {
  return `/catalog/${level}`;
}

export function catalogSubjectRoute(level: string, subject: string) {
  return `/catalog/${level}/${subject}`;
}

export function catalogLessonRoute(entry: Pick<CatalogEntry, "route">) {
  return `/lesson/${entry.route}`;
}

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
  return {
    home: { href: "/" },
    catalog: { href: "/catalog" },
    levels: [...levels.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([level, subjects]) => ({
      level,
      href: catalogLevelRoute(level),
      subjects: [...subjects.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([subject, lessons]) => ({
        subject,
        href: catalogSubjectRoute(level, subject),
        lessons,
      })),
    })),
  } satisfies CatalogRouteModel;
}
