"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import * as XLSX from "xlsx";
import {
	Search,
	Plus,
	ChevronDown,
	MoreVertical,
	Users,
	Bot,
	TrendingUp,
	AlertTriangle,
	Eye,
	Trash2,
	X,
	Check,
	CheckCircle,
	Download,
	Calendar as CalendarIcon,
	CalendarDays,
	Clock,
	MapPin,
	Globe,
	Sparkles,
	Filter,
	LayoutGrid,
	List,
	Edit2,
	Share2,
	Award,
	UserPlus,
	Info,
	CheckSquare,
	UserCheck,
	Tag,
	Flame,
	Building,
} from "lucide-react";

// Curated high-quality demo events matching Litera Valley school activities
const DEMO_EVENTS = [
	{
		id: "demo-evt-1",
		title: "Litera Annual Science & Tech Expo 2026",
		description:
			"A showcase of student innovations in Robotics, AI, Renewable Energy, and Environmental Science featuring live working models and project pitches.",
		event_type: "academic",
		category_label: "Science & Tech",
		start_date: "2026-10-15T09:30:00Z",
		end_date: "2026-10-15T16:30:00Z",
		location: "Main Auditorium & Innovation Lab",
		max_participants: 250,
		registered_count: 184,
		registration_deadline: "2026-10-10T23:59:00Z",
		is_public: true,
		status: "upcoming",
		banner_image:
			"https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
		coordinator: "Dr. Arvind Swaminathan",
		target_audience: "Grade 6 - 12",
	},
	{
		id: "demo-evt-2",
		title: "Inter-School Football Championship",
		description:
			"The premier regional soccer tournament with 16 competing schools, knockout rounds, and awards for Best Striker and Fair Play.",
		event_type: "sports",
		category_label: "Sports & Athletics",
		start_date: "2026-10-22T08:00:00Z",
		end_date: "2026-10-24T18:00:00Z",
		location: "Senior Sports Complex & Arena",
		max_participants: 120,
		registered_count: 112,
		registration_deadline: "2026-10-18T18:00:00Z",
		is_public: true,
		status: "upcoming",
		banner_image:
			"https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
		coordinator: "Coach Rajesh Verma",
		target_audience: "Grade 8 - 12 (Boys & Girls)",
	},
	{
		id: "demo-evt-3",
		title: "Lit Fest: National Youth Debate & Poetry Slam",
		description:
			"A 2-day literary celebration encompassing Parliamentary Debates, Model United Nations simulation, Creative Writing, and Spoken Word.",
		event_type: "cultural",
		category_label: "Literary & Arts",
		start_date: "2026-11-05T10:00:00Z",
		end_date: "2026-11-06T17:00:00Z",
		location: "Amphitheatre & Library Hall",
		max_participants: 180,
		registered_count: 145,
		registration_deadline: "2026-11-01T20:00:00Z",
		is_public: true,
		status: "upcoming",
		banner_image:
			"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
		coordinator: "Ms. Ananya Roy",
		target_audience: "Grade 7 - 12",
	},
	{
		id: "demo-evt-4",
		title: "AI & Machine Learning Hands-on Bootcamp",
		description:
			"Practical immersion into neural networks, computer vision, and building real-world AI applications with industry mentors.",
		event_type: "workshop",
		category_label: "Workshops",
		start_date: "2026-09-28T11:00:00Z",
		end_date: "2026-09-28T15:30:00Z",
		location: "Computer Lab 3 & Online Stream",
		max_participants: 90,
		registered_count: 88,
		registration_deadline: "2026-09-25T23:59:00Z",
		is_public: false,
		status: "ongoing",
		banner_image:
			"https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
		coordinator: "Prof. Laura White",
		target_audience: "Grade 9 - 12 & Faculty",
	},
	{
		id: "demo-evt-5",
		title: "Annual Music & Dance Cultural Carnival",
		description:
			"Mesmerizing classical, fusion, and contemporary musical concerts, orchestra displays, and theatrical plays performed by student troupes.",
		event_type: "cultural",
		category_label: "Cultural & Arts",
		start_date: "2026-12-18T16:00:00Z",
		end_date: "2026-12-19T21:00:00Z",
		location: "Grand Central Quadrangle",
		max_participants: 400,
		registered_count: 320,
		registration_deadline: "2026-12-10T18:00:00Z",
		is_public: true,
		status: "upcoming",
		banner_image:
			"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
		coordinator: "Mr. David Kim",
		target_audience: "All Students, Parents & Alumni",
	},
	{
		id: "demo-evt-6",
		title: "Junior Olympiad in Mathematics & Logic",
		description:
			"Speed arithmetic, logic puzzles, and geometric problem-solving challenge for primary and middle grade students with medal honors.",
		event_type: "competition",
		category_label: "Competitions",
		start_date: "2026-08-14T09:00:00Z",
		end_date: "2026-08-14T13:00:00Z",
		location: "Academic Block B",
		max_participants: 150,
		registered_count: 150,
		registration_deadline: "2026-08-10T18:00:00Z",
		is_public: false,
		status: "completed",
		banner_image:
			"https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
		coordinator: "Ms. Priya Sharma",
		target_audience: "Grade 3 - 8",
	},
];

// Sample registrations for demo events
const DEMO_REGISTRATIONS = [
	{
		id: "reg-1",
		user_name: "Raj Patel",
		user_email: "rajpatel.literavalley.edu.in",
		user_phone: "+91 98765 43210",
		student_id: "LTV023849",
		class_section: "5-C",
		status: "registered",
		registered_at: "2026-09-02T10:14:00Z",
	},
	{
		id: "reg-2",
		user_name: "Sophia Kim",
		user_email: "sophiakim.literavalley.edu.in",
		user_phone: "+91 98765 43211",
		student_id: "LTV023850",
		class_section: "2-D",
		status: "registered",
		registered_at: "2026-09-03T11:20:00Z",
	},
	{
		id: "reg-3",
		user_name: "Maya Chen",
		user_email: "mayachen.literavalley.edu.in",
		user_phone: "+91 98765 43212",
		student_id: "LTV023848",
		class_section: "3-A",
		status: "attended",
		registered_at: "2026-09-04T09:45:00Z",
	},
	{
		id: "reg-4",
		user_name: "Ethan Brown",
		user_email: "ethanbrown.literavalley.edu.in",
		user_phone: "+91 98765 43213",
		student_id: "LTV023851",
		class_section: "1-A",
		status: "registered",
		registered_at: "2026-09-05T14:30:00Z",
	},
	{
		id: "reg-5",
		user_name: "Arjun Mehta",
		user_email: "arjunmehta.literavalley.edu.in",
		user_phone: "+91 98765 43214",
		student_id: "LTV023847",
		class_section: "4-B",
		status: "attended",
		registered_at: "2026-09-06T16:15:00Z",
	},
	{
		id: "reg-6",
		user_name: "Aisha Khan",
		user_email: "aishakhan.literavalley.edu.in",
		user_phone: "+91 98765 43215",
		student_id: "LTV023852",
		class_section: "6-F",
		status: "cancelled",
		registered_at: "2026-09-07T08:50:00Z",
	},
	{
		id: "reg-7",
		user_name: "Mohammed Ali",
		user_email: "mohammedali.literavalley.edu.in",
		user_phone: "+91 98765 43216",
		student_id: "LTV023853",
		class_section: "7-B",
		status: "registered",
		registered_at: "2026-09-08T12:05:00Z",
	},
];

const PRESET_BANNERS = [
	{
		name: "Science & Innovation",
		url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
	},
	{
		name: "Sports & Tournament",
		url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80",
	},
	{
		name: "Debate & Literature",
		url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80",
	},
	{
		name: "Tech & Coding",
		url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
	},
	{
		name: "Music & Arts Festival",
		url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
	},
	{
		name: "Awards & Graduation",
		url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
	},
];

export default function EventsManagement() {
	const router = useRouter();
	const { user, loading } = useAuth();

	// State
	const [events, setEvents] = useState(DEMO_EVENTS);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedStatus, setSelectedStatus] = useState("all");
	const [selectedAudience, setSelectedAudience] = useState("all");
	const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
	const [isLoading, setIsLoading] = useState(false);

	// Toast Feedback
	const [successMsg, setSuccessMsg] = useState("");
	const [errorMsg, setErrorMsg] = useState("");

	// Dropdown Filters State
	const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
	const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
	const [audienceDropdownOpen, setAudienceDropdownOpen] = useState(false);
	const categoryFilterRef = useRef(null);
	const statusFilterRef = useRef(null);
	const audienceFilterRef = useRef(null);

	// Modal States
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingEvent, setEditingEvent] = useState(null);
	const [savingEvent, setSavingEvent] = useState(false);

	// Registrations Modal State
	const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
	const [activeEvent, setActiveEvent] = useState(null);
	const [registrations, setRegistrations] = useState(DEMO_REGISTRATIONS);
	const [regSearchTerm, setRegSearchTerm] = useState("");
	const [regFilterStatus, setRegFilterStatus] = useState("all");
	const [showAddAttendeeModal, setShowAddAttendeeModal] = useState(false);
	const [newAttendee, setNewAttendee] = useState({
		name: "",
		email: "",
		phone: "",
		class_section: "5-C",
	});

	// Active Action Row Menu
	const [activeMenuEventId, setActiveMenuEventId] = useState(null);

	// Create/Edit Form Data
	const emptyForm = {
		title: "",
		description: "",
		event_type: "academic",
		start_date: "",
		end_date: "",
		location: "",
		max_participants: 100,
		registration_deadline: "",
		is_public: true,
		banner_image: PRESET_BANNERS[0].url,
		coordinator: "",
		target_audience: "All Students",
	};
	const [formData, setFormData] = useState(emptyForm);

	// Outside click handler for dropdowns & menus
	useEffect(() => {
		function handleClickOutside(event) {
			if (
				categoryFilterRef.current &&
				!categoryFilterRef.current.contains(event.target)
			) {
				setCategoryDropdownOpen(false);
			}
			if (
				statusFilterRef.current &&
				!statusFilterRef.current.contains(event.target)
			) {
				setStatusDropdownOpen(false);
			}
			if (
				audienceFilterRef.current &&
				!audienceFilterRef.current.contains(event.target)
			) {
				setAudienceDropdownOpen(false);
			}
			if (!event.target.closest(".event-action-menu")) {
				setActiveMenuEventId(null);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Fetch Events from Supabase
	useEffect(() => {
		if (user?.school_id) {
			fetchEvents();
		}
	}, [user]);

	const fetchEvents = async () => {
		if (!user?.school_id) return;
		try {
			setIsLoading(true);
			const { data, error } = await supabase
				.from("events")
				.select("*")
				.eq("school_id", user.school_id)
				.order("start_date", { ascending: true });

			if (!error && data && data.length > 0) {
				// Augment fetched events with helper fields if missing
				const augmented = data.map((ev, idx) => ({
					...ev,
					registered_count:
						ev.registered_count !== undefined
							? ev.registered_count
							: Math.floor((ev.max_participants || 100) * 0.65),
					coordinator: ev.coordinator || "Event Committee",
					target_audience: ev.target_audience || "All Students",
					banner_image:
						ev.banner_image ||
						PRESET_BANNERS[idx % PRESET_BANNERS.length].url,
				}));
				setEvents(augmented);
			} else {
				// Fallback to rich curated demo events
				setEvents(DEMO_EVENTS);
			}
		} catch (err) {
			console.error("Error fetching events:", err);
			setEvents(DEMO_EVENTS);
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch Registrations for an Event
	const fetchRegistrations = async (eventId) => {
		if (!eventId || eventId.toString().startsWith("demo-")) {
			setRegistrations(DEMO_REGISTRATIONS);
			return;
		}

		try {
			const { data, error } = await supabase
				.from("event_registrations")
				.select("*")
				.eq("event_id", eventId)
				.order("registered_at", { ascending: false });

			if (!error && data && data.length > 0) {
				setRegistrations(data);
			} else {
				setRegistrations(DEMO_REGISTRATIONS);
			}
		} catch (err) {
			console.error("Error fetching registrations:", err);
			setRegistrations(DEMO_REGISTRATIONS);
		}
	};

	// Open Registrations Modal
	const handleOpenRegistrations = async (event) => {
		setActiveEvent(event);
		setRegSearchTerm("");
		setRegFilterStatus("all");
		await fetchRegistrations(event.id);
		setShowRegistrationsModal(true);
	};

	// Open Create Modal
	const handleOpenCreate = () => {
		setEditingEvent(null);
		const defaultStart = new Date();
		defaultStart.setDate(defaultStart.getDate() + 7);
		defaultStart.setHours(10, 0, 0, 0);

		const defaultEnd = new Date(defaultStart);
		defaultEnd.setHours(16, 0, 0, 0);

		const defaultDeadline = new Date(defaultStart);
		defaultDeadline.setDate(defaultDeadline.getDate() - 2);

		setFormData({
			...emptyForm,
			start_date: defaultStart.toISOString().slice(0, 16),
			end_date: defaultEnd.toISOString().slice(0, 16),
			registration_deadline: defaultDeadline.toISOString().slice(0, 16),
		});
		setShowCreateModal(true);
	};

	// Open Edit Modal
	const handleOpenEdit = (event) => {
		setEditingEvent(event);
		setFormData({
			title: event.title || "",
			description: event.description || "",
			event_type: event.event_type || "academic",
			start_date: event.start_date
				? new Date(event.start_date).toISOString().slice(0, 16)
				: "",
			end_date: event.end_date
				? new Date(event.end_date).toISOString().slice(0, 16)
				: "",
			location: event.location || "",
			max_participants: event.max_participants || 100,
			registration_deadline: event.registration_deadline
				? new Date(event.registration_deadline).toISOString().slice(0, 16)
				: "",
			is_public: event.is_public !== undefined ? event.is_public : true,
			banner_image: event.banner_image || PRESET_BANNERS[0].url,
			coordinator: event.coordinator || "",
			target_audience: event.target_audience || "All Students",
		});
		setShowCreateModal(true);
		setActiveMenuEventId(null);
	};

	// Save Event (Create / Update)
	const handleSaveEvent = async (e) => {
		e.preventDefault();
		if (!formData.title.trim()) {
			setErrorMsg("Please provide a valid event title.");
			return;
		}

		setSavingEvent(true);
		setErrorMsg("");

		try {
			const payload = {
				title: formData.title.trim(),
				description: formData.description?.trim() || "",
				event_type: formData.event_type,
				start_date: new Date(formData.start_date).toISOString(),
				end_date: new Date(formData.end_date).toISOString(),
				location: formData.location.trim() || "Campus Grounds",
				max_participants: parseInt(formData.max_participants, 10) || 100,
				registration_deadline: formData.registration_deadline
					? new Date(formData.registration_deadline).toISOString()
					: new Date(formData.start_date).toISOString(),
				is_public: formData.is_public,
				banner_image: formData.banner_image,
				status: "upcoming",
			};

			if (user?.school_id) {
				payload.school_id = user.school_id;
			}
			if (user?.id) {
				payload.created_by = user.id;
			}

			if (editingEvent) {
				// If editing an existing real DB record
				if (!editingEvent.id.toString().startsWith("demo-")) {
					const { error } = await supabase
						.from("events")
						.update(payload)
						.eq("id", editingEvent.id);
					if (error) throw error;
				}

				// Update state
				setEvents((prev) =>
					prev.map((ev) =>
						ev.id === editingEvent.id
							? {
									...ev,
									...payload,
									coordinator: formData.coordinator || ev.coordinator,
									target_audience:
										formData.target_audience || ev.target_audience,
							  }
							: ev
					)
				);
				setSuccessMsg(`Event "${payload.title}" updated successfully!`);
			} else {
				// Creating a new event
				let newId = `evt-${Date.now()}`;
				if (user?.school_id) {
					try {
						const { data, error } = await supabase
							.from("events")
							.insert([payload])
							.select()
							.single();
						if (!error && data) {
							newId = data.id;
						}
					} catch (dbErr) {
						console.warn("Supabase insert notice:", dbErr);
					}
				}

				const newEventItem = {
					...payload,
					id: newId,
					registered_count: 0,
					coordinator: formData.coordinator || "Event Organizers",
					target_audience: formData.target_audience || "All Students",
				};

				setEvents((prev) => [newEventItem, ...prev]);
				setSuccessMsg(`Event "${payload.title}" created successfully!`);
			}

			setShowCreateModal(false);
			setTimeout(() => setSuccessMsg(""), 4000);
		} catch (err) {
			console.error("Save error:", err);
			setErrorMsg(err.message || "Failed to save event.");
		} finally {
			setSavingEvent(false);
		}
	};

	// Delete Event
	const handleDeleteEvent = async (eventId, eventTitle) => {
		if (!confirm(`Are you sure you want to delete the event "${eventTitle}"?`))
			return;

		try {
			if (!eventId.toString().startsWith("demo-")) {
				await supabase.from("events").delete().eq("id", eventId);
			}
			setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
			setSuccessMsg(`Event "${eventTitle}" was deleted.`);
			setActiveMenuEventId(null);
			setTimeout(() => setSuccessMsg(""), 3000);
		} catch (err) {
			console.error(err);
			setErrorMsg("Failed to delete event.");
		}
	};

	// Export Events List to Excel
	const handleExportEvents = () => {
		if (events.length === 0) {
			alert("No events available to export.");
			return;
		}

		const rows = events.map((ev, index) => ({
			"No.": index + 1,
			"Event Title": ev.title,
			Category: ev.event_type?.toUpperCase(),
			"Start Date": new Date(ev.start_date).toLocaleDateString(),
			"Start Time": new Date(ev.start_date).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
			"End Date": new Date(ev.end_date).toLocaleDateString(),
			Location: ev.location,
			"Max Capacity": ev.max_participants,
			"Registered Students": ev.registered_count || 0,
			Visibility: ev.is_public ? "Public" : "Intra-School",
			Coordinator: ev.coordinator || "N/A",
			"Target Audience": ev.target_audience || "All",
			Status: ev.status?.toUpperCase(),
		}));

		const ws = XLSX.utils.json_to_sheet(rows);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Campus Events");
		XLSX.writeFile(
			wb,
			`Litera_Valley_Events_${new Date().toISOString().slice(0, 10)}.xlsx`
		);
	};

	// Export Registrations of Active Event
	const handleExportRegistrations = () => {
		if (!activeEvent || registrations.length === 0) {
			alert("No registrations available to export.");
			return;
		}

		const rows = registrations.map((r, idx) => ({
			"Sl No": idx + 1,
			"Student Name": r.user_name || "N/A",
			"Student ID / Roll": r.student_id || "N/A",
			"Class & Section": r.class_section || "N/A",
			Email: r.user_email || "N/A",
			Phone: r.user_phone || "N/A",
			"Registration Status": r.status?.toUpperCase(),
			"Registered On": new Date(r.registered_at).toLocaleString(),
		}));

		const ws = XLSX.utils.json_to_sheet(rows);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Attendees");
		XLSX.writeFile(
			wb,
			`${activeEvent.title.replace(/[^a-zA-Z0-9]/g, "_")}_Registrations.xlsx`
		);
	};

	// Add Attendee Manually
	const handleAddAttendee = (e) => {
		e.preventDefault();
		if (!newAttendee.name.trim() || !newAttendee.email.trim()) {
			alert("Please fill in Student Name and Email.");
			return;
		}

		const newRegItem = {
			id: `reg-${Date.now()}`,
			user_name: newAttendee.name.trim(),
			user_email: newAttendee.email.trim(),
			user_phone: newAttendee.phone.trim() || "+91 98765 00000",
			student_id: `LTV0238${Math.floor(50 + Math.random() * 40)}`,
			class_section: newAttendee.class_section || "5-C",
			status: "registered",
			registered_at: new Date().toISOString(),
		};

		setRegistrations((prev) => [newRegItem, ...prev]);
		if (activeEvent) {
			setEvents((prev) =>
				prev.map((ev) =>
					ev.id === activeEvent.id
						? { ...ev, registered_count: (ev.registered_count || 0) + 1 }
						: ev
				)
			);
		}

		setNewAttendee({
			name: "",
			email: "",
			phone: "",
			class_section: "5-C",
		});
		setShowAddAttendeeModal(false);
		setSuccessMsg("Attendee registered successfully!");
		setTimeout(() => setSuccessMsg(""), 3000);
	};

	// Toggle/Update Attendee Status
	const handleUpdateAttendeeStatus = (regId, nextStatus) => {
		setRegistrations((prev) =>
			prev.map((r) => (r.id === regId ? { ...r, status: nextStatus } : r))
		);
	};

	// Remove Attendee
	const handleRemoveAttendee = (regId) => {
		if (!confirm("Are you sure you want to remove this registration?")) return;
		setRegistrations((prev) => prev.filter((r) => r.id !== regId));
		if (activeEvent) {
			setEvents((prev) =>
				prev.map((ev) =>
					ev.id === activeEvent.id
						? {
								...ev,
								registered_count: Math.max(
									0,
									(ev.registered_count || 0) - 1
								),
						  }
						: ev
				)
			);
		}
	};

	// Filtered Events computation
	const filteredEvents = useMemo(() => {
		return events.filter((event) => {
			const matchesSearch =
				searchTerm.trim() === "" ||
				event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				event.coordinator?.toLowerCase().includes(searchTerm.toLowerCase());

			const matchesCategory =
				selectedCategory === "all" ||
				event.event_type?.toLowerCase() === selectedCategory.toLowerCase();

			const matchesStatus =
				selectedStatus === "all" ||
				event.status?.toLowerCase() === selectedStatus.toLowerCase();

			const matchesAudience =
				selectedAudience === "all" ||
				(selectedAudience === "public" && event.is_public) ||
				(selectedAudience === "private" && !event.is_public);

			return (
				matchesSearch && matchesCategory && matchesStatus && matchesAudience
			);
		});
	}, [events, searchTerm, selectedCategory, selectedStatus, selectedAudience]);

	// KPI Metrics
	const totalEventsCount = events.length;
	const upcomingEventsCount = events.filter(
		(e) => e.status === "upcoming"
	).length;
	const totalRegistrationsCount = events.reduce(
		(sum, e) => sum + (e.registered_count || 0),
		0
	);
	const publicEventsCount = events.filter((e) => e.is_public).length;

	// Filtered Registrations in Modal
	const filteredRegistrations = useMemo(() => {
		return registrations.filter((r) => {
			const matchesSearch =
				regSearchTerm.trim() === "" ||
				r.user_name?.toLowerCase().includes(regSearchTerm.toLowerCase()) ||
				r.user_email?.toLowerCase().includes(regSearchTerm.toLowerCase()) ||
				r.student_id?.toLowerCase().includes(regSearchTerm.toLowerCase()) ||
				r.class_section?.toLowerCase().includes(regSearchTerm.toLowerCase());

			const matchesStatus =
				regFilterStatus === "all" ||
				r.status?.toLowerCase() === regFilterStatus.toLowerCase();

			return matchesSearch && matchesStatus;
		});
	}, [registrations, regSearchTerm, regFilterStatus]);

	// Helper: Get Type Badge Color
	const getTypeBadge = (type) => {
		switch (type?.toLowerCase()) {
			case "academic":
				return {
					bg: "bg-blue-50 text-blue-700 border-blue-200/70",
					label: "Academic",
				};
			case "sports":
				return {
					bg: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
					label: "Sports & Athletics",
				};
			case "cultural":
				return {
					bg: "bg-purple-50 text-purple-700 border-purple-200/70",
					label: "Cultural & Arts",
				};
			case "competition":
				return {
					bg: "bg-amber-50 text-amber-700 border-amber-200/70",
					label: "Competition",
				};
			case "workshop":
				return {
					bg: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
					label: "Workshop",
				};
			default:
				return {
					bg: "bg-slate-50 text-slate-700 border-slate-200/70",
					label: type || "Event",
				};
		}
	};

	// Helper: Get Status Badge Color
	const getStatusBadge = (status) => {
		switch (status?.toLowerCase()) {
			case "upcoming":
				return {
					bg: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
					dot: "bg-emerald-500 animate-pulse",
					label: "Upcoming",
				};
			case "ongoing":
				return {
					bg: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
					dot: "bg-blue-500 animate-ping",
					label: "Ongoing",
				};
			case "completed":
				return {
					bg: "bg-slate-500/10 text-slate-600 border border-slate-500/20",
					dot: "bg-slate-400",
					label: "Completed",
				};
			case "cancelled":
				return {
					bg: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
					dot: "bg-rose-500",
					label: "Cancelled",
				};
			default:
				return {
					bg: "bg-slate-100 text-slate-600 border border-slate-200",
					dot: "bg-slate-400",
					label: status || "Scheduled",
				};
		}
	};

	return (
		<div className="min-h-full bg-[#f8fafc] p-4 text-[#1e293b] sm:p-6 lg:p-7">
			<div className="mx-auto max-w-[1520px] space-y-6">
				{/* ── Page Header ── */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
							<span className="hover:text-slate-800 transition-colors">
								School Management
							</span>
							<span>•</span>
							<span className="text-[#ea580c]">Campus Events</span>
						</div>
						<h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl">
							Event Management
						</h1>
						<p className="text-xs sm:text-sm text-slate-500 mt-1">
							Create, organize, and monitor school activities, inter-school
							tournaments, and exhibitions.
						</p>
					</div>

					<div className="flex items-center gap-2.5 flex-wrap">
						{/* Export Excel Button */}
						<button
							type="button"
							onClick={handleExportEvents}
							className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
						>
							<Download className="h-4 w-4 text-slate-500" />
							<span>Export Events</span>
						</button>

						{/* Create Event Button */}
						<button
							type="button"
							onClick={handleOpenCreate}
							className="flex items-center gap-1.5 rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#c2410c] hover:shadow-md"
						>
							<Plus className="h-4 w-4 stroke-[2.5]" />
							<span>Create Event</span>
						</button>
					</div>
				</div>

				{/* Toast Alerts */}
				{successMsg && (
					<div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2">
						<CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
						<span>{successMsg}</span>
					</div>
				)}
				{errorMsg && (
					<div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 animate-in fade-in slide-in-from-top-2">
						<AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
						<span>{errorMsg}</span>
					</div>
				)}

				{/* ── 4 KPI Stat Cards (Matching Student Management Style) ── */}
				<div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
					{/* Card 1: Total Events */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf5ff] text-[#2563eb]">
							<CalendarDays className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Total Events</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								{totalEventsCount}
							</p>
						</div>
					</div>

					{/* Card 2: Upcoming Events */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f0ff] text-[#8b5cf6]">
							<Sparkles className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">
								Upcoming Activities
							</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								{upcomingEventsCount}
							</p>
						</div>
					</div>

					{/* Card 3: Total Registrations */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eafaf1] text-[#10b981]">
							<Users className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">
								Total Registrations
							</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								{totalRegistrationsCount.toLocaleString()}
							</p>
						</div>
					</div>

					{/* Card 4: Public & Flagship */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fef8e7] text-[#f59e0b]">
							<Globe className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">
								Public & Flagship
							</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								{publicEventsCount}
							</p>
						</div>
					</div>
				</div>

				{/* ── Search, Filters, and Layout Switcher ── */}
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					{/* Left: Search Input */}
					<div className="relative w-full lg:max-w-md">
						<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							placeholder="Search events by title, venue, or coordinator..."
							autoComplete="off"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9.5 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-xs transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
						/>
					</div>

					{/* Right: Dropdown Filters & Grid/Table Toggle */}
					<div className="flex flex-wrap items-center gap-2.5">
						{/* 1. Category Filter */}
						<div className="relative" ref={categoryFilterRef}>
							<button
								type="button"
								onClick={() => {
									setCategoryDropdownOpen((prev) => !prev);
									setStatusDropdownOpen(false);
									setAudienceDropdownOpen(false);
								}}
								className={`flex min-w-[130px] items-center justify-between gap-2.5 rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									categoryDropdownOpen
										? "border-[#ea580c] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200"
								}`}
							>
								<span className="capitalize">
									{selectedCategory === "all"
										? "All Categories"
										: selectedCategory}
								</span>
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${
										categoryDropdownOpen
											? "rotate-180 text-slate-700"
											: "text-slate-400"
									}`}
								/>
							</button>
							{categoryDropdownOpen && (
								<div className="absolute left-0 z-40 mt-1.5 min-w-full w-44 origin-top-left rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
									{[
										{ id: "all", label: "All Categories" },
										{ id: "academic", label: "Academic & Tech" },
										{ id: "sports", label: "Sports & Athletics" },
										{ id: "cultural", label: "Cultural & Arts" },
										{ id: "competition", label: "Competitions" },
										{ id: "workshop", label: "Workshops" },
									].map((cat) => (
										<button
											key={cat.id}
											type="button"
											onClick={() => {
												setSelectedCategory(cat.id);
												setCategoryDropdownOpen(false);
											}}
											className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
												selectedCategory === cat.id
													? "bg-[#fff8f3] font-bold text-[#ea580c]"
													: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											{cat.label}
										</button>
									))}
								</div>
							)}
						</div>

						{/* 2. Status Filter */}
						<div className="relative" ref={statusFilterRef}>
							<button
								type="button"
								onClick={() => {
									setStatusDropdownOpen((prev) => !prev);
									setCategoryDropdownOpen(false);
									setAudienceDropdownOpen(false);
								}}
								className={`flex min-w-[110px] items-center justify-between gap-2.5 rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									statusDropdownOpen
										? "border-[#ea580c] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200"
								}`}
							>
								<span className="capitalize">
									{selectedStatus === "all" ? "All Status" : selectedStatus}
								</span>
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${
										statusDropdownOpen
											? "rotate-180 text-slate-700"
											: "text-slate-400"
									}`}
								/>
							</button>
							{statusDropdownOpen && (
								<div className="absolute left-0 z-40 mt-1.5 min-w-full w-36 origin-top-left rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
									{[
										{ id: "all", label: "All Status" },
										{ id: "upcoming", label: "Upcoming" },
										{ id: "ongoing", label: "Ongoing" },
										{ id: "completed", label: "Completed" },
									].map((st) => (
										<button
											key={st.id}
											type="button"
											onClick={() => {
												setSelectedStatus(st.id);
												setStatusDropdownOpen(false);
											}}
											className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
												selectedStatus === st.id
													? "bg-[#fff8f3] font-bold text-[#ea580c]"
													: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											{st.label}
										</button>
									))}
								</div>
							)}
						</div>

						{/* 3. Audience Filter */}
						<div className="relative" ref={audienceFilterRef}>
							<button
								type="button"
								onClick={() => {
									setAudienceDropdownOpen((prev) => !prev);
									setCategoryDropdownOpen(false);
									setStatusDropdownOpen(false);
								}}
								className={`flex min-w-[120px] items-center justify-between gap-2.5 rounded-xl border bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									audienceDropdownOpen
										? "border-[#ea580c] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200"
								}`}
							>
								<span>
									{selectedAudience === "all"
										? "All Visibility"
										: selectedAudience === "public"
										? "Public"
										: "Intra-School"}
								</span>
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${
										audienceDropdownOpen
											? "rotate-180 text-slate-700"
											: "text-slate-400"
									}`}
								/>
							</button>
							{audienceDropdownOpen && (
								<div className="absolute left-0 z-40 mt-1.5 min-w-full w-40 origin-top-left rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
									{[
										{ id: "all", label: "All Visibility" },
										{ id: "public", label: "Public Events" },
										{ id: "private", label: "Intra-School Only" },
									].map((aud) => (
										<button
											key={aud.id}
											type="button"
											onClick={() => {
												setSelectedAudience(aud.id);
												setAudienceDropdownOpen(false);
											}}
											className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-xs transition-colors ${
												selectedAudience === aud.id
													? "bg-[#fff8f3] font-bold text-[#ea580c]"
													: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											{aud.label}
										</button>
									))}
								</div>
							)}
						</div>

						{/* View Switcher: Grid vs Table */}
						<div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5 shadow-xs">
							<button
								type="button"
								onClick={() => setViewMode("grid")}
								className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
									viewMode === "grid"
										? "bg-slate-900 text-white shadow-xs"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
								}`}
								title="Grid View"
							>
								<LayoutGrid className="h-3.5 w-3.5" />
								<span className="hidden sm:inline">Grid</span>
							</button>
							<button
								type="button"
								onClick={() => setViewMode("table")}
								className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
									viewMode === "table"
										? "bg-slate-900 text-white shadow-xs"
										: "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
								}`}
								title="Table View"
							>
								<List className="h-3.5 w-3.5" />
								<span className="hidden sm:inline">Table</span>
							</button>
						</div>
					</div>
				</div>

				{/* ── Main Content Area ── */}
				{filteredEvents.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 px-4 text-center shadow-xs">
						<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#ea580c] mb-4">
							<CalendarDays className="h-8 w-8" />
						</div>
						<h3 className="text-base font-bold text-slate-900">
							No Events Found
						</h3>
						<p className="mt-1 text-xs text-slate-500 max-w-sm">
							{searchTerm ||
							selectedCategory !== "all" ||
							selectedStatus !== "all"
								? "No events match your search or filter criteria. Try adjusting your filters."
								: "There are currently no events registered. Click 'Create Event' to launch your first campus activity."}
						</p>
						<button
							type="button"
							onClick={handleOpenCreate}
							className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#c2410c] transition"
						>
							<Plus className="h-4 w-4" />
							<span>Create New Event</span>
						</button>
					</div>
				) : viewMode === "grid" ? (
					/* ── Grid View ── */
					<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
						{filteredEvents.map((event) => {
							const typeInfo = getTypeBadge(event.event_type);
							const statusInfo = getStatusBadge(event.status);
							const regCount = event.registered_count || 0;
							const maxCap = event.max_participants || 100;
							const capacityPercent = Math.min(
								100,
								Math.round((regCount / maxCap) * 100)
							);

							return (
								<div
									key={event.id}
									className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition duration-200 hover:-translate-y-1 hover:shadow-lg"
								>
									{/* Top Banner Image & Floating Badges */}
									<div className="relative h-44 w-full overflow-hidden bg-slate-100">
										{event.banner_image ? (
											<img
												src={event.banner_image}
												alt={event.title}
												className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-400 to-amber-600 text-white">
												<CalendarDays className="h-12 w-12 opacity-80" />
											</div>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />

										{/* Category & Visibility Badges */}
										<div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
											<span
												className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold shadow-xs backdrop-blur-md ${typeInfo.bg}`}
											>
												{typeInfo.label}
											</span>
											{event.is_public ? (
												<span className="flex items-center gap-1 rounded-lg border border-emerald-200/80 bg-emerald-500/90 px-2 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-md">
													<Globe className="h-3 w-3" />
													<span>Public</span>
												</span>
											) : (
												<span className="flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-800/80 px-2 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-md">
													<Building className="h-3 w-3" />
													<span>Intra-School</span>
												</span>
											)}
										</div>

										{/* Status Pill on Top-Right */}
										<div className="absolute top-3 right-3">
											<span
												className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-xs backdrop-blur-md ${statusInfo.bg}`}
											>
												<span
													className={`h-2 w-2 rounded-full ${statusInfo.dot}`}
												/>
												<span>{statusInfo.label}</span>
											</span>
										</div>

										{/* Event Date Tag floating at bottom of image */}
										<div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs font-bold text-white drop-shadow-md">
											<Clock className="h-3.5 w-3.5 text-orange-400" />
											<span>
												{new Date(event.start_date).toLocaleDateString(
													"en-US",
													{
														weekday: "short",
														month: "short",
														day: "numeric",
														year: "numeric",
													}
												)}
											</span>
										</div>
									</div>

									{/* Card Body */}
									<div className="flex flex-1 flex-col p-5">
										<div className="flex items-start justify-between gap-2">
											<h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-[#ea580c] transition-colors">
												{event.title}
											</h3>

											{/* Action Dropdown Menu */}
											<div className="relative event-action-menu">
												<button
													type="button"
													onClick={() =>
														setActiveMenuEventId((prev) =>
															prev === event.id ? null : event.id
														)
													}
													className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
												>
													<MoreVertical className="h-4 w-4" />
												</button>

												{activeMenuEventId === event.id && (
													<div className="absolute right-0 z-30 mt-1 w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
														<button
															type="button"
															onClick={() => handleOpenRegistrations(event)}
															className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
														>
															<Users className="h-3.5 w-3.5 text-slate-500" />
															<span>Registrations</span>
														</button>
														<button
															type="button"
															onClick={() => handleOpenEdit(event)}
															className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
														>
															<Edit2 className="h-3.5 w-3.5 text-blue-500" />
															<span>Edit Event</span>
														</button>
														<button
															type="button"
															onClick={() => {
																navigator.clipboard.writeText(
																	window.location.href
																);
																setSuccessMsg(
																	"Event link copied to clipboard!"
																);
																setActiveMenuEventId(null);
																setTimeout(() => setSuccessMsg(""), 3000);
															}}
															className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
														>
															<Share2 className="h-3.5 w-3.5 text-slate-500" />
															<span>Copy Link</span>
														</button>
														<hr className="my-1 border-slate-100" />
														<button
															type="button"
															onClick={() =>
																handleDeleteEvent(event.id, event.title)
															}
															className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50"
														>
															<Trash2 className="h-3.5 w-3.5 text-rose-500" />
															<span>Delete</span>
														</button>
													</div>
												)}
											</div>
										</div>

										<p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
											{event.description ||
												"No detailed description provided for this campus event."}
										</p>

										{/* Event Metadata Chips */}
										<div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
											<div className="flex items-center gap-2">
												<MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
												<span className="truncate font-medium">
													{event.location || "Campus Venue"}
												</span>
											</div>

											<div className="flex items-center gap-2">
												<Award className="h-3.5 w-3.5 text-slate-400 shrink-0" />
												<span className="truncate text-slate-500">
													Audience:{" "}
													<strong className="text-slate-700 font-semibold">
														{event.target_audience || "All Grades"}
													</strong>
												</span>
											</div>
										</div>

										{/* Capacity Progress Bar */}
										<div className="mt-4 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
											<div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
												<span className="flex items-center gap-1 text-slate-500">
													<Users className="h-3.5 w-3.5" />
													<span>Registered</span>
												</span>
												<span>
													{regCount}{" "}
													<span className="text-slate-400 font-normal">
														/ {maxCap}
													</span>
												</span>
											</div>
											<div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
												<div
													className={`h-full rounded-full transition-all duration-500 ${
														capacityPercent >= 90
															? "bg-rose-500"
															: capacityPercent >= 70
															? "bg-amber-500"
															: "bg-[#ea580c]"
													}`}
													style={{ width: `${capacityPercent}%` }}
												/>
											</div>
										</div>

										{/* Bottom Action Button */}
										<div className="mt-4 pt-2">
											<button
												type="button"
												onClick={() => handleOpenRegistrations(event)}
												className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800 hover:shadow-md"
											>
												<Users className="h-3.5 w-3.5" />
												<span>View Registrations ({regCount})</span>
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					/* ── Table View ── */
					<div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
						<div className="overflow-x-auto">
							<table className="w-full text-left text-xs">
								<thead>
									<tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-600">
										<th className="py-3.5 pl-6 pr-4">Event Details</th>
										<th className="py-3.5 px-4">Category</th>
										<th className="py-3.5 px-4">Schedule</th>
										<th className="py-3.5 px-4">Location</th>
										<th className="py-3.5 px-4">Capacity & Registrations</th>
										<th className="py-3.5 px-4">Visibility</th>
										<th className="py-3.5 px-4">Status</th>
										<th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-100">
									{filteredEvents.map((event) => {
										const typeInfo = getTypeBadge(event.event_type);
										const statusInfo = getStatusBadge(event.status);
										const regCount = event.registered_count || 0;
										const maxCap = event.max_participants || 100;
										const capacityPercent = Math.min(
											100,
											Math.round((regCount / maxCap) * 100)
										);

										return (
											<tr
												key={event.id}
												className="transition hover:bg-slate-50/80"
											>
												{/* Title & Banner thumbnail */}
												<td className="py-3.5 pl-6 pr-4">
													<div className="flex items-center gap-3">
														<img
															src={
																event.banner_image || PRESET_BANNERS[0].url
															}
															alt={event.title}
															className="h-10 w-14 rounded-lg object-cover shadow-xs shrink-0"
														/>
														<div className="min-w-0">
															<p className="font-bold text-slate-900 line-clamp-1">
																{event.title}
															</p>
															<p className="text-[11px] text-slate-400 line-clamp-1">
																{event.coordinator || "Event Organizers"}
															</p>
														</div>
													</div>
												</td>

												{/* Category */}
												<td className="py-3.5 px-4">
													<span
														className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-bold ${typeInfo.bg}`}
													>
														{typeInfo.label}
													</span>
												</td>

												{/* Schedule */}
												<td className="py-3.5 px-4">
													<div className="space-y-0.5">
														<p className="font-semibold text-slate-800">
															{new Date(event.start_date).toLocaleDateString()}
														</p>
														<p className="text-[11px] text-slate-400">
															{new Date(event.start_date).toLocaleTimeString(
																[],
																{
																	hour: "2-digit",
																	minute: "2-digit",
																}
															)}
														</p>
													</div>
												</td>

												{/* Location */}
												<td className="py-3.5 px-4">
													<span className="font-medium text-slate-700">
														{event.location}
													</span>
												</td>

												{/* Capacity */}
												<td className="py-3.5 px-4">
													<div className="w-36 space-y-1">
														<div className="flex justify-between text-[11px] font-medium text-slate-600">
															<span>
																{regCount} / {maxCap}
															</span>
															<span>{capacityPercent}%</span>
														</div>
														<div className="h-1.5 w-full rounded-full bg-slate-100">
															<div
																className="h-full rounded-full bg-[#ea580c]"
																style={{ width: `${capacityPercent}%` }}
															/>
														</div>
													</div>
												</td>

												{/* Visibility */}
												<td className="py-3.5 px-4">
													{event.is_public ? (
														<span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
															<Globe className="h-3 w-3" />
															<span>Public</span>
														</span>
													) : (
														<span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
															<Building className="h-3 w-3" />
															<span>Private</span>
														</span>
													)}
												</td>

												{/* Status */}
												<td className="py-3.5 px-4">
													<span
														className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-bold ${statusInfo.bg}`}
													>
														<span
															className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`}
														/>
														<span>{statusInfo.label}</span>
													</span>
												</td>

												{/* Actions */}
												<td className="py-3.5 pl-4 pr-6 text-right">
													<div className="flex items-center justify-end gap-1.5">
														<button
															type="button"
															onClick={() => handleOpenRegistrations(event)}
															className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
															title="Registrations"
														>
															<Users className="h-3.5 w-3.5 text-slate-500" />
															<span>Attendees</span>
														</button>
														<button
															type="button"
															onClick={() => handleOpenEdit(event)}
															className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
															title="Edit"
														>
															<Edit2 className="h-3.5 w-3.5" />
														</button>
														<button
															type="button"
															onClick={() =>
																handleDeleteEvent(event.id, event.title)
															}
															className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
															title="Delete"
														>
															<Trash2 className="h-3.5 w-3.5" />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>

			{/* ═══════════════════════════════════════════════════════
          SLIDE-OVER DRAWER: CREATE / EDIT EVENT (MATCHING FIGMA SCREENSHOT)
         ═══════════════════════════════════════════════════════ */}
			{showCreateModal && (
				<div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in-0">
					<div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
						{/* Drawer Header */}
						<div className="p-6 border-b border-slate-100 flex items-center justify-between">
							<h3 className="text-base font-bold text-slate-900 sm:text-lg">
								{editingEvent ? "Edit Event" : "Create Event"}
							</h3>
							<button
								type="button"
								onClick={() => setShowCreateModal(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Drawer Form Body (Scrollable) */}
						<form
							id="event-form"
							onSubmit={handleSaveEvent}
							className="p-6 space-y-4 overflow-y-auto flex-1 text-xs [scrollbar-width:thin]"
						>
							{/* Event Name */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold text-slate-800">
									Event Name<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									placeholder="Title"
									value={formData.title}
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
									className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
								/>
							</div>

							{/* Description */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold text-slate-800">
									Description<span className="text-red-500">*</span>
								</label>
								<textarea
									rows={3}
									required
									placeholder="Description"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
								/>
							</div>

							{/* Location */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold text-slate-800">
									Location<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									placeholder="Title"
									value={formData.location}
									onChange={(e) =>
										setFormData({ ...formData, location: e.target.value })
									}
									className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
								/>
							</div>

							{/* Audience */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold text-slate-800">
									Audience<span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<select
										value={formData.target_audience || "All Students"}
										onChange={(e) =>
											setFormData({
												...formData,
												target_audience: e.target.value,
											})
										}
										className="w-full appearance-none rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 pr-10 text-xs font-medium text-slate-800 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									>
										<option value="All Students">All Students</option>
										<option value="High School (Grades 9-12)">
											High School (Grades 9-12)
										</option>
										<option value="Middle School (Grades 6-8)">
											Middle School (Grades 6-8)
										</option>
										<option value="Primary School (Grades 1-5)">
											Primary School (Grades 1-5)
										</option>
										<option value="Faculty & Staff">Faculty & Staff</option>
										<option value="Parents & Community">
											Parents & Community
										</option>
										<option value="Public Event">Public Event</option>
									</select>
									<ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								</div>
							</div>

							{/* Start Date & Start Time */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										Start Date<span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<input
											type="date"
											required
											value={
												formData.start_date
													? formData.start_date.split("T")[0]
													: ""
											}
											onChange={(e) => {
												const dateVal = e.target.value;
												const timeVal = formData.start_time || "09:00";
												setFormData({
													...formData,
													start_date: `${dateVal}T${timeVal}`,
													start_date_only: dateVal,
												});
											}}
											className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
										/>
									</div>
								</div>

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										Start Time<span className="text-red-500">*</span>
									</label>
									<input
										type="time"
										required
										value={
											formData.start_time ||
											(formData.start_date && formData.start_date.includes("T")
												? formData.start_date.split("T")[1]?.slice(0, 5)
												: "09:00")
										}
										onChange={(e) => {
											const timeVal = e.target.value;
											const dateVal =
												formData.start_date_only ||
												formData.start_date?.split("T")[0] ||
												new Date().toISOString().split("T")[0];
											setFormData({
												...formData,
												start_time: timeVal,
												start_date: `${dateVal}T${timeVal}`,
											});
										}}
										className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									/>
								</div>
							</div>

							{/* End Date & End Time */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										End Date<span className="text-red-500">*</span>
									</label>
									<div className="relative">
										<input
											type="date"
											required
											value={
												formData.end_date
													? formData.end_date.split("T")[0]
													: ""
											}
											onChange={(e) => {
												const dateVal = e.target.value;
												const timeVal = formData.end_time || "17:00";
												setFormData({
													...formData,
													end_date: `${dateVal}T${timeVal}`,
													end_date_only: dateVal,
												});
											}}
											className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
										/>
									</div>
								</div>

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										End Time<span className="text-red-500">*</span>
									</label>
									<input
										type="time"
										required
										value={
											formData.end_time ||
											(formData.end_date && formData.end_date.includes("T")
												? formData.end_date.split("T")[1]?.slice(0, 5)
												: "17:00")
										}
										onChange={(e) => {
											const timeVal = e.target.value;
											const dateVal =
												formData.end_date_only ||
												formData.end_date?.split("T")[0] ||
												new Date().toISOString().split("T")[0];
											setFormData({
												...formData,
												end_time: timeVal,
												end_date: `${dateVal}T${timeVal}`,
											});
										}}
										className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									/>
								</div>
							</div>

							{/* Registration Fee */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold text-slate-800">
									Registration Fee
								</label>
								<input
									type="text"
									placeholder="Fee"
									value={formData.registration_fee || ""}
									onChange={(e) =>
										setFormData({
											...formData,
											registration_fee: e.target.value,
										})
									}
									className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
								/>
							</div>

							{/* Deadline Date & Deadline Time */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										Deadline Date
									</label>
									<div className="relative">
										<input
											type="date"
											value={
												formData.registration_deadline
													? formData.registration_deadline.split("T")[0]
													: ""
											}
											onChange={(e) => {
												const dateVal = e.target.value;
												const timeVal = formData.deadline_time || "23:59";
												setFormData({
													...formData,
													registration_deadline: `${dateVal}T${timeVal}`,
													deadline_date_only: dateVal,
												});
											}}
											className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
										/>
									</div>
								</div>

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										Deadline Time
									</label>
									<input
										type="time"
										value={
											formData.deadline_time ||
											(formData.registration_deadline &&
											formData.registration_deadline.includes("T")
												? formData.registration_deadline
														.split("T")[1]
														?.slice(0, 5)
												: "23:59")
										}
										onChange={(e) => {
											const timeVal = e.target.value;
											const dateVal =
												formData.deadline_date_only ||
												formData.registration_deadline?.split("T")[0] ||
												formData.start_date?.split("T")[0] ||
												new Date().toISOString().split("T")[0];
											setFormData({
												...formData,
												deadline_time: timeVal,
												registration_deadline: `${dateVal}T${timeVal}`,
											});
										}}
										className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									/>
								</div>
							</div>

							{/* Checkbox: Show attendees */}
							<div className="flex items-center gap-2.5 pt-1">
								<input
									type="checkbox"
									id="show_attendees_checkbox"
									checked={
										formData.show_attendees !== undefined
											? formData.show_attendees
											: true
									}
									onChange={(e) =>
										setFormData({
											...formData,
											show_attendees: e.target.checked,
										})
									}
									className="h-4 w-4 rounded border-slate-300 text-[#ea580c] accent-[#ea580c] focus:ring-[#ea580c]"
								/>
								<label
									htmlFor="show_attendees_checkbox"
									className="cursor-pointer select-none text-xs font-semibold text-slate-800"
								>
									Show attendees
								</label>
							</div>
						</form>

						{/* Pinned Footer Actions */}
						<div className="p-6 border-t border-slate-100 bg-white flex items-center gap-3">
							<button
								type="button"
								onClick={() => setShowCreateModal(false)}
								className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
							>
								Cancel
							</button>
							<button
								type="submit"
								form="event-form"
								disabled={savingEvent}
								className="flex-1 rounded-xl bg-[#d95327] hover:bg-[#c2441c] py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:shadow-md transition text-center disabled:opacity-60"
							>
								{savingEvent
									? "Saving..."
									: editingEvent
									? "Update Event"
									: "Publish Event"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════
          SLIDE-OVER DRAWER: VIEW & MANAGE REGISTRATIONS
         ═══════════════════════════════════════════════════════ */}
			{showRegistrationsModal && activeEvent && (
				<div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in-0">
					<div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
						{/* Drawer Header */}
						<div className="p-6 border-b border-slate-100 flex flex-col gap-3">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 text-xs font-bold text-[#ea580c] uppercase tracking-wider">
									<Users className="h-3.5 w-3.5" />
									<span>Attendee Management</span>
								</div>
								<button
									type="button"
									onClick={() => setShowRegistrationsModal(false)}
									className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
								>
									<X className="h-5 w-5" />
								</button>
							</div>

							<div>
								<h3 className="text-base font-bold text-slate-900 sm:text-lg">
									{activeEvent.title}
								</h3>
								<div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
									<span className="flex items-center gap-1">
										<CalendarDays className="h-3.5 w-3.5 text-slate-400" />
										{new Date(activeEvent.start_date).toLocaleDateString()}
									</span>
									<span>•</span>
									<span className="flex items-center gap-1">
										<MapPin className="h-3.5 w-3.5 text-slate-400" />
										{activeEvent.location}
									</span>
									<span>•</span>
									<span>Capacity: {activeEvent.max_participants || 100}</span>
								</div>
							</div>
						</div>

						{/* Drawer Body (Scrollable) */}
						<div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs [scrollbar-width:thin]">
							{/* 4 Mini Stat Cards */}
							<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
								<div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
									<p className="text-[10px] font-semibold text-slate-500">
										Registered
									</p>
									<p className="mt-0.5 text-lg font-extrabold text-slate-900">
										{registrations.length}
									</p>
								</div>
								<div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
									<p className="text-[10px] font-semibold text-emerald-700">
										Attended
									</p>
									<p className="mt-0.5 text-lg font-extrabold text-emerald-800">
										{registrations.filter((r) => r.status === "attended").length}
									</p>
								</div>
								<div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
									<p className="text-[10px] font-semibold text-blue-700">
										Confirmed
									</p>
									<p className="mt-0.5 text-lg font-extrabold text-blue-800">
										{
											registrations.filter((r) => r.status === "registered")
												.length
										}
									</p>
								</div>
								<div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
									<p className="text-[10px] font-semibold text-amber-700">
										Available
									</p>
									<p className="mt-0.5 text-lg font-extrabold text-amber-800">
										{Math.max(
											0,
											(activeEvent.max_participants || 100) -
												registrations.length
										)}
									</p>
								</div>
							</div>

							{/* Toolbar */}
							<div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
								<div className="relative w-full sm:max-w-xs">
									<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
									<input
										type="text"
										placeholder="Search student name, ID..."
										value={regSearchTerm}
										onChange={(e) => setRegSearchTerm(e.target.value)}
										className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									/>
								</div>

								<div className="flex items-center gap-2">
									<select
										value={regFilterStatus}
										onChange={(e) => setRegFilterStatus(e.target.value)}
										className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-[#ea580c] focus:outline-none"
									>
										<option value="all">All</option>
										<option value="registered">Registered</option>
										<option value="attended">Attended</option>
										<option value="cancelled">Cancelled</option>
									</select>

									<button
										type="button"
										onClick={handleExportRegistrations}
										disabled={registrations.length === 0}
										className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
									>
										<Download className="h-3.5 w-3.5 text-slate-500" />
										<span>CSV</span>
									</button>

									<button
										type="button"
										onClick={() => setShowAddAttendeeModal(true)}
										className="flex items-center gap-1 rounded-xl bg-[#ea580c] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#c2410c] transition"
									>
										<UserPlus className="h-3.5 w-3.5" />
										<span>Add</span>
									</button>
								</div>
							</div>

							{/* Attendees List */}
							{filteredRegistrations.length === 0 ? (
								<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-10 text-center">
									<Users className="h-7 w-7 text-slate-300 mb-2" />
									<p className="text-xs font-bold text-slate-700">
										No Registrations Found
									</p>
									<p className="text-[11px] text-slate-400">
										Try adjusting your search or add a student.
									</p>
								</div>
							) : (
								<div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
									{filteredRegistrations.map((reg, idx) => {
										const initials = reg.user_name
											? reg.user_name
													.split(" ")
													.map((n) => n[0])
													.join("")
													.slice(0, 2)
													.toUpperCase()
											: "ST";
										const avatarColors = [
											"bg-blue-500",
											"bg-purple-500",
											"bg-rose-500",
											"bg-emerald-500",
											"bg-amber-500",
										];
										const avatarBg = avatarColors[idx % avatarColors.length];

										return (
											<div
												key={reg.id}
												className="flex items-center justify-between p-3 hover:bg-slate-50/80 transition-colors"
											>
												<div className="flex items-center gap-3 min-w-0">
													<div
														className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white font-bold text-[10px] ${avatarBg}`}
													>
														{initials}
													</div>
													<div className="min-w-0">
														<p className="font-bold text-slate-900 truncate">
															{reg.user_name}
														</p>
														<div className="flex items-center gap-2 text-[11px] text-slate-400">
															<span className="font-semibold text-slate-600">
																Class {reg.class_section || "5-C"}
															</span>
															<span>•</span>
															<span className="truncate">{reg.user_email}</span>
														</div>
													</div>
												</div>

												<div className="flex items-center gap-2 shrink-0">
													<select
														value={reg.status}
														onChange={(e) =>
															handleUpdateAttendeeStatus(
																reg.id,
																e.target.value
															)
														}
														className={`rounded-lg border px-2 py-1 text-[10px] font-bold focus:outline-none ${
															reg.status === "attended"
																? "bg-emerald-50 text-emerald-700 border-emerald-200"
																: reg.status === "cancelled"
																? "bg-rose-50 text-rose-700 border-rose-200"
																: "bg-blue-50 text-blue-700 border-blue-200"
														}`}
													>
														<option value="registered">Registered</option>
														<option value="attended">Attended</option>
														<option value="cancelled">Cancelled</option>
													</select>

													<button
														type="button"
														onClick={() => handleRemoveAttendee(reg.id)}
														className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
														title="Remove Attendee"
													>
														<Trash2 className="h-3.5 w-3.5" />
													</button>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>

						{/* Drawer Footer */}
						<div className="p-6 border-t border-slate-100 bg-white flex justify-end">
							<button
								type="button"
								onClick={() => setShowRegistrationsModal(false)}
								className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════
          MODAL: ADD ATTENDEE MANUALLY
         ═══════════════════════════════════════════════════════ */}
			{showAddAttendeeModal && (
				<div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
					<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
						<div className="flex items-center justify-between pb-3 border-b border-slate-100">
							<h3 className="text-base font-extrabold text-slate-900">
								Add Student Registration
							</h3>
							<button
								type="button"
								onClick={() => setShowAddAttendeeModal(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<form onSubmit={handleAddAttendee} className="mt-4 space-y-4">
							<div>
								<label className="mb-1 block text-xs font-bold text-slate-700">
									Student Full Name <span className="text-rose-500">*</span>
								</label>
								<input
									type="text"
									required
									placeholder="e.g. Raj Patel"
									value={newAttendee.name}
									onChange={(e) =>
										setNewAttendee({ ...newAttendee, name: e.target.value })
									}
									className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20"
								/>
							</div>

							<div>
								<label className="mb-1 block text-xs font-bold text-slate-700">
									Student Email <span className="text-rose-500">*</span>
								</label>
								<input
									type="email"
									required
									placeholder="student@literavalley.edu.in"
									value={newAttendee.email}
									onChange={(e) =>
										setNewAttendee({ ...newAttendee, email: e.target.value })
									}
									className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1 block text-xs font-bold text-slate-700">
										Class & Section
									</label>
									<select
										value={newAttendee.class_section}
										onChange={(e) =>
											setNewAttendee({
												...newAttendee,
												class_section: e.target.value,
											})
										}
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-[#ea580c] focus:outline-none"
									>
										{["1-A", "2-D", "3-A", "4-B", "5-C", "6-F", "7-B", "8-A", "9-C", "10-A", "11-B", "12-A"].map(
											(cls) => (
												<option key={cls} value={cls}>
													Class {cls}
												</option>
											)
										)}
									</select>
								</div>

								<div>
									<label className="mb-1 block text-xs font-bold text-slate-700">
										Phone Number
									</label>
									<input
										type="tel"
										placeholder="+91 98765 43210"
										value={newAttendee.phone}
										onChange={(e) =>
											setNewAttendee({ ...newAttendee, phone: e.target.value })
										}
										className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/20"
									/>
								</div>
							</div>

							<div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setShowAddAttendeeModal(false)}
									className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#c2410c]"
								>
									Add to Event
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
