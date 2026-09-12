"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../app/utils/auth_context";
import { supabase } from "../../app/utils/supabase";

// Role-based navigation configuration
// Each nav item can specify which roles have access
// If allowedRoles is not specified, all roles have access
// If allowedRoles is empty array, only super_admin has access (via superAdminOnly flag)
// 
// IMPORTANT: Role-based access is PRIMARY!
// The user_access table is ONLY for additional restrictions by super_admin
// By default, users with allowed roles will see items unless explicitly restricted in user_access
const ROLE_BASED_NAV_CONFIG = {
	// Common items (available to all roles)
	dashboard: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'counselor', 'parent', 'b2c_student', 'b2c_mentor'],
	},
	tools: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'b2c_student', 'b2c_mentor'],
	},
	courses: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'b2c_student', 'b2c_mentor'],
	},
	copilot: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'b2c_student', 'b2c_mentor'],
	},
	gyanisage: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'b2c_student', 'b2c_mentor'],
	},
	vivaAi: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'b2c_student', 'b2c_mentor'],
	},
	sharkAi: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'counselor', 'b2c_student', 'b2c_mentor'],
	},
	performance: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'parent', 'b2c_student', 'b2c_mentor'],
	},
	settings: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'counselor', 'parent', 'b2c_student', 'b2c_mentor'],
	},
	liveClassroom: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'b2c_student', 'b2c_mentor'],
	},
	
	// Institutional only items (not for B2C users)
	contentGenerator: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student'],
	},
	reports: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty'],
	},
	reportCards: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'parent'],
	},
	assignments: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student'],
	},
	questionPaper: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty'],
	},
	facultySubstitution: {
		allowedRoles: ['super_admin'],
		superAdminOnly: true,
	},

	userManagement: {
		allowedRoles: ['super_admin', 'co_admin'],
	},
	studentManagement: {
		allowedRoles: ['super_admin'],
		superAdminOnly: true,
	},
	attendance: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'parent'],
	},
	userAccess: {
		allowedRoles: ['super_admin'],
		superAdminOnly: true,
	},
	schoolProfile: {
		allowedRoles: ['super_admin', 'co_admin'],
	},
	schoolManagement: {
		allowedRoles: ['super_admin'],
		superAdminOnly: true,
	},
	academics: {
		allowedRoles: ['super_admin'],
		superAdminOnly: true,
	},
	campus: {
		allowedRoles: ['super_admin'],
		superAdminOnly: true,
	},
	timetable: {
		allowedRoles: ['super_admin'],
		superAdminOnly: true,
	},
	eventsManagement: {
		allowedRoles: ['super_admin', 'co_admin'],
	},
	eventsStudent: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student'],
	},
	eventsPublic: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'parent', 'b2c_student', 'b2c_mentor'],
	},
	homeworkManagement: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty'],
	},
	homeworkStudent: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'parent'],
	},
	homeworkReports: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'parent'],
	},
	
	// Counselor specific items
	counselorSafetyAlerts: {
		allowedRoles: ['super_admin', 'co_admin', 'counselor'],
	},
	counselorSessions: {
		allowedRoles: ['super_admin', 'co_admin', 'counselor'],
	},
	counselorAnalytics: {
		allowedRoles: ['super_admin', 'co_admin', 'counselor'],
	},
	
	// Parent specific items
	parentAttendance: {
		allowedRoles: ['super_admin', 'co_admin', 'parent'],
	},
	parentReportCards: {
		allowedRoles: ['super_admin', 'co_admin', 'parent'],
	},
	parentCommunication: {
		allowedRoles: ['super_admin', 'co_admin', 'parent'],
	},
	parentTeacherChat: {
		allowedRoles: ['super_admin', 'co_admin', 'parent'],
	},
	facultyParentChat: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty'],
	},
	
	// B2C specific items
	mentors: {
		allowedRoles: ['b2c_student', 'b2c_mentor'],
	},
	incubationHub: {
		allowedRoles: ['super_admin', 'co_admin', 'faculty', 'student', 'b2c_student', 'b2c_mentor'],
	},
};

export default function DashboardSidenav({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, schoolData }) {
	const pathname = usePathname();
	const { user } = useAuth();
	const [userModules, setUserModules] = useState(null);
	const [loadingAccess, setLoadingAccess] = useState(true);

	// Fetch user access whitelist from user_access table
	// If entries exist, only those modules are shown. If no entries, show all role-based defaults.
	useEffect(() => {
		if (user) {
			fetchUserModules();
		}
	}, [user]);

	const fetchUserModules = async () => {
		if (!user) return;

		// Super admin and B2C users don't need access restrictions
		const B2C_ROLES = ['b2c_student', 'b2c_mentor'];
		if (user.role === "super_admin" || B2C_ROLES.includes(user.role)) {
			setLoadingAccess(false);
			return;
		}

		try {
			const { data, error } = await supabase
				.from("user_access")
				.select("module_name")
				.eq("user_id", user.id);

			if (error) throw error;

			if (data && data.length > 0) {
				setUserModules(new Set(data.map(d => d.module_name)));
			} else {
				setUserModules(null); // No restrictions
			}
		} catch (error) {
			console.error("Error fetching user access:", error);
		} finally {
			setLoadingAccess(false);
		}
	};

	// Check if user has access to a module based on role and user_access whitelist
	const hasAccess = (itemKey, allowedRoles, superAdminOnly) => {
		if (!user) return false;
		
		// Super admin has access to everything
		if (user.role === "super_admin") return true;
		
		// For B2C users, role-based access is sufficient
		const B2C_ROLES = ['b2c_student', 'b2c_mentor'];
		if (B2C_ROLES.includes(user.role)) return true;
		
		// If still loading, allow access based on role (optimistic UI)
		if (loadingAccess) return true;
		
		// If user_access whitelist exists, it is the AUTHORITATIVE source.
		// Skip role-based check so admin-granted modules always show.
		if (userModules !== null) {
			return userModules.has(itemKey);
		}
		
		// No entries in user_access → fall back to role-based defaults
		if (allowedRoles && !allowedRoles.includes(user.role)) return false;
		return true;
	};

	const navItems = [
		{
			key: 'dashboard',
			name: "Dashboard",
			href: "/dashboard",
			allowedRoles: ROLE_BASED_NAV_CONFIG.dashboard.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
					/>
				</svg>
			),
		},
		{
			key: 'tools',
			name: "AI Tools",
			href: "/dashboard/tools",
			allowedRoles: ROLE_BASED_NAV_CONFIG.tools.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
					/>
				</svg>
			),
		},
		{
			key: 'courses',
			name: "My Courses",
			href: "/dashboard/courses",
			allowedRoles: ROLE_BASED_NAV_CONFIG.courses.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
					/>
				</svg>
			),
		},
		{
			key: 'copilot',
			name: "Sudarshan AI",
			href: "/dashboard/copilot",
			allowedRoles: ROLE_BASED_NAV_CONFIG.copilot.allowedRoles,
			icon: (
				<Image src="/asset/sudarshanai/sudarshanicon.png" alt="Sudarshan AI" width={20} height={20} className="object-contain nav-icon-adaptive" />
			),
		},
		{
			key: 'gyanisage',
			name: "Buddy AI",
			href: "/dashboard/gyanisage",
			allowedRoles: ROLE_BASED_NAV_CONFIG.gyanisage.allowedRoles,
			icon: (
				<Image src="/asset/buddyicon.png" alt="Buddy AI" width={20} height={20} className="object-contain nav-icon-adaptive" />
			),
		},
		{
			key: 'vivaAi',
			name: "Viva AI",
			href: "/dashboard/viva-ai",
			allowedRoles: ROLE_BASED_NAV_CONFIG.vivaAi.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
					/>
				</svg>
			),
		},
		{
			key: 'sharkAi',
			name: "AI Shark",
			href: "/dashboard/shark-ai",
			allowedRoles: ROLE_BASED_NAV_CONFIG.sharkAi.allowedRoles,
			icon: (
				<Image src="/asset/ai-shark/sharkicon.png" alt="AI Shark" width={20} height={20} className="object-contain nav-icon-adaptive" />
			),
		},
	{
		key: 'liveClassroom',
		name: "Omni Sight",
		href: "/dashboard/live-classroom",
		allowedRoles: ROLE_BASED_NAV_CONFIG.liveClassroom.allowedRoles,
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M23 7l-7 5 7 5V7z"></path>
				<rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
			</svg>
		),
	},
	{
		key: 'contentGenerator',
			name: "Pitch Deck Generator",
			href: "/dashboard/content-generator",
			allowedRoles: ROLE_BASED_NAV_CONFIG.contentGenerator.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
					/>
				</svg>
			),
		},

		{
			key: 'incubationHub',
			name: "Incubation Hub",
			href: "/dashboard/incubation-hub",
			allowedRoles: ROLE_BASED_NAV_CONFIG.incubationHub.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3.75 21h16.5M4.5 10.5L12 3l7.5 7.5M6 9.75V21m12-11.25V21M9.75 21v-4.5a2.25 2.25 0 114.5 0V21"
					/>
				</svg>
			),
		},
		{
			key: 'performance',
			name: "Performance",
			href: "/dashboard/performance",
			allowedRoles: ROLE_BASED_NAV_CONFIG.performance.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
					/>
				</svg>
			),
		},
		{
			key: 'mentors',
			name: "Mentors",
			href: "/dashboard/messages",
			allowedRoles: ROLE_BASED_NAV_CONFIG.mentors.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
					/>
				</svg>
			),
		},
		{
			key: 'userManagement',
			name: "User Management",
			href: "/dashboard/users",
			allowedRoles: ROLE_BASED_NAV_CONFIG.userManagement.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
					/>
				</svg>
			),
		},
		{
			key: 'studentManagement',
			name: "Student Management",
			href: "/dashboard/student-management",
			allowedRoles: ROLE_BASED_NAV_CONFIG.studentManagement.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
					/>
				</svg>
			),
		},
		{
			key: 'facultySubstitution',
			name: "Faculty",
			href: "/dashboard/faculty-substitution",
			allowedRoles: ROLE_BASED_NAV_CONFIG.facultySubstitution.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
					/>
				</svg>
			),
		},
		{
			key: 'academics',
			name: "Classes",
			href: "/dashboard/classes",
			allowedRoles: ROLE_BASED_NAV_CONFIG.academics.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12a2.25 2.25 0 002.25-2.25V3M3.75 3h16.5M3.75 3h-1.5m18 0h1.5M7.5 21l2.25-4.5m4.5 4.5l-2.25-4.5m-4.5 0h6.75"
					/>
				</svg>
			),
		},
		{
			key: 'campus',
			name: "Campus",
			href: "/dashboard/school-profile",
			allowedRoles: ROLE_BASED_NAV_CONFIG.campus.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.5m-15 10.5V10.5M3 21h18M4.5 10.5h15"
					/>
				</svg>
			),
		},
		{
			key: 'schoolManagement',
			name: "School Management",
			href: "/dashboard/school-management",
			allowedRoles: ROLE_BASED_NAV_CONFIG.schoolManagement.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
					/>
				</svg>
			),
		},
		{
			key: 'timetable',
			name: "Timetable",
			href: "/dashboard/timetable",
			allowedRoles: ROLE_BASED_NAV_CONFIG.timetable.allowedRoles,
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
		},
		{
			key: 'attendance',
			name: "Attendance",
			href: "/dashboard/attendance",
			allowedRoles: ROLE_BASED_NAV_CONFIG.attendance.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9 12.75L11.25 15 15 9.75M21 12c0 4.971-4.03 9-9 9s-9-4.029-9-9 4.03-9 9-9 9 4.029 9 9z"
					/>
				</svg>
			),
		},
		{
			key: 'eventsManagement',
			name: "Events Management",
			href: "/dashboard/events",
			allowedRoles: ROLE_BASED_NAV_CONFIG.eventsManagement.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
					/>
				</svg>
			),
		},
		{
			key: 'eventsStudent',
			name: "Browse Events",
			href: "/dashboard/events/student",
			allowedRoles: ROLE_BASED_NAV_CONFIG.eventsStudent.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
					/>
				</svg>
			),
		},
		{
			key: 'eventsPublic',
			name: "Public Events",
			href: "/dashboard/events/public",
			allowedRoles: ROLE_BASED_NAV_CONFIG.eventsPublic.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
					/>
				</svg>
			),
		},

		{
			key: 'reportCards',
			name: "Report Cards",
			href: "/dashboard/report-cards",
			allowedRoles: ROLE_BASED_NAV_CONFIG.reportCards.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
					/>
				</svg>
			),
		},
		{
			key: 'userAccess',
			name: "User Access",
			href: "/dashboard/user-access",
			allowedRoles: ROLE_BASED_NAV_CONFIG.userAccess.allowedRoles,
			superAdminOnly: ROLE_BASED_NAV_CONFIG.userAccess.superAdminOnly,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
					/>
				</svg>
			),
		},
		{
			key: 'settings',
			name: "Settings",
			href: "/dashboard/settings",
			allowedRoles: ROLE_BASED_NAV_CONFIG.settings.allowedRoles,
			icon: (
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					className="h-5 w-5"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			),
		},
	];

	return (
		<>
			{/* Mobile Overlay */}
			{isOpen ? (
				<div
					className="fixed inset-0 z-40 overlay-scrim backdrop-blur-sm lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			) : null}

			{/* Sidebar */}
			<aside
				className={`dashboard-sidenav fixed left-0 top-0 z-50 flex h-screen transform flex-col border-r bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} ${isCollapsed ? "w-20" : "w-64"}`}
			>
				{/* Logo Section */}
				<div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
					<Link
						href="/dashboard"
						className={`flex items-center gap-2 transition-all duration-300 ${
							isCollapsed ? "lg:justify-center" : ""
						}`}
					>
						{schoolData?.logo_url ? (
							<img
								src={schoolData.logo_url}
								alt={schoolData.school_name || "School Logo"}
								loading="lazy"
								decoding="async"
								className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-md"
							/>
						) : (
							<Image
								src="/asset/igyan-ai-mark.png"
								alt="IGYAN.AI"
								width={40}
								height={40}
								className="h-10 w-10 shrink-0 object-contain shadow-md ring-2 ring-indigo-500/20"
							/>
						)}
						{!isCollapsed && (
							<span
								className="text-lg font-bold text-zinc-900 transition-all duration-300 dark:text-white"
							>
								{schoolData?.school_name || "IGYAN.AI"}
							</span>
						)}
					</Link>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="hidden lg:flex rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
							title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className={`h-5 w-5 transition-transform duration-300 ${
									isCollapsed ? "rotate-180" : ""
								}`}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
								/>
							</svg>
						</button>
						<button
							onClick={() => setIsOpen(false)}
							className="lg:hidden rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-5 w-5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>

				{/* Navigation */}
				<nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{/* Dashboard - Always visible at top */}
					{navItems.filter(item => item.key === 'dashboard').map((item) => {
						if (!hasAccess(item.key, item.allowedRoles, item.superAdminOnly)) return null;
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.key}
								href={item.href}
								onClick={() => setIsOpen(false)}
								className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
									isActive
										? "bg-linear-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 shadow-sm ring-1 ring-indigo-500/20 dark:from-indigo-500/20 dark:to-purple-500/20 dark:text-indigo-400"
										: "text-zinc-700 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
								} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
								title={isCollapsed ? item.name : ""}
							>
								<div className={`${isCollapsed ? "lg:mx-auto" : ""} ${isActive ? "scale-110" : ""} transition-transform`}>
									{item.icon}
								</div>
								<span className={`transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
									{item.name}
								</span>
								{isActive && !isCollapsed && (
									<div className="ml-auto h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
								)}
								{isCollapsed && (
									<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
										{item.name}
										<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100"></div>
									</div>
								)}
							</Link>
						);
					})}

					{/* Omni Sight - Video Conferencing */}
					{navItems.filter(item => item.key === 'liveClassroom').map((item) => {
						if (!hasAccess(item.key, item.allowedRoles, item.superAdminOnly)) return null;
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.key}
								href={item.href}
								onClick={() => setIsOpen(false)}
								className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
									isActive
										? "bg-linear-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 shadow-sm ring-1 ring-indigo-500/20 dark:from-indigo-500/20 dark:to-purple-500/20 dark:text-indigo-400"
										: "text-zinc-700 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
								} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
								title={isCollapsed ? item.name : ""}
							>
								<div className={`${isCollapsed ? "lg:mx-auto" : ""} ${isActive ? "scale-110" : ""} transition-transform`}>
									{item.icon}
								</div>
								<span className={`transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
									{item.name}
								</span>
								{isActive && !isCollapsed && (
									<div className="ml-auto h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
								)}
								{isCollapsed && (
									<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
										{item.name}
										<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100"></div>
									</div>
								)}
							</Link>
						);
					})}

					{/* Super Admin Navigation */}
					{user?.role === 'super_admin' && (
						<>
							{/* School Management */}
							<div className={`mt-5 mb-2 ${isCollapsed ? "lg:hidden" : ""}`}>
								<p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
									School Management
								</p>
							</div>
							{navItems.filter(item => ['studentManagement', 'facultySubstitution', 'academics', 'timetable', 'schoolManagement', 'campus'].includes(item.key)).map((item) => {
								if (!hasAccess(item.key, item.allowedRoles, item.superAdminOnly)) return null;
								const isActive = pathname === item.href;
								const displayName = item.key === 'studentManagement' ? 'Student' :
									item.key === 'facultySubstitution' ? 'Faculty' :
									item.key === 'academics' ? 'Classes' :
									item.key === 'timetable' ? 'Academic Sessions' :
									item.key === 'schoolManagement' ? 'Transfer' :
									item.key === 'campus' ? 'Campus' : item.name;
								return (
									<Link
										key={item.key}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
											isActive
												? "bg-[#fff5ed] text-[#ea580c] font-bold shadow-xs ring-1 ring-[#ea580c]/20"
												: "text-slate-600 hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
										} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
										title={isCollapsed ? displayName : ""}
									>
										<div className={`${isCollapsed ? "lg:mx-auto" : ""} ${isActive ? "scale-110 text-[#ea580c]" : ""} transition-transform`}>
											{item.icon}
										</div>
										<span className={`transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
											{displayName}
										</span>
										{isActive && !isCollapsed && (
											<div className="ml-auto h-2 w-2 rounded-full bg-[#ea580c]"></div>
										)}
										{isCollapsed && (
											<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
												{displayName}
												<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100"></div>
											</div>
										)}
									</Link>
								);
							})}

							{/* Communication */}
							<div className={`mt-5 mb-2 ${isCollapsed ? "lg:hidden" : ""}`}>
								<p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
									Communication
								</p>
							</div>
							{navItems.filter(item => ['messages', 'eventsManagement'].includes(item.key)).map((item) => {
								if (!hasAccess(item.key, item.allowedRoles, item.superAdminOnly)) return null;
								const isActive = pathname === item.href;
								const displayName = item.key === 'messages' ? 'Communication' : item.name;
								return (
									<Link
										key={item.key}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
											isActive
												? "bg-[#fff5ed] text-[#ea580c] font-bold shadow-xs ring-1 ring-[#ea580c]/20"
												: "text-slate-600 hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
										} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
										title={isCollapsed ? displayName : ""}
									>
										<div className={`${isCollapsed ? "lg:mx-auto" : ""} ${isActive ? "scale-110 text-[#ea580c]" : ""} transition-transform`}>
											{item.icon}
										</div>
										<span className={`transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
											{displayName}
										</span>
										{isActive && !isCollapsed && (
											<div className="ml-auto h-2 w-2 rounded-full bg-[#ea580c]"></div>
										)}
										{isCollapsed && (
											<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
												{displayName}
												<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100"></div>
											</div>
										)}
									</Link>
								);
							})}

							{/* System & Users */}
							<div className={`mt-5 mb-2 ${isCollapsed ? "lg:hidden" : ""}`}>
								<p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
									System & Users
								</p>
							</div>
							{navItems.filter(item => ['userManagement', 'userAccess', 'settings'].includes(item.key)).map((item) => {
								if (!hasAccess(item.key, item.allowedRoles, item.superAdminOnly)) return null;
								const isActive = pathname === item.href;
								const displayName = item.key === 'userAccess' ? 'Access & Roles' : item.name;
								return (
									<Link
										key={item.key}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
											isActive
												? "bg-[#fff5ed] text-[#ea580c] font-bold shadow-xs ring-1 ring-[#ea580c]/20"
												: "text-slate-600 hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
										} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
										title={isCollapsed ? displayName : ""}
									>
										<div className={`${isCollapsed ? "lg:mx-auto" : ""} ${isActive ? "scale-110 text-[#ea580c]" : ""} transition-transform`}>
											{item.icon}
										</div>
										<span className={`transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
											{displayName}
										</span>
										{isActive && !isCollapsed && (
											<div className="ml-auto h-2 w-2 rounded-full bg-[#ea580c]"></div>
										)}
										{isCollapsed && (
											<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
												{displayName}
												<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100"></div>
											</div>
										)}
									</Link>
								);
							})}

							{/* I-GYAN AI Suite */}
							<div className={`mt-5 mb-2 ${isCollapsed ? "lg:hidden" : ""}`}>
								<p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
									AI Suite
								</p>
							</div>
							{navItems.filter(item => ['copilot', 'gyanisage', 'tools', 'liveClassroom'].includes(item.key)).map((item) => {
								if (!hasAccess(item.key, item.allowedRoles, item.superAdminOnly)) return null;
								const isActive = pathname === item.href;
								const displayName = item.key === 'copilot' ? 'Co-Pilot' :
									item.key === 'gyanisage' ? 'Buddy AI' :
									item.key === 'tools' ? 'AI Tools' : item.name;
								return (
									<Link
										key={item.key}
										href={item.href}
										onClick={() => setIsOpen(false)}
										className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
											isActive
												? "bg-[#fff5ed] text-[#ea580c] font-bold shadow-xs ring-1 ring-[#ea580c]/20"
												: "text-slate-600 hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
										} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
										title={isCollapsed ? displayName : ""}
									>
										<div className={`${isCollapsed ? "lg:mx-auto" : ""} ${isActive ? "scale-110 text-[#ea580c]" : ""} transition-transform`}>
											{item.icon}
										</div>
										<span className={`transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
											{displayName}
										</span>
										{isActive && !isCollapsed && (
											<div className="ml-auto h-2 w-2 rounded-full bg-[#ea580c]"></div>
										)}
										{isCollapsed && (
											<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
												{displayName}
												<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100"></div>
											</div>
										)}
									</Link>
								);
							})}
						</>
					)}

					{/* Other roles - show their appropriate navigation */}
					{user?.role !== 'super_admin' && navItems.map((item) => {
						if (!hasAccess(item.key, item.allowedRoles, item.superAdminOnly)) return null;
						if (item.key === 'dashboard') return null; // Already shown at top
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.key}
								href={item.href}
								onClick={() => setIsOpen(false)}
								className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
									isActive
										? "bg-linear-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 shadow-sm ring-1 ring-indigo-500/20 dark:from-indigo-500/20 dark:to-purple-500/20 dark:text-indigo-400"
										: "text-zinc-700 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
								} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
								title={isCollapsed ? item.name : ""}
							>
								<div className={`${isCollapsed ? "lg:mx-auto" : ""} ${isActive ? "scale-110" : ""} transition-transform`}>
									{item.icon}
								</div>
								<span className={`transition-all duration-300 ${isCollapsed ? "lg:hidden" : ""}`}>
									{item.name}
								</span>
								{isActive && !isCollapsed && (
									<div className="ml-auto h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400"></div>
								)}
								{isCollapsed && (
									<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
										{item.name}
										<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100"></div>
									</div>
								)}
							</Link>
						);
					})}
				</nav>

				{/* ── Footer ── */}
				{!isCollapsed && (
					<div className="mt-auto px-4 py-4 text-center border-t border-slate-100 dark:border-zinc-800">
						<span className="text-xs text-slate-400 font-normal">
							Powered by Igyan.ai
						</span>
					</div>
				)}
			</aside>
		</>
	);
}
