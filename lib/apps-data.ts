export type AppStatus = "live" | "beta" | "soon";

export interface App {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  fullDescription: string;
  icon: string;
  url: string;
  status: AppStatus;
  statusLabel: string;
  statusIcon: string;
  blogSlug: string;
  techStack: string[];
}

export const apps: App[] = [
  {
    slug: "hamadad",
    name: "המדד של הצרחן הנבון",
    nameEn: "Tsarchan Food Price Index",
    description:
      "מדד מחירי מזון יומי — עוקב אחר 37 מוצרי יסוד ב-8 רשתות סופרמרקט עם השוואה אזורית",
    fullDescription:
      "מדד מחירי מזון יומי שעוקב אחר 37 מוצרי יסוד ב-8 רשתות סופרמרקט בישראל. כולל השוואה אזורית ב-5 אזורים, השוואה למדד הלמ\"ס הרשמי, וטבלאות מוצרים מפורטות. הנתונים מבוססים על קבצי מחירים שהרשתות מחויבות לפרסם לפי חוק.",
    icon: "📊",
    url: "https://hamadad.sadot.click",
    status: "live",
    statusLabel: "פעיל",
    statusIcon: "✓",
    blogSlug: "hamadad-story",
    techStack: ["Next.js", "Recharts", "Tailwind", "Vercel"],
  },
  {
    slug: "taxi-price",
    name: "מחשבון נסיעות",
    nameEn: "Taxi Price Estimator",
    description:
      "חישוב מחיר נסיעה במונית לפי מרחק וזמן — תעריפון אפריל 2026",
    fullDescription:
      "מחשבון שמחשב את מחיר הנסיעה במונית לפי התעריפון הרשמי של אפריל 2026, כולל התעריף המפוצל החדש לפי מרחק. תומך בתעריפי יום, לילה, שבת וחג. משתמש ב-Google Maps לחישוב מרחק וזמן נסיעה.",
    icon: "🚕",
    url: "https://il-taxi-price-estimator.sadot.click",
    status: "live",
    statusLabel: "פעיל",
    statusIcon: "✓",
    blogSlug: "taxi-price-story",
    techStack: ["Next.js", "Google Maps API", "Tailwind", "Vercel"],
  },
  {
    slug: "shivatime",
    name: "שבעטיים",
    nameEn: "ShivaTime",
    description: "ניהול ותיאום ביקורי ניחום — האבלים מפרסמים שעות קבלה, והמבקרים קובעים מועד הגעה",
    fullDescription:
      "כלי לניהול ותיאום ביקורי ניחום בשבעה. המשפחה האבלה מפרסמת את שעות הקבלה, הכתובת והימים — ומקבלת לינק לשיתוף. כל מי שרוצה לבקר נכנס ללינק, רואה את השעות, ומסמן מתי הוא מתכנן להגיע. כך המשפחה רואה בזמן אמת כמה מבקרים צפויים בכל שעה ויכולה לתכנן בהתאם.",
    icon: "🕯️",
    url: "https://shivatime.sadot.click",
    status: "beta",
    statusLabel: "בהרצה",
    statusIcon: "⚡",
    blogSlug: "shivatime-story",
    techStack: ["Next.js", "Supabase", "Tailwind", "Vercel"],
  },
  {
    slug: "flightstatus",
    name: "סטטוס טיסה",
    nameEn: "FlightStatus",
    description: "מציאת סטטוס טיסה ממספר מקורות עם הצבעת רוב",
    fullDescription:
      "בודק סטטוס טיסה ממספר מקורות בו-זמנית (רשות שדות התעופה, FlightRadar24, גוגל) ומפעיל מנגנון הצבעת רוב. כולל מדד אמינות בשלושה צבעים שמראה עד כמה המקורות מסכימים.",
    icon: "✈️",
    url: "https://flightstatus.sadot.click",
    status: "live",
    statusLabel: "פעיל",
    statusIcon: "✓",
    blogSlug: "flightstatus-story",
    techStack: ["Next.js", "Tailwind", "Vercel"],
  },
  {
    slug: "smart-power",
    name: "השוואת מסלולי חשמל",
    nameEn: "Smart Power Calc",
    description:
      "העלה את דוח הצריכה מחברת החשמל והשווה בין מסלולי הנחות של 7 ספקי חשמל אלטרנטיביים",
    fullDescription:
      "כלי שמשווה בין מסלולי הנחות של 7 ספקי חשמל אלטרנטיביים בישראל. מעלים קובץ CSV מהמונה החכם של חברת החשמל — כל העיבוד מתבצע בדפדפן, הנתונים לא עוזבים את המחשב. כולל ניתוח צריכה וזיהוי אנומליות.",
    icon: "⚡",
    url: "https://smart-power-calc.sadot.click",
    status: "live",
    statusLabel: "פעיל",
    statusIcon: "✓",
    blogSlug: "smart-power-story",
    techStack: ["Next.js", "Recharts", "Tailwind", "Vercel"],
  },
];

export function getAppBySlug(slug: string): App | undefined {
  return apps.find((app) => app.slug === slug);
}

export function getAppByBlogSlug(blogSlug: string): App | undefined {
  return apps.find((app) => app.blogSlug === blogSlug);
}
