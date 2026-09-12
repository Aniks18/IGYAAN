import Image from "next/image";
import Link from "next/link";
import FloatingContactActions from "@/components/floating-contact-actions";

export const metadata = {
  title: "About | IGYAN AI",
  description:
    "Learn how IGYAN AI is building an AI-native education operating system for students, teachers, parents, and institutions.",
};

const images = {
  hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuAB2kzjFT4zdXIyIQzYIaQoip9frhxdMXIuJ08_72bpDije92JwFc0piLPxQUl_jRkfEtw8i2twBOt0R2xpNQxTUllWT4vMAyK5fkvW8F3wIL8ZGKcdsSDBpSLJTfYMl4Yx6gufpUaWVsI21j_0HXBLS5LDNSHR9LU-yAtWfMryRwaq-lY4T98df5S3AcB51DFdggnm-5CnAUTkncFM1J_ccGzjEzEEDYMjiNKVLX3QQPBnSz9h088c90SWcH0lEmYNMwBftTjXTWA",
  sphere: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvk5CnG4TVjAFG8KIzWx6e6PICTeCVXZLpZSe_RneWmTIisGpSXAWT36ncNgAprslYWKOkDt3vAU8S6ej_tKDbEPYuO3PNCOnXBFcoVC-kdj6JlXDssoNePsnC4n_wjLROEE2tyFmnPmzxhFZuAat8qWdtzSPPdjRBugfz-lZYxhxc03v53dEHEzzeun_yEkoDpGeHhUnoJHQgIgfro9bgA2VSavalMiK_7Ynygyh6kj5fXap4Pu2vD6gLFAREa1MAm0GLlCkY8r8",
  vision: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWEzflw_QdfcFXDAg5s3FM6M_9esE1QKbHa9KitDwkHsGbFm1sOYKnYx5_rs8WBTu1Ra4dak3SBOw4AsdL-ynFG65b4YR1BDTE5y9nWlvixsSgtrAyDP83iOc1Ar0Mpnm7XI6dNsmBkLPDe60TM7wwvr734EB0ENL498AO6pkm8BXeuU9GwFf7PUSsCpyZ6xyQ1OdXFBJzPODN4NdVze1tus2tT-6lBRAZSXBWqXi1ZCWIjEvkGnaWC8xeswx4407dxbmQ1z_szD4",
};

const values = [
  { icon: "✓", title: "Trust", text: "We prioritize data privacy and ethical AI. Trust is the currency of education, and we ensure our platform is a safe harbor for student growth and institutional integrity." },
  { icon: "✦", title: "Innovation", text: "We don’t just follow trends; we set them. By integrating cutting-edge AI directly into the learning workflow, we create new possibilities for personalized education." },
  { icon: "↗", title: "Impact", text: "Success is measured by student outcomes. We are dedicated to creating tangible pathways to careers, entrepreneurship, and lifelong achievement for every learner." },
];

function Sparkle({ className = "" }) {
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0 14.8 9.2 24 12l-9.2 2.8L12 24l-2.8-9.2L0 12l9.2-2.8L12 0Z" /></svg>;
}

export default function AboutPage() {
  return (
    <>
      <section className="relative flex min-h-[640px] items-center overflow-hidden bg-[#0d1a33] px-6 py-16 text-white sm:px-10">
        <Sparkle className="absolute left-8 top-1/4 hidden h-11 w-11 animate-float text-amber-400/60 sm:block" />
        <Sparkle className="absolute right-10 top-1/3 hidden h-12 w-12 animate-float text-indigo-300/70 sm:block" />
        <div className="absolute inset-0 bg-[#0d1a33]">
          <Image alt="Futuristic university campus at dawn" className="object-cover opacity-20 mix-blend-overlay" src={images.hero} fill priority sizes="100vw" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-[56px]">Empowering the Next Generation of Talent</h1>
            <p className="mb-10 text-lg leading-relaxed text-indigo-100">We are building the world&apos;s first AI-native operating system for schools. IGYAN AI bridges the gap between traditional institutions and the rapidly evolving demands of the global workforce, ensuring every student has a personalized path to success.</p>
            <Link href="#story" className="inline-flex items-center gap-2 rounded-full bg-[#064bb2] px-8 py-4 font-bold shadow-md transition hover:-translate-y-0.5 hover:bg-[#003d91]">Learn More <span aria-hidden="true">↓</span></Link>
          </div>
        </div>
      </section>

      <section id="story" className="bg-white px-6 py-20 sm:px-10 md:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
          <div>
            <h2 className="mb-8 text-3xl font-bold tracking-tight text-[#063e91] sm:text-4xl">Our Story: From Idea to Intelligence</h2>
            <div className="space-y-6 leading-relaxed text-slate-600">
              <p>IGYAN AI began with a simple but profound observation: while the world was being transformed by technology, the foundational systems of education remained largely unchanged. We saw students graduating into an AI-driven economy with tools from a pre-digital era.</p>
              <p>Our journey led to the development of <span className="font-semibold text-[#064bb2]">Sudarshan AI</span>, a sophisticated copilot ecosystem designed specifically for the educational landscape. Named after the symbolic wheel of wisdom and protection, Sudarshan AI isn&apos;t just an assistant. It&apos;s a lifelong learning companion that evolves with the user.</p>
              <p>Today, IGYAN AI serves as the operating system for forward-thinking institutions, turning classrooms into incubators for entrepreneurship, creativity, and technical mastery.</p>
            </div>
            <p className="mt-10 border-l-2 border-indigo-300 pl-5 text-sm leading-relaxed text-slate-500">Founded by a team of educators, engineers, and visionaries.</p>
          </div>
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-200 via-white to-cyan-100 p-4 shadow-2xl">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100"><Image alt="Glowing ethereal blue sphere representing Sudarshan AI" className="object-cover" src={images.sphere} fill quality={80} loading="lazy" sizes="(max-width: 768px) 100vw, 560px" /></div>
            </div>
            <div className="absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-full bg-cyan-200/70 blur-3xl" />
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20 sm:px-10 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center"><h2 className="mb-4 text-3xl font-bold tracking-tight text-[#063e91] sm:text-4xl">Guided by Our Core Values</h2><p className="text-slate-600">Our principles are the foundation of every line of code we write and every partnership we form.</p></div>
          <div className="grid gap-6 md:grid-cols-3">
            {values.map((value) => <article key={value.title} className="group rounded-3xl border border-slate-200 bg-white p-10 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"><div className="mb-8 flex h-16 w-16 items-center justify-center rounded-xl border border-slate-100 bg-white text-3xl font-bold text-[#064bb2] shadow-sm transition group-hover:scale-110">{value.icon}</div><h3 className="mb-4 text-2xl font-bold text-[#063e91]">{value.title}</h3><p className="leading-relaxed text-slate-600">{value.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 px-6 py-20 text-white sm:px-10 md:py-28">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7"><h2 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">The Future of Talent is Motion</h2><p className="mb-12 text-lg leading-relaxed text-indigo-100">Our vision extends beyond the classroom. We imagine a world where the friction between learning and earning is eliminated. A world where an AI-native OS manages the complexities of curriculum, assessment, and career matching, allowing humans to focus on what they do best: creating, leading, and innovating.</p><div className="grid grid-cols-2 gap-8"><div className="border-l-2 border-cyan-300 pl-6"><div className="mb-1 text-4xl font-bold">1M+</div><div className="text-sm text-indigo-200">Students Empowered by 2026</div></div><div className="border-l-2 border-cyan-300 pl-6"><div className="mb-1 text-4xl font-bold">500+</div><div className="text-sm text-indigo-200">Partner Institutions Globally</div></div></div></div>
          <div className="lg:col-span-5"><div className="rounded-3xl border-4 border-white/15 bg-white/10 p-2 shadow-2xl"><div className="relative aspect-[4/5] overflow-hidden rounded-2xl"><Image alt="Student wearing an AR learning headset" className="object-cover" src={images.vision} fill quality={80} loading="lazy" sizes="(max-width: 1024px) 100vw, 420px" /></div></div></div>
        </div>
      </section>

      <section className="bg-white px-6 py-20 text-center sm:px-10 md:py-28">
        <div className="mx-auto max-w-3xl"><div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">ϟ Join the Revolution</div><h2 className="mb-6 text-4xl font-bold tracking-tight text-[#063e91] sm:text-5xl">Join Our Mission</h2><p className="mb-10 text-lg leading-relaxed text-slate-600">Whether you are a school leader looking to modernize your campus or a partner interested in the future of education, we want to hear from you.</p><div className="flex flex-col justify-center gap-4 sm:flex-row"><Link href="/contact" className="rounded-full bg-[#064bb2] px-10 py-4 font-bold text-white shadow-md transition hover:scale-[1.02] hover:bg-[#003d91]">Partner with Us</Link><Link href="/contact" className="rounded-full border-2 border-slate-300 px-10 py-4 font-bold text-[#063e91] transition hover:bg-slate-100">Contact Team</Link></div></div>
      </section>

      <FloatingContactActions />
    </>
  );
}
