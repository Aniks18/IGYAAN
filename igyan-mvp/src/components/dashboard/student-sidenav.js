"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function StudentSidenav({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, schoolData }) {
	const pathname = usePathname();
	const [expandedSections, setExpandedSections] = useState({
		taskHub: true,
		innovation: false,
	});

	const toggleSection = (section) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	// Student Portal Navigation Structure
	const studentNavSections = [
		// --- Main Section ---
		{
			key: 'mainLabel',
			type: 'label',
			title: 'Main Section',
		},
		{
			key: 'dashboard',
			title: "Dashboard",
			href: "/dashboard",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
				</svg>
			),
		},
		{
			key: 'copilot',
			title: "Co-pilot",
			href: "/dashboard/copilot",
			icon: <Image src="/asset/sudarshanai/sudarshanicon.png" alt="Co-pilot" width={20} height={20} className="object-contain nav-icon-adaptive" />,
		},
		{
			key: 'vivaLab',
			title: "AI Viva Lab",
			href: "/dashboard/viva-ai",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
				</svg>
			),
		},
		{
			key: 'buddyAi',
			title: "Buddy AI",
			href: "/dashboard/gyanisage",
			icon: <Image src="/asset/buddyicon.png" alt="Buddy AI" width={20} height={20} className="object-contain nav-icon-adaptive" />,
		},
		// --- Task Hub (Drop-Down) ---
		{
			key: 'taskHub',
			title: "Task Hub",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'homework',
					name: "My Homework",
					href: "/dashboard/homework/student",
					icon: (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
						</svg>
					),
				},
				{
					key: 'vivaResults',
					name: "Viva Evaluation Result",
					href: "/dashboard/homework/reports",
					icon: (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
						</svg>
					),
				},
				{
					key: 'aiReport',
					name: "AI Report",
					href: "/dashboard/report-cards",
					icon: (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
						</svg>
					),
				},
				{
					key: 'gamifiedHomework',
					name: "Gamified Homework",
					href: "/dashboard/gamified",
					icon: (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
						</svg>
					),
				},
				{
					key: 'skillTracks',
					name: "Skill Tracks",
					href: "/dashboard/courses",
					icon: (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
						</svg>
					),
				},
			],
		},
		// --- AI Ground ---
		{
			key: 'aiGround',
			title: "AI Ground",
			href: "/dashboard/tools",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
				</svg>
			),
			description: "All AI Tools with Filters & Search",
		},
		// --- School Innovation Cell (DROP-DOWN) ---
		{
			key: 'innovation',
			title: "School Innovation Cell",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'ideaSpark',
					name: "IDEA SPARK",
					href: "/dashboard/tools/idea-generation",
					icon: (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
						</svg>
					),
				},
				{
					key: 'pitchCraft',
					name: "Pitch Craft",
					href: "/dashboard/content-generator",
					icon: (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
						</svg>
					),
				},
				{
					key: 'aiShark',
					name: "AI Shark",
					href: "/dashboard/shark-ai",
					icon: <Image src="/asset/ai-shark/sharkicon.png" alt="AI Shark" width={20} height={20} className="object-contain nav-icon-adaptive" />,
				},
				{
					key: 'incubationForm',
					name: "Incubation Form",
					href: "/dashboard/incubation-hub",
					icon: (
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
						</svg>
					),
				},
			],
		},
		// --- Campus Events ---
		{
			key: 'events',
			title: "Campus Events",
			href: "/dashboard/events/student",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
				</svg>
			),
		},
		// --- Settings ---
		{
			key: 'settings',
			title: "Settings",
			href: "/dashboard/settings",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
					<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			),
		},
	];

	return (
		<>
			{/* Mobile Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`dashboard-sidenav fixed left-0 top-0 z-50 flex h-screen transform flex-col border-r backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} ${isCollapsed ? "w-20" : "w-64"}`}
				style={{ backgroundColor: 'var(--dashboard-surface-solid)', borderColor: 'var(--dashboard-border)' }}
			>
				{/* Logo Section */}
				<div className="flex h-16 items-center justify-between border-b px-4" style={{ borderColor: 'var(--dashboard-border)' }}>
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
								style={{ boxShadow: '0 0 0 2px color-mix(in srgb, var(--dashboard-primary) 20%, transparent)' }}
							/>
						) : (
							<Image
								src="/asset/igyan-ai-mark.png"
								alt="IGYAN.AI"
								width={40}
								height={40}
								className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-md"
								style={{ boxShadow: '0 0 0 2px color-mix(in srgb, var(--dashboard-primary) 20%, transparent)' }}
							/>
						)}
						{!isCollapsed && (
							<span className="text-lg font-bold transition-all duration-300" style={{ color: 'var(--dashboard-heading)' }}>
								{schoolData?.school_name || "IGYAN.AI"}
							</span>
						)}
					</Link>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="hidden lg:flex rounded-lg p-1.5 transition-colors hover:opacity-70"
							title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
							style={{ color: 'var(--dashboard-muted)' }}
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
								<path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
							</svg>
						</button>
						<button
							onClick={() => setIsOpen(false)}
							className="lg:hidden rounded-lg p-1.5 transition-colors hover:opacity-70"
							style={{ color: 'var(--dashboard-muted)' }}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Student Portal Header */}
				{!isCollapsed && (
					<div className="border-b px-4 py-3" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 6%, transparent)' }}>
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm" style={{ background: 'var(--dashboard-primary)' }}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
									<path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
									<path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
									<path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dashboard-primary)' }}>Student Portal</p>
								<p className="text-[10px]" style={{ color: 'var(--dashboard-muted)' }}>Learning & Innovation Hub</p>
							</div>
						</div>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{studentNavSections.map((section) => {
						// Section Label
						if (section.type === 'label') {
							if (isCollapsed) return null;
							return (
								<div key={section.key} className="px-2 pt-4 pb-2 first:pt-0">
									<p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--dashboard-muted)' }}>
										<span className="h-px flex-1" style={{ background: 'var(--dashboard-border)' }}></span>
										<span>{section.title}</span>
										<span className="h-px flex-1" style={{ background: 'var(--dashboard-border)' }}></span>
									</p>
								</div>
							);
						}

						const isActive = pathname === section.href;
						const isExpanded = expandedSections[section.key];
						const hasActiveChild = section.subItems?.some(item => pathname === item.href);

						if (section.isExpandable) {
							return (
								<div key={section.key} className="mt-1">
									<button
										onClick={() => !isCollapsed && toggleSection(section.key)}
										className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
											isCollapsed ? "lg:justify-center lg:px-0" : ""
										}`}
										style={hasActiveChild
											? { backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)', color: 'var(--dashboard-primary)' }
											: { color: 'var(--dashboard-text)' }
										}
										title={isCollapsed ? section.title : ""}
									>
										<div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${isCollapsed ? "lg:mx-auto" : ""}`}
											style={hasActiveChild
												? { background: 'var(--dashboard-primary)', color: 'white' }
												: { background: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)', color: 'var(--dashboard-text)' }
											}
										>
											{section.icon}
										</div>
										{!isCollapsed && (
											<>
												<span className="flex-1 text-left">{section.title}</span>
												<span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
													style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)', color: 'var(--dashboard-primary)' }}
												>
													{section.subItems?.length}
												</span>
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
													className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
													style={{ color: 'var(--dashboard-muted)' }}
												>
													<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
												</svg>
											</>
										)}
									</button>

									{/* Animated Dropdown */}
									<div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && !isCollapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
										{section.subItems && (
											<div className="ml-6 mt-1 space-y-0.5 border-l-2 pl-3 pb-1" style={{ borderColor: 'color-mix(in srgb, var(--dashboard-primary) 20%, transparent)' }}>
												{section.subItems.map((subItem) => {
													const isSubActive = pathname === subItem.href;
													return (
														<Link
															key={subItem.key}
															href={subItem.href}
															onClick={() => setIsOpen(false)}
															className="group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all"
															style={isSubActive
																? { backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)', color: 'var(--dashboard-primary)', borderLeft: '2px solid var(--dashboard-primary)', marginLeft: '-1px' }
																: { color: 'var(--dashboard-muted)' }
															}
														>
															<span className="flex h-6 w-6 shrink-0 items-center justify-center">
																{subItem.icon}
															</span>
															<span className="flex-1">{subItem.name}</span>
															{isSubActive && (
																<div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--dashboard-primary)' }}></div>
															)}
														</Link>
													);
												})}
											</div>
										)}
									</div>
								</div>
							);
						}

						// Regular Section (direct link)
						return (
							<Link
								key={section.key}
								href={section.href}
								onClick={() => setIsOpen(false)}
								className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
									isCollapsed ? "lg:justify-center lg:px-0" : ""
								}`}
								style={isActive
									? { backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)', color: 'var(--dashboard-primary)' }
									: { color: 'var(--dashboard-text)' }
								}
								title={isCollapsed ? section.title : ""}
							>
								<div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${isCollapsed ? "lg:mx-auto" : ""}`}
									style={isActive
										? { background: 'var(--dashboard-primary)', color: 'white' }
										: { background: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)', color: 'var(--dashboard-text)' }
									}
								>
									{section.icon}
								</div>
								{!isCollapsed && (
									<>
										<span className="flex-1">{section.title}</span>
										{section.description && (
											<span className="text-[10px] max-w-[80px] truncate" style={{ color: 'var(--dashboard-muted)' }}>
												{section.description}
											</span>
										)}
										{isActive && (
											<div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--dashboard-primary)' }}></div>
										)}
									</>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Footer */}
				{!isCollapsed && (
					<div className="p-3" style={{ borderTop: '1px solid var(--dashboard-border)' }}>
						<div className="rounded-xl p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 6%, transparent)' }}>
							<p className="text-xs font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Learn & Innovate</p>
							<p className="mt-0.5 text-[10px]" style={{ color: 'var(--dashboard-muted)' }}>
								Your journey to excellence starts here
							</p>
						</div>
					</div>
				)}
			</aside>
		</>
	);
}
