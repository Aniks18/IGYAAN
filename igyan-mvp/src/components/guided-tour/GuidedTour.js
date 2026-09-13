"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Sparkles, Play } from "lucide-react";
import { getTourSteps, getPageTourSteps } from "./tour-configs";

const TOUR_STORAGE_PREFIX = "igyan-tour-v2-";
const PAGE_TOUR_STORAGE_PREFIX = "igyan-page-tour-v2-";

/* ─────────────────────────────────────────────────
 *  GuidedTour — full-screen spotlight overlay
 *  Supports dashboard tour + page-specific tours
 * ───────────────────────────────────────────────── */
export default function GuidedTour({ userRole, userId }) {
	const [mounted, setMounted] = useState(false);
	const pathname = usePathname();
	const dashboardSteps = getTourSteps(userRole);
	const pageSteps = getPageTourSteps(pathname);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Determine which tour to show
	const [tourMode, setTourMode] = useState(null); // "dashboard" | "page" | null
	const [currentStep, setCurrentStep] = useState(0);
	const [isActive, setIsActive] = useState(false);
	const [targetRect, setTargetRect] = useState(null);
	const [tooltipStyle, setTooltipStyle] = useState({});
	const [arrowStyle, setArrowStyle] = useState({});
	const [isAnimating, setIsAnimating] = useState(false);
	const tooltipRef = useRef(null);
	const observerRef = useRef(null);

	const storageKeyDashboard = `${TOUR_STORAGE_PREFIX}${userId || "u"}`;
	const storageKeyPage = `${PAGE_TOUR_STORAGE_PREFIX}${userId || "u"}-${pathname}`;

	const steps = tourMode === "page" ? (pageSteps || []) : dashboardSteps;
	const step = steps[currentStep];

	// ── Auto-start logic ──────────────────────────────────────────
	useEffect(() => {
		if (!userId) return;

		// On /dashboard, show dashboard tour if never completed
		if (pathname === "/dashboard") {
			try {
				if (!localStorage.getItem(storageKeyDashboard)) {
					const timer = setTimeout(() => {
						setTourMode("dashboard");
						setCurrentStep(0);
						setIsActive(true);
					}, 1200);
					return () => clearTimeout(timer);
				}
			} catch {}
		}

		// On feature pages, show page tour if available and never completed
		if (pageSteps && pageSteps.length > 0) {
			try {
				if (!localStorage.getItem(storageKeyPage)) {
					const timer = setTimeout(() => {
						setTourMode("page");
						setCurrentStep(0);
						setIsActive(true);
					}, 800);
					return () => clearTimeout(timer);
				}
			} catch {}
		}
	}, [userId, pathname, storageKeyDashboard, storageKeyPage, pageSteps]);

	// ── Position tooltip relative to target ──────────────────────
	const positionTooltip = useCallback(() => {
		if (!step?.target || !isActive) return;

		const el = document.querySelector(step.target);
		if (!el) {
			setTargetRect(null);
			setTooltipStyle({
				position: "fixed",
				top: "50%",
				left: "50%",
				transform: "translate(-50%, -50%)",
			});
			setArrowStyle({ display: "none" });
			return;
		}

		const rect = el.getBoundingClientRect();
		setTargetRect(rect);
		el.scrollIntoView({ behavior: "smooth", block: "nearest" });

		const padding = 16;
		const tooltipWidth = 380;
		const tooltipHeight = 260;
		const pos = step.position || "bottom";

		let top, left, arrow;

		switch (pos) {
			case "top":
				top = rect.top - tooltipHeight - padding;
				left = rect.left + rect.width / 2 - tooltipWidth / 2;
				arrow = { bottom: -8, left: "50%", transform: "translateX(-50%) rotate(45deg)" };
				break;
			case "bottom":
				top = rect.bottom + padding;
				left = rect.left + rect.width / 2 - tooltipWidth / 2;
				arrow = { top: -8, left: "50%", transform: "translateX(-50%) rotate(45deg)" };
				break;
			case "left":
				top = rect.top + rect.height / 2 - tooltipHeight / 2;
				left = rect.left - tooltipWidth - padding;
				arrow = { right: -8, top: "50%", transform: "translateY(-50%) rotate(45deg)" };
				break;
			case "right":
				top = rect.top + rect.height / 2 - tooltipHeight / 2;
				left = rect.right + padding;
				arrow = { left: -8, top: "50%", transform: "translateY(-50%) rotate(45deg)" };
				break;
			default:
				top = rect.bottom + padding;
				left = rect.left + rect.width / 2 - tooltipWidth / 2;
				arrow = { top: -8, left: "50%", transform: "translateX(-50%) rotate(45deg)" };
		}

		// Clamp within viewport
		const vw = window.innerWidth;
		const vh = window.innerHeight;
		if (left < 12) left = 12;
		if (left + tooltipWidth > vw - 12) left = vw - tooltipWidth - 12;
		if (top < 12) top = 12;
		if (top + tooltipHeight > vh - 12) top = vh - tooltipHeight - 12;

		setTooltipStyle({ position: "fixed", top, left, width: tooltipWidth });
		setArrowStyle(arrow);
	}, [step, isActive]);

	// ── Reposition on step change / resize ───────────────────────
	useEffect(() => {
		if (!isActive) return;

		setIsAnimating(true);
		const animTimer = setTimeout(() => setIsAnimating(false), 300);
		const posTimer = setTimeout(positionTooltip, 150);

		const handleResize = () => positionTooltip();
		window.addEventListener("resize", handleResize);
		window.addEventListener("scroll", handleResize, true);

		return () => {
			clearTimeout(animTimer);
			clearTimeout(posTimer);
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("scroll", handleResize, true);
		};
	}, [isActive, currentStep, positionTooltip]);

	// ── Navigation handlers ──────────────────────────────────────
	const nextStep = () => {
		if (currentStep < steps.length - 1) {
			setCurrentStep((prev) => prev + 1);
		} else {
			completeTour();
		}
	};

	const prevStep = () => {
		if (currentStep > 0) setCurrentStep((prev) => prev - 1);
	};

	const completeTour = () => {
		setIsActive(false);
		setCurrentStep(0);
		try {
			const key = tourMode === "page" ? storageKeyPage : storageKeyDashboard;
			localStorage.setItem(key, Date.now().toString());
		} catch {}
		setTourMode(null);
	};

	const skipTour = () => completeTour();

	const startDashboardTour = () => {
		setTourMode("dashboard");
		setCurrentStep(0);
		setIsActive(true);
	};

	const startPageTour = () => {
		if (!pageSteps || pageSteps.length === 0) return;
		setTourMode("page");
		setCurrentStep(0);
		setIsActive(true);
	};

	if (!mounted) return null;

	// ── Floating restart button ──────────────────────────────────
	if (!isActive) {
		// Determine which tours are available to restart
		const canShowDashboard = pathname === "/dashboard";
		const canShowPage = pageSteps && pageSteps.length > 0;

		if (!canShowDashboard && !canShowPage) return null;

		return (
			<div className="fixed bottom-6 right-6 z-[90] flex flex-col gap-2">
				{canShowPage && (
					<button
						onClick={startPageTour}
						className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
						title="Tour this page"
					>
						<Play className="h-4 w-4" />
						<span className="hidden sm:inline">Page Tour</span>
					</button>
				)}
				{canShowDashboard && (
					<button
						onClick={startDashboardTour}
						className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
						title="Restart guided tour"
					>
						<Play className="h-4 w-4" />
						<span className="hidden sm:inline">Guided Tour</span>
					</button>
				)}
			</div>
		);
	}

	const progress = ((currentStep + 1) / steps.length) * 100;

	// Check if target is inside a fixed/high z-index container (like sidenav)
	const targetEl = step?.target ? document.querySelector(step.target) : null;
	const isInsideFixed = targetEl?.closest("[data-tour='sidenav']") || targetEl?.closest(".dashboard-sidenav");

	return (
		<>
			{/* Overlay */}
			<div className="fixed inset-0" style={{ zIndex: isInsideFixed ? 9998 : 60 }} onClick={skipTour}>
				<svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
					<defs>
						<mask id="tour-spotlight-mask">
							<rect x="0" y="0" width="100%" height="100%" fill="white" />
							{targetRect && (
								<rect
									x={targetRect.left - 8}
									y={targetRect.top - 8}
									width={targetRect.width + 16}
									height={targetRect.height + 16}
									rx="12"
									ry="12"
									fill="black"
									className="transition-all duration-500 ease-out"
								/>
							)}
						</mask>
					</defs>
					<rect
						x="0" y="0"
						width="100%" height="100%"
						fill="rgba(0,0,0,0.55)"
						mask="url(#tour-spotlight-mask)"
						style={{ pointerEvents: "auto" }}
					/>
				</svg>

				{/* Glow ring around target */}
				{targetRect && (
					<div
						className="absolute rounded-xl border-2 border-indigo-400/60 shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-500 ease-out pointer-events-none"
						style={{
							top: targetRect.top - 8,
							left: targetRect.left - 8,
							width: targetRect.width + 16,
							height: targetRect.height + 16,
						}}
					>
						<div className="absolute -inset-1 animate-ping rounded-xl border border-indigo-400/30" style={{ animationDuration: "2s" }} />
					</div>
				)}
			</div>

			{/* Tooltip card */}
			<div
				ref={tooltipRef}
				className={`fixed transition-all duration-300 ease-out ${isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"}`}
				style={{ ...tooltipStyle, zIndex: isInsideFixed ? 9999 : 70 }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Arrow */}
				<div
					className="absolute h-4 w-4 rounded-sm bg-white dark:bg-zinc-900"
					style={arrowStyle}
				/>

				<div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl shadow-black/20 dark:border-zinc-700/80 dark:bg-zinc-900">
					{/* Top gradient bar */}
					<div className="h-1 w-full" style={{ background: "linear-gradient(to right, #6366f1, #a855f7, #ec4899)" }} />

					{/* Progress bar */}
					<div className="h-0.5 w-full bg-zinc-100 dark:bg-zinc-800">
						<div
							className="h-full transition-all duration-500 ease-out"
							style={{ width: `${progress}%`, background: "linear-gradient(to right, #6366f1, #a855f7)" }}
						/>
					</div>

					{/* Header */}
					<div className="flex items-start justify-between px-5 pt-4">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))" }}>
								{step?.icon || "✨"}
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
									{tourMode === "page" ? "Page Guide" : "Tour"} · Step {currentStep + 1} of {steps.length}
								</p>
							</div>
						</div>
						<button
							onClick={skipTour}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
							title="Skip tour"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					{/* Content */}
					<div className="px-5 pb-2 pt-3">
						<h3 className="text-base font-bold text-zinc-900 dark:text-white">
							{step?.title}
						</h3>
						<p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
							{step?.description}
						</p>
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 dark:border-zinc-800">
						<button
							onClick={skipTour}
							className="text-xs font-medium text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
						>
							Skip tour
						</button>

						<div className="flex items-center gap-2">
							{currentStep > 0 && (
								<button
									onClick={prevStep}
									className="flex items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
								>
									<ChevronLeft className="h-3.5 w-3.5" />
									Back
								</button>
							)}
							<button
								onClick={nextStep}
								className="flex items-center gap-1 rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-md transition hover:shadow-lg active:scale-95"
								style={{ background: "linear-gradient(to right, #6366f1, #9333ea)" }}
							>
								{currentStep === steps.length - 1 ? (
									<>
										<Sparkles className="h-3.5 w-3.5" />
										Finish
									</>
								) : (
									<>
										Next
										<ChevronRight className="h-3.5 w-3.5" />
									</>
								)}
							</button>
						</div>
					</div>

					{/* Step dots */}
					<div className="flex justify-center gap-1.5 pb-3">
						{steps.map((_, i) => (
							<div
								key={i}
								className={`h-1.5 rounded-full transition-all duration-300 ${
									i === currentStep
										? "w-6 bg-indigo-500"
										: i < currentStep
										? "w-1.5 bg-indigo-300 dark:bg-indigo-600"
										: "w-1.5 bg-zinc-200 dark:bg-zinc-700"
								}`}
							/>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
