"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../utils/auth_context";
import { supabase } from "../utils/supabase";
import Link from "next/link";
import Image from "next/image";
import SchoolOnboarding from "../../components/dashboard/school-onboarding";
import { Spinner, Badge } from "../../components/ui";
import {
	GraduationCap, CheckCircle, BarChart3, Clock, BookOpen,
	Volume2, Briefcase, MessageCircle, ArrowUpRight, Calendar,
	Rocket, Shield
} from "lucide-react";
import PremiumStudentDashboard from "../../components/dashboard/premium-student-dashboard";
import FacultyDashboard from "../../components/dashboard/faculty-dashboard";
import SuperAdminDashboard from "../../components/dashboard/superadmin-dashboard";

export default function DashboardPage() {
	const { user, session, loading } = useAuth();
	const router = useRouter();
	const [hasSchool, setHasSchool] = useState(() => user?.school_id ? true : null);
	const [checkingSchool, setCheckingSchool] = useState(() => !user || !user?.school_id);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	// Check if user has a school (only for institutional users without school_id)
	useEffect(() => {
		const checkSchool = async () => {
			if (!user) return;

			if (user.school_id) {
				setHasSchool(true);
				setCheckingSchool(false);
				return;
			}

			// B2C users don't need school onboarding
			const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];
			if (LAUNCH_PAD_ROLES.includes(user.role)) {
				setHasSchool(true);
				setCheckingSchool(false);
				return;
			}

			// Super admins, co-admins, and faculty render their dedicated dashboards directly
			if (user.role === "super_admin" || user.role === "co_admin" || user.role === "faculty") {
				setHasSchool(true);
				setCheckingSchool(false);
				return;
			}

			try {
				const { data, error } = await supabase
					.from("schools")
					.select("id")
					.limit(1)
					.maybeSingle();

				if (error && error.code !== "PGRST116") {
					console.error("Error checking school:", error);
				}

				setHasSchool(!!data);
			} catch (err) {
				console.error("Error checking school:", err);
			} finally {
				setCheckingSchool(false);
			}
		};

		if (user) {
			checkSchool();
		}
	}, [user]);

	const handleOnboardingComplete = async () => {
		// Refresh user data to get the updated school_id
		const { data: sessionData } = await supabase
			.from("sessions")
			.select("*, users(*)")
			.eq("session_token", localStorage.getItem("session_token"))
			.eq("is_active", true)
			.single();

		if (sessionData?.users) {
			console.log("User data refreshed with school_id:", sessionData.users.school_id);
		}

		setHasSchool(true);
		// Trigger a re-render to fetch school data with updated user
		window.location.reload();
	};

	if (loading || checkingSchool) {
		return <Spinner text="Loading your dashboard..." />;
	}

	if (!user) return null;

	if (user.role === "super_admin" || user.role === "co_admin") {
		return <SuperAdminDashboard user={user} />;
	}

	if (user.role === "faculty") {
		return <FacultyDashboard user={user} />;
	}

	// Show onboarding if user has no school
	if (hasSchool === false) {
		return (
			<SchoolOnboarding userId={user.id} onComplete={handleOnboardingComplete} />
		);
	}

	const firstName = user.full_name?.split(" ")[0] || "Learner";
	const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];
	const isB2CUser = LAUNCH_PAD_ROLES.includes(user.role);
	const isMentor = user.role === 'b2c_mentor';
	const isParent = user.role === 'parent';

	// Different labels for B2C users vs institutional users
	const statCards = [
		{
			label: isParent ? "My Children" : isMentor ? "Active Builders" : isB2CUser ? "Active Ideas" : "Active Courses",
			value: "8",
			trend: "+2 this week",
			accent: "indigo",
			icon: GraduationCap,
			iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
		},
		{
			label: isParent ? "Attendance This Week" : isMentor ? "Reviews Completed" : isB2CUser ? "Launch Tasks Completed" : "Completed Tasks",
			value: "23",
			trend: "Great momentum",
			accent: "sky",
			icon: CheckCircle,
			iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
		},
		{
			label: isParent ? "Attendance Rate" : isMentor ? "Decision Accuracy" : isB2CUser ? "Pitch Readiness Score" : "Avg Performance",
			value: "92%",
			trend: "Stable progression",
			accent: "purple",
			icon: BarChart3,
			iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
		},
		{
			label: isParent ? "School Notices" : isMentor ? "Mentor Time Invested" : isB2CUser ? "Focused Build Time" : "Learning Time",
			value: "42h",
			trend: "+6h vs last week",
			accent: "emerald",
			icon: Clock,
			iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
		},
	];

	const quickActions = [
		{
			title: isParent ? "My Children" : isMentor ? "Builder Queue" : isB2CUser ? "Idea Portals" : "Explore Courses",
			description: isParent ? "View your children's attendance, grades and progress" : isMentor ? "Review pending student ideas and submissions" : isB2CUser ? "Government & private ideas you can build on" : "Discover curated learning paths tailored to you",
			href: isParent ? "/dashboard/parent/children" : "/features",
			buttonText: isParent ? "View Children" : isMentor ? "Open Queue" : isB2CUser ? "Explore Ideas" : "Open",
			iconBg: "bg-white/70 text-indigo-600 dark:bg-white/10 dark:text-indigo-300",
			icon: BookOpen,
		},
		{
			title: isParent ? "Messages & Teachers" : isMentor ? "Sudarshan AI (Mentor Mode)" : isB2CUser ? "Sudarshan AI (Student Mode)" : "Open iGyanAI",
			description: isParent ? "Contact class teachers and view school messages" : isMentor ? "AI co-pilot for mentoring, reviewing & guiding" : isB2CUser ? "Your AI guide for thinking, building & pitching" : "Chat with your AI mentor for voice-first guidance",
			href: isParent ? "/dashboard/parent/messages" : isB2CUser ? "/dashboard/sudarshan" : "/dashboard/viva-ai",
			buttonText: isParent ? "Open Messages" : isMentor ? "Open Mentor Console" : isB2CUser ? "Enter Command Mode" : "Open",
			iconBg: "bg-white/70 text-pink-600 dark:bg-white/10 dark:text-pink-300",
			icon: Volume2,
		},
		{
			title: isParent ? "Report Cards" : isMentor ? "Validation Desk" : isB2CUser ? "Startup Lab (Student Access)" : "Career Hub",
			description: isParent ? "View your children's academic reports and grades" : isMentor ? "Approve, reject, or flag ideas for improvement" : isB2CUser ? "Incubators, grants & startup support paths" : "Match your strengths with future pathways",
			href: isParent ? "/dashboard/parent/report-cards" : isMentor ? "/dashboard/incubation-hub" : isB2CUser ? "/dashboard/incubation-hub" : "/features",
			buttonText: isParent ? "View Reports" : isMentor ? "Open Desk" : isB2CUser ? "Explore Support" : "Open",
			iconBg: "bg-white/70 text-purple-600 dark:bg-white/10 dark:text-purple-300",
			icon: Briefcase,
		},
		{
			title: isParent ? "School Events" : isMentor ? "Mentor Support Desk" : isB2CUser ? "Launch Help Desk" : "Need Support?",
			description: isParent ? "Upcoming school events, holidays and activities" : isMentor ? "Escalate issues or request admin support" : isB2CUser ? "Get help when you're stuck" : "Reach the iGyaan team for quick assistance",
			href: isParent ? "/dashboard/parent/events" : "/contact",
			buttonText: isParent ? "View Events" : isMentor ? "Get Support" : isB2CUser ? "Ask for Help" : "Open",
			iconBg: "bg-white/70 text-emerald-600 dark:bg-white/10 dark:text-emerald-300",
			icon: MessageCircle,
		},
	];

	const focusAreas = isParent ? [
		{
			title: "Check Attendance",
			detail: "Review today's attendance status for your children",
			tags: ["Daily", "Attendance"],
		},
		{
			title: "Homework Status",
			detail: "See pending homework and assignment deadlines",
			tags: ["Academics", "Tracking"],
		},
		{
			title: "Upcoming PTM",
			detail: "Parent-Teacher meeting scheduled this month",
			tags: ["Meeting", "School"],
		},
	] : isMentor ? [
		{
			title: "Idea Clarity Review",
			detail: "Check if the problem statement is well-defined",
			tags: ["10 min", "Review"],
		},
		{
			title: "Pitch Narrative Feedback",
			detail: "Is the story compelling enough?",
			tags: ["Feedback", "Pitch"],
		},
		{
			title: "Rapid Pitch Review",
			detail: "Quick yes/no decision on prototype viability",
			tags: ["Decision", "5 min"],
		},
	] : isB2CUser ? [
		{
			title: "Clarity Sprint",
			detail: "Define the core problem your idea solves",
			tags: ["15 min", "Idea Clarity"],
		},
		{
			title: "Problem Story Builder",
			detail: "Explain your idea using a relatable story",
			tags: ["Project", "Pitch Draft"],
		},
		{
			title: "Quick Idea Rehearsal",
			detail: "Sharpen how you explain your idea",
			tags: ["Clarity", "Confidence"],
		},
	] : [
		{
			title: "Math sprint",
			detail: "Revise algebraic identities before Friday's quiz",
			tags: ["15 min", "Concept clarity"],
		},
		{
			title: "Science storyteller",
			detail: "Explain Newton's laws using a skateboard analogy",
			tags: ["Project", "Presentation"],
		},
		{
			title: "Stand-up revision",
			detail: "Draft 3 witty mnemonics for biology terms",
			tags: ["Creative", "Fun"],
		},
	];

	const aiHighlights = isParent ? [
		{
			title: "Attendance Alert",
			detail: "All children marked present today. Great consistency this week!",
		},
		{
			title: "Academic Update",
			detail: "Report cards for this term will be available next week.",
		},
		{
			title: "School Notice",
			detail: "Annual sports day preparation starts from next Monday. Stay tuned!",
		},
	] : isMentor ? [
		{
			title: "AI Summary Note",
			detail: "3 ideas reviewed today. One flagged for re-submission.",
		},
		{
			title: "Builder Momentum Signal",
			detail: "Rohan's consistency improved this week. Consider fast-tracking his review.",
		},
		{
			title: "Your Guidance Impact",
			detail: "Your feedback last week led to 4 revised submissions. Great mentoring!",
		},
	] : isB2CUser ? [
		{
			title: "AI Feedback Summary",
			detail: "Your idea clarity improved! Next: work on the pitch opening.",
		},
		{
			title: "Consistency Signal",
			detail: "Consistency streak of 5 focused sessions this week. Keep the streak alive!",
		},
		{
			title: "Mentor Guidance Note",
			detail: "Coach Anil suggests documenting prototype learnings in Notion after each session.",
		},
	] : [
		{
			title: "Viva AI recap",
			detail: "You asked about electrostatics. Next try linking it to drone design!",
		},
		{
			title: "Momentum boost",
			detail: "Consistency streak of 5 focused sessions this week. Keep the streak alive!",
		},
		{
			title: "Mentor echo",
			detail: "Coach Anil suggests documenting prototype learnings in Notion after each session.",
		},
	];

	const upcomingSessions = isParent ? [
		{
			time: "Today",
			title: "Attendance Check",
			description: "Check your children's attendance status",
		},
		{
			time: "This Week",
			title: "Parent-Teacher Meeting",
			description: "Discuss academic progress with class teacher",
		},
		{
			time: "This Month",
			title: "Term Report Cards",
			description: "View and download term-end report cards",
		},
	] : isMentor ? [
		{
			time: "Today · 7:30 PM",
			title: "Idea Review Session",
			description: "Review 3 pending idea submissions",
		},
		{
			time: "Tomorrow · 5:00 PM",
			title: "Pitch Validation Call",
			description: "Provide feedback on Rohan's pitch deck",
		},
		{
			time: "Friday · 4:00 PM",
			title: "Prototype Feedback Session",
			description: "Review and approve prototype demos",
		},
	] : isB2CUser ? [
		{
			time: "Today · 7:30 PM",
			title: "Idea Review with Sudarshan AI",
			description: "Run a voice-based idea validation round",
		},
		{
			time: "Tomorrow · 5:00 PM",
			title: "Pitch Practice Session",
			description: "Pitch the smart attendance tracker update",
		},
		{
			time: "Friday · 4:00 PM",
			title: "Prototype / Validation Session",
			description: "Test and validate your prototype",
		},
	] : [
		{
			time: "Today · 7:30 PM",
			title: "Math practice with iGyanAI",
			description: "Run a voice-based problem solving round",
		},
		{
			time: "Tomorrow · 5:00 PM",
			title: "Entrepreneurship club",
			description: "Pitch the smart attendance tracker update",
		},
		{
			time: "Friday · 4:00 PM",
			title: "Robotics lab",
			description: "Integrate sensor module for the rover",
		},
	];

	if (user.role === "student" || user.role === "b2c_student") {
		return <PremiumStudentDashboard firstName={firstName} />;
	}

	return (
		<div className="dashboard-theme min-h-screen p-6 lg:p-8" style={{
			background: 'var(--dashboard-background)'
		}}>
			<div className="mx-auto max-w-6xl space-y-8">
				<header data-tour="welcome-header" className="relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 text-white shadow-xl sm:p-10" style={{
					background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 80%, #000))`,
				}}>
					<div className="absolute inset-0 opacity-40 mix-blend-soft-light">
						<div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl"></div>
						<div className="absolute right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
					</div>
					<div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="space-y-5">
						<Link href="./" className="flex flex-wrap items-center gap-5 rounded-2xl border-2 border-white/40 bg-white/20 px-6 py-4 shadow-2xl ring-2 ring-white/30 transition-all hover:scale-105 hover:shadow-3xl cursor-pointer">
							<div className="relative h-24 w-24 overflow-hidden rounded-2xl border-2 border-white/50 shadow-xl ring-4 ring-white/40">
								<Image
									src="/asset/igyan-ai-mark.png"
									alt="IGYAN.AI Logo"
									fill
									className="object-cover"
									priority
								/>
							</div>
							<div className="space-y-1">
								<p className="text-sm font-bold uppercase tracking-[0.3em] text-white drop-shadow-lg">Talent in Motion</p>
								<h2 className="text-3xl font-bold text-white drop-shadow-lg">IGYAN.AI</h2>
							</div>
						</Link>
						{isB2CUser && (
								<div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur">
									<Shield className="h-4 w-4" />
									{isMentor ? "IGYANAI · Mentor Control Panel" : "IGYANAI · Student Launch Pad"}
								</div>
							)}
							<h1 className="text-3xl font-semibold sm:text-4xl">
								{isMentor 
									? `Welcome back, ${firstName}. Here's what needs your guidance today.`
									: isB2CUser 
									? `Hey ${firstName}, ready to move one step closer to your launch?`
									: `Hey ${firstName}, ready for another brilliant session?`
								}
							</h1>
							<p className="max-w-xl text-sm text-white/80 sm:text-base">
								{isMentor 
									? "Review ideas, guide builders, and track mentoring impact. Your queue is ready."
									: isB2CUser 
									? "Build your idea, sharpen your pitch, and track your progress. We saved your momentum so you can pick up right where you left off."
									: "Track your goals, jump back into conversations, and keep that NTSE dream in sight. We saved your momentum so you can pick up right where you left off."
								}
							</p>
							<div className="flex flex-wrap gap-3">
								<Link href={isB2CUser ? "/dashboard/sudarshan" : "/dashboard/viva-ai"} className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/30">
									<Volume2 className="h-4 w-4" />
									{isMentor ? "Review Builders" : isB2CUser ? "Enter Sudarshan AI" : "Jump into Viva AI"}
								</Link>
								<Link href="/features" className="flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/20">
									{isMentor ? "Open Mentor Insights" : isB2CUser ? "Plan My Launch Week" : "Plan my week"}
									<Calendar className="h-4 w-4" />
								</Link>
							</div>
						</div>
						<div className="grid gap-4 sm:w-52">
							<div className="rounded-2xl border border-white/30 bg-white/10 p-4 text-sm">
								<p className="text-xs uppercase tracking-wide text-white/70">{isParent ? "Today's Summary" : isMentor ? "Next Review Slot" : isB2CUser ? "Next Launch Check-in" : "Next check-in"}</p>
								<p className="mt-1 text-lg font-semibold">{isParent ? "Attendance · Today" : isMentor ? "Idea Queue · 7 PM" : isB2CUser ? "Idea clarity · 9 PM" : "Physics practice · 9 PM"}</p>
								<p className="mt-2 text-white/70">{isParent ? "Check your children's attendance and school updates" : isMentor ? "3 ideas awaiting your review and feedback" : isB2CUser ? "Idea clarity / pitch improvement session" : "Akshat has 3 saved prompts from yesterday's session."}</p>
							</div>
							<div className="rounded-2xl border border-white/30 bg-white/10 p-4 text-sm">
								<p className="text-xs uppercase tracking-wide text-white/70">{isParent ? "Parent Tip" : isMentor ? "Mentor Mindset" : isB2CUser ? "Launch Mindset" : "Focus mantra"}</p>
								<p className="mt-2 text-white/80">{isParent ? "Stay involved — parents who engage with school updates see 40% better results." : isMentor ? "Guide with clarity. Decide with confidence. Empower the builder." : isB2CUser ? "One idea. One improvement. One step forward." : "Turn curiosity into progress 1 playful question at a time."}</p>
							</div>
						</div>
					</div>
				</header>

				<section data-tour="stat-cards" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{statCards.map((card) => {
						const Icon = card.icon;
						return (
						<div key={card.label} className="dashboard-card relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
							<div className="absolute inset-0" style={{
								background: `linear-gradient(135deg, color-mix(in srgb, var(--dashboard-primary) 15%, transparent), color-mix(in srgb, var(--dashboard-primary) 5%, transparent), transparent)`
							}}></div>
							<div className="relative flex items-start justify-between gap-3">
								<div>
									<p className="text-xs font-semibold uppercase tracking-wide" style={{color: 'var(--dashboard-muted)'}}>{card.label}</p>
									<p className="mt-2 text-3xl font-semibold" style={{color: 'var(--dashboard-heading)'}}>{card.value}</p>
									<p className="mt-1 text-xs" style={{color: 'var(--dashboard-muted)'}}>{card.trend}</p>
								</div>
								<div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
									<Icon className="h-6 w-6" />
								</div>
							</div>
						</div>
						);
					})}
				</section>

				<div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
					<div className="space-y-6">
						<section data-tour="quick-actions" className="dashboard-card rounded-3xl p-6">
							<div className="mb-6 flex items-center justify-between">
								<div>
									<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>{isMentor ? "Mentor Command Tools" : isB2CUser ? "Student Launch Console" : "Quick launchpad"}</h2>
									<p className="text-sm" style={{color: 'var(--dashboard-muted)'}}>{isMentor ? "Tools to review, guide, and support builders" : isB2CUser ? "Tools to explore, build, and validate your idea" : "Jump back into tools that keep your streak alive"}</p>
								</div>
								<span className="dashboard-pill rounded-full border px-3 py-1 text-xs">Recommended</span>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								{quickActions.map((action) => {
									const Icon = action.icon;
									return (
									<Link key={action.title} href={action.href} className="group relative flex h-full flex-col gap-4 rounded-2xl border p-4 transition-all hover:-translate-y-1 hover:shadow-lg dashboard-card">
										<div className="absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100" style={{
											background: `linear-gradient(135deg, transparent, color-mix(in srgb, var(--dashboard-primary) 10%, transparent), color-mix(in srgb, var(--dashboard-primary) 20%, transparent))`
										}}></div>
										<div className="relative flex items-center gap-3">
											<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.iconBg}`}>
												<Icon className="h-5 w-5" />
											</div>
											<div>
												<p className="font-semibold transition" style={{color: 'var(--dashboard-heading)'}}>{action.title}</p>
												<p className="text-xs" style={{color: 'var(--dashboard-muted)'}}>{action.description}</p>
											</div>
										</div>
										<div className="relative mt-auto flex items-center gap-2 text-xs font-semibold transition group-hover:translate-x-1" style={{color: 'var(--dashboard-primary)'}}>
											<span>{action.buttonText || "Open"}</span>
											<ArrowUpRight className="h-4 w-4" />
										</div>
									</Link>
									);
								})}
							</div>
						</section>

						<section data-tour="focus-board" className="dashboard-card rounded-3xl p-6">
							<div className="mb-6 flex items-center justify-between">
								<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>{isMentor ? "Today's Review List" : isB2CUser ? "Today's Launch Task" : "Today's focus board"}</h2>
								<span className="text-xs" style={{color: 'var(--dashboard-muted)'}}>{isMentor ? "Quick reviews you can action now" : isB2CUser ? "One task that moves your idea forward today" : `Curated for ${firstName}`}</span>
							</div>
							<ul className="space-y-4">
								{focusAreas.map((item) => (
									<li key={item.title} className="dashboard-card-muted rounded-2xl p-4">
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-sm font-semibold" style={{color: 'var(--dashboard-heading)'}}>{item.title}</p>
												<p className="mt-1 text-xs" style={{color: 'var(--dashboard-muted)'}}>{item.detail}</p>
											</div>
											<div className="flex gap-2">
												{item.tags.map((tag) => (
													<span key={tag} className="dashboard-pill rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
														{tag}
													</span>
												))}
											</div>
										</div>
									</li>
								))}
							</ul>
						</section>

						<section data-tour="ai-highlights" className="dashboard-card rounded-3xl p-6">
							<div className="mb-6 flex items-center justify-between">
								<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>{isMentor ? "Mentor Intelligence Feed" : isB2CUser ? "Student Launch Insights" : "iGyanAI highlights"}</h2>
								<Link href={isB2CUser ? "/dashboard/sudarshan" : "/dashboard/viva-ai"} className="text-xs font-semibold hover:underline" style={{color: 'var(--dashboard-primary)'}}>{isMentor ? "View mentor log" : "View chat log"}</Link>
							</div>
							<ul className="space-y-4">
								{aiHighlights.map((highlight) => (
									<li key={highlight.title} className="dashboard-pill rounded-2xl border p-4">
										<p className="text-sm font-semibold" style={{color: 'var(--dashboard-heading)'}}>{highlight.title}</p>
										<p className="mt-1 text-xs" style={{color: 'var(--dashboard-muted)'}}>{highlight.detail}</p>
									</li>
								))}
							</ul>
						</section>
					</div>

					<div className="space-y-6">
						<section data-tour="profile-card" className="dashboard-card overflow-hidden rounded-3xl p-6">
							<div className="flex items-start gap-4">
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-semibold text-white" style={{
									background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
								}}>
									{user.full_name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase() || "U"}
								</div>
								<div className="flex-1">
									<div className="flex items-start justify-between">
										<div>
											<p className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>{user.full_name}</p>
											<p className="text-sm" style={{color: 'var(--dashboard-muted)'}}>{user.email}</p>
										</div>
										<span className="dashboard-pill rounded-full border px-3 py-1 text-xs font-semibold">
											{isMentor ? 'Mentor / Advisor' : isB2CUser ? 'Student Builder' : 'Pro learner mode'}
										</span>
									</div>
									<div className="mt-4 grid gap-3">
										<div className="flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
											<span>Role</span>
											<span className="font-semibold" style={{color: 'var(--dashboard-heading)'}}>
												{user.role === 'b2c_student' ? 'Student Builder' :
												 user.role === 'b2c_mentor' ? 'Mentor' :
												 user.role === 'faculty' ? 'Faculty' :
												 user.role === 'super_admin' ? 'Super Admin' :
												 user.role === 'co_admin' ? 'Co-Admin' :
												 user.role === 'student' ? 'Student' : 'User'}
											</span>
										</div>
										<div className="flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
											<span>Member since</span>
											<span className="font-semibold" style={{color: 'var(--dashboard-heading)'}}>{new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
										</div>
										{user.phone && (
											<div className="flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
												<span>Phone</span>
												<span className="font-semibold" style={{color: 'var(--dashboard-heading)'}}>{user.phone}</span>
											</div>
										)}
										{session && (
											<div className="flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
												<span>Device</span>
												<span className="font-semibold" style={{color: 'var(--dashboard-heading)'}}>{session.device_type}</span>
											</div>
										)}
									</div>
									<div className="mt-4 flex gap-2">
										<Link href="/features" className="flex-1 rounded-xl border px-4 py-2 text-center text-sm font-semibold transition" style={{
											borderColor: 'var(--dashboard-border)',
											color: 'var(--dashboard-text)'
										}}>{isMentor ? "Mentor Profile" : isB2CUser ? "My Launch Profile" : "Edit profile"}</Link>
										<Link href={isB2CUser ? "/dashboard/sudarshan" : "/dashboard/viva-ai"} className="dashboard-button flex-1 rounded-xl px-4 py-2 text-center text-sm font-semibold transition hover:shadow-lg">Resume AI chat</Link>
									</div>
								</div>
							</div>
						</section>

						<section data-tour="upcoming-sessions" className="dashboard-card rounded-3xl p-6">
							<div className="mb-6 flex items-center justify-between">
								<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>{isMentor ? "Review & Advisory Schedule" : isB2CUser ? "Student Launch Timeline" : "Upcoming timeline"}</h2>
								<span className="text-xs" style={{color: 'var(--dashboard-muted)'}}>{isMentor ? "Your upcoming review & mentoring sessions" : isB2CUser ? "Your upcoming build & review sessions" : "Stay prepped"}</span>
							</div>
							<ul className="space-y-4">
								{upcomingSessions.map((sessionItem) => (
									<li key={sessionItem.title} className="dashboard-card-muted flex items-start gap-3 rounded-2xl p-4">
										<div className="mt-1 h-2 w-2 rounded-full" style={{backgroundColor: 'var(--dashboard-primary)'}}></div>
										<div>
											<p className="text-xs font-semibold uppercase tracking-wide" style={{color: 'var(--dashboard-muted)'}}>{sessionItem.time}</p>
											<p className="mt-1 text-sm font-semibold" style={{color: 'var(--dashboard-heading)'}}>{sessionItem.title}</p>
											<p className="text-xs" style={{color: 'var(--dashboard-muted)'}}>{sessionItem.description}</p>
										</div>
									</li>
								))}
							</ul>
						</section>

						<section className="dashboard-pill rounded-3xl border p-6">
							<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>{isMentor ? "Mentor Impact Tracker" : isB2CUser ? "Launch Progress Tracker" : "Goal tracker"}</h2>
							<p className="mt-2 text-xs" style={{color: 'var(--dashboard-muted)'}}>{isMentor ? "You've reviewed 65% of this week's submissions. Keep the momentum going!" : isB2CUser ? "You're 65% through this week's launch milestones. Celebrate small wins and track your progress." : "You're 65% through this week's mission list. Celebrate small wins and log reflections with iGyanAI."}</p>
							<div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)'}}>
								<div className="h-full w-[65%] rounded-full" style={{backgroundColor: 'var(--dashboard-primary)'}}></div>
							</div>
							<div className="mt-4 flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
								<span>{isMentor ? "5 pending reviews" : isB2CUser ? "3 milestones remaining" : "3 objectives remaining"}</span>
								<Link href={isB2CUser ? "/dashboard/sudarshan" : "/dashboard/viva-ai"} className="font-semibold hover:underline" style={{color: 'var(--dashboard-primary)'}}>{isMentor ? "Update Review Status" : isB2CUser ? "Update Launch Progress" : "Log progress"}</Link>
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
