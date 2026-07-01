import { NextRequest, NextResponse } from "next/server";
import { generateCourse, CourseGenError } from "@/lib/courseGen";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Access is gated by Clerk middleware (this route is protected), so a
    // request here is already an authenticated user.
    const { topic, level } = await req.json();

    if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
      return NextResponse.json(
        { error: "Tell us what you'd like to learn (a topic or interest)." },
        { status: 400 }
      );
    }

    const course = await generateCourse(topic.trim(), level || "beginner");
    return NextResponse.json({ course });
  } catch (e) {
    if (e instanceof CourseGenError) {
      // 503 when unconfigured, 502 when the model failed to produce a course.
      const status = e.code === "no_provider" ? 503 : 502;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    return NextResponse.json(
      { error: (e as Error).message || "Generation failed." },
      { status: 500 }
    );
  }
}
