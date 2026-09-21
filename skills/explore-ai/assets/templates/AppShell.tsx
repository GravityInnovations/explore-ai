import type { ReactNode } from "react";

export type AppShellProps = {
  title: string;
  currentRoute: string;
  children: ReactNode;
  navigation: readonly { label: string; href: string }[];
};

export const HOME_ROUTE = "/" as const;
export const CATALOG_ROUTE = "/catalog" as const;

/**
 * Shared target-project shell for Home, catalog and lesson entrypoints.
 * Apply the accepted project's typography, spacing and control tokens here;
 * route-specific composition belongs inside `children` only. Keep Home and
 * Catalog as separate pages when composing the application router.
 */
export function AppShell({
  title,
  currentRoute,
  children,
  navigation,
}: AppShellProps) {
  return (
    <div data-shell="explore-ai" data-route={currentRoute}>
      <header>
        <nav aria-label="Primary">
          {navigation.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <p>{title}</p>
      </header>
      <main>{children}</main>
    </div>
  );
}
