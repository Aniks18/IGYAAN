"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import {
	Search,
	Plus,
	ChevronDown,
	Check,
	X,
	MoreVertical,
	ArrowRight,
	Users,
	GraduationCap,
	School,
	CheckCircle,
	ArrowLeftRight,
	UserCheck,
	Trash2,
	Eye,
	RefreshCw,
	Sparkles,
	SlidersHorizontal,
	Calendar,
} from "lucide-react";

// Initial Demo History matching Figma Screenshot exactly
const INITIAL_TRANSFER_HISTORY = [
	{
		id: "tr-1",
		student_name: "Riya Kapoor",
		from_class: "1-A",
		to_class: "2-A",
		to_year: "2026-27",
		transfer_type: "Promotion",
		date: "Today",
		created_at: new Date().toISOString(),
	},
	{
		id: "tr-2",
		student_name: "Aditya Singh",
		from_class: "1-B",
		to_class: "2-B",
		to_year: "2026-27",
		transfer_type: "Section-Change",
		date: "2 days ago",
		created_at: "2026-09-11",
	},
	{
		id: "tr-3",
		student_name: "Neha Sharma",
		from_class: "1-C",
		to_class: "2-C",
		to_year: "2026-27",
		transfer_type: "Demotion",
		date: "3 weeks ago",
		created_at: "2026-08-22",
	},
	{
		id: "tr-4",
		student_name: "Karan Patel",
		from_class: "2-A",
		to_class: "3-A",
		to_year: "2026-27",
		transfer_type: "Section-Change",
		date: "3 weeks ago",
		created_at: "2026-08-22",
	},
	{
		id: "tr-5",
		student_name: "Sneha Reddy",
		from_class: "2-B",
		to_class: "3-B",
		to_year: "2026-27",
		transfer_type: "Section-Change",
		date: "3 weeks ago",
		created_at: "2026-08-22",
	},
	{
		id: "tr-6",
		student_name: "Vikram Joshi",
		from_class: "2-C",
		to_class: "3-C",
		to_year: "2026-27",
		transfer_type: "Section-Change",
		date: "3 weeks ago",
		created_at: "2026-08-22",
	},
	{
		id: "tr-7",
		student_name: "Anjali Desai",
		from_class: "2-D",
		to_class: "3-D",
		to_year: "2026-27",
		transfer_type: "Section-Change",
		date: "3 weeks ago",
		created_at: "2026-08-22",
	},
	{
		id: "tr-8",
		student_name: "Rahul Mehta",
		from_class: "2-E",
		to_class: "3-E",
		to_year: "2026-27",
		transfer_type: "Section-Change",
		date: "3 weeks ago",
		created_at: "2026-08-22",
	},
];

// Demo Students available for selection in Class Transfer
const CLASS_STUDENTS_LIST = [
	{ id: "stu-1", name: "Aarav Sharma", roll: "01", admissionNo: "234727541", currentClass: "1-C" },
	{ id: "stu-2", name: "Sneha Gupta", roll: "02", admissionNo: "234727542", currentClass: "1-C" },
	{ id: "stu-3", name: "Karan Mehta", roll: "03", admissionNo: "234727543", currentClass: "1-C" },
	{ id: "stu-4", name: "Priya Singh", roll: "04", admissionNo: "234727544", currentClass: "1-C" },
	{ id: "stu-5", name: "Rohan Desai", roll: "05", admissionNo: "234727545", currentClass: "1-C" },
	{ id: "stu-6", name: "Anjali Joshi", roll: "06", admissionNo: "234727546", currentClass: "1-C" },
	{ id: "stu-7", name: "Kabir Verma", roll: "07", admissionNo: "234727547", currentClass: "1-C" },
	{ id: "stu-8", name: "Diya Nair", roll: "08", admissionNo: "234727548", currentClass: "1-C" },
	{ id: "stu-9", name: "Tanvi Patel", roll: "09", admissionNo: "234727549", currentClass: "1-C" },
];

// All Students Pool for individual search
const ALL_STUDENTS_POOL = [
	{ id: "stu-101", name: "Raj Patel", roll: "01", admissionNo: "234727540", currentClass: "1-A", status: "Active" },
	{ id: "stu-102", name: "Riya Kapoor", roll: "02", admissionNo: "234727551", currentClass: "1-A", status: "Active" },
	{ id: "stu-103", name: "Aditya Singh", roll: "03", admissionNo: "234727552", currentClass: "1-B", status: "Active" },
	{ id: "stu-104", name: "Neha Sharma", roll: "04", admissionNo: "234727553", currentClass: "1-C", status: "Active" },
	{ id: "stu-105", name: "Karan Patel", roll: "05", admissionNo: "234727554", currentClass: "2-A", status: "Active" },
	{ id: "stu-106", name: "Sneha Reddy", roll: "06", admissionNo: "234727555", currentClass: "2-B", status: "Active" },
	{ id: "stu-107", name: "Vikram Joshi", roll: "07", admissionNo: "234727556", currentClass: "2-C", status: "Active" },
	{ id: "stu-108", name: "Anjali Desai", roll: "08", admissionNo: "234727557", currentClass: "2-D", status: "Active" },
];

const SESSION_OPTIONS = [
	{ value: "2026-27", label: "2026-27" },
	{ value: "2027-28", label: "2027-28" },
	{ value: "2028-29", label: "2028-29" },
];

const CLASS_OPTIONS = [
	{ value: "1-A", label: "1-A" },
	{ value: "1-B", label: "1-B" },
	{ value: "1-C", label: "1-C" },
	{ value: "2-A", label: "2-A" },
	{ value: "2-B", label: "2-B" },
	{ value: "2-C", label: "2-C" },
	{ value: "2-D", label: "2-D" },
	{ value: "2-E", label: "2-E" },
	{ value: "3-A", label: "3-A" },
	{ value: "3-B", label: "3-B" },
	{ value: "3-C", label: "3-C" },
];

// Custom Sleek Select Dropdown Component
function CustomSelect({ value, onChange, options, placeholder = "Select...", className = "" }) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectedOption = options.find((opt) => String(opt.value) === String(value));

	return (
		<div className={`relative ${className}`} ref={containerRef}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className={`w-full flex items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 transition-all cursor-pointer ${
					isOpen ? "border-[#ea580c] ring-2 ring-[#ea580c]/15 shadow-xs" : "border-slate-200 hover:border-slate-300"
				}`}
			>
				<span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
				<ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#ea580c]" : ""}`} />
			</button>

			{isOpen && (
				<div className="absolute left-0 right-0 top-full mt-1.5 z-50 max-h-56 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in-0 zoom-in-95 [scrollbar-width:thin]">
					{options.map((opt) => {
						const isSelected = String(opt.value) === String(value);
						return (
							<button
								key={opt.value}
								type="button"
								onClick={() => {
									onChange(opt.value);
									setIsOpen(false);
								}}
								className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors cursor-pointer ${
									isSelected
										? "bg-[#fff7ed] text-[#ea580c] font-semibold"
										: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
								}`}
							>
								<span className="truncate">{opt.label}</span>
								{isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#ea580c]" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function TransferPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();

	const [history, setHistory] = useState(INITIAL_TRANSFER_HISTORY);
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState("All Type");
	const [openMenuId, setOpenMenuId] = useState(null);

	// Modals / Drawers
	const [showTransferClassDrawer, setShowTransferClassDrawer] = useState(false);
	const [showTransferStudentDrawer, setShowTransferStudentDrawer] = useState(false);

	// Transfer Class Form State
	const [classSessionFrom, setClassSessionFrom] = useState("2026-27");
	const [classSessionTo, setClassSessionTo] = useState("2027-28");
	const [classClassFrom, setClassClassFrom] = useState("1-C");
	const [classClassTo, setClassClassTo] = useState("2-C");
	const [selectedClassStudentIds, setSelectedClassStudentIds] = useState(
		CLASS_STUDENTS_LIST.map((s) => s.id)
	);

	// Transfer Student Form State
	const [studentSearchInput, setStudentSearchInput] = useState("");
	const [selectedSingleStudent, setSelectedSingleStudent] = useState(ALL_STUDENTS_POOL[0]); // Default Raj Patel
	const [studentSessionTo, setStudentSessionTo] = useState("2027-28");
	const [studentClassTo, setStudentClassTo] = useState("2-A");
	const [studentTransferType, setStudentTransferType] = useState("Promotion");

	// Toast
	const [toastMsg, setToastMsg] = useState("");

	const showToast = (msg) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(""), 3500);
	};

	// Auth protection
	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		}
	}, [user, authLoading, router]);

	// Close menu on doc click
	useEffect(() => {
		const handleDocClick = () => setOpenMenuId(null);
		document.addEventListener("click", handleDocClick);
		return () => document.removeEventListener("click", handleDocClick);
	}, []);

	// Filtered History
	const filteredHistory = useMemo(() => {
		return history.filter((item) => {
			const matchesSearch =
				item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.from_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.to_class.toLowerCase().includes(searchQuery.toLowerCase());

			if (!matchesSearch) return false;
			if (typeFilter !== "All Type" && item.transfer_type !== typeFilter) return false;
			return true;
		});
	}, [history, searchQuery, typeFilter]);

	// Toggle Student Checkbox in Class Transfer
	const toggleStudentSelection = (id) => {
		setSelectedClassStudentIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	};

	const toggleSelectAllStudents = () => {
		if (selectedClassStudentIds.length === CLASS_STUDENTS_LIST.length) {
			setSelectedClassStudentIds([]);
		} else {
			setSelectedClassStudentIds(CLASS_STUDENTS_LIST.map((s) => s.id));
		}
	};

	// Submit Transfer Class
	const handleTransferClassSubmit = (e) => {
		e.preventDefault();
		if (selectedClassStudentIds.length === 0) {
			showToast("Please select at least one student to transfer.");
			return;
		}

		const selectedStudents = CLASS_STUDENTS_LIST.filter((s) =>
			selectedClassStudentIds.includes(s.id)
		);

		const newEntries = selectedStudents.map((s) => ({
			id: `tr-${Date.now()}-${s.id}`,
			student_name: s.name,
			from_class: classClassFrom,
			to_class: classClassTo,
			to_year: classSessionTo,
			transfer_type: "Promotion",
			date: "Today",
			created_at: new Date().toISOString(),
		}));

		setHistory((prev) => [...newEntries, ...prev]);
		setShowTransferClassDrawer(false);
		showToast(`Successfully transferred ${selectedStudents.length} students from Class ${classClassFrom} to ${classClassTo}!`);
	};

	// Submit Transfer Single Student
	const handleTransferStudentSubmit = (e) => {
		e.preventDefault();
		if (!selectedSingleStudent) {
			showToast("Please select a student first.");
			return;
		}

		const newEntry = {
			id: `tr-${Date.now()}`,
			student_name: selectedSingleStudent.name,
			from_class: selectedSingleStudent.currentClass,
			to_class: studentClassTo,
			to_year: studentSessionTo,
			transfer_type: studentTransferType,
			date: "Today",
			created_at: new Date().toISOString(),
		};

		setHistory((prev) => [newEntry, ...prev]);
		setShowTransferStudentDrawer(false);
		showToast(`Promoted & transferred ${selectedSingleStudent.name} to Class ${studentClassTo}!`);
	};

	// Matching student search list
	const matchingStudents = useMemo(() => {
		if (!studentSearchInput.trim()) return [];
		const q = studentSearchInput.toLowerCase();
		return ALL_STUDENTS_POOL.filter(
			(s) =>
				s.name.toLowerCase().includes(q) ||
				s.admissionNo.toLowerCase().includes(q) ||
				s.currentClass.toLowerCase().includes(q)
		);
	}, [studentSearchInput]);

	return (
		<div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
			{/* Toast Notification */}
			{toastMsg && (
				<div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5">
					<CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
					<span>{toastMsg}</span>
				</div>
			)}

			<div className="p-4 md:p-6 lg:p-8 max-w-[1700px] mx-auto">
				{/* Figma Design Container: Frame 138 (1166px width container) */}
				<div className="max-w-[1166px] w-full rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
					{/* Header Row with Title & Action Buttons */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
						<h2 className="text-xl font-bold text-slate-900 tracking-tight">Transfer</h2>

						<div className="flex items-center gap-2.5">
							<button
								onClick={() => setShowTransferStudentDrawer(true)}
								className="dashboard-pill rounded-xl px-4 py-2 text-xs font-semibold shadow-2xs cursor-pointer transition-all hover:opacity-90"
							>
								Transfer Student
							</button>
							<button
								onClick={() => setShowTransferClassDrawer(true)}
								className="dashboard-btn-primary rounded-xl px-4 py-2 text-xs font-semibold shadow-xs cursor-pointer transition-all"
							>
								Transfer Class
							</button>
						</div>
					</div>

					{/* History Section & Filter Controls */}
					<div className="mt-5 space-y-4">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<h3 className="text-sm font-bold text-slate-900">History</h3>

							<div className="flex items-center gap-2.5">
								{/* Search Student Input */}
								<div className="relative w-48 sm:w-60">
									<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										placeholder="Search Student"
										className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/15 focus:border-[#ea580c] focus:bg-white transition-all"
									/>
								</div>

								{/* Transfer Type Filter Dropdown */}
								<div className="w-36">
									<CustomSelect
										value={typeFilter}
										onChange={(val) => setTypeFilter(val)}
										options={[
											{ value: "All Type", label: "All Type" },
											{ value: "Promotion", label: "Promotion" },
											{ value: "Section-Change", label: "Section-Change" },
											{ value: "Demotion", label: "Demotion" },
										]}
									/>
								</div>
							</div>
						</div>

						{/* Transfer History Table */}
						<div className="overflow-x-auto">
							<table className="w-full text-left text-xs text-slate-700">
								<thead>
									<tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
										<th className="py-3 px-3 font-semibold text-slate-500">Student Name</th>
										<th className="py-3 px-3 font-semibold text-slate-500">From Class</th>
										<th className="py-3 px-3 font-semibold text-slate-500">To Class</th>
										<th className="py-3 px-3 font-semibold text-slate-500">To Year</th>
										<th className="py-3 px-3 font-semibold text-slate-500">Transfer Type</th>
										<th className="py-3 px-3 font-semibold text-slate-500">Date</th>
										<th className="py-3 px-3 text-right font-semibold text-slate-500">Action</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100/80">
									{filteredHistory.length === 0 ? (
										<tr>
											<td colSpan={7} className="py-12 text-center text-xs text-slate-400">
												No transfer records found matching your filters.
											</td>
										</tr>
									) : (
										filteredHistory.map((item) => {
											const isMenuOpen = openMenuId === item.id;
											return (
												<tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
													{/* Student Name */}
													<td className="py-3.5 px-3 font-semibold text-slate-900">
														{item.student_name}
													</td>

													{/* From Class */}
													<td className="py-3.5 px-3 font-medium text-slate-600">
														{item.from_class}
													</td>

													{/* To Class */}
													<td className="py-3.5 px-3 font-semibold text-slate-800">
														{item.to_class}
													</td>

													{/* To Year */}
													<td className="py-3.5 px-3 font-medium text-slate-600">
														{item.to_year}
													</td>

													{/* Transfer Type Badge */}
													<td className="py-3.5 px-3">
														{item.transfer_type === "Promotion" ? (
															<span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-500/20">
																Promotion
															</span>
														) : item.transfer_type === "Section-Change" ? (
															<span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-600 ring-1 ring-sky-500/20">
																Section-Change
															</span>
														) : (
															<span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 ring-1 ring-amber-500/20">
																Demotion
															</span>
														)}
													</td>

													{/* Date */}
													<td className="py-3.5 px-3 text-slate-500">
														{item.date}
													</td>

													{/* Action Menu */}
													<td className="py-3.5 px-3 text-right relative">
														<div className="inline-block text-left" onClick={(e) => e.stopPropagation()}>
															<button
																type="button"
																onClick={() => setOpenMenuId(isMenuOpen ? null : item.id)}
																className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
															>
																<MoreVertical className="h-3.5 w-3.5" />
															</button>

															{isMenuOpen && (
																<div className="absolute right-3 top-full mt-1 z-30 w-44 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in-0 zoom-in-95">
																	<button
																		type="button"
																		onClick={() => {
																			showToast(`Viewing transfer log for ${item.student_name}`);
																			setOpenMenuId(null);
																		}}
																		className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
																	>
																		<Eye className="h-3.5 w-3.5 text-slate-400" />
																		<span>View Details</span>
																	</button>
																	<button
																		type="button"
																		onClick={() => {
																			setHistory((prev) => prev.filter((h) => h.id !== item.id));
																			showToast(`Reverted transfer record for ${item.student_name}`);
																			setOpenMenuId(null);
																		}}
																		className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
																	>
																		<Trash2 className="h-3.5 w-3.5 text-rose-500" />
																		<span>Remove Record</span>
																	</button>
																</div>
															)}
														</div>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			{/* Slide-over / Modal 1: Transfer Class (Figma Screenshot 2) */}
			{showTransferClassDrawer && (
				<div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in-0">
					<div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
						{/* Drawer Header */}
						<div className="p-6 border-b border-slate-100 flex items-center justify-between">
							<h3 className="text-base font-bold text-slate-900">Transfer Class</h3>
							<button
								type="button"
								onClick={() => setShowTransferClassDrawer(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Drawer Body Form */}
						<form onSubmit={handleTransferClassSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
							{/* Session Selectors */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="font-bold text-slate-700 block mb-1.5">Session From*</label>
									<CustomSelect
										value={classSessionFrom}
										onChange={(val) => setClassSessionFrom(val)}
										options={SESSION_OPTIONS}
									/>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1.5">Session To*</label>
									<CustomSelect
										value={classSessionTo}
										onChange={(val) => setClassSessionTo(val)}
										options={SESSION_OPTIONS}
									/>
								</div>
							</div>

							{/* Class Selectors */}
							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="font-bold text-slate-700 block mb-1.5">Class From*</label>
									<CustomSelect
										value={classClassFrom}
										onChange={(val) => setClassClassFrom(val)}
										options={CLASS_OPTIONS}
									/>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1.5">Class To*</label>
									<CustomSelect
										value={classClassTo}
										onChange={(val) => setClassClassTo(val)}
										options={CLASS_OPTIONS}
									/>
								</div>
							</div>

							{/* Summary Badge Box */}
							<div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 flex items-center gap-3">
								<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c] ring-1 ring-orange-500/10 font-bold">
									<School className="h-5 w-5" />
								</div>
								<div>
									<h4 className="text-xs font-bold text-slate-900">
										Class ({classClassFrom}) ➔ ({classClassTo})
									</h4>
									<p className="text-[11px] text-slate-500 mt-0.5">
										{selectedClassStudentIds.length.toString().padStart(2, "0")} Students selected
									</p>
								</div>
							</div>

							{/* Students Checklist */}
							<div className="space-y-2">
								<div className="flex items-center justify-between pb-2 border-b border-slate-100">
									<span className="font-bold text-slate-700">Student Name</span>
									<button
										type="button"
										onClick={toggleSelectAllStudents}
										className="text-[11px] font-semibold text-[#ea580c] hover:underline cursor-pointer"
									>
										{selectedClassStudentIds.length === CLASS_STUDENTS_LIST.length ? "Deselect All" : "Select All"}
									</button>
								</div>

								<div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1 [scrollbar-width:thin]">
									{CLASS_STUDENTS_LIST.map((stu) => {
										const isChecked = selectedClassStudentIds.includes(stu.id);
										return (
											<div
												key={stu.id}
												onClick={() => toggleStudentSelection(stu.id)}
												className="flex items-center justify-between py-2.5 px-1 hover:bg-slate-50/80 rounded-lg cursor-pointer transition-colors"
											>
												<span className="font-medium text-slate-800 text-xs">{stu.name}</span>
												<input
													type="checkbox"
													checked={isChecked}
													onChange={() => toggleStudentSelection(stu.id)}
													className="dashboard-checkbox h-4 w-4"
												/>
											</div>
										);
									})}
								</div>
							</div>

							{/* Drawer Bottom Actions */}
							<div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setShowTransferClassDrawer(false)}
									className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="dashboard-btn-primary rounded-xl px-5 py-2.5 text-xs font-semibold shadow-xs cursor-pointer transition-all"
								>
									Transfer {selectedClassStudentIds.length} Students
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Slide-over / Modal 2: Transfer Student (Figma Screenshot 3) */}
			{showTransferStudentDrawer && (
				<div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in-0">
					<div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
						{/* Drawer Header */}
						<div className="p-6 border-b border-slate-100 flex items-center justify-between">
							<h3 className="text-base font-bold text-slate-900">Transfer Student</h3>
							<button
								type="button"
								onClick={() => setShowTransferStudentDrawer(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Drawer Body Form */}
						<form onSubmit={handleTransferStudentSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
							{/* Step 1: Select Student */}
							<div>
								<label className="font-bold text-slate-700 block mb-1.5">Select Student</label>

								{/* Student Search Input */}
								<div className="relative mb-3">
									<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
									<input
										type="text"
										value={studentSearchInput}
										onChange={(e) => setStudentSearchInput(e.target.value)}
										placeholder="Search student by name or admission no..."
										className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/15 focus:border-[#ea580c] transition-all"
									/>

									{/* Matching Student Results dropdown */}
									{matchingStudents.length > 0 && (
										<div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-48 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
											{matchingStudents.map((stu) => (
												<div
													key={stu.id}
													onClick={() => {
														setSelectedSingleStudent(stu);
														setStudentSearchInput("");
													}}
													className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer"
												>
													<div>
														<p className="font-bold text-slate-900 text-xs">{stu.name}</p>
														<p className="text-[10px] text-slate-500">
															Adm: {stu.admissionNo} · Class {stu.currentClass}
														</p>
													</div>
													<span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
														Select
													</span>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Selected Student Card */}
								{selectedSingleStudent ? (
									<div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 font-bold text-xs ring-1 ring-orange-500/10">
												{selectedSingleStudent.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</div>
											<div>
												<h4 className="text-xs font-bold text-slate-900">{selectedSingleStudent.name}</h4>
												<p className="text-[11px] text-slate-500 mt-0.5">
													Admission No. {selectedSingleStudent.admissionNo} · Class {selectedSingleStudent.currentClass} · Roll no. {selectedSingleStudent.roll}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-2">
											<span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
												Active
											</span>
											<button
												type="button"
												onClick={() => setSelectedSingleStudent(null)}
												className="rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
												title="Remove"
											>
												<Trash2 className="h-4 w-4" />
											</button>
										</div>
									</div>
								) : (
									<div className="py-4 text-center rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
										No student selected. Search and pick a student above.
									</div>
								)}
							</div>

							{/* Step 2: Destination Configuration */}
							<div className="space-y-4 pt-2 border-t border-slate-100">
								<h4 className="font-bold text-slate-900">Select Destination Class</h4>

								<div>
									<label className="font-bold text-slate-700 block mb-1.5">Session To*</label>
									<CustomSelect
										value={studentSessionTo}
										onChange={(val) => setStudentSessionTo(val)}
										options={SESSION_OPTIONS}
									/>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1.5">Class To*</label>
									<CustomSelect
										value={studentClassTo}
										onChange={(val) => setStudentClassTo(val)}
										options={CLASS_OPTIONS}
									/>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1.5">Transfer Action Type</label>
									<CustomSelect
										value={studentTransferType}
										onChange={(val) => setStudentTransferType(val)}
										options={[
											{ value: "Promotion", label: "Promotion (Next Grade)" },
											{ value: "Section-Change", label: "Section Change (Same Grade)" },
											{ value: "Demotion", label: "Demotion (Repeat Grade)" },
										]}
									/>
								</div>
							</div>

							{/* Drawer Bottom Actions */}
							<div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setShowTransferStudentDrawer(false)}
									className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={!selectedSingleStudent}
									className="dashboard-btn-primary rounded-xl px-5 py-2.5 text-xs font-semibold shadow-xs cursor-pointer transition-all disabled:opacity-50"
								>
									Promote Student
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
