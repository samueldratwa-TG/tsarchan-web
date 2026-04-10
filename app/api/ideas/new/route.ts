import { NextResponse } from "next/server";
import { createIdea } from "@/lib/github";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`ideas:${ip}`, 5, 60 * 60 * 1000);

  if (!allowed) {
    return NextResponse.json(
      { error: "יותר מדי בקשות. נסו שוב מאוחר יותר." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { title, description, authorName, type } = body;

    if (!title || title.length < 10) {
      return NextResponse.json(
        { error: "הכותרת חייבת להכיל לפחות 10 תווים" },
        { status: 400 }
      );
    }

    if (!authorName) {
      return NextResponse.json({ error: "שם הוא שדה חובה" }, { status: 400 });
    }

    if (!["new-idea", "improvement"].includes(type)) {
      return NextResponse.json({ error: "סוג לא תקין" }, { status: 400 });
    }

    const idea = await createIdea(title, description || "", authorName, type);
    return NextResponse.json(idea, { status: 201 });
  } catch {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
