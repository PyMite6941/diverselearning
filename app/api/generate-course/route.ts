import { NextRequest, NextResponse } from "next/server";
import { generateCourse, CourseGenError } from "@/lib/courseGen";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { topic, level, invite } = await req.json();

    if (!topic || typeof topic !== "string" || topic.trim().length < 2) {
      return NextResponse.json(
        { error: "Tell us what you'd like to learn (a topic or interest)." },
        { status: 400 }
      );
    }

    // Optional lightweight invite gate for "a few people" hosting.
    const codes = (process.env.DL_INVITE_CODES || "")
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (codes.length > 0 && !codes.includes(String(invite || "").trim())) {
      return NextResponse.json({ error: "Invalid invite code." }, { status: 401 });
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
