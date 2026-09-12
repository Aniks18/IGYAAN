"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InsightsLayout({ children }) {
  const pathname = usePathname();

  const tabs = [
    { href: "/insights/blogs", label: "Blog of Insights" },
    { href: "/insights/industry", label: "Industry Insights" },
  ];

  return (
    <div className="insights-white min-h-screen bg-white text-slate-900">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-50 to-cyan-50 py-16 pb-8">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTMwVjBoLTJ2NGgyem0tMzAgMGgydi00aC0ydjR6bTMwIDMwaDJWMjJoLTJ2MTJ6TTYgMzRINHYyaDJ2LTJ6bTAtMzBINFYyaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')" }} />
        <div className="relative mx-auto max-w-6xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0 0 18 15.06v-11a.75.75 0 0 0-.546-.721A9.006 9.006 0 0 0 15 3a8.963 8.963 0 0 0-4.25 1.065V16.82ZM9.25 4.065A8.963 8.963 0 0 0 5 3c-.85 0-1.673.118-2.454.339A.75.75 0 0 0 2 4.06v11a.75.75 0 0 0 .954.721A7.462 7.462 0 0 1 5 15.5c1.579 0 3.042.487 4.25 1.32V4.065Z" />
            </svg>
            Insights & Knowledge Hub
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Insights
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Stay updated with the latest from I-GYAN AI and the education technology industry.
          </p>

          {/* Tab navigation */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-xl border border-zinc-200/80 bg-white/80 p-1.5 shadow-lg backdrop-blur">
              {tabs.map(({ href, label }) => {
                const isActive = href === "/insights/blogs"
                  ? pathname === "/insights" || pathname === href
                  : pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-sky-600"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="mx-auto max-w-6xl px-4 py-12">
        {children}
      </div>
    </div>
  );
}
