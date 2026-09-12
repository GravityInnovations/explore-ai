export function fixture() {
  const config = {
    schemaVersion: "2.0.0",
    paths: {
      design: "design/profile.json",
      content: "content",
      assetLibrary: "asset-library",
      publicAssets: "public/explain-ai",
      runtime: "explain-ai.runtime.json",
      catalog: "catalog/index.json",
    },
  };
  const design = {
    schemaVersion: "2.0.0",
    id: "test-profile",
    audience: "Technical test fixture",
    lessonColorStrategyDefault: "theme",
    evidence: [
      {
        source: "test input",
        observation: "High contrast schematic fixture",
        kind: "user-choice",
      },
    ],
    typography: {
      headingFamily: "sans-serif",
      bodyFamily: "sans-serif",
      baseSize: 16,
      lineHeight: 1.5,
    },
    spacing: { unit: 8, contentWidth: 800 },
    colors: {
      background: "#ffffff",
      text: "#111111",
      accent: "#1144aa",
      muted: "#555555",
    },
    materials: {
      base: { color: "#1144aa", roughness: 0.7, metalness: 0, opacity: 1 },
    },
    lighting: { style: "soft", intensity: 1, shadows: false },
    shape: { style: "simple", edges: "rounded", realism: "schematic" },
    motion: {
      duration: 0.5,
      easing: "sine.inOut",
      ambient: false,
      scrollUnits: 1,
    },
    camera: { default: "best", expressiveness: "restrained" },
    highlighting: {
      color: "#1144aa",
      surroundingOpacity: 0.2,
      useLabels: true,
    },
    labels: { size: 16, style: "plain" },
    mobile: {
      priority: "readable text",
      maxPixelRatio: 1.5,
      simplifyEffects: true,
    },
    accessibility: {
      reducedMotion: "static-steps",
      fallback: "text",
      minimumContrast: 4.5,
    },
  };
  const index = { schemaVersion: "2.0.0", assets: [] };
  const runtime = {
    schemaVersion: "2.0.0",
    actions: ["highlight", "focus", "compare", "hide", "reveal", "cutaway"],
    cameraModes: ["wide", "close", "best"],
    components: [
      {
        id: "box",
        actions: ["highlight", "focus", "compare", "hide", "reveal", "cutaway"],
      },
    ],
  };
  const lesson = {
    schemaVersion: "2.0.0",
    lessonId: "k1/maths/shape",
    level: "k1",
    subject: "maths",
    topicKey: "shape",
    slug: "shape",
    title: "Shape",
    designId: design.id,
    metadata: {
      summary: "A fixture showing a part",
      objectives: ["Identify the marked part"],
      sources: [],
      colorStrategy: "imitated",
    },
    objects: [
      {
        id: "shape",
        component: "box",
        label: "Shape",
        description: "A whole shape",
        material: "base",
      },
      {
        id: "shape.part",
        parent: "shape",
        component: "box",
        label: "Part",
        description: "Marked part",
      },
    ],
    steps: [
      {
        id: "part",
        title: "The part",
        text: "Look at this part.",
        explains: ["shape.part"],
        actions: [{ action: "highlight", target: "shape.part" }],
        camera: { mode: "close", target: "shape.part" },
        alt: "The marked part of the shape is emphasised.",
      },
    ],
    accessibility: { summary: "Identify a marked part of a shape." },
  };
  return { config, design, index, runtime, lesson };
}
