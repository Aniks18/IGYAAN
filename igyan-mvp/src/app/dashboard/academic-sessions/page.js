"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import DatePicker from "../../../components/ui/DatePicker";
import {
	Search,
	Plus,
	MoreVertical,
	CheckCircle,
	Calendar,
	Clock,
	Check,
	X,
	Edit3,
	Trash2,
	Eye,
	Power,
	School,
	AlertCircle,
	ArrowRight,
	CalendarDays,
	Sparkles,
} from "lucide-react";

// Default Initial Sessions matching Figma Screenshot exactly
const INITIAL_DEMO_SESSIONS = [
	{
		id: "sess-1",
		session_name: "LTV023549",
		start_date: "2026-03-31",
		end_date: "01-04-2027",
		is_active: true,
		academic_year: "2026-2027",
		description: "Current active academic session for all classes (Pre-Primary to 12th)",
		created_at: "2026-03-15",
	},
	{
		id: "sess-2",
		session_name: "LTV023850",
		start_date: "2026-03-31",
		end_date: "01-04-2027",
		is_active: false,
		academic_year: "2026-2027",
		description: "Secondary Term & Foundation batch session",
		created_at: "2026-03-16",
	},
	{
		id: "sess-3",
		session_name: "LTV023848",
		start_date: "2026-03-31",
		end_date: "01-04-2027",
		is_active: false,
		academic_year: "2026-2027",
		description: "Mid-Term evaluation & preparatory session",
		created_at: "2026-03-18",
	},
	{
		id: "sess-4",
		session_name: "LTV023851",
		start_date: "2026-03-31",
		end_date: "01-04-2027",
		is_active: false,
		academic_year: "2026-2027",
		description: "Summer innovation and skill accelerator program",
		created_at: "2026-03-20",
	},
	{
		id: "sess-5",
		session_name: "LTV023857",
		start_date: "31-03-2026",
		end_date: "01-04-2027",
		is_active: false,
		academic_year: "2026-2027",
		description: "Annual academic session archives",
		created_at: "2026-03-22",
	},
];

export default function AcademicSessionsPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();

	const [sessions, setSessions] = useState(INITIAL_DEMO_SESSIONS);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive

	// Modals
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [selectedSession, setSelectedSession] = useState(null);
	const [openActionMenuId, setOpenActionMenuId] = useState(null);

	// Forms
	const [formName, setFormName] = useState("");
	const [formStartDate, setFormStartDate] = useState("");
	const [formEndDate, setFormEndDate] = useState("");
	const [formIsActive, setFormIsActive] = useState(false);
	const [formDesc, setFormDesc] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Toast
	const [toastMsg, setToastMsg] = useState("");

	const showToast = (msg) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(""), 3500);
	};

	// Auth & Role protection
	useEffect(() => {
		if (!authLoading && !user) {
			router.push("/login");
		}
	}, [user, authLoading, router]);

	// Fetch from Supabase
	const fetchSessions = async () => {
		setLoading(true);
		try {
			if (user?.school_id) {
				const { data, error } = await supabase
					.from("academic_sessions")
					.select("*")
					.eq("school_id", user.school_id)
					.order("is_active", { ascending: false });

				if (error) {
					console.warn("Supabase sessions fetch fallback:", error.message);
					setSessions(INITIAL_DEMO_SESSIONS);
				} else if (data && data.length > 0) {
					setSessions(data);
				} else {
					setSessions(INITIAL_DEMO_SESSIONS);
				}
			} else {
				setSessions(INITIAL_DEMO_SESSIONS);
			}
		} catch (err) {
			console.error("Error loading sessions:", err);
			setSessions(INITIAL_DEMO_SESSIONS);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			fetchSessions();
		}
	}, [user?.school_id]);

	// Close action menus when clicking outside
	useEffect(() => {
		const handleDocClick = () => setOpenActionMenuId(null);
		document.addEventListener("click", handleDocClick);
		return () => document.removeEventListener("click", handleDocClick);
	}, []);

	// Filtered Sessions
	const filteredSessions = useMemo(() => {
		return sessions.filter((s) => {
			const matchesSearch =
				s.session_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.start_date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.end_date?.toLowerCase().includes(searchQuery.toLowerCase());

			if (!matchesSearch) return false;
			if (statusFilter === "active") return s.is_active;
			if (statusFilter === "inactive") return !s.is_active;
			return true;
		});
	}, [sessions, searchQuery, statusFilter]);

	// Set Active Session
	const handleSetActive = async (id, name) => {
		try {
			if (user?.school_id) {
				await supabase.from("academic_sessions").update({ is_active: false }).eq("school_id", user.school_id);
				await supabase.from("academic_sessions").update({ is_active: true }).eq("id", id);
			}
			setSessions((prev) =>
				prev.map((s) => ({
					...s,
					is_active: s.id === id,
				}))
			);
			showToast(`Session ${name} is now set as Active!`);
		} catch (err) {
			console.error("Set active error:", err);
			showToast("Failed to update active session");
		}
	};

	// Create New Session
	const handleCreateSession = async (e) => {
		e.preventDefault();
		if (!formName.trim() || !formStartDate || !formEndDate) {
			showToast("Please fill in all required fields.");
			return;
		}

		setIsSubmitting(true);
		try {
			const newSessionObj = {
				id: `sess-${Date.now()}`,
				session_name: formName.trim().toUpperCase(),
				start_date: formStartDate,
				end_date: formEndDate,
				is_active: formIsActive || sessions.length === 0,
				description: formDesc || "Standard Academic Session",
				created_at: new Date().toISOString().split("T")[0],
			};

			if (user?.school_id) {
				if (formIsActive) {
					await supabase.from("academic_sessions").update({ is_active: false }).eq("school_id", user.school_id);
				}
				const { error } = await supabase.from("academic_sessions").insert([
					{
						school_id: user.school_id,
						session_name: newSessionObj.session_name,
						start_date: newSessionObj.start_date,
						end_date: newSessionObj.end_date,
						is_active: newSessionObj.is_active,
					},
				]);
				if (error) console.warn("Supabase insert notice:", error.message);
			}

			setSessions((prev) => {
				const updated = formIsActive ? prev.map((s) => ({ ...s, is_active: false })) : [...prev];
				return [newSessionObj, ...updated];
			});

			setShowAddModal(false);
			setFormName("");
			setFormStartDate("");
			setFormEndDate("");
			setFormIsActive(false);
			setFormDesc("");
			showToast(`Academic Session ${newSessionObj.session_name} created successfully!`);
		} catch (err) {
			console.error("Create session error:", err);
			showToast("Failed to create academic session.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Edit Session
	const openEditModal = (session) => {
		setSelectedSession(session);
		setFormName(session.session_name);
		setFormStartDate(session.start_date);
		setFormEndDate(session.end_date);
		setFormIsActive(session.is_active);
		setFormDesc(session.description || "");
		setShowEditModal(true);
		setOpenActionMenuId(null);
	};

	const handleUpdateSession = async (e) => {
		e.preventDefault();
		if (!selectedSession) return;

		setIsSubmitting(true);
		try {
			if (user?.school_id) {
				if (formIsActive && !selectedSession.is_active) {
					await supabase.from("academic_sessions").update({ is_active: false }).eq("school_id", user.school_id);
				}
				await supabase
					.from("academic_sessions")
					.update({
						session_name: formName,
						start_date: formStartDate,
						end_date: formEndDate,
						is_active: formIsActive,
					})
					.eq("id", selectedSession.id);
			}

			setSessions((prev) =>
				prev.map((s) => {
					if (s.id === selectedSession.id) {
						return {
							...s,
							session_name: formName,
							start_date: formStartDate,
							end_date: formEndDate,
							is_active: formIsActive,
							description: formDesc,
						};
					}
					if (formIsActive) {
						return { ...s, is_active: false };
					}
					return s;
				})
			);

			setShowEditModal(false);
			showToast(`Academic Session ${formName} updated!`);
		} catch (err) {
			console.error("Update error:", err);
			showToast("Failed to update session");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Delete Session
	const handleDeleteSession = async (id, name) => {
		if (!confirm(`Are you sure you want to delete session ${name}?`)) return;
		try {
			if (user?.school_id) {
				await supabase.from("academic_sessions").delete().eq("id", id);
			}
			setSessions((prev) => prev.filter((s) => s.id !== id));
			setOpenActionMenuId(null);
			showToast(`Session ${name} deleted.`);
		} catch (err) {
			console.error("Delete error:", err);
			showToast("Failed to delete session");
		}
	};

	if (authLoading) {
		return (
			<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ea580c] border-r-transparent" />
					<p className="mt-3 text-xs font-semibold text-slate-500">Loading Academic Sessions...</p>
				</div>
			</div>
		);
	}

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
					{/* Inner Header Row */}
					<div className="flex items-center justify-between pb-5 border-b border-slate-100">
						<div className="flex items-center gap-3">
							<h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Sessions</h2>
							<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
								{filteredSessions.length} total
							</span>
						</div>

						<button
							onClick={() => {
								setFormName(`LTV02${Math.floor(3850 + Math.random() * 50)}`);
								setFormStartDate("2026-04-01");
								setFormEndDate("2027-03-31");
								setFormIsActive(false);
								setFormDesc("");
								setShowAddModal(true);
							}}
							className="inline-flex items-center gap-1.5 rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] transition-all shadow-xs cursor-pointer"
						>
							<Plus className="h-3.5 w-3.5" />
							<span>+ New Academic Session</span>
						</button>
					</div>

					{/* Academic Sessions Table (matching Figma columns) */}
					<div className="overflow-x-auto mt-2">
						<table className="w-full text-left text-xs text-slate-700">
							<thead>
								<tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
									<th className="py-3.5 px-3 font-semibold text-slate-500">Session Name</th>
									<th className="py-3.5 px-3 font-semibold text-slate-500">Start Date</th>
									<th className="py-3.5 px-3 font-semibold text-slate-500">End Date</th>
									<th className="py-3.5 px-3 font-semibold text-slate-500">Status</th>
									<th className="py-3.5 px-3 text-right font-semibold text-slate-500">Action</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-slate-100/80">
								{filteredSessions.length === 0 ? (
									<tr>
										<td colSpan={5} className="py-12 text-center text-xs text-slate-400">
											<Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
											No academic sessions found matching your criteria.
										</td>
									</tr>
								) : (
									filteredSessions.map((s) => {
										const isMenuOpen = openActionMenuId === s.id;
										return (
											<tr
												key={s.id}
												className="hover:bg-slate-50/70 transition-colors group"
											>
												{/* Session Name */}
												<td className="py-4 px-3 font-semibold text-slate-900">
													<div className="flex items-center gap-2">
														<span className="font-semibold text-slate-900">{s.session_name}</span>
														{s.is_active && (
															<span className="flex h-2 w-2 rounded-full bg-emerald-500" />
														)}
													</div>
												</td>

												{/* Start Date */}
												<td className="py-4 px-3 font-medium text-slate-600">
													{s.start_date}
												</td>

												{/* End Date */}
												<td className="py-4 px-3 font-medium text-slate-600">
													{s.end_date}
												</td>

												{/* Status Pill matching Figma design */}
												<td className="py-4 px-3">
													{s.is_active ? (
														<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-500/20">
															Active
														</span>
													) : (
														<span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-3 py-1 text-[11px] font-semibold text-[#EA580C] ring-1 ring-[#EA580C]/20">
															Inactive
														</span>
													)}
												</td>

												{/* Action Menu Button */}
												<td className="py-4 px-3 text-right relative">
													<div className="inline-block text-left" onClick={(e) => e.stopPropagation()}>
														<button
															type="button"
															onClick={() => setOpenActionMenuId(isMenuOpen ? null : s.id)}
															className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
														>
															<MoreVertical className="h-4 w-4" />
														</button>

														{/* Action Popover Menu */}
														{isMenuOpen && (
															<div className="absolute right-3 top-full mt-1 z-30 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in-0 zoom-in-95">
																{!s.is_active && (
																	<button
																		type="button"
																		onClick={() => {
																			handleSetActive(s.id, s.session_name);
																			setOpenActionMenuId(null);
																		}}
																		className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
																	>
																		<Check className="h-3.5 w-3.5" />
																		<span>Set as Active Session</span>
																	</button>
																)}

																<button
																	type="button"
																	onClick={() => openEditModal(s)}
																	className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
																>
																	<Edit3 className="h-3.5 w-3.5 text-slate-400" />
																	<span>Edit Session</span>
																</button>

																<button
																	type="button"
																	onClick={() => {
																		setSelectedSession(s);
																		setShowDetailsModal(true);
																		setOpenActionMenuId(null);
																	}}
																	className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
																>
																	<Eye className="h-3.5 w-3.5 text-slate-400" />
																	<span>View Details</span>
																</button>

																<button
																	type="button"
																	onClick={() => handleDeleteSession(s.id, s.session_name)}
																	className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
																>
																	<Trash2 className="h-3.5 w-3.5 text-rose-500" />
																	<span>Delete Session</span>
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

			{/* Modal 1: + New Academic Session */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<div className="flex items-center gap-2">
								<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-[#ea580c] ring-1 ring-orange-500/10">
									<CalendarDays className="h-4 w-4" />
								</div>
								<h3 className="text-base font-bold text-slate-900">New Academic Session</h3>
							</div>
							<button
								type="button"
								onClick={() => setShowAddModal(false)}
								className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleCreateSession} className="mt-4 space-y-4 text-xs">
							<div>
								<label className="font-bold text-slate-700 block mb-1">Session Code / Name *</label>
								<input
									type="text"
									required
									value={formName}
									onChange={(e) => setFormName(e.target.value.toUpperCase())}
									placeholder="e.g. LTV023858"
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10 transition-all"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="font-bold text-slate-700 block mb-1">Start Date *</label>
									<DatePicker
										required
										value={formStartDate}
										onChange={(val) => setFormStartDate(val)}
										placeholder="dd/mm/yyyy"
									/>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1">End Date *</label>
									<DatePicker
										required
										value={formEndDate}
										onChange={(val) => setFormEndDate(val)}
										placeholder="dd/mm/yyyy"
									/>
								</div>
							</div>

							<div>
								<label className="font-bold text-slate-700 block mb-1">Session Description</label>
								<input
									type="text"
									value={formDesc}
									onChange={(e) => setFormDesc(e.target.value)}
									placeholder="e.g. Academic Year 2026-27"
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
								/>
							</div>

							<div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
								<input
									type="checkbox"
									id="isActiveToggle"
									checked={formIsActive}
									onChange={(e) => setFormIsActive(e.target.checked)}
									className="h-4 w-4 rounded-md border-slate-300 text-[#ea580c] focus:ring-[#ea580c]"
								/>
								<label htmlFor="isActiveToggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
									Set as Current Active Session
									<span className="block text-[10px] font-normal text-slate-500">
										Classes and timetable will default to this session
									</span>
								</label>
							</div>

							<div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] shadow-xs cursor-pointer disabled:opacity-50"
								>
									{isSubmitting ? "Creating..." : "Create Session"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal 2: Edit Academic Session */}
			{showEditModal && selectedSession && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<h3 className="text-base font-bold text-slate-900">Edit Session: {selectedSession.session_name}</h3>
							<button
								type="button"
								onClick={() => setShowEditModal(false)}
								className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleUpdateSession} className="mt-4 space-y-4 text-xs">
							<div>
								<label className="font-bold text-slate-700 block mb-1">Session Code / Name *</label>
								<input
									type="text"
									required
									value={formName}
									onChange={(e) => setFormName(e.target.value.toUpperCase())}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="font-bold text-slate-700 block mb-1">Start Date *</label>
									<DatePicker
										required
										value={formStartDate}
										onChange={(val) => setFormStartDate(val)}
										placeholder="dd/mm/yyyy"
									/>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1">End Date *</label>
									<DatePicker
										required
										value={formEndDate}
										onChange={(val) => setFormEndDate(val)}
										placeholder="dd/mm/yyyy"
									/>
								</div>
							</div>

							<div>
								<label className="font-bold text-slate-700 block mb-1">Session Description</label>
								<input
									type="text"
									value={formDesc}
									onChange={(e) => setFormDesc(e.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
								/>
							</div>

							<div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
								<input
									type="checkbox"
									id="editIsActiveToggle"
									checked={formIsActive}
									onChange={(e) => setFormIsActive(e.target.checked)}
									className="h-4 w-4 rounded-md border-slate-300 text-[#ea580c] focus:ring-[#ea580c]"
								/>
								<label htmlFor="editIsActiveToggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
									Mark as Active Session
								</label>
							</div>

							<div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setShowEditModal(false)}
									className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] shadow-xs cursor-pointer disabled:opacity-50"
								>
									{isSubmitting ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal 3: View Session Details */}
			{showDetailsModal && selectedSession && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<h3 className="text-base font-bold text-slate-900">Session Overview: {selectedSession.session_name}</h3>
							<button
								type="button"
								onClick={() => setShowDetailsModal(false)}
								className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="mt-4 space-y-3 text-xs">
							<div className="flex items-center justify-between py-2 border-b border-slate-100">
								<span className="text-slate-500 font-medium">Status</span>
								{selectedSession.is_active ? (
									<span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700">Active</span>
								) : (
									<span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700">Inactive</span>
								)}
							</div>
							<div className="flex items-center justify-between py-2 border-b border-slate-100">
								<span className="text-slate-500 font-medium">Start Date</span>
								<span className="font-semibold text-slate-800">{selectedSession.start_date}</span>
							</div>
							<div className="flex items-center justify-between py-2 border-b border-slate-100">
								<span className="text-slate-500 font-medium">End Date</span>
								<span className="font-semibold text-slate-800">{selectedSession.end_date}</span>
							</div>
							<div className="flex items-center justify-between py-2 border-b border-slate-100">
								<span className="text-slate-500 font-medium">Description</span>
								<span className="font-semibold text-slate-800">{selectedSession.description || "N/A"}</span>
							</div>
						</div>

						<div className="mt-6 flex justify-end">
							<button
								type="button"
								onClick={() => setShowDetailsModal(false)}
								className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e08]"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
