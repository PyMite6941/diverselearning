import { NextRequest, NextResponse } from "next/server";
import { isAllowedModelHost } from "@/lib/modelSources";

export const runtime = "nodejs";

/**
 * Streams a glTF/GLB from an allow-listed host through our origin so Three.js
 * can load cross-origin models without CORS errors. Host allow-list prevents
 * the proxy from being used to fetch arbitrary internal URLs (SSRF).
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url") || "";
  if (!isAllowedModelHost(url)) {
    return NextResponse.json({ error: "Host not allowed." }, { status: 400 });
  }

  try {
    const upstream = await fetch(url, { redirect: "follow" });
    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `Upstream ${upstream.status}` },
        { status: 502 }
      );
    }
    const contentType =
      upstream.headers.get("content-type") || "model/gltf-binary";
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message || "Proxy failed." },
      { status: 502 }
    );
  }
}
