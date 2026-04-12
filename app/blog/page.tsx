import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { formatHebrewDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "הבלוג של הצרחן הנבון",
  description:
    "פוסטים על הכלים שבניתי, ההחלטות הטכניות מאחוריהם, וסיפורים מהחיים שהובילו ליצירתם",
  alternates: { canonical: "https://sadot.click/blog" },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-2">
        הבלוג של הצרחן הנבון
      </h1>
      <p className="text-text-secondary mb-10">
        סיפורים, תובנות, והחלטות טכניות מאחורי הכלים
      </p>

      {/* Post List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-border-subtle bg-bg-primary p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-accent-warm-light px-2 py-0.5 text-xs font-medium text-accent-warm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm text-text-secondary line-clamp-3 mb-4">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-3 text-xs text-text-tertiary">
              <span>{formatHebrewDate(post.date)}</span>
              <span>·</span>
              <span>{post.readTime} דק׳ קריאה</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
