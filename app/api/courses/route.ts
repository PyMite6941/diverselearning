import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { Course, CourseCard } from "@/lib/types";

export const runtime = "nodejs";

// All course storage goes through this Clerk-gated route. The Supabase service
// key lives only on the server; every query is scoped to the Clerk user id.

interface Row {
  id: string;
  user_id: string;
  data: Course;
  layout: CourseCard["layout"] | null;
  created_at: string;
}

function cardFromRow(r: Row): CourseCard {
  const c = r.data;
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    topic: c.topic,
    level: c.level,
    accent: c.accent,
    lessonCount: c.lessons.length,
    createdAt: c.createdAt,
    layout: r.layout ?? undefined,
  };
}

async function requireUser() {
  const { userId } = await auth();
  return userId;
}

/** GET — list the signed-in user's courses (or ?id= for one course). */
export async function GET(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!supabaseAdmin)
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });

  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select("*")
      .eq("user_id", userId)
      .eq("id", id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ course: (data as Row | null)?.data ?? null });
  }

  const { data, error } = await supabaseAdmin
    .from("courses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const rows = (data ?? []) as Row[];
  return NextResponse.json({
    courses: rows.map((r) => r.data),
    cards: rows.map(cardFromRow),
  });
}

/** POST — upsert a full course (+ optional layout). */
export async function POST(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!supabaseAdmin)
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });

  const { course, layout } = (await req.json()) as {
    course: Course;
    layout?: CourseCard["layout"];
  };
  if (!course?.id)
    return NextResponse.json({ error: "Missing course" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("courses")
    .upsert({ id: course.id, user_id: userId, data: course, layout: layout ?? null });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** PATCH — update just the layout, or just the course data, for one course. */
export async function PATCH(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!supabaseAdmin)
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });

  const body = (await req.json()) as {
    id: string;
    layout?: CourseCard["layout"];
    data?: Course;
  };
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body.layout !== undefined) patch.layout = body.layout;
  if (body.data !== undefined) patch.data = body.data;
  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("courses")
    .update(patch)
    .eq("user_id", userId)
    .eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** DELETE — remove one course (?id=). */
export async function DELETE(req: NextRequest) {
  const userId = await requireUser();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!supabaseAdmin)
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("courses")
    .delete()
    .eq("user_id", userId)
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
