import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);

  if (!allowed) {
    return NextResponse.json(
      { error: "יותר מדי בקשות. נסו שוב מאוחר יותר." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { name, email, message, website } = body;

    // Honeypot check
    if (website) {
      return NextResponse.json({ success: true });
    }

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "כל השדות הם חובה" },
        { status: 400 }
      );
    }

    const resend = getResend();
    if (!resend) {
      return NextResponse.json({ error: "שירות האימייל לא מוגדר" }, { status: 503 });
    }

    await resend.emails.send({
      from: "הצרחן הנבון <onboarding@resend.dev>",
      to: "samuel.dratwa@gmail.com",
      subject: `פנייה מהאתר: ${name}`,
      text: `שם: ${name}\nאימייל: ${email}\n\nהודעה:\n${message}`,
      replyTo: email,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "שגיאה בשליחה" }, { status: 500 });
  }
}
