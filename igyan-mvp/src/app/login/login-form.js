'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, ChartNoAxesColumn, Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import Logo from "@/components/logo";
import FloatingContactActions from "@/components/floating-contact-actions";
import { useAuth } from "../utils/auth_context";

const VARIANT_COPY = {
  institutionalSuite: {
    eyebrow: "Institutional Suite",
    title: "Welcome back",
    subtitle: "For super admins, principals, and teachers.",
    emailPlaceholder: "you@institution.edu",
    signupLabel: "Request workspace access",
    signupHref: "/register/institutional-suite",
  },
  professionalSuite: {
    eyebrow: "Launch Pad",
    title: "Welcome back",
    subtitle: "For students and parents.",
    emailPlaceholder: "you@example.com",
    signupLabel: "Create your account",
    signupHref: "/register/launch-pad",
  },
};

function FeaturePill({ children }) {
  return <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">{children}</span>;
}

export default function LoginForm({ variant = "institutionalSuite", initialError = "" }) {
  const config = VARIANT_COPY[variant] ?? VARIANT_COPY.institutionalSuite;
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPasswordError("");
    const formData = new FormData(event.target);
    const result = await login(formData.get("email"), formData.get("password"), variant);
    if (!result.success) {
      if (result.field === "password") {
        setPasswordError(result.error);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-x-clip bg-white text-slate-900">
      <section className="relative hidden min-h-screen w-1/2 overflow-hidden bg-[#242a81] px-10 py-12 md:flex xl:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(122deg,#1666be_0%,#27358e_46%,#74159d_100%)]" />
        <div className="absolute inset-0 opacity-[0.13] [background-image:radial-gradient(#fff_1.15px,transparent_1.15px)] [background-size:32px_32px]" />
        <div aria-hidden="true" className="absolute left-[7%] top-[18%] h-10 w-10 rotate-12 text-[#f3cb60]/75"><Sparkles className="h-full w-full" /></div>
        <div className="absolute bottom-[20%] right-[9%] h-12 w-12 -rotate-12 text-[#b69cf4]/55"><Sparkles className="h-full w-full" /></div>

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[620px] flex-col">
          <Link href="/" className="flex w-fit items-center gap-3 text-white transition-opacity hover:opacity-85">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/25 bg-white/10 p-2 shadow-[0_12px_30px_rgba(12,18,80,0.24)] backdrop-blur-md"><Logo variant="compact" /></div>
            <span className="text-[1.8rem] font-extrabold tracking-tight">IGYAN AI</span>
          </Link>

          <div className="my-auto py-10">
            <h1 className="max-w-[560px] text-4xl font-extrabold leading-[1.12] tracking-[-0.04em] text-white sm:text-5xl">Empowering the future of learning.</h1>
            <p className="mt-7 max-w-[540px] text-base leading-relaxed text-indigo-100 xl:text-lg">Join the AI-native operating system designed to map personalized pathways, automate workflows, and ignite student success.</p>
            <div className="mt-12 flex flex-wrap gap-4">
              <FeaturePill><ChartNoAxesColumn className="h-4 w-4 text-cyan-300" /> Predictive paths</FeaturePill>
              <FeaturePill><Bot className="h-4 w-4 text-purple-200" /> AI mentors</FeaturePill>
            </div>
          </div>

          <blockquote className="rounded-[1.45rem] border border-white/25 bg-white/[0.13] p-7 text-white shadow-[0_16px_45px_rgba(20,17,90,0.2)] backdrop-blur-md xl:p-8">
            <p className="text-3xl font-bold leading-none text-cyan-300/80">“</p>
            <p className="mt-1 text-[0.95rem] font-medium leading-relaxed xl:text-base">IGYAN AI has transformed how we track student progress and intervene exactly when they need help.</p>
            <footer className="mt-5 flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" alt="Dr. Sarah Jenkins" width={44} height={44} loading="lazy" decoding="async" className="h-11 w-11 rounded-full border-2 border-[#f9b24d]/80 object-cover" />
              <span><b className="block text-base">Dr. Sarah Jenkins</b><small className="mt-0.5 block text-sm text-indigo-100">Director of Academics, Future Prep</small></span>
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="relative flex min-h-screen w-full items-center justify-center bg-white p-6 sm:p-12 md:w-1/2 xl:p-24">
        <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 md:hidden"><ArrowLeft className="h-4 w-4" /> Home</Link>
        <div className="w-full max-w-[380px] animate-[fadeIn_0.5s_ease-out]">
          <div className="mb-10 text-center md:text-left">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#0955b9]">{config.eyebrow}</p>
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#0f1d3c] sm:text-4xl">{config.title}</h2>
            <p className="mt-3 text-slate-500">{config.subtitle}</p>
            {error ? <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-medium text-red-600">{error}</p> : null}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="ml-1 block text-sm font-semibold text-slate-700">Email address</label>
              <div className="relative mt-1.5"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="email" name="email" type="email" required placeholder={config.emailPlaceholder} className="w-full rounded-xl border border-[#d0d9e9] bg-white py-3 pl-11 pr-4 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0955b9] focus:ring-2 focus:ring-[#0955b9]/20 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#ffffff_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a]" /></div>
            </div>
            <div>
              <label htmlFor="password" className="ml-1 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative mt-1.5"><input id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="Enter your password" aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "password-error" : undefined} onChange={() => setPasswordError("")} className={`w-full rounded-xl border bg-white px-4 py-3 pr-12 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-2 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#ffffff_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#0f172a] ${passwordError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-[#d0d9e9] focus:border-[#0955b9] focus:ring-[#0955b9]/20"}`} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-[#0955b9]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
              {passwordError ? <p id="password-error" role="alert" className="mt-1.5 ml-1 text-sm font-medium text-red-600">{passwordError}</p> : null}
            </div>
            <div className="flex items-center justify-between gap-3 pt-1 text-sm"><label className="flex cursor-pointer items-center gap-2 text-slate-600"><input name="remember-me" type="checkbox" className="h-4 w-4 appearance-none rounded border border-slate-400 bg-white text-[#0955b9] transition checked:border-[#0955b9] checked:bg-[#0955b9] checked:after:block checked:after:text-center checked:after:text-[11px] checked:after:leading-[14px] checked:after:text-white checked:after:content-['✓'] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0955b9]" /> Remember me</label><Link href="/forgot-password" className="whitespace-nowrap font-semibold text-[#0955b9] transition hover:text-[#073e88]">Forgot password?</Link></div>
            <button type="submit" disabled={loading} className="mt-6 w-full rounded-full bg-[#0955b9] px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-[#0955b9]/20 transition hover:-translate-y-0.5 hover:bg-[#073e88] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0955b9] disabled:cursor-not-allowed disabled:opacity-55">{loading ? "Signing in..." : "Sign in to your account"}</button>
          </form>
          <p className="mt-8 text-center text-sm text-slate-500">Don&apos;t have an account? <Link href={config.signupHref} className="font-bold text-[#0955b9] transition hover:text-[#073e88]">{config.signupLabel}</Link></p>
        </div>
      </section>

      <FloatingContactActions />
    </div>
  );
}
