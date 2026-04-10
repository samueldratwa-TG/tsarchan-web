import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "אודות — הצרחן הנבון",
  description:
    "מי עומד מאחורי הכלים, מה המוטיבציה, ותשובות לשאלות נפוצות",
  alternates: { canonical: "https://sadot.click/about" },
};

const faqJsonLd = [
  {
    q: 'מה זה "הצרחן הנבון"?',
    a: "אוסף כלים חינמיים שנבנו מצרכים אמיתיים בחיי היומיום. כל כלי פותר בעיה שנתקלתי בה באופן אישי.",
  },
  {
    q: "מי עומד מאחורי הכלים האלה?",
    a: "שמואל דרטבה — מפתח שבונה כלים בזמנו החופשי, מתוך תשוקה לפתור בעיות יומיומיות עם טכנולוגיה.",
  },
  {
    q: "האם הכלים חינמיים?",
    a: "כן, כל הכלים חינמיים לחלוטין ויישארו כאלה. אין מנויים, אין פרסומות, אין מעקב.",
  },
  {
    q: "איך אני יכול להציע רעיון לכלי חדש?",
    a: "היכנסו לעמוד הרעיונות ותגישו הצעה. אפשר גם לקחת רעיון קיים ולפתח אותו.",
  },
  {
    q: "איך המידע שלי מוגן?",
    a: "הכלים לא שומרים מידע אישי. ברוב הכלים, החישובים מתבצעים ישירות בדפדפן שלכם — שום דבר לא נשלח לשרת.",
  },
  {
    q: "מצאתי באג או יש לי הצעה לשיפור — לאן לפנות?",
    a: "דווחו על באגים דרך עמוד המשוב של האפליקציה המתאימה. הצעות כלליות — דרך עמוד צור קשר או עמוד הרעיונות.",
  },
  {
    q: "באילו טכנולוגיות הכלים בנויים?",
    a: "Next.js, Tailwind CSS, Vercel, Supabase — טכנולוגיות מודרניות ומהירות שמאפשרות בנייה מהירה ופריסה חינמית.",
  },
  {
    q: "האם אפשר לתרום קוד או לפתח כלי בעצמי?",
    a: "כן! בעמוד הרעיונות אפשר לבחור פרויקט ולעבוד עליו. הכלים נבנו ברוח קהילתית.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-12">
      {/* Bio */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-text-primary mb-4">
          אודות הצרחן הנבון
        </h1>
        <div className="space-y-4 text-text-secondary leading-relaxed">
          <p>
            שמי שמואל דרטבה. אני מפתח שאוהב לבנות כלים שפותרים בעיות
            יומיומיות. כל כלי באתר הזה נולד מתוך חוויה אישית — רגע שבו
            הבנתי שמשהו חסר ושאפשר לעשות את זה טוב יותר.
          </p>
          <p>
            הפילוסופיה פשוטה: כלי טוב הוא כלי שעושה דבר אחד ועושה אותו טוב.
            בלי הרשמה, בלי תשלום, בלי מעקב. פשוט נכנסים ומשתמשים.
          </p>
        </div>
      </section>

      {/* WIP + Responsive Notes */}
      <section className="mb-12 space-y-4">
        <div className="rounded-xl border border-accent/20 bg-accent-light p-5">
          <p className="text-sm text-text-secondary leading-relaxed">
            <strong className="text-text-primary">עבודה מתמשכת:</strong>{" "}
            כל הכלים נמצאים בתהליך שיפור מתמיד — אני מתקן, משפר ומוסיף כל הזמן.
            גם אתם מוזמנים להעיר, להציע ולבקש דרך{" "}
            <Link href="/contact" className="text-accent hover:text-accent-hover underline">
              עמוד המשוב
            </Link>{" "}
            או דרך{" "}
            <Link href="/ideas" className="text-accent hover:text-accent-hover underline">
              עמוד הרעיונות
            </Link>.
          </p>
        </div>
        <div className="rounded-xl border border-border-subtle bg-bg-secondary p-5">
          <p className="text-sm text-text-secondary leading-relaxed">
            <strong className="text-text-primary">מותאם לכל מכשיר:</strong>{" "}
            כל הכלים תוכננו כך שיעבדו וייראו טוב גם על טלפון נייד וגם על מחשב.
            חלק מהכלים (כמו{" "}
            <a
              href="https://smart-power-calc.sadot.click"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover underline"
            >
              מחשבון החשמל
            </a>
            ) מציגים טבלאות וגרפים שנוח יותר לצפות בהם על מסך גדול.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          שאלות נפוצות
        </h2>
        <div className="space-y-3">
          {/* Q1 */}
          <FaqItem q='מה זה "הצרחן הנבון"?'>
            אוסף כלים חינמיים שנבנו מצרכים אמיתיים בחיי היומיום. כל כלי פותר
            בעיה שנתקלתי בה באופן אישי.
          </FaqItem>

          {/* Q2 */}
          <FaqItem q="מי עומד מאחורי הכלים האלה?">
            שמואל דרטבה — מפתח שבונה כלים בזמנו החופשי, מתוך תשוקה לפתור
            בעיות יומיומיות עם טכנולוגיה.
          </FaqItem>

          {/* Q3 */}
          <FaqItem q="האם הכלים חינמיים?">
            כן, כל הכלים חינמיים לחלוטין ויישארו כאלה. אין מנויים, אין
            פרסומות, אין מעקב.
          </FaqItem>

          {/* Q4 */}
          <FaqItem q="איך אני יכול להציע רעיון לכלי חדש?">
            היכנסו{" "}
            <Link href="/ideas" className="text-accent hover:text-accent-hover underline">
              לעמוד הרעיונות
            </Link>{" "}
            ותגישו הצעה. אפשר גם לקחת רעיון קיים ולפתח אותו.
          </FaqItem>

          {/* Q5 */}
          <FaqItem q="איך המידע שלי מוגן?">
            הכלים לא שומרים מידע אישי. ברוב הכלים, החישובים מתבצעים ישירות
            בדפדפן שלכם — שום דבר לא נשלח לשרת.
          </FaqItem>

          {/* Q6 */}
          <FaqItem q="מצאתי באג או יש לי הצעה לשיפור — לאן לפנות?">
            דווחו על באגים דרך עמוד המשוב של האפליקציה המתאימה. הצעות כלליות
            — דרך{" "}
            <Link href="/contact" className="text-accent hover:text-accent-hover underline">
              עמוד צור קשר
            </Link>{" "}
            או{" "}
            <Link href="/ideas" className="text-accent hover:text-accent-hover underline">
              עמוד הרעיונות
            </Link>.
          </FaqItem>

          {/* Q7 */}
          <FaqItem q="באילו טכנולוגיות הכלים בנויים?">
            Next.js, Tailwind CSS, Vercel, Supabase — טכנולוגיות מודרניות
            ומהירות שמאפשרות בנייה מהירה ופריסה חינמית.
          </FaqItem>

          {/* Q8 */}
          <FaqItem q="האם אפשר לתרום קוד או לפתח כלי בעצמי?">
            כן! ב
            <Link href="/ideas" className="text-accent hover:text-accent-hover underline">
              עמוד הרעיונות
            </Link>{" "}
            אפשר לבחור פרויקט ולעבוד עליו. הכלים נבנו ברוח קהילתית.
          </FaqItem>
        </div>
      </section>

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqJsonLd.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />
    </div>
  );
}

function FaqItem({
  q,
  children,
}: {
  q: string;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-border-subtle bg-bg-primary">
      <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-text-primary hover:text-accent transition-colors list-none flex items-center justify-between">
        {q}
        <span className="text-text-tertiary group-open:rotate-180 transition-transform">
          ▾
        </span>
      </summary>
      <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">
        {children}
      </div>
    </details>
  );
}
