"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
} from "lucide-react";

export default function SuperAdminDashboard({ user, schoolData }) {
	const firstName = user?.full_name?.split(" ")[0] || "Rohit";
	
	// Class Performance state
	const [selectedClass, setSelectedClass] = useState("Class 8");
	const [selectedYear, setSelectedYear] = useState("2025");
	const [classDropdownOpen, setClassDropdownOpen] = useState(false);
	const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
	const classRef = useRef(null);
	const yearRef = useRef(null);

	// Teachers Performance state
	const [selectedTeacherClass, setSelectedTeacherClass] = useState("All Class");
	const [selectedTeacherYear, setSelectedTeacherYear] = useState("2025");
	const [teacherClassDropdownOpen, setTeacherClassDropdownOpen] = useState(false);
	const [teacherYearDropdownOpen, setTeacherYearDropdownOpen] = useState(false);
	const teacherClassRef = useRef(null);
	const teacherYearRef = useRef(null);

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
	
	// Calendar state
	const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 17)); // Default Sept 17
	const [selectedDate, setSelectedDate] = useState(17);

	// Class Performance Chart monthly data (0 - 100)
	const monthlyData = [
		{ month: "Jan", value: 4 },
		{ month: "Feb", value: 12 },
		{ month: "Mar", value: 32 },
		{ month: "Apr", value: 50 },
		{ month: "May", value: 58 },
		{ month: "Jun", value: 64 },
		{ month: "Jul", value: 12 },
		{ month: "Aug", value: 18 },
		{ month: "Sep", value: 24 },
		{ month: "Oct", value: 46 },
		{ month: "Nov", value: 68 },
		{ month: "Dec", value: 80 },
	];

	// Teachers Performance Chart monthly data (0 - 100)
	const teacherMonthlyData = [
		{ month: "Jan", value: 10 },
		{ month: "Feb", value: 22 },
		{ month: "Mar", value: 38 },
		{ month: "Apr", value: 45 },
		{ month: "May", value: 54 },
		{ month: "Jun", value: 60 },
		{ month: "Jul", value: 28 },
		{ month: "Aug", value: 35 },
		{ month: "Sep", value: 48 },
		{ month: "Oct", value: 62 },
		{ month: "Nov", value: 74 },
		{ month: "Dec", value: 85 },
	];

	const handlePrevMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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

	const classChart = useMemo(() => generateSpline(monthlyData), [monthlyData]);
	const teacherChart = useMemo(() => generateSpline(teacherMonthlyData), [teacherMonthlyData]);

	const [hoveredPoint, setHoveredPoint] = useState(null);
	const [teacherHoveredPoint, setTeacherHoveredPoint] = useState(null);

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
									<h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl">
										Good Morning, {firstName} 👋
									</h1>
									<p className="mt-1.5 text-sm font-medium text-slate-500">
										Here&apos;s how your school is performing
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
											1,248
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
											86
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
											78%
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
											36
										</p>
									</div>
								</div>

							</div>
						</section>

						{/* ── Class Performance Chart Card ── */}
						<section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7">
							<div className="flex flex-wrap items-center justify-between gap-4">
								<h2 className="text-lg font-bold tracking-tight text-slate-900">
									Class Performance
								</h2>
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
											className="flex min-w-[102px] items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											aria-expanded={classDropdownOpen}
										>
											<span>{selectedClass}</span>
											<ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${classDropdownOpen ? "rotate-180" : ""}`} />
										</button>
										{classDropdownOpen && (
											<div className="absolute left-0 z-30 mt-1.5 w-36 origin-top-left rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
												{["All Class", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map((c) => (
													<button
														key={c}
														type="button"
														onClick={() => {
															setSelectedClass(c);
															setClassDropdownOpen(false);
														}}
														className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
															selectedClass === c
																? "bg-orange-50 font-bold text-orange-600"
																: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
														}`}
													>
														{c}
													</button>
												))}
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
											className="flex min-w-[84px] items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											aria-expanded={yearDropdownOpen}
										>
											<span>{selectedYear}</span>
											<ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${yearDropdownOpen ? "rotate-180" : ""}`} />
										</button>
										{yearDropdownOpen && (
											<div className="absolute right-0 z-30 mt-1.5 w-28 origin-top-right rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
												{["2024", "2025", "2026"].map((y) => (
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
												))}
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
								<h2 className="text-lg font-bold tracking-tight text-slate-900">
									Teachers Performance
								</h2>
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
											className="flex min-w-[102px] items-center justify-between gap-2.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											aria-expanded={teacherClassDropdownOpen}
										>
											<span>{selectedTeacherClass}</span>
											<ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${teacherClassDropdownOpen ? "rotate-180" : ""}`} />
										</button>
										{teacherClassDropdownOpen && (
											<div className="absolute left-0 z-30 mt-1.5 w-36 origin-top-left rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
												{["All Class", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"].map((c) => (
													<button
														key={c}
														type="button"
														onClick={() => {
															setSelectedTeacherClass(c);
															setTeacherClassDropdownOpen(false);
														}}
														className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors ${
															selectedTeacherClass === c
																? "bg-orange-50 font-bold text-orange-600"
																: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
														}`}
													>
														{c}
													</button>
												))}
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
											className="flex min-w-[84px] items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
											aria-expanded={teacherYearDropdownOpen}
										>
											<span>{selectedTeacherYear}</span>
											<ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${teacherYearDropdownOpen ? "rotate-180" : ""}`} />
										</button>
										{teacherYearDropdownOpen && (
											<div className="absolute right-0 z-30 mt-1.5 w-28 origin-top-right rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
												{["2024", "2025", "2026"].map((y) => (
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
												))}
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
									className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
									aria-label="Previous month"
								>
									<ChevronLeft className="h-4 w-4" />
								</button>
								<h3 className="text-sm font-bold text-slate-800">
									Calendar
								</h3>
								<button
									type="button"
									onClick={handleNextMonth}
									className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
								{Array.from({ length: 3 }).map((_, i) => (
									<span key={`blank-${i}`} className="py-2 text-transparent">0</span>
								))}

								{/* Days 1 to 31 */}
								{Array.from({ length: 31 }).map((_, i) => {
									const day = i + 1;
									const isSelected = day === selectedDate;
									const isToday = day === 17;

									return (
										<button
											key={day}
											type="button"
											onClick={() => setSelectedDate(day)}
											className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
												isToday
													? "border-2 border-emerald-500 text-emerald-600 bg-emerald-50/50"
													: isSelected
													? "bg-slate-900 text-white"
													: "text-slate-700 hover:bg-slate-100"
											}`}
										>
											{day}
										</button>
									);
								})}
							</div>
						</section>

						{/* Upcoming Events Card */}
						<section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
							<div className="flex items-center justify-between">
								<h3 className="text-base font-bold text-slate-900">
									Upcoming
								</h3>
								<Link
									href="/dashboard/events"
									className="text-xs font-semibold text-[#ea580c] hover:underline"
								>
									View all
								</Link>
							</div>

							{/* Event Items */}
							<div className="mt-4 space-y-3">
								
								{/* Event 1 */}
								<div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
									<span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
										Room 102
									</span>
									<h4 className="mt-1.5 text-sm font-bold text-slate-900">
										Teacher&apos;s Meeting
									</h4>
									<p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
										<Clock className="h-3.5 w-3.5 text-slate-400" />
										08:30 AM - 10:30 AM
									</p>
								</div>

								{/* Event 2 */}
								<div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
									<span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
										Room 102
									</span>
									<h4 className="mt-1.5 text-sm font-bold text-slate-900">
										Meeting with Director
									</h4>
									<p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
										<Clock className="h-3.5 w-3.5 text-slate-400" />
										11:00 AM - 12:30 PM
									</p>
								</div>

							</div>
						</section>

					</div>

				</div>
			</div>
		</div>
	);
}
