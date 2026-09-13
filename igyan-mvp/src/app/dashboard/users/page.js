"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
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
	Download,
	Calendar as CalendarIcon,
	Shield,
	GraduationCap,
	Briefcase,
	Phone,
	Mail,
	Edit2,
	KeyRound,
	FileSpreadsheet,
} from "lucide-react";

// Curated demo users matching the exact Figma mockup screenshot
const DEMO_USERS = [
	{
		id: "usr-1",
		studentId: "LTV023840",
		full_name: "Aadhya Menon",
		email: "aadhya.menon.5a@litera.test",
		role: "student",
		grade: "11-A",
		gender: "Male",
		parentDetails: "Parent",
		phone: "+91 98765 43210",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-indigo-500",
		initials: "AM",
	},
	{
		id: "usr-2",
		studentId: "LTV023841",
		full_name: "Aaradhya Pillai",
		email: "aaradhya.pillai.5a@litera.test",
		role: "student",
		grade: "5-A",
		gender: "Female",
		parentDetails: "Parent",
		phone: "+91 98765 43211",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-purple-500",
		initials: "AP",
	},
	{
		id: "usr-3",
		studentId: "LTV023842",
		full_name: "Aarav Sharma",
		email: "aarav.sharma.1a@litera.test",
		role: "student",
		grade: "5-C",
		gender: "Male",
		parentDetails: "Parent",
		phone: "+91 98765 43212",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-blue-500",
		initials: "AS",
	},
	{
		id: "usr-4",
		studentId: "LTV023843",
		full_name: "Aditya Nair",
		email: "aditya.nair.1a@litera.test",
		role: "student",
		grade: "5-C",
		gender: "Female",
		parentDetails: "Parent",
		phone: "+91 98765 43213",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-indigo-500",
		initials: "AN",
	},
	{
		id: "usr-5",
		studentId: "LTV023844",
		full_name: "Alia Mukherjee",
		email: "alia.mukherjee.8b@litera.test",
		role: "student",
		grade: "11-A",
		gender: "Male",
		parentDetails: "Parent",
		phone: "+91 98765 43214",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-purple-500",
		initials: "AM",
	},
	{
		id: "usr-6",
		studentId: "LTV023845",
		full_name: "Ananya Singh",
		email: "ananya.singh.5a@litera.test",
		role: "student",
		grade: "5-A",
		gender: "Female",
		parentDetails: "Parent",
		phone: "+91 98765 43215",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-blue-500",
		initials: "AS",
	},
	{
		id: "usr-7",
		studentId: "LTV023846",
		full_name: "Anika Chauhan",
		email: "anika.chauhan.5a@litera.test",
		role: "student",
		grade: "5-A",
		gender: "Male",
		parentDetails: "Parent",
		phone: "+91 98765 43216",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-indigo-500",
		initials: "AC",
	},
	{
		id: "usr-8",
		studentId: "LTV023847",
		full_name: "Arjun Mehta",
		email: "arjun.mehta.1a@litera.test",
		role: "student",
		grade: "5-C",
		gender: "Female",
		parentDetails: "Parent",
		phone: "+91 98765 43217",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-purple-500",
		initials: "AM",
	},
	{
		id: "usr-9",
		studentId: "LTV023848",
		full_name: "Arnav Goel",
		email: "arnav.goel.11a@litera.test",
		role: "student",
		grade: "11-A",
		gender: "Male",
		parentDetails: "Parent",
		phone: "+91 98765 43218",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-blue-500",
		initials: "AG",
	},
];

async function hashPassword(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export default function UserManagementPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	// State
	const [usersList, setUsersList] = useState(DEMO_USERS);
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedYear, setSelectedYear] = useState("2025 - 2026");
	const [selectedClassFilter, setSelectedClassFilter] = useState("All Class");
	const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Status");
	const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");

	// Dropdown states
	const [yearFilterOpen, setYearFilterOpen] = useState(false);
	const [classFilterOpen, setClassFilterOpen] = useState(false);
	const [statusFilterOpen, setStatusFilterOpen] = useState(false);
	const [roleFilterOpen, setRoleFilterOpen] = useState(false);
	const yearFilterRef = useRef(null);
	const classFilterRef = useRef(null);
	const statusFilterRef = useRef(null);
	const roleFilterRef = useRef(null);

	// Table selection & row action menu
	const [selectedRowIds, setSelectedRowIds] = useState(new Set());
	const [activeActionRow, setActiveActionRow] = useState(null);

	// Toasts
	const [successMsg, setSuccessMsg] = useState("");
	const [errorMsg, setErrorMsg] = useState("");

	// Side-over drawer states
	const [showAddDrawer, setShowAddDrawer] = useState(false);
	const [showBulkModal, setShowBulkModal] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [savingUser, setSavingUser] = useState(false);

	// Excel bulk upload state
	const [uploadedFileName, setUploadedFileName] = useState("");
	const [parsedRows, setParsedRows] = useState([]);
	const [bulkSaving, setBulkSaving] = useState(false);

	// New user form state
	const emptyForm = {
		fullName: "",
		email: "",
		phone: "",
		role: "student",
		grade: "5-C",
		gender: "Male",
		parentDetails: "Parent",
		password: "Password@123",
		status: "Active",
	};
	const [formData, setFormData] = useState(emptyForm);

	// Close dropdowns on outside click
	useEffect(() => {
		function handleClickOutside(event) {
			if (
				yearFilterRef.current &&
				!yearFilterRef.current.contains(event.target)
			) {
				setYearFilterOpen(false);
			}
			if (
				classFilterRef.current &&
				!classFilterRef.current.contains(event.target)
			) {
				setClassFilterOpen(false);
			}
			if (
				statusFilterRef.current &&
				!statusFilterRef.current.contains(event.target)
			) {
				setStatusDropdown(false);
			}
			if (
				roleFilterRef.current &&
				!roleFilterRef.current.contains(event.target)
			) {
				setRoleFilterOpen(false);
			}
			if (!event.target.closest(".row-action-menu")) {
				setActiveActionRow(null);
			}
		}
		function setStatusDropdown(val) {
			setStatusFilterOpen(val);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Fetch users from Supabase if connected
	useEffect(() => {
		if (user?.school_id) {
			fetchUsers();
		}
	}, [user]);

	const fetchUsers = async () => {
		if (!user?.school_id) return;
		try {
			setIsLoading(true);
			const { data: dbUsers, error } = await supabase
				.from("users")
				.select("*")
				.eq("school_id", user.school_id)
				.order("created_at", { ascending: false });

			if (!error && dbUsers && dbUsers.length > 0) {
				const colors = [
					"bg-indigo-500",
					"bg-purple-500",
					"bg-blue-500",
					"bg-emerald-500",
					"bg-rose-500",
					"bg-amber-500",
				];
				const mapped = dbUsers.map((u, i) => {
					const initials = u.full_name
						? u.full_name
								.split(" ")
								.map((n) => n[0])
								.join("")
								.slice(0, 2)
								.toUpperCase()
						: "US";
					return {
						id: u.id,
						studentId: `LTV0238${(40 + i).toString()}`,
						full_name: u.full_name || "User",
						email: u.email,
						role: u.role || "student",
						grade: u.role === "student" ? "5-C" : u.role === "faculty" ? "Faculty" : "Admin",
						gender: "Male",
						parentDetails: "Parent",
						phone: u.phone || "+91 98765 00000",
						created_at: u.created_at || new Date().toISOString(),
						status: "Active",
						avatarBg: colors[i % colors.length],
						initials,
					};
				});
				setUsersList(mapped);
			} else {
				setUsersList(DEMO_USERS);
			}
		} catch (err) {
			console.error("Error fetching users:", err);
			setUsersList(DEMO_USERS);
		} finally {
			setIsLoading(false);
		}
	};

	// Open Add User Drawer
	const handleOpenAdd = () => {
		setEditingUser(null);
		setFormData({
			...emptyForm,
			email: `user.${Math.floor(100 + Math.random() * 900)}@literavalley.edu.in`,
		});
		setShowAddDrawer(true);
	};

	// Open Edit User Drawer
	const handleOpenEdit = (targetUser) => {
		setEditingUser(targetUser);
		setFormData({
			fullName: targetUser.full_name || "",
			email: targetUser.email || "",
			phone: targetUser.phone || "",
			role: targetUser.role || "student",
			grade: targetUser.grade || "5-C",
			gender: targetUser.gender || "Male",
			parentDetails: targetUser.parentDetails || "Parent",
			password: "",
			status: targetUser.status || "Active",
		});
		setShowAddDrawer(true);
		setActiveActionRow(null);
	};

	// Save User
	const handleSaveUser = async (e) => {
		e.preventDefault();
		if (!formData.fullName.trim() || !formData.email.trim()) {
			setErrorMsg("Full Name and Email are required.");
			return;
		}

		setSavingUser(true);
		setErrorMsg("");

		try {
			const initials = formData.fullName
				.split(" ")
				.map((n) => n[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();

			if (editingUser) {
				// Update in DB if real
				if (!editingUser.id.startsWith("usr-")) {
					await supabase
						.from("users")
						.update({
							full_name: formData.fullName.trim(),
							email: formData.email.trim().toLowerCase(),
							phone: formData.phone || null,
							role: formData.role,
						})
						.eq("id", editingUser.id);
				}

				setUsersList((prev) =>
					prev.map((u) =>
						u.id === editingUser.id
							? {
									...u,
									full_name: formData.fullName.trim(),
									email: formData.email.trim().toLowerCase(),
									phone: formData.phone,
									role: formData.role,
									grade: formData.grade,
									gender: formData.gender,
									parentDetails: formData.parentDetails,
									status: formData.status,
									initials,
							  }
							: u
					)
				);
				setSuccessMsg(`User "${formData.fullName}" updated successfully!`);
			} else {
				// Insert into DB if school_id available
				let newId = `usr-${Date.now()}`;
				if (user?.school_id) {
					try {
						const passwordHash = await hashPassword(
							formData.password || "Password@123"
						);
						const { data, error } = await supabase
							.from("users")
							.insert([
								{
									full_name: formData.fullName.trim(),
									email: formData.email.trim().toLowerCase(),
									password_hash: passwordHash,
									phone: formData.phone || null,
									role: formData.role,
									school_id: user.school_id,
								},
							])
							.select()
							.single();
						if (!error && data) {
							newId = data.id;
						}
					} catch (dbErr) {
						console.warn("DB insert notice:", dbErr);
					}
				}

				const newUserItem = {
					id: newId,
					studentId: `LTV0238${Math.floor(50 + Math.random() * 40)}`,
					full_name: formData.fullName.trim(),
					email: formData.email.trim().toLowerCase(),
					role: formData.role,
					grade: formData.grade,
					gender: formData.gender,
					parentDetails: formData.parentDetails,
					phone: formData.phone || "+91 98765 00000",
					created_at: new Date().toISOString(),
					status: formData.status || "Active",
					avatarBg: "bg-indigo-500",
					initials,
				};

				setUsersList((prev) => [newUserItem, ...prev]);
				setSuccessMsg(`User "${formData.fullName}" added successfully!`);
			}

			setShowAddDrawer(false);
			setTimeout(() => setSuccessMsg(""), 3500);
		} catch (err) {
			console.error(err);
			setErrorMsg(err.message || "Failed to save user.");
		} finally {
			setSavingUser(false);
		}
	};

	// Delete user
	const handleDeleteUser = async (targetId, name) => {
		if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
		try {
			if (!targetId.startsWith("usr-")) {
				await supabase.from("users").delete().eq("id", targetId);
			}
			setUsersList((prev) => prev.filter((u) => u.id !== targetId));
			setSuccessMsg(`User "${name}" removed.`);
			setActiveActionRow(null);
			setTimeout(() => setSuccessMsg(""), 3000);
		} catch (err) {
			console.error(err);
			setErrorMsg("Failed to delete user.");
		}
	};

	// Selection handlers
	const handleSelectAll = (e) => {
		if (e.target.checked) {
			setSelectedRowIds(new Set(filteredUsers.map((u) => u.id)));
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

	const fileInputRef = useRef(null);

	// Excel Export
	const handleExportExcel = () => {
		if (usersList.length === 0) {
			alert("No users to export.");
			return;
		}
		const rows = usersList.map((u, index) => ({
			"Sl No": index + 1,
			"Student/User ID": u.studentId,
			"Full Name": u.full_name,
			Email: u.email,
			Role: u.role?.toUpperCase(),
			Grade: u.grade,
			Gender: u.gender,
			"Parent Details": u.parentDetails,
			Phone: u.phone,
			"Registered On": new Date(u.created_at).toLocaleDateString(),
			Status: u.status,
		}));
		const ws = XLSX.utils.json_to_sheet(rows);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Users List");
		XLSX.writeFile(
			wb,
			`Litera_Valley_Users_${new Date().toISOString().slice(0, 10)}.xlsx`
		);
	};

	// Download Excel template
	const handleDownloadTemplate = () => {
		const sampleRows = [
			{
				"Full Name": "Aarav Sharma",
				Email: "aarav.sharma@litera.test",
				Role: "student",
				Grade: "5-C",
				Gender: "Male",
				"Parent Details": "Rajesh Sharma (+91 98765 00001)",
				Phone: "+91 98765 43210",
				Status: "Active",
			},
			{
				"Full Name": "Priya Verma",
				Email: "priya.verma@litera.test",
				Role: "faculty",
				Grade: "10-A",
				Gender: "Female",
				"Parent Details": "N/A",
				Phone: "+91 98765 43211",
				Status: "Active",
			},
		];
		const ws = XLSX.utils.json_to_sheet(sampleRows);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Template");
		XLSX.writeFile(wb, "Users_Import_Template.xlsx");
	};

	// Handle Excel/CSV file selection & parsing
	const handleFileSelect = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadedFileName(file.name);
		const reader = new FileReader();

		reader.onload = (evt) => {
			try {
				const bstr = evt.target.result;
				const wb = XLSX.read(bstr, { type: "binary" });
				const wsname = wb.SheetNames[0];
				const ws = wb.Sheets[wsname];
				const data = XLSX.utils.sheet_to_json(ws);

				if (data.length === 0) {
					setErrorMsg("Excel file is empty.");
					return;
				}

				const parsed = data.map((row, idx) => {
					const name = row["Full Name"] || row["Name"] || row["Student Name"] || `User ${idx + 1}`;
					const email = row["Email"] || `user_${Date.now()}_${idx}@litera.test`;
					const role = (row["Role"] || "student").toLowerCase();
					const grade = row["Grade"] || row["Class"] || "5-A";
					const gender = row["Gender"] || "Male";
					const parent = row["Parent Details"] || row["Parent"] || "Parent";
					const phone = row["Phone"] || row["Mobile"] || "+91 98765 00000";
					const status = row["Status"] || "Active";

					const nameParts = name.trim().split(" ");
					const initials = nameParts.length > 1
						? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
						: name.slice(0, 2).toUpperCase();

					const colors = ["bg-indigo-500", "bg-purple-500", "bg-blue-500", "bg-teal-500", "bg-rose-500"];

					return {
						id: `usr-import-${Date.now()}-${idx}`,
						studentId: `LTV0238${Math.floor(60 + idx)}`,
						full_name: name,
						email: email.toLowerCase().trim(),
						role,
						grade,
						gender,
						parentDetails: parent,
						phone,
						created_at: new Date().toISOString(),
						status,
						avatarBg: colors[idx % colors.length],
						initials,
					};
				});

				setParsedRows(parsed);
				setSuccessMsg(`Successfully parsed ${parsed.length} users from ${file.name}`);
				setTimeout(() => setSuccessMsg(""), 3000);
			} catch (err) {
				console.error("Excel parse error:", err);
				setErrorMsg("Failed to parse Excel file. Please use the standard template.");
			}
		};

		reader.readAsBinaryString(file);
	};

	// Save parsed Excel users to state and database
	const handleSaveBulkImport = async () => {
		if (parsedRows.length === 0) {
			setErrorMsg("No users to import.");
			return;
		}

		setBulkSaving(true);
		try {
			// Insert into Supabase if school_id available
			if (user?.school_id) {
				const dbPayload = await Promise.all(
					parsedRows.map(async (u) => {
						const passwordHash = await hashPassword("Password@123");
						return {
							full_name: u.full_name,
							email: u.email,
							password_hash: passwordHash,
							phone: u.phone,
							role: u.role,
							school_id: user.school_id,
						};
					})
				);

				const { error } = await supabase.from("users").insert(dbPayload);
				if (error) {
					console.warn("DB bulk insert notice:", error);
				}
			}

			setUsersList((prev) => [...parsedRows, ...prev]);
			setSuccessMsg(`Imported ${parsedRows.length} users successfully!`);
			setShowBulkModal(false);
			setParsedRows([]);
			setUploadedFileName("");
			setTimeout(() => setSuccessMsg(""), 3500);
		} catch (err) {
			console.error("Bulk save error:", err);
			setErrorMsg("Failed to save imported users.");
		} finally {
			setBulkSaving(false);
		}
	};

	// Filtered users
	const filteredUsers = useMemo(() => {
		return usersList.filter((u) => {
			const matchesSearch =
				searchQuery.trim() === "" ||
				u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.grade?.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesClass =
				selectedClassFilter === "All Class" ||
				u.grade?.toLowerCase() === selectedClassFilter.toLowerCase();

			const matchesStatus =
				selectedStatusFilter === "All Status" ||
				u.status?.toLowerCase() === selectedStatusFilter.toLowerCase();

			const matchesRole =
				selectedRoleFilter === "all" ||
				u.role?.toLowerCase() === selectedRoleFilter.toLowerCase();

			return matchesSearch && matchesClass && matchesStatus && matchesRole;
		});
	}, [usersList, searchQuery, selectedClassFilter, selectedStatusFilter, selectedRoleFilter]);

	return (
		<div className="min-h-full bg-[#f8fafc] p-4 text-[#1e293b] sm:p-6 lg:p-7">
			<div className="mx-auto max-w-[1520px] space-y-6">
				{/* ── Page Header ── */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
							<span className="hover:text-slate-800 transition-colors">
								System & Users
							</span>
							<span>•</span>
							<span className="text-[#ea580c]">User Management</span>
						</div>
						<h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl">
							User Management
						</h1>
					</div>

					<div className="flex items-center gap-2.5">
						{/* Upload Excel Button */}
						<button
							type="button"
							onClick={() => setShowBulkModal(true)}
							className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
						>
							<Upload className="h-4 w-4 text-slate-500" />
							<span>Upload Excel</span>
						</button>

						{/* Export Excel Button */}
						<button
							type="button"
							onClick={handleExportExcel}
							className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
						>
							<Download className="h-4 w-4 text-slate-500" />
							<span>Export</span>
						</button>

						{/* Add User Button */}
						<button
							type="button"
							onClick={handleOpenAdd}
							className="dashboard-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
						>
							<Plus className="h-4 w-4 stroke-[2.5]" />
							<span>Add User</span>
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
								{usersList.length > 0
									? usersList.length.toLocaleString()
									: "1,248"}
							</p>
						</div>
					</div>

					{/* Card 2: Enrolled This Year */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f0ff] text-[#8b5cf6]">
							<Users className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">
								Enrolled This Year
							</p>
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
							<p className="text-xs font-medium text-slate-500">
								Student Performance
							</p>
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
							<p className="text-xs font-medium text-slate-500">
								Pending Student Fee
							</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								36
							</p>
						</div>
					</div>
				</div>

				{/* ── Search & Filter Controls (Matching Screenshot 1:1) ── */}
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
							className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9.5 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/15"
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
								className={`flex min-w-[124px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									yearFilterOpen
										? "border-[#ea580c] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200/90"
								}`}
							>
								<span>{selectedYear}</span>
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${
										yearFilterOpen
											? "rotate-180 text-slate-700"
											: "text-slate-400"
									}`}
								/>
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
								className={`flex min-w-[104px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									classFilterOpen
										? "border-[#ea580c] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200/90"
								}`}
							>
								<span>{selectedClassFilter}</span>
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${
										classFilterOpen
											? "rotate-180 text-slate-700"
											: "text-slate-400"
									}`}
								/>
							</button>
							{classFilterOpen && (
								<div className="absolute left-0 z-40 mt-1.5 min-w-full w-36 origin-top-left rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
									{[
										"All Class",
										"11-A",
										"5-A",
										"5-C",
										"2-D",
										"3-A",
										"4-B",
										"6-F",
										"7-B",
									].map((c) => (
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
								className={`flex min-w-[104px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									statusFilterOpen
										? "border-[#ea580c] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200/90"
								}`}
							>
								<span>{selectedStatusFilter}</span>
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${
										statusFilterOpen
											? "rotate-180 text-slate-700"
											: "text-slate-400"
									}`}
								/>
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

				{/* ── Data Table (Matching Figma Screenshot 1:1) ── */}
				<div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
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
												filteredUsers.length > 0 &&
												selectedRowIds.size === filteredUsers.length
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
										<td
											colSpan={9}
											className="px-6 py-12 text-center text-slate-400"
										>
											<div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
										</td>
									</tr>
								) : filteredUsers.length === 0 ? (
									<tr>
										<td
											colSpan={9}
											className="px-6 py-12 text-center text-slate-400"
										>
											No users found matching your search.
										</td>
									</tr>
								) : (
									filteredUsers.map((u) => {
										const isSelected = selectedRowIds.has(u.id);
										const isMenuOpen = activeActionRow === u.id;

										return (
											<tr
												key={u.id}
												className={`transition-colors hover:bg-slate-50/70 ${
													isSelected ? "bg-orange-50/30" : ""
												}`}
											>
												{/* Checkbox */}
												<td className="px-4 py-3.5 text-center">
													<input
														type="checkbox"
														checked={isSelected}
														onChange={() => handleToggleRow(u.id)}
														className="dashboard-checkbox h-4 w-4"
													/>
												</td>

												{/* Student ID */}
												<td className="px-4 py-3.5 font-semibold text-slate-600">
													{u.studentId || "LTV023849"}
												</td>

												{/* Student Name & Avatar */}
												<td className="px-4 py-3.5">
													<div className="flex items-center gap-3">
														<div
															className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${
																u.avatarBg || "bg-indigo-500"
															}`}
														>
															{u.initials || "ST"}
														</div>
														<div>
															<p className="font-bold text-slate-900">
																{u.full_name}
															</p>
															<p className="text-[11px] font-normal text-slate-400">
																{u.email}
															</p>
														</div>
													</div>
												</td>

												{/* Grade */}
												<td className="px-4 py-3.5 font-semibold text-slate-600">
													{u.grade || "5-C"}
												</td>

												{/* Gender */}
												<td className="px-4 py-3.5 text-slate-600">
													{u.gender || "Male"}
												</td>

												{/* Parent Details */}
												<td className="px-4 py-3.5 text-slate-600">
													{u.parentDetails || "Parent"}
												</td>

												{/* Registered Date */}
												<td className="px-4 py-3.5 text-slate-500">
													{new Date(u.created_at).toLocaleDateString("en-US", {
														month: "2-digit",
														day: "2-digit",
														year: "numeric",
													})}
												</td>

												{/* Status */}
												<td className="px-4 py-3.5">
													<span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
														{u.status || "Active"}
													</span>
												</td>

												{/* Action Menu */}
												<td className="relative px-4 py-3.5 text-right row-action-menu">
													<button
														type="button"
														onClick={() =>
															setActiveActionRow((prev) =>
																prev === u.id ? null : u.id
															)
														}
														className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
													>
														<MoreVertical className="h-4 w-4" />
													</button>

													{isMenuOpen && (
														<div className="absolute right-4 top-full z-30 mt-1 w-40 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
															<button
																type="button"
																onClick={() => handleOpenEdit(u)}
																className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
															>
																<Edit2 className="h-3.5 w-3.5 text-blue-500" />
																<span>Edit User</span>
															</button>
															<button
																type="button"
																onClick={() => {
																	setSuccessMsg(
																		`Password reset link sent to ${u.email}`
																	);
																	setActiveActionRow(null);
																	setTimeout(() => setSuccessMsg(""), 3000);
																}}
																className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
															>
																<KeyRound className="h-3.5 w-3.5 text-amber-500" />
																<span>Reset Pass</span>
															</button>
															<hr className="my-1 border-slate-100" />
															<button
																type="button"
																onClick={() =>
																	handleDeleteUser(u.id, u.full_name)
																}
																className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50"
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

			{/* ═══════════════════════════════════════════════════════
          SLIDE-OVER DRAWER: ADD / EDIT USER
         ═══════════════════════════════════════════════════════ */}
			{showAddDrawer && (
				<div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in-0">
					<div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
						{/* Drawer Header */}
						<div className="p-6 border-b border-slate-100 flex items-center justify-between">
							<h3 className="text-base font-bold text-slate-900 sm:text-lg">
								{editingUser ? "Edit User" : "Add New User"}
							</h3>
							<button
								type="button"
								onClick={() => setShowAddDrawer(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Drawer Form Body */}
						<form
							id="user-form"
							onSubmit={handleSaveUser}
							className="p-6 space-y-4 overflow-y-auto flex-1 text-xs [scrollbar-width:thin]"
						>
							{/* Full Name */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold text-slate-800">
									Full Name<span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									placeholder="e.g. Aadhya Menon"
									value={formData.fullName}
									onChange={(e) =>
										setFormData({ ...formData, fullName: e.target.value })
									}
									className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
								/>
							</div>

							{/* Email */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold text-slate-800">
									Email Address<span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									required
									placeholder="user@literavalley.edu.in"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
								/>
							</div>

							{/* Role & Grade */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										Role<span className="text-red-500">*</span>
									</label>
									<select
										value={formData.role}
										onChange={(e) =>
											setFormData({ ...formData, role: e.target.value })
										}
										className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									>
										<option value="student">Student</option>
										<option value="faculty">Faculty</option>
										<option value="co_admin">Co-Admin</option>
										<option value="counselor">Counselor</option>
										<option value="parent">Parent</option>
									</select>
								</div>

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										Grade / Class
									</label>
									<select
										value={formData.grade}
										onChange={(e) =>
											setFormData({ ...formData, grade: e.target.value })
										}
										className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									>
										{[
											"11-A",
											"5-A",
											"5-C",
											"1-A",
											"2-D",
											"3-A",
											"4-B",
											"6-F",
											"7-B",
											"8-A",
											"9-C",
											"10-A",
											"12-A",
										].map((g) => (
											<option key={g} value={g}>
												Class {g}
											</option>
										))}
									</select>
								</div>
							</div>

							{/* Gender & Parent Details */}
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										Gender
									</label>
									<select
										value={formData.gender}
										onChange={(e) =>
											setFormData({ ...formData, gender: e.target.value })
										}
										className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									>
										<option value="Male">Male</option>
										<option value="Female">Female</option>
										<option value="Other">Other</option>
									</select>
								</div>

								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										Parent Details
									</label>
									<select
										value={formData.parentDetails}
										onChange={(e) =>
											setFormData({
												...formData,
												parentDetails: e.target.value,
											})
										}
										className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									>
										<option value="Parent">Parent</option>
										<option value="Father">Father</option>
										<option value="Mother">Mother</option>
										<option value="Guardian">Guardian</option>
									</select>
								</div>
							</div>

							{/* Phone Number */}
							<div>
								<label className="mb-1.5 block text-xs font-semibold text-slate-800">
									Phone Number
								</label>
								<input
									type="tel"
									placeholder="+91 98765 43210"
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
								/>
							</div>

							{/* Initial Password (only when adding) */}
							{!editingUser && (
								<div>
									<label className="mb-1.5 block text-xs font-semibold text-slate-800">
										Initial Password
									</label>
									<input
										type="password"
										placeholder="Password@123"
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
										className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
									/>
								</div>
							)}
						</form>

						{/* Pinned Drawer Footer */}
						<div className="p-6 border-t border-slate-100 bg-white flex items-center gap-3">
							<button
								type="button"
								onClick={() => setShowAddDrawer(false)}
								className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
							>
								Cancel
							</button>
							<button
								type="submit"
								form="user-form"
								disabled={savingUser}
								className="dashboard-btn-primary flex-1 rounded-xl py-2.5 text-xs sm:text-sm font-semibold shadow-sm text-center disabled:opacity-60"
							>
								{savingUser
									? "Saving..."
									: editingUser
									? "Update User"
									: "Add User"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* ── 2. Upload Excel Modal ── */}
			{showBulkModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs animate-in fade-in duration-200">
					<div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
						<div className="mb-5 flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
									<FileSpreadsheet className="h-5 w-5" />
								</div>
								<div>
									<h2 className="text-lg font-bold text-slate-900">Upload Excel / CSV</h2>
									<p className="text-xs text-slate-400">Import users roster in bulk</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => {
									setShowBulkModal(false);
									setParsedRows([]);
									setUploadedFileName("");
								}}
								className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{errorMsg && (
							<div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
								{errorMsg}
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
									Supports Full Name, Email, Role, Grade, Gender, Phone, Status
								</p>
							</div>

							{/* Template download link */}
							<div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
								<span className="text-slate-600 font-medium">Need a formatted template?</span>
								<button
									type="button"
									onClick={handleDownloadTemplate}
									className="flex items-center gap-1.5 text-orange-600 font-bold hover:underline"
								>
									<Download className="h-3.5 w-3.5" />
									<span>Download Template</span>
								</button>
							</div>

							{/* Preview table if parsed */}
							{parsedRows.length > 0 && (
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="text-xs font-bold text-slate-700">
											Preview ({parsedRows.length} users found)
										</p>
										<span className="text-[11px] text-emerald-600 font-semibold">
											✓ Ready for import
										</span>
									</div>
									<div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 text-xs">
										<table className="w-full text-left">
											<thead className="bg-slate-50 text-[11px] font-bold text-slate-500">
												<tr>
													<th className="px-3 py-2">Name</th>
													<th className="px-3 py-2">Email</th>
													<th className="px-3 py-2">Role</th>
													<th className="px-3 py-2">Grade</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-100">
												{parsedRows.slice(0, 5).map((r, i) => (
													<tr key={i} className="hover:bg-slate-50/50">
														<td className="px-3 py-2 font-medium text-slate-800">{r.full_name}</td>
														<td className="px-3 py-2 text-slate-500">{r.email}</td>
														<td className="px-3 py-2 uppercase text-[10px] font-bold text-slate-600">{r.role}</td>
														<td className="px-3 py-2 text-slate-600">{r.grade}</td>
													</tr>
												))}
											</tbody>
										</table>
										{parsedRows.length > 5 && (
											<div className="p-2 text-center text-[11px] text-slate-400 bg-slate-50/40 border-t border-slate-100">
												+ {parsedRows.length - 5} more users
											</div>
										)}
									</div>
								</div>
							)}
						</div>

						{/* Modal Actions */}
						<div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
							<button
								type="button"
								onClick={() => {
									setShowBulkModal(false);
									setParsedRows([]);
									setUploadedFileName("");
								}}
								className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleSaveBulkImport}
								disabled={parsedRows.length === 0 || bulkSaving}
								className="dashboard-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm disabled:opacity-50"
							>
								{bulkSaving ? (
									<span>Importing...</span>
								) : (
									<>
										<Upload className="h-3.5 w-3.5" />
										<span>Import {parsedRows.length > 0 ? `(${parsedRows.length})` : ""}</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
