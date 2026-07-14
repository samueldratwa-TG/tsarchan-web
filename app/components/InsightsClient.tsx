'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type PriceRow = Record<string, string | number>;

interface ProductMeta {
  id: string;
  name: string;
}

interface ChainGapItem {
  id: string;
  name: string;
  gap_pct: number;
  cheapest_chain: string;
  cheapest_price: number;
  expensive_chain: string;
  expensive_price: number;
}

interface Props {
  priceData: PriceRow[];
  productMeta: ProductMeta[];
  chainGaps: ChainGapItem[];
  universalCount: number;
  mappedCount: number;
}

const chainNamesHe: Record<string, string> = {
  shufersal: 'שופרסל', rami_levy: 'רמי לוי', yohananof: 'יוחננוף',
  victory: 'ויקטורי', osher_ad: 'אושר עד', hazi_hinam: 'חצי חינם',
  tiv_taam: 'טיב טעם', yayno_bitan_and_carrefour: 'קרפור',
};

const HE_MONTHS = ['', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

function toHebrewDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${parseInt(d)} ב${HE_MONTHS[parseInt(m)]} ${y}`;
}

const DEFAULT_DATE = '2026-01-01';

export function InsightsClient({ priceData, productMeta, chainGaps, universalCount, mappedCount }: Props) {
  const latestRow = priceData[priceData.length - 1];
  const latestDate = latestRow?.date as string;

  const availableDates = useMemo(() =>
    priceData
      .map(r => r.date as string)
      .filter(d => d !== latestDate)
      .sort()
  , [priceData, latestDate]);

  const [selectedDate, setSelectedDate] = useState(
    availableDates.includes(DEFAULT_DATE) ? DEFAULT_DATE : availableDates[availableDates.length - 1]
  );

  const baseRow = useMemo(
    () => priceData.find(r => r.date === selectedDate),
    [priceData, selectedDate]
  );

  const changes = useMemo(() => {
    if (!baseRow || !latestRow) return [];
    return productMeta.map(p => {
      const base = baseRow[p.id] as number;
      const current = latestRow[p.id] as number;
      if (!base || !current || base <= 0 || current <= 0) return null;
      const change_pct = Math.round(((current - base) / base) * 1000) / 10;
      return { id: p.id, name: p.name, base, current, change_pct };
    }).filter(Boolean) as { id: string; name: string; base: number; current: number; change_pct: number }[];
  }, [baseRow, latestRow, productMeta]);

  // Filter to REAL increases — without it, when fewer than 8 products rose the
  // panel back-fills with the least-negative decreases (rendered green inside
  // the red "increases" panel).
  const increases = useMemo(() =>
    [...changes].filter(c => c.change_pct > 0).sort((a, b) => b.change_pct - a.change_pct).slice(0, 8)
  , [changes]);

  const decreases = useMemo(() =>
    [...changes].filter(c => c.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct).slice(0, 8)
  , [changes]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">&rarr; חזרה לדף הראשי</Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">תובנות והשוואות</h1>
      <p className="text-gray-500 mb-6">ניתוחים והשוואות מעמיקות המבוססים על 37 מוצרים ב-8 רשתות</p>

      {/* Date picker */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-blue-900">השוואה מאז:</span>
        <select
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="בחר תאריך התחלה להשוואה"
        >
          {availableDates.map(d => (
            <option key={d} value={d}>{toHebrewDate(d)}</option>
          ))}
        </select>
        <span className="text-xs text-blue-600 mr-1">עד {toHebrewDate(latestDate)}</span>
      </div>

      {/* Increases / Decreases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-4">התייקרויות הכי גדולות</h2>
          <div className="space-y-3">
            {increases.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{i + 1}.</span>
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{item.base.toFixed(2)} &larr; {item.current.toFixed(2)}</span>
                  <span className={`font-bold text-sm px-2 py-0.5 rounded ${item.change_pct >= 0 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                    {item.change_pct >= 0 ? '+' : ''}{item.change_pct}%
                  </span>
                </div>
              </div>
            ))}
            {increases.length === 0 && (
              <p className="text-sm text-gray-400">אין נתונים לתאריך זה</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-green-700 mb-4">הוזלות הכי גדולות</h2>
          <div className="space-y-3">
            {decreases.map((item, i) => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">{i + 1}.</span>
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{item.base.toFixed(2)} &larr; {item.current.toFixed(2)}</span>
                  <span className="text-green-600 font-bold text-sm bg-green-50 px-2 py-0.5 rounded">
                    {item.change_pct}%
                  </span>
                </div>
              </div>
            ))}
            {decreases.length === 0 && (
              <p className="text-sm text-gray-400">אין הוזלות משמעותיות בתקופה זו</p>
            )}
          </div>
        </div>
      </div>

      {/* Chain gaps */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-amber-700 mb-2">פערי מחירים גדולים בין הרשתות</h2>
        <p className="text-xs text-gray-400 mb-4">אותו מוצר זהה, מחיר שונה — על בסיס מחירים עדכניים</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-right py-2 px-3 font-semibold">מוצר</th>
                <th className="text-center py-2 px-3 font-semibold text-green-700">הכי זול</th>
                <th className="text-center py-2 px-3 font-semibold text-red-600">הכי יקר</th>
                <th className="text-center py-2 px-3 font-semibold">פער</th>
              </tr>
            </thead>
            <tbody>
              {chainGaps.slice(0, 15).map(item => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3">{item.name}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-green-700 font-medium">{item.cheapest_price.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 block">{chainNamesHe[item.cheapest_chain] || item.cheapest_chain}</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-red-600 font-medium">{item.expensive_price.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 block">{chainNamesHe[item.expensive_chain] || item.expensive_chain}</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-xs">{item.gap_pct}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-5">שאלות נפוצות</h2>
        <div className="space-y-5 text-sm">
          <div>
            <p className="font-semibold text-gray-800 mb-1">למה לא ניתן לבחור תאריך לפני דצמבר 2025?</p>
            <p className="text-gray-600 leading-relaxed">
              הרשתות מפרסמות מחירים עם שדה &quot;תאריך עדכון אחרון&quot;. אנחנו משחזרים מכך סדרה יומית —
              אבל בחודשים יוני–נובמבר 2025 מעט מאוד עדכונים שוחזרו, ולכן הגרף שטוח ולא
              מייצג תנועה אמיתית. מדצמבר 2025 יש מספיק נתונים כדי שהמספרים יהיו אמינים.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">האם 37 המוצרים זהים בכל הרשתות?</p>
            <p className="text-gray-600 leading-relaxed">
              חלק מהמוצרים ({universalCount} מתוך {universalCount + mappedCount}) הם מותגים לאומיים עם ברקוד GS1 אחיד — אותו ברקוד
              בשופרסל, ברמי לוי ובכל שאר הרשתות. {mappedCount} המוצרים הנותרים (ירקות ופירות טריים במשקל,
              וכן מוצרים שהברקוד הזמין שלהם שונה בין הרשתות) ממופים ידנית לפי קוד נפרד בכל רשת.{' '}
              <Link href="/methodology" className="text-blue-600 hover:text-blue-800 underline">
                קראו עוד על נושא הברקודים בעמוד המתודולוגיה
              </Link>.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">פערי המחירים בין הרשתות — האם הם מושפעים מבחירת התאריך?</p>
            <p className="text-gray-600 leading-relaxed">
              לא — עמודת הפערים מחושבת תמיד על בסיס המחירים העדכניים ביותר, ואינה קשורה
              לתאריך ההתחלה שבחרתם.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
