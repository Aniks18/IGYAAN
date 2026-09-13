"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../app/utils/auth_context";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../app/utils/supabase";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search, Bell, ChevronDown, User, Settings, HelpCircle, LogOut, Clock } from "lucide-react";

const PAGE_TITLES = [
	["/dashboard/timetable", "Calendar"],
	["/dashboard/tools", "AI Tools"],
	["/dashboard/courses", "Learn"],
	["/dashboard/gyanisage", "Buddy AI"],
	["/dashboard/academics", "Academics"],
	["/dashboard/live-classroom", "Classroom"],
	["/dashboard/games", "Games"],
	["/dashboard/innovation", "Innovation"],
	["/dashboard/campus", "Campus"],
	["/dashboard/copilot", "Co-pilot"],
	["/dashboard/viva-ai", "AI Viva Lab"],
	["/dashboard/homework", "My Homework"],
	["/dashboard/report-cards", "AI Report"],
	["/dashboard/gamified", "Gamified Homework"],
	["/dashboard/content-generator", "Pitch Craft"],
	["/dashboard/incubation-hub", "Incubation Hub"],
	["/dashboard/events", "Campus Events"],
	["/dashboard/faculty-chat", "Parent Connect"],
	["/dashboard/faculty-substitution", "Smart Substitution"],
	["/dashboard/school-management", "School Management"],
	["/dashboard/school-profile", "School Profile"],
	["/dashboard/student-management", "Student Management"],
	["/dashboard/users", "User Management"],
	["/dashboard/user-access", "Access & Roles"],
	["/dashboard/shark-ai", "AI Shark"],
	["/dashboard/attendance", "Attendance"],
	["/dashboard/performance", "Performance"],
	["/dashboard/settings", "Settings"],
];

function getPageTitle(pathname) {
	if (pathname === "/dashboard") return "Dashboard";
	return PAGE_TITLES.find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard";
}

export default function DashboardNavbar({ onMenuClick, schoolData }) {
	const { user, logout } = useAuth();
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [notifications, setNotifications] = useState(0);
	const [sessionRequests, setSessionRequests] = useState([]);
	const dropdownRef = useRef(null);
	const notificationsRef = useRef(null);
	const router = useRouter();
	const pathname = usePathname();
	const pageTitle = getPageTitle(pathname);

	// Close dropdown when clicking outside
	// Fetch session requests for B2C users (mentors and students)
	useEffect(() => {
		if (user?.role === 'b2c_mentor' || user?.role === 'b2c_student') {
			fetchSessionRequests();
			
			// Set up real-time subscription for session requests
			const filterField = user.role === 'b2c_mentor' ? 'mentor_user_id' : 'student_user_id';
			const channel = supabase
				.channel('session_requests_channel')
				.on('postgres_changes', 
					{ 
						event: '*', 
						schema: 'public', 
						table: 'session_requests',
						filter: `${filterField}=eq.${user.id}`
					}, 
					() => {
						fetchSessionRequests();
					}
				)
				.subscribe();

			return () => {
				supabase.removeChannel(channel);
			};
		}
	}, [user]);

	async function fetchSessionRequests() {
		if (!user?.id) return;

		try {
			let query = supabase.from("session_requests");
			
			if (user.role === 'b2c_mentor') {
				// Mentors see pending requests
				const { data, error } = await query
					.select(`
						*,
						student:student_user_id (
							id,
							full_name,
							email,
							image_base64
						)
					`)
					.eq("mentor_user_id", user.id)
					.eq("status", "pending")
					.order("created_at", { ascending: false });

				if (error) throw error;
				setSessionRequests(data || []);
				setNotifications(data?.length || 0);
			} else if (user.role === 'b2c_student') {
				// Students see accepted/rejected requests (updates from mentors)
				const { data, error } = await query
					.select(`
						*,
						mentor:mentor_user_id (
							id,
							full_name,
							email,
							image_base64
						)
					`)
					.eq("student_user_id", user.id)
					.in("status", ["accepted", "rejected"])
					.is("student_viewed", null)
					.order("updated_at", { ascending: false });

				if (error) throw error;
				setSessionRequests(data || []);
				setNotifications(data?.length || 0);
			}
		} catch (error) {
			console.error("Error fetching session requests:", error);
		}
	}

	useEffect(() => {
		function handleClickOutside(event) {
			const target = event.target;
			if (dropdownRef.current && !dropdownRef.current.contains(target)) {
				setIsProfileOpen(false);
			}
			if (notificationsRef.current && !notificationsRef.current.contains(target)) {
				setIsNotificationsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggleNotifications = () => {
		setIsNotificationsOpen(!isNotificationsOpen);
	};

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	// Determine if user is B2C
	const isB2CUser = user?.role === 'b2c_student' || user?.role === 'b2c_mentor';
	const canSeeAchievements = user?.role === 'student' || user?.role === 'b2c_student';

	return (
		<header className="dashboard-nav sticky top-2 z-30">
			<div className="dashboard-nav-inner flex items-center justify-between">
				{/* Left Section */}
				<div className="flex items-center gap-4">
					<button
						onClick={onMenuClick}
						className="rounded-lg p-2 transition-all hover:opacity-70 lg:hidden"
						style={{ color: 'var(--dashboard-muted)' }}
						aria-label="Toggle menu"
					>
						<Menu className="h-6 w-6" />
					</button>

					<p className="dashboard-page-label">{pageTitle}</p>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-4">
					<div className="hidden items-center md:flex">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--dashboard-muted)' }} />
							<input id="dashboard-search" name="search" aria-label="Search anything" type="text" placeholder="Search anything..." className="dashboard-search dashboard-tools-search text-base transition-all focus:outline-none focus:ring-2" style={{ color: 'var(--dashboard-text)', '--tw-ring-color': 'color-mix(in srgb, var(--dashboard-primary) 30%, transparent)' }} />
						</div>
					</div>
					{canSeeAchievements && (
						<div className="hidden h-12 w-12 items-center justify-center sm:flex" aria-label="Achievements">
							<Image src="/badges/silver-badge.png" alt="Silver achievement badge" width={48} height={48} className="h-12 w-12 object-contain" />
						</div>
					)}
					{/* Portal Badge */}
					{isB2CUser && (
						<div className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-1.5 ring-1 ring-cyan-500/20 dark:from-cyan-500/20 dark:to-blue-500/20">
							<div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></div>
							<span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Launch Pad</span>
						</div>
					)}

					{/* Mobile Search */}
					<button 
						className="rounded-lg p-2 transition-all hover:opacity-70 md:hidden"
						style={{ color: 'var(--dashboard-muted)' }}
						aria-label="Search"
					>
						<Search className="h-5 w-5" />
					</button>

					{/* Notifications */}
					<div className="relative" ref={notificationsRef}>
						<button
							onClick={toggleNotifications}
							className="relative rounded-lg p-2 transition-all hover:opacity-70 focus:outline-none focus-visible:ring-2"
							style={{ color: 'var(--dashboard-muted)', '--tw-ring-color': 'var(--dashboard-primary)' }}
							aria-haspopup="true"
							aria-expanded={isNotificationsOpen}
							aria-label="Notifications"
						>
							<Bell className="h-5 w-5" />
							{notifications > 0 && (
								<span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg ring-2" style={{ '--tw-ring-color': 'var(--dashboard-surface-solid)' }}>
									{notifications}
								</span>
							)}
						</button>

						{isNotificationsOpen && (
							<div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
								style={{
									border: '1px solid var(--dashboard-border)',
									backgroundColor: 'var(--dashboard-surface-solid)'
								}}>
								<div className="border-b px-4 py-3"
									style={{ borderColor: 'var(--dashboard-border)' }}>
									<p className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Notifications</p>
								</div>
								
								{/* Notification Content */}
								{sessionRequests.length === 0 ? (
									<div className="px-4 py-12 text-center">
										<Bell
											className="mx-auto h-12 w-12 mb-3"
											style={{ color: 'var(--dashboard-muted)' }}
										/>
										<p className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>No notifications yet</p>
										<p className="mt-1 text-xs" style={{ color: 'var(--dashboard-muted)' }}>We'll notify you when something arrives</p>
									</div>
								) : (
									<div className="max-h-96 overflow-y-auto">
										{sessionRequests.map((request) => {
											const otherUser = user?.role === 'b2c_mentor' ? request.student : request.mentor;
											const statusColors = {
												pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
												accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
												rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
											};
											const statusLabel = request.status === 'pending' ? 'New Request' : 
												request.status === 'accepted' ? 'Request Accepted' : 'Request Rejected';
											
											return (
												<Link 
													key={request.id}
													href="/dashboard/messages?openRequests=true"
													onClick={async () => {
														setIsNotificationsOpen(false);
														if (user?.role === 'b2c_student') {
															await supabase
																.from('session_requests')
																.update({ student_viewed: true })
																.eq('id', request.id);
														}
													}}
													className="block border-b px-4 py-3 transition-colors hover:opacity-90"
													style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}
												>
													<div className="flex items-start gap-3">
														<div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
															{otherUser?.image_base64 ? (
																<img 
																	src={otherUser.image_base64} 
																	alt={otherUser.full_name}
																	width={40}
																	height={40}
																	loading="lazy"
																	decoding="async"
																	className="h-full w-full object-cover"
																/>
															) : (
																<span className="text-white font-semibold text-sm">
																	{otherUser?.full_name?.charAt(0) || 'U'}
																</span>
															)}
														</div>
														
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<p className="text-sm font-semibold truncate" style={{ color: 'var(--dashboard-heading)' }}>
																	{otherUser?.full_name}
																</p>
																<span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[request.status]}`}>
																	{statusLabel}
																</span>
															</div>
															<p className="text-sm mt-0.5 truncate" style={{ color: 'var(--dashboard-text)' }}>
																{request.request_title}
															</p>
															<div className="flex items-center gap-2 mt-1">
																<Clock
																	className="h-3.5 w-3.5"
																	style={{ color: 'var(--dashboard-muted)' }}
																/>
																<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
																	{new Date(request.requested_start_time || request.updated_at).toLocaleString('en-US', {
																		month: 'short',
																		day: 'numeric',
																		hour: 'numeric',
																		minute: '2-digit',
																		hour12: true
																	})}
																</p>
															</div>
														</div>
													</div>
												</Link>
											);
										})}
										
										{/* View All Button */}
										<Link
											href="/dashboard/messages?openRequests=true"
											onClick={() => setIsNotificationsOpen(false)}
											className="block px-4 py-3 text-center text-sm font-medium transition-colors hover:opacity-80"
											style={{ color: 'var(--dashboard-primary)' }}
										>
											{user?.role === 'b2c_mentor' ? 'View All Requests' : 'View My Requests'} →
										</Link>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Divider */}
					<div className="hidden h-8 w-px sm:block" style={{ backgroundColor: 'var(--dashboard-border)' }} />

					{/* Profile Dropdown */}
					<div className="relative" ref={dropdownRef}>
						<button
							onClick={() => setIsProfileOpen(!isProfileOpen)}
							className="flex items-center gap-3 rounded-xl p-1.5 transition-all hover:shadow-sm"
							style={{ color: 'var(--dashboard-text)' }}
							aria-label="User menu"
						>
							{user?.image_base64 ? (
								<img
									src={user.image_base64}
									alt={user?.full_name || "User"}
									width={36}
									height={36}
									loading="lazy"
									decoding="async"
									className="h-9 w-9 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-500/30 dark:ring-offset-zinc-900"
								/>
							) : (
								<div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-offset-2 ${
									isB2CUser 
										? 'bg-gradient-to-br from-cyan-500 to-blue-500 ring-cyan-500/30' 
										: 'bg-gradient-to-br from-indigo-500 to-purple-500 ring-indigo-500/30'
								}`} style={{ '--tw-ring-offset-color': 'var(--dashboard-surface-solid)' }}>
									{user?.full_name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase() || "U"}
								</div>
							)}
							<div className="hidden text-left lg:block">
								<p className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
									{user?.full_name?.split(" ")[0] || "User"}
								</p>
								<p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--dashboard-muted)' }}>
									{user?.role === 'faculty' ? 'Faculty' : 
									 user?.role === 'super_admin' ? 'Super Admin' :
									 user?.role === 'co_admin' ? 'Co-Admin' :
									 user?.role === 'b2c_student' ? (
										<>
											<span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
											Student
										</>
									 ) :
									 user?.role === 'b2c_mentor' ? (
										<>
											<span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
											Mentor
										</>
									 ) :
									 user?.role === 'student' ? (schoolData?.school_name || 'Student') :
									 'User'}
								</p>
							</div>
							<ChevronDown
								className={`hidden h-4 w-4 transition-transform duration-200 lg:block ${
									isProfileOpen ? "rotate-180" : ""
								}`}
								style={{ color: 'var(--dashboard-muted)' }}
							/>
						</button>

						{/* Dropdown Menu */}
						{isProfileOpen && (
							<div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
								style={{ border: '1px solid var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
								<div className={`border-b p-4 ${isB2CUser ? 'bg-gradient-to-br from-cyan-500/5 to-blue-500/5' : ''}`}
									style={{ borderColor: 'var(--dashboard-border)' }}>
									<div className="flex items-center gap-3">
										{user?.image_base64 ? (
											<img
												src={user.image_base64}
												alt={user?.full_name || "User"}
												width={48}
												height={48}
												loading="lazy"
												decoding="async"
												className={`h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ${
													isB2CUser ? 'ring-cyan-500/30' : 'ring-indigo-500/30'
												}`}
												style={{ '--tw-ring-offset-color': 'var(--dashboard-surface-solid)' }}
											/>
										) : (
											<div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white ring-2 ${
												isB2CUser 
													? 'bg-gradient-to-br from-cyan-500 to-blue-500 ring-cyan-500/30' 
													: 'bg-gradient-to-br from-indigo-500 to-purple-500 ring-indigo-500/30'
											}`}>
												{user?.full_name
													?.split(" ")
													.map((n) => n[0])
													.join("")
													.toUpperCase() || "U"}
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold truncate" style={{ color: 'var(--dashboard-heading)' }}>
												{user?.full_name}
											</p>
											<p className="mt-0.5 text-xs truncate" style={{ color: 'var(--dashboard-muted)' }}>
												{user?.email}
											</p>
											{isB2CUser && (
												<div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2 py-0.5 ring-1 ring-cyan-500/20">
													<div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
													<span className="text-[10px] font-semibold uppercase tracking-wide text-cyan-600">
														Launch Pad
													</span>
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="p-2">
									<button
										onClick={() => {
											setIsProfileOpen(false);
											router.push("/dashboard/settings");
										}}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80"
										style={{ color: 'var(--dashboard-text)' }}
									>
										<User className="h-4 w-4" />
										My Profile
									</button>
									<button
										onClick={() => {
											setIsProfileOpen(false);
											router.push("/dashboard/settings");
										}}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80"
										style={{ color: 'var(--dashboard-text)' }}
									>
										<Settings className="h-4 w-4" />
										Settings
									</button>
									<button
										onClick={() => {
											setIsProfileOpen(false);
											router.push("/dashboard");
										}}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80"
										style={{ color: 'var(--dashboard-text)' }}
									>
										<HelpCircle className="h-4 w-4" />
										Help & Support
									</button>
								</div>

								<div className="border-t p-2" style={{ borderColor: 'var(--dashboard-border)' }}>
									<button
										onClick={handleLogout}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50/60"
									>
										<LogOut className="h-4 w-4" />
										Logout
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
