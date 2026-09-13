"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../utils/auth_context";
import RegisterLayout from "../register-layout";

export default function InstitutionalSuiteRegister() {
	const { register } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [imageBase64, setImageBase64] = useState("");
	const [uploadingImage, setUploadingImage] = useState(false);

	// OTP state
	const [phone, setPhone] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [otpVerified, setOtpVerified] = useState(false);
	const [otpCode, setOtpCode] = useState("");
	const [otpLoading, setOtpLoading] = useState(false);
	const [otpError, setOtpError] = useState("");
	const [otpSuccess, setOtpSuccess] = useState("");
	const [resendTimer, setResendTimer] = useState(0);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// Countdown timer for resend
	useEffect(() => {
		if (resendTimer <= 0) return;
		const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
		return () => clearInterval(interval);
	}, [resendTimer]);

	// ─── Image upload ───
	const handleImageUpload = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			setError("Image size should be less than 5MB");
			return;
		}
		const validTypes = ["image/jpeg", "image/jpg", "image/png"];
		if (!validTypes.includes(file.type)) {
			setError("Please upload a valid image (JPEG, PNG)");
			return;
		}
		setUploadingImage(true);
		setError("");
		const reader = new FileReader();
		reader.onloadend = () => {
			setImageBase64(reader.result);
			setUploadingImage(false);
		};
		reader.onerror = () => {
			setError("Failed to read image. Please try again.");
			setUploadingImage(false);
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => setImageBase64("");

	// ─── Clean phone → 10 digits ───
	const cleanPhone = (p) => {
		const digits = p.replace(/\D/g, "");
		if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
		if (digits.length === 10) return digits;
		return digits;
	};

	// ─── Send OTP ───
	const sendOTP = async () => {
		setOtpError("");
		setOtpSuccess("");

		const cleaned = cleanPhone(phone);
		if (cleaned.length !== 10) {
			setOtpError("Please enter a valid 10-digit mobile number");
			return;
		}

		setOtpLoading(true);
		try {
			const res = await fetch("/api/otp/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ phone: cleaned, reason: "registration" }),
			});
			const data = await res.json();

			if (!res.ok) {
				setOtpError(data.error || "Failed to send OTP");
				return;
			}

			setOtpSent(true);
			setOtpSuccess("OTP sent to your WhatsApp! Check your messages.");
			setResendTimer(60);
		} catch (err) {
			setOtpError("Network error. Please try again.");
		} finally {
			setOtpLoading(false);
		}
	};

	// ─── Verify OTP ───
	const verifyOTP = async () => {
		setOtpError("");
		setOtpSuccess("");

		if (!otpCode || otpCode.trim().length !== 6) {
			setOtpError("Please enter the 6-digit OTP");
			return;
		}

		setOtpLoading(true);
		try {
			const res = await fetch("/api/otp/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phone: cleanPhone(phone),
					otp: otpCode.trim(),
					reason: "registration",
				}),
			});
			const data = await res.json();

			if (!res.ok) {
				setOtpError(data.error || "Verification failed");
				return;
			}

			setOtpVerified(true);
			setOtpSuccess("✅ Phone number verified!");
		} catch (err) {
			setOtpError("Network error. Please try again.");
		} finally {
			setOtpLoading(false);
		}
	};

	// ─── Submit registration ───
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (!otpVerified) {
			setError("Please verify your mobile number first");
			setLoading(false);
			return;
		}

		if (!imageBase64) {
			setError("Please upload your profile picture");
			setLoading(false);
			return;
		}

		const formData = new FormData(e.target);
		const fullName = `${formData.get("firstName")} ${formData.get("lastName")}`;
		const email = formData.get("email");
		const password = formData.get("password");
		const confirmPassword = formData.get("confirmPassword");

		if (password !== confirmPassword) {
			setError("Passwords do not match");
			setLoading(false);
			return;
		}

		const result = await register(
			email,
			password,
			fullName,
			cleanPhone(phone),
			imageBase64,
			"super_admin"
		);

		if (!result.success) {
			if (result.error.includes("duplicate") || result.error.includes("23505")) {
				setError("This email is already registered. Please log in instead.");
			} else {
				setError(result.error);
			}
			setLoading(false);
		}
	};

	return (
		<RegisterLayout variant="institutional">
			<div className="register-card rounded-3xl border border-zinc-200 bg-white/92 p-6 shadow-2xl shadow-sky-500/15 sm:p-10">
				<h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
					Create an account
				</h1>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
					Fill in the details below to get started.
				</p>

				{error && (
					<div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
						{error}
					</div>
				)}

				<form className="register-form register-form-institutional mt-8 space-y-5" onSubmit={handleSubmit}>
					{/* ─── Profile Picture ─── */}
					<div>
						<label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
							Profile Picture <span className="text-red-500">*</span>
						</label>
						<div className="flex items-start gap-4">
							{imageBase64 ? (
								<div className="relative">
									<img
										src={imageBase64}
										alt="Profile"
										className="h-24 w-24 rounded-full border-2 border-zinc-200 object-cover dark:border-zinc-700"
									/>
									<button
										type="button"
										onClick={removeImage}
										className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg hover:bg-red-600"
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
											<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							) : (
								<label className="register-upload-control flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-sky-500 hover:bg-sky-50">
									<input
										id="institutional-avatar"
										name="avatar"
										aria-label="Upload profile picture"
										type="file"
										accept="image/jpeg,image/jpg,image/png"
										onChange={handleImageUpload}
										className="hidden"
										disabled={uploadingImage}
									/>
									{uploadingImage ? (
										<svg className="h-8 w-8 animate-spin text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-zinc-400">
											<path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
											<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
										</svg>
									)}
								</label>
							)}
							<div className="flex-1">
								<p className="text-sm text-zinc-600 dark:text-zinc-400">Upload your profile picture</p>
								<p className="mt-1 text-xs text-zinc-500">JPEG or PNG, max 5MB</p>
							</div>
						</div>
					</div>

					{/* ─── Name ─── */}
					<div className="grid gap-5 sm:grid-cols-2">
						<div>
							<label htmlFor="firstName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
								First name <span className="text-red-500">*</span>
							</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								placeholder="Priya"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
								required
							/>
						</div>
						<div>
							<label htmlFor="lastName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
								Last name <span className="text-red-500">*</span>
							</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								placeholder="Sharma"
								className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
								required
							/>
						</div>
					</div>

					{/* ─── Email ─── */}
					<div>
						<label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
							Work email <span className="text-red-500">*</span>
						</label>
						<input
							id="email"
							name="email"
							type="email"
							placeholder="you@school.com"
							className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
							required
						/>
					</div>

					{/* ─── Mobile Number + OTP ─── */}
					<div>
						<label htmlFor="phone" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
							Mobile number <span className="text-red-500">*</span>
						</label>
						<div className="mt-2 flex gap-2">
							<div className="register-phone-prefix flex items-center rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500">
								+91
							</div>
							<input
								id="phone"
								type="tel"
								placeholder="98765 43210"
								value={phone}
								onChange={(e) => {
									setPhone(e.target.value);
									if (otpVerified) {
										setOtpVerified(false);
										setOtpSent(false);
										setOtpCode("");
									}
								}}
								disabled={otpVerified}
								className={`flex-1 rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none ${
									otpVerified
										? "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300"
										: "border-zinc-300 bg-white text-zinc-900 focus:border-sky-500 dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
								}`}
								required
							/>
							{!otpVerified && (
								<button
									type="button"
									onClick={sendOTP}
									disabled={otpLoading || resendTimer > 0}
									className="whitespace-nowrap rounded-lg bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{otpLoading
										? "Sending..."
										: resendTimer > 0
										? `Resend (${resendTimer}s)`
										: otpSent
										? "Resend OTP"
										: "Send OTP"}
								</button>
							)}
							{otpVerified && (
								<div className="flex items-center gap-1 rounded-lg bg-green-100 px-3 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
										<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
									</svg>
									Verified
								</div>
							)}
						</div>

						{/* OTP Input */}
						{otpSent && !otpVerified && (
							<div className="mt-3 space-y-2">
								<div className="flex gap-2">
									<input
										id="otp-code"
										name="otp"
										aria-label="6-digit OTP code"
										type="text"
										placeholder="Enter 6-digit OTP"
										value={otpCode}
										onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
										maxLength={6}
										className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-center tracking-[0.5em] font-mono text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100"
									/>
									<button
										type="button"
										onClick={verifyOTP}
										disabled={otpLoading || otpCode.length !== 6}
										className="whitespace-nowrap rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{otpLoading ? "Verifying..." : "Verify"}
									</button>
								</div>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									OTP sent to your WhatsApp on +91 {cleanPhone(phone)}
								</p>
							</div>
						)}

						{otpError && (
							<p className="mt-2 text-sm text-red-600 dark:text-red-400">{otpError}</p>
						)}
						{otpSuccess && !otpError && (
							<p className="mt-2 text-sm text-green-600 dark:text-green-400">{otpSuccess}</p>
						)}
					</div>

					{/* ─── Password ─── */}
					<div>
						<label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
							Password <span className="text-red-500">*</span>
						</label>
						<div className="relative mt-2"><input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100" required minLength={8} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:text-[#064bb2] focus-visible:outline-2 focus-visible:outline-[#064bb2]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
						<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Minimum 8 characters</p>
					</div>
					<div>
						<label htmlFor="confirmPassword" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
							Confirm password <span className="text-red-500">*</span>
						</label>
						<div className="relative mt-2"><input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-100" required minLength={8} /><button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:text-[#064bb2] focus-visible:outline-2 focus-visible:outline-[#064bb2]" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
					</div>

					{/* ─── Info ─── */}
					<div className="register-info rounded-lg border border-sky-200 bg-sky-50 px-4 py-3">
						<div className="flex items-start gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-500">
								<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
							</svg>
							<div>
								<p className="text-sm font-medium text-sky-800 dark:text-sky-300">
									You are registering as a School Super Admin
								</p>
								<p className="mt-1 text-xs text-sky-600 dark:text-sky-400">
									After registration, you can onboard your school and add faculty, students, parents, and co-admins from the dashboard.
								</p>
							</div>
						</div>
					</div>

					{/* ─── Submit ─── */}
					<button
						type="submit"
						disabled={loading || !otpVerified}
						className={`w-full rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
							otpVerified
								? "bg-sky-500 shadow-sky-500/30 hover:bg-sky-400"
								: "bg-zinc-400 shadow-none cursor-not-allowed"
						}`}
					>
						{loading ? "Creating account..." : "Create School Admin Account"}
					</button>
				</form>

				<p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
					Already have access?{" "}
					<Link
						href="/login/institutional-suite"
						className="font-semibold text-sky-500 transition-colors hover:text-sky-400"
					>
						Log in here
					</Link>
				</p>
			</div>
		</RegisterLayout>
	);
}
