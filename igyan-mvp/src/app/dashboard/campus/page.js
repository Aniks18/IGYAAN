"use client";

import { useState, useEffect, useRef } from "react";
import {
	Clock,
	MapPin,
	Users,
	Plus,
	X,
	ImageIcon,
	ChevronDown,
	Check,
	CheckCircle,
	Sparkles,
	Trash2
} from "lucide-react";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import DatePicker from "../../../components/ui/DatePicker";

// Exact Demo Events matching Figma design
const INITIAL_DEMO_EVENTS = [
	{
		id: "event-1",
		title: "Welcome to the Annual Science Fair 2024",
		description: "Join us for the flagship innovation showcase featuring hands-on robotics, AI experiments, biotechnology models, and interactive exhibits crafted by our bright young innovators.",
		date: "12 January, 2026 | 12:00am",
		startDate: "2026-01-12",
		startTime: "00:00",
		endDate: "2026-01-13",
		endTime: "18:00",
		location: "B/6, New Delhi, India",
		attendees: "2,350 attendees",
		attendeesCount: 2350,
		audience: "All Campus",
		registrationFee: "Free",
		deadlineDate: "2026-01-10",
		deadlineTime: "23:59",
		showAttendees: true,
		image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=85",
	},
	{
		id: "event-2",
		title: "Welcome to the Annual Science Fair 2024",
		description: "An evening of vibrant musical performances, theatrical drama, and folk dances celebrating diverse cultural heritage and artistic expression across all grades.",
		date: "12 January, 2026 | 12:00am",
		startDate: "2026-01-12",
		startTime: "00:00",
		endDate: "2026-01-12",
		endTime: "21:30",
		location: "B/6, New Delhi, India",
		attendees: "2,350 attendees",
		attendeesCount: 2350,
		audience: "All Campus",
		registrationFee: "Free",
		deadlineDate: "2026-01-11",
		deadlineTime: "18:00",
		showAttendees: true,
		image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=85",
	},
	{
		id: "event-3",
		title: "Welcome to the Annual Science Fair 2024",
		description: "Interactive prototyping, coding sprint, and 3D design workshop led by visiting mentors to ignite curiosity and foster creative problem-solving.",
		date: "12 January, 2026 | 12:00am",
		startDate: "2026-01-12",
		startTime: "00:00",
		endDate: "2026-01-14",
		endTime: "17:00",
		location: "B/6, New Delhi, India",
		attendees: "2,350 attendees",
		attendeesCount: 2350,
		audience: "Students Only",
		registrationFee: "₹150",
		deadlineDate: "2026-01-09",
		deadlineTime: "20:00",
		showAttendees: true,
		image: "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=85",
	},
];

export default function CampusPage() {
	const { user } = useAuth();
	const isAdmin = !user?.role || ["super_admin", "co_admin", "admin", "principal"].includes(user?.role);
	const [events, setEvents] = useState(INITIAL_DEMO_EVENTS);

	// Modals & Drawers
	const [showCreateDrawer, setShowCreateDrawer] = useState(false);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);

	// Create Event Form State matching exact Figma layout
	const [formTitle, setFormTitle] = useState("");
	const [formDescription, setFormDescription] = useState("");
	const [formLocation, setFormLocation] = useState("");
	const [formAudience, setFormAudience] = useState("Select");
	const [formStartDate, setFormStartDate] = useState("");
	const [formStartTime, setFormStartTime] = useState("00:00");
	const [formEndDate, setFormEndDate] = useState("");
	const [formEndTime, setFormEndTime] = useState("00:00");
	const [formRegistrationFee, setFormRegistrationFee] = useState("");
	const [formDeadlineDate, setFormDeadlineDate] = useState("");
	const [formDeadlineTime, setFormDeadlineTime] = useState("00:00");
	const [formShowAttendees, setFormShowAttendees] = useState(true);
	const [formImagePreview, setFormImagePreview] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [toastMsg, setToastMsg] = useState("");

	const [audienceDropdownOpen, setAudienceDropdownOpen] = useState(false);
	const audienceRef = useRef(null);
	const fileInputRef = useRef(null);

	// Fetch Events from Supabase or Fallback to demo
	useEffect(() => {
		const fetchEvents = async () => {
			if (!user?.school_id) return;
			try {
				const { data, error } = await supabase
					.from("events")
					.select("*")
					.eq("school_id", user.school_id)
					.order("start_date", { ascending: true });

				if (!error && data && data.length > 0) {
					const mapped = data.map((ev) => ({
						id: ev.id,
						title: ev.title || "Welcome to the Annual Science Fair 2024",
						description: ev.description || "",
						date: ev.start_date
							? `${new Date(ev.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} | 12:00am`
							: "12 January, 2026 | 12:00am",
						startDate: ev.start_date,
						startTime: "00:00",
						endDate: ev.end_date || ev.start_date,
						endTime: "00:00",
						location: ev.location || "B/6, New Delhi, India",
						attendees: `${ev.max_participants || "2,350"} attendees`,
						attendeesCount: ev.max_participants || 2350,
						audience: ev.is_public ? "All Campus" : "Students Only",
						registrationFee: "Free",
						showAttendees: true,
						image: ev.banner_image || INITIAL_DEMO_EVENTS[0].image,
					}));
					setEvents(mapped);
				}
			} catch (err) {
				console.error("Error fetching campus events:", err);
			}
		};

		fetchEvents();
	}, [user?.school_id]);

	// Close dropdown when clicked outside
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (audienceRef.current && !audienceRef.current.contains(e.target)) {
				setAudienceDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Lock body scroll when drawer/modal is open
	useEffect(() => {
		if (showCreateDrawer || showDetailsModal) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [showCreateDrawer, showDetailsModal]);

	const showToast = (msg) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(""), 3500);
	};

	// Handle Image Upload
	const handleImageChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.size > 2 * 1024 * 1024) {
				showToast("Image size must be less than 2MB");
				return;
			}
			const reader = new FileReader();
			reader.onloadend = () => {
				setFormImagePreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	// Reset Form
	const resetForm = () => {
		setFormTitle("");
		setFormDescription("");
		setFormLocation("");
		setFormAudience("Select");
		setFormStartDate("");
		setFormStartTime("00:00");
		setFormEndDate("");
		setFormEndTime("00:00");
		setFormRegistrationFee("");
		setFormDeadlineDate("");
		setFormDeadlineTime("00:00");
		setFormShowAttendees(true);
		setFormImagePreview(null);
	};

	// Handle Create Event Submit
	const handlePublishEvent = async (e) => {
		e.preventDefault();
		if (!formTitle.trim()) {
			showToast("Please enter an event title.");
			return;
		}

		setIsSubmitting(true);
		try {
			const formattedDate = formStartDate
				? `${new Date(formStartDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} | ${formStartTime || "12:00am"}`
				: "12 January, 2026 | 12:00am";

			const newEventObj = {
				id: `event-${Date.now()}`,
				title: formTitle.trim(),
				description: formDescription || "Campus celebration and student engagement event.",
				date: formattedDate,
				startDate: formStartDate || new Date().toISOString().split("T")[0],
				startTime: formStartTime || "00:00",
				endDate: formEndDate || formStartDate,
				endTime: formEndTime || "00:00",
				location: formLocation.trim() || "B/6, New Delhi, India",
				attendees: "0 attendees",
				attendeesCount: 0,
				audience: formAudience === "Select" ? "All Campus" : formAudience,
				registrationFee: formRegistrationFee || "Free",
				deadlineDate: formDeadlineDate,
				deadlineTime: formDeadlineTime,
				showAttendees: formShowAttendees,
				image: formImagePreview || INITIAL_DEMO_EVENTS[0].image,
			};

			if (user?.school_id) {
				await supabase.from("events").insert([
					{
						school_id: user.school_id,
						title: newEventObj.title,
						description: newEventObj.description,
						event_type: "academic",
						start_date: newEventObj.startDate,
						end_date: newEventObj.endDate,
						location: newEventObj.location,
						max_participants: 2350,
						registration_deadline: formDeadlineDate || newEventObj.startDate,
						is_public: formAudience === "All Campus",
						banner_image: formImagePreview || null,
					},
				]);
			}

			setEvents((prev) => [newEventObj, ...prev]);
			setShowCreateDrawer(false);
			resetForm();
			showToast("Event published successfully!");
		} catch (err) {
			console.error("Error publishing event:", err);
			showToast("Failed to publish event.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#F5F5F7] p-4 sm:p-6 lg:p-8 font-sans antialiased text-[#1F2937]">
			{/* Toast Notification */}
			{toastMsg && (
				<div className="fixed top-6 right-6 z-[100] flex items-center gap-2.5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all animate-in fade-in slide-in-from-top-4">
					<CheckCircle className="h-4 w-4 text-emerald-400" />
					<span>{toastMsg}</span>
				</div>
			)}

			{/* Main Content Container matching exact Figma Card Frame */}
			<div className="mx-auto max-w-7xl rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8 shadow-xs">
				{/* Top Header Bar */}
				<div className="mb-8 flex items-center justify-between">
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
						Upcoming Events
					</h1>

					{/* Create New Event Button matching exact terracotta orange #D95A2B */}
					<button
						type="button"
						onClick={() => {
							resetForm();
							setShowCreateDrawer(true);
						}}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D95A2B] hover:bg-[#C24E22] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all active:scale-[0.98]"
					>
						<Plus className="h-4 w-4 stroke-[2.5]" />
						<span>Create New Event</span>
					</button>
				</div>

				{/* Events Grid matching exact 3-column layout */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{events.map((event) => (
						<div
							key={event.id}
							className="group flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300"
						>
							{/* Event Cover Image with rounded corners inside card */}
							<div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-slate-100">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={event.image}
									alt={event.title}
									className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
								/>
							</div>

							{/* Card Body Content */}
							<div className="flex flex-1 flex-col">
								<h2 className="mb-3.5 text-sm font-bold leading-snug text-[#111827] line-clamp-2">
									{event.title}
								</h2>

								{/* Metadata list */}
								<div className="mb-5 space-y-2 text-xs text-[#6B7280]">
									<div className="flex items-center gap-2">
										<Clock className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
										<span>{event.date}</span>
									</div>
									<div className="flex items-center gap-2">
										<MapPin className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
										<span className="truncate">{event.location}</span>
									</div>
									<div className="flex items-center gap-2">
										<Users className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
										<span>{event.attendees}</span>
									</div>
								</div>

								{/* View Details Link at Bottom */}
								<div className="mt-auto border-t border-[#F3F4F6] pt-3.5 flex items-center justify-between">
									<button
										type="button"
										onClick={() => {
											setSelectedEvent(event);
											setShowDetailsModal(true);
										}}
										className="text-xs font-semibold text-[#D95A2B] transition-colors hover:text-[#C24E22] hover:underline"
									>
										View Details
									</button>

									{isAdmin && (
										<button
											type="button"
											onClick={() => {
												if (confirm(`Remove event "${event.title}"?`)) {
													setEvents((prev) => prev.filter((e) => e.id !== event.id));
													showToast("Event removed.");
												}
											}}
											className="rounded-lg p-1 text-slate-300 hover:text-red-500 transition-colors"
											title="Delete"
										>
											<Trash2 className="h-3.5 w-3.5" />
										</button>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* ══════════════════════════════════════════════════════════════ */}
			{/*  CREATE EVENT DRAWER - EXACT FIGMA MATCH & PERFECT FIT       */}
			{/* ══════════════════════════════════════════════════════════════ */}
			{showCreateDrawer && (
				<div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in">
					<div
						className="absolute inset-0"
						onClick={() => setShowCreateDrawer(false)}
					/>

					<div className="relative z-10 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-250">
						{/* Drawer Sticky Header */}
						<div className="shrink-0 flex items-center justify-between border-b border-slate-100 px-6 sm:px-8 py-5">
							<h2 className="text-xl font-bold tracking-tight text-[#111827]">
								Create Event
							</h2>
							<button
								type="button"
								onClick={() => setShowCreateDrawer(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Form Scrollable Body */}
						<form
							id="create-event-form"
							onSubmit={handlePublishEvent}
							className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-4 text-xs"
						>
							{/* Upload Photo Box with exact dashed styling */}
							<div
								onClick={() => fileInputRef.current?.click()}
								className="group relative flex h-36 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-[#FAFAFA] p-4 text-center transition-all hover:border-[#D95A2B]/60 hover:bg-[#FFF8F5]"
							>
								{formImagePreview ? (
									<div className="relative h-full w-full overflow-hidden rounded-xl">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={formImagePreview}
											alt="Preview"
											className="h-full w-full object-cover"
										/>
										<div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
											<span className="text-xs font-semibold">Change Photo</span>
										</div>
									</div>
								) : (
									<div className="flex flex-col items-center justify-center">
										<div className="mb-2 grid h-12 w-12 place-items-center rounded-xl bg-[#E5E7EB] text-[#9CA3AF]">
											<ImageIcon className="h-6 w-6" />
										</div>
										<p className="font-semibold text-[#374151]">Upload Photo</p>
										<p className="text-[11px] text-[#9CA3AF] mt-0.5">
											JPG, PNG (Max 2MB)
										</p>
									</div>
								)}
								<input
									ref={fileInputRef}
									type="file"
									accept="image/png, image/jpeg, image/jpg"
									onChange={handleImageChange}
									className="hidden"
								/>
							</div>

							{/* Event Name */}
							<div>
								<label className="mb-1.5 block font-semibold text-[#374151]">
									Event Name<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									value={formTitle}
									onChange={(e) => setFormTitle(e.target.value)}
									placeholder="Title"
									className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-xs text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#D95A2B] focus:outline-none focus:ring-1 focus:ring-[#D95A2B]"
								/>
							</div>

							{/* Description */}
							<div>
								<label className="mb-1.5 block font-semibold text-[#374151]">
									Description<span className="text-red-500">*</span>
								</label>
								<textarea
									required
									rows={3}
									value={formDescription}
									onChange={(e) => setFormDescription(e.target.value)}
									placeholder="Description"
									className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-xs text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#D95A2B] focus:outline-none focus:ring-1 focus:ring-[#D95A2B] resize-none"
								/>
							</div>

							{/* Location */}
							<div>
								<label className="mb-1.5 block font-semibold text-[#374151]">
									Location<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									value={formLocation}
									onChange={(e) => setFormLocation(e.target.value)}
									placeholder="Title"
									className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-xs text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#D95A2B] focus:outline-none focus:ring-1 focus:ring-[#D95A2B]"
								/>
							</div>

							{/* Audience Dropdown */}
							<div className="relative" ref={audienceRef}>
								<label className="mb-1.5 block font-semibold text-[#374151]">
									Audience<span className="text-red-500">*</span>
								</label>
								<button
									type="button"
									onClick={() => setAudienceDropdownOpen((prev) => !prev)}
									className="flex w-full items-center justify-between rounded-xl border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-xs text-left text-[#1F2937] focus:border-[#D95A2B] focus:outline-none focus:ring-1 focus:ring-[#D95A2B]"
								>
									<span className={formAudience === "Select" ? "text-[#9CA3AF]" : "text-[#1F2937] font-medium"}>
										{formAudience}
									</span>
									<ChevronDown className={`h-4 w-4 text-[#9CA3AF] transition-transform ${audienceDropdownOpen ? "rotate-180" : ""}`} />
								</button>
								{audienceDropdownOpen && (
									<div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl">
										{["All Campus", "Students Only", "Faculty & Staff", "Parents & Guardians"].map((opt) => (
											<button
												key={opt}
												type="button"
												onClick={() => {
													setFormAudience(opt);
													setAudienceDropdownOpen(false);
												}}
												className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs ${
													formAudience === opt ? "bg-[#FFF8F5] font-semibold text-[#D95A2B]" : "text-slate-700 hover:bg-slate-50"
												}`}
											>
												<span>{opt}</span>
												{formAudience === opt && <Check className="h-3.5 w-3.5 text-[#D95A2B]" />}
											</button>
										))}
									</div>
								)}
							</div>

							{/* Start Date & Start Time */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1.5 block font-semibold text-[#374151]">
										Start Date<span className="text-red-500">*</span>
									</label>
									<DatePicker
										required
										value={formStartDate}
										onChange={(val) => setFormStartDate(val)}
										placeholder="dd/mm/yyyy"
									/>
								</div>
								<div>
									<label className="mb-1.5 block font-semibold text-[#374151]">
										Start Time<span className="text-red-500">*</span>
									</label>
									<input
										type="time"
										required
										value={formStartTime}
										onChange={(e) => setFormStartTime(e.target.value)}
										className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2.5 text-xs text-[#1F2937] focus:border-[#D95A2B] focus:outline-none focus:ring-1 focus:ring-[#D95A2B]"
									/>
								</div>
							</div>

							{/* End Date & End Time */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1.5 block font-semibold text-[#374151]">
										End Date<span className="text-red-500">*</span>
									</label>
									<DatePicker
										required
										value={formEndDate}
										onChange={(val) => setFormEndDate(val)}
										placeholder="dd/mm/yyyy"
									/>
								</div>
								<div>
									<label className="mb-1.5 block font-semibold text-[#374151]">
										End Time<span className="text-red-500">*</span>
									</label>
									<input
										type="time"
										required
										value={formEndTime}
										onChange={(e) => setFormEndTime(e.target.value)}
										className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2.5 text-xs text-[#1F2937] focus:border-[#D95A2B] focus:outline-none focus:ring-1 focus:ring-[#D95A2B]"
									/>
								</div>
							</div>

							{/* Registration Fee */}
							<div>
								<label className="mb-1.5 block font-semibold text-[#374151]">
									Registration Fee
								</label>
								<input
									type="text"
									value={formRegistrationFee}
									onChange={(e) => setFormRegistrationFee(e.target.value)}
									placeholder="Fee"
									className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-xs text-[#1F2937] placeholder:text-[#9CA3AF] focus:border-[#D95A2B] focus:outline-none focus:ring-1 focus:ring-[#D95A2B]"
								/>
							</div>

							{/* Deadline Date & Deadline Time */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1.5 block font-semibold text-[#374151]">
										Deadline Date
									</label>
									<DatePicker
										value={formDeadlineDate}
										onChange={(val) => setFormDeadlineDate(val)}
										placeholder="dd/mm/yyyy"
									/>
								</div>
								<div>
									<label className="mb-1.5 block font-semibold text-[#374151]">
										Deadline Time
									</label>
									<input
										type="time"
										value={formDeadlineTime}
										onChange={(e) => setFormDeadlineTime(e.target.value)}
										className="w-full rounded-xl border border-[#D1D5DB] bg-white px-3 py-2.5 text-xs text-[#1F2937] focus:border-[#D95A2B] focus:outline-none focus:ring-1 focus:ring-[#D95A2B]"
									/>
								</div>
							</div>

							{/* Show attendees Checkbox */}
							<div className="pt-1">
								<label className="flex items-center gap-2.5 cursor-pointer select-none">
									<input
										type="checkbox"
										checked={formShowAttendees}
										onChange={(e) => setFormShowAttendees(e.target.checked)}
										className="dashboard-checkbox h-4 w-4"
									/>
									<span className="text-xs font-medium text-[#374151]">Show attendees</span>
								</label>
							</div>
						</form>

						{/* Sticky Footer: Cancel & Publish Event buttons always visible */}
						<div className="shrink-0 flex items-center gap-3 border-t border-slate-100 px-6 sm:px-8 py-4 bg-white">
							<button
								type="button"
								onClick={() => setShowCreateDrawer(false)}
								className="flex-1 rounded-xl border border-[#D1D5DB] bg-white py-2.5 text-xs font-semibold text-[#374151] hover:bg-slate-50 transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								form="create-event-form"
								disabled={isSubmitting}
								className="flex-1 rounded-xl bg-[#D95A2B] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#C24E22] transition-colors disabled:opacity-60"
							>
								{isSubmitting ? "Publishing..." : "Publish Event"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ══════════════════════════════════════════════════════════════ */}
			{/*  EVENT DETAILS MODAL                                         */}
			{/* ══════════════════════════════════════════════════════════════ */}
			{showDetailsModal && selectedEvent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity">
					<div
						className="absolute inset-0"
						onClick={() => setShowDetailsModal(false)}
					/>

					<div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
						<button
							type="button"
							onClick={() => setShowDetailsModal(false)}
							className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
						>
							<X className="h-5 w-5" />
						</button>

						<div className="relative mb-4 h-48 w-full overflow-hidden rounded-xl bg-slate-100">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src={selectedEvent.image}
								alt={selectedEvent.title}
								className="h-full w-full object-cover"
							/>
						</div>

						<h2 className="text-base font-bold text-[#111827] mb-2">
							{selectedEvent.title}
						</h2>

						<p className="text-xs text-[#4B5563] leading-relaxed mb-4">
							{selectedEvent.description}
						</p>

						<div className="space-y-2.5 rounded-xl bg-[#F9FAFB] p-3.5 text-xs text-[#4B5563] mb-5 border border-[#E5E7EB]">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-[#D95A2B]" />
								<span><strong>Schedule:</strong> {selectedEvent.date}</span>
							</div>
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-[#D95A2B]" />
								<span><strong>Location:</strong> {selectedEvent.location}</span>
							</div>
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-[#D95A2B]" />
								<span><strong>Audience:</strong> {selectedEvent.audience} ({selectedEvent.attendees})</span>
							</div>
							<div className="flex items-center gap-2">
								<Sparkles className="h-4 w-4 text-[#D95A2B]" />
								<span><strong>Registration Fee:</strong> {selectedEvent.registrationFee || "Free"}</span>
							</div>
						</div>

						<div className="flex items-center justify-end gap-3">
							<button
								type="button"
								onClick={() => setShowDetailsModal(false)}
								className="rounded-xl border border-[#D1D5DB] px-4 py-2 text-xs font-semibold text-[#374151] hover:bg-slate-50 transition-colors"
							>
								Close
							</button>
							{!isAdmin && (
								<button
									type="button"
									onClick={() => {
										showToast(`Registered for ${selectedEvent.title}!`);
										setShowDetailsModal(false);
									}}
									className="rounded-xl bg-[#D95A2B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C24E22] transition-colors"
								>
									Register Now
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
