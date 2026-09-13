"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/utils/supabase";

export default function IndustryInsightsPage() {
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
        .eq("blog_type", "industry_insight")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (selectedTag) {
        query = query.contains("tags", [selectedTag]);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBlogs(data || []);

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
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
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
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Featured insights */}
      {featuredBlogs.length > 0 && !selectedTag && (
        <section>
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            🔥 Trending Insights
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredBlogs.map((blog) => (
              <FeaturedInsightCard key={blog.id} blog={blog} />
            ))}
          </div>
        </section>
      )}

      {/* All insights grid */}
      <section>
        {!selectedTag && featuredBlogs.length > 0 && (
          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
            All Industry Insights
          </h2>
        )}
        {blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-700">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400">No insights found</h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              {selectedTag ? `No insights tagged with "${selectedTag}"` : "Check back soon for new content!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(selectedTag ? blogs : regularBlogs).map((blog) => (
              <InsightCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function FeaturedInsightCard({ blog }) {
  return (
    <Link
      href={`/insights/${blog.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/15 hover:border-indigo-300 dark:border-zinc-700/60 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
    >
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
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-12 w-12 text-white/70">
              <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192ZM6.949 5.684a1 1 0 0 0-1.898 0l-.683 2.051a1 1 0 0 1-.633.633l-2.051.683a1 1 0 0 0 0 1.898l2.051.684a1 1 0 0 1 .633.632l.683 2.051a1 1 0 0 0 1.898 0l.683-2.051a1 1 0 0 1 .633-.633l2.051-.683a1 1 0 0 0 0-1.898l-2.051-.683a1 1 0 0 1-.633-.633L6.95 5.684Z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-400/90 px-3 py-1 text-xs font-bold text-orange-950 shadow-lg backdrop-blur-sm">
            🔥 Trending
          </span>
        </div>
        {blog.resource_link && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 dark:bg-zinc-900/90 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 shadow-lg backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                <path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" />
                <path d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" />
              </svg>
              Resource
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {(blog.tags || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mb-2 text-lg font-bold leading-tight text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
          {blog.title}
        </h3>
        <p className="mb-4 flex-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {blog.excerpt}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-600 dark:text-slate-300">{blog.author_name}</span>
            {blog.author_role && (
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium dark:bg-slate-800">
                {blog.author_role}
              </span>
            )}
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

function InsightCard({ blog }) {
  return (
    <Link
      href={`/insights/${blog.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:border-zinc-700/60 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
    >
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
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white/70">
              <path d="M15.98 1.804a1 1 0 0 0-1.96 0l-.24 1.192a1 1 0 0 1-.784.785l-1.192.238a1 1 0 0 0 0 1.962l1.192.238a1 1 0 0 1 .785.785l.238 1.192a1 1 0 0 0 1.962 0l.238-1.192a1 1 0 0 1 .785-.785l1.192-.238a1 1 0 0 0 0-1.962l-1.192-.238a1 1 0 0 1-.785-.785l-.238-1.192Z" />
            </svg>
          </div>
        )}
        {blog.resource_link && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 dark:bg-zinc-900/90 px-2 py-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 shadow backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                <path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" />
                <path d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" />
              </svg>
              Resource
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {(blog.tags || []).slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-800"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="mb-2 text-base font-bold leading-snug text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 line-clamp-2">
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
