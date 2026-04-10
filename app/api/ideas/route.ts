import { NextResponse } from "next/server";
import { listIdeas } from "@/lib/github";

export async function GET() {
  try {
    const ideas = await listIdeas();
    return NextResponse.json(ideas);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
