import { NextResponse } from "next/server";
import { voteForIdea } from "@/lib/github";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const issueNumber = parseInt(id, 10);
    if (isNaN(issueNumber)) {
      return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
    }

    await voteForIdea(issueNumber);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
