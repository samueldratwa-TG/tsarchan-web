import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { formatHebrewDate } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export function LatestPosts() {
  const posts = getAllPosts().slice(0, 3);

  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-6 mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-text-primary">
          <span className="border-b-2 border-accent pb-1">מהבלוג</span>
        </h2>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          כל הפוסטים
          <ArrowLeft size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-border-subtle bg-bg-primary p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-3">
              {post.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-accent-warm-light px-2 py-0.5 text-xs font-medium text-accent-warm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2 group-hover:text-accent transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
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
    </section>
  );
}
