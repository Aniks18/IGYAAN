"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../../utils/auth_context";

// ─── CONSTANTS ──────────────────────────────────────────────
const ALL_DAYS = [
	{ name: "Monday", short: "Mon", index: 0, emoji: "📅" },
	{ name: "Tuesday", short: "Tue", index: 1, emoji: "📅" },
	{ name: "Wednesday", short: "Wed", index: 2, emoji: "📅" },
	{ name: "Thursday", short: "Thu", index: 3, emoji: "📅" },
	{ name: "Friday", short: "Fri", index: 4, emoji: "📅" },
	{ name: "Saturday", short: "Sat", index: 5, emoji: "📅" },
];

const SLOT_TYPES = [
	{ value: "period", label: "Period", icon: "📖", color: "indigo" },
	{ value: "short_break", label: "Short Break", icon: "☕", color: "amber" },
	{ value: "lunch_break", label: "Lunch Break", icon: "🍽️", color: "emerald" },
];

const SLOT_BG = {
	period: "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 dark:from-indigo-950/40 dark:to-blue-950/40 dark:border-indigo-800",
	short_break: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 dark:from-amber-950/40 dark:to-orange-950/40 dark:border-amber-800",
	lunch_break: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 dark:from-emerald-950/40 dark:to-green-950/40 dark:border-emerald-800",
};

const SLOT_ICONS = { period: "📖", short_break: "☕", lunch_break: "🍽️" };

const SUBJECT_COLORS = [
	{ bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-800 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
	{ bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-800 dark:text-purple-300", border: "border-purple-200 dark:border-purple-800" },
	{ bg: "bg-pink-100 dark:bg-pink-900/40", text: "text-pink-800 dark:text-pink-300", border: "border-pink-200 dark:border-pink-800" },
	{ bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-800 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800" },
	{ bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-800 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800" },
	{ bg: "bg-cyan-100 dark:bg-cyan-900/40", text: "text-cyan-800 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800" },
	{ bg: "bg-rose-100 dark:bg-rose-900/40", text: "text-rose-800 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800" },
	{ bg: "bg-lime-100 dark:bg-lime-900/40", text: "text-lime-800 dark:text-lime-300", border: "border-lime-200 dark:border-lime-800" },
	{ bg: "bg-violet-100 dark:bg-violet-900/40", text: "text-violet-800 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800" },
	{ bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-800 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
];

// ─── HELPERS ────────────────────────────────────────────────
function addMinutes(timeStr, mins) {
	const [h, m] = timeStr.split(":").map(Number);
	const total = h * 60 + m + mins;
	return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function fmt12(timeStr) {
	if (!timeStr) return "";
	const [h, m] = timeStr.split(":").map(Number);
	return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

// ════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ════════════════════════════════════════════════════════════════
export default function TimetablePage() {
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

	// View mode
	const [view, setView] = useState("structure");

	// Template state
	const [activeTemplate, setActiveTemplate] = useState(null);
	const [templateName, setTemplateName] = useState("Default Timetable");
	const [schoolStartTime, setSchoolStartTime] = useState("08:00");

	// Days & Slots
	const [activeDays, setActiveDays] = useState([0, 1, 2, 3, 4, 5]);
	const [slots, setSlots] = useState([]);
	const [savedDays, setSavedDays] = useState([]);
	const [savedSlots, setSavedSlots] = useState([]);

	// Assignment
	const [selectedClassId, setSelectedClassId] = useState("");
	const [entries, setEntries] = useState({});

	// UI
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [pageLoading, setPageLoading] = useState(true);



	// ── Auth guard ──
	useEffect(() => {
		if (!authLoading && (!user || !["super_admin", "co_admin", "faculty"].includes(user.role))) {
			router.push("/dashboard");
		}
	}, [user, authLoading, router]);

	// ── Fetch school + core data ──
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
				// Fetch classes for this session
				const { data: clsData } = await supabase
					.from("classes").select("*").eq("school_id", sId).eq("session_id", activeSess.id).order("class_name");
				setClasses(clsData || []);
				// Fetch faculty assignments to show subject with faculty name
				const { data: faData } = await supabase
					.from("faculty_assignments")
					.select("faculty_id, subject_id, class_id, assignment_type")
					.eq("school_id", sId)
					.eq("session_id", activeSess.id)
					.eq("is_active", true);
				setFacultyAssignments(faData || []);
			}
		} catch (err) { console.error(err); }
		setPageLoading(false);
	}, [user]);

	useEffect(() => { if (user) fetchCoreData(); }, [user, fetchCoreData]);

	// When session changes, re-fetch classes
	useEffect(() => {
		if (!schoolId || !activeSession) return;
		(async () => {
			const { data } = await supabase.from("classes").select("*").eq("school_id", schoolId).eq("session_id", activeSession.id).order("class_name");
			setClasses(data || []);
			const { data: faData } = await supabase
				.from("faculty_assignments")
				.select("faculty_id, subject_id, class_id, assignment_type")
				.eq("school_id", schoolId).eq("session_id", activeSession.id).eq("is_active", true);
			setFacultyAssignments(faData || []);
		})();
	}, [activeSession, schoolId]);

	// ── Fetch template ──
	const fetchTemplate = useCallback(async () => {
		if (!schoolId || !activeSession) return;
		try {
			const { data } = await supabase
				.from("timetable_templates").select("*")
				.eq("school_id", schoolId).eq("session_id", activeSession.id)
				.order("created_at", { ascending: false });
			const active = (data || []).find((t) => t.is_active);
			if (active) {
				setActiveTemplate(active);
				setTemplateName(active.template_name);
				setSchoolStartTime(active.school_start_time?.slice(0, 5) || "08:00");
				const [daysRes, slotsRes] = await Promise.all([
					supabase.from("timetable_days").select("*").eq("template_id", active.id).order("day_index"),
					supabase.from("timetable_slots").select("*").eq("template_id", active.id).order("slot_order"),
				]);
				const days = daysRes.data || [];
				const slotsData = slotsRes.data || [];
				setSavedDays(days);
				setSavedSlots(slotsData);
				setActiveDays(days.filter((d) => d.is_active).map((d) => d.day_index));
				setSlots(slotsData.map((s) => ({
					id: s.id, slot_type: s.slot_type, label: s.label, duration: s.duration_minutes,
					start_time: s.start_time?.slice(0, 5), end_time: s.end_time?.slice(0, 5),
				})));
			} else {
				setActiveTemplate(null);
				setSavedDays([]); setSavedSlots([]); setSlots([]);
			}
		} catch (err) { console.error(err); }
	}, [schoolId, activeSession]);

	useEffect(() => { fetchTemplate(); }, [fetchTemplate]);

	// ── Fetch entries ──
	const fetchEntries = useCallback(async () => {
		if (!activeTemplate || !selectedClassId) return;
		const { data } = await supabase.from("timetable_entries").select("*")
			.eq("template_id", activeTemplate.id).eq("class_id", selectedClassId);
		const map = {};
		(data || []).forEach((e) => { map[`${e.day_id}_${e.slot_id}`] = { id: e.id, subject_id: e.subject_id || "", faculty_id: e.faculty_id || "" }; });
		setEntries(map);
	}, [activeTemplate, selectedClassId]);

	useEffect(() => { if (view === "assign" || view === "view") fetchEntries(); }, [view, fetchEntries]);

	// ── Get faculty display name (name + subject) ──
	const getFacultyDisplay = (facId) => {
		const f = faculty.find((x) => x.id === facId);
		if (!f) return "Unknown";
		// Find what subjects this faculty teaches
		const assignedSubjectIds = [...new Set(facultyAssignments.filter((a) => a.faculty_id === facId).map((a) => a.subject_id).filter(Boolean))];
		const subNames = assignedSubjectIds.map((sid) => subjects.find((s) => s.id === sid)?.subject_name).filter(Boolean);
		return subNames.length > 0 ? `${f.full_name} - ${subNames.join(", ")}` : f.full_name;
	};

	const getFacultyShortDisplay = (facId) => {
		const f = faculty.find((x) => x.id === facId);
		if (!f) return "";
		const assignedSubjectIds = [...new Set(facultyAssignments.filter((a) => a.faculty_id === facId).map((a) => a.subject_id).filter(Boolean))];
		const subNames = assignedSubjectIds.map((sid) => subjects.find((s) => s.id === sid)?.subject_name).filter(Boolean);
		return subNames.length > 0 ? `${subNames[0]}` : "";
	};

	// ── Slot helpers ──
	const recalcTimes = (slotList, start) => {
		let cursor = start || schoolStartTime;
		return slotList.map((s) => {
			const st = cursor;
			const et = addMinutes(cursor, s.duration || 0);
			cursor = et;
			return { ...s, start_time: st, end_time: et };
		});
	};

	const addSlot = (type) => {
		const pc = slots.filter((s) => s.slot_type === "period").length;
		const label = type === "period" ? `Period ${pc + 1}` : type === "short_break" ? "Short Break" : "Lunch Break";
		const duration = type === "period" ? 45 : type === "short_break" ? 10 : 30;
		setSlots(recalcTimes([...slots, { slot_type: type, label, duration }], schoolStartTime));
	};

	const updateSlot = (idx, field, value) => {
		const updated = slots.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
		setSlots(recalcTimes(updated, schoolStartTime));
	};

	const removeSlot = (idx) => {
		let updated = slots.filter((_, i) => i !== idx);
		let pc = 0;
		updated = updated.map((s) => s.slot_type === "period" ? { ...s, label: `Period ${++pc}` } : s);
		setSlots(recalcTimes(updated, schoolStartTime));
	};

	const moveSlot = (idx, dir) => {
		const arr = [...slots];
		const t = idx + dir;
		if (t < 0 || t >= arr.length) return;
		[arr[idx], arr[t]] = [arr[t], arr[idx]];
		setSlots(recalcTimes(arr, schoolStartTime));
	};

	useEffect(() => {
		if (slots.length > 0) setSlots((prev) => recalcTimes([...prev], schoolStartTime));
	}, [schoolStartTime]);

	// ── Save structure ──
	const saveStructure = async () => {
		if (!activeSession) { setError("No active session found."); return; }
		if (slots.length === 0) { setError("Add at least one slot."); return; }
		if (activeDays.length === 0) { setError("Select at least one day."); return; }
		setSaving(true); setError(""); setSuccess("");
		try {
			let tid = activeTemplate?.id;
			if (!tid) {
				const { data, error: e } = await supabase.from("timetable_templates")
					.insert({ school_id: schoolId, session_id: activeSession.id, template_name: templateName, school_start_time: schoolStartTime, is_active: true, created_by: user.id })
					.select().single();
				if (e) throw e;
				tid = data.id;
				setActiveTemplate(data);
			} else {
				await supabase.from("timetable_templates").update({ template_name: templateName, school_start_time: schoolStartTime, updated_at: new Date().toISOString() }).eq("id", tid);
			}

			await supabase.from("timetable_days").delete().eq("template_id", tid);
			const dayRows = ALL_DAYS.map((d) => ({ template_id: tid, day_name: d.name, day_index: d.index, is_active: activeDays.includes(d.index) }));
			const { data: newDays, error: dErr } = await supabase.from("timetable_days").insert(dayRows).select();
			if (dErr) throw dErr;
			setSavedDays(newDays);

			await supabase.from("timetable_slots").delete().eq("template_id", tid);
			const slotRows = slots.map((s, i) => ({ template_id: tid, slot_order: i + 1, slot_type: s.slot_type, label: s.label, start_time: s.start_time, end_time: s.end_time, duration_minutes: s.duration }));
			const { data: newSlots, error: sErr } = await supabase.from("timetable_slots").insert(slotRows).select();
			if (sErr) throw sErr;
			setSavedSlots(newSlots);
			setSlots(newSlots.map((s) => ({ id: s.id, slot_type: s.slot_type, label: s.label, duration: s.duration_minutes, start_time: s.start_time?.slice(0, 5), end_time: s.end_time?.slice(0, 5) })));
			setSuccess("Timetable structure saved!"); setTimeout(() => setSuccess(""), 3000);
		} catch (err) { setError(err.message || "Save failed"); }
		finally { setSaving(false); }
	};

	// ── Save entry ──
	const saveEntry = async (dayId, slotId, subjectId, facultyId) => {
		if (!activeTemplate || !selectedClassId) return;
		const key = `${dayId}_${slotId}`;
		try {
			const ex = entries[key];
			if (ex?.id) {
				await supabase.from("timetable_entries").update({ subject_id: subjectId || null, faculty_id: facultyId || null, updated_at: new Date().toISOString() }).eq("id", ex.id);
				setEntries((p) => ({ ...p, [key]: { ...p[key], subject_id: subjectId, faculty_id: facultyId } }));
			} else {
				const { data, error: e } = await supabase.from("timetable_entries").insert({ template_id: activeTemplate.id, slot_id: slotId, day_id: dayId, class_id: selectedClassId, subject_id: subjectId || null, faculty_id: facultyId || null }).select().single();
				if (e) throw e;
				setEntries((p) => ({ ...p, [key]: { id: data.id, subject_id: subjectId, faculty_id: facultyId } }));
			}
		} catch (err) { console.error(err); setError("Save failed"); setTimeout(() => setError(""), 2000); }
	};





	// ── Derived ──
	const activeSavedDays = savedDays.filter((d) => d.is_active).sort((a, b) => a.day_index - b.day_index);
	const selectedClass = classes.find((c) => c.id === selectedClassId);

	const subjectColorMap = {};
	subjects.forEach((s, i) => { subjectColorMap[s.id] = SUBJECT_COLORS[i % SUBJECT_COLORS.length]; });

	// ── Loading ──
	if (authLoading || pageLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
					<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading Timetable...</p>
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

	// ════════════════════════════════════════════════════════════════
	// RENDER
	// ════════════════════════════════════════════════════════════════
	return (
		<div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
			{/* ── HERO BANNER ── */}
			<div className="border-b border-zinc-200 bg-white px-6 py-7 sm:px-8 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTIwIDBMMCAwIDAgMjB6TTQwIDIwTDIwIDQwIDQwIDQweiIvPjwvZz48L2c+PC9zdmc+')" }} />
				<div>
					<div className="flex items-center gap-3">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl dark:bg-orange-950/40">◷</div>
						<div>
							<h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
								Timetable
							</h1>
							<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
								{schoolData?.school_name || "School"} • {activeSession?.session_name || "No session"}
							</p>
						</div>
					</div>

					{/* Stats row */}
					<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
						{[
							{ icon: "📅", label: "Days", value: activeDays.length },
							{ icon: "📖", label: "Periods", value: slots.filter((s) => s.slot_type === "period").length },
							{ icon: "☕", label: "Breaks", value: slots.filter((s) => s.slot_type !== "period").length },
							{ icon: "🏫", label: "Classes", value: classes.length },
							{ icon: "📚", label: "Subjects", value: subjects.length },
							{ icon: "👨‍🏫", label: "Faculty", value: faculty.length },
						].map((s) => (
							<div key={s.label} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/60">
								<div className="flex items-center gap-2">
									<span className="text-base grayscale">{s.icon}</span>
									<div>
										<p className="text-lg font-semibold text-zinc-900 dark:text-white">{s.value}</p>
										<p className="text-[10px] text-zinc-400">{s.label}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* ── SESSION SELECTOR + VIEW TABS ── */}
			<div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/90">
				<div className="flex flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
					{/* View tabs */}
					<div className="flex gap-2 overflow-x-auto">
						{[
							{ key: "structure", icon: "🏗️", label: "Structure", desc: "Build Day" },
							{ key: "assign", icon: "📝", label: "Assign", desc: "Subject & Teacher" },
							{ key: "view", icon: "👁️", label: "View", desc: "Full Timetable" },
							{ key: "daily", icon: "📋", label: "Daily Snapshot", desc: "Day Snapshot" },
						].map((tab) => (
							<button
								key={tab.key}
								onClick={() => {
									if ((tab.key === "assign" || tab.key === "view" || tab.key === "daily") && !activeTemplate) {
										setError("Save timetable structure first."); return;
									}
									if (tab.key === "daily") {
										router.push("/dashboard/timetable/daily-snap");
										return;
									}
									setError(""); setView(tab.key);
								}}
								className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
									view === tab.key
										? "border-orange-200 bg-orange-50 text-orange-700 shadow-sm dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300"
										: "border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
								}`}
							>
								<span>{tab.icon}</span>
								<span className="hidden sm:inline">{tab.label}</span>
							</button>
						))}
					</div>

					{/* Session selector */}
					<div className="flex items-center gap-2">
						<span className="text-xs font-medium text-zinc-400">Session:</span>
						<select
							value={activeSession?.id || ""}
							onChange={(e) => {
								const s = sessions.find((x) => x.id === e.target.value);
								setActiveSession(s || null);
							}}
							className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						>
							{sessions.map((s) => (
								<option key={s.id} value={s.id}>{s.session_name}{s.is_active ? " ✦" : ""}</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* ── ALERTS ── */}
			<div className="px-6 pt-4 sm:px-8">
				{error && (
					<div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
						⚠️ {error}
						<button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-600">✕</button>
					</div>
				)}
				{success && (
					<div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">
						✅ {success}
					</div>
				)}
			</div>

			{/* ── CONTENT ── */}
			<div className="p-6 sm:p-8">

				{/* ════════════ STRUCTURE ════════════ */}
				{view === "structure" && (
					<div className="space-y-6">

						{/* Template Settings */}
						<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
							<div className="flex items-center gap-3 mb-5">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg dark:bg-indigo-900/30">⚙️</div>
								<div>
									<h3 className="text-lg font-bold text-zinc-900 dark:text-white">Template Settings</h3>
									<p className="text-xs text-zinc-400">Configure your school&apos;s daily schedule</p>
								</div>
							</div>
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Template Name</label>
									<input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)}
										className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
										placeholder="e.g. Default Timetable" />
								</div>
								<div>
									<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">School Start Time</label>
									<input type="time" value={schoolStartTime} onChange={(e) => setSchoolStartTime(e.target.value)}
										className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
								</div>
							</div>
						</div>

						{/* Days Selection */}
						<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
							<div className="flex items-center gap-3 mb-5">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg dark:bg-purple-900/30">📅</div>
								<div>
									<h3 className="text-lg font-bold text-zinc-900 dark:text-white">School Days</h3>
									<p className="text-xs text-zinc-400">Select which days have classes</p>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
								{ALL_DAYS.map((d) => {
									const on = activeDays.includes(d.index);
									return (
										<button key={d.index}
											onClick={() => setActiveDays((p) => on ? p.filter((i) => i !== d.index) : [...p, d.index].sort())}
											className={`group relative rounded-2xl border-2 p-4 text-center transition-all ${
												on
													? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10 dark:border-indigo-400 dark:bg-indigo-950/40"
													: "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800"
											}`}
										>
											{on && <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white">✓</div>}
											<div className={`text-2xl mb-1 ${on ? "" : "grayscale opacity-40"}`}>{d.emoji}</div>
											<div className={`text-sm font-bold ${on ? "text-indigo-700 dark:text-indigo-300" : "text-zinc-400"}`}>{d.short}</div>
											<div className={`text-[10px] ${on ? "text-indigo-500 dark:text-indigo-400" : "text-zinc-300 dark:text-zinc-600"}`}>{d.name}</div>
										</button>
									);
								})}
							</div>
						</div>

						{/* Slot Builder */}
						<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
							<div className="flex items-center justify-between mb-5">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg dark:bg-emerald-900/30">🧱</div>
									<div>
										<h3 className="text-lg font-bold text-zinc-900 dark:text-white">Day Structure</h3>
										<p className="text-xs text-zinc-400">Add periods and breaks to build your school day</p>
									</div>
								</div>
								<div className="flex gap-2">
									{SLOT_TYPES.map((st) => (
										<button key={st.value} onClick={() => addSlot(st.value)}
											className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
											<span>{st.icon}</span> {st.label}
										</button>
									))}
								</div>
							</div>

							{slots.length === 0 ? (
								<div className="rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center dark:border-zinc-700">
									<div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
										<span className="text-4xl">🕐</span>
									</div>
									<p className="mt-4 text-sm font-medium text-zinc-500">No slots yet</p>
									<p className="mt-1 text-xs text-zinc-400">Click the buttons above to add periods and breaks</p>
								</div>
							) : (
								<div className="space-y-2">
									{slots.map((slot, idx) => (
										<div key={idx} className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm ${SLOT_BG[slot.slot_type]}`}>
											{/* Order badge */}
											<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-xs font-bold text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-400">
												{idx + 1}
											</div>

											{/* Icon */}
											<span className="text-xl shrink-0">{SLOT_ICONS[slot.slot_type]}</span>

											{/* Time */}
											<div className="shrink-0 rounded-lg bg-white/80 px-3 py-1.5 dark:bg-zinc-800/80">
												<div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{fmt12(slot.start_time)}</div>
												<div className="text-[10px] text-zinc-400">to {fmt12(slot.end_time)}</div>
											</div>

											{/* Type selector */}
											<select value={slot.slot_type}
												onChange={(e) => {
													updateSlot(idx, "slot_type", e.target.value);
													if (e.target.value === "short_break") updateSlot(idx, "label", "Short Break");
													else if (e.target.value === "lunch_break") updateSlot(idx, "label", "Lunch Break");
												}}
												className="rounded-lg border border-zinc-200/50 bg-white/70 px-2 py-1.5 text-xs font-medium dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-white">
												{SLOT_TYPES.map((st) => <option key={st.value} value={st.value}>{st.icon} {st.label}</option>)}
											</select>

											{/* Label */}
											<input type="text" value={slot.label} onChange={(e) => updateSlot(idx, "label", e.target.value)}
												className="flex-1 rounded-lg border border-zinc-200/50 bg-white/70 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-white" />

											{/* Duration */}
											<div className="flex items-center gap-1 shrink-0">
												<input type="number" min="5" max="120" value={slot.duration}
													onChange={(e) => updateSlot(idx, "duration", parseInt(e.target.value) || 5)}
													className="w-14 rounded-lg border border-zinc-200/50 bg-white/70 px-2 py-1.5 text-center text-xs font-bold dark:border-zinc-600 dark:bg-zinc-800/70 dark:text-white" />
												<span className="text-[10px] text-zinc-400">min</span>
											</div>

											{/* Actions */}
											<div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
												<button onClick={() => moveSlot(idx, -1)} disabled={idx === 0}
													className="rounded-lg p-1.5 text-xs text-zinc-400 hover:bg-white/60 hover:text-zinc-700 disabled:opacity-20 dark:hover:bg-zinc-700/60">▲</button>
												<button onClick={() => moveSlot(idx, 1)} disabled={idx === slots.length - 1}
													className="rounded-lg p-1.5 text-xs text-zinc-400 hover:bg-white/60 hover:text-zinc-700 disabled:opacity-20 dark:hover:bg-zinc-700/60">▼</button>
												<button onClick={() => removeSlot(idx)}
													className="rounded-lg p-1.5 text-xs text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20">✕</button>
											</div>
										</div>
									))}
								</div>
							)}

							{/* Summary bar */}
							{slots.length > 0 && (
								<div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
									{[
										{ label: "Total Periods", value: slots.filter((s) => s.slot_type === "period").length, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30" },
										{ label: "Breaks", value: slots.filter((s) => s.slot_type !== "period").length, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30" },
										{ label: "School Hours", value: `${fmt12(schoolStartTime)} – ${fmt12(slots[slots.length - 1].end_time)}`, color: "text-zinc-700 dark:text-zinc-300", bg: "bg-zinc-50 dark:bg-zinc-800" },
										{ label: "Teaching Time", value: `${slots.filter((s) => s.slot_type === "period").reduce((a, s) => a + s.duration, 0)} min`, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
									].map((s) => (
										<div key={s.label} className={`rounded-xl ${s.bg} px-4 py-3 text-center`}>
											<div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
											<div className="text-[10px] text-zinc-400">{s.label}</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Visual Timeline */}
						{slots.length > 0 && (
							<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
								<h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
									<span>👀</span> Visual Timeline
								</h3>
								<div className="flex gap-1 overflow-x-auto pb-2">
									{slots.map((slot, idx) => (
										<div key={idx}
											className={`shrink-0 rounded-xl border px-3 py-2.5 text-center transition-all hover:shadow-md ${SLOT_BG[slot.slot_type]}`}
											style={{ minWidth: Math.max(70, slot.duration * 1.5) }}>
											<div className="text-lg">{SLOT_ICONS[slot.slot_type]}</div>
											<div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate">{slot.label}</div>
											<div className="text-[9px] text-zinc-400 mt-0.5">{fmt12(slot.start_time)}</div>
											<div className="text-[9px] font-medium text-zinc-500">{slot.duration}m</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Save */}
						<div className="flex justify-end">
							<button onClick={saveStructure} disabled={saving}
								className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl disabled:opacity-50">
								{saving ? (
									<><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" /></svg> Saving...</>
								) : (
									<>💾 Save Timetable Structure</>
								)}
							</button>
						</div>
					</div>
				)}

				{/* ════════════ ASSIGN ════════════ */}
				{view === "assign" && activeTemplate && (
					<div className="space-y-6">
						{/* Class selector */}
						<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
							<div className="flex items-center gap-3 mb-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg dark:bg-blue-900/30">🏫</div>
								<div>
									<h3 className="text-lg font-bold text-zinc-900 dark:text-white">Select Class</h3>
									<p className="text-xs text-zinc-400">Choose a class to assign subjects & teachers for each period</p>
								</div>
							</div>
							<select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
								className="w-full max-w-md rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
								<option value="">— Choose a class —</option>
								{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
							</select>
						</div>

						{/* Assignment grid */}
						{selectedClassId && activeSavedDays.length > 0 && savedSlots.some((s) => s.slot_type === "period") ? (
							<div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
								<div className="border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-white px-6 py-4 dark:border-zinc-800 dark:from-zinc-800/50 dark:to-zinc-900">
									<h3 className="text-lg font-bold text-zinc-900 dark:text-white">
										📝 {selectedClass?.class_name}-{selectedClass?.section} — Assign Subjects & Teachers
									</h3>
									<p className="text-xs text-zinc-400 mt-0.5">Changes save automatically on selection</p>
								</div>
								<div className="overflow-x-auto p-4">
									<table className="w-full border-collapse">
										<thead>
											<tr>
												<th className="sticky left-0 z-10 bg-zinc-50 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">Slot</th>
												<th className="px-3 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Time</th>
												{activeSavedDays.map((day) => (
													<th key={day.id} className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 min-w-[160px]">
														{day.day_name}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{savedSlots.map((slot) => {
												const isPeriod = slot.slot_type === "period";
												return (
													<tr key={slot.id} className={isPeriod ? "border-b border-zinc-100 dark:border-zinc-800" : "border-b border-zinc-100 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/20"}>
														<td className="sticky left-0 z-10 bg-white px-3 py-2.5 dark:bg-zinc-900">
															<div className="flex items-center gap-2">
																<span className="text-sm">{SLOT_ICONS[slot.slot_type]}</span>
																<span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">{slot.label}</span>
															</div>
														</td>
														<td className="px-3 py-2.5">
															<span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-mono text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
																{fmt12(slot.start_time?.slice(0, 5))} – {fmt12(slot.end_time?.slice(0, 5))}
															</span>
														</td>
														{activeSavedDays.map((day) => {
															if (!isPeriod) return <td key={day.id} className="px-2 py-2 text-center"><span className="text-[10px] text-zinc-300 dark:text-zinc-600">—</span></td>;
															const key = `${day.id}_${slot.id}`;
															const entry = entries[key] || {};
															return (
																<td key={day.id} className="px-1.5 py-1.5">
																	<div className="space-y-1.5 rounded-xl border border-zinc-100 bg-zinc-50/50 p-2 dark:border-zinc-800 dark:bg-zinc-800/30">
																		<select value={entry.subject_id || ""}
																			onChange={(e) => {
																				const v = e.target.value;
																				setEntries((p) => ({ ...p, [key]: { ...p[key], subject_id: v } }));
																				saveEntry(day.id, slot.id, v, entry.faculty_id || "");
																			}}
																			className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
																			<option value="">📚 Subject</option>
																			{subjects.map((s) => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
																		</select>
																		<select value={entry.faculty_id || ""}
																			onChange={(e) => {
																				const v = e.target.value;
																				setEntries((p) => ({ ...p, [key]: { ...p[key], faculty_id: v } }));
																				saveEntry(day.id, slot.id, entry.subject_id || "", v);
																			}}
																			className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-white">
																			<option value="">👨‍🏫 Teacher</option>
																			{faculty.map((f) => <option key={f.id} value={f.id}>{getFacultyDisplay(f.id)}</option>)}
																		</select>
																	</div>
																</td>
															);
														})}
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
								<div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-800/20">
									<p className="text-[11px] text-zinc-400">💡 Tip: Select a subject first, then assign the teacher. Changes save instantly.</p>
								</div>
							</div>
						) : !selectedClassId ? (
							<div className="rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center dark:border-zinc-700">
								<span className="text-5xl">🏫</span>
								<p className="mt-4 text-sm font-medium text-zinc-500">Select a class above to start assigning</p>
							</div>
						) : (
							<div className="rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center dark:border-zinc-700">
								<span className="text-5xl">⚠️</span>
								<p className="mt-4 text-sm font-medium text-zinc-500">No days or periods found. Save the structure first.</p>
							</div>
						)}
					</div>
				)}

				{/* ════════════ VIEW ════════════ */}
				{view === "view" && activeTemplate && (
					<div className="space-y-6">
						{/* Class selector */}
						<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
							<div className="flex items-center gap-3 mb-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-lg dark:bg-emerald-900/30">👁️</div>
								<div>
									<h3 className="text-lg font-bold text-zinc-900 dark:text-white">View Full Timetable</h3>
									<p className="text-xs text-zinc-400">Select a class to see the complete weekly schedule</p>
								</div>
							</div>
							<select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
								className="w-full max-w-md rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
								<option value="">— Choose a class —</option>
								{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
							</select>
						</div>

						{selectedClassId && activeSavedDays.length > 0 ? (
							<>
								{/* Timetable card */}
								<div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
									{/* Header */}
									<div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4">
										<div className="flex items-center justify-between">
											<div>
												<h3 className="text-lg font-bold text-white">
													{selectedClass?.class_name} - {selectedClass?.section}
												</h3>
												<p className="text-xs text-white/70">Weekly Timetable • {activeSession?.session_name}</p>
											</div>
											<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl backdrop-blur-sm">📅</div>
										</div>
									</div>

									{/* Table */}
									<div className="overflow-x-auto">
										<table className="w-full border-collapse">
											<thead>
												<tr>
													<th className="sticky left-0 z-10 bg-zinc-800 px-4 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-300 min-w-[140px]">
														⏰ Time / Day
													</th>
													{activeSavedDays.map((day) => (
														<th key={day.id} className="bg-zinc-800 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-zinc-300 min-w-[150px]">
															{day.day_name}
														</th>
													))}
												</tr>
											</thead>
											<tbody>
												{savedSlots.map((slot, sIdx) => {
													const isPeriod = slot.slot_type === "period";
													return (
														<tr key={slot.id} className={sIdx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50/50 dark:bg-zinc-900/80"}>
															{/* Time label */}
															<td className={`sticky left-0 z-10 border-b border-r border-zinc-100 px-4 py-3 dark:border-zinc-800 ${
																sIdx % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-zinc-50 dark:bg-zinc-900/80"
															} ${!isPeriod ? "bg-zinc-50 dark:bg-zinc-800/40" : ""}`}>
																<div className="flex items-center gap-2.5">
																	<div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
																		isPeriod ? "bg-indigo-100 dark:bg-indigo-900/40" : slot.slot_type === "lunch_break" ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-amber-100 dark:bg-amber-900/40"
																	}`}>{SLOT_ICONS[slot.slot_type]}</div>
																	<div>
																		<div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{slot.label}</div>
																		<div className="text-[10px] text-zinc-400">
																			{fmt12(slot.start_time?.slice(0, 5))} – {fmt12(slot.end_time?.slice(0, 5))}
																		</div>
																	</div>
																</div>
															</td>
															{/* Day cells */}
															{activeSavedDays.map((day) => {
																if (!isPeriod) {
																	return (
																		<td key={day.id} className="border-b border-zinc-100 px-3 py-3 text-center dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20">
																			<div className="flex items-center justify-center gap-1 text-[11px] text-zinc-300 dark:text-zinc-600 italic">
																				{slot.slot_type === "lunch_break" ? "🍽️ Lunch Break" : "☕ Break"}
																			</div>
																		</td>
																	);
																}
																const key = `${day.id}_${slot.id}`;
																const entry = entries[key];
																const subj = entry?.subject_id ? subjects.find((s) => s.id === entry.subject_id) : null;
																const teach = entry?.faculty_id ? faculty.find((f) => f.id === entry.faculty_id) : null;
																const sc = subj ? subjectColorMap[subj.id] : null;
																return (
																	<td key={day.id} className="border-b border-zinc-100 px-2 py-2 dark:border-zinc-800">
																		{subj ? (
																			<div className={`rounded-xl border ${sc?.border || ""} ${sc?.bg || ""} px-3 py-2.5 text-center transition-all hover:shadow-md`}>
																				<div className={`text-xs font-bold ${sc?.text || ""}`}>{subj.subject_name}</div>
																				{teach && (
																					<div className={`mt-1 flex items-center justify-center gap-1 text-[10px] ${sc?.text || ""} opacity-70`}>
																						<span>👨‍🏫</span>
																						<span>{teach.full_name}</span>
																						{getFacultyShortDisplay(teach.id) && getFacultyShortDisplay(teach.id) !== subj.subject_name && (
																							<span className="opacity-50">({getFacultyShortDisplay(teach.id)})</span>
																						)}
																					</div>
																				)}
																			</div>
																		) : (
																			<div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-3 py-3 text-center dark:border-zinc-700 dark:bg-zinc-800/20">
																				<span className="text-[10px] text-zinc-300 dark:text-zinc-600">Not Assigned</span>
																			</div>
																		)}
																	</td>
																);
															})}
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>

									{/* Legend */}
									<div className="border-t border-zinc-100 bg-zinc-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/20">
										<p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Subject Legend</p>
										<div className="flex flex-wrap gap-2">
											{subjects.filter((s) => Object.values(entries).some((e) => e.subject_id === s.id)).map((s) => {
												const sc = subjectColorMap[s.id];
												return (
													<span key={s.id} className={`rounded-full border px-3 py-1 text-[10px] font-bold ${sc?.bg || ""} ${sc?.text || ""} ${sc?.border || ""}`}>
														{s.subject_name}
													</span>
												);
											})}
										</div>
									</div>
								</div>
							</>
						) : !selectedClassId ? (
							<div className="rounded-2xl border-2 border-dashed border-zinc-200 py-20 text-center dark:border-zinc-700">
								<span className="text-5xl">👁️</span>
								<p className="mt-4 text-sm font-medium text-zinc-500">Select a class to view its timetable</p>
							</div>
						) : null}
					</div>
				)}

			</div>
		</div>
	);
}
