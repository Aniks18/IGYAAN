"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../../app/utils/auth_context";
import { supabase } from "../../app/utils/supabase";
import { getNavSections, getMasterNavSections, ROLE_ACCESS, getMustHaveKeys } from "./sidenav-config";
import { ChevronsLeft, X } from "lucide-react";

/**
 * Master Sidenav — single sidenav component for ALL dashboard roles.
 * Replaces all legacy per-role sidenavs (faculty-sidenav, student-sidenav, etc.)
 *
 * Access logic:
 *  1. super_admin → sees everything from their role nav
 *  2. b2c_student / b2c_mentor → role defaults, no user_access restrictions
 *  3. Institutional users (faculty, student, co_admin, counselor, parent):
 *     - If user_access table has entries for this user → WHITELIST mode:
 *       renders MASTER_NAV filtered to only granted modules
 *     - If user_access table has NO entries → role-specific defaults
 */
export default function UnifiedSidenav({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, schoolData }) {
	const pathname = usePathname();
	const { user } = useAuth();
	// undefined = still loading, null = no whitelist, Set = active whitelist
	const [userModules, setUserModules] = useState(undefined);
	const [loadingAccess, setLoadingAccess] = useState(true);

	const portalLabels = {
		super_admin: { title: "Admin Portal", subtitle: "Full System Control" },
		co_admin: { title: "Admin Portal", subtitle: "School Management" },
		faculty: { title: "Faculty Portal", subtitle: "Teaching & Assessment" },
		student: { title: "Student Portal", subtitle: "Learning & Innovation Hub" },
		counselor: { title: "Counselor Portal", subtitle: "Well-being & Guidance" },
		parent: { title: "Parent Portal", subtitle: "Track & Connect" },
		b2c_student: { title: "Launch Pad", subtitle: "Build · Pitch · Launch" },
		b2c_mentor: { title: "Mentor Console", subtitle: "Guide · Review · Impact" },
	};
	const portal = portalLabels[user?.role] || portalLabels.student;

	// ══════════════════════════════════════════════════════════════
	//  Fetch user_access whitelist from DB
	// ══════════════════════════════════════════════════════════════
	useEffect(() => {
		if (!user) return;

		// B2C users don't use user_access — skip fetch
		const B2C = ["b2c_student", "b2c_mentor"];
		if (B2C.includes(user.role)) {
			setUserModules(null);
			setLoadingAccess(false);
			return;
		}
		// All institutional users (including super_admin) check user_access

		let cancelled = false;

		(async () => {
			try {
				const { data, error } = await supabase
					.from("user_access")
					.select("module_name")
					.eq("user_id", user.id);

				if (cancelled) return;

				if (error) {
					console.error("[MasterSidenav] user_access query error:", error.message, error.details, error.hint);
					setUserModules(null); // graceful fallback — show role defaults
					return;
				}

				if (data && data.length > 0) {
					const moduleSet = new Set(data.map((d) => d.module_name));
					console.log("[MasterSidenav] Whitelist active:", [...moduleSet]);
					setUserModules(moduleSet);
				} else {
					console.log("[MasterSidenav] No user_access entries for", user.id, "— showing role defaults");
					setUserModules(null);
				}
			} catch (err) {
				if (!cancelled) {
					console.error("[MasterSidenav] Exception fetching user_access:", err);
					setUserModules(null);
				}
			} finally {
				if (!cancelled) setLoadingAccess(false);
			}
		})();

		return () => { cancelled = true; };
	}, [user]);

	// ══════════════════════════════════════════════════════════════
	//  Pick nav sections based on whitelist state
	// ══════════════════════════════════════════════════════════════
	const rawSections = useMemo(() => {
		if (!user) return [];
		// super_admin always uses dedicated ADMIN_NAV from Figma design
		if (user.role === "super_admin") return getNavSections("super_admin");
		// Whitelist active → use MASTER_NAV so all granted items can render
		if (userModules instanceof Set) return getMasterNavSections();
		// No whitelist → use the curated role-specific nav
		return getNavSections(user.role);
	}, [user, userModules]);

	// ══════════════════════════════════════════════════════════════
	//  Access gate
	// ══════════════════════════════════════════════════════════════
	const mustHaves = user ? getMustHaveKeys(user.role) : new Set();

	const checkAccess = (itemKey) => {
		if (!user) return false;

		const B2C = ["b2c_student", "b2c_mentor"];
		if (B2C.includes(user.role)) return true;

		// super_admin has full access to their configured nav
		if (user.role === "super_admin") return true;

		// Must-have items ALWAYS show (dashboard, settings, user-access for super_admin)
		if (mustHaves.has(itemKey)) return true;

		// While loading → optimistic: show whatever the role allows
		if (loadingAccess) {
			const allowed = ROLE_ACCESS[itemKey];
			return !allowed || allowed.includes(user.role);
		}

		// ── Whitelist is AUTHORITATIVE for ALL other roles ──
		if (userModules instanceof Set) {
			return userModules.has(itemKey);
		}

		// Other roles with no whitelist → standard ROLE_ACCESS check
		const allowed = ROLE_ACCESS[itemKey];
		if (allowed && !allowed.includes(user.role)) return false;
		return true;
	};

	// ══════════════════════════════════════════════════════════════
	//  Pre-filter sections so empty ones don't render labels
	// ══════════════════════════════════════════════════════════════
	const sections = useMemo(() => {
		return rawSections
			.map((section) => ({
				...section,
				items: section.items.filter((item) => checkAccess(item.key)),
			}))
			.filter((section) => section.items.length > 0);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rawSections, userModules, loadingAccess, user]);

	// ══════════════════════════════════════════════════════════════
	//  Render
	// ══════════════════════════════════════════════════════════════
	return (
		<>
			{/* Mobile overlay */}
			{isOpen && (
				<div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
			)}

			<aside
				data-tour="sidenav"
				className={`dashboard-sidenav dashboard-fixed-sidebar fixed left-0 top-0 z-50 flex h-screen transform flex-col border-r border-[#eeeeee] bg-[#fefefe] transition-all duration-300 ease-in-out lg:translate-x-0 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} ${isCollapsed ? "dashboard-fixed-sidebar--collapsed w-16" : "w-[250px]"}`}
			>
				{/* ── Logo Header ── */}
				<div className="flex h-16 items-center justify-between border-b border-[#eeeeee] px-4">
					<Link href="/dashboard" className={`flex items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}>
						{schoolData?.logo_url ? (
							<img src={schoolData.logo_url} alt={schoolData.school_name || "Litera Valley"} width={34} height={34} loading="lazy" decoding="async" className="h-8.5 w-8.5 shrink-0 rounded-full object-cover ring-1 ring-slate-200" />
						) : (
							<div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200/80 shadow-xs overflow-hidden">
								<Image src="/logo1.png" alt="Litera Valley" width={32} height={32} className="rounded-full object-cover" />
							</div>
						)}
						{!isCollapsed && (
							<span className="text-[15px] font-bold text-slate-900 tracking-tight truncate">
								{schoolData?.school_name || "Litera Valley"}
							</span>
						)}
					</Link>
					<div className="flex items-center gap-1">
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="hidden lg:flex rounded-md p-1 transition-colors hover:opacity-70"
							style={{ color: "var(--dashboard-muted)" }}
							title={isCollapsed ? "Expand" : "Collapse"}
						>
							<ChevronsLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
						</button>
						<button onClick={() => setIsOpen(false)} className="lg:hidden rounded-md p-1" style={{ color: "var(--dashboard-muted)" }}>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* ── Portal label ── */}
				{!isCollapsed && <div className="sr-only">{portal.title} · {portal.subtitle}</div>}

				{/* ── Navigation ── */}
				<nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden px-3.5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{sections.map((section, si) => (
						<div key={si} className="space-y-1">
							{/* Section label */}
							{section.label && !isCollapsed && (
								<p className="mt-5 mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
									{section.label}
								</p>
							)}
							{section.label && isCollapsed && <div className="my-2 mx-2 border-t" style={{ borderColor: "var(--dashboard-border)" }} />}

							{/* Items */}
							{section.items.map((item) => {
								const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
								const Icon = item.icon;

								return (
									<Link
										key={item.key}
										href={item.href}
										data-tour={`nav-${item.key}`}
										onClick={() => setIsOpen(false)}
										className={`group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${
										isActive
											? "dashboard-nav-item--active font-semibold shadow-xs"
											: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
										} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
										title={isCollapsed ? item.name : ""}
									>
										<div className={`shrink-0 transition-colors ${isCollapsed ? "lg:mx-auto" : ""} ${isActive ? "text-[var(--dashboard-primary)]" : "text-slate-500 group-hover:text-slate-700"}`}>
											{item.isCustomIcon ? <Icon /> : <Icon className="h-5 w-5" />}
										</div>
										{!isCollapsed && <span className="min-w-0 flex-1 truncate text-[13.5px]">{item.name}</span>}
										{!isCollapsed && item.badge && (
											<span
												className="ml-auto grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold"
												style={{
													backgroundColor: "color-mix(in srgb, var(--dashboard-primary) 15%, transparent)",
													color: "var(--dashboard-primary)",
												}}
											>
												{item.badge}
											</span>
										)}

										{/* Collapsed tooltip */}
										{isCollapsed && (
											<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
												{item.name}
											</div>
										)}
									</Link>
								);
							})}
						</div>
					))}
				</nav>

				{/* ── Footer ── */}
				{!isCollapsed && (
					<div className="mt-auto px-4 py-4 text-center">
						<span className="text-xs text-slate-400 font-normal">
							Powered by Igyan.ai
						</span>
					</div>
				)}
			</aside>
		</>
	);
}
