"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function FacultySidenav({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, schoolData }) {
	const pathname = usePathname();
	const [expandedSections, setExpandedSections] = useState({
		teachingHub: true,
	});

	const toggleSection = (section) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	// Faculty Portal Navigation Structure
	const facultyNavSections = [
		{
			key: 'copilot',
			title: "Copilot",
			href: "/dashboard/copilot-faculty",
			icon: <Image src="/asset/sudarshanai/sudarshanicon.png" alt="Sudarshan AI" width={20} height={20} className="object-contain nav-icon-adaptive" />,
		},
		{
			key: 'attendance',
			title: "Attendance",
			href: "/dashboard/attendance",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
				</svg>
			),
		},
		{
			key: 'timetable',
			title: "Smart Substitution",
			href: "/dashboard/faculty-substitution",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9 2.25h.008v.008H12v-.008z" />
				</svg>
			),
		},
		{
			key: 'teachingHub',
			title: "Assessment & Teaching Hub",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'aiTestGenerator',
					name: "AI Question Builder",
					href: "/dashboard/assignments",
					icon: "🤖",
				},
				{
					key: 'reuseOldPapers',
					name: "Question Bank",
					href: "/dashboard/question-paper",
					icon: "📄",
				},
				{
					key: 'vivaMockCreator',
					name: "AI Viva Evaluator",
					href: "/dashboard/homework",
					icon: "🎤",
				},
				{
					key: 'vivaResults',
					name: "Viva Evaluation Result",
					href: "/dashboard/homework/reports",
					icon: "📊",
				},
				{
					key: 'gamifiedAssignments',
					name: "Gamified Assignments",
					href: "/dashboard/gamified-assignments",
					icon: "🏆",
				},
				{
					key: 'aiReport',
					name: "AI Report",
					href: "/dashboard/report-cards",
					icon: "📋",
				},
				{
					key: 'smartNotesGenerator',
					name: "Smart Notes Studio",
					href: "/dashboard/tools/notes-generator",
					icon: "📝",
				},
				{
					key: 'quizMe',
					name: "Teaching Test",
					href: "/dashboard/tools/teacher-prep",
					icon: "❓",
				},
				{
					key: 'textSummarizer',
					name: "Lesson Summarizer",
					href: "/dashboard/tools/text-summarizer",
					icon: "📋",
				},
				{
					key: 'codeTutor',
					name: "Code Tutor",
					href: "/dashboard/tools/code-tutor",
					icon: "💻",
				},
				{
					key: 'stepByStepGuide',
					name: "Pedagogy Planner",
					href: "/dashboard/tools/step-by-step",
					icon: "📖",
				},
				{
					key: 'projectBasedLearning',
					name: "Innovation Planner",
					href: "/dashboard/tools/project-learning",
					icon: "🎯",
				},
				{
					key: 'presentationBuilder',
					name: "Slide Creator",
					href: "/dashboard/content-generator",
					icon: "🎨",
				},
			],
		},
		{
			key: 'parentMessages',
			title: "Parent Messages",
			href: "/dashboard/faculty-chat",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
				</svg>
			),
		},
		{
			key: 'events',
			title: "Institutional Events",
			href: "/dashboard/events",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
				</svg>
			),
		},
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
				className={`dashboard-sidenav fixed left-0 top-0 z-50 flex h-screen transform flex-col backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"} ${isCollapsed ? "w-20" : "w-64"}`}
				style={{ borderRight: '1px solid var(--dashboard-border)', background: 'var(--dashboard-background)' }}
			>
				{/* Logo Section */}
				<div className="flex h-16 items-center justify-between px-4" style={{ borderBottom: '1px solid var(--dashboard-border)' }}>
					<Link
						href="/dashboard"
						className={`flex items-center gap-2 transition-all duration-300 ${isCollapsed ? "lg:justify-center" : ""}`}
					>
						{schoolData?.logo_url ? (
							<img
								src={schoolData.logo_url}
								alt={schoolData.school_name || "School Logo"}
								width={40}
								height={40}
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
								className="h-10 w-10 shrink-0 object-contain shadow-md"
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
							className="hidden lg:flex rounded-lg p-1.5 transition-colors hover:opacity-80"
							style={{ color: 'var(--dashboard-muted)' }}
							title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
							</svg>
						</button>
						<button
							onClick={() => setIsOpen(false)}
							className="lg:hidden rounded-lg p-1.5 transition-colors hover:opacity-80"
							style={{ color: 'var(--dashboard-muted)' }}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Faculty Portal Header */}
				{!isCollapsed && (
					<div className="px-4 py-3" style={{ borderBottom: '1px solid var(--dashboard-border)', background: 'color-mix(in srgb, var(--dashboard-primary) 6%, transparent)' }}>
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm" style={{ background: 'var(--dashboard-primary)' }}>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
									<path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
									<path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
									<path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dashboard-primary)' }}>Faculty Portal</p>
								<p className="text-[10px]" style={{ color: 'var(--dashboard-muted)' }}>Teaching & Assessment Tools</p>
							</div>
						</div>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{facultyNavSections.map((section) => {
						const isActive = pathname === section.href;
						const isExpanded = expandedSections[section.key];
						const hasActiveChild = section.subItems?.some(item => pathname === item.href);

						if (section.isExpandable) {
							return (
								<div key={section.key} className="mt-1">
									<button
										onClick={() => !isCollapsed && toggleSection(section.key)}
										className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
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
										{isCollapsed && (
											<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 lg:block hidden" style={{ background: 'var(--dashboard-surface-solid)' }}>
												{section.title}
											</div>
										)}
									</button>

									{/* Animated Dropdown */}
									<div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded && !isCollapsed ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
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
															<span className="flex h-6 w-6 shrink-0 items-center justify-center text-base">
																{subItem.icon}
															</span>
															<span className="flex-1">{subItem.name}</span>
															{isSubActive && (
																<div className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--dashboard-primary)' }}></div>
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

						// Regular Section (no subitems)
						return (
							<Link
								key={section.key}
								href={section.href}
								onClick={() => setIsOpen(false)}
								className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
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
										{isActive && (
											<div className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--dashboard-primary)' }}></div>
										)}
									</>
								)}
								{isCollapsed && (
									<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 lg:block hidden" style={{ background: 'var(--dashboard-surface-solid)' }}>
										{section.title}
									</div>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Footer */}
				{!isCollapsed && (
					<div className="p-3" style={{ borderTop: '1px solid var(--dashboard-border)' }}>
						<div className="rounded-xl p-3" style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 6%, transparent)' }}>
							<p className="text-xs font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Quick Access</p>
							<p className="mt-0.5 text-[10px]" style={{ color: 'var(--dashboard-muted)' }}>
								All your teaching tools in one place
							</p>
						</div>
					</div>
				)}
			</aside>
		</>
	);
}
