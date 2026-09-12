"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../utils/supabase";
import { useAuth } from "../../../utils/auth_context";
import DailySnapshot from "../components/DailySnapshot";

// ════════════════════════════════════════════════════════════════
// DAILY SNAPSHOT PAGE
// ════════════════════════════════════════════════════════════════
export default function DailySnapPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();

	// Core data
	const [schoolId, setSchoolId] = useState(null);
	const [schoolData, setSchoolData] = useState(null);
	const [sessions, setSessions] = useState([]);
	const [activeSession, setActiveSession] = useState(null);
	const [classes, setClasses] = useState([]);
	const [subjects, setSubjects] = useState([]);
	const [faculty, setFaculty] = useState([]);
	const [facultyAssignments, setFacultyAssignments] = useState([]);
	const [activeTemplate, setActiveTemplate] = useState(null);
	const [savedDays, setSavedDays] = useState([]);
	const [savedSlots, setSavedSlots] = useState([]);
	const [pageLoading, setPageLoading] = useState(true);

	// Auth guard
	useEffect(() => {
		if (!authLoading && (!user || !["super_admin", "co_admin", "faculty"].includes(user.role))) {
			router.push("/dashboard");
		}
	}, [user, authLoading, router]);

	// Fetch all data
	const fetchCoreData = useCallback(async () => {
		if (!user?.school_id) { setPageLoading(false); return; }
		try {
			const sId = user.school_id;
			setSchoolId(sId);

			const [schoolRes, sessRes, subRes, facRes] = await Promise.all([
				supabase.from("schools").select("*").eq("id", sId).single(),
				supabase.from("academic_sessions").select("*").eq("school_id", sId).order("start_date", { ascending: false }),
				supabase.from("subjects").select("*").eq("school_id", sId).order("subject_name"),
				supabase.from("users").select("id, full_name, email, phone").eq("school_id", sId).eq("role", "faculty").order("full_name"),
			]);

			setSchoolData(schoolRes.data);
			setSessions(sessRes.data || []);
			setSubjects(subRes.data || []);
			setFaculty(facRes.data || []);

			const activeSess = (sessRes.data || []).find((s) => s.is_active);
			if (activeSess) {
				setActiveSession(activeSess);

				const [clsRes, faRes] = await Promise.all([
					supabase.from("classes").select("*").eq("school_id", sId).eq("session_id", activeSess.id).order("class_name"),
					supabase.from("faculty_assignments")
						.select("faculty_id, subject_id, class_id, assignment_type")
						.eq("school_id", sId).eq("session_id", activeSess.id).eq("is_active", true),
				]);
				setClasses(clsRes.data || []);
				setFacultyAssignments(faRes.data || []);

				// Fetch active template + days + slots
				const { data: templates } = await supabase
					.from("timetable_templates").select("*")
					.eq("school_id", sId).eq("session_id", activeSess.id)
					.order("created_at", { ascending: false });

				const active = (templates || []).find((t) => t.is_active);
				if (active) {
					setActiveTemplate(active);
					const [daysRes, slotsRes] = await Promise.all([
						supabase.from("timetable_days").select("*").eq("template_id", active.id).order("day_index"),
						supabase.from("timetable_slots").select("*").eq("template_id", active.id).order("slot_order"),
					]);
					setSavedDays(daysRes.data || []);
					setSavedSlots(slotsRes.data || []);
				}
			}
		} catch (err) { console.error(err); }
		setPageLoading(false);
	}, [user]);

	useEffect(() => { if (user) fetchCoreData(); }, [user, fetchCoreData]);

	// Loading
	if (authLoading || pageLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
					<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading Daily Snapshot...</p>
				</div>
			</div>
		);
	}

	if (!schoolId) {
		return (
			<div className="flex h-screen items-center justify-center p-6">
				<div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl dark:bg-amber-900/30">🏫</div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">No School Found</h2>
					<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Your account is not linked to any school.</p>
				</div>
			</div>
		);
	}

	if (!activeTemplate) {
		return (
			<div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-6">
				<div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl dark:bg-amber-900/30">⚠️</div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">No Timetable Structure Found</h2>
					<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
						Please create and save a timetable structure first before managing daily snapshots.
					</p>
					<Link href="/dashboard/timetable"
						className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-600 transition-colors">
						← Go to Timetable
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
			{/* Hero Banner */}
			<div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 px-6 py-6 sm:px-8">
				<div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTIwIDBMMCAwIDAgMjB6TTQwIDIwTDIwIDQwIDQwIDQweiIvPjwvZz48L2c+PC9zdmc+')" }} />
				<div className="relative z-10">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm text-2xl">📋</div>
							<div>
								<h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
									Daily Snapshot
								</h1>
								<p className="mt-0.5 text-sm text-white/70">
									{schoolData?.school_name || "School"} • {activeSession?.session_name || ""} • Manage daily timetable
								</p>
							</div>
						</div>
						<Link href="/dashboard/timetable"
							className="inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-sm px-4 py-2 text-sm font-bold text-white hover:bg-white/25 transition-colors">
							← Timetable
						</Link>
					</div>

					{/* Quick stats */}
					<div className="mt-4 flex flex-wrap gap-3">
						{[
							{ icon: "🏫", label: "Classes", value: classes.length },
							{ icon: "📚", label: "Subjects", value: subjects.length },
							{ icon: "👨‍🏫", label: "Faculty", value: faculty.length },
							{ icon: "📖", label: "Periods/Day", value: savedSlots.filter((s) => s.slot_type === "period").length },
						].map((s) => (
							<div key={s.label} className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2">
								<div className="flex items-center gap-2">
									<span className="text-base">{s.icon}</span>
									<div>
										<p className="text-lg font-bold text-white">{s.value}</p>
										<p className="text-[9px] text-white/60">{s.label}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-6 sm:p-8">
				<DailySnapshot
					schoolId={schoolId}
					activeSession={activeSession}
					activeTemplate={activeTemplate}
					classes={classes}
					subjects={subjects}
					faculty={faculty}
					facultyAssignments={facultyAssignments}
					savedDays={savedDays}
					savedSlots={savedSlots}
					user={user}
				/>
			</div>
		</div>
	);
}
