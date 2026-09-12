"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, GraduationCap, Landmark, Route, Rocket, UserRound, UsersRound } from "lucide-react";
import FloatingContactActions from "@/components/floating-contact-actions";

const pillars = [
  { Icon: GraduationCap, title: "Personalized Learning", text: "Tailored curricula that adapt to every student’s pace, interests, and learning style using advanced diagnostic AI.", points: ["Adaptive Knowledge Maps", "Personalized Feedback Loops"] },
  { Icon: Route, title: "Career Pathways", text: "Bridging the gap between education and industry with AI-driven career mapping and professional development.", points: ["Skills-to-Market Mapping", "Industry Internship Matching"] },
  { Icon: Rocket, title: "Entrepreneurship Readiness", text: "Fostering an innovation mindset with hands-on labs and Sudarshan AI-powered business simulation tools.", points: ["Venture Launchpad Access", "Financial Literacy Modules"] },
];

const featureData = {
  institutions: {
    label: "Institutions",
    icon: "⌂",
    title: "Institutions & Leaders",
    description: "Transforming campuses into intelligent learning ecosystems with comprehensive AI management.",
    features: [
      { name: "Principal Sudarshan AI", desc: "Forecast admissions, manage compliance, and orchestrate school-wide goals." },
      { name: "Institutional Innovation Hub", desc: "Virtual incubation for campus-wide innovation." },
      { name: "Smart Scheduler", desc: "AI timetable and smart substitution scheduling." },
      { name: "Insights Dashboard", desc: "Executive dashboards for real-time telemetry." },
    ],
  },
  teachers: {
    label: "Teachers",
    icon: "◇",
    title: "Teachers & Faculty",
    description: "Empower educators with intelligent tools to generate content and manage classrooms.",
    features: [
      { name: "Faculty Sudarshan AI", desc: "Generate lesson plans, formative assessments, and differentiated content." },
      { name: "Teacher Toolkit", desc: "Content generation and multiple AI productivity tools." },
      { name: "AI Assessment Suite", desc: "Voice-based evaluation and automated grading." },
      { name: "AI Homework Management", desc: "Automate task distribution and tracking." },
    ],
  },
  students: {
    label: "Students",
    icon: "♙",
    title: "Students & Learners",
    description: "Personalized AI copilots guiding daily learning goals and career exploration.",
    features: [
      { name: "Student Sudarshan AI", desc: "Your 24/7 personal chat-based mentor and co-pilot." },
      { name: "AI Shark Simulation", desc: "Real-time pitch feedback for student founders." },
      { name: "Creator Suite", desc: "Multiple AI tools for creative projects." },
      { name: "AI VivaVerse", desc: "Immersive AI conversations and learning." },
    ],
  },
  parents: {
    label: "Parents",
    icon: "♟",
    title: "Parents & Families",
    description: "Real-time insights and life direction tools to support your child's journey.",
    features: [
      { name: "Gyani Sage", desc: "Life direction sessions and holistic guidance." },
      { name: "Growth Tracking", desc: "Real-time insights into student progress." },
      { name: "Events Dashboard", desc: "Global events and competition hub." },
      { name: "Family Co-pilot", desc: "Collaborative tools for parents to support learning." },
    ],
  },
};

const insights = [
  { category: "Indian Education", date: "Oct 12, 2025", time: "5 min read", title: "How AI is Reshaping Rural Education in India", text: "Bridging the digital divide with adaptive learning technologies that operate effectively in low-bandwidth environments.", image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80" },
  { category: "EdTech Trends", date: "Sep 28, 2025", time: "7 min read", title: "Top 5 EdTech Trends to Watch in 2026", text: "From generative AI assistants for teachers to predictive analytics for student retention.", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80" },
  { category: "NEP 2020", date: "Sep 15, 2025", time: "6 min read", title: "Aligning AI with the National Education Policy 2020", text: "How institutions can leverage intelligent systems to meet holistic assessment and multi-disciplinary goals.", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80" },
];

export default function FeaturesPage() {
  return <>
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fff5ec] via-[#ece5ff] to-[#3b1595] px-6 py-20 sm:px-10 md:py-24">
      <Sparkle className="absolute left-8 top-1/4 hidden h-11 w-11 animate-float text-amber-500 sm:block" /><Sparkle className="absolute right-10 top-1/3 hidden h-12 w-12 animate-float text-indigo-500 sm:block" />
      <div className="relative z-10 mx-auto max-w-6xl text-center"><div className="mx-auto max-w-4xl"><h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-[#1e1b4b] sm:text-5xl md:text-[56px]">One AI-native OS for how your school teaches, tracks, and grows talent.</h1><p className="mx-auto mb-9 max-w-2xl text-lg leading-relaxed text-slate-700">Find your <span className="font-semibold text-[#3b1595]">&quot;wow!&quot;</span> this school year with personalized learning, career pathways, and entrepreneurship readiness.</p><div className="mb-14 flex flex-wrap justify-center gap-4"><Link href="/contact" className="rounded-full bg-[#064bb2] px-8 py-4 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#003d91]">Partner with us →</Link><Link href="#features" className="rounded-full border-2 border-[#064bb2]/25 px-8 py-4 font-semibold text-[#064bb2] transition hover:-translate-y-0.5 hover:border-[#064bb2]">Explore the platform</Link></div></div><div className="relative mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/60 p-4 shadow-[0_30px_65px_-15px_rgba(0,71,171,0.18)] backdrop-blur-xl"><div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-200"><Image src="/student_engagement_hd.webp" alt="Students learning together in a classroom" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 960px" /></div><div className="absolute -bottom-6 -left-3 max-w-[240px] rounded-2xl border border-white bg-white/90 p-4 text-left shadow-xl backdrop-blur sm:-left-8"><p className="mb-1 font-bold text-[#1e1b4b]">↗ Student Success</p><p className="text-sm leading-snug text-slate-500">Real-time engagement tracking powered by Sudarshan AI.</p></div></div></div>
    </section>

    <section id="features" className="bg-[#f6f7fb] px-6 py-16 sm:px-10 md:py-20"><div className="mx-auto max-w-[1200px]"><p className="mx-auto mb-10 max-w-2xl text-center leading-relaxed text-slate-600">We build more than software; we provide a foundation for the next generation of leaders through three core pillars.</p><div className="grid gap-6 md:grid-cols-3">{pillars.map(({ Icon, title, text, points }) => <article key={title} className="group rounded-[1.75rem] border border-white bg-white p-8 shadow-[0_12px_35px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.1)]"><div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-slate-100 bg-white text-[#064bb2] shadow-sm"><Icon className="h-7 w-7" aria-hidden="true" /></div><h3 className="mb-4 text-2xl font-bold leading-tight text-[#064bb2]">{title}</h3><p className="mb-6 leading-relaxed text-slate-600">{text}</p><ul className="space-y-3 text-sm font-medium text-slate-800">{points.map((point) => <li key={point} className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden="true" />{point}</li>)}</ul></article>)}</div></div></section>

    <section className="bg-white px-6 py-20 sm:px-10 md:py-28"><div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2"><div className="order-2 lg:order-1"><div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-indigo-100 bg-indigo-50 p-3 shadow-xl"><Image src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVJzfp-VDjUE3IqLOVIQWbG8LkC1-5eagRne71KDjqHFYqYZx35zZIPiqvgZAcFZrGlDj8SnF2kDYeyze-fGYaPjpkGDbzbEX8PULNluJSWVPor37nJFiHNafKjECzkHwm9Hn-cQodJOP-eG7kmQDkxifKU2CKkSfLsXEHNFN8bD1PmFk4iRLdtlVH5u9XPQuYtuk9-mIf8jOax0DD22zTm0IFWc0Vq6HzLwYVmUK5eVd-HuM6LBxide7jwOL_CL8CJ2bxWrUloEY" alt="Sudarshan AI dashboard" fill quality={80} loading="lazy" className="rounded-2xl object-contain" sizes="(max-width: 1024px) 100vw, 560px" /></div></div><div className="order-1 lg:order-2"><h2 className="mb-6 text-4xl font-bold tracking-tight text-[#1e1b4b]">✦ Meet Sudarshan AI</h2><p className="mb-9 text-lg leading-relaxed text-slate-600">Our proprietary Sudarshan AI Copilot is the heart of the IGYAN AI OS. It acts as a 24/7 personal tutor for students and an administrative assistant for educators, ensuring no talent goes untapped.</p><div className="space-y-7">{[["◌", "Intelligent Lesson Planning", "Sudarshan generates context-aware lesson plans that align with global standards while meeting local classroom needs."], ["◒", "Student Mentor Bot", "Real-time academic support, concept explanation, and career guidance tailored to each student’s unique profile."], ["↗", "Predictive Analytics", "Identify at-risk students before grades drop and recommend high-impact interventions automatically."]].map(([icon, title, text]) => <div key={title} className="flex gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xl font-bold text-[#3b1595]">{icon}</div><div><h3 className="mb-1 text-xl font-bold text-[#1e1b4b]">{title}</h3><p className="leading-relaxed text-slate-500">{text}</p></div></div>)}</div></div></div></section>

    <section className="bg-slate-50 px-6 py-20 sm:px-10 md:py-28"><div className="mx-auto max-w-6xl"><div className="mb-10 text-center"><h2 className="text-4xl font-extrabold tracking-tight text-[#1e1b4b]">Built for Every Journey</h2></div><FeatureTabs /></div></section>

    <section className="bg-white px-6 py-20 sm:px-10 md:py-28"><div className="mx-auto max-w-6xl"><div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><h2 className="text-4xl font-extrabold tracking-tight text-slate-900">Latest Insights</h2></div><Link href="/insights/blogs" className="font-bold text-[#064bb2] transition hover:text-[#003d91]">View All Articles →</Link></div><div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{insights.map((insight) => <Link key={insight.title} href="/insights/blogs" className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#064bb2]"><div className="relative h-56 overflow-hidden"><Image src={insight.image} alt={insight.title} fill loading="lazy" quality={75} className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 380px" /><span className="absolute left-4 top-4 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white">{insight.category}</span></div><div className="flex flex-1 flex-col p-6"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{insight.date} · {insight.time}</p><h3 className="mb-3 text-xl font-bold leading-tight text-slate-900 transition group-hover:text-[#064bb2]">{insight.title}</h3><p className="mb-6 flex-1 text-sm leading-relaxed text-slate-600">{insight.text}</p></div></Link>)}</div></div></section>


    <section className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 px-6 py-20 text-center text-white sm:px-10 md:py-28"><div className="relative z-10 mx-auto max-w-3xl"><h2 className="mb-6 text-4xl font-bold tracking-tight">Ready to Transform Your School?</h2><p className="mb-10 text-lg leading-relaxed text-indigo-100">Join forward-thinking institutions across India in deploying the first AI-native operating system for modern talent.</p><div className="flex flex-col justify-center gap-4 sm:flex-row"><Link href="/contact" className="rounded-full bg-[#064bb2] px-10 py-4 font-bold shadow-md transition hover:scale-[1.02] hover:bg-[#003d91]">Partner with us</Link><Link href="/contact" className="rounded-full border border-white/40 px-10 py-4 font-bold transition hover:bg-white/10">Request a Demo</Link></div></div></section>
    <FloatingContactActions />
  </>;
}

function Sparkle({ className }) { return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0 14.8 9.2 24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8L12 0Z" /></svg>; }
function SectionTitle({ title, text }) { return <div className="mx-auto mb-16 max-w-2xl text-center"><h2 className="mb-4 text-4xl font-bold tracking-tight text-[#063e91]">{title}</h2><p className="leading-relaxed text-slate-600">{text}</p></div>; }
function FeatureTabs() {
  const [active, setActive] = useState("institutions");
  const current = featureData[active];
  const tabs = [
    { key: "institutions", label: "Institutions", Icon: Landmark },
    { key: "teachers", label: "Teachers", Icon: GraduationCap },
    { key: "students", label: "Students", Icon: UserRound },
    { key: "parents", label: "Parents", Icon: UsersRound },
  ];
  return <div>
    <div className="mb-10 flex flex-wrap justify-center gap-4">
      {tabs.map((tab) => <button key={tab.key} type="button" onClick={() => setActive(tab.key)} className={`flex items-center gap-2 rounded-full border px-7 py-3.5 font-semibold transition-all duration-300 ${active === tab.key ? "scale-105 border-[#064bb2] bg-[#064bb2] text-white shadow-lg shadow-blue-950/20 hover:bg-[#003d91]" : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}><tab.Icon className="h-5 w-5" aria-hidden="true" />{tab.label}</button>)}
    </div>
    {current && <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_28px_55px_-38px_rgba(15,23,42,0.4)] sm:p-10 md:p-16">
      <div className="mx-auto max-w-3xl text-center"><h3 className="text-3xl font-extrabold tracking-tight text-[#1e1b4b] sm:text-4xl">{current.title}</h3><p className="mt-4 text-lg leading-relaxed text-slate-600">{current.description}</p></div>
      <div className="mt-12 grid gap-7 md:grid-cols-2">
        {current.features.map((feature) => <article key={feature.name} className="flex gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-violet-300 hover:bg-white"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#ede9fe] text-xl font-bold text-[#3b1595]" aria-hidden="true">✦</span><div><h4 className="text-xl font-bold text-[#1e1b4b]">{feature.name}</h4><p className="mt-2 leading-relaxed text-slate-600">{feature.desc}</p></div></article>)}
      </div>
    </div>}
  </div>;
}
