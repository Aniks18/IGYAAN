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
	Trash2,
	ChevronDown,
	FileText,
	Check,
} from "lucide-react";

export default function SchoolProfilePage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [uploadingFile, setUploadingFile] = useState("");
	const [schoolExists, setSchoolExists] = useState(false);
	const [formData, setFormData] = useState({
		school_name: "Litera Valley",
		school_type: "Higher Secondary",
		affiliation_board: "CBSE",
		address_line1: "",
		address_line2: "",
		city: "",
		state: "",
		pincode: "",
		country: "India",
		contact_email: "",
		contact_phone: "",
		principal_name: "",
		principal_email: "",
		principal_phone: "",
		udise_code: "",
		logo_url: "",
		registration_certificate_url: "",
		affiliation_certificate_url: "",
		principal_id_proof_url: "",
	});

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		const fetchSchoolData = async () => {
			if (!user?.id) return;

			try {
				if (!user.school_id) {
					const { data: createdSchool } = await supabase
						.from("schools")
						.select("*")
						.eq("created_by", user.id)
						.maybeSingle();

					if (createdSchool) {
						setSchoolExists(true);
						setFormData({
							school_name: createdSchool.school_name || "Litera Valley",
							school_type: createdSchool.school_type || "Higher Secondary",
							affiliation_board: createdSchool.affiliation_board || "CBSE",
							address_line1: createdSchool.address_line1 || "",
							address_line2: createdSchool.address_line2 || "",
							city: createdSchool.city || "",
							state: createdSchool.state || "",
							pincode: createdSchool.pincode || "",
							country: createdSchool.country || "India",
							contact_email: createdSchool.contact_email || user.email || "",
							contact_phone: createdSchool.contact_phone || user.phone || "",
							principal_name: createdSchool.principal_name || "",
							principal_email: createdSchool.principal_email || "",
							principal_phone: createdSchool.principal_phone || "",
							udise_code: createdSchool.udise_code || "",
							logo_url: createdSchool.logo_url || "",
							registration_certificate_url: createdSchool.registration_certificate_url || "",
							affiliation_certificate_url: createdSchool.affiliation_certificate_url || "",
							principal_id_proof_url: createdSchool.principal_id_proof_url || "",
						});
					} else {
						// Pre-fill with user default email and phone
						setFormData((prev) => ({
							...prev,
							contact_email: user.email || "",
							contact_phone: user.phone || "",
						}));
					}
					return;
				}

				const { data, error: fetchError } = await supabase
					.from("schools")
					.select("*")
					.eq("id", user.school_id)
					.maybeSingle();

				if (fetchError && fetchError.code !== "PGRST116") {
					console.error("Error fetching school:", fetchError);
					return;
				}

				if (data) {
					setSchoolExists(true);
					setFormData({
						school_name: data.school_name || "Litera Valley",
						school_type: data.school_type || "Higher Secondary",
						affiliation_board: data.affiliation_board || "CBSE",
						address_line1: data.address_line1 || "",
						address_line2: data.address_line2 || "",
						city: data.city || "",
						state: data.state || "",
						pincode: data.pincode || "",
						country: data.country || "India",
						contact_email: data.contact_email || user.email || "",
						contact_phone: data.contact_phone || user.phone || "",
						principal_name: data.principal_name || "",
						principal_email: data.principal_email || "",
						principal_phone: data.principal_phone || "",
						udise_code: data.udise_code || "",
						logo_url: data.logo_url || "",
						registration_certificate_url: data.registration_certificate_url || "",
						affiliation_certificate_url: data.affiliation_certificate_url || "",
						principal_id_proof_url: data.principal_id_proof_url || "",
					});
				}
			} catch (err) {
				console.error("Error in fetchSchoolData:", err);
			}
		};

		if (user) {
			fetchSchoolData();
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
		setSuccess("");
	};

	const handleFileUpload = (e, fieldName) => {
		const file = e.target.files[0];
		if (!file) return;

		if (file.size > 5 * 1024 * 1024) {
			setError(`File size should be less than 5MB for ${fieldName}`);
			return;
		}

		const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
		if (!validTypes.includes(file.type)) {
			setError(`Please upload a valid image (JPEG, PNG) or PDF file`);
			return;
		}

		setUploadingFile(fieldName);
		setError("");
		setSuccess("");

		const reader = new FileReader();
		reader.onloadend = () => {
			setFormData((prev) => ({ ...prev, [fieldName]: reader.result }));
			setUploadingFile("");
		};
		reader.onerror = () => {
			setError(`Failed to read ${fieldName}. Please try again.`);
			setUploadingFile("");
		};
		reader.readAsDataURL(file);
	};

	const removeFile = (fieldName) => {
		setFormData((prev) => ({ ...prev, [fieldName]: "" }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			if (
				!formData.school_name ||
				!formData.school_type ||
				!formData.address_line1 ||
				!formData.city ||
				!formData.state ||
				!formData.pincode ||
				!formData.contact_email ||
				!formData.contact_phone
			) {
				setError("Please fill in all required fields marked with *");
				setSaving(false);
				return;
			}

			const subdomain = formData.school_name
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "");

			if (schoolExists) {
				const { error: updateError } = await supabase
					.from("schools")
					.update({
						school_name: formData.school_name,
						subdomain: subdomain || "school",
						school_type: formData.school_type,
						affiliation_board: formData.affiliation_board || null,
						address_line1: formData.address_line1,
						address_line2: formData.address_line2 || null,
						city: formData.city,
						state: formData.state,
						pincode: formData.pincode,
						country: formData.country,
						contact_email: formData.contact_email,
						contact_phone: formData.contact_phone,
						principal_name: formData.principal_name || null,
						principal_email: formData.principal_email || null,
						principal_phone: formData.principal_phone || null,
						udise_code: formData.udise_code || null,
						logo_url: formData.logo_url || null,
						registration_certificate_url: formData.registration_certificate_url || null,
						affiliation_certificate_url: formData.affiliation_certificate_url || null,
						principal_id_proof_url: formData.principal_id_proof_url || null,
						updated_by: user.id,
						updated_at: new Date().toISOString(),
					})
					.eq("created_by", user.id);

				if (updateError) throw updateError;
			} else {
				const { data: newSchool, error: insertError } = await supabase
					.from("schools")
					.insert([
						{
							school_name: formData.school_name,
							subdomain: subdomain || "school",
							school_type: formData.school_type,
							affiliation_board: formData.affiliation_board || null,
							address_line1: formData.address_line1,
							address_line2: formData.address_line2 || null,
							city: formData.city,
							state: formData.state,
							pincode: formData.pincode,
							country: formData.country,
							contact_email: formData.contact_email,
							contact_phone: formData.contact_phone,
							principal_name: formData.principal_name || null,
							principal_email: formData.principal_email || null,
							principal_phone: formData.principal_phone || null,
							udise_code: formData.udise_code || null,
							logo_url: formData.logo_url || null,
							registration_certificate_url: formData.registration_certificate_url || null,
							affiliation_certificate_url: formData.affiliation_certificate_url || null,
							principal_id_proof_url: formData.principal_id_proof_url || null,
							created_by: user.id,
							updated_by: user.id,
						},
					])
					.select()
					.single();

				if (insertError) throw insertError;

				if (newSchool?.id) {
					await supabase
						.from("users")
						.update({ school_id: newSchool.id, updated_at: new Date().toISOString() })
						.eq("id", user.id);
				}

				setSchoolExists(true);
			}

			setSuccess("School profile updated successfully!");
			window.scrollTo({ top: 0, behavior: "smooth" });
			setTimeout(() => {
				setSuccess("");
			}, 3500);
		} catch (err) {
			console.error("Error updating school:", err);
			setError(err.message || "Failed to update school profile. Please try again.");
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
						Loading school profile...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	const isFaculty = user.role === "faculty";
	const isViewOnly = isFaculty;

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

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* ── 1. School Identity & Logo Card ── */}
					<div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
						{/* School Logo */}
						<div>
							<label className="block text-xs font-bold text-slate-700 mb-3">
								School Logo
							</label>
							<div className="flex items-center gap-4">
								{formData.logo_url ? (
									<div className="relative">
										<img
											src={formData.logo_url}
											alt="School Logo"
											className="h-20 w-20 rounded-2xl border border-slate-200 object-cover shadow-2xs"
										/>
										{!isViewOnly && (
											<button
												type="button"
												onClick={() => removeFile("logo_url")}
												className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-white shadow-md hover:bg-rose-600 transition"
											>
												<X className="h-3 w-3 stroke-[2.5]" />
											</button>
										)}
									</div>
								) : (
									!isViewOnly && (
										<label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-orange-500 hover:bg-orange-50/30">
											<input
												type="file"
												accept="image/jpeg,image/jpg,image/png"
												onChange={(e) => handleFileUpload(e, "logo_url")}
												className="hidden"
												disabled={uploadingFile === "logo_url"}
											/>
											{uploadingFile === "logo_url" ? (
												<Loader2 className="h-5 w-5 animate-spin text-orange-600" />
											) : (
												<Upload className="h-5 w-5 text-slate-400" />
											)}
										</label>
									)
								)}
								<div>
									<p className="text-xs font-bold text-slate-800">
										Upload your school logo
									</p>
									<p className="mt-0.5 text-[11px] text-slate-500">
										Max 5MB. Recommended: 512×512px
									</p>
								</div>
							</div>
						</div>

						{/* School Type & Affiliation Board */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							{/* School Type */}
							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									School Type <span className="text-rose-500">*</span>
								</label>
								<div className="relative">
									<select
										name="school_type"
										value={formData.school_type}
										onChange={handleChange}
										disabled={isViewOnly}
										className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-9 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
										required
									>
										<option value="Higher Secondary">Higher Secondary</option>
										<option value="Secondary">Secondary</option>
										<option value="Middle School">Middle School</option>
										<option value="Primary School">Primary School</option>
										<option value="K-12 School">K-12 School</option>
										<option value="Junior College">Junior College</option>
									</select>
									<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								</div>
							</div>

							{/* Affiliation Board */}
							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									Affiliation Board
								</label>
								<div className="relative">
									<select
										name="affiliation_board"
										value={formData.affiliation_board}
										onChange={handleChange}
										disabled={isViewOnly}
										className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-9 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
									>
										<option value="CBSE">CBSE</option>
										<option value="ICSE">ICSE</option>
										<option value="State Board">State Board</option>
										<option value="IB (International Baccalaureate)">IB (International Baccalaureate)</option>
										<option value="Cambridge (IGCSE)">Cambridge (IGCSE)</option>
										<option value="Other">Other</option>
									</select>
									<ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								</div>
							</div>
						</div>

						{/* UDISE Code */}
						<div>
							<label className="block text-xs font-bold text-slate-700 mb-1.5">
								UDISE Code
							</label>
							<input
								type="text"
								name="udise_code"
								value={formData.udise_code}
								onChange={handleChange}
								placeholder="Enter UDISE code"
								disabled={isViewOnly}
								className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
							/>
						</div>
					</div>

					{/* ── 2. Address Card ── */}
					<div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
						<h3 className="text-base font-extrabold text-[#0f172a]">Address</h3>

						{/* Address Line 1 */}
						<div>
							<label className="block text-xs font-bold text-slate-700 mb-1.5">
								Address Line 1 <span className="text-rose-500">*</span>
							</label>
							<input
								type="text"
								name="address_line1"
								value={formData.address_line1}
								onChange={handleChange}
								placeholder="SOMEWHERE IN BIHAR"
								disabled={isViewOnly}
								className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
								required
							/>
						</div>

						{/* Address Line 2 */}
						<div>
							<label className="block text-xs font-bold text-slate-700 mb-1.5">
								Address Line 2
							</label>
							<input
								type="text"
								name="address_line2"
								value={formData.address_line2}
								onChange={handleChange}
								placeholder="Apartment, suite, etc. (optional)"
								disabled={isViewOnly}
								className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
							/>
						</div>

						{/* City, State, PIN, Country Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									City <span className="text-rose-500">*</span>
								</label>
								<input
									type="text"
									name="city"
									value={formData.city}
									onChange={handleChange}
									placeholder="PATNA"
									disabled={isViewOnly}
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									State <span className="text-rose-500">*</span>
								</label>
								<input
									type="text"
									name="state"
									value={formData.state}
									onChange={handleChange}
									placeholder="BIHAR"
									disabled={isViewOnly}
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									PIN Code <span className="text-rose-500">*</span>
								</label>
								<input
									type="text"
									name="pincode"
									value={formData.pincode}
									onChange={handleChange}
									placeholder="202001"
									disabled={isViewOnly}
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									Country
								</label>
								<input
									type="text"
									name="country"
									value={formData.country}
									onChange={handleChange}
									placeholder="India"
									disabled={isViewOnly}
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
								/>
							</div>
						</div>
					</div>

					{/* ── 3. Contact Information Card ── */}
					<div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
						<h3 className="text-base font-extrabold text-[#0f172a]">
							Contact Information
						</h3>

						{/* Contact Email & Phone */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									Contact Email <span className="text-rose-500">*</span>
								</label>
								<input
									type="email"
									name="contact_email"
									value={formData.contact_email}
									onChange={handleChange}
									placeholder="akshat@gmail.com"
									disabled={isViewOnly}
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
									required
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									Contact Phone <span className="text-rose-500">*</span>
								</label>
								<input
									type="tel"
									name="contact_phone"
									value={formData.contact_phone}
									onChange={handleChange}
									placeholder="7668291228"
									disabled={isViewOnly}
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
									required
								/>
							</div>
						</div>

						{/* Principal Name, Email, Phone Grid */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									Principal Name
								</label>
								<input
									type="text"
									name="principal_name"
									value={formData.principal_name}
									onChange={handleChange}
									placeholder="AKSHAT A"
									disabled={isViewOnly}
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									Principal Email
								</label>
								<input
									type="email"
									name="principal_email"
									value={formData.principal_email}
									onChange={handleChange}
									placeholder="principal@example.com"
									disabled={isViewOnly}
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
								/>
							</div>

							<div>
								<label className="block text-xs font-bold text-slate-700 mb-1.5">
									Principal Phone
								</label>
								<input
									type="tel"
									name="principal_phone"
									value={formData.principal_phone}
									onChange={handleChange}
									placeholder="+911234567890"
									disabled={isViewOnly}
									className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-2xs transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 disabled:opacity-60"
								/>
							</div>
						</div>
					</div>

					{/* ── 4. Verification Documents Card ── */}
					<div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
						<h3 className="text-base font-extrabold text-[#0f172a]">
							Verification Documents
						</h3>

						{/* Document 1: School Registration Certificate */}
						<div>
							<label className="block text-xs font-bold text-slate-700 mb-1.5">
								School Registration Certificate
							</label>
							{formData.registration_certificate_url ? (
								<div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3.5">
									<div className="flex items-center gap-2.5">
										<CheckCircle2 className="h-4 w-4 text-emerald-600" />
										<span className="text-xs font-bold text-slate-800">
											File uploaded
										</span>
									</div>
									{!isViewOnly && (
										<button
											type="button"
											onClick={() => removeFile("registration_certificate_url")}
											className="text-rose-500 hover:text-rose-600 transition p-1"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									)}
								</div>
							) : (
								!isViewOnly && (
									<label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center cursor-pointer transition hover:border-orange-500 hover:bg-orange-50/20">
										<input
											type="file"
											accept="application/pdf,image/jpeg,image/png"
											onChange={(e) => handleFileUpload(e, "registration_certificate_url")}
											className="hidden"
											disabled={uploadingFile === "registration_certificate_url"}
										/>
										{uploadingFile === "registration_certificate_url" ? (
											<Loader2 className="h-6 w-6 animate-spin text-orange-600" />
										) : (
											<>
												<Upload className="h-5 w-5 text-slate-400 mb-1.5" />
												<p className="text-xs font-bold text-slate-800">
													Click to upload
												</p>
												<p className="text-[11px] text-slate-500 mt-0.5">
													PDF, JPEG, or PNG (max 5MB)
												</p>
											</>
										)}
									</label>
								)
							)}
						</div>

						{/* Document 2: Board Affiliation Certificate */}
						<div>
							<label className="block text-xs font-bold text-slate-700 mb-1.5">
								Board Affiliation Certificate
							</label>
							{formData.affiliation_certificate_url ? (
								<div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3.5">
									<div className="flex items-center gap-2.5">
										<CheckCircle2 className="h-4 w-4 text-emerald-600" />
										<span className="text-xs font-bold text-slate-800">
											File uploaded
										</span>
									</div>
									{!isViewOnly && (
										<button
											type="button"
											onClick={() => removeFile("affiliation_certificate_url")}
											className="text-rose-500 hover:text-rose-600 transition p-1"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									)}
								</div>
							) : (
								!isViewOnly && (
									<label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center cursor-pointer transition hover:border-orange-500 hover:bg-orange-50/20">
										<input
											type="file"
											accept="application/pdf,image/jpeg,image/png"
											onChange={(e) => handleFileUpload(e, "affiliation_certificate_url")}
											className="hidden"
											disabled={uploadingFile === "affiliation_certificate_url"}
										/>
										{uploadingFile === "affiliation_certificate_url" ? (
											<Loader2 className="h-6 w-6 animate-spin text-orange-600" />
										) : (
											<>
												<Upload className="h-5 w-5 text-slate-400 mb-1.5" />
												<p className="text-xs font-bold text-slate-800">
													Click to upload
												</p>
												<p className="text-[11px] text-slate-500 mt-0.5">
													PDF, JPEG, or PNG (max 5MB)
												</p>
											</>
										)}
									</label>
								)
							)}
						</div>

						{/* Document 3: Principal's ID Proof */}
						<div>
							<label className="block text-xs font-bold text-slate-700 mb-1.5">
								Principal's ID Proof
							</label>
							{formData.principal_id_proof_url ? (
								<div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 p-3.5">
									<div className="flex items-center gap-2.5">
										<CheckCircle2 className="h-4 w-4 text-emerald-600" />
										<span className="text-xs font-bold text-slate-800">
											File uploaded
										</span>
									</div>
									{!isViewOnly && (
										<button
											type="button"
											onClick={() => removeFile("principal_id_proof_url")}
											className="text-rose-500 hover:text-rose-600 transition p-1"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									)}
								</div>
							) : (
								!isViewOnly && (
									<label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center cursor-pointer transition hover:border-orange-500 hover:bg-orange-50/20">
										<input
											type="file"
											accept="application/pdf,image/jpeg,image/png"
											onChange={(e) => handleFileUpload(e, "principal_id_proof_url")}
											className="hidden"
											disabled={uploadingFile === "principal_id_proof_url"}
										/>
										{uploadingFile === "principal_id_proof_url" ? (
											<Loader2 className="h-6 w-6 animate-spin text-orange-600" />
										) : (
											<>
												<Upload className="h-5 w-5 text-slate-400 mb-1.5" />
												<p className="text-xs font-bold text-slate-800">
													Click to upload
												</p>
												<p className="text-[11px] text-slate-500 mt-0.5">
													PDF, JPEG, or PNG (max 5MB)
												</p>
											</>
										)}
									</label>
								)
							)}
						</div>
					</div>

					{/* ── 5. Bottom Action Bar ── */}
					{!isViewOnly && (
						<div className="flex items-center gap-3 pt-2">
							<button
								type="submit"
								disabled={saving}
								className="dashboard-btn-primary flex-1 rounded-xl py-3 text-xs font-bold shadow-sm disabled:opacity-50"
							>
								{saving ? "Saving Changes..." : "Save Changes"}
							</button>
							<Link
								href="/dashboard/settings"
								className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
							>
								Cancel
							</Link>
						</div>
					)}
				</form>
			</div>
		</div>
	);
}
