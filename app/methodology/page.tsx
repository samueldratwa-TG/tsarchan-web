import { Footer } from "../components/Footer";
import Link from "next/link";
import { promises as fs } from "fs";
import path from "path";

export const metadata = {
  title: "מתודולוגיה — מדד מחירי מזון",
  description: "איך מדד מחירי המזון עובד: מקורות הנתונים, מיפוי הברקודים, סינון חריגים ומגבלות השיטה",
};

export default async function MethodologyPage() {
  // Universal-vs-mapped counts from the live basket config (build-time), so the
  // numbers on this page can never drift from the actual basket again.
  const basketPath = path.join(process.cwd(), "public", "data", "basket_config.json");
  const basket = JSON.parse(await fs.readFile(basketPath, "utf-8"));
  const mappedCount = (basket.products as { mapped?: boolean }[]).filter((p) => p.mapped).length;
  const universalCount = (basket.products as { mapped?: boolean }[]).length - mappedCount;
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
              <h3 className="font-semibold text-green-800 mb-2">{universalCount} מוצרים — ברקוד אוניברסלי</h3>
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
              <h3 className="font-semibold text-orange-800 mb-2">{mappedCount} מוצרים — ברקוד לפי רשת</h3>
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
              הרשתות — צריך לדעת את הקוד הספציפי שכל רשת השתמשה בו. עבור {mappedCount} המוצרים האלה,
              בנינו מיפוי ידני לכל רשת בנפרד. עבור {universalCount} המוצרים הנותרים, ברקוד אחד מספיק.
            </p>
          </div>
        </section>

        {/* Section 2b: why the median */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-r-4 border-blue-500 pr-3">למה חציון ולא ממוצע?</h2>
          <p className="text-gray-600 leading-relaxed mb-3">
            לרשת אחת יש עשרות ומאות סניפים, ולכל סניף מחיר משלו. כדי להציג מספר אחד לרשת צריך
            לבחור איך לסכם אותם. אנחנו בוחרים <strong className="font-semibold text-gray-700">חציון</strong> -
            המחיר שנמצא באמצע, כשמסדרים את כל הסניפים מהזול ליקר.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="font-semibold">דוגמה אמיתית מהנתונים שלנו.</strong> מלפפון ברמי לוי,
              75 סניפים: 39 סניפים ב-5.90 ש&quot;ח, 15 ב-3.90, 9 ב-6.90, 6 ב-4.90, 3 ב-8.90 ו-3 ב-1.90.
              הממוצע יוצא 5.50 ש&quot;ח - מחיר ש<strong className="font-semibold">לא קיים באף סניף</strong>.
              החציון הוא 5.90 - המחיר שבו באמת קונים ברוב הסניפים.
            </p>
          </div>
          <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pr-5">
            <li>
              <strong className="font-semibold text-gray-700">מספר שאפשר באמת לשלם.</strong> בבדיקה על 826
              תאים, החציון היה מחיר שקיים בפועל באיזשהו סניף ב-99% מהמקרים. הממוצע - ב-16% בלבד.
            </li>
            <li>
              <strong className="font-semibold text-gray-700">עמידות למבצעים.</strong> סניף בודד שמריץ מבצע
              לא אמור להזיז את המחיר של רשת שלמה. אם סניף אחד מתוך שישה יורד ל-1.90, הממוצע זז ב-0.67
              ש&quot;ח - החציון לא זז בכלל. כדי להזיז חציון צריך שיותר מחצי מהסניפים ישנו מחיר, וזה בדיוק
              המצב שבו נכון שהמחיר יזוז.
            </li>
            <li>
              <strong className="font-semibold text-gray-700">מינימום 5 סניפים.</strong> אם רשת מפרסמת את
              המוצר בפחות מ-5 סניפים, אנחנו לא מציגים לה מחיר בכלל ומסמנים —. עדיף להראות שאין נתון
              מאשר להציג מספר שנשען על סניף אחד או שניים ונראה בטוח יותר ממה שהוא.
            </li>
          </ul>
          <p className="text-sm text-gray-500 leading-relaxed mt-3">
            הערה על מה שהשתנה: עד ה-9 באוגוסט 2026 טבלת המוצרים הציגה מחיר של סניף בודד - זה שעדכן
            מחיר אחרון - ולא סיכום של הרשת. מכיוון שסניף שמעדכן מחיר הוא לרוב סניף שהתחיל מבצע, המספר
            שהוצג נטה כלפי מטה וייצר פערים לא סבירים בין רשתות. המעבר לחציון תיקן זאת.
            שימו לב: <strong className="font-semibold text-gray-600">המדד עצמו לא הושפע</strong> - הוא תמיד
            חושב מחציון הסניפים.
          </p>
        </section>

        {/* Section 3: How the index is built */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-r-4 border-blue-500 pr-3">איך בונים מדד יומי מנתונים מ-8 רשתות?</h2>
          <ol className="space-y-4 text-gray-600">
            <li className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-medium text-gray-700">תצלום יומי של המחיר בכל סניף</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  מאז 6 ביוני 2026 אנחנו שומרים כל יום snapshot של המחיר בפועל בכל סניף, לכל מוצר
                  בסל, בכל הרשתות. המחיר היומי של רשת למוצר הוא <strong>חציון הסניפים</strong> באותו
                  יום. שני סינוני איכות חלים כאן: יום שבו רשת פרסמה רק חלק קטן מהסניפים שלה מדולג
                  (המחיר האחרון הטוב מוחזק), ומחיר של מוצר ברשת נכנס למדד רק אם הוא נצפה
                  ב-<strong>5 סניפים לפחות</strong> באותו יום — אותו רף בדיוק שחל על טבלת המוצרים.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-medium text-gray-700">ההיסטוריה שלפני יוני 2026 — שחזור קפוא</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  לימים שלפני תחילת ה-snapshots, הסדרה שוחזרה פעם אחת משדה &quot;תאריך עדכון אחרון&quot;
                  שבקבצים, <strong>הוקפאה לקובץ</strong>, ומחוברת לסדרת ה-snapshots בשיטת שרשור
                  מדדים סטנדרטית (chain-linking) — כך ששינויים עתידיים בקבצי המקור לעולם לא
                  משכתבים את העבר. צירוף מוצר-רשת שאין לו לא היסטוריה קפואה ולא נתוני snapshot
                  מספקים פשוט אינו משתתף במדד.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-medium text-gray-700">ממוצע גיאומטרי בין הרשתות</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  לכל תאריך ולכל מוצר, לוקחים ממוצע גיאומטרי של המחירים מכל הרשתות שיש להן נתון.
                  ממוצע גיאומטרי (לעומת חשבוני) מגביל את ההשפעה של מחיר קיצוני אחד על כלל המדד.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
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
              <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">5</span>
              <div>
                <p className="font-medium text-gray-700">חישוב ביחס לתאריך בסיס קבוע</p>
                <p className="text-sm leading-relaxed mt-0.5">
                  תאריך הבסיס הוא 15 ביוני 2025 = 100. כל יום מחושב ביחס לבסיס: אם סל המוצרים
                  עלה 2.5% מאז הבסיס, המדד מציג 102.5. מחירי הבסיס עצמם <strong>קפואים</strong> —
                  הם חושבו פעם אחת ונשמרו, כך שתנודות בקבצי המקור אינן יכולות להזיז את נקודת
                  הייחוס שכל המדד נמדד ממנה.
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
              בכל סניף בכל הרשתות — ומאז 6 ביוני 2026 <strong>המדד עצמו מחושב מה-snapshots
              האלה</strong>, לא משחזור. השחזור משמש רק כזנב היסטורי קפוא לימים שלפני כן.
              ככל שארכיון ה-snapshots מצטבר, החלק המדויק של הסדרה מתארך.
            </p>
          </div>
        </section>

        {/* Section 5: Limitations */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-r-4 border-red-400 pr-3">מגבלות ידועות</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>חצי חינם — היסטוריה שטוחה לפני יוני 2026:</strong> יש להם 13 סניפים בלבד עם עדכוני תאריך כמעט זהים, כך שהשחזור ההיסטורי ראה אצלם אפס תנועה. מאז המעבר ל-snapshots (יוני 2026) תנועת המחירים שלהם נמדדת כרגיל; החלק שלפני כן נשאר שטוח.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400 font-bold">•</span>
              <span><strong>רף 5 סניפים גם במדד:</strong> צירוף מוצר-רשת שנצפה בפחות מ-5 סניפים אינו נכנס למדד (בדיוק כמו בטבלת המוצרים, שם מוצג —). המשמעות: מוצר עשוי להיות מחושב מ-6 או 7 רשתות במקום 8. עדיף פחות רשתות מאשר מחיר שנשען על סניף בודד.</span>
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

        {/* Section 6: Methodology changelog */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-r-4 border-purple-400 pr-3">יומן עדכוני מתודולוגיה</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            כשאנחנו מתקנים את שיטת החישוב, כל הסדרה מחושבת מחדש לפי השיטה החדשה — ולכן ערכים
            היסטוריים עשויים להשתנות. כל שינוי כזה מתועד כאן, כדי שקפיצה בגרף שמקורה בשיפור
            השיטה לא תיקרא בטעות כתנועת מחירים אמיתית.
          </p>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="font-semibold text-purple-900 mb-1">22 באוגוסט 2026 — עיגון מלא, רף 5 סניפים במדד, והקפאת הבסיס</p>
              <p className="leading-relaxed">
                שלושה תיקונים שנכנסו יחד: (1) כל צירוף מוצר-רשת מעוגן עכשיו לנתוני ה-snapshots
                או להיסטוריה הקפואה — בוטל לחלוטין מנגנון &quot;שחזור חי&quot; שאיפשר לסניף בודד שנכנס
                או יצא מקובץ המקור לשכתב רטרואקטיבית חודשים של היסטוריה מפורסמת; (2) רף 5
                הסניפים שחל על טבלת המוצרים חל מעכשיו גם על המדד עצמו; (3) מחירי הבסיס הוקפאו.
                כתוצאה מהתיקון המדד ירד באופן חד-פעמי מ-102.11 ל-100.80 —{' '}
                <strong>זו הסרת עיוותים, לא ירידת מחירים</strong> (למשל: מחיר עגבניה שנשען על
                ממוצע גולמי מוטה ירד לחציון האמיתי של 54 סניפים, ומחיר בסיס של מלפפון שזז בגלל
                שורה בודדת מ-2019 קובע מחדש).
              </p>
            </li>
            <li className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="font-semibold text-purple-900 mb-1">9 באוגוסט 2026 — מעבר לחציון בטבלת המוצרים</p>
              <p className="leading-relaxed">
                טבלת המוצרים הציגה עד אז מחיר של הסניף האחרון שעדכן — שנטה כלפי מטה (מבצעים).
                מאז מוצג חציון כלל הסניפים, עם רף מינימום של 5 סניפים. המדד עצמו תמיד חושב
                מחציון ולא הושפע.
              </p>
            </li>
            <li className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="font-semibold text-purple-900 mb-1">19 ביוני 2026 — המדד עבר לנתוני snapshots</p>
              <p className="leading-relaxed">
                כל 8 הרשתות מחושבות מאז מארכיון ה-snapshots היומי (לתאריכים מ-6 ביוני 2026),
                כשההיסטוריה המשוחזרת שלפני כן הוקפאה וחוברה בשרשור מדדים סטנדרטי — ללא אובדן
                היסטוריה וללא מדרגה מלאכותית.
              </p>
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
