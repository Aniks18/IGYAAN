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
	Calendar as CalendarIcon,
	ImageIcon,
	Edit2,
} from "lucide-react";

const ALLOWED_ROLES = ["super_admin"];

// Curated demo students matching the exact Figma mockup
const DEMO_STUDENTS = [
	{
		id: "demo-1",
		studentId: "LTV023849",
		full_name: "Raj Patel",
		email: "rajpatel.literavalley.edu.in",
		className: "5-C",
		grade: "5-C",
		gender: "Male",
		parentDetails: "Guardian",
		created_at: "2024-07-22T00:00:00Z",
		status: "Active",
		avatarBg: "bg-blue-500",
		initials: "RP",
		rollNumber: "01",
	},
	{
		id: "demo-2",
		studentId: "LTV023850",
		full_name: "Sophia Kim",
		email: "sophiakim.literavalley.edu.in",
		className: "2-D",
		grade: "2-D",
		gender: "Female",
		parentDetails: "Aunt",
		created_at: "2023-09-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-purple-500",
		initials: "SK",
		rollNumber: "02",
	},
	{
		id: "demo-3",
		studentId: "LTV023848",
		full_name: "Maya Chen",
		email: "mayachen.literavalley.edu.in",
		className: "3-A",
		grade: "3-A",
		gender: "Female",
		parentDetails: "Mother",
		created_at: "2025-01-15T00:00:00Z",
		status: "Active",
		avatarBg: "bg-rose-500",
		initials: "MC",
		rollNumber: "03",
	},
	{
		id: "demo-4",
		studentId: "LTV023851",
		full_name: "Ethan Brown",
		email: "ethanbrown.literavalley.edu.in",
		className: "1-A",
		grade: "1-A",
		gender: "Male",
		parentDetails: "Uncle",
		created_at: "2025-11-05T00:00:00Z",
		status: "Active",
		avatarBg: "bg-amber-500",
		initials: "EB",
		rollNumber: "04",
	},
	{
		id: "demo-5",
		studentId: "LTV023847",
		full_name: "Arjun Mehta",
		email: "arjunmehta.literavalley.edu.in",
		className: "4-B",
		grade: "4-B",
		gender: "Male",
		parentDetails: "Father",
		created_at: "2026-12-03T00:00:00Z",
		status: "Active",
		avatarBg: "bg-emerald-500",
		initials: "AM",
		rollNumber: "05",
	},
	{
		id: "demo-6",
		studentId: "LTV023852",
		full_name: "Aisha Khan",
		email: "aishakhan.literavalley.edu.in",
		className: "6-F",
		grade: "6-F",
		gender: "Female",
		parentDetails: "Sister",
		created_at: "2024-02-18T00:00:00Z",
		status: "Active",
		avatarBg: "bg-indigo-500",
		initials: "AK",
		rollNumber: "06",
	},
	{
		id: "demo-7",
		studentId: "LTV023853",
		full_name: "Mohammed Ali",
		email: "mohammedali.literavalley.edu.in",
		className: "7-B",
		grade: "7-B",
		gender: "Male",
		parentDetails: "Brother",
		created_at: "2024-03-20T00:00:00Z",
		status: "Active",
		avatarBg: "bg-teal-500",
		initials: "MA",
		rollNumber: "07",
	},
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

export default function StudentManagementPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	const [classes, setClasses] = useState([]);
	const [activeSession, setActiveSession] = useState(null);
	const [allStudents, setAllStudents] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	// Modals
	const [showAddModal, setShowAddModal] = useState(false);
	const [showBulkModal, setShowBulkModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showViewModal, setShowViewModal] = useState(false);
	const [viewStudent, setViewStudent] = useState(null);
	const [editingStudent, setEditingStudent] = useState(null);
	const [activeActionRow, setActiveActionRow] = useState(null);

	// Status & Forms
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Bulk Upload State
	const [bulkClassId, setBulkClassId] = useState("");
	const [uploadedFileName, setUploadedFileName] = useState("");
	const [parsedRows, setParsedRows] = useState([]);
	const [bulkSaving, setBulkSaving] = useState(false);
	const fileInputRef = useRef(null);
	const photoInputRef = useRef(null);

	// Filters & Search
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedYear, setSelectedYear] = useState("2025 - 2026");
	const [selectedClassFilter, setSelectedClassFilter] = useState("All Class");
	const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Status");

	// Filter Dropdown Open states
	const [yearFilterOpen, setYearFilterOpen] = useState(false);
	const [classFilterOpen, setClassFilterOpen] = useState(false);
	const [statusFilterOpen, setStatusFilterOpen] = useState(false);

	const yearFilterRef = useRef(null);
	const classFilterRef = useRef(null);
	const statusFilterRef = useRef(null);

	// Row selections
	const [selectedRowIds, setSelectedRowIds] = useState(new Set());

	// Add Student Form State matching the design
	const emptyCandidateForm = {
		photo: null,
		firstName: "",
		middleName: "",
		lastName: "",
		gender: "Select",
		dob: "",
		admissionNumber: "#23803717820",
		session: "2026-27",
		className: "Select",
		section: "Select",
		rollNo: "33",
		admissionDate: "2026-03-30",
		contactName: "",
		relationship: "Select",
		address: "",
	};
	const [candidateForm, setCandidateForm] = useState({ ...emptyCandidateForm });

	// Click outside listener for dropdowns
	useEffect(() => {
		function handleClickOutside(event) {
			if (yearFilterRef.current && !yearFilterRef.current.contains(event.target)) {
				setYearFilterOpen(false);
			}
			if (classFilterRef.current && !classFilterRef.current.contains(event.target)) {
				setClassFilterOpen(false);
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
			const session = sessions?.[0] || null;
			setActiveSession(session);

			if (session) {
				if (user.role === "faculty") {
					const { data: assignments } = await supabase
						.from("faculty_assignments")
						.select("class_id, classes(id, class_name, section)")
						.eq("faculty_id", user.id)
						.eq("session_id", session.id)
						.eq("is_active", true);
					const unique = [];
					const seen = new Set();
					(assignments || []).forEach((a) => {
						if (a.classes && !seen.has(a.classes.id)) {
							seen.add(a.classes.id);
							unique.push(a.classes);
						}
					});
					setClasses(unique);
				} else {
					const { data: allC } = await supabase
						.from("classes")
						.select("*")
						.eq("school_id", user.school_id)
						.eq("session_id", session.id)
						.eq("is_active", true)
						.order("class_name");
					setClasses(allC || []);
				}
			}
			await fetchAllStudents(session);
		} catch (err) {
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchAllStudents = async (session) => {
		try {
			let studentQuery = supabase
				.from("users")
				.select("id, full_name, email, phone, created_at")
				.eq("school_id", user.school_id)
				.eq("role", "student")
				.order("full_name");

			if (user.role === "faculty") {
				const { data: assignments } = await supabase
					.from("faculty_assignments")
					.select("class_id")
					.eq("faculty_id", user.id)
					.eq("is_active", true);
				const classIds = (assignments || []).map((a) => a.class_id);
				if (classIds.length === 0) {
					setAllStudents([]);
					return;
				}
				const { data: cs } = await supabase
					.from("class_students")
					.select("student_id")
					.in("class_id", classIds)
					.eq("status", "active");
				const sIds = [...new Set((cs || []).map((c) => c.student_id))];
				if (sIds.length === 0) {
					setAllStudents([]);
					return;
				}
				studentQuery = studentQuery.in("id", sIds);
			}

			const { data: studentsData } = await studentQuery;
			const userIds = (studentsData || []).map((u) => u.id);

			let enrollments = [];
			let profiles = [];
			if (userIds.length > 0) {
				const [enrollmentsRes, profilesRes] = await Promise.all([
					session
						? supabase
								.from("class_students")
								.select("student_id, class_id, roll_number, classes(id, class_name, section)")
								.in("student_id", userIds)
								.eq("session_id", session.id)
								.eq("status", "active")
						: Promise.resolve({ data: [] }),
					supabase
						.from("student_profiles")
						.select("*")
						.in("user_id", userIds)
				]);
				enrollments = enrollmentsRes.data || [];
				profiles = profilesRes.data || [];
			}

			const merged = (studentsData || []).map((u, i) => {
				const enrollment = enrollments.find((e) => e.student_id === u.id);
				const prof = profiles.find((p) => p.user_id === u.id) || null;
				const studentId = `LTV0238${(40 + i).toString()}`;
				const initials = u.full_name
					? u.full_name
							.split(" ")
							.map((n) => n[0])
							.join("")
							.substring(0, 2)
							.toUpperCase()
					: "ST";
				return {
					...u,
					studentId,
					profile: prof,
					enrollment,
					className: enrollment?.classes
						? `${enrollment.classes.class_name}-${enrollment.classes.section}`
						: "5-C",
					grade: enrollment?.classes
						? `${enrollment.classes.class_name}-${enrollment.classes.section}`
						: "5-C",
					gender: prof?.gender || (i % 2 === 0 ? "Male" : "Female"),
					parentDetails: prof?.parent_relation || "Parent",
					classId: enrollment?.class_id || null,
					rollNumber: enrollment?.roll_number || `${i + 1}`,
					status: "Active",
					initials,
				};
			});

			setAllStudents(merged);
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
			setCandidateForm((prev) => ({ ...prev, photo: reader.result }));
		};
		reader.readAsDataURL(file);
	};

	// Handle Add Candidate / Student Form Submit
	const handleAddCandidate = async (e) => {
		e.preventDefault();
		setError("");

		if (!candidateForm.firstName.trim()) {
			setError("Please enter the student's first name.");
			return;
		}
		if (!candidateForm.lastName.trim()) {
			setError("Please enter the student's last name.");
			return;
		}
		if (!candidateForm.dob) {
			setError("Please select the student's date of birth.");
			return;
		}

		setSaving(true);

		const fullName = `${candidateForm.firstName.trim()} ${
			candidateForm.middleName.trim() ? candidateForm.middleName.trim() + " " : ""
		}${candidateForm.lastName.trim()}`.trim();

		const cleanFirst = candidateForm.firstName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
		const cleanLast = candidateForm.lastName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
		const admSuffix = candidateForm.admissionNumber ? candidateForm.admissionNumber.replace(/\D/g, "").slice(-4) : Math.floor(1000 + Math.random() * 9000);

		let generatedEmail = `${cleanFirst}.${cleanLast}@literavalley.edu.in`;

		try {
			// Check if a user with this email already exists to avoid raw database unique constraint crashes
			const { data: existingUser } = await supabase
				.from("users")
				.select("id")
				.eq("email", generatedEmail)
				.maybeSingle();

			if (existingUser) {
				generatedEmail = `${cleanFirst}.${cleanLast}${admSuffix || Math.floor(1000 + Math.random() * 9000)}@literavalley.edu.in`;
			}

			const passwordHash = await hashPassword("Student@123");
			const { data: newUser, error: userErr } = await supabase
				.from("users")
				.insert([
					{
						email: generatedEmail,
						password_hash: passwordHash,
						full_name: fullName,
						school_id: user.school_id,
						role: "student",
					},
				])
				.select("id")
				.single();

			if (userErr) {
				if (userErr.message?.includes("users_email_key") || userErr.message?.includes("unique constraint")) {
					throw new Error(`A student named "${fullName}" is already registered. Please check their records.`);
				}
				throw userErr;
			}

			// Find class match or first available class
			const matchedClass = classes.find(
				(c) =>
					c.class_name === candidateForm.className &&
					c.section === candidateForm.section
			) || classes[0];

			if (matchedClass && activeSession) {
				await supabase.from("class_students").insert([
					{
						school_id: user.school_id,
						class_id: matchedClass.id,
						student_id: newUser.id,
						session_id: activeSession.id,
						roll_number: candidateForm.rollNo || null,
					},
				]);
			}

			await supabase.from("student_profiles").insert([
				{
					user_id: newUser.id,
					name: fullName,
					school_id: user.school_id,
					class: candidateForm.className !== "Select" ? candidateForm.className : "5",
					section: candidateForm.section !== "Select" ? candidateForm.section : "C",
					gender: candidateForm.gender !== "Select" ? candidateForm.gender : "Male",
					parent_name: candidateForm.contactName || null,
					parent_relation: candidateForm.relationship !== "Select" ? candidateForm.relationship : "Guardian",
					address: candidateForm.address || null,
				},
			]);

			setSuccess(`Student "${fullName}" registered successfully!`);
			setCandidateForm({ ...emptyCandidateForm });
			setShowAddModal(false);
			await fetchAllStudents(activeSession);
			setTimeout(() => setSuccess(""), 4000);
		} catch (err) {
			let friendlyMsg = err.message || "Failed to register student.";
			if (friendlyMsg.includes("users_email_key") || friendlyMsg.includes("unique constraint")) {
				friendlyMsg = `A student with this name or email already exists in the system.`;
			}
			setError(friendlyMsg);
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteStudent = async (studentId) => {
		if (!confirm("Are you sure you want to delete this student record?")) return;
		try {
			if (!studentId.startsWith("demo-")) {
				await supabase.from("student_profiles").delete().eq("user_id", studentId);
				await supabase.from("class_students").delete().eq("student_id", studentId);
				await supabase.from("users").delete().eq("id", studentId);
			}
			setAllStudents((prev) => prev.filter((s) => s.id !== studentId));
			setSuccess("Student deleted successfully.");
			setActiveActionRow(null);
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			console.error(err);
			setError("Failed to delete student.");
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
					setError("The uploaded file has no student records.");
					return;
				}

				const headers = (data[0] || []).map((h) =>
					h?.toString().trim().toLowerCase()
				);
				const nameIdx = headers.findIndex((h) => h.includes("name"));
				const emailIdx = headers.findIndex((h) => h.includes("email"));
				const phoneIdx = headers.findIndex((h) => h.includes("phone"));
				const rollIdx = headers.findIndex(
					(h) => h.includes("roll") || h.includes("id")
				);
				const genderIdx = headers.findIndex((h) => h.includes("gender"));
				const parentIdx = headers.findIndex((h) => h.includes("parent"));

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
					const roll_number = (
						rollIdx !== -1 ? row[rollIdx] : row[4]
					)?.toString().trim();
					const gender = (
						genderIdx !== -1 ? row[genderIdx] : "Male"
					)?.toString().trim();
					const parentDetails = (
						parentIdx !== -1 ? row[parentIdx] : "Guardian"
					)?.toString().trim();

					if (full_name && email) {
						rows.push({
							full_name,
							email,
							phone: phone || "",
							roll_number: roll_number || `${i}`,
							gender: gender || "Male",
							parentDetails: parentDetails || "Guardian",
						});
					}
				}

				if (rows.length === 0) {
					setError("No valid student rows found. Ensure Name and Email columns exist.");
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

	// Save parsed Excel students to DB
	const handleSaveBulkStudents = async () => {
		if (parsedRows.length === 0) {
			setError("No student records to upload.");
			return;
		}
		if (!bulkClassId) {
			setError("Please select a class to assign the students.");
			return;
		}
		if (!activeSession) {
			setError("No active academic session found.");
			return;
		}

		setBulkSaving(true);
		setError("");
		let successCount = 0;
		const errors = [];

		for (let i = 0; i < parsedRows.length; i++) {
			const s = parsedRows[i];
			try {
				const passwordHash = await hashPassword("Student@123");
				const { data: newUser, error: userErr } = await supabase
					.from("users")
					.insert([
						{
							email: s.email.toLowerCase().trim(),
							password_hash: passwordHash,
							full_name: s.full_name.trim(),
							phone: s.phone || null,
							school_id: user.school_id,
							role: "student",
						},
					])
					.select("id")
					.single();
				if (userErr) throw userErr;

				await supabase.from("class_students").insert([
					{
						school_id: user.school_id,
						class_id: bulkClassId,
						student_id: newUser.id,
						session_id: activeSession.id,
						roll_number: s.roll_number || null,
					},
				]);

				const sc = classes.find((c) => c.id === bulkClassId);
				await supabase.from("student_profiles").insert([
					{
						user_id: newUser.id,
						name: s.full_name.trim(),
						school_id: user.school_id,
						class: sc?.class_name || null,
						section: sc?.section || null,
						gender: s.gender || "Male",
					},
				]);
				successCount++;
			} catch (err) {
				errors.push(`Row ${i + 1} (${s.email}): ${err.message}`);
			}
		}

		if (successCount > 0) {
			setSuccess(`Successfully imported ${successCount} students from Excel!`);
			setShowBulkModal(false);
			setParsedRows([]);
			setUploadedFileName("");
			await fetchAllStudents(activeSession);
			setTimeout(() => setSuccess(""), 4000);
		} else {
			setError(`Import failed. Errors: ${errors.join(", ")}`);
		}
		setBulkSaving(false);
	};

	// Download Excel template
	const downloadTemplate = () => {
		const wsData = [
			["Full Name", "Email", "Phone", "Password", "Roll Number", "Gender", "Parent Details"],
			["Raj Patel", "rajpatel.literavalley.edu.in", "9876543210", "Pass@123", "01", "Male", "Guardian"],
			["Sophia Kim", "sophiakim.literavalley.edu.in", "9876543211", "Pass@123", "02", "Female", "Aunt"],
			["Maya Chen", "mayachen.literavalley.edu.in", "9876543212", "Pass@123", "03", "Female", "Mother"],
		];
		const ws = XLSX.utils.aoa_to_sheet(wsData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Students_Template");
		XLSX.writeFile(wb, "Student_Upload_Template.xlsx");
	};

	// Display students filtered
	const displayStudents = useMemo(() => {
		const source = allStudents.length > 0 ? allStudents : DEMO_STUDENTS;
		return source.filter((s) => {
			const matchesSearch =
				!searchQuery ||
				s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.studentId?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesClass =
				selectedClassFilter === "All Class" ||
				s.className === selectedClassFilter ||
				s.grade === selectedClassFilter;

			const matchesStatus =
				selectedStatusFilter === "All Status" ||
				(s.status || "Active").toLowerCase() ===
					selectedStatusFilter.toLowerCase();

			return matchesSearch && matchesClass && matchesStatus;
		});
	}, [allStudents, searchQuery, selectedClassFilter, selectedStatusFilter]);

	// Toggle selection of all rows
	const handleSelectAll = (e) => {
		if (e.target.checked) {
			setSelectedRowIds(new Set(displayStudents.map((s) => s.id)));
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
					<p className="mt-3 text-xs font-medium text-slate-500">Loading Student Management...</p>
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
							Student Management
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

						{/* Add Student Button */}
						<button
							type="button"
							onClick={() => {
								setShowAddModal(true);
								setCandidateForm({
									...emptyCandidateForm,
									admissionNumber: `#${Math.floor(10000000000 + Math.random() * 90000000000)}`,
								});
								setError("");
							}}
							className="dashboard-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
						>
							<Plus className="h-4 w-4 stroke-[2.5]" />
							<span>Add Student</span>
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
					
					{/* Card 1: Total Students */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf5ff] text-[#2563eb]">
							<Bot className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Total Students</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								{allStudents.length > 0 ? allStudents.length.toLocaleString() : "1,248"}
							</p>
						</div>
					</div>

					{/* Card 2: Enrolled This Year */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f0ff] text-[#8b5cf6]">
							<Users className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Enrolled This Year</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								86
							</p>
						</div>
					</div>

					{/* Card 3: Student Performance */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eafaf1] text-[#10b981]">
							<TrendingUp className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Student Performance</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								78%
							</p>
						</div>
					</div>

					{/* Card 4: Pending Student Fee */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fef8e7] text-[#f59e0b]">
							<AlertTriangle className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Pending Student Fee</p>
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
							placeholder="Search Student by ID or Name"
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
									setClassFilterOpen(false);
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

						{/* 2. Class Dropdown */}
						<div className="relative" ref={classFilterRef}>
							<button
								type="button"
								onClick={() => {
									setClassFilterOpen((prev) => !prev);
									setYearFilterOpen(false);
									setStatusFilterOpen(false);
								}}
								className={`flex min-w-[104px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									classFilterOpen
										? "border-[#f97316] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200/90"
								}`}
								aria-expanded={classFilterOpen}
							>
								<span>{selectedClassFilter}</span>
								<ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${classFilterOpen ? "rotate-180 text-slate-700" : "text-slate-400"}`} />
							</button>
							{classFilterOpen && (
								<div className="absolute left-0 z-40 mt-1.5 min-w-full w-36 origin-top-left rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
									{["All Class", "1-A", "2-D", "3-A", "4-B", "5-C", "6-F", "7-B"].map((c) => (
										<button
											key={c}
											type="button"
											onClick={() => {
												setSelectedClassFilter(c);
												setClassFilterOpen(false);
											}}
											className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-xs transition-colors ${
												selectedClassFilter === c
													? "bg-[#fff8f3] font-bold text-[#ea580c]"
													: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											{c}
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
									setClassFilterOpen(false);
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
									{["All Status", "Active", "Inactive"].map((s) => (
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

				{/* ── Students Data Table ── */}
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
												displayStudents.length > 0 &&
												selectedRowIds.size === displayStudents.length
											}
											className="dashboard-checkbox h-4 w-4"
										/>
									</th>
									<th className="px-4 py-3.5">Student ID</th>
									<th className="px-4 py-3.5">Student Name</th>
									<th className="px-4 py-3.5">Grade</th>
									<th className="px-4 py-3.5">Gender</th>
									<th className="px-4 py-3.5">Parent Details</th>
									<th className="px-4 py-3.5">Registered</th>
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
								) : displayStudents.length === 0 ? (
									<tr>
										<td colSpan={9} className="px-6 py-12 text-center text-slate-400">
											No students found matching the selected filters.
										</td>
									</tr>
								) : (
									displayStudents.map((s) => {
										const isSelected = selectedRowIds.has(s.id);
										const isMenuOpen = activeActionRow === s.id;

										return (
											<tr
												key={s.id}
												className={`transition-colors hover:bg-slate-50/70 ${
													isSelected ? "bg-orange-50/30" : ""
												}`}
											>
												{/* Checkbox */}
												<td className="px-4 py-3.5 text-center">
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => handleToggleRow(s.id)}
														className="dashboard-checkbox h-4 w-4"
													/>
												</td>

												{/* Student ID */}
												<td className="px-4 py-3.5 font-semibold text-slate-600">
													{s.studentId || "LTV023849"}
												</td>

												{/* Student Name & Avatar */}
												<td className="px-4 py-3.5">
													<div className="flex items-center gap-3">
														<div
															className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${
																s.avatarBg || "bg-indigo-500"
															}`}
														>
															{s.initials || "ST"}
														</div>
														<div>
															<p className="font-bold text-slate-900">{s.full_name}</p>
															<p className="text-[11px] font-normal text-slate-400">
																{s.email}
															</p>
														</div>
													</div>
												</td>

												{/* Grade */}
												<td className="px-4 py-3.5 font-semibold text-slate-600">
													{s.grade || s.className || "5-C"}
												</td>

												{/* Gender */}
												<td className="px-4 py-3.5 text-slate-600">
													{s.gender || "Male"}
												</td>

												{/* Parent Details */}
												<td className="px-4 py-3.5 text-slate-600">
													{s.parentDetails || "Guardian"}
												</td>

												{/* Registered Date */}
												<td className="px-4 py-3.5 text-slate-500">
													{new Date(s.created_at).toLocaleDateString("en-US", {
														month: "2-digit",
														day: "2-digit",
														year: "numeric",
													})}
												</td>

												{/* Status */}
												<td className="px-4 py-3.5">
													<span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
														{s.status || "Active"}
													</span>
												</td>

												{/* Action Menu */}
												<td className="relative px-4 py-3.5 text-right row-action-menu">
													<button
														type="button"
														onClick={() =>
															setActiveActionRow((prev) =>
																prev === s.id ? null : s.id
															)
														}
														className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
														aria-label="Student actions"
													>
														<MoreVertical className="h-4 w-4" />
													</button>

													{/* Dropdown Action Popover */}
													{isMenuOpen && (
														<div className="absolute right-4 top-10 z-40 w-36 rounded-xl border border-slate-200/90 bg-white p-1 shadow-xl ring-1 ring-slate-900/5">
															<button
																type="button"
																onClick={() => {
																	setViewStudent(s);
																	setShowViewModal(true);
																	setActiveActionRow(null);
																}}
																className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
															>
																<Eye className="h-3.5 w-3.5 text-slate-400" />
																<span>View Profile</span>
															</button>
															<button
																type="button"
																onClick={() => {
																	setViewStudent(s);
																	setShowViewModal(true);
																	setActiveActionRow(null);
																}}
																className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
															>
																<Edit2 className="h-3.5 w-3.5 text-slate-400" />
																<span>Edit</span>
															</button>
															<button
																type="button"
																onClick={() => handleDeleteStudent(s.id)}
																className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
															>
																<Trash2 className="h-3.5 w-3.5 text-rose-500" />
																<span>Delete</span>
															</button>
														</div>
													)}
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

			{/* ── MODALS & DRAWERS ── */}

			{/* 1. Add New Student Drawer / Modal */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-end bg-black/45 backdrop-blur-2xs transition-opacity">
					<div className="relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl transition-all">
						
						{/* Sticky Header */}
						<div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
							<div>
								<h2 className="text-lg font-extrabold text-slate-900">Add New Student</h2>
								<p className="text-xs text-slate-500">Fill in the student details to create a new enrollment</p>
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

							<form onSubmit={handleAddCandidate} id="add-student-form" className="space-y-6" autoComplete="off">
								
								{/* Photo Upload Section */}
								<div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
									<div
										onClick={() => photoInputRef.current?.click()}
										className="group relative flex h-18 w-18 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-white transition hover:border-orange-400 hover:bg-orange-50/30"
									>
										{candidateForm.photo ? (
											<img
												src={candidateForm.photo}
												alt="Student preview"
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
											Upload Student Photo
										</button>
										<p className="text-[11px] text-slate-400">
											Supported format: JPG, PNG (Max size: 2MB)
										</p>
									</div>
								</div>

								{/* Student Basic Details */}
								<div className="space-y-4">
									<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
										Basic Details
									</h3>

									{/* Student Name: First, Middle, Last */}
									<div>
										<label className={labelCls}>
											Student Name<span className="text-red-500">*</span>
										</label>
										<div className="grid grid-cols-3 gap-2.5">
											<input
												type="text"
												placeholder="First Name"
												autoComplete="off"
												autoCorrect="off"
												spellCheck="false"
												value={candidateForm.firstName}
												onChange={(e) =>
													setCandidateForm({ ...candidateForm, firstName: e.target.value })
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
												value={candidateForm.middleName}
												onChange={(e) =>
													setCandidateForm({ ...candidateForm, middleName: e.target.value })
												}
												className={inputCls}
											/>
											<input
												type="text"
												placeholder="Last Name"
												autoComplete="off"
												autoCorrect="off"
												spellCheck="false"
												value={candidateForm.lastName}
												onChange={(e) =>
													setCandidateForm({ ...candidateForm, lastName: e.target.value })
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
											value={candidateForm.gender}
											options={["Male", "Female", "Other"]}
											onChange={(val) =>
												setCandidateForm({ ...candidateForm, gender: val })
											}
											placeholder="Select Gender"
										/>
										<div>
											<label className={labelCls}>
												Date of Birth<span className="text-red-500">*</span>
											</label>
											<DatePicker
												required
												value={candidateForm.dob}
												onChange={(val) =>
													setCandidateForm({ ...candidateForm, dob: val })
												}
												placeholder="dd/mm/yyyy"
											/>
										</div>
									</div>

									{/* Admission Number */}
									<div>
										<label className={labelCls}>Admission Number</label>
										<div className="relative">
											<input
												type="text"
												autoComplete="off"
												value={candidateForm.admissionNumber}
												onChange={(e) =>
													setCandidateForm({
														...candidateForm,
														admissionNumber: e.target.value,
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

								{/* Academic Information */}
								<div className="space-y-4 pt-2">
									<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
										Academic Information
									</h3>
									
									{/* Session, Class, Section */}
									<div className="grid grid-cols-3 gap-2.5">
										<FormSelect
											label="Session"
											required
											value={candidateForm.session}
											options={["2026-27", "2025-26", "2024-25"]}
											onChange={(val) =>
												setCandidateForm({ ...candidateForm, session: val })
											}
										/>
										<FormSelect
											label="Class"
											required
											value={candidateForm.className}
											options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"].map((c) => ({
												value: c,
												label: `Class ${c}`,
											}))}
											onChange={(val) =>
												setCandidateForm({ ...candidateForm, className: val })
											}
											placeholder="Select Class"
										/>
										<FormSelect
											label="Section"
											required
											value={candidateForm.section}
											options={["A", "B", "C", "D", "E", "F"]}
											onChange={(val) =>
												setCandidateForm({ ...candidateForm, section: val })
											}
											placeholder="Section"
										/>
									</div>

									{/* Roll No & Admission Date */}
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className={labelCls}>Roll Number</label>
											<input
												type="text"
												placeholder="e.g. 33"
												autoComplete="off"
												autoCorrect="off"
												spellCheck="false"
												value={candidateForm.rollNo}
												onChange={(e) =>
													setCandidateForm({ ...candidateForm, rollNo: e.target.value })
												}
												className={inputCls}
											/>
										</div>
										<div>
											<label className={labelCls}>Admission Date</label>
											<DatePicker
												value={candidateForm.admissionDate}
												onChange={(val) =>
													setCandidateForm({
														...candidateForm,
														admissionDate: val,
													})
												}
												placeholder="dd/mm/yyyy"
											/>
										</div>
									</div>
								</div>

								{/* Parent Details */}
								<div className="space-y-4 pt-2">
									<h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
										Parent / Guardian Details
									</h3>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className={labelCls}>
												Contact Name<span className="text-red-500">*</span>
											</label>
											<input
												type="text"
												placeholder="Parent / Guardian Name"
												autoComplete="off"
												autoCorrect="off"
												spellCheck="false"
												value={candidateForm.contactName}
												onChange={(e) =>
													setCandidateForm({
														...candidateForm,
														contactName: e.target.value,
													})
												}
												className={inputCls}
											/>
										</div>
										<FormSelect
											label="Relationship"
											required
											value={candidateForm.relationship}
											options={[
												"Father",
												"Mother",
												"Guardian",
												"Uncle",
												"Aunt",
												"Brother",
												"Sister",
												"Other",
											]}
											onChange={(val) =>
												setCandidateForm({
													...candidateForm,
													relationship: val,
												})
											}
											placeholder="Select Relation"
										/>
									</div>

									<div>
										<label className={labelCls}>
											Residential Address<span className="text-red-500">*</span>
										</label>
										<textarea
											rows={3}
											placeholder="Enter complete residential address..."
											autoComplete="off"
											autoCorrect="off"
											spellCheck="false"
											value={candidateForm.address}
											onChange={(e) =>
												setCandidateForm({ ...candidateForm, address: e.target.value })
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
									form="add-student-form"
									disabled={saving}
									className="dashboard-btn-primary flex-1 rounded-xl py-2.5 text-xs font-bold shadow-sm disabled:opacity-50"
								>
									{saving ? "Registering..." : "Register Student"}
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
									<h2 className="text-lg font-bold text-slate-900">Upload Excel / CSV</h2>
									<p className="text-xs text-slate-400">Import multiple students in bulk</p>
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
							{/* Class selection */}
							<div>
								<FormSelect
									label="Assign to Class"
									required
									value={bulkClassId}
									options={classes.map((c) => ({
										value: c.id,
										label: `${c.class_name} - ${c.section}`,
									}))}
									onChange={(val) => setBulkClassId(val)}
									placeholder="-- Select Class --"
								/>
							</div>

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
									Includes Name, Email, Phone, Password, Roll Number, Gender
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
											✓ Ready to import {parsedRows.length} student records
										</p>
									</div>
									<div className="max-h-36 overflow-y-auto space-y-1 text-[11px] text-slate-700">
										{parsedRows.slice(0, 5).map((r, i) => (
											<div key={i} className="flex items-center justify-between py-1 border-b border-emerald-100 last:border-0">
												<span className="font-semibold">{r.full_name}</span>
												<span className="text-slate-500">{r.email}</span>
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
									onClick={handleSaveBulkStudents}
									disabled={bulkSaving || parsedRows.length === 0}
									className="dashboard-btn-primary rounded-xl px-4 py-2 text-xs font-bold shadow-sm disabled:opacity-50"
								>
									{bulkSaving ? "Importing..." : `Import ${parsedRows.length || ""} Students`}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* 3. View Student Modal */}
			{showViewModal && viewStudent && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
					<div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
						<div className="mb-5 flex items-center justify-between">
							<h2 className="text-lg font-bold text-slate-900">Student Profile</h2>
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
										viewStudent.avatarBg || "bg-indigo-500"
									}`}
								>
									{viewStudent.initials || "ST"}
								</div>
								<div>
									<h3 className="text-base font-bold text-slate-900">
										{viewStudent.full_name}
									</h3>
									<p className="text-xs text-slate-400">{viewStudent.email}</p>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs">
								<div>
									<p className="text-[11px] font-medium text-slate-400">Student ID</p>
									<p className="font-bold text-slate-800">
										{viewStudent.studentId || "LTV023849"}
									</p>
								</div>
								<div>
									<p className="text-[11px] font-medium text-slate-400">Grade</p>
									<p className="font-bold text-slate-800">
										{viewStudent.grade || viewStudent.className || "5-C"}
									</p>
								</div>
								<div>
									<p className="text-[11px] font-medium text-slate-400">Gender</p>
									<p className="font-bold text-slate-800">
										{viewStudent.gender || "Male"}
									</p>
								</div>
								<div>
									<p className="text-[11px] font-medium text-slate-400">Parent Details</p>
									<p className="font-bold text-slate-800">
										{viewStudent.parentDetails || "Guardian"}
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
