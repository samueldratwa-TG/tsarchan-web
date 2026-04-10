import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "אודות — הצרחן הנבון",
  description:
    "מי עומד מאחורי הכלים, מה המוטיבציה, ותשובות לשאלות נפוצות",
  alternates: { canonical: "https://sadot.click/about" },
};

const faqItems = [
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
    a: "דרך עמוד צור קשר או דרך עמוד הרעיונות. כל משוב מתקבל בברכה!",
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

      {/* FAQ */}
      <section id="faq">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          שאלות נפוצות
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <details
              key={i}
              className="group rounded-xl border border-border-subtle bg-bg-primary"
            >
              <summary className="cursor-pointer px-5 py-4 text-sm font-bold text-text-primary hover:text-accent transition-colors list-none flex items-center justify-between">
                {item.q}
                <span className="text-text-tertiary group-open:rotate-180 transition-transform">
                  ▾
                </span>
              </summary>
              <div className="px-5 pb-4 text-sm text-text-secondary leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems.map((item) => ({
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
