import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-primary">
      <div className="mx-auto max-w-[1200px] px-6 py-8 flex flex-col items-center gap-3 text-sm text-text-secondary">
        <span className="font-bold text-text-primary">הצרחן הנבון</span>
        <div className="flex gap-4">
          <Link
            href="/contact"
            className="hover:text-accent transition-colors"
          >
            צור קשר / משוב
          </Link>
          <span className="text-border-medium">|</span>
          <Link
            href="/about#faq"
            className="hover:text-accent transition-colors"
          >
            שאלות נפוצות
          </Link>
        </div>
      </div>
    </footer>
  );
}
