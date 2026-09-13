"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import Link from "next/link";
import {
	Building2,
	Upload,
	X,
	CheckCircle2,
	AlertTriangle,
	Loader2,
	School,
	User,
} from "lucide-react";
import FacultyProfileDisplay from "./FacultyProfileDisplay";
import StudentProfileDisplay from "./StudentProfileDisplay";

export default function ProfilePage() {
	const { user, loading, checkSession } = useAuth();
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [uploadingImage, setUploadingImage] = useState(false);
	const [schoolData, setSchoolData] = useState(null);
	const [loadingSchool, setLoadingSchool] = useState(false);
	const [formData, setFormData] = useState({
		full_name: "",
		email: "",
		phone: "",
		image_base64: "",
	});

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (user) {
			setFormData({
				full_name: user.full_name || "",
				email: user.email || "",
				phone: user.phone || "",
				image_base64: user.image_base64 || "",
			});

			// Fetch school data if user has school_id or created one
			const fetchSchoolData = async () => {
				try {
					setLoadingSchool(true);
					if (user.school_id) {
						const { data, error } = await supabase
							.from("schools")
							.select("school_name, school_type, affiliation_board, city, state, contact_email, contact_phone")
							.eq("id", user.school_id)
							.maybeSingle();

						if (!error && data) {
							setSchoolData(data);
						}
					} else {
						const { data } = await supabase
							.from("schools")
							.select("school_name, school_type, affiliation_board, city, state, contact_email, contact_phone")
							.eq("created_by", user.id)
							.maybeSingle();
						if (data) setSchoolData(data);
					}
				} catch (err) {
					console.error("Error in fetchSchoolData:", err);
				} finally {
					setLoadingSchool(false);
				}
			};

			fetchSchoolData();
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
		setSuccess("");
	};

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
		setSuccess("");

		const reader = new FileReader();
		reader.onloadend = () => {
			setFormData((prev) => ({ ...prev, image_base64: reader.result }));
			setUploadingImage(false);
		};
		reader.onerror = () => {
			setError("Failed to read image. Please try again.");
			setUploadingImage(false);
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		setFormData((prev) => ({ ...prev, image_base64: "" }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			if (!formData.full_name || !formData.email) {
				setError("Name and email are required");
				setSaving(false);
				return;
			}

			const { error: updateError } = await supabase
				.from("users")
				.update({
					full_name: formData.full_name,
					phone: formData.phone || null,
					image_base64: formData.image_base64 || null,
					updated_at: new Date().toISOString(),
				})
				.eq("id", user.id);

			if (updateError) {
				throw updateError;
			}

			setSuccess("Profile updated successfully!");
			await checkSession();
			window.scrollTo({ top: 0, behavior: "smooth" });
			setTimeout(() => setSuccess(""), 4000);
		} catch (err) {
			console.error("Error updating profile:", err);
			setError(err.message || "Failed to update profile. Please try again.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
				<div className="text-center">
					<div className="mx-auto h-10 w-10 animate-spin rounded-full border-3 border-orange-500 border-t-transparent" />
					<p className="mt-4 text-xs font-semibold text-slate-500">
						Loading profile...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className="min-h-full bg-[#f8fafc] p-4 text-[#1e293b] sm:p-6 lg:p-7">
			<div className="mx-auto max-w-[1520px] space-y-6">
				{/* Success Alert */}
				{success && (
					<div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 animate-in fade-in">
						<CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
						<span>{success}</span>
					</div>
				)}

				{/* Error Alert */}
				{error && (
					<div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 animate-in fade-in">
						<AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
						<span>{error}</span>
					</div>
				)}

				{/* ── 1. Account Information Card ── */}
				<div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
					<h3 className="text-base font-extrabold text-[#0f172a] mb-5">
						Account Information
					</h3>
					<div className="space-y-3.5">
						<div className="flex items-center justify-between text-xs">
							<span className="font-semibold text-slate-600">User ID</span>
							<span className="font-mono text-xs text-slate-800 font-medium">
								{user.id}
							</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="font-semibold text-slate-600">Member Since</span>
							<span className="font-medium text-slate-800">
								{new Date(user.created_at || "2025-10-25").toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</span>
						</div>
						<div className="flex items-center justify-between text-xs">
							<span className="font-semibold text-slate-600">Last Updated</span>
							<span className="font-medium text-slate-800">
								{new Date(user.updated_at || "2025-11-14").toLocaleDateString("en-US", {
									month: "long",
									day: "numeric",
									year: "numeric",
								})}
							</span>
						</div>
					</div>
				</div>

				{/* ── 2. School Information Section ── */}
				{(user.school_id || schoolData || user.role !== "b2c_student") && (
					<div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
						<div className="flex items-center gap-3 mb-5">
							<div className="dashboard-pill flex h-9 w-9 items-center justify-center rounded-xl">
								<School className="h-5 w-5" />
							</div>
							<h3 className="text-base font-extrabold text-[#0f172a]">
								School Information
							</h3>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
							<div>
								<span className="font-semibold text-slate-500">School Name</span>
								<p className="mt-1 font-bold text-slate-900 text-sm">
									{schoolData?.school_name || "Litera Valley"}
								</p>
							</div>

							<div>
								<span className="font-semibold text-slate-500">School Type</span>
								<p className="mt-1 font-bold text-slate-900 text-sm">
									{schoolData?.school_type || "higher_secondary"}
								</p>
							</div>

							<div>
								<span className="font-semibold text-slate-500">Board</span>
								<p className="mt-1 font-bold text-slate-900 text-sm">
									{schoolData?.affiliation_board || "CBSE"}
								</p>
							</div>

							<div>
								<span className="font-semibold text-slate-500">Location</span>
								<p className="mt-1 font-bold text-slate-900 text-sm">
									{schoolData?.city ? `${schoolData.city} , ${schoolData?.state || ""}` : "PATNA , BIHAR"}
								</p>
							</div>

							<div>
								<span className="font-semibold text-slate-500">School Email</span>
								<p className="mt-1 font-bold text-slate-900 text-sm">
									{schoolData?.contact_email || user.email}
								</p>
							</div>

							<div>
								<span className="font-semibold text-slate-500">School Phone</span>
								<p className="mt-1 font-bold text-slate-900 text-sm">
									{schoolData?.contact_phone || "7668291228"}
								</p>
							</div>
						</div>

						<div className="mt-5 pt-4 border-t border-slate-100">
							<Link
								href="/dashboard/school-profile"
								className="dashboard-text-primary text-xs font-bold hover:underline"
							>
								View Full School Profile →
							</Link>
						</div>
					</div>
				)}

				{/* Faculty Profile Section */}
				{user.role === "faculty" && (
					<div className="mb-6">
						<FacultyProfileDisplay userId={user.id} />
					</div>
				)}

				{/* Student Profile Section */}
				{user.role === "student" && (
					<div className="mb-6">
						<StudentProfileDisplay userId={user.id} />
					</div>
				)}

				{/* ── 3. Profile Form Section ── */}
				<div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Profile Picture */}
						<div>
							<label className="block text-xs font-bold text-slate-700 mb-3">
								Profile Picture
							</label>
							<div className="flex items-center gap-5">
								{formData.image_base64 ? (
									<div className="relative">
										<img
											src={formData.image_base64}
											alt="Profile"
											className="h-24 w-24 rounded-full border-2 border-slate-200 object-cover shadow-sm"
										/>
										<button
											type="button"
											onClick={removeImage}
											className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition"
										>
											<X className="h-3.5 w-3.5 stroke-[2.5]" />
										</button>
									</div>
								) : (
									<label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-orange-500 hover:bg-orange-50/30">
										<input
											type="file"
											accept="image/jpeg,image/jpg,image/png"
											onChange={handleImageUpload}
											className="hidden"
											disabled={uploadingImage}
										/>
										{uploadingImage ? (
											<Loader2 className="h-6 w-6 animate-spin text-orange-600" />
										) : (
											<div className="text-center">
												<User className="mx-auto h-7 w-7 text-slate-400" />
											</div>
										)}
									</label>
								)}
								<div>
									<p className="text-xs font-bold text-slate-800">
										Upload a professional photo
									</p>
									<p className="mt-0.5 text-[11px] text-slate-500">
										JPEG or PNG, max 5MB. Recommended: 512×512px
									</p>
								</div>
							</div>
						</div>

						{/* Full Name */}
						<div>
							<label
								htmlFor="full_name"
								className="block text-xs font-bold text-slate-700 mb-1.5"
							>
								Full Name <span className="text-rose-500">*</span>
							</label>
							<input
								id="full_name"
								name="full_name"
								type="text"
								value={formData.full_name}
								onChange={handleChange}
								placeholder="AKSHAT SRIVASTAV"
								className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-900 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
								required
							/>
						</div>

						{/* Email Address */}
						<div>
							<label
								htmlFor="email"
								className="block text-xs font-bold text-slate-700 mb-1.5"
							>
								Email Address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								readOnly
								value={formData.email}
								className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-medium text-slate-600 shadow-2xs cursor-not-allowed focus:outline-none"
							/>
							<p className="mt-1 text-[11px] text-slate-400">
								Email cannot be changed. Contact admin to update.
							</p>
						</div>

						{/* Phone Number */}
						<div>
							<label
								htmlFor="phone"
								className="block text-xs font-bold text-slate-700 mb-1.5"
							>
								Phone Number
							</label>
							<input
								id="phone"
								name="phone"
								type="tel"
								value={formData.phone}
								onChange={handleChange}
								placeholder="7668291228"
								className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-900 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
							/>
						</div>

						{/* Role (Read-only) */}
						<div>
							<label className="block text-xs font-bold text-slate-700 mb-1.5">
								Role
							</label>
							<input
								type="text"
								readOnly
								value={user.role?.replace("_", " ").toUpperCase() || "SUPER ADMIN"}
								className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs cursor-not-allowed focus:outline-none"
							/>
							<p className="mt-1 text-[11px] text-slate-400">
								Contact admin to change your role
							</p>
						</div>

						{/* Action Buttons */}
						<div className="flex items-center gap-3 pt-4 border-t border-slate-100">
							<button
								type="submit"
								disabled={saving}
								className="dashboard-btn-primary rounded-xl px-6 py-2.5 text-xs font-bold shadow-sm disabled:opacity-50"
							>
								{saving ? "Saving changes..." : "Save Changes"}
							</button>
							<Link
								href="/dashboard/settings"
								className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
							>
								Cancel
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
