import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const template = new URL("../skills/explore-ai/assets/templates/CatalogRoutes.ts", import.meta.url);

test("catalog route template keeps Home, Catalog, level, subject and lesson routes distinct", async () => {
  const source = await readFile(template, "utf8");
  assert.ok(source.includes('home: { href: "/" }'));
  assert.ok(source.includes('catalog: { href: "/catalog" }'));
  assert.ok(source.includes('return `/catalog/${level}`'));
  assert.ok(source.includes('return `/catalog/${level}/${subject}`'));
  assert.ok(source.includes('return `/lesson/${entry.route}`'));
  assert.ok(!source.includes('lesson.*href: "/"'));
});
