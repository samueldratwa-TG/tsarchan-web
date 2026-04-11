import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  getPostBySlug,
  getAllPostSlugs,
  getRelatedPosts,
} from "@/lib/blog";
import { getAppByBlogSlug } from "@/lib/apps-data";
import { formatHebrewDate } from "@/lib/utils";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { Callout } from "@/components/blog/mdx/Callout";
import { AppLinkCard } from "@/components/blog/mdx/AppLinkCard";
import { CodeBlock } from "@/components/blog/mdx/CodeBlock";

const mdxComponents = {
  Callout,
  AppLinkCard,
  CodeBlock,
};

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const app = post.app ? getAppByBlogSlug(post.slug) : undefined;
  const title = post.seoTitle || post.title;

  return {
    title,
    description: post.excerpt,
    alternates: { canonical: `https://sadot.click/blog/${slug}` },
    openGraph: {
      type: "article",
      title,
      description: post.excerpt,
      url: `https://sadot.click/blog/${slug}`,
      locale: "he_IL",
      siteName: "הצרחן הנבון",
      publishedTime: post.date,
      authors: ["שמואל דרטבה"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const relatedPosts = getRelatedPosts(slug, post.tags, 3);
  const app = post.app ? getAppByBlogSlug(post.slug) : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "שמואל דרטבה",
      alternateName: "Samuel Dratwa",
    },
    publisher: {
      "@type": "Organization",
      name: "הצרחן הנבון",
      url: "https://sadot.click",
    },
    mainEntityOfPage: `https://sadot.click/blog/${slug}`,
    inLanguage: "he",
  };

  const appJsonLd = app
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: app.name,
        url: app.url,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "ILS" },
      }
    : null;

  return (
    <article className="mx-auto max-w-[720px] px-6 py-12">
      {/* Post Header */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-accent-warm-light px-2.5 py-0.5 text-xs font-medium text-accent-warm"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-4 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-text-tertiary">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatHebrewDate(post.date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {post.readTime} דק׳ קריאה
          </span>
        </div>
      </div>

      {/* Post Body — strip first H1 (already shown in header) */}
      <div className="prose-rtl">
        <MDXRemote
          source={post.content.replace(/^\s*#\s+.+\n+/, "")}
          components={mdxComponents}
        />
      </div>

      {/* Post Footer */}
      <div className="mt-12 pt-8 border-t border-border-subtle">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
        >
          <ArrowRight size={14} />
          חזרה לבלוג
        </Link>

        {relatedPosts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              פוסטים קשורים
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="block rounded-xl border border-border-subtle bg-bg-secondary p-4 hover:shadow-sm transition-all"
                >
                  <h4 className="text-sm font-bold text-text-primary mb-1 line-clamp-2">
                    {rp.title}
                  </h4>
                  <span className="text-xs text-text-tertiary">
                    {formatHebrewDate(rp.date)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {appJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
        />
      )}
    </article>
  );
}
