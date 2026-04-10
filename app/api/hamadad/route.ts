import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://hamadad.sadot.click/data/index.csv", {
      next: { revalidate: 1800 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch index data" },
        { status: 502 }
      );
    }

    const text = await res.text();
    const lines = text
      .trim()
      .split("\n")
      .filter((l) => l.trim());

    if (lines.length < 3) {
      return NextResponse.json(
        { error: "Not enough data rows" },
        { status: 502 }
      );
    }

    // Skip header, get last two rows
    const lastLine = lines[lines.length - 1];
    const prevLine = lines[lines.length - 2];

    const parseLine = (line: string) => {
      const parts = line.split(",");
      return { date: parts[0]?.trim(), value: parseFloat(parts[1]?.trim()) };
    };

    const current = parseLine(lastLine);
    const previous = parseLine(prevLine);

    if (isNaN(current.value) || isNaN(previous.value)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 502 }
      );
    }

    const change = current.value - previous.value;
    const changePercent =
      previous.value !== 0 ? (change / previous.value) * 100 : 0;

    // Format date to Hebrew
    const d = new Date(current.date);
    const months = [
      "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
      "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
    ];
    const hebrewDate = `${d.getDate()} ב${months[d.getMonth()]} ${d.getFullYear()}`;

    return NextResponse.json({
      currentValue: current.value,
      previousValue: previous.value,
      date: hebrewDate,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch index data" },
      { status: 502 }
    );
  }
}
