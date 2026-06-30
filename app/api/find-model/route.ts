import { NextRequest, NextResponse } from "next/server";
import { findCurated, type FoundModel } from "@/lib/modelSources";

export const runtime = "nodejs";

/**
 * Look up a real 3D model for a topic. Tries the curated registry first, then
 * Poly Pizza (free) if POLY_PIZZA_API_KEY is set. Returns a glTF/GLB URL the
 * client can load (through /api/model-proxy). Degrades gracefully: if nothing
 * is found the lesson simply keeps its diagram.
 */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 2) {
    return NextResponse.json({ error: "Missing query." }, { status: 400 });
  }

  const curated = findCurated(q);
  if (curated) return NextResponse.json({ model: curated });

  const key = process.env.POLY_PIZZA_API_KEY;
  if (key) {
    try {
      const res = await fetch(
        `https://api.poly.pizza/v1.1/search/${encodeURIComponent(q)}?limit=1`,
        { headers: { "x-auth-token": key } }
      );
      if (res.ok) {
        const data = await res.json();
        const hit = data?.results?.[0];
        const url = hit?.Download || hit?.download;
        if (url) {
          const model: FoundModel = {
            url,
            name: hit?.Title || q,
            credit: hit?.Attribution
              ? `${hit.Attribution} (Poly Pizza, CC-BY)`
              : "Poly Pizza, CC-BY",
            source: "Poly Pizza",
          };
          return NextResponse.json({ model });
        }
      }
    } catch {
      // fall through to "not found"
    }
  }

  return NextResponse.json({ model: null });
}
