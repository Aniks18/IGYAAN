"use client";

import { useState, useEffect, useRef } from "react";
import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	X,
	Check
} from "lucide-react";

const MONTH_NAMES = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
];

const SHORT_MONTHS = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Reusable Custom DatePicker Component
 * Opens an interactive calendar popup on click anywhere in the input box.
 * 
 * Props:
 * - value: string (Format: "YYYY-MM-DD" e.g., "2026-01-12")
 * - onChange: function(formattedDateString: "YYYY-MM-DD")
 * - placeholder: string (Default: "dd/mm/yyyy")
 * - required: boolean
 * - disabled: boolean
 * - min: string ("YYYY-MM-DD")
 * - max: string ("YYYY-MM-DD")
 * - className: string (Tailwind classes for trigger input)
 * - accentColor: string (Default: "#D95A2B")
 * - align: "left" | "right" (Default: "left")
 */
export default function DatePicker({
	value = "",
	onChange,
	placeholder = "dd/mm/yyyy",
	required = false,
	disabled = false,
	min,
	max,
	className = "",
	accentColor = "#D95A2B",
	align = "left",
	id,
	name,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef(null);
	const popoverRef = useRef(null);

	// Parse initial selected date
	const selectedDate = value ? new Date(value + "T00:00:00") : null;

	// Track user-navigated month/year offset relative to selected or today
	const [monthOffset, setMonthOffset] = useState(0);
	const [customYear, setCustomYear] = useState(null);
	const [customMonth, setCustomMonth] = useState(null);
	const [showYearDropdown, setShowYearDropdown] = useState(false);

	// Compute active view Date
	const baseDate = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : new Date();
	const activeYear = customYear ?? baseDate.getFullYear();
	const activeMonth = (customMonth ?? baseDate.getMonth()) + monthOffset;
	const viewDate = new Date(activeYear, activeMonth, 1);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setIsOpen(false);
				setShowYearDropdown(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	// Format display string
	const formatDisplay = (val) => {
		if (!val) return "";
		const d = new Date(val + "T00:00:00");
		if (isNaN(d.getTime())) return val;
		const day = String(d.getDate()).padStart(2, "0");
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const year = d.getFullYear();
		return `${day}/${month}/${year}`;
	};

	const currentYear = viewDate.getFullYear();
	const currentMonth = viewDate.getMonth();

	// Calculate calendar grid
	const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
	const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

	const prevMonthDays = [];
	for (let i = firstDayOfMonth - 1; i >= 0; i--) {
		prevMonthDays.push(daysInPrevMonth - i);
	}

	const currentMonthDays = [];
	for (let i = 1; i <= daysInMonth; i++) {
		currentMonthDays.push(i);
	}

	const totalSlots = Math.ceil((prevMonthDays.length + currentMonthDays.length) / 7) * 7;
	const nextMonthDays = [];
	for (let i = 1; i <= totalSlots - (prevMonthDays.length + currentMonthDays.length); i++) {
		nextMonthDays.push(i);
	}

	// Handlers for month navigation
	const handlePrevMonth = (e) => {
		e.stopPropagation();
		setMonthOffset((prev) => prev - 1);
	};

	const handleNextMonth = (e) => {
		e.stopPropagation();
		setMonthOffset((prev) => prev + 1);
	};

	// Select a date
	const handleSelectDate = (day, offset = 0) => {
		const targetDate = new Date(currentYear, currentMonth + offset, day);
		const yyyy = targetDate.getFullYear();
		const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
		const dd = String(targetDate.getDate()).padStart(2, "0");
		const formatted = `${yyyy}-${mm}-${dd}`;

		if (onChange) {
			onChange(formatted);
		}
		setIsOpen(false);
	};

	// Quick Select Today
	const handleSelectToday = (e) => {
		e.stopPropagation();
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, "0");
		const dd = String(today.getDate()).padStart(2, "0");
		const formatted = `${yyyy}-${mm}-${dd}`;
		if (onChange) {
			onChange(formatted);
		}
		setCustomYear(today.getFullYear());
		setCustomMonth(today.getMonth());
		setMonthOffset(0);
		setIsOpen(false);
	};

	// Clear selection
	const handleClear = (e) => {
		e.stopPropagation();
		if (onChange) {
			onChange("");
		}
	};

	// Check if date is today
	const isToday = (day, monthOffset = 0) => {
		const checkDate = new Date(currentYear, currentMonth + monthOffset, day);
		const today = new Date();
		return (
			checkDate.getDate() === today.getDate() &&
			checkDate.getMonth() === today.getMonth() &&
			checkDate.getFullYear() === today.getFullYear()
		);
	};

	// Check if date is selected
	const isSelected = (day, monthOffset = 0) => {
		if (!selectedDate || isNaN(selectedDate.getTime())) return false;
		const checkDate = new Date(currentYear, currentMonth + monthOffset, day);
		return (
			checkDate.getDate() === selectedDate.getDate() &&
			checkDate.getMonth() === selectedDate.getMonth() &&
			checkDate.getFullYear() === selectedDate.getFullYear()
		);
	};

	// Years list for quick jumper (e.g. 1970 to 2035)
	const yearOptions = [];
	const startYear = 1980;
	const endYear = new Date().getFullYear() + 15;
	for (let y = endYear; y >= startYear; y--) {
		yearOptions.push(y);
	}

	return (
		<div className="relative w-full" ref={containerRef}>
			{/* Trigger Input Box */}
			<div
				role="button"
				tabIndex={disabled ? -1 : 0}
				onClick={() => {
					if (!disabled) setIsOpen((prev) => !prev);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						if (!disabled) setIsOpen((prev) => !prev);
					}
				}}
				className={`group relative flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-xs text-[#1F2937] transition-all focus:outline-none focus:ring-1 focus:ring-[#D95A2B] focus:border-[#D95A2B] ${
					disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:border-slate-400"
				} ${className}`}
			>
				{/* Displayed Text */}
				<span className={value ? "text-[#1F2937] font-medium" : "text-[#9CA3AF]"}>
					{value ? formatDisplay(value) : placeholder}
				</span>

				{/* Right Icons: Clear & Calendar Icon */}
				<div className="flex items-center gap-1.5 text-[#9CA3AF]">
					{value && !disabled && (
						<button
							type="button"
							onClick={handleClear}
							className="rounded-full p-0.5 hover:bg-slate-100 hover:text-slate-600 transition-colors"
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
					<CalendarIcon className="h-4 w-4 text-[#9CA3AF] transition-colors group-hover:text-[#D95A2B]" />
				</div>

				{/* Hidden input for form integration if needed */}
				<input
					type="hidden"
					id={id}
					name={name}
					value={value || ""}
					required={required}
				/>
			</div>

			{/* Interactive Calendar Popover */}
			{isOpen && (
				<div
					ref={popoverRef}
					className={`absolute z-[100] mt-1.5 w-72 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ${
						align === "right" ? "right-0" : "left-0"
					}`}
				>
					{/* Calendar Navigation Header */}
					<div className="mb-3 flex items-center justify-between">
						{/* Month & Year Title / Selector */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setShowYearDropdown((prev) => !prev)}
								className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
							>
								<span>{MONTH_NAMES[currentMonth]} {currentYear}</span>
								<ChevronRight className={`h-3 w-3 text-slate-400 transform transition-transform ${showYearDropdown ? "-rotate-90" : "rotate-90"}`} />
							</button>

							{/* Year & Month quick dropdown */}
							{showYearDropdown && (
								<div className="absolute left-0 top-full z-20 mt-1 max-h-48 w-36 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
									{yearOptions.map((yr) => (
										<button
											key={yr}
											type="button"
											onClick={() => {
												setCustomYear(yr);
												setCustomMonth(currentMonth);
												setMonthOffset(0);
												setShowYearDropdown(false);
											}}
											className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs ${
												yr === currentYear ? "bg-[#FFF8F5] font-bold text-[#D95A2B]" : "text-slate-700 hover:bg-slate-50"
											}`}
										>
											<span>{yr}</span>
											{yr === currentYear && <Check className="h-3 w-3 text-[#D95A2B]" />}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Month Steppers */}
						<div className="flex items-center gap-1">
							<button
								type="button"
								onClick={handlePrevMonth}
								className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
								title="Previous month"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<button
								type="button"
								onClick={handleNextMonth}
								className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
								title="Next month"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>

					{/* Weekday Labels (Su, Mo, Tu...) */}
					<div className="mb-2 grid grid-cols-7 text-center">
						{DAYS_OF_WEEK.map((d) => (
							<span key={d} className="text-[11px] font-semibold text-slate-400">
								{d}
							</span>
						))}
					</div>

					{/* Days Matrix */}
					<div className="grid grid-cols-7 gap-1 text-center">
						{/* Previous month leading days */}
						{prevMonthDays.map((day) => (
							<button
								key={`prev-${day}`}
								type="button"
								onClick={() => handleSelectDate(day, -1)}
								className="grid h-8 w-8 place-items-center rounded-xl text-xs text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-colors"
							>
								{day}
							</button>
						))}

						{/* Current month days */}
						{currentMonthDays.map((day) => {
							const selected = isSelected(day);
							const today = isToday(day);

							return (
								<button
									key={`curr-${day}`}
									type="button"
									onClick={() => handleSelectDate(day, 0)}
									className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-medium transition-all ${
										selected
											? "bg-[#D95A2B] text-white font-bold shadow-xs scale-105"
											: today
											? "border border-[#D95A2B] text-[#D95A2B] font-bold hover:bg-orange-50"
											: "text-slate-700 hover:bg-slate-100"
									}`}
								>
									{day}
								</button>
							);
						})}

						{/* Next month trailing days */}
						{nextMonthDays.map((day) => (
							<button
								key={`next-${day}`}
								type="button"
								onClick={() => handleSelectDate(day, 1)}
								className="grid h-8 w-8 place-items-center rounded-xl text-xs text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-colors"
							>
								{day}
							</button>
						))}
					</div>

					{/* Bottom Actions: Today & Clear */}
					<div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
						<button
							type="button"
							onClick={handleSelectToday}
							className="font-semibold text-[#D95A2B] hover:underline"
						>
							Today
						</button>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="text-slate-500 hover:text-slate-800 font-medium"
						>
							Done
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
