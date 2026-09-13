"use client";
// #aniket

import Link from "next/link";
import Logo from "@/components/logo";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const mediaFeatures = [
  { name: "News18 India", url: "https://www.news18.com/agency-feeds/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020-9806307.html" },
  { name: "Business Standard", url: "https://www.business-standard.com/content/press-releases-ani/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020-126010200833_1.html" },
  { name: "USA Report", url: "https://www.usareport.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Tribune India", url: "https://www.tribuneindia.com/news/business/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "France Network Times", url: "https://www.francenetworktimes.com/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Maharashtra News Flash", url: "https://maharashtranewsflash.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "UAE Times", url: "https://drive.google.com/file/d/1UijFYkth6-Jx0KojlztLKymlIJvAJ9kz/view?usp=drive_link" },
  { name: "Travellr News India", url: "https://travllernewsindia.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "Dubai City Reporter", url: "https://www.dubaicityreporter.com/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Himachal Pradesh News Flash", url: "https://himachalpradeshnewsflash.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "Gujarat Watch", url: "https://gujaratwatch.co.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "India News 24x7", url: "https://newsindia24x7.co.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "London Channel News", url: "https://www.londonchannelnews.com/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Maharashtra Portal", url: "https://maharastraportal.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "Middle East Times", url: "https://www.middleeasttimes.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Wall Street Sentinel", url: "https://www.wallstreetsentinel.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Bihar Times", url: "https://www.bihartimes.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Bihar 24x7", url: "https://www.bihar24x7.com/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Tech Times News", url: "https://techtimesnews.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "Karnataka News Room", url: "https://karnatakanewsroom.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "Uttarakhand News Wire", url: "https://uttarakhandnewswire.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "Vancouver Herald", url: "https://www.vancouverherald.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Gujarat Samachar", url: "https://www.gujaratsamachar.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Jharkhand Times", url: "https://www.jharkhandtimes.in/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/" },
  { name: "Trend Stellers", url: "https://trendstellers.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/" },
  { name: "Washington DC", url: "https://drive.google.com/file/d/1JXY_PZoPlonaHHRbxkeAEJjVZtpswKH_/view?usp=drive_link" },
  { name: "British News Network", url: "https://drive.google.com/file/d/15HKR6bzrm1Dqn5Sci0difH_P2oyVPWBp/view?usp=drive_link" },
];

const highlights = [
  "Unified operating system for schools",
  "Sudarshan AI copilots for every learner and educator",
  "Career and venture incubators built in",
];

const featureCards = [
  {
    title: "Holistic School Management",
    description:
      "Automate admissions, fees, attendance, and accreditation workflows with predictive insights for administrators.",
  },
  {
    title: "Personalized Learning Paths",
    description:
      "Adaptive Sudarshan AI copilots curate lesson plans, mastery checks, and mentorship tailored to each learner's aspirations.",
  },
  {
    title: "Career & Entrepreneurship Studio",
    description:
      "Real-world industry projects, venture labs, and alumni networks help students design audacious futures.",
  },
];

const stats = [
  { label: "Hours saved weekly", value: "32" },
  { label: "Student success boost", value: "+48%" },
  { label: "Partner schools onboard", value: "120" },
];

const copilots = [
  {
  name: "Principal Sudarshan AI",
    description:
      "Forecast admissions, manage compliance, and orchestrate school-wide OKRs with executive dashboards.",
  },
  {
  name: "Faculty Sudarshan AI",
    description:
      "Generate lesson plans, formative assessments, and differentiated content in seconds.",
  },
  {
  name: "Student Sudarshan AI",
    description:
      "Chat-based mentor guiding daily learning goals, career exploration, and venture pitch feedback.",
  },
];

const offeringMatrix = [
  {
    feature: "Institutional Innovation & Virtual Incubation Hub",
    institutionalSuite: { status: "yes" },
    professionalSuite: { status: "no", note: "Personal Innovation Space" },
  },
  {
    feature: "Personal Innovation & Virtual Incubation Hub",
    institutionalSuite: { status: "no" },
    professionalSuite: { status: "yes", note: "Personal Innovation Space" },
  },
  {
    feature: "AI Faculty Assistant",
    institutionalSuite: { status: "yes", note: "Institution-Branded Tutor" },
    professionalSuite: { status: "no", note: "Your Personal Co-Pilot" },
  },
  {
    feature: "Sudarshan AI",
    institutionalSuite: { status: "no", note: "Institution-Branded Tutor" },
    professionalSuite: { status: "yes", note: "Your Personal Co-Pilot" },
  },
  {
    feature: "AI Homework & Task Management System",
    institutionalSuite: { status: "yes" },
    professionalSuite: { status: "no" },
  },
  {
    feature: "Creator Suite",
    institutionalSuite: { status: "no"},
    professionalSuite: { status: "yes", note: "Multiple AI Tools" },
  },
  {
    feature: "AI Viva Intelligence",
    institutionalSuite: { status: "yes", note: "Voice-Based Evaluation" },
    professionalSuite: { status: "no", note: "AI Conversations" },
  },
  {
    feature: "AI VivaVerse",
    institutionalSuite: { status: "no", note: "Voice-Based Evaluation" },
    professionalSuite: { status: "yes", note: "AI Conversations" },
  },
  {
    feature: "Events & Competition Dashboard",
    institutionalSuite: { status: "yes", note: "Institutional Dashboard" },
    professionalSuite: { status: "yes", note: "Global Events Hub" },
  },
  {
    feature: "Buddy AI",
    institutionalSuite: { status: "yes", note: "Your 24/7 Institutional Mentor" },
    professionalSuite: { status: "no", note: "Life Direction Sessions" },
  },
  {
    feature: "Gyani Sage",
    institutionalSuite: { status: "no", note: "Student Growth Roadmap" },
    professionalSuite: { status: "yes", note: "Life Direction Sessions" },
  },
  {
    feature: "AI Timetable & Smart Substitution Scheduler",
    institutionalSuite: { status: "yes" },
    professionalSuite: { status: "no", note: "Smart Study Scheduler" },
  },
  {
    feature: "Teacher Toolkit",
    institutionalSuite: { status: "yes", note: "AI Lesson Planner, Content Generator & Multiple Tools"  },
    professionalSuite: { status: "no", note: "Smart Study Scheduler" },
  },
  {
    feature: "AI Assessment & Evaluation Suite",
    institutionalSuite: { status: "yes" },
    professionalSuite: { status: "no" },
  },
  {
    feature: "AI-Driven Report Card System",
    institutionalSuite: { status: "yes" },
    professionalSuite: { status: "no" },
  },
  {
    feature: "Institutional Insights Dashboard",
    institutionalSuite: { status: "yes" },
    professionalSuite: { status: "no" },
  },
  {
    feature: "AI Shark Simulation – Real-Time Pitch Feedback",
    institutionalSuite: { status: "no" },
    professionalSuite: { status: "yes" },
  },
];

// Media Carousel Component
function MediaCarousel() {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);
  
  // Duplicate the array for seamless infinite scroll
  const duplicatedMedia = [...mediaFeatures, ...mediaFeatures];
  
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    
    let animationId;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame
    
    const scroll = () => {
      if (!isPaused) {
        scrollPosition += scrollSpeed;
        
        // Reset scroll position when first set is scrolled past
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(scroll);
    };
    
    animationId = requestAnimationFrame(scroll);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused]);

  return (
    <div className="relative">
      {/* Gradient overlays for fade effect */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-linear-to-r from-white to-transparent dark:from-slate-950 z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-linear-to-l from-white to-transparent dark:from-slate-950 z-10" />
      
      {/* Scrolling container */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-hidden py-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicatedMedia.map((media, index) => (
          <a
            key={`${media.name}-${index}`}
            href={media.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group shrink-0 w-[420px] h-80 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:shadow-sky-500/25 hover:border-sky-400 cursor-pointer overflow-hidden"
          >
            {/* Article Image Only */}
            <div className="relative h-full w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={`https://api.microlink.io/?url=${encodeURIComponent(media.url)}&screenshot=true&meta=false&embed=screenshot.url`}
                alt={`${media.name} article preview`}
                width={420}
                height={320}
                className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback placeholder */}
              <div className="absolute inset-0 hidden items-center justify-center bg-linear-to-br from-sky-500 via-cyan-500 to-sky-600">
                <div className="text-center text-white p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16 mx-auto mb-3 opacity-80">
                    <path fillRule="evenodd" d="M4.125 3C3.089 3 2.25 3.84 2.25 4.875V18a3 3 0 0 0 3 3h15a3 3 0 0 1-3-3V4.875C17.25 3.839 16.41 3 15.375 3H4.125ZM12 9.75a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H12Zm-.75-2.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5H12a.75.75 0 0 1-.75-.75ZM6 12.75a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5H6Zm-.75 3.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75ZM6 6.75a.75.75 0 0 0-.75.75v3c0 .414.336.75.75.75h3a.75.75 0 0 0 .75-.75v-3A.75.75 0 0 0 9 6.75H6Z" clipRule="evenodd" />
                    <path d="M18.75 6.75h1.875c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 0 1-3 0V6.75Z" />
                  </svg>
                  <span className="font-bold text-lg">{media.name}</span>
                </div>
              </div>
              {/* Media outlet badge on image */}
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 text-xs font-bold text-slate-900 dark:text-white shadow-lg backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  {media.name}
                </span>
              </div>
              {/* External link indicator */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="inline-flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 p-2 shadow-lg backdrop-blur-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-sky-600 dark:text-sky-400"
                  >
                    <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative overflow-hidden">
  <div
    className="pointer-events-none absolute inset-x-0 -top-72 -z-20 h-160 blur-3xl"
    style={{ background: "var(--hero-gradient-top)" }}
    aria-hidden="true"
  />
  <div
    className="pointer-events-none absolute left-[12%] top-20 -z-10 h-64 w-64 rounded-full blur-3xl animate-float"
    style={{ background: "var(--hero-bubble-left)" }}
    aria-hidden="true"
  />
  <div
    className="pointer-events-none absolute right-[8%] top-36 -z-10 h-80 w-80 rounded-full blur-3xl animate-spin-slow"
    style={{ background: "var(--hero-bubble-right)" }}
    aria-hidden="true"
  />
      <section className="mx-auto w-full max-w-6xl px-6 pb-24 pt-24 sm:pt-28">
        <div className="relative grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-8 mt-2 flex justify-start sm:justify-start">
              <Logo variant="hero" priority />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-sky-600 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/70 dark:text-sky-300">
              AI-Native Learning OS
            </span>
            <h1 className="theme-heading mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Build <span className="bg-linear-to-r from-sky-500 via-cyan-400 to-sky-300 bg-clip-text text-transparent">future-first schools</span> with Sudarshan AI copilots for every journey.
            </h1>
            <p className="theme-muted mt-6 max-w-2xl text-lg leading-relaxed">
              iGyanAI unifies school operations, personalized learning, and venture incubation into a single intelligent fabric. Empower your community to learn, launch, and lead with confidence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-400/40 transition-all hover:-translate-y-0.5 hover:bg-sky-400"
              >
                <span>Book a demo</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0-6-6m6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/features"
                className="rounded-lg border border-sky-200 px-5 py-3 text-sm font-semibold text-sky-700 transition-colors hover:border-sky-400 hover:text-sky-500 dark:border-slate-700 dark:text-zinc-200 dark:hover:border-sky-400 dark:hover:text-sky-300"
              >
                Explore features
              </Link>
            </div>
          </div>
          <div className="theme-surface relative isolate overflow-hidden rounded-3xl border p-8 shadow-2xl shadow-sky-500/10 backdrop-blur">
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
              style={{ background: "var(--hero-card-spark-top)" }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full blur-3xl"
              style={{ background: "var(--hero-card-spark-bottom)" }}
              aria-hidden="true"
            />
            <div className="relative">
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-sky-600 dark:bg-sky-500/20 dark:text-sky-300">
                Platform features
              </span>
              <h2 className="theme-heading mt-4 text-2xl font-semibold">One AI-native OS, built for every journey.</h2>
              <div className="mt-6 space-y-3">
                {featureCards.map((feature, index) => (
                  <Link
                    key={feature.title}
                    href="/features"
                    className="theme-surface group flex items-start gap-4 rounded-2xl border p-4 shadow-sm shadow-sky-500/10 transition hover:-translate-y-0.5 hover:border-sky-300"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-lg font-bold text-sky-500 dark:bg-sky-500/20 dark:text-sky-300">0{index + 1}</span>
                    <span><span className="theme-heading block text-sm font-semibold group-hover:text-sky-500">{feature.title}</span><span className="theme-muted mt-1 block text-xs leading-relaxed">{feature.description}</span></span>
                  </Link>
                ))}
              </div>
              <Link href="/features" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-500 transition hover:text-sky-400">Explore all features <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="theme-surface-muted animate-float rounded-xl border p-4 text-sm font-medium shadow-lg shadow-sky-100/40 backdrop-blur transition-transform hover:-translate-y-1 dark:border-slate-800/60"
              style={{ animationDelay: `${index * 0.25}s` }}
            >
              {highlight}
            </div>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="theme-heading text-3xl font-semibold">
            Tailored journeys for institutions and individual learners
          </h2>
          <p className="theme-muted mt-3 max-w-3xl text-base">
            Choose the pathway that fits your community. Every feature below is mapped directly from the iGyan.ai offering matrix so your teams know exactly what is included.
          </p>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[
              {
                key: "institutionalSuite",
                title: "Institutional Suite • Institutions",
                description: "Transforming Institutions into Intelligent Learning Ecosystems with comprehensive AI-powered tools for education management.",
                badge: "Most comprehensive",
                cardClass:
                  "border-slate-900/70 bg-linear-to-br from-slate-950 via-slate-900 to-zinc-950 text-sky-50 shadow-sky-500/20 dark:border-slate-800/80",
              },
              {
                key: "professionalSuite",
                title: "Professional Suite • Learners & Families",
                description: "Foundation for Learners & Family – Personal AI copilots and learning tools that empower students and parents.",
                badge: "Popular choice",
                cardClass:
                  "border-sky-200/70 bg-linear-to-br from-sky-600 via-cyan-500 to-sky-400 text-white shadow-[0_30px_60px_-25px_rgba(56,189,248,0.45)]",
              },
            ].map((plan) => {
              const isDark = plan.key === "institutionalSuite";

              return (
                <div
                  key={plan.key}
                  className={`flex h-full flex-col overflow-hidden rounded-3xl border p-8 backdrop-blur ${plan.cardClass}`}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${
                        isDark
                          ? "bg-sky-500/15 text-sky-100"
                          : "bg-white/20 text-white/90"
                      }`}
                    >
                      {plan.badge}
                    </p>
                  </div>
                  <div className="mt-6 space-y-3">
                    <h3 className="text-2xl font-semibold">{plan.title}</h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        isDark ? "text-sky-100/80" : "text-white/80"
                      }`}
                    >
                      {plan.description}
                    </p>
                  </div>
                  <div className="mt-8 flex-1">
                    <ul className="space-y-3">
                      {offeringMatrix
                        .filter((feature) => feature[plan.key].status === "yes")
                        .map((feature) => {
                          const status = feature[plan.key];
                          const statusLabel = status.note ? `${status.note}` : "Included";

                          return (
                            <li
                              key={`${plan.key}-${feature.feature}`}
                              className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${
                                isDark
                                  ? "border-sky-500/15 bg-slate-900/70"
                                  : "border-white/20 bg-white/15"
                              }`}
                            >
                              <CheckCircle
                                className={`mt-0.5 h-5 w-5 ${
                                  isDark ? "text-sky-300" : "text-white"
                                }`}
                              />
                              <div>
                                <p className="text-sm font-medium leading-snug text-white">
                                  {feature.feature}
                                </p>
                                <p
                                  className={`text-xs font-medium ${
                                    isDark ? "text-sky-200/70" : "text-white/75"
                                  }`}
                                >
                                  {statusLabel}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                  <Link
                    href={plan.key === "institutionalSuite" ? "/login/institutional-suite" : "/login/launch-pad"}
                    className={`mt-10 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-lg transition-transform hover:-translate-y-0.5 ${
                        isDark
                          ? "bg-sky-500 text-white shadow-sky-400/40 hover:bg-sky-400"
                          : "bg-white/90 text-sky-700 shadow-black/20 hover:bg-white"
                      }`}
                  >
                    Continue to sign in
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="theme-surface mt-12 grid gap-6 rounded-3xl border p-10 shadow-2xl shadow-sky-500/10 backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className="theme-heading text-2xl font-semibold">
              One platform to orchestrate every moment of the learning lifecycle
            </h2>
            <p className="theme-muted text-base leading-relaxed">
              From admissions to alumni ventures, iGyanAI syncs your data, workflows, and community into a responsive system that learns with you.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="animate-float rounded-lg border border-sky-100 bg-sky-50/60 p-5 text-center shadow-sm shadow-sky-500/10 dark:border-sky-900/40 dark:bg-slate-900/40"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <p className="text-2xl font-semibold text-sky-600 dark:text-sky-300">{stat.value}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-sky-700/80 dark:text-sky-200/80">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="theme-surface-muted flex h-full flex-col justify-between rounded-2xl border bg-linear-to-br from-white via-sky-50 to-white p-8 shadow-inner shadow-sky-100/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <h3 className="theme-heading text-lg font-semibold">
              What if your school had its own AI mission control?
            </h3>
            <p className="theme-muted mt-4 text-sm leading-relaxed">
              iGyanAI fuses data across academics, operations, and community to surface recommendations in real time. Discover opportunities, prevent drop-offs, and launch passion-driven ventures with ease.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:-translate-y-0.5 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Talk to our strategists
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <h2 className="theme-heading text-center text-3xl font-semibold">
          Designed for modern school leaders
        </h2>
        <p className="theme-muted mx-auto mt-4 max-w-3xl text-center text-base">
              Whether you are scaling a network or reimagining a single campus, our modular Sudarshan AI copilots adapt to your unique vision.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              className="theme-surface group flex flex-col rounded-2xl border p-6 shadow-lg shadow-sky-500/10 transition-transform hover:-translate-y-1.5 hover:border-sky-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="theme-heading text-lg font-semibold transition-colors group-hover:text-sky-500">
                {feature.title}
              </h3>
              <p className="theme-muted mt-4 flex-1 text-sm leading-relaxed">{feature.description}</p>
              <Link
                href="/features"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-500 transition-colors hover:text-sky-400"
              >
                Learn more →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="theme-surface grid gap-10 rounded-3xl border p-10 shadow-2xl shadow-sky-500/10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <h2 className="theme-heading text-3xl font-semibold">
              Meet the iGyanAI Sudarshan AI Suite
            </h2>
            <p className="theme-muted text-base leading-relaxed">
              Seamless assistants tuned for every stakeholder, powered by your data and large language models with enterprise-grade governance.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-500 transition-colors hover:text-sky-400"
            >
              Request a custom pilot →
            </Link>
          </div>
          <div className="grid gap-4">
            {copilots.map((copilot, index) => (
              <div
                key={copilot.name}
                className="theme-surface-muted animate-float rounded-2xl border p-6 shadow-sm shadow-sky-500/10"
                style={{ animationDelay: `${index * 0.25}s` }}
              >
                <h3 className="theme-heading text-lg font-semibold">{copilot.name}</h3>
                <p className="theme-muted mt-2 text-sm leading-relaxed">{copilot.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-sky-700 px-8 py-16 text-center text-white shadow-2xl animate-glow">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.25),transparent)]" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">Ready to launch your AI-first campus?</h2>
            <p className="text-base text-sky-100/90">
              We partner with visionary schools to design future-forward experiences—from curriculum to capital access.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-sky-700 shadow-lg shadow-sky-950/40 transition-transform hover:-translate-y-0.5"
              >
                Connect with us
              </Link>
              <Link
                href="/about"
                className="rounded-lg border border-white/60 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Discover our mission
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
