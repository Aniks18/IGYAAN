"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import {
	User,
	Building2,
	Shield,
	Sliders,
	HelpCircle,
	ChevronRight,
	Sparkles,
	Check,
} from "lucide-react";

const THEME_STORAGE_KEY = "dashboard-theme";

const themeOptions = [
	{
		id: "sunset",
		label: "Sunset Ember",
		description: "Warm orange theme that brings energy and enthusiasm",
		preview: ["#9a3412", "#ea580c", "#fed7aa"],
	},
	{
		id: "indigo",
		label: "Aurora Indigo",
		description: "Professional indigo theme, perfect for academics and daily use",
		preview: ["#312e81", "#4f46e5", "#a5b4fc"],
	},
	{
		id: "emerald",
		label: "Verdant Emerald",
		description: "Fresh green theme for a calming and focused environment",
		preview: ["#065f46", "#10b981", "#bbf7d0"],
	},
	{
		id: "ocean",
		label: "Celestial Ocean",
		description: "Balanced teal theme inspired by peaceful coastal waters",
		preview: ["#0369a1", "#0284c7", "#bae6fd"],
	},
	{
		id: "amethyst",
		label: "Royal Amethyst",
		description: "Refined purple orchid delivering a high-end executive feel",
		preview: ["#6b21a8", "#9333ea", "#f3e8ff"],
	},
	{
		id: "midnight",
		label: "Midnight Neon",
		description: "Dark theme with high contrast, ideal for extended sessions",
		preview: ["#090d16", "#38bdf8", "#cbd5f5"],
	},
];

const quickThemeIds = ["sunset", "indigo", "emerald", "ocean", "amethyst", "midnight"];

export default function SettingsPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [schoolData, setSchoolData] = useState(null);
	const [loadingSchool, setLoadingSchool] = useState(true);
	const [selectedTheme, setSelectedTheme] = useState("sunset");
	const [origin, setOrigin] = useState("");

	const themeLookup = useMemo(
		() => Object.fromEntries(themeOptions.map((option) => [option.id, option])),
		[]
	);

	useEffect(() => {
		if (typeof window !== "undefined") {
			setOrigin(window.location.origin);
		}
	}, []);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
		if (storedTheme && themeLookup[storedTheme]) {
			setSelectedTheme(storedTheme);
		}
	}, [themeLookup]);

	useEffect(() => {
		const fetchSchoolData = async () => {
			if (!user?.id) return;

			try {
				if (!user.school_id) {
					// Fallback: Check if user created a school
					const { data: createdSchool } = await supabase
						.from("schools")
						.select("id, school_name, logo_url")
						.eq("created_by", user.id)
						.maybeSingle();

					if (createdSchool) {
						setSchoolData(createdSchool);
					}
					setLoadingSchool(false);
					return;
				}

				const { data, error } = await supabase
					.from("schools")
					.select("id, school_name, logo_url")
					.eq("id", user.school_id)
					.maybeSingle();

				if (error) {
					console.error("Error fetching school:", error);
				}

				setSchoolData(data);
			} catch (err) {
				console.error("Error in fetchSchoolData:", err);
			} finally {
				setLoadingSchool(false);
			}
		};

		if (user) {
			fetchSchoolData();
		}
	}, [user]);

	const handleThemeSelect = (themeId) => {
		if (!themeLookup[themeId]) return;
		setSelectedTheme(themeId);
		if (typeof window === "undefined") return;
		window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
		document.body.dataset.dashboardTheme = themeId;
		window.dispatchEvent(new CustomEvent("dashboard-theme-change", { detail: themeId }));
	};

	const activeTheme = themeLookup[selectedTheme] || themeLookup.sunset;
	const palette = activeTheme?.preview || [];
	const toneDeep = palette[0] || "#9a3412";
	const toneMain = palette[1] || palette[0] || "#ea580c";
	const toneSoft = palette[2] || palette[1] || "#fed7aa";

	if (loading || loadingSchool) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
				<div className="text-center">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-orange-500 border-t-transparent" />
					<p className="mt-4 text-xs font-semibold text-slate-500">
						Loading Settings...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className="min-h-full bg-[#f8fafc] p-4 text-[#1e293b] sm:p-6 lg:p-7">
			<div className="mx-auto max-w-[1520px] space-y-6">
				{/* ── Page Header ── */}
				<div data-tour="settings-header">
					<div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
						<span className="hover:text-slate-800 transition-colors">
							System & Users
						</span>
						<span>•</span>
						<span className="text-[#ea580c]" style={{ color: toneMain }}>
							Settings
						</span>
					</div>
					<h1 className="text-2xl font-extrabold tracking-tight text-[#0f172a] sm:text-3xl">
						Settings
					</h1>
					<p className="mt-1 text-xs font-medium text-slate-500">
						Manage your account and organization settings
					</p>
				</div>

				{/* ── Appearance Studio ── */}
				<div
					data-tour="settings-appearance"
					className="dashboard-card rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm"
				>
					<div className="grid gap-8 lg:grid-cols-[380px,1fr]">
						{/* Left: Appearance Studio details & live preview */}
						<div className="flex flex-col gap-6">
							<div>
								<span
									className="dashboard-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
									style={{
										backgroundColor: "color-mix(in srgb, var(--dashboard-primary) 12%, transparent)",
										color: toneMain,
										borderColor: "color-mix(in srgb, var(--dashboard-primary) 20%, transparent)",
									}}
								>
									<Sparkles className="h-3.5 w-3.5" />
									Appearance Studio
								</span>
								<h2 className="mt-3 text-2xl font-extrabold text-[#0f172a]">
									Curate the perfect look for your dashboard
								</h2>
								<p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
									Themes update navigation, cards, chips, and buttons instantly for everyone in your workspace.
								</p>
							</div>

							{/* Live preview container */}
							<div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-slate-50/70 shadow-inner backdrop-blur">
								<div
									className="rounded-3xl p-5"
									style={{
										background: `linear-gradient(135deg, ${toneSoft}33, rgba(255,255,255,0.92))`,
									}}
								>
									<div
										className="rounded-2xl border border-white/80 p-4 shadow-sm backdrop-blur bg-white/80"
									>
										<div className="flex items-center justify-between gap-4">
											<div className="flex items-center gap-3">
												<span
													className="h-9 w-9 rounded-2xl shadow-sm"
													style={{
														background: `linear-gradient(135deg, ${toneDeep}, ${toneMain})`,
													}}
												/>
												<div>
													<p className="text-sm font-bold text-slate-900">Top Navbar</p>
													<p className="text-xs text-slate-500">Frosted with quick actions</p>
												</div>
											</div>
											<button
												type="button"
												className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition-transform hover:-translate-y-0.5"
												style={{
													background: toneMain,
													color: "#ffffff",
													boxShadow: `0 12px 30px -18px ${toneMain}aa`,
												}}
											>
												Primary CTA
											</button>
										</div>

										<div className="mt-5 grid gap-3 sm:grid-cols-2">
											<div
												className="rounded-xl border border-white/90 p-3 shadow-2xs bg-white/90"
											>
												<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
													Overview
												</p>
												<div
													className="mt-3 h-2 rounded-full"
													style={{ background: toneDeep, opacity: 0.9 }}
												/>
												<div
													className="mt-2 h-2 rounded-full"
													style={{ background: toneMain, opacity: 0.7 }}
												/>
											</div>
											<div
												className="rounded-xl border border-white/90 p-3 shadow-2xs bg-white/90"
											>
												<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
													Progress
												</p>
												<div
													className="mt-3 h-2 rounded-full"
													style={{ background: toneMain, opacity: 0.85 }}
												/>
												<div
													className="mt-2 h-2 rounded-full"
													style={{ background: toneSoft, opacity: 0.8 }}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Quick Presets */}
							<div>
								<p className="text-xs font-bold uppercase tracking-wider text-slate-400">
									Quick presets
								</p>
								<div className="mt-2.5 flex flex-wrap gap-2">
									{quickThemeIds.map((id) => {
										const preset = themeLookup[id];
										if (!preset) return null;
										const swatches = preset.preview || [];
										const deep = swatches[0] || toneDeep;
										const main = swatches[1] || deep;
										const soft = swatches[2] || main;
										const isActive = id === selectedTheme;
										return (
											<button
												type="button"
												key={id}
												onClick={() => handleThemeSelect(id)}
												className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:-translate-y-0.5 focus-visible:outline-none ${
													isActive ? "scale-105 ring-2 ring-offset-2 ring-slate-900" : "opacity-90 hover:opacity-100"
												}`}
												style={{
													background: `linear-gradient(135deg, ${deep}, ${main})`,
													boxShadow: isActive
														? `0 18px 38px -22px ${main}aa`
														: "0 10px 28px -24px rgba(15,23,42,0.35)",
													border: `1px solid ${isActive ? soft : "rgba(255,255,255,0.25)"}`,
												}}
											>
												<span
													className="h-2.5 w-2.5 rounded-full border border-white/60"
													style={{ background: soft }}
												/>
												<span>{preset.label.split(" ")[0]}</span>
												{isActive && <Check className="h-3 w-3 stroke-[3]" />}
											</button>
										);
									})}
								</div>
							</div>
						</div>

						{/* Right: Theme Options Grid */}
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{themeOptions.map((option) => {
								const isActive = option.id === selectedTheme;
								const accent = option.preview[1] ?? option.preview[0];
								return (
									<button
										type="button"
										key={option.id}
										onClick={() => handleThemeSelect(option.id)}
										className={`group flex h-full flex-col justify-between rounded-2xl border p-5 text-left shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-none bg-white ${
											isActive ? "shadow-md ring-1 ring-slate-900/5" : "hover:border-slate-300"
										}`}
										style={
											isActive
												? {
														borderColor: accent,
														boxShadow: `0 16px 36px -16px ${accent}55`,
												  }
												: { borderColor: "rgba(226, 232, 240, 0.9)" }
										}
									>
										<div>
											<div className="flex items-center justify-between gap-3">
												<span className="text-base font-extrabold text-[#0f172a]">
													{option.label}
												</span>
												{isActive && (
													<span
														className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs"
														style={{ background: accent }}
													>
														<Check className="h-3 w-3 stroke-[3]" />
														Active
													</span>
												)}
											</div>
											<p className="mt-2 text-xs text-slate-500 leading-relaxed">
												{option.description}
											</p>
										</div>
										<div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-100">
											{option.preview.map((tone) => (
												<span
													key={`${option.id}-${tone}`}
													className="h-8 w-8 rounded-xl border border-white/80 shadow-2xs transition-transform group-hover:scale-105"
													style={{ background: tone }}
												/>
											))}
										</div>
									</button>
								);
							})}
						</div>
					</div>
				</div>

				{/* ── Settings Navigation Cards Grid (2 Columns) ── */}
				<div data-tour="settings-cards" className="grid gap-6 lg:grid-cols-2">
					{/* User Profile Card */}
					<Link
						href="/dashboard/profile"
						className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
					>
						<div className="flex items-start gap-4">
							<div
								className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-2xs transition-transform group-hover:scale-105"
								style={{
									background: "color-mix(in srgb, var(--dashboard-primary) 14%, transparent)",
									color: toneMain,
								}}
							>
								<User className="h-7 w-7" strokeWidth={2.2} />
							</div>
							<div className="flex-1 min-w-0">
								<h2 className="text-lg font-extrabold text-[#0f172a] group-hover:text-slate-950">
									User Profile
								</h2>
								<p className="mt-1 text-xs text-slate-500 leading-relaxed">
									Update your personal information, contact details, and profile picture
								</p>
								<div className="mt-4 flex items-center gap-3">
									<div
										className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white shadow-2xs"
										style={{ background: `linear-gradient(135deg, ${toneDeep}, ${toneMain})` }}
									>
										{user.full_name
											?.split(" ")
											.map((n) => n[0])
											.join("")
											.toUpperCase() || "U"}
									</div>
									<div className="min-w-0">
										<p className="truncate text-xs font-bold text-[#0f172a]">
											{user.full_name}
										</p>
										<p className="truncate text-[11px] text-slate-500">
											{user.email}
										</p>
									</div>
								</div>
							</div>
							<ChevronRight
								className="h-5 w-5 text-slate-400 shrink-0 transition-transform group-hover:translate-x-1"
								style={{ color: toneMain }}
							/>
						</div>
					</Link>

					{/* School Profile Card - Institutional Users */}
					{user?.role !== "b2c_student" && user?.role !== "b2c_mentor" && (
						<Link
							href="/dashboard/school-profile"
							className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
						>
							<div className="flex items-start gap-4">
								<div
									className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-2xs transition-transform group-hover:scale-105"
									style={{
										background: "color-mix(in srgb, var(--dashboard-primary) 14%, transparent)",
										color: toneMain,
									}}
								>
									<Building2 className="h-7 w-7" strokeWidth={2.2} />
								</div>
								<div className="flex-1 min-w-0">
									<h2 className="text-lg font-extrabold text-[#0f172a] group-hover:text-slate-950">
										School Profile
									</h2>
									<p className="mt-1 text-xs text-slate-500 leading-relaxed">
										Manage school information, contact details, documents, and branding
									</p>
									{schoolData ? (
										<div className="mt-4 flex items-center gap-3">
											<div
												className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white shadow-2xs"
												style={{ background: `linear-gradient(135deg, ${toneDeep}, ${toneMain})` }}
											>
												{schoolData.school_name
													?.split(" ")
													.map((n) => n[0])
													.join("")
													.slice(0, 2)
													.toUpperCase() || "SC"}
											</div>
											<div className="min-w-0">
												<p className="truncate text-xs font-bold text-[#0f172a]">
													{schoolData.school_name}
												</p>
												<p className="text-[11px] font-semibold text-emerald-600">
													School registered
												</p>
											</div>
										</div>
									) : (
										<p className="mt-4 text-xs font-semibold text-slate-400">
											No school registered yet
										</p>
									)}
								</div>
								<ChevronRight
									className="h-5 w-5 text-slate-400 shrink-0 transition-transform group-hover:translate-x-1"
									style={{ color: toneMain }}
								/>
							</div>
						</Link>
					)}

					{/* B2C Profile Card - B2C Users */}
					{(user?.role === "b2c_student" || user?.role === "b2c_mentor") && (
						<Link
							href="/dashboard/about"
							className="group rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-slate-300"
						>
							<div className="flex items-start gap-4">
								<div
									className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-2xs transition-transform group-hover:scale-105"
									style={{
										background: "color-mix(in srgb, var(--dashboard-primary) 14%, transparent)",
										color: toneMain,
									}}
								>
									<User className="h-7 w-7" strokeWidth={2.2} />
								</div>
								<div className="flex-1 min-w-0">
									<h2 className="text-lg font-extrabold text-[#0f172a] group-hover:text-slate-950">
										Professional Profile
									</h2>
									<p className="mt-1 text-xs text-slate-500 leading-relaxed">
										Manage your professional profile, interests, experience, and achievements
									</p>
									<div className="mt-4">
										<p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
											Public Profile Link
										</p>
										<p className="mt-0.5 text-xs font-mono font-semibold truncate" style={{ color: toneMain }}>
											{origin ? `${origin}/about/${user.id}` : `/about/${user.id}`}
										</p>
									</div>
								</div>
								<ChevronRight
									className="h-5 w-5 text-slate-400 shrink-0 transition-transform group-hover:translate-x-1"
									style={{ color: toneMain }}
								/>
							</div>
						</Link>
					)}

					{/* Security Card */}
					<div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
						<div className="flex items-start gap-4">
							<div
								className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-2xs"
								style={{
									background: "color-mix(in srgb, var(--dashboard-primary) 14%, transparent)",
									color: toneMain,
								}}
							>
								<Shield className="h-7 w-7" strokeWidth={2.2} />
							</div>
							<div className="flex-1">
								<h2 className="text-lg font-extrabold text-[#0f172a]">
									Security
								</h2>
								<p className="mt-1 text-xs text-slate-500 leading-relaxed">
									Change password, enable two-factor authentication, and manage sessions
								</p>
								<span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
									Coming soon...
								</span>
							</div>
						</div>
					</div>

					{/* Preferences Card */}
					<div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
						<div className="flex items-start gap-4">
							<div
								className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-2xs"
								style={{
									background: "color-mix(in srgb, var(--dashboard-primary) 14%, transparent)",
									color: toneMain,
								}}
							>
								<Sliders className="h-7 w-7" strokeWidth={2.2} />
							</div>
							<div className="flex-1">
								<h2 className="text-lg font-extrabold text-[#0f172a]">
									Preferences
								</h2>
								<p className="mt-1 text-xs text-slate-500 leading-relaxed">
									Customize your experience with theme, language, and notification settings
								</p>
								<span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
									Coming soon...
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* ── Need Help? Support Footer Card ── */}
				<div
					data-tour="settings-help"
					className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-2xs"
				>
					<div className="flex items-start gap-3">
						<HelpCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
						<div>
							<p className="text-xs font-extrabold text-[#0f172a]">
								Need Help?
							</p>
							<p className="mt-0.5 text-xs text-slate-500">
								Contact support at{" "}
								<a
									href="mailto:support@igyanai.com"
									className="font-bold hover:underline"
									style={{ color: toneMain }}
								>
									support@igyanai.com
								</a>{" "}
								if you need assistance with your account settings.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
