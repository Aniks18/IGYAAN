"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../../utils/auth_context";
import { TABS, StatCard } from "./components/shared";

import SessionsTab from "./components/SessionsTab";
import SubjectsTab from "./components/SubjectsTab";
import ClassesTab from "./components/ClassesTab";
import AddStudentsTab from "./components/AddStudentsTab";
import StudentsTab from "./components/StudentsTab";
import FacultyAssignTab from "./components/FacultyAssignTab";
import StudentAttendanceTab from "./components/StudentAttendanceTab";
import FacultyAttendanceTab from "./components/FacultyAttendanceTab";
import TransfersTab from "./components/TransfersTab";
import ParentsTab from "./components/ParentsTab";

export default function SchoolManagementPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("sessions");
	const [schoolId, setSchoolId] = useState(null);
	const [schoolData, setSchoolData] = useState(null);
	const [pageLoading, setPageLoading] = useState(true);

	// Data states
	const [sessions, setSessions] = useState([]);
	const [activeSession, setActiveSession] = useState(null);
	const [subjects, setSubjects] = useState([]);
	const [classes, setClasses] = useState([]);
	const [students, setStudents] = useState([]);
	const [faculty, setFaculty] = useState([]);
	const [parents, setParents] = useState([]);

	useEffect(() => {
		if (!authLoading && (!user || !["super_admin", "co_admin", "faculty"].includes(user.role))) {
			router.push("/dashboard");
		}
	}, [user, authLoading, router]);

	const fetchSchool = useCallback(async () => {
		if (!user?.school_id) { setPageLoading(false); return; }
		try {
			const { data } = await supabase.from("schools").select("*").eq("id", user.school_id).single();
			if (data) { setSchoolId(data.id); setSchoolData(data); }
		} catch (err) { console.error(err); }
		setPageLoading(false);
	}, [user]);

	const fetchSessions = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("academic_sessions").select("*").eq("school_id", schoolId).order("start_date", { ascending: false });
		setSessions(data || []);
		setActiveSession((data || []).find((s) => s.is_active) || null);
	}, [schoolId]);

	const fetchSubjects = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("subjects").select("*").eq("school_id", schoolId).order("subject_name");
		setSubjects(data || []);
	}, [schoolId]);

	const fetchClasses = useCallback(async () => {
		if (!schoolId || !activeSession) return;
		const { data } = await supabase.from("classes").select("*").eq("school_id", schoolId).eq("session_id", activeSession.id).order("class_name");
		setClasses(data || []);
	}, [schoolId, activeSession]);

	const fetchStudents = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("users").select("id, full_name, email, phone").eq("school_id", schoolId).eq("role", "student").order("full_name");
		setStudents(data || []);
	}, [schoolId]);

	const fetchFaculty = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("users").select("id, full_name, email, phone").eq("school_id", schoolId).eq("role", "faculty").order("full_name");
		setFaculty(data || []);
	}, [schoolId]);

	const fetchParents = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("users").select("id, full_name, email, phone").eq("school_id", schoolId).eq("role", "parent").order("full_name");
		setParents(data || []);
	}, [schoolId]);

	useEffect(() => { if (user) fetchSchool(); }, [user, fetchSchool]);
	useEffect(() => { if (schoolId) { fetchSessions(); fetchSubjects(); fetchStudents(); fetchFaculty(); fetchParents(); } }, [schoolId, fetchSessions, fetchSubjects, fetchStudents, fetchFaculty, fetchParents]);
	useEffect(() => { if (activeSession) fetchClasses(); }, [activeSession, fetchClasses]);

	const refreshAll = () => { fetchSessions(); fetchSubjects(); fetchClasses(); fetchStudents(); fetchFaculty(); fetchParents(); };

	if (authLoading || pageLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }} />
					<p className="text-sm font-medium" style={{ color: 'var(--dashboard-muted)' }}>Loading School Management...</p>
				</div>
			</div>
		);
	}

	if (!schoolId) {
		return (
			<div className="flex h-screen items-center justify-center p-6">
				<div className="w-full max-w-md rounded-2xl border p-8 text-center shadow-xl" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)' }}>🏫</div>
					<h2 className="text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>No School Found</h2>
					<p className="mt-2 text-sm" style={{ color: 'var(--dashboard-muted)' }}>Your account is not linked to any school. Please contact support or complete your school profile setup.</p>
				</div>
			</div>
		);
	}

	const sessionSelector = activeTab !== "sessions" && activeTab !== "subjects" && activeTab !== "add-students" && activeTab !== "parents" && (
		<div className="flex items-center gap-3">
			<span className="text-sm font-medium" style={{ color: 'var(--dashboard-muted)' }}>Session:</span>
			<select
				value={activeSession?.id || ""}
				onChange={(e) => {
					const s = sessions.find((s) => s.id === e.target.value);
					setActiveSession(s || null);
				}}
				className="rounded-xl border px-3 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2"
				style={{
					borderColor: 'var(--dashboard-border)',
					backgroundColor: 'var(--dashboard-surface-solid)',
					color: 'var(--dashboard-heading)',
					'--tw-ring-color': 'color-mix(in srgb, var(--dashboard-primary) 25%, transparent)',
				}}
			>
				{sessions.map((s) => <option key={s.id} value={s.id}>{s.session_name}{s.is_active ? " ✦" : ""}</option>)}
			</select>
		</div>
	);

	return (
		<div
			className="min-h-screen"
			style={{
				backgroundColor: 'var(--dashboard-background)',
				'--color-indigo-50': 'color-mix(in srgb, var(--dashboard-primary) 8%, white)',
				'--color-indigo-100': 'color-mix(in srgb, var(--dashboard-primary) 15%, white)',
				'--color-indigo-400': 'color-mix(in srgb, var(--dashboard-primary) 85%, white)',
				'--color-indigo-500': 'var(--dashboard-primary)',
				'--color-indigo-600': 'var(--dashboard-primary-hover, var(--dashboard-primary))',
				'--color-indigo-700': 'color-mix(in srgb, var(--dashboard-primary) 100%, black 15%)',
			}}
		>
			{/* Hero Banner */}
			<div data-tour="school-hero" className="relative overflow-hidden px-6 py-8 sm:px-8" style={{ background: 'var(--dashboard-primary)' }}>
				<div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgydjJoMzR6TTIgMjBoMzR2Mkgydi0yeiIvPjwvZz48L2c+PC9zdmc+')" }} />
				<div className="relative z-10">
					<h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
						🏫 {schoolData?.name || "School Management"}
					</h1>
					<p className="mt-1.5 text-sm text-white/70">Manage your academic operations — sessions, classes, students, faculty & more</p>
					<div data-tour="school-stats" className="mt-5 flex flex-wrap gap-3">
						<StatCard icon="📅" label="Sessions" value={sessions.length} color="white" />
						<StatCard icon="📚" label="Subjects" value={subjects.length} color="white" />
						<StatCard icon="🏫" label="Classes" value={classes.length} color="white" />
						<StatCard icon="🎓" label="Students" value={students.length} color="white" />
						<StatCard icon="👨‍🏫" label="Faculty" value={faculty.length} color="white" />
						<StatCard icon="👪" label="Parents" value={parents.length} color="white" />
					</div>
				</div>
			</div>

			{/* Tab Navigation */}
			<div data-tour="school-tabs" className="sticky top-0 z-20 border-b backdrop-blur-lg" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'color-mix(in srgb, var(--dashboard-surface-solid) 90%, transparent)' }}>
				<div className="flex items-center justify-between px-6 py-3">
					<div className="no-scrollbar flex gap-1 overflow-x-auto">
						{TABS.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className="flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all"
								style={
									activeTab === tab.id
										? { backgroundColor: 'var(--dashboard-primary)', color: '#fff', boxShadow: '0 4px 6px -1px color-mix(in srgb, var(--dashboard-primary) 25%, transparent)' }
										: { color: 'var(--dashboard-muted)' }
								}
							>
								<span>{tab.icon}</span>
								<span className="hidden sm:inline">{tab.label}</span>
							</button>
						))}
					</div>
					{sessionSelector}
				</div>
			</div>

			{/* Tab Content */}
			<div data-tour="school-content" className="p-6 sm:p-8">
				{activeTab === "sessions" && (
					<SessionsTab schoolId={schoolId} sessions={sessions} onRefresh={fetchSessions} />
				)}
				{activeTab === "subjects" && (
					<SubjectsTab schoolId={schoolId} subjects={subjects} onRefresh={fetchSubjects} />
				)}
				{activeTab === "classes" && (
					<ClassesTab schoolId={schoolId} session={activeSession} classes={classes} subjects={subjects} onRefresh={fetchClasses} />
				)}
				{activeTab === "add-students" && (
					<AddStudentsTab schoolId={schoolId} classes={classes} session={activeSession} onRefresh={fetchStudents} />
				)}
				{activeTab === "students" && (
					<StudentsTab schoolId={schoolId} session={activeSession} classes={classes} students={students} user={user} onRefresh={refreshAll} />
				)}
				{activeTab === "faculty-assign" && (
					<FacultyAssignTab schoolId={schoolId} session={activeSession} classes={classes} subjects={subjects} faculty={faculty} onRefresh={refreshAll} />
				)}
				{activeTab === "student-attendance" && (
					<StudentAttendanceTab schoolId={schoolId} session={activeSession} classes={classes} userId={user?.id} userRole={user?.role} />
				)}
				{activeTab === "faculty-attendance" && (
					<FacultyAttendanceTab schoolId={schoolId} session={activeSession} faculty={faculty} userId={user?.id} />
				)}
				{activeTab === "transfers" && (
					<TransfersTab schoolId={schoolId} sessions={sessions} classes={classes} students={students} activeSession={activeSession} userId={user?.id} onRefresh={refreshAll} />
				)}
				{activeTab === "parents" && (
					<ParentsTab schoolId={schoolId} students={students} userId={user?.id} onRefresh={refreshAll} />
				)}
			</div>
		</div>
	);
}
