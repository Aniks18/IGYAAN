"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import {
	Search,
	Plus,
	ChevronDown,
	ChevronUp,
	MoreVertical,
	Users,
	BookOpen,
	GraduationCap,
	Clock,
	Calendar,
	Check,
	CheckCircle,
	X,
	Edit3,
	Trash2,
	UserPlus,
	BookPlus,
	UserCheck,
	CalendarDays,
	ArrowRight,
	MapPin,
	School,
	AlertCircle,
	SlidersHorizontal,
	Phone,
	Mail,
	Sparkles,
	Activity,
} from "lucide-react";

// Default Initial Demo Class Hierarchy matching Figma Design exactly
const INITIAL_CLASSES = [
	{
		id: "grade-1",
		grade: "Class 1",
		gradeNum: 1,
		sections: [
			{
				id: "sec-1a",
				name: "1A",
				sectionLetter: "A",
				studentCount: 23,
				subjectsCount: 12,
				teachersCount: 36,
				attendanceRate: "78%",
				room: "Room 104",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Ms. Priya Sharma",
					email: "priya.sharma@litravalley.edu",
					phone: "+91 9876543210",
					avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
					experience: "8 yrs",
					subject: "Hindi & EVS",
				},
			},
			{
				id: "sec-1b",
				name: "1B",
				sectionLetter: "B",
				studentCount: 38,
				subjectsCount: 12,
				teachersCount: 36,
				attendanceRate: "84%",
				room: "Room 105",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Mr. Rajesh Verma",
					email: "rajesh.verma@litravalley.edu",
					phone: "+91 9876543211",
					avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
					experience: "10 yrs",
					subject: "Mathematics",
				},
			},
			{
				id: "sec-1c",
				name: "1C",
				sectionLetter: "C",
				studentCount: 22,
				subjectsCount: 12,
				teachersCount: 36,
				attendanceRate: "91%",
				room: "Room 106",
				academicYear: "2026-27",
				createdOn: "12 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Ms. Ananya Roy",
					email: "ananya.roy@litravalley.edu",
					phone: "+91 9876543212",
					avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
					experience: "4 yrs",
					subject: "English",
				},
			},
		],
	},
	{
		id: "grade-2",
		grade: "Class 2",
		gradeNum: 2,
		sections: [
			{
				id: "sec-2a",
				name: "2A",
				sectionLetter: "A",
				studentCount: 28,
				subjectsCount: 10,
				teachersCount: 32,
				attendanceRate: "82%",
				room: "Room 201",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Mr. David Kim",
					email: "david.kim.artistic.edu",
					phone: "+91 9876543214",
					avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
					experience: "7 yrs",
					subject: "Art",
				},
			},
			{
				id: "sec-2b",
				name: "2B",
				sectionLetter: "B",
				studentCount: 31,
				subjectsCount: 10,
				teachersCount: 32,
				attendanceRate: "79%",
				room: "Room 202",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Ms. Laura White",
					email: "laura.white.techuniverse.edu",
					phone: "+91 9876543215",
					avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
					experience: "9 yrs",
					subject: "Technology",
				},
			},
		],
	},
	{
		id: "grade-3",
		grade: "Class 3",
		gradeNum: 3,
		sections: [
			{
				id: "sec-3a",
				name: "3A",
				sectionLetter: "A",
				studentCount: 30,
				subjectsCount: 11,
				teachersCount: 34,
				attendanceRate: "88%",
				room: "Room 301",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Ms. Sara Thompson",
					email: "sara.thompson.history.com",
					phone: "+91 9876543216",
					avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
					experience: "4 yrs",
					subject: "History",
				},
			},
			{
				id: "sec-3b",
				name: "3B",
				sectionLetter: "B",
				studentCount: 29,
				subjectsCount: 11,
				teachersCount: 34,
				attendanceRate: "85%",
				room: "Room 302",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Mr. James Brown",
					email: "james.brown.musiczone.edu",
					phone: "+91 9876543217",
					avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
					experience: "2 yrs",
					subject: "Music",
				},
			},
			{
				id: "sec-3c",
				name: "3C",
				sectionLetter: "C",
				studentCount: 27,
				subjectsCount: 11,
				teachersCount: 34,
				attendanceRate: "81%",
				room: "Room 303",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Ms. Alice Green",
					email: "alice.green.languagearts.edu",
					phone: "+91 9876543218",
					avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
					experience: "5 yrs",
					subject: "Language Arts",
				},
			},
		],
	},
	{
		id: "grade-4",
		grade: "Class 4",
		gradeNum: 4,
		sections: [
			{
				id: "sec-4a",
				name: "4A",
				sectionLetter: "A",
				studentCount: 32,
				subjectsCount: 12,
				teachersCount: 35,
				attendanceRate: "86%",
				room: "Room 401",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Ms. Emily Johnson",
					email: "emily.johnson.educationhub.com",
					phone: "+91 9876543219",
					avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
					experience: "6 yrs",
					subject: "Mathematics",
				},
			},
			{
				id: "sec-4b",
				name: "4B",
				sectionLetter: "B",
				studentCount: 33,
				subjectsCount: 12,
				teachersCount: 35,
				attendanceRate: "89%",
				room: "Room 402",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Mr. Raj Patel",
					email: "rajpatel.literavalley.edu.in",
					phone: "+91 9876543220",
					avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
					experience: "5 yrs",
					subject: "Social Studies",
				},
			},
			{
				id: "sec-4c",
				name: "4C",
				sectionLetter: "C",
				studentCount: 30,
				subjectsCount: 12,
				teachersCount: 35,
				attendanceRate: "83%",
				room: "Room 403",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Mr. Peter Wilson",
					email: "peter.wilson.pe.edu",
					phone: "+91 9876543221",
					avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
					experience: "10 yrs",
					subject: "Physical Education",
				},
			},
			{
				id: "sec-4d",
				name: "4D",
				sectionLetter: "D",
				studentCount: 28,
				subjectsCount: 12,
				teachersCount: 35,
				attendanceRate: "87%",
				room: "Room 404",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Ms. Kavita Shah",
					email: "kavita.shah@literavalley.edu",
					phone: "+91 9876543222",
					avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80",
					experience: "7 yrs",
					subject: "Science",
				},
			},
		],
	},
	{
		id: "grade-5",
		grade: "Class 5",
		gradeNum: 5,
		sections: [
			{
				id: "sec-5a",
				name: "5A",
				sectionLetter: "A",
				studentCount: 34,
				subjectsCount: 13,
				teachersCount: 38,
				attendanceRate: "90%",
				room: "Room 501",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Dr. Suresh Nair",
					email: "suresh.nair@literavalley.edu",
					phone: "+91 9876543223",
					avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
					experience: "14 yrs",
					subject: "Physics",
				},
			},
			{
				id: "sec-5b",
				name: "5B",
				sectionLetter: "B",
				studentCount: 31,
				subjectsCount: 13,
				teachersCount: 38,
				attendanceRate: "88%",
				room: "Room 502",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Ms. Neha Gupta",
					email: "neha.gupta@literavalley.edu",
					phone: "+91 9876543224",
					avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
					experience: "6 yrs",
					subject: "Chemistry",
				},
			},
			{
				id: "sec-5c",
				name: "5C",
				sectionLetter: "C",
				studentCount: 29,
				subjectsCount: 13,
				teachersCount: 38,
				attendanceRate: "85%",
				room: "Room 503",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Mr. Amit Sen",
					email: "amit.sen@literavalley.edu",
					phone: "+91 9876543225",
					avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
					experience: "8 yrs",
					subject: "Biology",
				},
			},
			{
				id: "sec-5d",
				name: "5D",
				sectionLetter: "D",
				studentCount: 35,
				subjectsCount: 13,
				teachersCount: 38,
				attendanceRate: "82%",
				room: "Room 504",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Ms. Tanvi Mehra",
					email: "tanvi.mehra@literavalley.edu",
					phone: "+91 9876543226",
					avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
					experience: "5 yrs",
					subject: "Computer Science",
				},
			},
			{
				id: "sec-5e",
				name: "5E",
				sectionLetter: "E",
				studentCount: 30,
				subjectsCount: 13,
				teachersCount: 38,
				attendanceRate: "89%",
				room: "Room 505",
				academicYear: "2026-27",
				createdOn: "10 Apr 2026",
				createdBy: "Admin (Me)",
				status: "Active",
				classTeacher: {
					name: "Mr. Rohan Joshi",
					email: "rohan.joshi@literavalley.edu",
					phone: "+91 9876543227",
					avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
					experience: "9 yrs",
					subject: "Social Studies",
				},
			},
		],
	},
];

// Sample demo students for the selected class
const DEMO_STUDENTS = [
	{ id: "stu-1", rollNo: "01", name: "Aarav Sharma", idCode: "STU02401", gender: "Male", attendance: "96%", parentPhone: "+91 98111 22334", status: "Active" },
	{ id: "stu-2", rollNo: "02", name: "Diya Patel", idCode: "STU02402", gender: "Female", attendance: "92%", parentPhone: "+91 98111 22335", status: "Active" },
	{ id: "stu-3", rollNo: "03", name: "Kabir Mehta", idCode: "STU02403", gender: "Male", attendance: "78%", parentPhone: "+91 98111 22336", status: "Active" },
	{ id: "stu-4", rollNo: "04", name: "Ishaan Verma", idCode: "STU02404", gender: "Male", attendance: "88%", parentPhone: "+91 98111 22337", status: "Active" },
	{ id: "stu-5", rollNo: "05", name: "Ananya Iyer", idCode: "STU02405", gender: "Female", attendance: "98%", parentPhone: "+91 98111 22338", status: "Active" },
	{ id: "stu-6", rollNo: "06", name: "Rohan Gupta", idCode: "STU02406", gender: "Male", attendance: "74%", parentPhone: "+91 98111 22339", status: "Active" },
	{ id: "stu-7", rollNo: "07", name: "Sneha Joshi", idCode: "STU02407", gender: "Female", attendance: "90%", parentPhone: "+91 98111 22340", status: "Active" },
	{ id: "stu-8", rollNo: "08", name: "Vivaan Kapoor", idCode: "STU02408", gender: "Male", attendance: "85%", parentPhone: "+91 98111 22341", status: "Active" },
	{ id: "stu-9", rollNo: "09", name: "Tanvi Reddy", idCode: "STU02409", gender: "Female", attendance: "94%", parentPhone: "+91 98111 22342", status: "Active" },
	{ id: "stu-10", rollNo: "10", name: "Aditya Nair", idCode: "STU02410", gender: "Male", attendance: "82%", parentPhone: "+91 98111 22343", status: "Active" },
];

// Sample demo subjects assigned to Class 1A
const DEMO_SUBJECTS = [
	{ id: "sub-1", name: "Mathematics", code: "MTH-101", periodsPerWeek: 6, teacher: "Ms. Emily Johnson", type: "Core", room: "Room 104" },
	{ id: "sub-2", name: "English Language Arts", code: "ENG-101", periodsPerWeek: 6, teacher: "Ms. Alice Green", type: "Core", room: "Room 104" },
	{ id: "sub-3", name: "General Science", code: "SCI-101", periodsPerWeek: 5, teacher: "Ms. Kavita Shah", type: "Core", room: "Science Lab 1" },
	{ id: "sub-4", name: "Social Studies", code: "SST-101", periodsPerWeek: 4, teacher: "Mr. Raj Patel", type: "Core", room: "Room 104" },
	{ id: "sub-5", name: "Hindi Language", code: "HIN-101", periodsPerWeek: 4, teacher: "Ms. Priya Sharma", type: "Language", room: "Room 104" },
	{ id: "sub-6", name: "Art & Craft", code: "ART-101", periodsPerWeek: 2, teacher: "Mr. David Kim", type: "Elective", room: "Art Studio" },
	{ id: "sub-7", name: "Music & Rhythm", code: "MUS-101", periodsPerWeek: 2, teacher: "Mr. James Brown", type: "Elective", room: "Music Room" },
	{ id: "sub-8", name: "Computer Basics & AI", code: "CS-101", periodsPerWeek: 3, teacher: "Ms. Laura White", type: "Skill", room: "Computer Lab 2" },
	{ id: "sub-9", name: "Physical Education", code: "PED-101", periodsPerWeek: 3, teacher: "Mr. Peter Wilson", type: "Sports", room: "Playground" },
];

// Sample demo teachers
const DEMO_TEACHERS = [
	{ id: "tea-1", name: "Ms. Priya Sharma", role: "Class Teacher & Hindi", email: "priya.sharma@litravalley.edu", phone: "+91 9876543210", experience: "8 yrs", avatarBg: "bg-orange-500" },
	{ id: "tea-2", name: "Ms. Emily Johnson", role: "Mathematics", email: "emily.johnson@litravalley.edu", phone: "+91 9876543211", experience: "6 yrs", avatarBg: "bg-blue-500" },
	{ id: "tea-3", name: "Ms. Alice Green", role: "English", email: "alice.green@litravalley.edu", phone: "+91 9876543212", experience: "5 yrs", avatarBg: "bg-emerald-500" },
	{ id: "tea-4", name: "Mr. Raj Patel", role: "Social Studies", email: "rajpatel.litravalley.edu", phone: "+91 9876543213", experience: "5 yrs", avatarBg: "bg-indigo-500" },
	{ id: "tea-5", name: "Mr. David Kim", role: "Art", email: "david.kim@litravalley.edu", phone: "+91 9876543214", experience: "7 yrs", avatarBg: "bg-rose-500" },
	{ id: "tea-6", name: "Ms. Laura White", role: "Technology", email: "laura.white@litravalley.edu", phone: "+91 9876543215", experience: "9 yrs", avatarBg: "bg-purple-500" },
];

// Sample Timetable Schedule Matrix
const TIMETABLE_SLOTS = [
	{ time: "08:30 - 09:15", mon: "Mathematics", tue: "English", wed: "Mathematics", thu: "Science", fri: "English" },
	{ time: "09:15 - 10:00", mon: "English", tue: "Mathematics", wed: "English", thu: "Social Studies", fri: "Mathematics" },
	{ time: "10:00 - 10:45", mon: "General Science", tue: "Hindi", wed: "General Science", thu: "Mathematics", fri: "Science" },
	{ time: "10:45 - 11:15", mon: "Break", tue: "Break", wed: "Break", thu: "Break", fri: "Break", isBreak: true },
	{ time: "11:15 - 12:00", mon: "Social Studies", tue: "General Science", wed: "Social Studies", thu: "Hindi", fri: "Social Studies" },
	{ time: "12:00 - 12:45", mon: "Hindi", tue: "Computer Basics", wed: "Hindi", thu: "English", fri: "Hindi" },
	{ time: "12:45 - 01:30", mon: "Lunch", tue: "Lunch", wed: "Lunch", thu: "Lunch", fri: "Lunch", isBreak: true },
	{ time: "01:30 - 02:15", mon: "Art & Craft", tue: "Music", wed: "Computer Basics", thu: "Physical Ed.", fri: "Art & Craft" },
	{ time: "02:15 - 03:00", mon: "Physical Ed.", tue: "Library & Reading", wed: "Sports Activity", thu: "Activity Club", fri: "Assembly" },
];

// Recent Activity Log Items
const INITIAL_ACTIVITY = [
	{ id: "act-1", title: "Morning Attendance Marked", desc: "Ms. Priya Sharma recorded attendance (22 Present, 1 Absent).", time: "Today · 08:45 AM", type: "attendance" },
	{ id: "act-2", title: "New Assignment Published", desc: "Mathematics: 'Fraction practice worksheet 3' due on Friday.", time: "Yesterday · 02:30 PM", type: "academic" },
	{ id: "act-3", title: "Teacher Substitution", desc: "Ms. Laura White substituted Period 4 for Mr. Raj Patel.", time: "10 Sep 2026", type: "faculty" },
	{ id: "act-4", title: "Unit Test 1 Scheduled", desc: "Science & English midterm evaluations announced for next week.", time: "08 Sep 2026", type: "exam" },
];

export default function ClassesManagementPage() {
	const { user, loading } = useAuth();
	const router = useRouter();

	// State
	const [classesTree, setClassesTree] = useState(INITIAL_CLASSES);
	const [selectedGradeId, setSelectedGradeId] = useState("grade-1");
	const [selectedSectionId, setSelectedSectionId] = useState("sec-1a");
	const [activeTab, setActiveTab] = useState("overview"); // overview | students | subjects | teachers | timetable
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedGrades, setExpandedGrades] = useState({ "grade-1": true, "grade-2": false, "grade-3": false, "grade-4": false, "grade-5": false });

	// Modals
	const [showAddClassModal, setShowAddClassModal] = useState(false);
	const [showChangeTeacherModal, setShowChangeTeacherModal] = useState(false);
	const [showAddStudentModal, setShowAddStudentModal] = useState(false);
	const [showAssignSubjectModal, setShowAssignSubjectModal] = useState(false);
	const [showActionDropdown, setShowActionDropdown] = useState(false);

	// Auth & Role protection - super_admin only
	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		} else if (!loading && user && user.role !== "super_admin") {
			router.push("/dashboard");
		}
	}, [user, loading, router]);

	if (loading || !user || user.role !== "super_admin") {
		return (
			<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ea580c] border-r-transparent" />
					<p className="mt-3 text-xs font-semibold text-slate-500">Verifying superadmin credentials...</p>
				</div>
			</div>
		);
	}

	// New Class Form State
	const [newClassGrade, setNewClassGrade] = useState("1");
	const [newClassSection, setNewClassSection] = useState("A");
	const [newClassTeacher, setNewClassTeacher] = useState("Ms. Priya Sharma");
	const [newClassRoom, setNewClassRoom] = useState("Room 101");
	const [newClassCapacity, setNewClassCapacity] = useState("35");

	// Add Student Form State
	const [newStudentName, setNewStudentName] = useState("");
	const [newStudentRoll, setNewStudentRoll] = useState("");
	const [newStudentGender, setNewStudentGender] = useState("Male");
	const [newStudentParentPhone, setNewStudentParentPhone] = useState("");

	// Assign Subject Form State
	const [newSubjectName, setNewSubjectName] = useState("");
	const [newSubjectCode, setNewSubjectCode] = useState("");
	const [newSubjectTeacher, setNewSubjectTeacher] = useState("Ms. Emily Johnson");
	const [newSubjectPeriods, setNewSubjectPeriods] = useState("5");

	// Selected Teacher for change
	const [selectedTeacherForChange, setSelectedTeacherForChange] = useState("Ms. Priya Sharma");

	// Trigger toast helper
	const showToast = (msg) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(""), 3500);
	};

	// Toggle Accordion
	const toggleGradeAccordion = (gradeId) => {
		setExpandedGrades((prev) => ({
			...prev,
			[gradeId]: !prev[gradeId],
		}));
	};

	// Find currently active grade & section object
	const currentGrade = useMemo(() => {
		return classesTree.find((g) => g.id === selectedGradeId) || classesTree[0];
	}, [classesTree, selectedGradeId]);

	const currentSection = useMemo(() => {
		if (!currentGrade) return null;
		return currentGrade.sections.find((s) => s.id === selectedSectionId) || currentGrade.sections[0] || null;
	}, [currentGrade, selectedSectionId]);

	// Filtered classes tree based on search query
	const filteredClassesTree = useMemo(() => {
		if (!searchQuery.trim()) return classesTree;
		const q = searchQuery.toLowerCase();
		return classesTree
			.map((gradeObj) => {
				const gradeMatches = gradeObj.grade.toLowerCase().includes(q);
				const matchedSections = gradeObj.sections.filter(
					(sec) =>
						sec.name.toLowerCase().includes(q) ||
						sec.classTeacher?.name.toLowerCase().includes(q) ||
						sec.room.toLowerCase().includes(q)
				);
				if (gradeMatches || matchedSections.length > 0) {
					return {
						...gradeObj,
						sections: gradeMatches ? gradeObj.sections : matchedSections,
					};
				}
				return null;
			})
			.filter(Boolean);
	}, [classesTree, searchQuery]);

	// Handle Add Class / Section submission
	const handleCreateClass = (e) => {
		e.preventDefault();
		const gradeTitle = `Class ${newClassGrade}`;
		const secName = `${newClassGrade}${newClassSection.toUpperCase()}`;
		const newSecObj = {
			id: `sec-${Date.now()}`,
			name: secName,
			sectionLetter: newClassSection.toUpperCase(),
			studentCount: 0,
			subjectsCount: 8,
			teachersCount: 12,
			attendanceRate: "100%",
			room: newClassRoom,
			academicYear: "2026-27",
			createdOn: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
			createdBy: "Admin (Me)",
			status: "Active",
			classTeacher: {
				name: newClassTeacher,
				email: `${newClassTeacher.toLowerCase().replace(/[^a-z]/g, "")}@litravalley.edu`,
				phone: "+91 98765 00000",
				avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
				experience: "5 yrs",
				subject: "General",
			},
		};

		setClassesTree((prev) => {
			const existingGradeIndex = prev.findIndex((g) => g.gradeNum === parseInt(newClassGrade));
			if (existingGradeIndex >= 0) {
				const updated = [...prev];
				updated[existingGradeIndex] = {
					...updated[existingGradeIndex],
					sections: [...updated[existingGradeIndex].sections, newSecObj],
				};
				return updated;
			} else {
				const newGradeObj = {
					id: `grade-${Date.now()}`,
					grade: gradeTitle,
					gradeNum: parseInt(newClassGrade),
					sections: [newSecObj],
				};
				return [...prev, newGradeObj].sort((a, b) => a.gradeNum - b.gradeNum);
			}
		});

		// Auto expand and select
		setExpandedGrades((prev) => ({ ...prev, [`grade-${newClassGrade}`]: true }));
		setSelectedSectionId(newSecObj.id);
		setShowAddClassModal(false);
		showToast(`Successfully created ${secName} with Teacher ${newClassTeacher}!`);
	};

	// Handle Change Class Teacher
	const handleChangeTeacherSubmit = () => {
		if (!currentSection) return;
		setClassesTree((prev) =>
			prev.map((g) => ({
				...g,
				sections: g.sections.map((s) => {
					if (s.id === currentSection.id) {
						return {
							...s,
							classTeacher: {
								...s.classTeacher,
								name: selectedTeacherForChange,
								email: `${selectedTeacherForChange.toLowerCase().replace(/[^a-z]/g, "")}@litravalley.edu`,
							},
						};
					}
					return s;
				}),
			}))
		);
		setShowChangeTeacherModal(false);
		showToast(`Class Teacher updated to ${selectedTeacherForChange}!`);
	};

	// Handle Add Student to Section
	const handleAddStudentSubmit = (e) => {
		e.preventDefault();
		if (!newStudentName.trim()) return;
		setClassesTree((prev) =>
			prev.map((g) => ({
				...g,
				sections: g.sections.map((s) => {
					if (s.id === currentSection.id) {
						return { ...s, studentCount: s.studentCount + 1 };
					}
					return s;
				}),
			}))
		);
		DEMO_STUDENTS.unshift({
			id: `stu-${Date.now()}`,
			rollNo: newStudentRoll || `${DEMO_STUDENTS.length + 1}`.padStart(2, "0"),
			name: newStudentName,
			idCode: `STU024${Math.floor(10 + Math.random() * 90)}`,
			gender: newStudentGender,
			attendance: "100%",
			parentPhone: newStudentParentPhone || "+91 98000 11223",
			status: "Active",
		});
		setNewStudentName("");
		setNewStudentRoll("");
		setNewStudentParentPhone("");
		setShowAddStudentModal(false);
		showToast(`Enrolled new student ${newStudentName} to ${currentSection?.name}!`);
	};

	// Handle Assign Subject
	const handleAssignSubjectSubmit = (e) => {
		e.preventDefault();
		if (!newSubjectName.trim()) return;
		DEMO_SUBJECTS.unshift({
			id: `sub-${Date.now()}`,
			name: newSubjectName,
			code: newSubjectCode || `SUB-${Math.floor(100 + Math.random() * 900)}`,
			periodsPerWeek: parseInt(newSubjectPeriods) || 4,
			teacher: newSubjectTeacher,
			type: "Core",
			room: currentSection?.room || "Room 104",
		});
		setClassesTree((prev) =>
			prev.map((g) => ({
				...g,
				sections: g.sections.map((s) => {
					if (s.id === currentSection.id) {
						return { ...s, subjectsCount: s.subjectsCount + 1 };
					}
					return s;
				}),
			}))
		);
		setNewSubjectName("");
		setNewSubjectCode("");
		setShowAssignSubjectModal(false);
		showToast(`Assigned subject ${newSubjectName} to ${currentSection?.name}!`);
	};

	return (
		<div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
			{/* Toast Notification */}
			{toastMsg && (
				<div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5">
					<CheckCircle className="h-5 w-5 text-emerald-400" />
					<span>{toastMsg}</span>
				</div>
			)}

			<div className="p-4 md:p-6 lg:p-8 max-w-[1700px] mx-auto">
				{/* Top Search Bar & Actions Bar */}
				<div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
					<div>
						<h1 className="text-2xl font-bold text-slate-900 tracking-tight">Classes & Sections</h1>
						<p className="text-xs text-slate-500 mt-0.5">Manage grade levels, sections, teachers, student strength, and timetables</p>
					</div>

					<div className="flex items-center gap-3">
						<div className="relative flex-1 sm:w-80">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<input
								type="text"
								placeholder="Search anything..."
								className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/20 focus:border-[#ea580c] transition-all"
							/>
						</div>
						<button
							onClick={() => setShowAddClassModal(true)}
							className="inline-flex items-center gap-2 rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#d94e08] active:scale-98 transition-all shrink-0 cursor-pointer"
						>
							<Plus className="h-4 w-4" />
							<span>Add Class</span>
						</button>
					</div>
				</div>

				{/* Two-Column Main Layout matching Figma Screenshot */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
					{/* Left Column: Class & Sections Tree Pane (col-span-4 on desktop) */}
					<div className="lg:col-span-4 xl:col-span-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
						{/* Pane Header */}
						<div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
							<h2 className="text-base font-bold text-slate-900">Class & Sections</h2>
							<button
								onClick={() => setShowAddClassModal(true)}
								className="inline-flex items-center gap-1 rounded-xl bg-[#ea580c] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#d94e08] transition-all shadow-xs cursor-pointer"
							>
								<Plus className="h-3.5 w-3.5" />
								<span>Add Class</span>
							</button>
						</div>

						{/* Search Grade or Section */}
						<div className="relative mb-4">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search grade or section"
								className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10 transition-all"
							/>
						</div>

						{/* Accordion List */}
						<div className="space-y-2">
							{filteredClassesTree.length === 0 ? (
								<div className="py-8 text-center text-xs text-slate-400">
									No classes or sections found matching &quot;{searchQuery}&quot;
								</div>
							) : (
								filteredClassesTree.map((gradeObj) => {
									const isExpanded = expandedGrades[gradeObj.id] ?? false;
									return (
										<div key={gradeObj.id} className="rounded-xl border border-slate-100 overflow-hidden">
											{/* Grade Header Accordion Trigger */}
											<button
												type="button"
												onClick={() => toggleGradeAccordion(gradeObj.id)}
												className="w-full flex items-center justify-between px-3.5 py-2.5 bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-left text-xs font-bold text-slate-800"
											>
												<span className="font-semibold text-slate-900">{gradeObj.grade}</span>
												<div className="flex items-center gap-2">
													<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-200/80 px-1.5 text-[11px] font-bold text-slate-700">
														{gradeObj.sections.length}
													</span>
													{isExpanded ? (
														<ChevronUp className="h-4 w-4 text-slate-500" />
													) : (
														<ChevronDown className="h-4 w-4 text-slate-500" />
													)}
												</div>
											</button>

											{/* Sections List */}
											{isExpanded && (
												<div className="p-1.5 space-y-1 bg-white">
													{gradeObj.sections.map((sec) => {
														const isSelected = selectedSectionId === sec.id;
														return (
															<div
																key={sec.id}
																onClick={() => {
																	setSelectedGradeId(gradeObj.id);
																	setSelectedSectionId(sec.id);
																}}
																className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer transition-all ${
																	isSelected
																		? "bg-[#fff7ed] text-[#ea580c] ring-1 ring-[#ea580c]/30 shadow-xs"
																		: "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
																}`}
															>
																<div className="flex items-center gap-2">
																	<span className={`font-bold ${isSelected ? "text-[#ea580c]" : "text-slate-800"}`}>
																		{sec.name}
																	</span>
																</div>

																<div className="flex items-center gap-3">
																	<span className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-slate-700">
																		<Users className="h-3.5 w-3.5" />
																		<span>{sec.studentCount}</span>
																	</span>

																	<button
																		type="button"
																		onClick={(e) => {
																			e.stopPropagation();
																			setSelectedGradeId(gradeObj.id);
																			setSelectedSectionId(sec.id);
																			setShowActionDropdown((prev) => !prev);
																		}}
																		className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
																	>
																		<MoreVertical className="h-3.5 w-3.5" />
																	</button>
																</div>
															</div>
														);
													})}
												</div>
											)}
										</div>
									);
								})
							)}
						</div>
					</div>

					{/* Right Column: Selected Class Workspace (col-span-8 on desktop) */}
					<div className="lg:col-span-8 xl:col-span-9 space-y-6">
						{/* Class Header Banner Card */}
						{currentSection ? (
							<div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
									<div className="flex items-center gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs ring-1 ring-indigo-500/10">
											<School className="h-6 w-6" />
										</div>
										<div>
											<h2 className="text-xl font-bold text-slate-900 tracking-tight">Class {currentSection.name}</h2>
											<p className="text-xs font-medium text-slate-500 mt-0.5">
												Academic Year: <span className="font-semibold text-slate-700">{currentSection.academicYear}</span>
											</p>
										</div>
									</div>

									<div className="relative flex items-center gap-2">
										<button
											type="button"
											onClick={() => setShowAddStudentModal(true)}
											className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
										>
											<UserPlus className="h-3.5 w-3.5 text-slate-500" />
											<span>Add Student</span>
										</button>

										<button
											type="button"
											onClick={() => setShowActionDropdown((prev) => !prev)}
											className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-xs"
										>
											<MoreVertical className="h-4 w-4" />
										</button>

										{/* Options Menu Dropdown */}
										{showActionDropdown && (
											<div className="absolute right-0 top-full mt-2 z-30 w-48 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xl ring-1 ring-slate-900/5">
												<button
													type="button"
													onClick={() => {
														setShowChangeTeacherModal(true);
														setShowActionDropdown(false);
													}}
													className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
												>
													<UserCheck className="h-3.5 w-3.5 text-slate-400" />
													<span>Change Class Teacher</span>
												</button>
												<button
													type="button"
													onClick={() => {
														setShowAssignSubjectModal(true);
														setShowActionDropdown(false);
													}}
													className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
												>
													<BookPlus className="h-3.5 w-3.5 text-slate-400" />
													<span>Assign Subject</span>
												</button>
												<button
													type="button"
													onClick={() => {
														setActiveTab("timetable");
														setShowActionDropdown(false);
													}}
													className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
												>
													<CalendarDays className="h-3.5 w-3.5 text-slate-400" />
													<span>View Timetable</span>
												</button>
											</div>
										)}
									</div>
								</div>

								{/* Horizontal Nav Tabs */}
								<div className="flex items-center gap-8 pt-4 overflow-x-auto [scrollbar-width:none]">
									{[
										{ id: "overview", label: "Overview" },
										{ id: "students", label: "Students", count: currentSection.studentCount },
										{ id: "subjects", label: "Subjects", count: currentSection.subjectsCount },
										{ id: "teachers", label: "Teachers", count: currentSection.teachersCount },
										{ id: "timetable", label: "Timetable" },
									].map((tab) => {
										const isActive = activeTab === tab.id;
										return (
											<button
												key={tab.id}
												type="button"
												onClick={() => setActiveTab(tab.id)}
												className={`relative pb-3 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
													isActive
														? "text-slate-950 font-bold"
														: "text-slate-500 hover:text-slate-800"
												}`}
											>
												<span className="flex items-center gap-1.5">
													{tab.label}
													{tab.count !== undefined && (
														<span
															className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
																isActive
																	? "bg-[#fff7ed] text-[#ea580c]"
																	: "bg-slate-100 text-slate-600"
															}`}
														>
															{tab.count}
														</span>
													)}
												</span>
												{isActive && (
													<span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#ea580c]" />
												)}
											</button>
										);
									})}
								</div>
							</div>
						) : null}

						{/* Tab 1: OVERVIEW */}
						{activeTab === "overview" && currentSection && (
							<div className="space-y-6">
								{/* 4 Stat Cards Row matching mockup exactly */}
								<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
									{/* Students Card */}
									<div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center gap-3.5">
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600 ring-1 ring-pink-500/10">
											<Users className="h-5 w-5" />
										</div>
										<div>
											<p className="text-[11px] font-medium text-slate-500">Students</p>
											<p className="text-xl font-bold text-slate-900">{currentSection.studentCount}</p>
										</div>
									</div>

									{/* Subjects Card */}
									<div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center gap-3.5">
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/10">
											<BookOpen className="h-5 w-5" />
										</div>
										<div>
											<p className="text-[11px] font-medium text-slate-500">Subjects</p>
											<p className="text-xl font-bold text-slate-900">{currentSection.subjectsCount}</p>
										</div>
									</div>

									{/* Teachers Card */}
									<div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center gap-3.5">
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/10">
											<GraduationCap className="h-5 w-5" />
										</div>
										<div>
											<p className="text-[11px] font-medium text-slate-500">Teachers</p>
											<p className="text-xl font-bold text-slate-900">{currentSection.teachersCount}</p>
										</div>
									</div>

									{/* Attendance Card */}
									<div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center gap-3.5">
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/10">
											<Clock className="h-5 w-5" />
										</div>
										<div>
											<p className="text-[11px] font-medium text-slate-500">Attendance</p>
											<p className="text-xl font-bold text-slate-900">{currentSection.attendanceRate}</p>
										</div>
									</div>
								</div>

								{/* Split Information Grid */}
								<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
									{/* Left Card: Class Information (Key-Value List) */}
									<div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
										<h3 className="text-sm font-bold text-slate-900 mb-4">Class Information</h3>

										<div className="divide-y divide-slate-100 text-xs">
											<div className="flex items-center justify-between py-2.5">
												<span className="font-medium text-slate-500">Class</span>
												<span className="font-semibold text-slate-800">{currentGrade?.gradeNum}</span>
											</div>
											<div className="flex items-center justify-between py-2.5">
												<span className="font-medium text-slate-500">Section</span>
												<span className="font-semibold text-slate-800">{currentSection.sectionLetter}</span>
											</div>
											<div className="flex items-center justify-between py-2.5">
												<span className="font-medium text-slate-500">Class Teacher</span>
												<span className="font-semibold text-slate-800">{currentSection.classTeacher?.name}</span>
											</div>
											<div className="flex items-center justify-between py-2.5">
												<span className="font-medium text-slate-500">Room/Location</span>
												<span className="font-semibold text-slate-800">{currentSection.room}</span>
											</div>
											<div className="flex items-center justify-between py-2.5">
												<span className="font-medium text-slate-500">Academic Year</span>
												<span className="font-semibold text-slate-800">{currentSection.academicYear}</span>
											</div>
											<div className="flex items-center justify-between py-2.5">
												<span className="font-medium text-slate-500">Class Strength</span>
												<span className="font-semibold text-slate-800">{currentSection.studentCount} Students</span>
											</div>
											<div className="flex items-center justify-between py-2.5">
												<span className="font-medium text-slate-500">Created On</span>
												<span className="font-semibold text-slate-800">{currentSection.createdOn}</span>
											</div>
											<div className="flex items-center justify-between py-2.5">
												<span className="font-medium text-slate-500">Created By</span>
												<span className="font-semibold text-slate-800">{currentSection.createdBy}</span>
											</div>
											<div className="flex items-center justify-between py-2.5">
												<span className="font-medium text-slate-500">Status</span>
												<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-600/20">
													<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
													{currentSection.status}
												</span>
											</div>
										</div>
									</div>

									{/* Right Column: Class Teacher & Quick Actions */}
									<div className="lg:col-span-5 space-y-6">
										{/* Class Teacher Card */}
										<div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
											<h3 className="text-sm font-bold text-slate-900 mb-4">Class Teacher</h3>

											<div className="flex items-center gap-3.5 mb-4">
												{currentSection.classTeacher?.avatar ? (
													<img
														src={currentSection.classTeacher.avatar}
														alt={currentSection.classTeacher.name}
														className="h-12 w-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-xs"
													/>
												) : (
													<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-white shadow-xs">
														PS
													</div>
												)}
												<div>
													<h4 className="text-xs font-bold text-slate-900">{currentSection.classTeacher?.name}</h4>
													<p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
														<Mail className="h-3 w-3 text-slate-400" />
														<span>{currentSection.classTeacher?.email}</span>
													</p>
													<p className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
														<Phone className="h-3 w-3 text-slate-400" />
														<span>{currentSection.classTeacher?.phone}</span>
													</p>
												</div>
											</div>

											<button
												type="button"
												onClick={() => setShowChangeTeacherModal(true)}
												className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
											>
												Change Class Teacher
											</button>
										</div>

										{/* Quick Actions Card */}
										<div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
											<h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>

											<div className="divide-y divide-slate-100 text-xs">
												<button
													type="button"
													onClick={() => setShowAddStudentModal(true)}
													className="flex w-full items-center justify-between py-2.5 font-medium text-slate-700 hover:text-[#ea580c] transition-colors text-left"
												>
													<div className="flex items-center gap-2.5">
														<UserPlus className="h-4 w-4 text-slate-400" />
														<span>Add Student</span>
													</div>
													<ArrowRight className="h-3.5 w-3.5 text-slate-400" />
												</button>

												<button
													type="button"
													onClick={() => setShowAssignSubjectModal(true)}
													className="flex w-full items-center justify-between py-2.5 font-medium text-slate-700 hover:text-[#ea580c] transition-colors text-left"
												>
													<div className="flex items-center gap-2.5">
														<BookPlus className="h-4 w-4 text-slate-400" />
														<span>Assign Subject</span>
													</div>
													<ArrowRight className="h-3.5 w-3.5 text-slate-400" />
												</button>

												<button
													type="button"
													onClick={() => setShowChangeTeacherModal(true)}
													className="flex w-full items-center justify-between py-2.5 font-medium text-slate-700 hover:text-[#ea580c] transition-colors text-left"
												>
													<div className="flex items-center gap-2.5">
														<UserCheck className="h-4 w-4 text-slate-400" />
														<span>Assign Teacher</span>
													</div>
													<ArrowRight className="h-3.5 w-3.5 text-slate-400" />
												</button>

												<button
													type="button"
													onClick={() => setActiveTab("timetable")}
													className="flex w-full items-center justify-between py-2.5 font-medium text-slate-700 hover:text-[#ea580c] transition-colors text-left"
												>
													<div className="flex items-center gap-2.5">
														<CalendarDays className="h-4 w-4 text-slate-400" />
														<span>Edit Timetable</span>
													</div>
													<ArrowRight className="h-3.5 w-3.5 text-slate-400" />
												</button>
											</div>
										</div>
									</div>
								</div>

								{/* Recent Activity Section */}
								<div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
									<div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
										<div className="flex items-center gap-2">
											<Activity className="h-4 w-4 text-[#ea580c]" />
											<h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
										</div>
										<span className="text-[11px] font-semibold text-slate-400">Class 1A Timeline</span>
									</div>

									<div className="space-y-4">
										{INITIAL_ACTIVITY.map((act) => (
											<div key={act.id} className="flex items-start gap-3.5 text-xs">
												<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#ea580c] ring-1 ring-orange-500/10">
													<Sparkles className="h-3.5 w-3.5" />
												</div>
												<div className="flex-1">
													<div className="flex items-center justify-between">
														<p className="font-bold text-slate-900">{act.title}</p>
														<span className="text-[11px] font-medium text-slate-400">{act.time}</span>
													</div>
													<p className="text-slate-600 mt-0.5">{act.desc}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Tab 2: STUDENTS */}
						{activeTab === "students" && (
							<div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
									<div>
										<h3 className="text-sm font-bold text-slate-900">Enrolled Students in {currentSection?.name}</h3>
										<p className="text-xs text-slate-500 mt-0.5">Total {DEMO_STUDENTS.length} active students enrolled</p>
									</div>
									<button
										type="button"
										onClick={() => setShowAddStudentModal(true)}
										className="inline-flex items-center gap-1.5 rounded-xl bg-[#ea580c] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] shadow-xs transition-all cursor-pointer"
									>
										<UserPlus className="h-3.5 w-3.5" />
										<span>Add Student</span>
									</button>
								</div>

								<div className="overflow-x-auto">
									<table className="w-full text-left text-xs text-slate-700">
										<thead className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
											<tr>
												<th className="px-4 py-3 rounded-l-xl">Roll No</th>
												<th className="px-4 py-3">Student Name</th>
												<th className="px-4 py-3">Student ID</th>
												<th className="px-4 py-3">Gender</th>
												<th className="px-4 py-3">Attendance</th>
												<th className="px-4 py-3">Parent Phone</th>
												<th className="px-4 py-3">Status</th>
												<th className="px-4 py-3 rounded-r-xl text-right">Action</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-slate-100">
											{DEMO_STUDENTS.map((stu) => (
												<tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
													<td className="px-4 py-3.5 font-bold text-slate-900">{stu.rollNo}</td>
													<td className="px-4 py-3.5 font-semibold text-slate-900">{stu.name}</td>
													<td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">{stu.idCode}</td>
													<td className="px-4 py-3.5 text-slate-600">{stu.gender}</td>
													<td className="px-4 py-3.5 font-bold text-emerald-600">{stu.attendance}</td>
													<td className="px-4 py-3.5 text-slate-600">{stu.parentPhone}</td>
													<td className="px-4 py-3.5">
														<span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
															{stu.status}
														</span>
													</td>
													<td className="px-4 py-3.5 text-right">
														<button className="rounded-lg p-1 text-slate-400 hover:text-slate-700">
															<MoreVertical className="h-4 w-4" />
														</button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* Tab 3: SUBJECTS */}
						{activeTab === "subjects" && (
							<div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
									<div>
										<h3 className="text-sm font-bold text-slate-900">Curriculum & Subjects for {currentSection?.name}</h3>
										<p className="text-xs text-slate-500 mt-0.5">{DEMO_SUBJECTS.length} subjects configured for this term</p>
									</div>
									<button
										type="button"
										onClick={() => setShowAssignSubjectModal(true)}
										className="inline-flex items-center gap-1.5 rounded-xl bg-[#ea580c] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] shadow-xs transition-all cursor-pointer"
									>
										<BookPlus className="h-3.5 w-3.5" />
										<span>Assign Subject</span>
									</button>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{DEMO_SUBJECTS.map((sub) => (
										<div key={sub.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 hover:border-slate-300 transition-all shadow-2xs">
											<div className="flex items-start justify-between">
												<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/10 font-bold text-xs">
													{sub.code.split("-")[0]}
												</div>
												<span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
													{sub.periodsPerWeek} periods/wk
												</span>
											</div>
											<h4 className="text-xs font-bold text-slate-900 mt-3">{sub.name}</h4>
											<p className="text-[11px] font-mono text-slate-400 mt-0.5">{sub.code}</p>

											<div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
												<span className="text-slate-500">Teacher:</span>
												<span className="font-semibold text-slate-800">{sub.teacher}</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Tab 4: TEACHERS */}
						{activeTab === "teachers" && (
							<div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
								<div className="flex items-center justify-between pb-4 border-b border-slate-100">
									<div>
										<h3 className="text-sm font-bold text-slate-900">Faculty Assigned to {currentSection?.name}</h3>
										<p className="text-xs text-slate-500 mt-0.5">Faculty teaching various subjects in this section</p>
									</div>
									<button
										type="button"
										onClick={() => setShowChangeTeacherModal(true)}
										className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
									>
										<UserCheck className="h-3.5 w-3.5 text-slate-500" />
										<span>Reassign Faculty</span>
									</button>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{DEMO_TEACHERS.map((tea) => (
										<div key={tea.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center gap-3.5 shadow-2xs">
											<div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white font-bold text-xs shadow-xs ${tea.avatarBg}`}>
												{tea.name.split(" ").map((n) => n[0]).join("")}
											</div>
											<div className="flex-1 min-w-0">
												<h4 className="text-xs font-bold text-slate-900 truncate">{tea.name}</h4>
												<p className="text-[11px] font-medium text-[#ea580c] mt-0.5 truncate">{tea.role}</p>
												<p className="text-[11px] text-slate-400 mt-0.5 truncate">{tea.email}</p>
											</div>
											<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 shrink-0">
												{tea.experience}
											</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Tab 5: TIMETABLE */}
						{activeTab === "timetable" && (
							<div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
									<div>
										<h3 className="text-sm font-bold text-slate-900">Weekly Timetable Schedule ({currentSection?.name})</h3>
										<p className="text-xs text-slate-500 mt-0.5">Monday to Friday daily period schedule</p>
									</div>
									<div className="flex items-center gap-2">
										<button
											onClick={() => showToast("Timetable saved and synced to student app!")}
											className="rounded-xl bg-[#ea580c] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] shadow-xs transition-all cursor-pointer"
										>
											Save Changes
										</button>
									</div>
								</div>

								<div className="overflow-x-auto">
									<table className="w-full text-left text-xs text-slate-700 border-collapse">
										<thead>
											<tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
												<th className="p-3 border border-slate-200 rounded-tl-xl w-32">Time Slot</th>
												<th className="p-3 border border-slate-200">Monday</th>
												<th className="p-3 border border-slate-200">Tuesday</th>
												<th className="p-3 border border-slate-200">Wednesday</th>
												<th className="p-3 border border-slate-200">Thursday</th>
												<th className="p-3 border border-slate-200 rounded-tr-xl">Friday</th>
											</tr>
										</thead>
										<tbody>
											{TIMETABLE_SLOTS.map((slot, idx) => (
												<tr key={idx} className={slot.isBreak ? "bg-amber-50/60 font-semibold text-amber-800 text-center" : "hover:bg-slate-50/50"}>
													<td className="p-3 border border-slate-200 font-mono text-[11px] text-slate-600 bg-slate-50/50 text-left">
														{slot.time}
													</td>
													{slot.isBreak ? (
														<td colSpan={5} className="p-2.5 border border-slate-200 text-xs font-bold tracking-wider uppercase text-amber-700">
															☕ {slot.mon}
														</td>
													) : (
														<>
															<td className="p-3 border border-slate-200 font-semibold text-slate-800">{slot.mon}</td>
															<td className="p-3 border border-slate-200 font-semibold text-slate-800">{slot.tue}</td>
															<td className="p-3 border border-slate-200 font-semibold text-slate-800">{slot.wed}</td>
															<td className="p-3 border border-slate-200 font-semibold text-slate-800">{slot.thu}</td>
															<td className="p-3 border border-slate-200 font-semibold text-slate-800">{slot.fri}</td>
														</>
													)}
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Modal 1: + Add Class Modal */}
			{showAddClassModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<h3 className="text-base font-bold text-slate-900">Add New Class & Section</h3>
							<button
								type="button"
								onClick={() => setShowAddClassModal(false)}
								className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleCreateClass} className="mt-4 space-y-4 text-xs">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="font-bold text-slate-700 block mb-1">Grade Level *</label>
									<select
										value={newClassGrade}
										onChange={(e) => setNewClassGrade(e.target.value)}
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
									>
										{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
											<option key={g} value={g}>
												Class {g}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1">Section Letter *</label>
									<input
										type="text"
										required
										maxLength={2}
										value={newClassSection}
										onChange={(e) => setNewClassSection(e.target.value.toUpperCase())}
										placeholder="e.g. A, B, C"
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
									/>
								</div>
							</div>

							<div>
								<label className="font-bold text-slate-700 block mb-1">Assign Class Teacher *</label>
								<select
									value={newClassTeacher}
									onChange={(e) => setNewClassTeacher(e.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
								>
									{DEMO_TEACHERS.map((t) => (
										<option key={t.id} value={t.name}>
											{t.name} ({t.role})
										</option>
									))}
								</select>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="font-bold text-slate-700 block mb-1">Room / Location</label>
									<input
										type="text"
										value={newClassRoom}
										onChange={(e) => setNewClassRoom(e.target.value)}
										placeholder="e.g. Room 104"
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
									/>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1">Student Capacity</label>
									<input
										type="number"
										value={newClassCapacity}
										onChange={(e) => setNewClassCapacity(e.target.value)}
										placeholder="e.g. 35"
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
									/>
								</div>
							</div>

							<div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setShowAddClassModal(false)}
									className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] shadow-xs cursor-pointer"
								>
									Create Class
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal 2: Change Class Teacher */}
			{showChangeTeacherModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<h3 className="text-base font-bold text-slate-900">Change Class Teacher for {currentSection?.name}</h3>
							<button
								type="button"
								onClick={() => setShowChangeTeacherModal(false)}
								className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="mt-4 space-y-4 text-xs">
							<div>
								<label className="font-bold text-slate-700 block mb-2">Select Faculty Member</label>
								<div className="space-y-2 max-h-60 overflow-y-auto pr-1">
									{DEMO_TEACHERS.map((t) => (
										<div
											key={t.id}
											onClick={() => setSelectedTeacherForChange(t.name)}
											className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
												selectedTeacherForChange === t.name
													? "border-[#ea580c] bg-[#fff7ed] text-[#ea580c]"
													: "border-slate-200 hover:bg-slate-50 text-slate-800"
											}`}
										>
											<div className="flex items-center gap-3">
												<div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] ${t.avatarBg}`}>
													{t.name.split(" ").map((n) => n[0]).join("")}
												</div>
												<div>
													<p className="font-bold text-xs">{t.name}</p>
													<p className="text-[11px] text-slate-500">{t.role}</p>
												</div>
											</div>
											{selectedTeacherForChange === t.name && (
												<Check className="h-4 w-4 text-[#ea580c]" />
											)}
										</div>
									))}
								</div>
							</div>

							<div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setShowChangeTeacherModal(false)}
									className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleChangeTeacherSubmit}
									className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] shadow-xs cursor-pointer"
								>
									Confirm Assignment
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal 3: Add Student to Class */}
			{showAddStudentModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<h3 className="text-base font-bold text-slate-900">Add Student to {currentSection?.name}</h3>
							<button
								type="button"
								onClick={() => setShowAddStudentModal(false)}
								className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleAddStudentSubmit} className="mt-4 space-y-4 text-xs">
							<div>
								<label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
								<input
									type="text"
									required
									value={newStudentName}
									onChange={(e) => setNewStudentName(e.target.value)}
									placeholder="e.g. Aryan Sharma"
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="font-bold text-slate-700 block mb-1">Roll Number</label>
									<input
										type="text"
										value={newStudentRoll}
										onChange={(e) => setNewStudentRoll(e.target.value)}
										placeholder="e.g. 11"
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
									/>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1">Gender</label>
									<select
										value={newStudentGender}
										onChange={(e) => setNewStudentGender(e.target.value)}
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
									>
										<option value="Male">Male</option>
										<option value="Female">Female</option>
										<option value="Other">Other</option>
									</select>
								</div>
							</div>

							<div>
								<label className="font-bold text-slate-700 block mb-1">Parent Phone Number</label>
								<input
									type="text"
									value={newStudentParentPhone}
									onChange={(e) => setNewStudentParentPhone(e.target.value)}
									placeholder="e.g. +91 98765 43210"
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
								/>
							</div>

							<div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setShowAddStudentModal(false)}
									className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] shadow-xs cursor-pointer"
								>
									Enroll Student
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Modal 4: Assign Subject */}
			{showAssignSubjectModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
					<div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95">
						<div className="flex items-center justify-between pb-4 border-b border-slate-100">
							<h3 className="text-base font-bold text-slate-900">Assign Subject to {currentSection?.name}</h3>
							<button
								type="button"
								onClick={() => setShowAssignSubjectModal(false)}
								className="rounded-lg p-1 text-slate-400 hover:text-slate-700"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<form onSubmit={handleAssignSubjectSubmit} className="mt-4 space-y-4 text-xs">
							<div>
								<label className="font-bold text-slate-700 block mb-1">Subject Name *</label>
								<input
									type="text"
									required
									value={newSubjectName}
									onChange={(e) => setNewSubjectName(e.target.value)}
									placeholder="e.g. Robotics & Coding"
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
								/>
							</div>

							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="font-bold text-slate-700 block mb-1">Subject Code</label>
									<input
										type="text"
										value={newSubjectCode}
										onChange={(e) => setNewSubjectCode(e.target.value)}
										placeholder="e.g. ROB-101"
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
									/>
								</div>

								<div>
									<label className="font-bold text-slate-700 block mb-1">Periods / Week</label>
									<input
										type="number"
										value={newSubjectPeriods}
										onChange={(e) => setNewSubjectPeriods(e.target.value)}
										placeholder="e.g. 4"
										className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
									/>
								</div>
							</div>

							<div>
								<label className="font-bold text-slate-700 block mb-1">Subject Teacher *</label>
								<select
									value={newSubjectTeacher}
									onChange={(e) => setNewSubjectTeacher(e.target.value)}
									className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-[#ea580c] focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]/10"
								>
									{DEMO_TEACHERS.map((t) => (
										<option key={t.id} value={t.name}>
											{t.name} ({t.role})
										</option>
									))}
								</select>
							</div>

							<div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
								<button
									type="button"
									onClick={() => setShowAssignSubjectModal(false)}
									className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#d94e08] shadow-xs cursor-pointer"
								>
									Assign Subject
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
