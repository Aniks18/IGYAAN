"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../utils/auth_context";
import { supabase } from "../utils/supabase";
import DashboardNavbar from "../../components/dashboard/navbar";
import UnifiedSidenav from "../../components/dashboard/unified-sidenav";
import RouteSkeleton from "../components/RouteSkeleton";

const THEME_STORAGE_KEY = "dashboard-theme";

export default function DashboardLayout({ children }) {
	const [isSidenavOpen, setIsSidenavOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [schoolData, setSchoolData] = useState(null);
	const [activeTheme, setActiveTheme] = useState(() => {
		if (typeof window !== "undefined") {
			return window.localStorage.getItem(THEME_STORAGE_KEY) || "indigo";
		}
		return "indigo";
	});
	const [showSchoolPopup, setShowSchoolPopup] = useState(false);
	const { user, logout, loading } = useAuth();
	const pathname = usePathname();

	// Validate user has valid dashboard role access
	useEffect(() => {
		if (!user) return;
		
		const INSTITUTIONAL_ROLES = ['super_admin', 'co_admin', 'student', 'faculty', 'counselor', 'parent'];
		const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];
		const ALL_VALID_ROLES = [...INSTITUTIONAL_ROLES, ...LAUNCH_PAD_ROLES];
		
		if (!ALL_VALID_ROLES.includes(user.role)) {
			// User doesn't have any valid role for dashboard
			alert("Access denied. Invalid user role.");
			logout();
		}
	}, [user, logout]);

	// Set dataset on mount
	useEffect(() => {
		if (typeof window === "undefined") return;
		document.body.dataset.dashboardTheme = activeTheme;
	}, [activeTheme]);

	// Listen for theme change events dispatched from settings page
	useEffect(() => {
		function handleThemeChange(event) {
			if (!event?.detail) return;
			setActiveTheme(event.detail);
		}

		window.addEventListener("dashboard-theme-change", handleThemeChange);
		return () => {
			window.removeEventListener("dashboard-theme-change", handleThemeChange);
		};
	}, []);

	// Persist theme changes and update body attribute
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!activeTheme) return;
		document.body.dataset.dashboardTheme = activeTheme;
		window.localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
	}, [activeTheme]);

	// Clean up dataset when dashboard unmounts
	useEffect(() => {
		return () => {
			if (document?.body?.dataset) {
				delete document.body.dataset.dashboardTheme;
			}
		};
	}, []);

	useEffect(() => {
		const fetchSchoolData = async () => {
			if (!user?.id) return;

			// B2C users don't have school data
			const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];
			if (LAUNCH_PAD_ROLES.includes(user.role)) {
				setSchoolData(null);
				return;
			}

			// Fast cache lookup
			const cacheKey = user.school_id ? `cached_school_${user.school_id}` : `cached_school_creator_${user.id}`;
			try {
				const cached = sessionStorage.getItem(cacheKey);
				if (cached) {
					setSchoolData(JSON.parse(cached));
					return;
				}
			} catch (e) {}

			try {
				// First check if user has a school_id
				if (user.school_id) {
					// Fetch school data based on user's school_id
					const { data, error } = await supabase
						.from("schools")
						.select("id, school_name, logo_url, subdomain")
						.eq("id", user.school_id)
						.single();

					if (error) {
						console.error("Error fetching school data:", error);
						return;
					}

					if (data) {
						setSchoolData(data);
						try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
					}
				} else {
					// Fallback: Check if user created a school
					const { data, error } = await supabase
						.from("schools")
						.select("id, school_name, logo_url, subdomain")
						.eq("created_by", user.id)
						.maybeSingle();

					if (error && error.code !== "PGRST116") {
						console.error("Error fetching school data:", error);
						return;
					}

					if (data) {
						setSchoolData(data);
						try { sessionStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
					}
				}
			} catch (err) {
				console.error("Error in fetchSchoolData:", err);
			}
		};

		fetchSchoolData();
	}, [user?.id, user?.school_id, user?.role]);

	// Show school registration popup for super_admin without a school
	// Don't show if user is already on the school-profile page
	useEffect(() => {
		if (!user) return;
		const isOnSchoolProfile = pathname === "/dashboard/school-profile";
		if (user.role === "super_admin" && !user.school_id && !schoolData && !isOnSchoolProfile) {
			const timer = setTimeout(() => setShowSchoolPopup(true), 800);
			return () => clearTimeout(timer);
		}
	}, [user, schoolData, pathname]);

	if (loading) {
		return <RouteSkeleton variant="dashboard" />;
	}

	return (
		<div className="dashboard-theme flex h-screen overflow-hidden">

			{/* School Onboarding Popup for Super Admin */}
			{showSchoolPopup && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
					<div className="relative mx-4 w-full max-w-lg animate-[fadeInUp_0.3s_ease-out] rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
						{/* Header icon */}
						<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-sky-600 dark:text-sky-400">
								<path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 01-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
								<path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
							</svg>
						</div>

						<h2 className="text-center text-xl font-bold text-zinc-900 dark:text-white">
							Welcome, {user?.full_name?.split(" ")[0] || "Admin"}! 🎉
						</h2>
						<p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
							Your Super Admin account is ready. Let&apos;s set up your school to unlock all features.
						</p>

						<div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/10">
							<div className="flex items-start gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500">
									<path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
								</svg>
								<p className="text-sm text-amber-800 dark:text-amber-300">
									No school is linked to your account yet. You need to register your school to start managing students, faculty, and more.
								</p>
							</div>
						</div>

						<div className="mt-6 flex flex-col gap-3">
							<a
								href="/dashboard/school-profile"
								className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-transform hover:-translate-y-0.5 hover:bg-sky-400"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
									<path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
								</svg>
								Register Your School Now
							</a>
							<button
								type="button"
								onClick={() => setShowSchoolPopup(false)}
								className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
							>
								I&apos;ll do it later
							</button>
						</div>

						<p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
							You can always register your school from Settings → School Profile
						</p>
					</div>
				</div>
			)}
			{/* Sidebar - Unified role-based navigation */}
			<UnifiedSidenav
				isOpen={isSidenavOpen}
				setIsOpen={setIsSidenavOpen}
				isCollapsed={isCollapsed}
				setIsCollapsed={setIsCollapsed}
				schoolData={schoolData}
			/>

			{/* Main Content Area */}
			<div className={`dashboard-workspace dashboard-main-content flex flex-col ${
				isCollapsed ? "dashboard-main-content--collapsed" : ""
			}`}>
				{/* Top Navbar */}
				<DashboardNavbar 
					onMenuClick={() => setIsSidenavOpen(!isSidenavOpen)}
					schoolData={schoolData}
				/>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto overflow-x-hidden">
					{children}
				</main>
			</div>
		</div>
	);
}
