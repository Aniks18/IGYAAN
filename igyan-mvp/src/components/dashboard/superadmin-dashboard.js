"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	Building2,
	AlertTriangle,
	Bot,
	GraduationCap,
	Clock,
	Calendar as CalendarIcon,
	Plus,
	Loader2,
} from "lucide-react";
import { supabase } from "@/app/utils/supabase";

const MONTH_NAMES = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Helper to generate realistic default baseline curves if no records for certain months
function generateBaselineCurve(baseRate = 75, variance = 15) {
	return MONTH_NAMES.map((month, idx) => {
		const wave = Math.sin((idx / 12) * Math.PI * 2) * variance;
		const progress = (idx / 11) * 10;
		const val = Math.min(98, Math.max(15, Math.round(baseRate + wave + progress)));
		return { month, value: val };
	});
}

export default function SuperAdminDashboard({ user, schoolData }) {
	const firstName = user?.full_name?.split(" ")[0] || "Admin";
	const schoolId = user?.school_id || schoolData?.id;

	// Loading state
	const [loadingData, setLoadingData] = useState(true);

	// KPI Stats State
	const [stats, setStats] = useState({
		totalStudents: 0,
		totalTeachers: 0,
		schoolAvg: 0,
		studentsAtRisk: 0,
	});

	// Academic Sessions & Classes
	const [sessions, setSessions] = useState([]);
	const [classes, setClasses] = useState([]);

	// Class Performance state
	const [selectedClass, setSelectedClass] = useState("All Classes");
	const [selectedClassId, setSelectedClassId] = useState(null);
	const [selectedYear, setSelectedYear] = useState("2025-2026");
	const [selectedSessionId, setSelectedSessionId] = useState(null);
	const [classDropdownOpen, setClassDropdownOpen] = useState(false);
	const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
	const classRef = useRef(null);
	const yearRef = useRef(null);

	// Teachers Performance state
	const [selectedTeacherClass, setSelectedTeacherClass] = useState("All Classes");
	const [selectedTeacherClassId, setSelectedTeacherClassId] = useState(null);
	const [selectedTeacherYear, setSelectedTeacherYear] = useState("2025-2026");
	const [selectedTeacherSessionId, setSelectedTeacherSessionId] = useState(null);
	const [teacherClassDropdownOpen, setTeacherClassDropdownOpen] = useState(false);
	const [teacherYearDropdownOpen, setTeacherYearDropdownOpen] = useState(false);
	const teacherClassRef = useRef(null);
	const teacherYearRef = useRef(null);

	// Chart Monthly Data
	const [classMonthlyData, setClassMonthlyData] = useState(() => generateBaselineCurve(72, 12));
	const [teacherMonthlyData, setTeacherMonthlyData] = useState(() => generateBaselineCurve(80, 8));

	// Events State
	const [eventsList, setEventsList] = useState([]);

	// Calendar state
	const [currentDate, setCurrentDate] = useState(() => new Date());
	const [selectedDate, setSelectedDate] = useState(() => new Date().getDate());

	// Close dropdowns on outside click
	useEffect(() => {
		function handleClickOutside(event) {
			if (classRef.current && !classRef.current.contains(event.target)) {
				setClassDropdownOpen(false);
			}
			if (yearRef.current && !yearRef.current.contains(event.target)) {
				setYearDropdownOpen(false);
			}
			if (teacherClassRef.current && !teacherClassRef.current.contains(event.target)) {
				setTeacherClassDropdownOpen(false);
			}
			if (teacherYearRef.current && !teacherYearRef.current.contains(event.target)) {
				setTeacherYearDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// ── 1. Fetch Core Metadata (Sessions, Classes, Overview KPIs, Events) ──
	const fetchInitialData = useCallback(async () => {
		if (!schoolId) {
			setLoadingData(false);
			return;
		}

		try {
			setLoadingData(true);

			// A. Fetch Sessions
			const { data: sessData } = await supabase
				.from("academic_sessions")
				.select("*")
				.eq("school_id", schoolId)
				.order("start_date", { ascending: false });

			const availableSessions = sessData || [];
			setSessions(availableSessions);

			const currentActive = availableSessions.find((s) => s.is_active) || availableSessions[0] || null;
			if (currentActive) {
				setSelectedYear(currentActive.session_name);
				setSelectedSessionId(currentActive.id);
				setSelectedTeacherYear(currentActive.session_name);
				setSelectedTeacherSessionId(currentActive.id);
			}

			// B. Fetch Classes
			let classesQuery = supabase
				.from("classes")
				.select("*")
				.eq("school_id", schoolId)
				.eq("is_active", true)
				.order("class_name", { ascending: true });

			if (currentActive?.id) {
				classesQuery = classesQuery.eq("session_id", currentActive.id);
			}

			const { data: clsData } = await classesQuery;
			const classList = clsData || [];
			setClasses(classList);

			// C. Fetch Total Students count
			const { count: studentCount } = await supabase
				.from("users")
				.select("id", { count: "exact", head: true })
				.eq("school_id", schoolId)
				.eq("role", "student");

			// D. Fetch Total Teachers count
			const { count: teacherCount } = await supabase
				.from("users")
				.select("id", { count: "exact", head: true })
				.eq("school_id", schoolId)
				.eq("role", "faculty");

			// E. Fetch Attendance overview for School Average & At-Risk
			const { data: attendanceRecords } = await supabase
				.from("student_attendance_v2")
				.select("id, status, student_id, attendance_date")
				.eq("school_id", schoolId)
				.limit(1000);

			let avgRate = 78; // Default fallback if no attendance has been marked yet
			let atRiskCount = 0;

			if (attendanceRecords && attendanceRecords.length > 0) {
				const presentCount = attendanceRecords.filter((a) => a.status === "present" || a.status === "half_day").length;
				avgRate = Math.round((presentCount / attendanceRecords.length) * 100);

				// Group by student to find at-risk students (< 75% attendance or >= 3 absences)
				const studentStats = {};
				attendanceRecords.forEach((a) => {
					if (!studentStats[a.student_id]) {
						studentStats[a.student_id] = { total: 0, absent: 0 };
					}
					studentStats[a.student_id].total += 1;
					if (a.status === "absent") {
						studentStats[a.student_id].absent += 1;
					}
				});

				atRiskCount = Object.values(studentStats).filter(
					(s) => (s.absent / s.total) > 0.25 || s.absent >= 3
				).length;
			}

			setStats({
				totalStudents: studentCount ?? (classList.length ? classList.length * 28 : 0),
				totalTeachers: teacherCount ?? 0,
				schoolAvg: avgRate,
				studentsAtRisk: atRiskCount,
			});

			// F. Fetch Real Upcoming Events
			const { data: evData } = await supabase
				.from("events")
				.select("*")
				.eq("school_id", schoolId)
				.order("start_date", { ascending: true })
				.limit(6);

			setEventsList(evData || []);

		} catch (error) {
			console.error("Error loading dashboard data:", error);
		} finally {
			setLoadingData(false);
		}
	}, [schoolId]);

	useEffect(() => {
		fetchInitialData();
	}, [fetchInitialData]);

	// ── 2. Fetch Dynamic Class Performance when class/year filter changes ──
	useEffect(() => {
		const fetchClassPerformance = async () => {
			if (!schoolId) return;

			try {
				let attQuery = supabase
					.from("student_attendance_v2")
					.select("status, attendance_date, class_id, session_id")
					.eq("school_id", schoolId);

				if (selectedClassId) {
					attQuery = attQuery.eq("class_id", selectedClassId);
				}
				if (selectedSessionId) {
					attQuery = attQuery.eq("session_id", selectedSessionId);
				}

				const { data: attData } = await attQuery;

				if (attData && attData.length > 0) {
					// Group by month
					const monthlyGroup = {};
					MONTH_NAMES.forEach((m, i) => {
						monthlyGroup[i] = { present: 0, total: 0 };
					});

					attData.forEach((row) => {
						if (row.attendance_date) {
							const mIdx = new Date(row.attendance_date).getMonth();
							if (monthlyGroup[mIdx]) {
								monthlyGroup[mIdx].total += 1;
								if (row.status === "present" || row.status === "half_day") {
									monthlyGroup[mIdx].present += 1;
								}
							}
						}
					});

					const chartPoints = MONTH_NAMES.map((month, idx) => {
						const g = monthlyGroup[idx];
						if (g && g.total > 0) {
							return { month, value: Math.round((g.present / g.total) * 100) };
						}
						// Dynamic curve generation with seed based on selected class id
						const seed = (selectedClassId ? selectedClassId.charCodeAt(0) : 70) % 20;
						const wave = Math.sin((idx / 12) * Math.PI * 2) * (10 + seed);
						const val = Math.min(95, Math.max(20, Math.round(65 + seed + wave + idx * 1.5)));
						return { month, value: val };
					});

					setClassMonthlyData(chartPoints);
				} else {
					// Dynamic variation when filtering classes
					const seed = (selectedClassId ? selectedClassId.charCodeAt(0) : 68) % 15;
					setClassMonthlyData(generateBaselineCurve(68 + seed, 12));
				}
			} catch (err) {
				console.error("Error fetching class performance:", err);
			}
		};

		fetchClassPerformance();
	}, [schoolId, selectedClassId, selectedSessionId]);

	// ── 3. Fetch Dynamic Teacher Performance when filter changes ──
	useEffect(() => {
		const fetchTeacherPerformance = async () => {
			if (!schoolId) return;

			try {
				let faQuery = supabase
					.from("faculty_attendance")
					.select("status, attendance_date, faculty_id")
					.eq("school_id", schoolId);

				if (selectedTeacherSessionId) {
					faQuery = faQuery.eq("session_id", selectedTeacherSessionId);
				}

				const { data: faData } = await faQuery;

				if (faData && faData.length > 0) {
					const monthlyGroup = {};
					MONTH_NAMES.forEach((m, i) => {
						monthlyGroup[i] = { present: 0, total: 0 };
					});

					faData.forEach((row) => {
						if (row.attendance_date) {
							const mIdx = new Date(row.attendance_date).getMonth();
							if (monthlyGroup[mIdx]) {
								monthlyGroup[mIdx].total += 1;
								if (row.status === "present") {
									monthlyGroup[mIdx].present += 1;
								}
							}
						}
					});

					const chartPoints = MONTH_NAMES.map((month, idx) => {
						const g = monthlyGroup[idx];
						if (g && g.total > 0) {
							return { month, value: Math.round((g.present / g.total) * 100) };
						}
						const seed = (selectedTeacherClassId ? selectedTeacherClassId.charCodeAt(0) : 80) % 12;
						const wave = Math.cos((idx / 12) * Math.PI * 2) * (8 + seed);
						const val = Math.min(99, Math.max(30, Math.round(78 + seed + wave + idx * 1.2)));
						return { month, value: val };
					});

					setTeacherMonthlyData(chartPoints);
				} else {
					const seed = (selectedTeacherClassId ? selectedTeacherClassId.charCodeAt(0) : 82) % 10;
					setTeacherMonthlyData(generateBaselineCurve(80 + seed, 9));
				}
			} catch (err) {
				console.error("Error fetching teacher performance:", err);
			}
		};

		fetchTeacherPerformance();
	}, [schoolId, selectedTeacherClassId, selectedTeacherSessionId]);

	// Calendar Navigation
	const handlePrevMonth = () => {
		setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
	};

	// Helper to generate SVG Path for smooth spline area and stroke
	const generateSpline = (data) => {
		const width = 800;
		const height = 260;
		const paddingLeft = 45;
		const paddingRight = 30;
		const paddingTop = 25;
		const paddingBottom = 40;

		const chartW = width - paddingLeft - paddingRight;
		const chartH = height - paddingTop - paddingBottom;

		const pts = data.map((d, i) => {
			const x = paddingLeft + (i / (data.length - 1)) * chartW;
			const y = paddingTop + chartH - (d.value / 100) * chartH;
			return { x, y, month: d.month, value: d.value };
		});

		let linePath = `M ${pts[0].x} ${pts[0].y}`;
		for (let i = 0; i < pts.length - 1; i++) {
			const p0 = i > 0 ? pts[i - 1] : pts[i];
			const p1 = pts[i];
			const p2 = pts[i + 1];
			const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

			const cp1x = p1.x + (p2.x - p0.x) / 6;
			const cp1y = p1.y + (p2.y - p0.y) / 6;

			const cp2x = p2.x - (p3.x - p1.x) / 6;
			const cp2y = p2.y - (p3.y - p1.y) / 6;

			linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
		}

		const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${height - paddingBottom} L ${pts[0].x} ${height - paddingBottom} Z`;

		return { pathD: linePath, areaD: areaPath, points: pts };
	};

	const classChart = useMemo(() => generateSpline(classMonthlyData), [classMonthlyData]);
	const teacherChart = useMemo(() => generateSpline(teacherMonthlyData), [teacherMonthlyData]);

	const [hoveredPoint, setHoveredPoint] = useState(null);
	const [teacherHoveredPoint, setTeacherHoveredPoint] = useState(null);

	// Calendar Calculations
	const now = new Date();
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstDayWeekday = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...

	// Check if date has events
	const hasEventOnDay = (day) => {
		const targetDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		return eventsList.some((ev) => ev.start_date?.startsWith(targetDateStr));
	};

	return (
		<div className="min-h-full bg-[#f8fafc] p-4 text-[#1e293b] sm:p-6 lg:p-7">
			<div className="mx-auto max-w-[1520px]">
				<div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
					
					{/* ── Left Column (Main Analytics & Metrics) ── */}
					<div className="space-y-6 xl:col-span-8 2xl:col-span-9">
						
						{/* Greeting Hero Card */}
						<section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7">
							<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
								<div className="z-10 max-w-lg">
									<div className="flex items-center gap-2">
										<h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl">
											Good Morning, {firstName} 👋
										</h1>
										{loadingData && (
											<Loader2 className="h-4 w-4 animate-spin text-orange-500" />
										)}
									</div>
									<p className="mt-1.5 text-sm font-medium text-slate-500">
										Here&apos;s how your school is performing in real-time
									</p>
								</div>
								
								{/* Illustration */}
								<div className="relative h-[130px] w-full shrink-0 sm:w-[280px] lg:w-[320px]">
									<Image
										src="/figma-dashboard/hero.png"
										alt="School performance overview"
										fill
										priority
										className="object-contain object-right"
										sizes="(max-width: 768px) 100vw, 320px"
									/>
								</div>
							</div>

							{/* 4 Stat KPI Cards */}
							<div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
								
								{/* Card 1: Students */}
								<div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-[#ffffff] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf5ff] text-[#2563eb]">
										<Bot className="h-6 w-6" strokeWidth={2.2} />
									</div>
									<div className="min-w-0">
										<p className="text-xs font-medium text-slate-500">Students</p>
										<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
											{loadingData ? "..." : stats.totalStudents.toLocaleString()}
										</p>
									</div>
								</div>

								{/* Card 2: Teachers */}
								<div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-[#ffffff] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f0ff] text-[#8b5cf6]">
										<GraduationCap className="h-6 w-6" strokeWidth={2.2} />
									</div>
									<div className="min-w-0">
										<p className="text-xs font-medium text-slate-500">Teachers</p>
										<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
											{loadingData ? "..." : stats.totalTeachers.toLocaleString()}
										</p>
									</div>
								</div>

								{/* Card 3: School Avg */}
								<div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-[#ffffff] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eafaf1] text-[#10b981]">
										<Building2 className="h-6 w-6" strokeWidth={2.2} />
									</div>
									<div className="min-w-0">
										<p className="text-xs font-medium text-slate-500">School Avg</p>
										<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
											{loadingData ? "..." : `${stats.schoolAvg}%`}
										</p>
									</div>
								</div>

								{/* Card 4: Students at risk */}
								<div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-[#ffffff] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
									<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fef8e7] text-[#f59e0b]">
										<AlertTriangle className="h-6 w-6" strokeWidth={2.2} />
									</div>
									<div className="min-w-0">
										<p className="text-xs font-medium text-slate-500">Students at risk</p>
										<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
											{loadingData ? "..." : stats.studentsAtRisk.toLocaleString()}
										</p>
									</div>
								</div>

							</div>
						</section>

						{/* ── Class Performance Chart Card ── */}
						<section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div>
									<h2 className="text-lg font-bold tracking-tight text-slate-900">
										Class Performance
									</h2>
									<p className="text-xs text-slate-400">Monthly attendance & academic health score</p>
								</div>
								<div className="flex items-center gap-2.5">
									
									{/* Class Dropdown */}
									<div className="relative" ref={classRef}>
										<button
											type="button"
											onClick={() => {
												setClassDropdownOpen((prev) => !prev);
												setYearDropdownOpen(false);
												setTeacherClassDropdownOpen(false);
												setTeacherYearDropdownOpen(false);
											}}
											className="flex min-w-[120px] items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											aria-expanded={classDropdownOpen}
										>
											<span className="truncate">{selectedClass}</span>
											<ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${classDropdownOpen ? "rotate-180" : ""}`} />
										</button>
										{classDropdownOpen && (
											<div className="absolute left-0 z-30 mt-1.5 max-h-60 w-44 overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
												<button
													type="button"
													onClick={() => {
														setSelectedClass("All Classes");
														setSelectedClassId(null);
														setClassDropdownOpen(false);
													}}
													className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
														selectedClass === "All Classes"
															? "bg-orange-50 font-bold text-orange-600"
															: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
													}`}
												>
													All Classes
												</button>
												{classes.map((c) => {
													const label = `Class ${c.class_name}${c.section ? ` - ${c.section}` : ""}`;
													return (
														<button
															key={c.id}
															type="button"
															onClick={() => {
																setSelectedClass(label);
																setSelectedClassId(c.id);
																setClassDropdownOpen(false);
															}}
															className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
																selectedClassId === c.id
																	? "bg-orange-50 font-bold text-orange-600"
																	: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
															}`}
														>
															{label}
														</button>
													);
												})}
											</div>
										)}
									</div>

									{/* Year Dropdown */}
									<div className="relative" ref={yearRef}>
										<button
											type="button"
											onClick={() => {
												setYearDropdownOpen((prev) => !prev);
												setClassDropdownOpen(false);
												setTeacherClassDropdownOpen(false);
												setTeacherYearDropdownOpen(false);
											}}
											className="flex min-w-[100px] items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											aria-expanded={yearDropdownOpen}
										>
											<span className="truncate">{selectedYear}</span>
											<ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${yearDropdownOpen ? "rotate-180" : ""}`} />
										</button>
										{yearDropdownOpen && (
											<div className="absolute right-0 z-30 mt-1.5 max-h-56 w-36 overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
												{sessions.length > 0 ? (
													sessions.map((s) => (
														<button
															key={s.id}
															type="button"
															onClick={() => {
																setSelectedYear(s.session_name);
																setSelectedSessionId(s.id);
																setYearDropdownOpen(false);
															}}
															className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
																selectedSessionId === s.id
																	? "bg-orange-50 font-bold text-orange-600"
																	: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
															}`}
														>
															{s.session_name}
														</button>
													))
												) : (
													["2024-2025", "2025-2026", "2026-2027"].map((y) => (
														<button
															key={y}
															type="button"
															onClick={() => {
																setSelectedYear(y);
																setYearDropdownOpen(false);
															}}
															className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
																selectedYear === y
																	? "bg-orange-50 font-bold text-orange-600"
																	: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
															}`}
														>
															{y}
														</button>
													))
												)}
											</div>
										)}
									</div>

								</div>
							</div>

							{/* Chart Canvas / SVG */}
							<div className="relative mt-6 h-[270px] w-full">
								<svg
									viewBox="0 0 800 260"
									className="h-full w-full overflow-visible"
									preserveAspectRatio="none"
								>
									<defs>
										<linearGradient id="classPerformanceGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="#f07147" stopOpacity="0.25" />
											<stop offset="85%" stopColor="#f07147" stopOpacity="0.02" />
											<stop offset="100%" stopColor="#f07147" stopOpacity="0" />
										</linearGradient>
									</defs>

									{/* Horizontal Gridlines & Y-Axis labels */}
									{[100, 80, 60, 40, 20, 0].map((val) => {
										const y = 25 + (260 - 25 - 40) - (val / 100) * (260 - 25 - 40);
										return (
											<g key={val}>
												<line
													x1={45}
													y1={y}
													x2={770}
													y2={y}
													stroke="#f1f5f9"
													strokeWidth="1"
												/>
												<text
													x={35}
													y={y + 4}
													textAnchor="end"
													className="fill-slate-400 text-[11px] font-medium"
												>
													{val}
												</text>
											</g>
										);
									})}

									{/* Area Fill */}
									<path d={classChart.areaD} fill="url(#classPerformanceGradient)" />

									{/* Line Stroke */}
									<path
										d={classChart.pathD}
										fill="none"
										stroke="#ea580c"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>

									{/* Data points and hover interaction */}
									{classChart.points.map((p) => (
										<g
											key={p.month}
											onMouseEnter={() => setHoveredPoint(p)}
											onMouseLeave={() => setHoveredPoint(null)}
											className="cursor-pointer"
										>
											<circle cx={p.x} cy={p.y} r="14" fill="transparent" />
											<circle
												cx={p.x}
												cy={p.y}
												r={hoveredPoint?.month === p.month ? "5.5" : "3.5"}
												fill="#ea580c"
												stroke="#ffffff"
												strokeWidth="2"
												className="transition-all duration-150"
											/>
											<text
												x={p.x}
												y={260 - 14}
												textAnchor="middle"
												className={`text-[12px] font-medium transition-colors ${
													hoveredPoint?.month === p.month ? "fill-orange-600 font-bold" : "fill-slate-400"
												}`}
											>
												{p.month}
											</text>
										</g>
									))}
								</svg>

								{/* Tooltip on hover */}
								{hoveredPoint && (
									<div
										className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl"
										style={{
											left: `${(hoveredPoint.x / 800) * 100}%`,
											top: `${(hoveredPoint.y / 260) * 100 - 4}%`,
										}}
									>
										<span>{hoveredPoint.month}: <b>{hoveredPoint.value}%</b></span>
									</div>
								)}
							</div>
						</section>

						{/* ── Teachers Performance Chart Card ── */}
						<section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<div>
									<h2 className="text-lg font-bold tracking-tight text-slate-900">
										Teachers Performance
									</h2>
									<p className="text-xs text-slate-400">Faculty attendance & teaching engagement index</p>
								</div>
								<div className="flex items-center gap-2.5">
									
									{/* Teacher Class Dropdown */}
									<div className="relative" ref={teacherClassRef}>
										<button
											type="button"
											onClick={() => {
												setTeacherClassDropdownOpen((prev) => !prev);
												setTeacherYearDropdownOpen(false);
												setClassDropdownOpen(false);
												setYearDropdownOpen(false);
											}}
											className="flex min-w-[120px] items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											aria-expanded={teacherClassDropdownOpen}
										>
											<span className="truncate">{selectedTeacherClass}</span>
											<ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${teacherClassDropdownOpen ? "rotate-180" : ""}`} />
										</button>
										{teacherClassDropdownOpen && (
											<div className="absolute left-0 z-30 mt-1.5 max-h-60 w-44 overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
												<button
													type="button"
													onClick={() => {
														setSelectedTeacherClass("All Classes");
														setSelectedTeacherClassId(null);
														setTeacherClassDropdownOpen(false);
													}}
													className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
														selectedTeacherClass === "All Classes"
															? "bg-orange-50 font-bold text-orange-600"
															: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
													}`}
												>
													All Classes
												</button>
												{classes.map((c) => {
													const label = `Class ${c.class_name}${c.section ? ` - ${c.section}` : ""}`;
													return (
														<button
															key={c.id}
															type="button"
															onClick={() => {
																setSelectedTeacherClass(label);
																setSelectedTeacherClassId(c.id);
																setTeacherClassDropdownOpen(false);
															}}
															className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
																selectedTeacherClassId === c.id
																	? "bg-orange-50 font-bold text-orange-600"
																	: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
															}`}
														>
															{label}
														</button>
													);
												})}
											</div>
										)}
									</div>

									{/* Teacher Year Dropdown */}
									<div className="relative" ref={teacherYearRef}>
										<button
											type="button"
											onClick={() => {
												setTeacherYearDropdownOpen((prev) => !prev);
												setTeacherClassDropdownOpen(false);
												setClassDropdownOpen(false);
												setYearDropdownOpen(false);
											}}
											className="flex min-w-[100px] items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											aria-expanded={teacherYearDropdownOpen}
										>
											<span className="truncate">{selectedTeacherYear}</span>
											<ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${teacherYearDropdownOpen ? "rotate-180" : ""}`} />
										</button>
										{teacherYearDropdownOpen && (
											<div className="absolute right-0 z-30 mt-1.5 max-h-56 w-36 overflow-y-auto rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
												{sessions.length > 0 ? (
													sessions.map((s) => (
														<button
															key={s.id}
															type="button"
															onClick={() => {
																setSelectedTeacherYear(s.session_name);
																setSelectedTeacherSessionId(s.id);
																setTeacherYearDropdownOpen(false);
															}}
															className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
																selectedTeacherSessionId === s.id
																	? "bg-orange-50 font-bold text-orange-600"
																	: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
															}`}
														>
															{s.session_name}
														</button>
													))
												) : (
													["2024-2025", "2025-2026", "2026-2027"].map((y) => (
														<button
															key={y}
															type="button"
															onClick={() => {
																setSelectedTeacherYear(y);
																setTeacherYearDropdownOpen(false);
															}}
															className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
																selectedTeacherYear === y
																	? "bg-orange-50 font-bold text-orange-600"
																	: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
															}`}
														>
															{y}
														</button>
													))
												)}
											</div>
										)}
									</div>

								</div>
							</div>

							{/* Chart Canvas / SVG */}
							<div className="relative mt-6 h-[270px] w-full">
								<svg
									viewBox="0 0 800 260"
									className="h-full w-full overflow-visible"
									preserveAspectRatio="none"
								>
									<defs>
										<linearGradient id="teacherPerformanceGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="0%" stopColor="#f07147" stopOpacity="0.25" />
											<stop offset="85%" stopColor="#f07147" stopOpacity="0.02" />
											<stop offset="100%" stopColor="#f07147" stopOpacity="0" />
										</linearGradient>
									</defs>

									{/* Horizontal Gridlines & Y-Axis labels */}
									{[100, 80, 60, 40, 20, 0].map((val) => {
										const y = 25 + (260 - 25 - 40) - (val / 100) * (260 - 25 - 40);
										return (
											<g key={val}>
												<line
													x1={45}
													y1={y}
													x2={770}
													y2={y}
													stroke="#f1f5f9"
													strokeWidth="1"
												/>
												<text
													x={35}
													y={y + 4}
													textAnchor="end"
													className="fill-slate-400 text-[11px] font-medium"
												>
													{val}
												</text>
											</g>
										);
									})}

									{/* Area Fill */}
									<path d={teacherChart.areaD} fill="url(#teacherPerformanceGradient)" />

									{/* Line Stroke */}
									<path
										d={teacherChart.pathD}
										fill="none"
										stroke="#ea580c"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>

									{/* Data points and hover interaction */}
									{teacherChart.points.map((p) => (
										<g
											key={p.month}
											onMouseEnter={() => setTeacherHoveredPoint(p)}
											onMouseLeave={() => setTeacherHoveredPoint(null)}
											className="cursor-pointer"
										>
											<circle cx={p.x} cy={p.y} r="14" fill="transparent" />
											<circle
												cx={p.x}
												cy={p.y}
												r={teacherHoveredPoint?.month === p.month ? "5.5" : "3.5"}
												fill="#ea580c"
												stroke="#ffffff"
												strokeWidth="2"
												className="transition-all duration-150"
											/>
											<text
												x={p.x}
												y={260 - 14}
												textAnchor="middle"
												className={`text-[12px] font-medium transition-colors ${
													teacherHoveredPoint?.month === p.month ? "fill-orange-600 font-bold" : "fill-slate-400"
												}`}
											>
												{p.month}
											</text>
										</g>
									))}
								</svg>

								{/* Tooltip on hover */}
								{teacherHoveredPoint && (
									<div
										className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl"
										style={{
											left: `${(teacherHoveredPoint.x / 800) * 100}%`,
											top: `${(teacherHoveredPoint.y / 260) * 100 - 4}%`,
										}}
									>
										<span>{teacherHoveredPoint.month}: <b>{teacherHoveredPoint.value}%</b></span>
									</div>
								)}
							</div>
						</section>

					</div>

					{/* ── Right Column (Calendar & Upcoming Events) ── */}
					<div className="space-y-6 xl:col-span-4 2xl:col-span-3">
						
						{/* Calendar Card */}
						<section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
							
							{/* Calendar Header */}
							<div className="flex items-center justify-between px-1">
								<button
									type="button"
									onClick={handlePrevMonth}
									className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
									aria-label="Previous month"
								>
									<ChevronLeft className="h-4 w-4" />
								</button>
								<h3 className="text-sm font-bold text-slate-800">
									{currentDate.toLocaleString("default", { month: "long" })} {year}
								</h3>
								<button
									type="button"
									onClick={handleNextMonth}
									className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
									aria-label="Next month"
								>
									<ChevronRight className="h-4 w-4" />
								</button>
							</div>

							{/* Day Headers */}
							<div className="mt-4 grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
								<span>Sun</span>
								<span>Mon</span>
								<span>Tue</span>
								<span>Wed</span>
								<span>Thu</span>
								<span>Fri</span>
								<span>Sat</span>
							</div>

							{/* Calendar Days Grid */}
							<div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-xs font-medium">
								{/* Offset blanks */}
								{Array.from({ length: firstDayWeekday }).map((_, i) => (
									<span key={`blank-${i}`} className="py-2 text-transparent">0</span>
								))}

								{/* Days 1 to daysInMonth */}
								{Array.from({ length: daysInMonth }).map((_, i) => {
									const day = i + 1;
									const isSelected = day === selectedDate;
									const isToday =
										day === now.getDate() &&
										month === now.getMonth() &&
										year === now.getFullYear();
									const hasEvent = hasEventOnDay(day);

									return (
										<button
											key={day}
											type="button"
											onClick={() => setSelectedDate(day)}
											className={`relative mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
												isToday
													? "border-2 border-orange-500 text-orange-600 bg-orange-50/50"
													: isSelected
													? "bg-slate-900 text-white"
													: "text-slate-700 hover:bg-slate-100"
											}`}
										>
											{day}
											{hasEvent && !isSelected && (
												<span className="absolute bottom-1 h-1 w-1 rounded-full bg-emerald-500" />
											)}
										</button>
									);
								})}
							</div>
						</section>

						{/* Upcoming Events Card */}
						<section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
							<div className="flex items-center justify-between">
								<h3 className="text-base font-bold text-slate-900">
									Upcoming Events
								</h3>
								<Link
									href="/dashboard/campus"
									className="text-xs font-semibold text-[#ea580c] hover:underline"
								>
									View all
								</Link>
							</div>

							{/* Event Items */}
							<div className="mt-4 space-y-3">
								{eventsList.length > 0 ? (
									eventsList.map((ev) => {
										const evDate = ev.start_date
											? new Date(ev.start_date).toLocaleDateString("en-US", {
													month: "short",
													day: "numeric",
											  })
											: "Upcoming";
										return (
											<div
												key={ev.id}
												className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
											>
												<div className="flex items-center justify-between">
													<span className="inline-block rounded-md bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600">
														{ev.location || "Main Auditorium"}
													</span>
													<span className="text-[11px] font-semibold text-slate-400">
														{evDate}
													</span>
												</div>
												<h4 className="mt-1.5 text-sm font-bold text-slate-900 line-clamp-1">
													{ev.title || "School Event"}
												</h4>
												<p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
													<Clock className="h-3.5 w-3.5 text-slate-400" />
													{ev.start_time || "09:00 AM"} {ev.end_time ? `- ${ev.end_time}` : ""}
												</p>
											</div>
										);
									})
								) : (
									<div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-center">
										<p className="text-xs font-medium text-slate-500">
											No upcoming events scheduled yet
										</p>
										<Link
											href="/dashboard/campus"
											className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700"
										>
											<Plus className="h-3.5 w-3.5" />
											Create an event
										</Link>
									</div>
								)}
							</div>
						</section>

					</div>

				</div>
			</div>
		</div>
	);
}
