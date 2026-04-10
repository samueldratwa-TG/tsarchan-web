import { NextResponse } from "next/server";
import { claimIdea } from "@/lib/github";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { claimerName } = body;

    if (!claimerName) {
      return NextResponse.json({ error: "שם הוא שדה חובה" }, { status: 400 });
    }

    const issueNumber = parseInt(id, 10);
    if (isNaN(issueNumber)) {
      return NextResponse.json({ error: "מזהה לא תקין" }, { status: 400 });
    }

    await claimIdea(issueNumber, claimerName);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
