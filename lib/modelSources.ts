// Where to look up real 3D models for a topic when the primitive "diagram"
// isn't enough. All sources here are free and vendor-neutral (no Anthropic /
// no paid lock-in), and everything is hostable by anyone.
//
// Programmatic source (used by /api/find-model when a key is set):
//   • Poly Pizza  — https://poly.pizza  (free API key at https://poly.pizza/api)
//       Returns CC-licensed glTF/GLB models with direct download URLs.
//
// Good manual libraries to pull topic-accurate GLB/glTF from (drop a URL into a
// course's lesson.asset.url, or extend CURATED below):
//   • NASA 3D Resources      https://nasa3d.arc.nasa.gov         (public domain — space, planets, craft)
//   • NIH 3D                 https://3d.nih.gov                  (CC0 — anatomy, cells, molecules)
//   • Smithsonian 3D         https://3d.si.edu                   (CC0 — artifacts, fossils, specimens)
//   • Sketchfab (downloadable/CC filter)  https://sketchfab.com  (huge; respect each model's licence)
//   • Wikimedia Commons (3D) https://commons.wikimedia.org       (CC/public-domain glb/stl)
//   • Khronos glTF Sample Assets  (generic test models, CORS-friendly)
//
// Loading note: GLBs are loaded through /api/model-proxy so cross-origin models
// render without CORS errors (the proxy allow-lists trusted hosts).

export interface FoundModel {
  url: string; // direct glTF/GLB URL
  name: string;
  credit?: string; // attribution string ("Author on Source, licence")
  source: string;
}

/** Hand-picked, known-good models for common topics. Keys are lowercase
 *  keywords matched against the search query. Add freely. */
export const CURATED: { keywords: string[]; model: FoundModel }[] = [
  // Example slot — fill with verified public-domain GLB URLs as you find them.
  // {
  //   keywords: ["solar system", "planets", "sun"],
  //   model: {
  //     url: "https://.../solar-system.glb",
  //     name: "Solar System",
  //     credit: "NASA, public domain",
  //     source: "NASA 3D Resources",
  //   },
  // },
];

/** Hosts the model proxy is allowed to fetch from (prevents SSRF). */
export const ALLOWED_MODEL_HOSTS = [
  "poly.pizza",
  "static.poly.pizza",
  "cdn.poly.pizza",
  "nasa3d.arc.nasa.gov",
  "3d.nih.gov",
  "3d.si.edu",
  "raw.githubusercontent.com",
  "cdn.jsdelivr.net",
  "commons.wikimedia.org",
  "upload.wikimedia.org",
];

export function isAllowedModelHost(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return ALLOWED_MODEL_HOSTS.some((a) => h === a || h.endsWith(`.${a}`));
  } catch {
    return false;
  }
}

export function findCurated(query: string): FoundModel | null {
  const q = query.toLowerCase();
  for (const entry of CURATED) {
    if (entry.keywords.some((k) => q.includes(k))) return entry.model;
  }
  return null;
}
