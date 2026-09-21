# ExploreAI showcase products

This directory contains independent, age-targeted ExploreAI showcase products. Each child is its own runnable Next.js project with its own local skill installation, dependencies, design profile, catalog and lesson content.

## Product boundaries

| Product | Audience | Status |
| --- | --- | --- |
| `early-k2/` | Kindergarten–Grade 2, approximately ages 5–7 | Scaffold prepared; design and lessons pending — #51 |
| `primary-3-5/` | Grades 3–5 | Not started — #52 |
| `middle-6-8/` | Grades 6–8 | Not started — #53 |
| `secondary-9-12/` | Grades 9–12 | Not started — #54 |

Every child must remain independent and must use the shared ExploreAI product-shell contract:

```text
/                                  Home
/catalog                           Catalog
/catalog/<level>                   Level
/catalog/<level>/<subject>         Subject
/lesson/<level>/<subject>/<slug>   Lesson
```

The catalog is additive and filesystem-backed. Empty catalogs are valid; they must not contain fabricated lessons. Do not use or modify `examples/playground/` for showcase work.
