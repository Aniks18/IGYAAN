"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/utils/supabase";

export default function IGyanBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [fetchError, setFetchError] = useState("");

  async function fetchBlogs() {
    setLoading(true);
    setFetchError("");
    try {
      let query = supabase
        .from("blogs")
        .select("*")
        .eq("blog_type", "igyan_blog")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (selectedTag) {
        query = query.contains("tags", [selectedTag]);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBlogs(data || []);

      // Extract all unique tags
      if (!selectedTag) {
        const tags = new Set();
        (data || []).forEach((blog) =>
          (blog.tags || []).forEach((tag) => tags.add(tag))
        );
        setAllTags([...tags]);
      }
    } catch {
      setBlogs([]);
      setAllTags([]);
      setFetchError("Insights are temporarily unavailable. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBlogs();
  }, [selectedTag]);

  const featuredBlogs = blogs.filter((b) => b.is_featured);
  const regularBlogs = blogs.filter((b) => !b.is_featured);

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Skeleton loaders */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {fetchError && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{fetchError}</div>}
      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              !selectedTag
                ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-sky-300 hover:text-sky-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-sky-500 dark:hover:text-sky-400"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                selectedTag === tag
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-sky-300 hover:text-sky-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-sky-500 dark:hover:text-sky-400"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Featured blogs */}
      {featuredBlogs.length > 0 && !selectedTag && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            ✨ Featured
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredBlogs.map((blog) => (
              <FeaturedBlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      {/* All blogs grid */}
      <section>
        {!selectedTag && featuredBlogs.length > 0 && (
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            Latest Articles
          </h2>
        )}
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-700">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">No blogs found</h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              {selectedTag ? `No articles tagged with "${selectedTag}"` : "Check back soon for new content!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(selectedTag ? blogs : regularBlogs).map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FeaturedBlogCard({ blog }) {
  return (
    <Link
      href={`/insights/${blog.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/15 hover:border-sky-300 dark:border-zinc-700/60 dark:bg-zinc-900 dark:hover:border-sky-500/50"
    >
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {blog.cover_image ? (
          <img
            src={blog.cover_image}
            alt={blog.title}
            width={600}
            height={300}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500 to-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12 text-white/70">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-950 shadow-lg backdrop-blur-sm">
            ⭐ Featured
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {(blog.tags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-semibold text-sky-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mb-2 text-lg font-bold leading-tight text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400">
          {blog.title}
        </h3>
        <p className="mb-4 flex-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {blog.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600 dark:text-slate-300">{blog.author_name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{blog.read_time_minutes} min read</span>
            {blog.published_at && (
              <span>{new Date(blog.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ blog }) {
  return (
    <Link
      href={`/insights/${blog.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-300 dark:border-zinc-700/60 dark:bg-zinc-900 dark:hover:border-sky-500/50"
    >
      {/* Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {blog.cover_image ? (
          <img
            src={blog.cover_image}
            alt={blog.title}
            width={400}
            height={220}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-500 to-cyan-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white/70">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {(blog.tags || []).slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mb-2 text-base font-bold leading-snug text-slate-900 group-hover:text-sky-600 dark:text-white dark:group-hover:text-sky-400 line-clamp-2">
          {blog.title}
        </h3>
        <p className="mb-3 flex-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {blog.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span className="font-medium text-slate-600 dark:text-slate-300">{blog.author_name}</span>
          <span>{blog.read_time_minutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
