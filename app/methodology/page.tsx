import { Footer } from "../components/Footer";
import Link from "next/link";

export default function MethodologyPage() {
  return (
    <>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">&rarr; חזרה לדף הראשי</Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">מתודולוגיה</h1>
        <p className="text-gray-500 mb-10">איך המדד עובד, מאיפה מגיעים הנתונים, ולמה 37 מוצרים זה לא פשוט כמו שזה נשמע</p>

        {/* Section 1: Data source */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-r-4 border-blue-500 pr-3">מקור הנתונים</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            חוק פרסום מחירי מצרכי מזון (2014) מחייב את רשתות הסופרמרקט הגדולות לפרסם קובץ XML מדי יום
            עם המחיר הנוכחי של כל מוצר בכל סניף. הקבצים האלה זמינים לציבור, ופרויקט{' '}
            <a href="https://www.kaggle.com/datasets/erlichsefi/israeli-supermarkets-2024" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
              Israeli Supermarkets (Kaggle)
            </a>{' '}
            מרכז אותם ומפרסם גרסה מאוחדת בפורמט CSV. אנחנו מורידים את הנתונים האלה מדי יום.
          </p>
          <p className="text-gray-600 leading-relaxed">
            כל קובץ CSV מכיל שורה אחת לכל מוצר בכל סניף, כולל שדה <code className="bg-gray-100 px-1 rounded text-sm">PriceUpdateDate</code> —
            תאריך העדכון האחרון של המחיר. שדה זה הוא הבסיס לשחזור הסדרה ההיסטורית.
          </p>
        </section>

        {/* Section 2: Barcode system */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-r-4 border-blue-500 pr-3">ברקודים: מה שאנשים לא יודעים</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            כשמשווים מחירים בין רשתות, הדבר הכי חשוב הוא לוודא שמשווים את <strong>אותו מוצר בדיוק</strong>.
            כאן הברקוד נכנס לתמונה — אבל הסיטואציה מסובכת יותר ממה שנדמה.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-800 mb-2">23 מוצרים — ברקוד אוניברסלי</h3>
              <p className="text-sm text-green-700 leading-relaxed">
                מותגים לאומיים (תנובה, אסם, יטבתה, עלית וכו') משתמשים בברקוד GS1 ייחודי
                המוגדר על ידי היצרן. ברקוד זה <strong>זהה בכל הרשתות</strong> — 7290004131074
                הוא תמיד חלב תנובה 3% קרטון 1 ליטר, לא משנה אם קנינו בשופרסל או בחצי חינם.
              </p>
              <p className="text-xs text-green-600 mt-2">
                דוגמאות: חלב, קוטג', גבינה, חמאה, אורז, סוכר, קולה, קפה, במבה, שוקולד
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800 mb-2">14 מוצרים — ברקוד לפי רשת</h3>
              <p className="text-sm text-orange-700 leading-relaxed">
                שני מקרים מחייבים מיפוי פרטני לכל רשת: (1) פירות, ירקות ועוף טרי הנמכרים
                <strong> לפי משקל</strong> — כל רשת מקצה <strong>קוד PLU משלה</strong> (ברמי לוי
                עגבניה היא קוד X, בשופרסל קוד Y); (2) מוצרים ארוזים שהברקוד ה&quot;אוניברסלי&quot; שלהם
                <strong> חסר או ללא מחיר</strong> בחלק מהרשתות — אז ממפים כל רשת לפריט המקביל שלה.
              </p>
              <p className="text-xs text-orange-600 mt-2">
                דוגמאות: עגבניה, מלפפון, בצל, גזר, תפוח, תפוח אדמה, חזה עוף, לחם, ספגטי, טחינה, חומוס, תה, ביצים, אפונה קפואה
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">למה זה משנה?</p>
            <p className="leading-relaxed">
              כאשר בונים סל קניות להשוואה בין-רשתית, אי אפשר לחפש &quot;עגבניה&quot; לפי ברקוד אחד בכל
              הרשתות — צריך לדעת את הקוד הספציפי שכל רשת השתמשה בו. עבור 14 המוצרים האלה,
              בנינו מיפוי ידני לכל רשת בנפרד. עבור 23 המוצרים הנותרים, ברקוד אחד מספיק.
            </p>
          </div>
        </section>

        {/* Section 3: How the index is built */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-r-4 border-blue-500 pr-3">איך בונים מדד יומי מנתונים מ-8 רשתות?</h2>
          <ol className="space-y-4 text-gray-600">
            <li className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-medium text-gray-700">מציאת מחיר היסטורי לכל מוצר בכל רשת</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  הקובץ היומי מכיל את המחיר הנוכחי + תאריך עדכונו. לכל מוצר, אנחנו אוספים את כל
                  הסניפים בכל הרשתות, ומשחזרים סדרת זמן: &quot;ב-3 בינואר הסניף הזה עדכן ל-X שקל&quot;.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-medium text-gray-700">ממוצע גיאומטרי לכל יום</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  לכל תאריך ולכל מוצר, לוקחים ממוצע גיאומטרי של המחירים מכל הרשתות שיש להן נתון.
                  ממוצע גיאומטרי (לעומת חשבוני) מגביל את ההשפעה של מוצר קיצוני אחד על כלל המדד.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-medium text-gray-700">סינון חריגים</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  חלק מהקבצים מכילים מחירים פגומים — לעתים ממוצרים &quot;במשקל&quot; עם מחיר של עשרות שקלים
                  לקילו שאינו מתעדכן מ-2019. סינון זה מוריד כל מחיר שגבוה מפי 4 מהמחיר השני-בזול
                  לאותו מוצר, ומסיר את ההשפעה שלו מהמדד.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
              <div>
                <p className="font-medium text-gray-700">חישוב מדד לפי תאריך בסיס</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  תאריך הבסיס הוא 15 ביוני 2025 = 100. כל יום מחושב ביחס לבסיס: אם סל המוצרים
                  עלה 2.5% מאז הבסיס, המדד מציג 102.5.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Section 4: Why data before December is less reliable */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-r-4 border-amber-500 pr-3">למה החודשים הראשונים (יוני–נובמבר 2025) פחות אמינים?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            השחזור ההיסטורי עובד טוב רק כשיש <strong>הרבה סניפים עם תאריכי עדכון שונים</strong>.
            כאשר 500 סניפים עדכנו את מחיר המלפפון בתאריכים שונים לאורך 6 חודשים —
            אנחנו &quot;רואים&quot; את תנועת המחיר בין כל עדכון.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4">
            הבעיה: בחודשים המוקדמים (יוני–נובמבר 2025), כשהדאטה עדיין היה דליל,
            מעט מאוד עדכונים שוחזרו לכל מוצר — ולכן הגרף שטוח באופן מלאכותי.
            <strong> זה לא אומר שהמחירים לא השתנו — זה אומר שאנחנו לא יכולים לראות את השינוי.</strong>
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">מה עשינו בשביל העתיד?</p>
            <p className="leading-relaxed">
              מה-30 במאי 2026, אנחנו שומרים <strong>snapshot יומי</strong> של מחיר 100 מוצרים
              בכל סניף בכל הרשתות. זה מאפשר לבנות סדרת זמן אמיתית שאינה מסתמכת על שחזור.
              עם הצבירה הזו, ניתוח השינויים יהיה מדויק יותר ככל שהזמן עובר.
            </p>
          </div>
        </section>

        {/* Section 5: Limitations */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-r-4 border-red-400 pr-3">מגבלות ידועות</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>חצי חינם שטוח:</strong> יש להם 13 סניפים בלבד עם עדכוני תאריך כמעט זהים — כך שהשחזור רואה אפס תנועה. המחירים שלהם מוצגים במדד, אך לא תורמים לשינוי היסטורי.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>ברקודים מתים / מחירי 2019:</strong> לחלק מהרשתות היה ברקוד &quot;בצל במשקל&quot; שמחירו לא עודכן מאז 2019, או ברקוד שכבר לא קיים בנתונים. מיפינו מחדש מוצרים כאלה לקוד הנכון בכל רשת (כך שהבצל, למשל, שוב מוצג בכל הרשתות), וסינון החריגים נשאר כרשת ביטחון.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>פערים בקובץ המחירים:</strong> לעיתים רשת מפרסמת מוצר ללא מחיר בקובץ ה-XML (למשל ספגטי אסם מס' 8 בשופרסל קיים בקטלוג אך ללא מחיר). במקרים כאלה אנחנו ממפים לפריט המקביל הקרוב ביותר שכן מתומחר, או שהמוצר מוצג בפחות רשתות.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>ירושלים ובני ברק:</strong> חלק מהמוצרים (כגון ביצים) חסרים בנתוני הסניפים שם — מחסור בנתוני Kaggle, לא מחסור בנתוני שוק.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>הפרש גודל מדגם:</strong> שופרסל מיוצגת על ידי 421 סניפים, אושר עד רק 23. ממוצע הרשת אינו ממוצע הסניפים.</span>
            </li>
          </ul>
        </section>

        <div className="text-center text-sm text-gray-400 mt-8">
          <p>שאלות? <a href="mailto:samuel.dratwa@gmail.com?subject=מדד - מתודולוגיה" className="text-blue-500 hover:text-blue-700">צרו קשר</a></p>
        </div>
      </main>
      <Footer />
    </>
  );
}
