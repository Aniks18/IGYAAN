"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/app/utils/supabase";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchBlog();
  }, [slug]);

  async function fetchBlog() {
    setLoading(true);
    try {
      // Fetch the blog
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error || !data) {
        router.replace("/insights/blogs");
        return;
      }

      setBlog(data);

      // Increment views
      await supabase
        .from("blogs")
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq("id", data.id);

      // Fetch related blogs (same type, exclude current)
      const { data: related } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, cover_image, tags, author_name, read_time_minutes, published_at, blog_type")
        .eq("blog_type", data.blog_type)
        .eq("is_published", true)
        .neq("id", data.id)
        .order("published_at", { ascending: false })
        .limit(3);

      setRelatedBlogs(related || []);
    } catch (err) {
      console.error("Error fetching blog:", err);
    } finally {
      setLoading(false);
    }
  }

  // Simple markdown-to-HTML renderer
  function renderContent(content) {
    if (!content) return "";
    return content
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-slate-900 dark:text-white mt-10 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>')
      .replace(/^\- (.*$)/gm, '<li class="ml-4 text-slate-600 dark:text-slate-300 py-0.5">• $1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-slate-600 dark:text-slate-300 py-0.5 list-decimal list-inside">$1</li>')
      .replace(/\n\n/g, '</p><p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">')
      .replace(/\n/g, "<br />");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 py-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-72 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" style={{ width: `${90 - i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!blog) return null;

  const isIgyanBlog = blog.blog_type === "igyan_blog";
  const backLink = isIgyanBlog ? "/insights/blogs" : "/insights/industry";
  const backLabel = isIgyanBlog ? "I-GYAN AI Blogs" : "Industry Insights";
  const accentColor = isIgyanBlog ? "sky" : "indigo";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/insights/blogs" className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
          Insights
        </Link>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
          <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
        <Link href={backLink} className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
          {backLabel}
        </Link>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
          <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
        <span className="text-slate-400 dark:text-slate-500 truncate max-w-[200px]">{blog.title}</span>
      </nav>

      {/* Article header */}
      <header className="mb-8">
        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className={`rounded-full ${isIgyanBlog ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"} px-3 py-1 text-xs font-semibold`}>
            {isIgyanBlog ? "I-GYAN AI Blog" : "Industry Insight"}
          </span>
          {(blog.tags || []).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {blog.title}
        </h1>

        {blog.excerpt && (
          <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
            {blog.excerpt}
          </p>
        )}

        {/* Author & meta */}
        <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isIgyanBlog ? "bg-sky-100 dark:bg-sky-900/40" : "bg-indigo-100 dark:bg-indigo-900/40"}`}>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {blog.author_name?.charAt(0)}
              </span>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{blog.author_name}</div>
              {blog.author_role && (
                <div className="text-xs text-slate-500 dark:text-slate-400">{blog.author_role}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400 dark:text-slate-500">
            {blog.published_at && (
              <span>{new Date(blog.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            )}
            <span>·</span>
            <span>{blog.read_time_minutes} min read</span>
            {blog.views_count > 0 && (
              <>
                <span>·</span>
                <span>{blog.views_count} views</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Cover image */}
      {blog.cover_image && (
        <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          <img
            src={blog.cover_image}
            alt={blog.title}
            width={1200}
            height={630}
            loading="lazy"
            decoding="async"
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      {/* Article content */}
      <article
        className="prose prose-slate dark:prose-invert prose-headings:tracking-tight prose-a:text-sky-600 dark:prose-a:text-sky-400 max-w-none"
        dangerouslySetInnerHTML={{
          __html: `<p class="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">${renderContent(blog.content)}</p>`,
        }}
      />

      {/* Resource link */}
      {blog.resource_link && (
        <div className={`mt-10 rounded-xl border ${isIgyanBlog ? "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30" : "border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30"} p-5`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isIgyanBlog ? "bg-sky-100 dark:bg-sky-900/50" : "bg-indigo-100 dark:bg-indigo-900/50"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 ${isIgyanBlog ? "text-sky-600 dark:text-sky-400" : "text-indigo-600 dark:text-indigo-400"}`}>
                <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
                <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {blog.resource_label || "Related Resource"}
              </h4>
              <a
                href={blog.resource_link}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm ${isIgyanBlog ? "text-sky-600 hover:text-sky-700 dark:text-sky-400" : "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"} underline`}
              >
                {blog.resource_link}
              </a>
            </div>
            <a
              href={blog.resource_link}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-lg ${isIgyanBlog ? "bg-sky-500 hover:bg-sky-600" : "bg-indigo-500 hover:bg-indigo-600"} px-4 py-2 text-sm font-semibold text-white transition-colors`}
            >
              Visit →
            </a>
          </div>
        </div>
      )}

      {/* Additional images */}
      {blog.images && blog.images.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Gallery</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {blog.images.map((img, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                <img src={img} alt={`${blog.title} - image ${i + 1}`} width={600} height={400} loading="lazy" decoding="async" className="h-auto w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related blogs */}
      {relatedBlogs.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-12 dark:border-slate-800">
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Related Articles</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBlogs.map((rb) => (
              <Link
                key={rb.id}
                href={`/insights/${rb.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-700/60 dark:bg-zinc-900"
              >
                <div className="h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {rb.cover_image ? (
                    <img src={rb.cover_image} alt={rb.title} width={400} height={200} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center ${rb.blog_type === "igyan_blog" ? "bg-gradient-to-br from-sky-500 to-cyan-600" : "bg-gradient-to-br from-indigo-500 to-purple-600"}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-white/70">
                        <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533Z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 line-clamp-2">
                    {rb.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <span>{rb.author_name}</span>
                    <span>{rb.read_time_minutes} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to list */}
      <div className="mt-12 text-center">
        <Link
          href={backLink}
          className={`inline-flex items-center gap-2 rounded-xl ${isIgyanBlog ? "bg-sky-500 hover:bg-sky-600 shadow-sky-500/30" : "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/30"} px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.02]`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
          </svg>
          Back to {backLabel}
        </Link>
      </div>
    </div>
  );
}
