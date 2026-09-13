"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import * as XLSX from "xlsx";
import {
	Search,
	Shield,
	KeyRound,
	Check,
	CheckCircle2,
	AlertTriangle,
	Users,
	Layers,
	FolderTree,
	Lock,
	Unlock,
	X,
	MoreVertical,
	ChevronDown,
	ChevronRight,
	Eye,
	RefreshCw,
	Sparkles,
	Filter,
	Download,
	ArrowRight,
	UserCheck,
	ShieldAlert,
	ShieldCheck,
	Bot,
	Wrench,
	Video,
	MessageSquare,
	Shuffle,
	Mic,
	BarChart3,
	FileText,
	Gamepad2,
	Headphones,
	Puzzle,
	FileEdit,
	ClipboardList,
	GraduationCap,
	Clock,
	CalendarDays,
	School,
	TrendingUp,
	Activity,
	Presentation,
	BrainCircuit,
	SmilePlus,
	Building2,
	Lightbulb,
	FileStack,
	Rocket,
	ArrowRightLeft,
	Globe,
	MessagesSquare,
	Calendar,
	ClipboardCheck,
	History,
	Heart,
	FolderOpen,
	Notebook,
	Phone,
	Info,
	SlidersHorizontal,
	Copy,
	Sliders,
	Upload,
	FileSpreadsheet,
} from "lucide-react";

// ── Complete module list matching sidenav-config.js ──
const AVAILABLE_MODULES = [
	// ─── Core ───
	{ key: "dashboard", name: "Dashboard", path: "/dashboard", iconName: "Home", description: "Main dashboard overview & KPIs", roles: ["super_admin", "co_admin", "faculty", "student", "counselor", "parent"], category: "Core" },
	{ key: "settings", name: "Settings", path: "/dashboard/settings", iconName: "Settings", description: "System & personal configuration", roles: ["super_admin", "co_admin", "faculty", "student", "counselor", "parent"], category: "Core" },

	// ─── AI Suite ───
	{ key: "copilot", name: "Co-pilot (Sudarshan AI)", path: "/dashboard/copilot", iconName: "Sparkles", description: "AI co-pilot assistant & workflows", roles: ["super_admin", "co_admin", "faculty", "student"], category: "AI Suite" },
	{ key: "gyanisage", name: "Buddy AI", path: "/dashboard/gyanisage", iconName: "Bot", description: "AI counsellor & interactive student companion", roles: ["super_admin", "co_admin", "faculty", "student", "counselor"], category: "AI Suite" },
	{ key: "sharkAi", name: "AI Shark", path: "/dashboard/shark-ai", iconName: "Rocket", description: "AI venture pitch and deck evaluator", roles: ["super_admin", "co_admin", "faculty", "student", "counselor"], category: "AI Suite" },
	{ key: "tools", name: "AI Tools / Teaching Kit", path: "/dashboard/tools", iconName: "Wrench", description: "AI-powered teaching & learning productivity tools", roles: ["super_admin", "co_admin", "faculty", "student"], category: "AI Suite" },
	{ key: "liveClassroom", name: "Omni Sight (Live Classroom)", path: "/dashboard/live-classroom", iconName: "Video", description: "Live intelligent video classroom session", roles: ["super_admin", "co_admin", "faculty", "student"], category: "AI Suite" },

	// ─── Faculty Specific ───
	{ key: "parentChat", name: "Parent Connect (Faculty)", path: "/dashboard/faculty-chat", iconName: "MessageSquare", description: "Faculty-to-parent direct messaging", roles: ["super_admin", "co_admin", "faculty"], category: "Faculty" },
	{ key: "facultySubstitution", name: "Smart Substitution System", path: "/dashboard/faculty-substitution", iconName: "Shuffle", description: "Automated faculty leave & substitution solver", roles: ["super_admin", "co_admin", "faculty"], category: "Faculty" },

	// ─── Homework & Assessment ───
	{ key: "homework", name: "AI Viva Evaluator / Homework", path: "/dashboard/homework", iconName: "Mic", description: "Homework assignments & viva evaluation", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },
	{ key: "vivaResults", name: "Viva Evaluation Result", path: "/dashboard/homework/reports", iconName: "BarChart3", description: "Detailed viva evaluation analytics & reports", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },
	{ key: "aiReport", name: "AI Report / Report Cards", path: "/dashboard/report-cards", iconName: "FileText", description: "AI-generated comprehensive student report cards", roles: ["super_admin", "co_admin", "faculty", "student", "parent"], category: "Homework & Assessment" },
	{ key: "gamifiedAssignments", name: "Gamified Assignments", path: "/dashboard/gamified-assignments", iconName: "Gamepad2", description: "Create interactive gamified assessments", roles: ["super_admin", "co_admin", "faculty"], category: "Homework & Assessment" },
	{ key: "vivaLab", name: "AI Viva Lab", path: "/dashboard/viva-ai", iconName: "Headphones", description: "Practice viva with real-time AI feedback", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },
	{ key: "gamified", name: "Gamified Homework", path: "/dashboard/gamified", iconName: "Puzzle", description: "Interactive game-based homework quests", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },
	{ key: "questionPaper", name: "Question Paper Generator", path: "/dashboard/question-paper", iconName: "FileEdit", description: "AI-assisted exam question paper generator", roles: ["super_admin", "co_admin", "faculty"], category: "Homework & Assessment" },
	{ key: "assignments", name: "Assignments", path: "/dashboard/assignments", iconName: "ClipboardList", description: "Create, distribute and grade coursework", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },

	// ─── Academic Operations ───
	{ key: "skillTracks", name: "Skill Tracks / Courses", path: "/dashboard/courses", iconName: "GraduationCap", description: "Courses, curriculums & skill pathways", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Academic Operations" },
	{ key: "attendance", name: "Attendance", path: "/dashboard/attendance", iconName: "CheckCircle2", description: "Student & faculty attendance tracking", roles: ["super_admin", "co_admin", "faculty", "parent"], category: "Academic Operations" },
	{ key: "timetable", name: "Timetable", path: "/dashboard/timetable", iconName: "Clock", description: "Institutional timetable scheduling", roles: ["super_admin", "co_admin", "faculty"], category: "Academic Operations" },
	{ key: "academicSessions", name: "Academic Sessions", path: "/dashboard/academic-sessions", iconName: "CalendarDays", description: "Term, semester & academic session planner", roles: ["super_admin", "co_admin", "faculty"], category: "Academic Operations" },
	{ key: "classes", name: "Classes & Sections", path: "/dashboard/classes", iconName: "School", description: "Grade levels, sections & room allocations", roles: ["super_admin", "co_admin", "faculty"], category: "Academic Operations" },
	{ key: "reports", name: "Reports & Analytics", path: "/dashboard/reports", iconName: "TrendingUp", description: "Institutional performance & operational reports", roles: ["super_admin", "co_admin", "faculty"], category: "Academic Operations" },
	{ key: "performance", name: "Performance Tracking", path: "/dashboard/performance", iconName: "Activity", description: "Student academic metric trends", roles: ["super_admin", "co_admin", "faculty", "student", "parent"], category: "Academic Operations" },
	{ key: "contentGenerator", name: "Content Generator", path: "/dashboard/content-generator", iconName: "Presentation", description: "AI slide presentations & lesson plans", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Academic Operations" },

	// ─── Student Tools ───
	{ key: "aiGround", name: "AI Ground", path: "/dashboard/tools", iconName: "BrainCircuit", description: "AI playground and student coding studio", roles: ["super_admin", "co_admin", "student"], category: "Student Tools" },
	{ key: "buddyAi", name: "Buddy AI (Student)", path: "/dashboard/gyanisage", iconName: "SmilePlus", description: "Personalized student study companion", roles: ["super_admin", "co_admin", "student"], category: "Student Tools" },

	// ─── Innovation Cell ───
	{ key: "campus", name: "Campus Hub", path: "/dashboard/campus", iconName: "Building2", description: "Campus facilities & infrastructure", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Innovation Cell" },
	{ key: "ideaSpark", name: "IDEA SPARK", path: "/dashboard/tools/idea-generation", iconName: "Lightbulb", description: "Brainstorming and venture ideation tool", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Innovation Cell" },
	{ key: "pitchCraft", name: "Pitch Craft", path: "/dashboard/content-generator", iconName: "FileStack", description: "Slide decks, pitch presentations & summaries", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Innovation Cell" },
	{ key: "incubation", name: "Incubation Hub", path: "/dashboard/incubation-hub", iconName: "Rocket", description: "Student startup & entrepreneurial incubator", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Innovation Cell" },

	// ─── Administration ───
	{ key: "transfer", name: "Transfer", path: "/dashboard/transfer", iconName: "ArrowRightLeft", description: "Student batch transfer & section promotions", roles: ["super_admin", "co_admin", "faculty"], category: "Administration" },
	{ key: "schoolManagement", name: "School Management", path: "/dashboard/school-management", iconName: "School", description: "School administration & infrastructure", roles: ["super_admin", "co_admin"], category: "Administration" },
	{ key: "schoolProfile", name: "School Profile", path: "/dashboard/school-profile", iconName: "Globe", description: "School public branding & profiles", roles: ["super_admin", "co_admin"], category: "Administration" },
	{ key: "studentManagement", name: "Student Management", path: "/dashboard/student-management", iconName: "GraduationCap", description: "Manage full student roster & admissions", roles: ["super_admin", "co_admin", "faculty"], category: "Administration" },
	{ key: "userManagement", name: "User Management", path: "/dashboard/users", iconName: "Users", description: "User directory, credentials & roster", roles: ["super_admin", "co_admin"], category: "Administration" },
	{ key: "userAccess", name: "Access & Roles", path: "/dashboard/user-access", iconName: "Shield", description: "Granular role and module permissions", roles: ["super_admin"], category: "Administration" },

	// ─── Events & Communication ───
	{ key: "messages", name: "Communication Hub", path: "/dashboard/messages", iconName: "MessagesSquare", description: "Institutional notices & messaging", roles: ["super_admin", "co_admin", "faculty", "student", "counselor", "parent"], category: "Events & Communication" },
	{ key: "eventsManagement", name: "Events Management", path: "/dashboard/events", iconName: "Calendar", description: "Publish, schedule and organize events", roles: ["super_admin", "co_admin"], category: "Events & Communication" },
	{ key: "events", name: "Campus / School Events", path: "/dashboard/events/student", iconName: "CalendarDays", description: "Browse upcoming institutional events", roles: ["super_admin", "co_admin", "faculty", "student", "parent"], category: "Events & Communication" },

	// ─── Counselor Specific ───
	{ key: "activeAlerts", name: "Active Safety Alerts", path: "/dashboard/counselor/safety-alerts", iconName: "AlertTriangle", description: "AI-flagged safety and well-being flags", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
	{ key: "riskTickets", name: "Risk Tickets", path: "/dashboard/counselor/risk-tickets", iconName: "ClipboardCheck", description: "Student mental wellness case tickets", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
	{ key: "alertHistory", name: "Alert History", path: "/dashboard/counselor/alert-history", iconName: "History", description: "Past alert logs & resolution records", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
	{ key: "activeSessions", name: "Active Counseling Sessions", path: "/dashboard/counselor/sessions", iconName: "Heart", description: "Ongoing one-on-one sessions", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
	{ key: "studentDir", name: "Student Directory", path: "/dashboard/counselor/students", iconName: "FolderOpen", description: "Counselor student directory view", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
	{ key: "chatHistory", name: "AI Chat History", path: "/dashboard/counselor/chat-history", iconName: "Bot", description: "Review monitored AI chat interactions", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
	{ key: "sessionNotes", name: "Session Notes", path: "/dashboard/counselor/notes", iconName: "Notebook", description: "Private counseling session clinical notes", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },

	// ─── Parent Specific ───
	{ key: "myChildren", name: "My Children", path: "/dashboard/parent/children", iconName: "Users", description: "View children profiles, grades & progress", roles: ["super_admin", "co_admin", "parent"], category: "Parent" },
	{ key: "teacherConnect", name: "Class Teacher Connect", path: "/dashboard/parent/teacher-chat", iconName: "Phone", description: "Message & conference with teachers", roles: ["super_admin", "co_admin", "parent"], category: "Parent" },
];

// Curated demo users fallback
const DEMO_USERS = [
	{
		id: "usr-1",
		full_name: "Aadhya Menon",
		email: "aadhya.menon.5a@litera.test",
		role: "student",
		phone: "+91 98765 43210",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-indigo-500",
		initials: "AM",
	},
	{
		id: "usr-2",
		full_name: "Priya Sharma",
		email: "priya.sharma@litera.test",
		role: "faculty",
		phone: "+91 98765 43211",
		created_at: "2026-06-15T00:00:00Z",
		status: "Active",
		avatarBg: "bg-blue-600",
		initials: "PS",
	},
	{
		id: "usr-3",
		full_name: "Akshat SuperAdmin",
		email: "superadmin@litera.edu",
		role: "super_admin",
		phone: "+91 98765 43212",
		created_at: "2026-05-10T00:00:00Z",
		status: "Active",
		avatarBg: "bg-purple-600",
		initials: "AS",
	},
	{
		id: "usr-4",
		full_name: "Rajesh Verma",
		email: "rajesh.verma@litera.test",
		role: "co_admin",
		phone: "+91 98765 43213",
		created_at: "2026-05-20T00:00:00Z",
		status: "Active",
		avatarBg: "bg-teal-600",
		initials: "RV",
	},
	{
		id: "usr-5",
		full_name: "Dr. Ananya Sen",
		email: "ananya.sen@litera.test",
		role: "counselor",
		phone: "+91 98765 43214",
		created_at: "2026-06-01T00:00:00Z",
		status: "Active",
		avatarBg: "bg-rose-500",
		initials: "AS",
	},
	{
		id: "usr-6",
		full_name: "Ramesh Gupta",
		email: "ramesh.gupta@parent.test",
		role: "parent",
		phone: "+91 98765 43215",
		created_at: "2026-07-02T00:00:00Z",
		status: "Active",
		avatarBg: "bg-amber-600",
		initials: "RG",
	},
	{
		id: "usr-7",
		full_name: "Devvrat Gupta",
		email: "guptadevvrat49@gmail.com",
		role: "student",
		phone: "+91 93242 85355",
		created_at: "2026-07-31T00:00:00Z",
		status: "Active",
		avatarBg: "bg-teal-500",
		initials: "DG",
	},
	{
		id: "usr-8",
		full_name: "Om Prabhu",
		email: "om.prabhu.11a@litera.test",
		role: "student",
		phone: "+91 98765 99988",
		created_at: "2026-06-30T00:00:00Z",
		status: "Active",
		avatarBg: "bg-emerald-500",
		initials: "OP",
	},
];

// Render Icon helper
function DynamicModuleIcon({ name, className = "h-4 w-4" }) {
	switch (name) {
		case "Home":
			return <Globe className={className} />;
		case "Settings":
			return <Wrench className={className} />;
		case "Sparkles":
			return <Sparkles className={className} />;
		case "Bot":
			return <Bot className={className} />;
		case "Rocket":
			return <Rocket className={className} />;
		case "Wrench":
			return <Wrench className={className} />;
		case "Video":
			return <Video className={className} />;
		case "MessageSquare":
			return <MessageSquare className={className} />;
		case "Shuffle":
			return <Shuffle className={className} />;
		case "Mic":
			return <Mic className={className} />;
		case "BarChart3":
			return <BarChart3 className={className} />;
		case "FileText":
			return <FileText className={className} />;
		case "Gamepad2":
			return <Gamepad2 className={className} />;
		case "Headphones":
			return <Headphones className={className} />;
		case "Puzzle":
			return <Puzzle className={className} />;
		case "FileEdit":
			return <FileEdit className={className} />;
		case "ClipboardList":
			return <ClipboardList className={className} />;
		case "GraduationCap":
			return <GraduationCap className={className} />;
		case "CheckCircle2":
			return <CheckCircle2 className={className} />;
		case "Clock":
			return <Clock className={className} />;
		case "CalendarDays":
			return <CalendarDays className={className} />;
		case "School":
			return <School className={className} />;
		case "TrendingUp":
			return <TrendingUp className={className} />;
		case "Activity":
			return <Activity className={className} />;
		case "Presentation":
			return <Presentation className={className} />;
		case "BrainCircuit":
			return <BrainCircuit className={className} />;
		case "SmilePlus":
			return <SmilePlus className={className} />;
		case "Building2":
			return <Building2 className={className} />;
		case "Lightbulb":
			return <Lightbulb className={className} />;
		case "FileStack":
			return <FileStack className={className} />;
		case "ArrowRightLeft":
			return <ArrowRightLeft className={className} />;
		case "Users":
			return <Users className={className} />;
		case "Shield":
			return <Shield className={className} />;
		case "MessagesSquare":
			return <MessagesSquare className={className} />;
		case "Calendar":
			return <Calendar className={className} />;
		case "AlertTriangle":
			return <AlertTriangle className={className} />;
		case "ClipboardCheck":
			return <ClipboardCheck className={className} />;
		case "History":
			return <History className={className} />;
		case "Heart":
			return <Heart className={className} />;
		case "FolderOpen":
			return <FolderOpen className={className} />;
		case "Notebook":
			return <Notebook className={className} />;
		case "Phone":
			return <Phone className={className} />;
		default:
			return <Layers className={className} />;
	}
}

// Role badge styling
function getRoleBadgeProps(role) {
	switch (role) {
		case "super_admin":
			return { label: "Super Admin", color: "bg-purple-50 text-purple-700 border-purple-200/70" };
		case "co_admin":
			return { label: "Co Admin", color: "bg-indigo-50 text-indigo-700 border-indigo-200/70" };
		case "faculty":
			return { label: "Faculty", color: "bg-blue-50 text-blue-700 border-blue-200/70" };
		case "student":
			return { label: "Student", color: "bg-emerald-50 text-emerald-700 border-emerald-200/70" };
		case "counselor":
			return { label: "Counselor", color: "bg-pink-50 text-pink-700 border-pink-200/70" };
		case "parent":
			return { label: "Parent", color: "bg-amber-50 text-amber-700 border-amber-200/70" };
		default:
			return { label: role ? role.replace(/_/g, " ") : "User", color: "bg-slate-100 text-slate-700 border-slate-200" };
	}
}

export default function UserAccessPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	// State
	const [users, setUsers] = useState(DEMO_USERS);
	const [selectedUser, setSelectedUser] = useState(null);
	const [enabledModules, setEnabledModules] = useState(new Set());
	const [userModuleCounts, setUserModuleCounts] = useState({});
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [loadingUsers, setLoadingUsers] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [accessFilter, setAccessFilter] = useState("all");
	const [modalCategoryFilter, setModalCategoryFilter] = useState("all");
	const [modalSearchQuery, setModalSearchQuery] = useState("");
	const [selectedRowIds, setSelectedRowIds] = useState(new Set());
	const [activeActionRow, setActiveActionRow] = useState(null);

	// Toast notification state
	const [successMsg, setSuccessMsg] = useState("");
	const [errorMsg, setErrorMsg] = useState("");

	// Dropdown states for filters
	const [roleFilterOpen, setRoleFilterOpen] = useState(false);
	const [accessFilterOpen, setAccessFilterOpen] = useState(false);
	const roleFilterRef = useRef(null);
	const accessFilterRef = useRef(null);

	// Get distinct categories
	const categories = useMemo(() => {
		return [...new Set(AVAILABLE_MODULES.map((m) => m.category))];
	}, []);

	// Applicable modules for role
	const getModulesForRole = (role) => {
		if (!role) return [];
		if (role === "super_admin") return AVAILABLE_MODULES;
		return AVAILABLE_MODULES.filter((m) => m.roles.includes(role));
	};

	// Close dropdowns on outside click
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (roleFilterRef.current && !roleFilterRef.current.contains(e.target)) {
				setRoleFilterOpen(false);
			}
			if (accessFilterRef.current && !accessFilterRef.current.contains(e.target)) {
				setAccessFilterOpen(false);
			}
			if (!e.target.closest(".row-action-menu")) {
				setActiveActionRow(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Redirect if not authenticated or not super_admin
	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		} else if (!loading && user && user.role !== "super_admin") {
			router.push("/dashboard");
		}
	}, [user, loading, router]);

	// Fetch users and user_access counts from Supabase
	useEffect(() => {
		if (user && user.role === "super_admin") {
			fetchUsers();
		}
	}, [user]);

	const fetchUsers = async () => {
		setLoadingUsers(true);
		try {
			if (!user?.school_id) {
				setLoadingUsers(false);
				return;
			}

			const { data, error } = await supabase
				.from("users")
				.select("id, email, full_name, role, phone, school_id, created_at")
				.eq("school_id", user.school_id)
				.order("created_at", { ascending: false });

			if (error) {
				console.warn("Error fetching users from Supabase, using roster:", error);
			} else if (data && data.length > 0) {
				const formatted = data.map((u, i) => {
					const nameParts = (u.full_name || u.email || "User").split(" ");
					const initials = nameParts.length > 1
						? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
						: (u.full_name || u.email || "US").slice(0, 2).toUpperCase();
					
					const colorList = ["bg-indigo-500", "bg-blue-600", "bg-purple-600", "bg-emerald-600", "bg-teal-600", "bg-rose-500", "bg-amber-600"];
					return {
						...u,
						status: "Active",
						initials,
						avatarBg: colorList[i % colorList.length],
					};
				});
				setUsers(formatted);
			}

			// Fetch all customized permissions to show badge counts
			const { data: accessData } = await supabase
				.from("user_access")
				.select("user_id, module_name");

			if (accessData) {
				const counts = {};
				accessData.forEach((row) => {
					counts[row.user_id] = (counts[row.user_id] || 0) + 1;
				});
				setUserModuleCounts(counts);
			}
		} catch (error) {
			console.error("Error loading users:", error);
		} finally {
			setLoadingUsers(false);
		}
	};

	// Fetch modules for specific user when opening modal
	const fetchUserModules = async (userId, role) => {
		try {
			const { data, error } = await supabase
				.from("user_access")
				.select("module_name")
				.eq("user_id", userId);

			if (error) {
				console.error("[UserAccess] Fetch error:", error);
				// If no record exists yet, initialize with default role modules
				const defaultForRole = getModulesForRole(role).map((m) => m.key);
				setEnabledModules(new Set(defaultForRole));
				return;
			}

			if (!data || data.length === 0) {
				// User has default role permissions
				const defaultForRole = getModulesForRole(role).map((m) => m.key);
				setEnabledModules(new Set(defaultForRole));
			} else {
				const moduleSet = new Set(data.map((d) => d.module_name));
				setEnabledModules(moduleSet);
			}
		} catch (error) {
			console.error("[UserAccess] Fetch exception:", error);
			const defaultForRole = getModulesForRole(role).map((m) => m.key);
			setEnabledModules(new Set(defaultForRole));
		}
	};

	// Open modal for user
	const handleManageAccess = (u) => {
		setSelectedUser(u);
		setModalCategoryFilter("all");
		setModalSearchQuery("");
		fetchUserModules(u.id, u.role);
		setShowModal(true);
	};

	// Toggle a module on/off
	const toggleModule = (moduleKey) => {
		setEnabledModules((prev) => {
			const next = new Set(prev);
			if (next.has(moduleKey)) {
				next.delete(moduleKey);
			} else {
				next.add(moduleKey);
			}
			return next;
		});
	};

	// Toggle all modules in a category
	const toggleCategory = (categoryName) => {
		if (!selectedUser) return;
		const categoryModules = getModulesForRole(selectedUser.role).filter(
			(m) => m.category === categoryName
		);
		const allCurrentlyEnabled = categoryModules.every((m) =>
			enabledModules.has(m.key)
		);

		setEnabledModules((prev) => {
			const next = new Set(prev);
			if (allCurrentlyEnabled) {
				categoryModules.forEach((m) => next.delete(m.key));
			} else {
				categoryModules.forEach((m) => next.add(m.key));
			}
			return next;
		});
	};

	// Save module access
	const handleSaveAccess = async () => {
		if (!selectedUser) return;

		setSaving(true);
		try {
			// Delete existing access for this user
			const { error: deleteError } = await supabase
				.from("user_access")
				.delete()
				.eq("user_id", selectedUser.id);

			if (deleteError) {
				console.warn("[UserAccess] Delete notice:", deleteError);
			}

			// Insert enabled modules
			const records = [...enabledModules].map((moduleKey) => {
				const mod = AVAILABLE_MODULES.find((m) => m.key === moduleKey);
				return {
					user_id: selectedUser.id,
					module_name: moduleKey,
					sub_domain: mod?.path || null,
					access_type: "all",
				};
			});

			if (records.length > 0) {
				const { error: insertError } = await supabase
					.from("user_access")
					.insert(records);

				if (insertError) {
					console.warn("[UserAccess] Insert notice:", insertError);
				}
			}

			// Update local badge counts
			setUserModuleCounts((prev) => ({
				...prev,
				[selectedUser.id]: records.length,
			}));

			setSuccessMsg(
				`Access permissions saved for ${selectedUser.full_name || selectedUser.email}! (${records.length} modules granted)`
			);
			setShowModal(false);
			setSelectedUser(null);
			setTimeout(() => setSuccessMsg(""), 4000);
		} catch (error) {
			console.error("Error saving access:", error);
			setErrorMsg("Failed to save access permissions: " + error.message);
			setTimeout(() => setErrorMsg(""), 4000);
		} finally {
			setSaving(false);
		}
	};

	// Quick actions inside modal
	const enableAllForRole = () => {
		if (!selectedUser) return;
		const roleModules = getModulesForRole(selectedUser.role);
		setEnabledModules(new Set(roleModules.map((m) => m.key)));
	};

	const grantAllModules = () => {
		setEnabledModules(new Set(AVAILABLE_MODULES.map((m) => m.key)));
	};

	const disableAll = () => {
		setEnabledModules(new Set());
	};

	// Selection handlers for bulk operations
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

	// Bulk Reset to Role Defaults
	const handleBulkReset = async () => {
		if (selectedRowIds.size === 0) return;
		if (!confirm(`Reset access to default role permissions for ${selectedRowIds.size} selected users?`)) return;

		try {
			const idsArray = [...selectedRowIds];
			await supabase.from("user_access").delete().in("user_id", idsArray);

			setUserModuleCounts((prev) => {
				const next = { ...prev };
				idsArray.forEach((id) => delete next[id]);
				return next;
			});

			setSelectedRowIds(new Set());
			setSuccessMsg(`Reset permissions to default for ${idsArray.length} users.`);
			setTimeout(() => setSuccessMsg(""), 3500);
		} catch (err) {
			console.error("Error in bulk reset:", err);
			setErrorMsg("Failed to reset selected users.");
		}
	};

	// Export Permissions Matrix to Excel
	const handleExportExcel = () => {
		if (users.length === 0) {
			alert("No users to export.");
			return;
		}
		const rows = users.map((u, index) => {
			const customCount = userModuleCounts[u.id];
			const roleMods = getModulesForRole(u.role).length;
			return {
				"Sl No": index + 1,
				"User ID": u.id,
				"Full Name": u.full_name || "N/A",
				Email: u.email,
				Role: u.role?.toUpperCase(),
				Phone: u.phone || "N/A",
				"Permission Type": customCount !== undefined ? "Custom Overrides" : "Role Default",
				"Modules Enabled": customCount !== undefined ? customCount : `${roleMods} (Default)`,
				"Joined Date": new Date(u.created_at).toLocaleDateString(),
				Status: u.status || "Active",
			};
		});

		const ws = XLSX.utils.json_to_sheet(rows);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Access Matrix");
		XLSX.writeFile(
			wb,
			`Litera_Valley_Access_Roles_${new Date().toISOString().slice(0, 10)}.xlsx`
		);
	};

	// Filtered users
	const filteredUsers = useMemo(() => {
		return users.filter((u) => {
			const name = (u.full_name || "").toLowerCase();
			const email = (u.email || "").toLowerCase();
			const role = (u.role || "").toLowerCase();
			const query = searchQuery.trim().toLowerCase();

			const matchesSearch =
				query === "" ||
				name.includes(query) ||
				email.includes(query) ||
				role.includes(query) ||
				u.id.toLowerCase().includes(query);

			const matchesRole =
				roleFilter === "all" ||
				u.role?.toLowerCase() === roleFilter.toLowerCase();

			const hasCustomAccess = userModuleCounts[u.id] !== undefined;
			const matchesAccess =
				accessFilter === "all" ||
				(accessFilter === "custom" && hasCustomAccess) ||
				(accessFilter === "default" && !hasCustomAccess);

			return matchesSearch && matchesRole && matchesAccess;
		});
	}, [users, searchQuery, roleFilter, accessFilter, userModuleCounts]);

	// Filtered modules inside Modal
	const modalFilteredModules = useMemo(() => {
		if (!selectedUser) return [];
		const roleModules = getModulesForRole(selectedUser.role);
		return roleModules.filter((m) => {
			const matchesCat =
				modalCategoryFilter === "all" || m.category === modalCategoryFilter;
			const matchesSearch =
				modalSearchQuery.trim() === "" ||
				m.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
				m.description.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
				m.path.toLowerCase().includes(modalSearchQuery.toLowerCase());
			return matchesCat && matchesSearch;
		});
	}, [selectedUser, modalCategoryFilter, modalSearchQuery]);

	// Categories available for the selected user in modal
	const modalCategories = useMemo(() => {
		if (!selectedUser) return [];
		const roleModules = getModulesForRole(selectedUser.role);
		return [...new Set(roleModules.map((m) => m.category))];
	}, [selectedUser]);

	const institutionalRoles = [
		{ key: "all", label: "All Roles" },
		{ key: "super_admin", label: "Super Admin" },
		{ key: "co_admin", label: "Co Admin" },
		{ key: "faculty", label: "Faculty" },
		{ key: "student", label: "Student" },
		{ key: "counselor", label: "Counselor" },
		{ key: "parent", label: "Parent" },
	];

	if (loading || loadingUsers) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
				<div className="text-center">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-orange-500 border-t-transparent" />
					<p className="mt-4 text-xs font-semibold text-slate-500">
						Loading Access & Roles...
					</p>
				</div>
			</div>
		);
	}

	if (!user || user.role !== "super_admin") return null;

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
							<span className="text-[#ea580c]">Access & Roles</span>
						</div>
						<h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl">
							User Access Management
						</h1>
						<p className="mt-1 text-xs font-medium text-slate-500">
							Control granular module visibility and role permissions for institutional users.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-2.5">
						{/* Bulk Reset Button if items selected */}
						{selectedRowIds.size > 0 && (
							<button
								type="button"
								onClick={handleBulkReset}
								className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-xs transition hover:bg-rose-100 animate-in fade-in"
							>
								<RefreshCw className="h-3.5 w-3.5" />
								<span>Reset Selected ({selectedRowIds.size})</span>
							</button>
						)}

						{/* Export Excel Button */}
						<button
							type="button"
							onClick={handleExportExcel}
							className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
						>
							<Download className="h-4 w-4 text-slate-500" />
							<span>Export</span>
						</button>

						{/* Refresh Roster Button */}
						<button
							type="button"
							onClick={fetchUsers}
							className="dashboard-btn-primary flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm"
						>
							<RefreshCw className="h-3.5 w-3.5 stroke-[2.5]" />
							<span>Sync Permissions</span>
						</button>
					</div>
				</div>

				{/* Toast Alerts */}
				{successMsg && (
					<div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2">
						<CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
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
					{/* Card 1: Total Users */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf5ff] text-[#2563eb]">
							<Users className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">Total Users</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								{users.length.toLocaleString()}
							</p>
						</div>
					</div>

					{/* Card 2: Total Modules */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f5f0ff] text-[#8b5cf6]">
							<Layers className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">
								Total Modules
							</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								{AVAILABLE_MODULES.length}
							</p>
						</div>
					</div>

					{/* Card 3: Categories */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#eafaf1] text-[#10b981]">
							<FolderTree className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">
								Module Categories
							</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								{categories.length}
							</p>
						</div>
					</div>

					{/* Card 4: Institutional Roles */}
					<div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
						<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fef8e7] text-[#f59e0b]">
							<ShieldCheck className="h-6 w-6" strokeWidth={2.2} />
						</div>
						<div className="min-w-0">
							<p className="text-xs font-medium text-slate-500">
								Active Roles
							</p>
							<p className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
								6 Roles
							</p>
						</div>
					</div>
				</div>

				{/* ── Search & Filter Controls ── */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					{/* Left: Search Input */}
					<div className="relative w-full sm:max-w-md">
						<Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							placeholder="Search users by name, email, or role..."
							autoComplete="off"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9.5 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/15"
						/>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery("")}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								<X className="h-3.5 w-3.5" />
							</button>
						)}
					</div>

					{/* Right: Dropdown Filters */}
					<div className="flex flex-wrap items-center gap-2.5">
						{/* 1. Role Filter */}
						<div className="relative" ref={roleFilterRef}>
							<button
								type="button"
								onClick={() => {
									setRoleFilterOpen((prev) => !prev);
									setAccessFilterOpen(false);
								}}
								className={`flex min-w-[130px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									roleFilterOpen
										? "border-[#ea580c] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200/90"
								}`}
							>
								<span>
									{institutionalRoles.find((r) => r.key === roleFilter)?.label ||
										"All Roles"}
								</span>
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${
										roleFilterOpen ? "rotate-180 text-slate-700" : "text-slate-400"
									}`}
								/>
							</button>

							{roleFilterOpen && (
								<div className="absolute left-0 z-40 mt-1.5 min-w-full w-44 origin-top-left rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
									{institutionalRoles.map((r) => (
										<button
											key={r.key}
											type="button"
											onClick={() => {
												setRoleFilter(r.key);
												setRoleFilterOpen(false);
											}}
											className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
												roleFilter === r.key
													? "bg-[#fff8f3] font-bold text-[#ea580c]"
													: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											<span>{r.label}</span>
											{roleFilter === r.key && (
												<Check className="h-3.5 w-3.5 text-[#ea580c]" />
											)}
										</button>
									))}
								</div>
							)}
						</div>

						{/* 2. Access Filter */}
						<div className="relative" ref={accessFilterRef}>
							<button
								type="button"
								onClick={() => {
									setAccessFilterOpen((prev) => !prev);
									setRoleFilterOpen(false);
								}}
								className={`flex min-w-[140px] items-center justify-between gap-2.5 rounded-2xl border bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none ${
									accessFilterOpen
										? "border-[#ea580c] ring-2 ring-[#ea580c]/15 text-slate-900"
										: "border-slate-200/90"
								}`}
							>
								<span>
									{accessFilter === "all"
										? "All Permissions"
										: accessFilter === "custom"
										? "Custom Access"
										: "Role Default"}
								</span>
								<ChevronDown
									className={`h-3.5 w-3.5 transition-transform duration-200 ${
										accessFilterOpen ? "rotate-180 text-slate-700" : "text-slate-400"
									}`}
								/>
							</button>

							{accessFilterOpen && (
								<div className="absolute right-0 z-40 mt-1.5 min-w-full w-48 origin-top-right rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
									{[
										{ key: "all", label: "All Permissions" },
										{ key: "custom", label: "Custom Overrides Only" },
										{ key: "default", label: "Default Role Access" },
									].map((a) => (
										<button
											key={a.key}
											type="button"
											onClick={() => {
												setAccessFilter(a.key);
												setAccessFilterOpen(false);
											}}
											className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
												accessFilter === a.key
													? "bg-[#fff8f3] font-bold text-[#ea580c]"
													: "font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
											}`}
										>
											<span>{a.label}</span>
											{accessFilter === a.key && (
												<Check className="h-3.5 w-3.5 text-[#ea580c]" />
											)}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* ── Data Table ── */}
				<div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							{/* Table Header */}
							<thead className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
									<th className="px-4 py-3.5">User Details</th>
									<th className="px-4 py-3.5">Role</th>
									<th className="px-4 py-3.5">Access Status</th>
									<th className="px-4 py-3.5">Contact</th>
									<th className="px-4 py-3.5">Joined</th>
									<th className="px-4 py-3.5 text-right">Actions</th>
								</tr>
							</thead>

							{/* Table Body */}
							<tbody className="divide-y divide-slate-100 font-medium text-slate-700">
								{filteredUsers.length === 0 ? (
									<tr>
										<td colSpan={7} className="px-6 py-12 text-center text-slate-400">
											<div className="flex flex-col items-center justify-center gap-2">
												<Users className="h-8 w-8 text-slate-300" />
												<p className="text-sm font-semibold text-slate-600">
													No users found matching your filters.
												</p>
												<button
													onClick={() => {
														setSearchQuery("");
														setRoleFilter("all");
														setAccessFilter("all");
													}}
													className="text-xs font-bold text-orange-600 hover:underline"
												>
													Clear all filters
												</button>
											</div>
										</td>
									</tr>
								) : (
									filteredUsers.map((u) => {
										const isSelected = selectedRowIds.has(u.id);
										const isMenuOpen = activeActionRow === u.id;
										const roleBadge = getRoleBadgeProps(u.role);
										const customCount = userModuleCounts[u.id];
										const defaultRoleCount = getModulesForRole(u.role).length;

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

												{/* User details */}
												<td className="px-4 py-3.5">
													<div className="flex items-center gap-3">
														<div
															className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs ${
																u.avatarBg || "bg-indigo-500"
															}`}
														>
															{u.initials || "US"}
														</div>
														<div className="min-w-0">
															<p className="font-bold text-slate-900 truncate">
																{u.full_name || "Unnamed User"}
															</p>
															<p className="text-[11px] font-normal text-slate-400 truncate">
																{u.email}
															</p>
															<p className="text-[10px] text-slate-400 font-mono">
																ID: {u.id.slice(0, 10)}
															</p>
														</div>
													</div>
												</td>

												{/* Role */}
												<td className="px-4 py-3.5">
													<span
														className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${roleBadge.color}`}
													>
														<Shield className="h-3 w-3" />
														<span>{roleBadge.label}</span>
													</span>
												</td>

												{/* Access status */}
												<td className="px-4 py-3.5">
													{customCount !== undefined ? (
														<div className="flex items-center gap-1.5">
															<span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[11px] font-bold text-[#ea580c]">
																<KeyRound className="h-3 w-3" />
																<span>{customCount} Custom Modules</span>
															</span>
														</div>
													) : (
														<div className="flex items-center gap-1.5">
															<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
																<Check className="h-3 w-3 text-emerald-600" />
																<span>Role Default ({defaultRoleCount})</span>
															</span>
														</div>
													)}
												</td>

												{/* Contact */}
												<td className="px-4 py-3.5 text-slate-600 font-medium">
													{u.phone || "—"}
												</td>

												{/* Joined Date */}
												<td className="px-4 py-3.5 text-slate-500 font-normal">
													{new Date(u.created_at || Date.now()).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
													})}
												</td>

												{/* Actions */}
												<td className="px-4 py-3.5 text-right">
													<div className="flex items-center justify-end gap-2">
														<button
															type="button"
															onClick={() => handleManageAccess(u)}
															className="flex items-center gap-1.5 rounded-xl bg-[#fff8f3] border border-[#ea580c]/30 px-3 py-1.5 text-xs font-bold text-[#ea580c] transition hover:bg-[#ea580c] hover:text-white shadow-2xs"
														>
															<KeyRound className="h-3.5 w-3.5" />
															<span>Manage Access</span>
														</button>

														<div className="relative row-action-menu">
															<button
																type="button"
																onClick={() =>
																	setActiveActionRow((prev) =>
																		prev === u.id ? null : u.id
																	)
																}
																className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
															>
																<MoreVertical className="h-4 w-4" />
															</button>

															{isMenuOpen && (
																<div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5">
																	<button
																		type="button"
																		onClick={() => {
																			handleManageAccess(u);
																			setActiveActionRow(null);
																		}}
																		className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
																	>
																		<KeyRound className="h-3.5 w-3.5 text-[#ea580c]" />
																		<span>Configure Access</span>
																	</button>
																	<button
																		type="button"
																		onClick={async () => {
																			await supabase.from("user_access").delete().eq("user_id", u.id);
																			setUserModuleCounts((prev) => {
																				const next = { ...prev };
																				delete next[u.id];
																				return next;
																			});
																			setActiveActionRow(null);
																			setSuccessMsg(`Reset permissions to default for ${u.full_name || u.email}.`);
																			setTimeout(() => setSuccessMsg(""), 3000);
																		}}
																		className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
																	>
																		<RefreshCw className="h-3.5 w-3.5 text-blue-500" />
																		<span>Reset to Default</span>
																	</button>
																	<button
																		type="button"
																		onClick={() => {
																			navigator.clipboard.writeText(u.id);
																			setActiveActionRow(null);
																			setSuccessMsg(`Copied User ID to clipboard!`);
																			setTimeout(() => setSuccessMsg(""), 2500);
																		}}
																		className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
																	>
																		<Copy className="h-3.5 w-3.5 text-slate-500" />
																		<span>Copy User ID</span>
																	</button>
																</div>
															)}
														</div>
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
					<div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-4 py-3 sm:flex-row text-xs text-slate-500 font-medium">
						<div>
							Showing <span className="font-bold text-slate-900">{filteredUsers.length}</span> of{" "}
							<span className="font-bold text-slate-900">{users.length}</span> total users
						</div>
						<div className="flex items-center gap-1.5 text-[11px] text-slate-400">
							<ShieldCheck className="h-3.5 w-3.5 text-[#ea580c]" />
							<span>Changes take effect immediately on next user session refresh.</span>
						</div>
					</div>
				</div>
			</div>

			{/* ── Granular Access Configuration Modal ── */}
			{showModal && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
					<div className="flex flex-col w-full max-w-5xl max-h-[92vh] rounded-3xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
						{/* Modal Header */}
						<div className="flex items-start justify-between border-b border-slate-100 bg-slate-50/70 p-5 sm:p-6">
							<div className="flex items-center gap-3.5">
								<div
									className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white shadow-xs ${
										selectedUser.avatarBg || "bg-indigo-500"
									}`}
								>
									{selectedUser.initials || "US"}
								</div>
								<div>
									<div className="flex items-center gap-2">
										<h2 className="text-lg font-bold text-slate-900">
											{selectedUser.full_name || selectedUser.email}
										</h2>
										<span
											className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
												getRoleBadgeProps(selectedUser.role).color
											}`}
										>
											{getRoleBadgeProps(selectedUser.role).label}
										</span>
									</div>
									<p className="text-xs font-normal text-slate-500 mt-0.5">
										{selectedUser.email} &bull; <span className="font-mono text-[11px]">ID: {selectedUser.id}</span>
									</p>
								</div>
							</div>

							<button
								onClick={() => {
									setShowModal(false);
									setSelectedUser(null);
								}}
								className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						{/* Modal Controls & Stats Bar */}
						<div className="border-b border-slate-100 bg-white p-4 sm:px-6 space-y-3">
							<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								{/* Quick Action Buttons */}
								<div className="flex flex-wrap items-center gap-2">
									<span className="text-xs font-bold text-slate-500">Quick Actions:</span>
									<button
										type="button"
										onClick={enableAllForRole}
										className="rounded-xl bg-[#fff8f3] border border-[#ea580c]/30 px-3 py-1.5 text-xs font-bold text-[#ea580c] transition hover:bg-[#ea580c] hover:text-white"
									>
										Role Default
									</button>
									<button
										type="button"
										onClick={grantAllModules}
										className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
									>
										Grant All
									</button>
									<button
										type="button"
										onClick={disableAll}
										className="rounded-xl bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
									>
										Revoke All
									</button>
								</div>

								{/* Enabled Counter Pill */}
								<div className="flex items-center gap-2">
									<span className="rounded-xl bg-orange-50 border border-orange-200 px-3 py-1.5 text-xs font-bold text-[#ea580c]">
										{enabledModules.size} of {getModulesForRole(selectedUser.role).length} Allowed Modules Enabled
									</span>
								</div>
							</div>

							{/* Search & Category Filter Pills */}
							<div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-1">
								{/* Category Tabs */}
								<div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
									<button
										type="button"
										onClick={() => setModalCategoryFilter("all")}
										className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
											modalCategoryFilter === "all"
												? "bg-[#0f172a] text-white"
												: "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
										}`}
									>
										All Categories
									</button>
									{modalCategories.map((cat) => (
										<button
											key={cat}
											type="button"
											onClick={() => setModalCategoryFilter(cat)}
											className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
												modalCategoryFilter === cat
													? "bg-[#0f172a] text-white"
													: "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
											}`}
										>
											{cat}
										</button>
									))}
								</div>

								{/* Module Search */}
								<div className="relative shrink-0 sm:w-60">
									<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
									<input
										type="text"
										placeholder="Filter modules..."
										value={modalSearchQuery}
										onChange={(e) => setModalSearchQuery(e.target.value)}
										className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8.5 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none"
									/>
									{modalSearchQuery && (
										<button
											onClick={() => setModalSearchQuery("")}
											className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
										>
											<X className="h-3 w-3" />
										</button>
									)}
								</div>
							</div>
						</div>

						{/* Modal Scrollable Module Grid */}
						<div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/40">
							{modalCategories
								.filter(
									(cat) =>
										modalCategoryFilter === "all" || modalCategoryFilter === cat
								)
								.map((category) => {
									const categoryModules = modalFilteredModules.filter(
										(m) => m.category === category
									);
									if (categoryModules.length === 0) return null;

									const enabledCountInCategory = categoryModules.filter((m) =>
										enabledModules.has(m.key)
									).length;

									return (
										<div key={category} className="space-y-3">
											{/* Category Header */}
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
														{category}
													</h3>
													<span className="rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
														{enabledCountInCategory} / {categoryModules.length}
													</span>
												</div>

												<button
													type="button"
													onClick={() => toggleCategory(category)}
													className="text-[11px] font-bold text-[#ea580c] hover:underline"
												>
													{enabledCountInCategory === categoryModules.length
														? "Disable All"
														: "Enable All"}
												</button>
											</div>

											{/* Module Cards Grid */}
											<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
												{categoryModules.map((mod) => {
													const isEnabled = enabledModules.has(mod.key);

													return (
														<button
															key={mod.key}
															type="button"
															onClick={() => toggleModule(mod.key)}
															className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all hover:shadow-md ${
																isEnabled
																	? "border-[#ea580c] bg-white ring-2 ring-[#ea580c]/10 shadow-xs"
																	: "border-slate-200 bg-white/70 opacity-75 hover:opacity-100"
															}`}
														>
															<div
																className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
																	isEnabled
																		? "bg-[#fff8f3] text-[#ea580c]"
																		: "bg-slate-100 text-slate-400"
																}`}
															>
																<DynamicModuleIcon
																	name={mod.iconName}
																	className="h-4 w-4"
																/>
															</div>

															<div className="min-w-0 flex-1">
																<div className="flex items-center justify-between gap-1">
																	<p
																		className={`text-xs font-bold truncate ${
																			isEnabled ? "text-slate-900" : "text-slate-600"
																		}`}
																	>
																		{mod.name}
																	</p>
																</div>
																<p className="mt-0.5 line-clamp-2 text-[11px] font-normal text-slate-500">
																	{mod.description}
																</p>
																<p className="mt-1 font-mono text-[9px] text-slate-400">
																	{mod.path}
																</p>
															</div>

															{/* Checkbox circle */}
															<div
																className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
																	isEnabled
																		? "border-[#ea580c] bg-[#ea580c] text-white"
																		: "border-slate-300 bg-slate-50 text-transparent"
																}`}
															>
																<Check className="h-3 w-3 stroke-[3]" />
															</div>
														</button>
													);
												})}
											</div>
										</div>
									);
								})}

							{modalFilteredModules.length === 0 && (
								<div className="py-12 text-center text-slate-400">
									<Sliders className="mx-auto h-8 w-8 text-slate-300 mb-2" />
									<p className="text-xs font-semibold text-slate-600">
										No modules found matching &ldquo;{modalSearchQuery}&rdquo;
									</p>
								</div>
							)}
						</div>

						{/* Modal Footer */}
						<div className="flex items-center justify-between border-t border-slate-100 bg-white p-4 sm:px-6">
							<button
								type="button"
								onClick={() => {
									setShowModal(false);
									setSelectedUser(null);
								}}
								className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
							>
								Cancel
							</button>

							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={handleSaveAccess}
									disabled={saving}
									className="dashboard-btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-md disabled:opacity-50"
								>
									{saving ? (
										<>
											<div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
											<span>Saving Access...</span>
										</>
									) : (
										<>
											<ShieldCheck className="h-4 w-4 stroke-[2.5]" />
											<span>Save Permissions</span>
										</>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
