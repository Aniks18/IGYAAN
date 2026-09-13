"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import DatePicker from "../../../components/ui/DatePicker";
import * as XLSX from "xlsx";
import {
	Search,
	Upload,
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
	FileSpreadsheet,
	Download,
	ImageIcon,
	GraduationCap,
} from "lucide-react";

const ALLOWED_ROLES = ["super_admin"];

// Curated demo faculty matching the exact Figma mockup
const DEMO_FACULTY = [
	{
		id: "fac-1",
		facultyId: "FAC02381",
		full_name: "Raj Patel",
		email: "rajpatel.literavalley.edu.in",
		subject: "Social Studies",
		classesCount: 3,
		experience: "5 yrs",
		joined: "May 2026",
		status: "Active",
		avatarBg: "bg-blue-500",
		initials: "RP",
		phone: "+91 98765 43210",
	},
	{
		id: "fac-2",
		facultyId: "FAC02386",
		full_name: "Laura White",
		email: "laura.white.techuniverse.edu",
		subject: "Technology",
		classesCount: 5,
		experience: "9 yrs",
		joined: "Nov 2025",
		status: "Inactive",
		avatarBg: "bg-purple-500",
		initials: "LW",
		phone: "+91 98765 43211",
	},
	{
		id: "fac-3",
		facultyId: "FAC02385",
		full_name: "David Kim",
		email: "david.kim.artistic.edu",
		subject: "Art",
		classesCount: 6,
		experience: "7 yrs",
		joined: "Sep 2026",
		status: "Active",
		avatarBg: "bg-rose-500",
		initials: "DK",
		phone: "+91 98765 43212",
	},
	{
		id: "fac-4",
		facultyId: "FAC02387",
		full_name: "James Brown",
		email: "james.brown.musiczone.edu",
		subject: "Music",
		classesCount: 3,
		experience: "2 yrs",
		joined: "Feb 2024",
		status: "Active",
		avatarBg: "bg-amber-500",
		initials: "JB",
		phone: "+91 98765 43213",
	},
	{
		id: "fac-5",
		facultyId: "FAC02384",
		full_name: "Sara Thompson",
		email: "sara.thompson.history.com",
		subject: "History",
		classesCount: 2,
		experience: "4 yrs",
		joined: "Dec 2023",
		status: "Active",
		avatarBg: "bg-emerald-500",
		initials: "ST",
		phone: "+91 98765 43214",
	},
	{
		id: "fac-6",
		facultyId: "FAC02388",
		full_name: "Alice Green",
		email: "alice.green.languagearts.edu",
		subject: "Language Arts",
		classesCount: 4,
		experience: "5 yrs",
		joined: "Jan 2025",
		status: "Active",
		avatarBg: "bg-indigo-500",
		initials: "AG",
		phone: "+91 98765 43215",
	},
	{
		id: "fac-7",
		facultyId: "FAC02382",
		full_name: "Emily Johnson",
		email: "emily.johnson.educationhub.com",
		subject: "Mathematics",
		classesCount: 4,
		experience: "6 yrs",
		joined: "Jun 2025",
		status: "Active",
		avatarBg: "bg-teal-500",
		initials: "EJ",
		phone: "+91 98765 43216",
	},
	{
		id: "fac-8",
		facultyId: "FAC02389",
		full_name: "Peter Wilson",
		email: "peter.wilson.sportsacademy.edu",
		subject: "Physical Education",
		classesCount: 7,
		experience: "10 yrs",
		joined: "Mar 2022",
		status: "Active",
		avatarBg: "bg-cyan-500",
		initials: "PW",
		phone: "+91 98765 43217",
	},
];

const SUBJECT_OPTIONS = [
	"All Subject",
	"Social Studies",
	"Technology",
	"Art",
	"Music",
	"History",
	"Language Arts",
	"Mathematics",
	"Physical Education",
	"Science",
	"Physics",
	"Chemistry",
	"Biology",
];

function FormSelect({ label, required, value, options, onChange, placeholder = "Select" }) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const selectedObj = options.find((opt) =>
		typeof opt === "object" ? opt.value === value : opt === value
	);
	const displayLabel = typeof selectedObj === "object" ? selectedObj.label : selectedObj || placeholder;
	const isPlaceholder = !value || value === "Select" || value === "";

	return (
		<div className="relative" ref={dropdownRef}>
			{label && (
				<label className="mb-1.5 block text-xs font-semibold text-slate-800">
					{label}
					{required && <span className="text-red-500">*</span>}
				</label>
			)}
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-2.5 text-xs text-left shadow-2xs transition-all focus:outline-none ${
					isOpen
						? "border-[#ea580c] ring-2 ring-[#ea580c]/15 text-slate-900"
						: "border-slate-200/90 text-slate-800 hover:border-slate-300"
				}`}
			>
				<span className={`truncate ${isPlaceholder ? "text-slate-400 font-normal" : "text-slate-900 font-semibold"}`}>
					{displayLabel}
				</span>
				<ChevronDown
					className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
						isOpen ? "rotate-180 text-slate-700" : ""
					}`}
				/>
			</button>
			{isOpen && (
				<div className="absolute left-0 top-full z-50 mt-1.5 max-h-56 w-full min-w-[140px] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl ring-1 ring-slate-900/5">
					{options.map((opt) => {
						const optVal = typeof opt === "object" ? opt.value : opt;
						const optLabel = typeof opt === "object" ? opt.label : opt;
						const isSelected = value === optVal;
						return (
							<button
								key={optVal}
								type="button"
								onClick={() => {
									onChange(optVal);
									setIsOpen(false);
								}}
								className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
									isSelected
										? "bg-[#fff8f3] font-bold text-[#ea580c]"
										: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
								}`}
							>
								<span>{optLabel}</span>
								{isSelected && <Check className="h-3.5 w-3.5 text-[#ea580c]" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function FacultyManagementPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	const [classes, setClasses] = useState([]);
	const [activeSession, setActiveSession] = useState(null);
	const [allFaculty, setAllFaculty] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	// Modals
	const [showAddModal, setShowAddModal] = useState(false);
	const [showBulkModal, setShowBulkModal] = useState(false);
	const [showViewModal, setShowViewModal] = useState(false);
	const [viewFaculty, setViewFaculty] = useState(null);
	const [activeActionRow, setActiveActionRow] = useState(null);

	// Status & Messages
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Bulk Upload State
	const [uploadedFileName, setUploadedFileName] = useState("");
	const [parsedRows, setParsedRows] = useState([]);
	const [bulkSaving, setBulkSaving] = useState(false);
	const fileInputRef = useRef(null);
	const photoInputRef = useRef(null);

	// Filters & Search
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedYear, setSelectedYear] = useState("2025 - 2026");
	const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("All Subject");
	const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Status");

	// Filter Dropdown Open states
	const [yearFilterOpen, setYearFilterOpen] = useState(false);
	const [subjectFilterOpen, setSubjectFilterOpen] = useState(false);
	const [statusFilterOpen, setStatusFilterOpen] = useState(false);

	const yearFilterRef = useRef(null);
	const subjectFilterRef = useRef(null);
	const statusFilterRef = useRef(null);

	// Row selections
	const [selectedRowIds, setSelectedRowIds] = useState(new Set());

	// Add Faculty Form State
	const emptyFacultyForm = {
		photo: null,
		firstName: "",
		middleName: "",
		lastName: "",
		gender: "Select",
		dob: "",
		facultyId: "#FAC02389",
		subject: "Social Studies",
		classesCount: "3",
		experience: "5 yrs",
		joinedDate: "2025-05-15",
		phone: "",
		email: "",
		address: "",
		status: "Active",
	};
	const [facultyForm, setFacultyForm] = useState({ ...emptyFacultyForm });

	// Click outside listener for filters & row menu
	useEffect(() => {
		function handleClickOutside(event) {
			if (yearFilterRef.current && !yearFilterRef.current.contains(event.target)) {
				setYearFilterOpen(false);
			}
			if (subjectFilterRef.current && !subjectFilterRef.current.contains(event.target)) {
				setSubjectFilterOpen(false);
			}
			if (statusFilterRef.current && !statusFilterRef.current.contains(event.target)) {
				setStatusFilterOpen(false);
			}
			if (!event.target.closest(".row-action-menu")) {
				setActiveActionRow(null);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const hashPassword = async (password) => {
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		return Array.from(new Uint8Array(hashBuffer))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	};

	useEffect(() => {
		if (!loading && !user) router.push("/login");
		else if (!loading && user && !ALLOWED_ROLES.includes(user.role))
			router.push("/dashboard");
	}, [user, loading, router]);

	useEffect(() => {
		if (user && ALLOWED_ROLES.includes(user.role) && user.school_id) {
			fetchSessionAndClasses();
		}
	}, [user]);

	const fetchSessionAndClasses = async () => {
		try {
			setIsLoading(true);
			const { data: sessions } = await supabase
				.from("academic_sessions")
				.select("*")
				.eq("school_id", user.school_id)
				.eq("is_active", true)
				.limit(1);

			const currentSession = sessions?.[0] || null;
			setActiveSession(currentSession);

			const { data: classList } = await supabase
				.from("classes")
				.select("*")
				.eq("school_id", user.school_id)
				.order("class_name");
			setClasses(classList || []);

			await fetchAllFaculty(currentSession);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchAllFaculty = async (session) => {
		try {
			const { data: facultyUsers, error: fErr } = await supabase
				.from("users")
				.select("id, full_name, email, phone, created_at")
				.eq("school_id", user.school_id)
				.eq("role", "faculty")
				.order("full_name");

			if (fErr) throw fErr;

			const userIds = (facultyUsers || []).map((u) => u.id);

			let assignments = [];
			if (userIds.length > 0) {
				const { data: aData } = await supabase
					.from("faculty_assignments")
					.select("faculty_id, class_id, subject")
					.in("faculty_id", userIds)
					.eq("is_active", true);
				assignments = aData || [];
			}

			const merged = (facultyUsers || []).map((u, i) => {
				const facultyAssignments = assignments.filter((a) => a.faculty_id === u.id);
				const facultyId = `FAC0238${(1 + i).toString()}`;
				const subject = facultyAssignments[0]?.subject || (i % 2 === 0 ? "Mathematics" : "Science");
				const initials = u.full_name
					? u.full_name
							.split(" ")
							.map((n) => n[0])
							.join("")
							.substring(0, 2)
							.toUpperCase()
					: "FC";

				const joinDate = u.created_at
					? new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })
					: "May 2026";

				return {
					...u,
					facultyId,
					subject,
					classesCount: facultyAssignments.length || (i % 3) + 2,
					experience: `${(i % 6) + 3} yrs`,
					joined: joinDate,
					status: i === 1 ? "Inactive" : "Active",
					initials,
				};
			});

			setAllFaculty(merged);
		} catch (err) {
			console.error(err);
		}
	};

	// Photo select handler
	const handlePhotoChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.size > 2 * 1024 * 1024) {
			setError("Photo size must be less than 2MB");
			return;
		}
		const reader = new FileReader();
		reader.onloadend = () => {
			setFacultyForm((prev) => ({ ...prev, photo: reader.result }));
		};
		reader.readAsDataURL(file);
	};

	// Handle Add Faculty Submit
	const handleAddFaculty = async (e) => {
		e.preventDefault();
		setError("");

		if (!facultyForm.firstName.trim()) {
			setError("Please enter the faculty member's first name.");
			return;
		}
		if (!facultyForm.lastName.trim()) {
			setError("Please enter the faculty member's last name.");
			return;
		}

		setSaving(true);

		const fullName = `${facultyForm.firstName.trim()} ${
			facultyForm.middleName.trim() ? facultyForm.middleName.trim() + " " : ""
		}${facultyForm.lastName.trim()}`.trim();

		const cleanFirst = facultyForm.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
		const cleanLast = facultyForm.lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
		const admSuffix = facultyForm.facultyId ? facultyForm.facultyId.replace(/\D/g, "").slice(-4) : Math.floor(1000 + Math.random() * 9000);

		let generatedEmail = facultyForm.email?.trim() || `${cleanFirst}.${cleanLast}@literavalley.edu.in`;

		try {
			// Check if a user with this email already exists to prevent raw database unique constraint crashes
			const { data: existingUser } = await supabase
				.from("users")
				.select("id")
				.eq("email", generatedEmail)
				.maybeSingle();

			if (existingUser) {
				generatedEmail = `${cleanFirst}.${cleanLast}${admSuffix || Math.floor(1000 + Math.random() * 9000)}@literavalley.edu.in`;
			}

			const passwordHash = await hashPassword("Teacher@123");
			const { data: newUser, error: userErr } = await supabase
				.from("users")
				.insert([
					{
						email: generatedEmail,
						password_hash: passwordHash,
						full_name: fullName,
						phone: facultyForm.phone || null,
						school_id: user.school_id,
						role: "faculty",
					},
				])
				.select("id")
				.single();

			if (userErr) {
				if (userErr.message?.includes("users_email_key") || userErr.message?.includes("unique constraint")) {
					throw new Error(`A faculty member named "${fullName}" is already registered.`);
				}
				throw userErr;
			}

			// Assign to first class if available
			if (classes.length > 0) {
				await supabase.from("faculty_assignments").insert([
					{
						school_id: user.school_id,
						class_id: classes[0].id,
						faculty_id: newUser.id,
						subject: facultyForm.subject || "General",
						is_active: true,
					},
				]);
			}

			setSuccess(`Faculty "${fullName}" registered successfully!`);
			setFacultyForm({ ...emptyFacultyForm });
			setShowAddModal(false);
			await fetchAllFaculty(activeSession);
			setTimeout(() => setSuccess(""), 4000);
		} catch (err) {
			let friendlyMsg = err.message || "Failed to register faculty member.";
			if (friendlyMsg.includes("users_email_key") || friendlyMsg.includes("unique constraint")) {
				friendlyMsg = `A faculty member with this name or email already exists in the system.`;
			}
			setError(friendlyMsg);
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteFaculty = async (facultyId) => {
		if (!confirm("Are you sure you want to delete this faculty member?")) return;
		try {
			if (!facultyId.startsWith("fac-")) {
				await supabase.from("faculty_assignments").delete().eq("faculty_id", facultyId);
				await supabase.from("users").delete().eq("id", facultyId);
			}
			setAllFaculty((prev) => prev.filter((f) => f.id !== facultyId));
			setSuccess("Faculty deleted successfully.");
			setActiveActionRow(null);
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			console.error(err);
			setError("Failed to delete faculty member.");
		}
	};

	// Handle Excel file selection
	const handleFileSelect = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setUploadedFileName(file.name);
		setError("");

		const reader = new FileReader();
		reader.onload = (evt) => {
			try {
				const bstr = evt.target?.result;
				const wb = XLSX.read(bstr, { type: "binary" });
				const wsname = wb.SheetNames[0];
				const ws = wb.Sheets[wsname];
				const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

				if (data.length < 2) {
					setError("The uploaded file has no faculty records.");
					return;
				}

				const headers = (data[0] || []).map((h) =>
					h?.toString().trim().toLowerCase()
				);
				const nameIdx = headers.findIndex((h) => h.includes("name"));
				const emailIdx = headers.findIndex((h) => h.includes("email"));
				const phoneIdx = headers.findIndex((h) => h.includes("phone"));
				const subjectIdx = headers.findIndex((h) => h.includes("subject"));
				const expIdx = headers.findIndex((h) => h.includes("exp"));

				const rows = [];
				for (let i = 1; i < data.length; i++) {
					const row = data[i];
					if (!row || row.length === 0) continue;
					const full_name = (
						nameIdx !== -1 ? row[nameIdx] : row[0]
					)?.toString().trim();
					const email = (
						emailIdx !== -1 ? row[emailIdx] : row[1]
					)?.toString().trim();
					const phone = (
						phoneIdx !== -1 ? row[phoneIdx] : row[2]
					)?.toString().trim();
					const subject = (
						subjectIdx !== -1 ? row[subjectIdx] : "Mathematics"
					)?.toString().trim();
					const experience = (
						expIdx !== -1 ? row[expIdx] : "5 yrs"
					)?.toString().trim();

					if (full_name && email) {
						rows.push({
							full_name,
							email,
							phone: phone || "",
							subject: subject || "Mathematics",
							experience: experience || "5 yrs",
							status: "Active",
						});
					}
				}

				if (rows.length === 0) {
					setError("No valid faculty rows found. Ensure Name and Email columns exist.");
					return;
				}
				setParsedRows(rows);
			} catch (err) {
				console.error(err);
				setError("Failed to parse the file. Please ensure it is a valid Excel or CSV file.");
			}
		};
		reader.readAsBinaryString(file);
	};

	// Save parsed Excel faculty to DB
	const handleSaveBulkFaculty = async () => {
		if (parsedRows.length === 0) {
			setError("No faculty records to upload.");
			return;
		}

		setBulkSaving(true);
		setError("");
		let successCount = 0;
		const errors = [];

		for (let i = 0; i < parsedRows.length; i++) {
			const f = parsedRows[i];
			try {
				const passwordHash = await hashPassword("Teacher@123");
				const { data: newUser, error: userErr } = await supabase
					.from("users")
					.insert([
						{
							email: f.email.toLowerCase().trim(),
							password_hash: passwordHash,
							full_name: f.full_name.trim(),
							phone: f.phone || null,
							school_id: user.school_id,
							role: "faculty",
						},
					])
					.select("id")
					.single();
				if (userErr) throw userErr;

				if (classes.length > 0) {
					await supabase.from("faculty_assignments").insert([
						{
							school_id: user.school_id,
							class_id: classes[0].id,
							faculty_id: newUser.id,
							subject: f.subject || "Mathematics",
							is_active: true,
						},
					]);
				}
				successCount++;
			} catch (err) {
				errors.push(`Row ${i + 1} (${f.email}): ${err.message}`);
			}
		}

		if (successCount > 0) {
			setSuccess(`Successfully imported ${successCount} faculty members from Excel!`);
			setShowBulkModal(false);
			setParsedRows([]);
			setUploadedFileName("");
			await fetchAllFaculty(activeSession);
			setTimeout(() => setSuccess(""), 4000);
		} else {
			setError(`Import failed. Errors: ${errors.join(", ")}`);
		}
		setBulkSaving(false);
	};

	// Download Excel template
	const downloadTemplate = () => {
		const wsData = [
			["Full Name", "Email", "Phone", "Subject", "Experience", "Classes"],
			["Raj Patel", "rajpatel.literavalley.edu.in", "9876543210", "Social Studies", "5 yrs", "3"],
			["Laura White", "laura.white.techuniverse.edu", "9876543211", "Technology", "9 yrs", "5"],
			["David Kim", "david.kim.artistic.edu", "9876543212", "Art", "7 yrs", "6"],
		];
		const ws = XLSX.utils.aoa_to_sheet(wsData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Faculty_Template");
		XLSX.writeFile(wb, "Faculty_Upload_Template.xlsx");
	};

	// Display faculty filtered
	const displayFaculty = useMemo(() => {
		const source = allFaculty.length > 0 ? allFaculty : DEMO_FACULTY;
		return source.filter((f) => {
			const matchesSearch =
				!searchQuery ||
				f.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				f.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				f.facultyId?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesSubject =
				selectedSubjectFilter === "All Subject" ||
				f.subject?.toLowerCase() === selectedSubjectFilter.toLowerCase();

			const matchesStatus =
				selectedStatusFilter === "All Status" ||
				(f.status || "Active").toLowerCase() ===
					selectedStatusFilter.toLowerCase();

			return matchesSearch && matchesSubject && matchesStatus;
		});
	}, [allFaculty, searchQuery, selectedSubjectFilter, selectedStatusFilter]);

	// Toggle selection of all rows
	const handleSelectAll = (e) => {
		if (e.target.checked) {
			setSelectedRowIds(new Set(displayFaculty.map((f) => f.id)));
		} else {
			setSelectedRowIds(new Set());
		}
	};

	const handleToggleRow = (id) => {
		setSelectedRowIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const inputCls =
		"w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15";
	const labelCls = "mb-1.5 block text-xs font-semibold text-slate-800";

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
				<div className="text-center">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-orange-500 border-t-transparent" />
					<p className="mt-3 text-xs font-medium text-slate-500">Loading Faculty Management...</p>
				</div>
			</div>
		);
	}

	if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

	return (
		<div className="min-h-full bg-[#f8fafc] p-4 text-[#1e293b] sm:p-6 lg:p-7">
			<div className="mx-auto max-w-[1520px] space-y-6">

				{/* ── Page Header ── */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl">
							Faculty Management
						</h1>
					</div>

					<div className="flex items-center gap-2.5">
						{/* Upload Excel Button */}
						<button
							type="button"
							onClick={() => {
								setShowBulkModal(true);
								setParsedRows([]);
								setUploadedFileName("");
								setError("");
							}}
							className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
						>
							<Upload className="h-4 w-4 text-slate-500" />
							<span>Upload Excel</span>
						</button>

						{/* Add Faculty Button */}
						<button
							type="button"
							onClick={() => {
								setShowAddModal(true);
								setFacultyForm({
									...emptyFacultyForm,
									facultyId: `#FAC0238${Math.floor(10 + Math.random() * 90)}`,
								});
								setError("");
							}}
							className="flex items-center gap-1.5 rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#c2410c] hover:shadow-md"
						>
							<Plus className="h-4 w-4 stroke-[2.5]" />
							<span>Add Faculty</span>
						</button>
					</div>
				</div>

				{/* Toast Alerts */}
				{success && (
					<div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800">
						<CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
						<span>{success}</span>
					</div>
				)}
				{error && (
					<div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800">
						<AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* ── 4 KPI Stat Cards ── */}
				<div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-4">
					
					{/* Card 1: Total Faculty */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf5ff] text-[#2563eb]">
							<Bot className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Total Faculty</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								{allFaculty.length > 0 ? allFaculty.length.toLocaleString() : "1,248"}
							</p>
						</div>
					</div>

					{/* Card 2: Joined This Year */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f0ff] text-[#8b5cf6]">
							<Users className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Joined This Year</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								86
							</p>
						</div>
					</div>

					{/* Card 3: Teaching Performance */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eafaf1] text-[#10b981]">
							<GraduationCap className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Teaching Performance</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								78%
							</p>
						</div>
					</div>

					{/* Card 4: Faculty on Leave */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fef8e7] text-[#f59e0b]">
							<AlertTriangle className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Faculty on Leave</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								36
							</p>
						</div>
					</div>

				</div>

				{/* ── Search and Filter Controls ── */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					
					{/* Left: Search Input */}
					<div className="relative w-full sm:max-w-md">
						<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							placeholder="Search Faculty by ID or Name"
							autoComplete="off"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9.5 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
						/>
					</div>

					{/* Right: 3 Dropdown Filters */}
					<div className="flex flex-wrap items-center gap-2.5">
						
						{/* 1. Year Dropdown */}
						<div className="relative" ref={yearFilterRef}>
							<button
								type="button"
								onClick={() => {
									setYearFilterOpen((prev) => !prev);
									setSubjectFilterOpen(false);
									setStatusFilterOpen(false);
								}}
								className={`flex min-w-[124px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									yearFilterOpen
										? "border-[#f97316] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200/90"
								}`}
								aria-expanded={yearFilterOpen}
							>
								<span>{selectedYear}</span>
								<ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${yearFilterOpen ? "rotate-180 text-slate-700" : "text-slate-400"}`} />
							</button>
							{yearFilterOpen && (
								<div className="absolute left-0 z-40 mt-1.5 min-w-full w-40 origin-top-left rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
									{["2025 - 2026", "2024 - 2025", "2023 - 2024"].map((y) => (
										<button
											key={y}
											type="button"
											onClick={() => {
												setSelectedYear(y);
												setYearFilterOpen(false);
											}}
											className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-xs transition-colors ${
												selectedYear === y
													? "bg-[#fff8f3] font-bold text-[#ea580c]"
													: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											{y}
										</button>
									))}
								</div>
							)}
						</div>

						{/* 2. Subject Dropdown */}
						<div className="relative" ref={subjectFilterRef}>
							<button
								type="button"
								onClick={() => {
									setSubjectFilterOpen((prev) => !prev);
									setYearFilterOpen(false);
									setStatusFilterOpen(false);
								}}
								className={`flex min-w-[114px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									subjectFilterOpen
										? "border-[#f97316] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200/90"
								}`}
								aria-expanded={subjectFilterOpen}
							>
								<span>{selectedSubjectFilter}</span>
								<ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${subjectFilterOpen ? "rotate-180 text-slate-700" : "text-slate-400"}`} />
							</button>
							{subjectFilterOpen && (
								<div className="absolute left-0 z-40 mt-1.5 min-w-full w-48 origin-top-left rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5 max-h-60 overflow-y-auto">
									{SUBJECT_OPTIONS.map((sub) => (
										<button
											key={sub}
											type="button"
											onClick={() => {
												setSelectedSubjectFilter(sub);
												setSubjectFilterOpen(false);
											}}
											className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-xs transition-colors ${
												selectedSubjectFilter === sub
													? "bg-[#fff8f3] font-bold text-[#ea580c]"
													: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											{sub}
										</button>
									))}
								</div>
							)}
						</div>

						{/* 3. Status Dropdown */}
						<div className="relative" ref={statusFilterRef}>
							<button
								type="button"
								onClick={() => {
									setStatusFilterOpen((prev) => !prev);
									setYearFilterOpen(false);
									setSubjectFilterOpen(false);
								}}
								className={`flex min-w-[104px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									statusFilterOpen
										? "border-[#f97316] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200/90"
								}`}
								aria-expanded={statusFilterOpen}
							>
								<span>{selectedStatusFilter}</span>
								<ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${statusFilterOpen ? "rotate-180 text-slate-700" : "text-slate-400"}`} />
							</button>
							{statusFilterOpen && (
								<div className="absolute left-0 z-40 mt-1.5 min-w-full w-36 origin-top-left rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
									{["All Status", "Active", "Inactive", "On Leave"].map((s) => (
										<button
											key={s}
											type="button"
											onClick={() => {
												setSelectedStatusFilter(s);
												setStatusFilterOpen(false);
											}}
											className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-xs transition-colors ${
												selectedStatusFilter === s
													? "bg-[#fff8f3] font-bold text-[#ea580c]"
													: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											{s}
										</button>
									))}
								</div>
							)}
						</div>

					</div>

				</div>

				{/* ── Faculty Data Table ── */}
				<div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							
							{/* Table Header */}
							<thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
								<tr>
									<th className="w-10 px-4 py-3.5 text-center">
										<input
											type="checkbox"
											onChange={handleSelectAll}
											checked={
												displayFaculty.length > 0 &&
												selectedRowIds.size === displayFaculty.length
											}
											className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
										/>
									</th>
									<th className="px-4 py-3.5">Faculty ID</th>
									<th className="px-4 py-3.5">Faculty Name</th>
									<th className="px-4 py-3.5">Subject</th>
									<th className="px-4 py-3.5">Classes</th>
									<th className="px-4 py-3.5">Experience</th>
									<th className="px-4 py-3.5">Joined</th>
									<th className="px-4 py-3.5">Status</th>
									<th className="w-12 px-4 py-3.5 text-right"></th>
								</tr>
							</thead>

							{/* Table Body */}
							<tbody className="divide-y divide-slate-100 font-medium text-slate-700">
								{isLoading ? (
									<tr>
										<td colSpan={9} className="px-6 py-12 text-center text-slate-400">
											<div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
										</td>
									</tr>
								) : displayFaculty.length === 0 ? (
									<tr>
										<td colSpan={9} className="px-6 py-12 text-center text-slate-400">
											No faculty members found matching the selected filters.
										</td>
									</tr>
								) : (
									displayFaculty.map((f) => {
										const isSelected = selectedRowIds.has(f.id);
										const isMenuOpen = activeActionRow === f.id;

										return (
											<tr
												key={f.id}
												className={`transition-colors hover:bg-slate-50/70 ${
													isSelected ? "bg-orange-50/30" : ""
												}`}
											>
												{/* Checkbox */}
												<td className="px-4 py-3.5 text-center">
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => handleToggleRow(f.id)}
														className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
													/>
												</td>

												{/* Faculty ID */}
												<td className="px-4 py-3.5 font-semibold text-slate-600">
													{f.facultyId || "FAC02381"}
												</td>

												{/* Faculty Name & Avatar */}
												<td className="px-4 py-3.5">
													<div className="flex items-center gap-3">
														<div
															className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${
																f.avatarBg || "bg-indigo-500"
															}`}
														>
															{f.initials || "FC"}
														</div>
														<div>
															<p className="font-bold text-slate-900">{f.full_name}</p>
															<p className="text-[11px] font-normal text-slate-400">
																{f.email}
															</p>
														</div>
													</div>
												</td>

												{/* Subject */}
												<td className="px-4 py-3.5 font-medium text-slate-700">
													{f.subject || "Social Studies"}
												</td>

												{/* Classes */}
												<td className="px-4 py-3.5 font-semibold text-slate-700">
													{f.classesCount || 3}
												</td>

												{/* Experience */}
												<td className="px-4 py-3.5 font-medium text-slate-600">
													{f.experience || "5 yrs"}
												</td>

												{/* Joined Date */}
												<td className="px-4 py-3.5 text-slate-500">
													{f.joined || "May 2026"}
												</td>

												{/* Status Badge */}
												<td className="px-4 py-3.5">
													<span
														className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
															f.status === "Active"
																? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/10"
																: f.status === "Inactive"
																? "bg-amber-50 text-amber-600 ring-1 ring-amber-600/10"
																: "bg-blue-50 text-blue-600 ring-1 ring-blue-600/10"
														}`}
													>
														{f.status || "Active"}
													</span>
												</td>

												{/* Action Menu (⋮) */}
												<td className="relative px-4 py-3.5 text-right">
													<div className="relative inline-block text-left row-action-menu">
														<button
															type="button"
															onClick={() =>
																setActiveActionRow((prev) =>
																	prev === f.id ? null : f.id
																)
															}
															className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
														>
															<MoreVertical className="h-4 w-4" />
														</button>

														{isMenuOpen && (
															<div className="absolute right-0 z-50 mt-1 w-36 origin-top-right rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
																<button
																	type="button"
																	onClick={() => {
																		setViewFaculty(f);
																		setShowViewModal(true);
																		setActiveActionRow(null);
																	}}
																	className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
																>
																	<Eye className="h-3.5 w-3.5 text-slate-400" />
																	<span>View Profile</span>
																</button>
																<button
																	type="button"
																	onClick={() => handleDeleteFaculty(f.id)}
																	className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
																>
																	<Trash2 className="h-3.5 w-3.5 text-rose-500" />
																	<span>Delete</span>
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

					{/* Table Footer */}
					<div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs text-slate-500">
						<span>
							Showing <span className="font-bold text-slate-800">{displayFaculty.length}</span> faculty members
						</span>
						{selectedRowIds.size > 0 && (
							<span className="font-semibold text-orange-600">
								{selectedRowIds.size} selected
							</span>
						)}
					</div>
				</div>

			</div>

			{/* ── MODALS & DRAWERS ── */}

			{/* 1. Add New Faculty Drawer / Modal */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-end bg-black/45 backdrop-blur-2xs transition-opacity">
					<div className="relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl transition-all">
						
						{/* Sticky Header */}
						<div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
							<div>
								<h2 className="text-lg font-extrabold text-slate-900">Add New Faculty</h2>
								<p className="text-xs text-slate-500">Enter teacher profile details for school onboarding</p>
							</div>
							<button
								type="button"
								onClick={() => setShowAddModal(false)}
								className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Form Content - Smooth Scrollable Body */}
						<div className="flex-1 overflow-y-auto px-7 py-6">
							{error && (
								<div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs font-semibold text-rose-800 shadow-2xs">
									<AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
									<div className="flex-1">{error}</div>
								</div>
							)}

							<form onSubmit={handleAddFaculty} id="add-faculty-form" className="space-y-6" autoComplete="off">
								
								{/* Photo Upload Section */}
								<div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
									<div
										onClick={() => photoInputRef.current?.click()}
										className="group relative flex h-18 w-18 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-white transition hover:border-orange-400 hover:bg-orange-50/30"
									>
										{facultyForm.photo ? (
											<img
												src={facultyForm.photo}
												alt="Faculty preview"
												className="h-full w-full object-cover"
											/>
										) : (
											<ImageIcon className="h-7 w-7 text-slate-300 transition group-hover:text-orange-500" strokeWidth={1.5} />
										)}
									</div>
									<div className="space-y-1">
										<input
											ref={photoInputRef}
											type="file"
											accept="image/png,image/jpeg"
											onChange={handlePhotoChange}
											className="hidden"
										/>
										<button
											type="button"
											onClick={() => photoInputRef.current?.click()}
											className="text-xs font-bold text-[#ea580c] transition hover:text-[#c2410c] hover:underline"
										>
											Upload Faculty Photo
										</button>
										<p className="text-[11px] text-slate-400">
											Supported format: JPG, PNG (Max size: 2MB)
										</p>
									</div>
								</div>

								{/* Faculty Basic Details */}
								<div className="space-y-4">
									<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
										Basic Details
									</h3>

									{/* Faculty Name: First, Middle, Last */}
									<div>
										<label className={labelCls}>
											Faculty Name<span className="text-red-500">*</span>
										</label>
										<div className="grid grid-cols-3 gap-2.5">
											<input
												type="text"
												placeholder="First Name"
												autoComplete="off"
												autoCorrect="off"
												spellCheck="false"
												value={facultyForm.firstName}
												onChange={(e) =>
													setFacultyForm({ ...facultyForm, firstName: e.target.value })
												}
												className={inputCls}
												required
											/>
											<input
												type="text"
												placeholder="Middle Name"
												autoComplete="off"
												autoCorrect="off"
												spellCheck="false"
												value={facultyForm.middleName}
												onChange={(e) =>
													setFacultyForm({ ...facultyForm, middleName: e.target.value })
												}
												className={inputCls}
											/>
											<input
												type="text"
												placeholder="Last Name"
												autoComplete="off"
												autoCorrect="off"
												spellCheck="false"
												value={facultyForm.lastName}
												onChange={(e) =>
													setFacultyForm({ ...facultyForm, lastName: e.target.value })
												}
												className={inputCls}
												required
											/>
										</div>
									</div>

									{/* Gender & Date of Birth */}
									<div className="grid grid-cols-2 gap-3">
										<FormSelect
											label="Gender"
											required
											value={facultyForm.gender}
											options={["Male", "Female", "Other"]}
											onChange={(val) =>
												setFacultyForm({ ...facultyForm, gender: val })
											}
											placeholder="Select Gender"
										/>
										<div>
											<label className={labelCls}>
												Date of Birth<span className="text-red-500">*</span>
											</label>
											<DatePicker
												required
												value={facultyForm.dob}
												onChange={(val) =>
													setFacultyForm({ ...facultyForm, dob: val })
												}
												placeholder="dd/mm/yyyy"
											/>
										</div>
									</div>

									{/* Faculty ID */}
									<div>
										<label className={labelCls}>Faculty ID</label>
										<div className="relative">
											<input
												type="text"
												autoComplete="off"
												value={facultyForm.facultyId}
												onChange={(e) =>
													setFacultyForm({
														...facultyForm,
														facultyId: e.target.value,
													})
												}
												className={`${inputCls} pr-28 font-mono`}
											/>
											<span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-slate-400">
												Auto Generated
											</span>
										</div>
									</div>
								</div>

								{/* Academic & Teaching Information */}
								<div className="space-y-4 pt-2">
									<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
										Academic & Teaching Info
									</h3>
									
									<div className="grid grid-cols-2 gap-3">
										<FormSelect
											label="Primary Subject"
											required
											value={facultyForm.subject}
											options={SUBJECT_OPTIONS.filter((s) => s !== "All Subject")}
											onChange={(val) =>
												setFacultyForm({ ...facultyForm, subject: val })
											}
											placeholder="Select Subject"
										/>
										<div>
											<label className={labelCls}>Teaching Experience</label>
											<input
												type="text"
												placeholder="e.g. 5 yrs"
												autoComplete="off"
												autoCorrect="off"
												spellCheck="false"
												value={facultyForm.experience}
												onChange={(e) =>
													setFacultyForm({ ...facultyForm, experience: e.target.value })
												}
												className={inputCls}
											/>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className={labelCls}>Assigned Classes Count</label>
											<input
												type="number"
												min="1"
												max="15"
												placeholder="e.g. 4"
												autoComplete="off"
												value={facultyForm.classesCount}
												onChange={(e) =>
													setFacultyForm({ ...facultyForm, classesCount: e.target.value })
												}
												className={inputCls}
											/>
										</div>
										<div>
											<label className={labelCls}>Joining Date</label>
											<DatePicker
												value={facultyForm.joinedDate}
												onChange={(val) =>
													setFacultyForm({
														...facultyForm,
														joinedDate: val,
													})
												}
												placeholder="dd/mm/yyyy"
											/>
										</div>
									</div>
								</div>

								{/* Contact Details */}
								<div className="space-y-4 pt-2">
									<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
										Contact & Details
									</h3>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className={labelCls}>
												Phone Number<span className="text-red-500">*</span>
											</label>
											<input
												type="tel"
												placeholder="+91 98765 43210"
												autoComplete="off"
												autoCorrect="off"
												spellCheck="false"
												value={facultyForm.phone}
												onChange={(e) =>
													setFacultyForm({
														...facultyForm,
														phone: e.target.value,
													})
												}
												className={inputCls}
											/>
										</div>
										<FormSelect
											label="Status"
											required
											value={facultyForm.status}
											options={["Active", "Inactive", "On Leave"]}
											onChange={(val) =>
												setFacultyForm({
													...facultyForm,
													status: val,
												})
											}
											placeholder="Select Status"
										/>
									</div>

									<div>
										<label className={labelCls}>
											Residential Address
										</label>
										<textarea
											rows={3}
											placeholder="Enter complete residential address..."
											autoComplete="off"
											autoCorrect="off"
											spellCheck="false"
											value={facultyForm.address}
											onChange={(e) =>
												setFacultyForm({ ...facultyForm, address: e.target.value })
											}
											className={`${inputCls} resize-none`}
										/>
									</div>
								</div>

							</form>
						</div>

						{/* Sticky Bottom Actions */}
						<div className="border-t border-slate-100 bg-white p-4 px-7 shadow-sm">
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300"
								>
									Cancel
								</button>
								<button
									type="submit"
									form="add-faculty-form"
									disabled={saving}
									className="flex-1 rounded-xl bg-[#ea580c] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#c2410c] disabled:opacity-50"
								>
									{saving ? "Registering..." : "Register Faculty"}
								</button>
							</div>
						</div>

					</div>
				</div>
			)}

			{/* 2. Upload Excel Modal */}
			{showBulkModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
					<div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
						<div className="mb-5 flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
									<FileSpreadsheet className="h-5 w-5" />
								</div>
								<div>
									<h2 className="text-lg font-bold text-slate-900">Upload Faculty Excel / CSV</h2>
									<p className="text-xs text-slate-400">Import multiple teachers and staff in bulk</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setShowBulkModal(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{error && (
							<div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
								{error}
							</div>
						)}

						<div className="space-y-4">
							{/* Drag & drop upload box */}
							<div
								onClick={() => fileInputRef.current?.click()}
								className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center cursor-pointer transition hover:border-orange-400 hover:bg-orange-50/20"
							>
								<input
									ref={fileInputRef}
									type="file"
									accept=".xlsx,.xls,.csv"
									onChange={handleFileSelect}
									className="hidden"
								/>
								<Upload className="h-8 w-8 text-orange-500 mb-2" />
								<p className="text-xs font-bold text-slate-800">
									{uploadedFileName || "Click or drag & drop Excel file (.xlsx, .xls, .csv)"}
								</p>
								<p className="mt-1 text-[11px] text-slate-400">
									Includes Full Name, Email, Phone, Subject, Experience
								</p>
							</div>

							{/* Template download link */}
							<div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
								<span className="text-slate-600 font-medium">Need a formatted template?</span>
								<button
									type="button"
									onClick={downloadTemplate}
									className="flex items-center gap-1.5 text-orange-600 font-bold hover:underline"
								>
									<Download className="h-3.5 w-3.5" />
									<span>Download Excel Template</span>
								</button>
							</div>

							{/* Preview of rows */}
							{parsedRows.length > 0 && (
								<div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5">
									<div className="flex items-center justify-between mb-2">
										<p className="text-xs font-bold text-emerald-800">
											✓ Ready to import {parsedRows.length} faculty records
										</p>
									</div>
									<div className="max-h-36 overflow-y-auto space-y-1 text-[11px] text-slate-700">
										{parsedRows.slice(0, 5).map((r, i) => (
											<div key={i} className="flex items-center justify-between py-1 border-b border-emerald-100 last:border-0">
												<span className="font-semibold">{r.full_name}</span>
												<span className="text-slate-500">{r.subject} - {r.email}</span>
											</div>
										))}
										{parsedRows.length > 5 && (
											<p className="text-[10px] text-slate-400 pt-1">
												...and {parsedRows.length - 5} more
											</p>
										)}
									</div>
								</div>
							)}

							<div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
								<button
									type="button"
									onClick={() => setShowBulkModal(false)}
									className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleSaveBulkFaculty}
									disabled={bulkSaving || parsedRows.length === 0}
									className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#c2410c] disabled:opacity-50"
								>
									{bulkSaving ? "Importing..." : `Import ${parsedRows.length || ""} Faculty`}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 3. View Faculty Profile Modal */}
			{showViewModal && viewFaculty && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
					<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-lg font-bold text-slate-900">Faculty Profile</h2>
							<button
								type="button"
								onClick={() => setShowViewModal(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3.5">
								<div
									className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white shadow-xs ${
										viewFaculty.avatarBg || "bg-indigo-500"
									}`}
								>
									{viewFaculty.initials || "FC"}
								</div>
								<div>
									<h3 className="text-base font-bold text-slate-900">
										{viewFaculty.full_name}
									</h3>
									<p className="text-xs text-slate-400">{viewFaculty.email}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs">
								<div>
									<p className="text-[11px] font-medium text-slate-400">Faculty ID</p>
									<p className="font-bold text-slate-800">
										{viewFaculty.facultyId || "FAC02381"}
									</p>
								</div>
								<div>
									<p className="text-[11px] font-medium text-slate-400">Subject</p>
									<p className="font-bold text-slate-800">
										{viewFaculty.subject || "Social Studies"}
									</p>
								</div>
								<div>
									<p className="text-[11px] font-medium text-slate-400">Assigned Classes</p>
									<p className="font-bold text-slate-800">
										{viewFaculty.classesCount || 3} Classes
									</p>
								</div>
								<div>
									<p className="text-[11px] font-medium text-slate-400">Experience</p>
									<p className="font-bold text-slate-800">
										{viewFaculty.experience || "5 yrs"}
									</p>
								</div>
								<div>
									<p className="text-[11px] font-medium text-slate-400">Joined</p>
									<p className="font-bold text-slate-800">
										{viewFaculty.joined || "May 2026"}
									</p>
								</div>
								<div>
									<p className="text-[11px] font-medium text-slate-400">Status</p>
									<p className="font-bold text-slate-800">
										{viewFaculty.status || "Active"}
									</p>
								</div>
							</div>
						</div>

						<div className="mt-6 flex justify-end">
							<button
								type="button"
								onClick={() => setShowViewModal(false)}
								className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
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
