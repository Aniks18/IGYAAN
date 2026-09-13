"use client";

import { useState } from "react";
import { supabase } from "../../app/utils/supabase";

export default function SchoolOnboarding({ userId, onComplete }) {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [uploadingFile, setUploadingFile] = useState("");
	const [formData, setFormData] = useState({
		school_name: "",
		school_type: "",
		affiliation_board: "",
		address_line1: "",
		address_line2: "",
		city: "",
		state: "",
		pincode: "",
		country: "India",
		contact_email: "",
		contact_phone: "",
		principal_name: "",
		udise_code: "",
		logo_url: "",
		registration_certificate_url: "",
		affiliation_certificate_url: "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setError("");
	};

	const handleFileUpload = (e, fieldName) => {
		const file = e.target.files[0];
		if (!file) return;

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setError(`File size should be less than 5MB for ${fieldName}`);
			return;
		}

		// Validate file type
		const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
		if (!validTypes.includes(file.type)) {
			setError(`Please upload a valid image (JPEG, PNG) or PDF file for ${fieldName}`);
			return;
		}

		setUploadingFile(fieldName);
		setError("");

		const reader = new FileReader();
		reader.onloadend = () => {
			const base64String = reader.result;
			setFormData((prev) => ({ ...prev, [fieldName]: base64String }));
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
		setLoading(true);
		setError("");

		// Validate required fields
		if (
			!formData.school_name ||
			!formData.school_type ||
			!formData.address_line1 ||
			!formData.city ||
			!formData.state ||
			!formData.pincode ||
			!formData.contact_email ||
			!formData.contact_phone ||
			!formData.logo_url
		) {
			setError("Please fill in all required fields and upload school logo");
			setLoading(false);
			return;
		}

		try {
			// Generate subdomain from school name
			const subdomain = formData.school_name
				.toLowerCase()
				.replace(/[^a-z0-9]/g, "")
				.substring(0, 50);

			// Insert school data
			const { data: schoolData, error: schoolError } = await supabase
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
						udise_code: formData.udise_code || null,
						logo_url: formData.logo_url || null,
						registration_certificate_url: formData.registration_certificate_url || null,
						affiliation_certificate_url: formData.affiliation_certificate_url || null,
						created_by: userId,
						updated_by: userId,
					},
				])
				.select()
				.single();

			if (schoolError) {
				console.error("Supabase error:", schoolError);
				throw schoolError;
			}

			console.log("School created with ID:", schoolData.id);

			// Update user's school_id
			const { error: userUpdateError } = await supabase
				.from("users")
				.update({ school_id: schoolData.id })
				.eq("id", userId);

			if (userUpdateError) {
				console.error("Error updating user school_id:", userUpdateError);
				throw new Error("School created but failed to link to user. Please contact support.");
			}

			console.log("User updated with school_id:", schoolData.id);

			setLoading(false);
			onComplete(); // Notify parent component that onboarding is complete
		} catch (err) {
			console.error("Error creating school:", err);
			setError(err.message || "Failed to create school. Please try again.");
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center overlay-scrim backdrop-blur-sm p-4">
			<div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
				{/* Header */}
				<div className="sticky top-0 border-b border-zinc-200 bg-white/95 backdrop-blur-xl px-8 py-6 dark:border-zinc-800 dark:bg-zinc-900/95">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-500">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-white"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
								/>
							</svg>
						</div>
						<div>
							<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
								Welcome to iGyanAI! 🎉
							</h2>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								Let's set up your school profile to get started
							</p>
						</div>
					</div>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="p-8 space-y-8">
					{error && (
						<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
							<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
						</div>
					)}

					{/* Basic Information */}
					<div>
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
							Basic Information
						</h3>
						<div className="grid gap-6 sm:grid-cols-2">
							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									School Name <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="school_name"
									value={formData.school_name}
									onChange={handleChange}
									placeholder="Enter school name"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
									required
								/>
							</div>

							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									School Logo <span className="text-red-500">*</span>
								</label>
								<div className="flex items-start gap-4">
									{formData.logo_url ? (
										<div className="relative">
											<img
												src={formData.logo_url}
												alt="School Logo"
												width={96}
												height={96}
												className="h-24 w-24 rounded-lg border-2 border-zinc-200 object-cover dark:border-zinc-700"
											/>
											<button
												type="button"
												onClick={() => removeFile("logo_url")}
												className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg hover:bg-red-600"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className="h-4 w-4"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</div>
									) : (
										<label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20">
											<input
												id="school-logo-input"
												name="logo"
												aria-label="Upload school logo"
												type="file"
												accept="image/jpeg,image/jpg,image/png"
												onChange={(e) => handleFileUpload(e, "logo_url")}
												className="hidden"
												disabled={uploadingFile === "logo_url"}
											/>
											{uploadingFile === "logo_url" ? (
												<svg
													className="h-6 w-6 animate-spin text-indigo-500"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														className="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="4"
													></circle>
													<path
														className="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
											) : (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="1.5"
													className="h-6 w-6 text-zinc-400"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M12 4.5v15m7.5-7.5h-15"
													/>
												</svg>
											)}
										</label>
									)}
									<div className="flex-1">
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											Upload your school logo (JPEG, PNG)
										</p>
										<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
											Max size: 5MB. Recommended: 512x512px
										</p>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									School Type <span className="text-red-500">*</span>
								</label>
								<select
									name="school_type"
									value={formData.school_type}
									onChange={handleChange}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									required
								>
									<option value="">Select type</option>
									<option value="primary">Primary School</option>
									<option value="secondary">Secondary School</option>
									<option value="higher_secondary">Higher Secondary</option>
									<option value="college">College</option>
									<option value="university">University</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Affiliation Board
								</label>
								<input
									type="text"
									name="affiliation_board"
									value={formData.affiliation_board}
									onChange={handleChange}
									placeholder="e.g., CBSE, ICSE, State Board"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									UDISE Code
								</label>
								<input
									type="text"
									name="udise_code"
									value={formData.udise_code}
									onChange={handleChange}
									placeholder="Optional"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
								/>
							</div>
						</div>
					</div>

					{/* Address Information */}
					<div>
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
							Address
						</h3>
						<div className="grid gap-6 sm:grid-cols-2">
							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Address Line 1 <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="address_line1"
									value={formData.address_line1}
									onChange={handleChange}
									placeholder="Street address"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
									required
								/>
							</div>

							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Address Line 2
								</label>
								<input
									type="text"
									name="address_line2"
									value={formData.address_line2}
									onChange={handleChange}
									placeholder="Apartment, suite, etc. (optional)"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									City <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="city"
									value={formData.city}
									onChange={handleChange}
									placeholder="City"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									State <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="state"
									value={formData.state}
									onChange={handleChange}
									placeholder="State"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Pincode <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="pincode"
									value={formData.pincode}
									onChange={handleChange}
									placeholder="Pincode"
									maxLength="10"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Country
								</label>
								<input
									type="text"
									name="country"
									value={formData.country}
									onChange={handleChange}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>
						</div>
					</div>

					{/* Verification Documents */}
					<div>
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
							Verification Documents
						</h3>
						<p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
							Upload official documents to verify your school (optional but recommended)
						</p>

						<div className="space-y-6">
							{/* Registration Certificate */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									School Registration Certificate
								</label>
								{formData.registration_certificate_url ? (
									<div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-8 w-8 text-green-500"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<div className="flex-1">
											<p className="text-sm font-medium text-zinc-900 dark:text-white">
												File uploaded successfully
											</p>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												{formData.registration_certificate_url.substring(0, 50)}...
											</p>
										</div>
										<button
											type="button"
											onClick={() => removeFile("registration_certificate_url")}
											className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												className="h-5 w-5"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
												/>
											</svg>
										</button>
									</div>
								) : (
									<label className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20">
										<input
											id="registration-certificate-input"
											name="registration_certificate"
											aria-label="Upload registration certificate"
											type="file"
											accept="image/jpeg,image/jpg,image/png,application/pdf"
											onChange={(e) =>
												handleFileUpload(e, "registration_certificate_url")
											}
											className="hidden"
											disabled={uploadingFile === "registration_certificate_url"}
										/>
										{uploadingFile === "registration_certificate_url" ? (
											<svg
												className="h-8 w-8 animate-spin text-indigo-500"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
										) : (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												className="h-8 w-8 text-zinc-400"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
												/>
											</svg>
										)}
										<div className="flex-1">
											<p className="text-sm font-medium text-zinc-900 dark:text-white">
												{uploadingFile === "registration_certificate_url"
													? "Uploading..."
													: "Click to upload"}
											</p>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												PDF, JPEG, or PNG (max 5MB)
											</p>
										</div>
									</label>
								)}
							</div>

							{/* Affiliation Certificate */}
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Board Affiliation Certificate
								</label>
								{formData.affiliation_certificate_url ? (
									<div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-8 w-8 text-green-500"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										<div className="flex-1">
											<p className="text-sm font-medium text-zinc-900 dark:text-white">
												File uploaded successfully
											</p>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												{formData.affiliation_certificate_url.substring(0, 50)}...
											</p>
										</div>
										<button
											type="button"
											onClick={() => removeFile("affiliation_certificate_url")}
											className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												className="h-5 w-5"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
												/>
											</svg>
										</button>
									</div>
								) : (
									<label className="flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20">
										<input
											id="affiliation-certificate-input"
											name="affiliation_certificate"
											aria-label="Upload affiliation certificate"
											type="file"
											accept="image/jpeg,image/jpg,image/png,application/pdf"
											onChange={(e) =>
												handleFileUpload(e, "affiliation_certificate_url")
											}
											className="hidden"
											disabled={uploadingFile === "affiliation_certificate_url"}
										/>
										{uploadingFile === "affiliation_certificate_url" ? (
											<svg
												className="h-8 w-8 animate-spin text-indigo-500"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
										) : (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												className="h-8 w-8 text-zinc-400"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
												/>
											</svg>
										)}
										<div className="flex-1">
											<p className="text-sm font-medium text-zinc-900 dark:text-white">
												{uploadingFile === "affiliation_certificate_url"
													? "Uploading..."
													: "Click to upload"}
											</p>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												PDF, JPEG, or PNG (max 5MB)
											</p>
										</div>
									</label>
								)}
							</div>
						</div>
					</div>

					{/* Contact Information */}
					<div>
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
							Contact Information
						</h3>
						<div className="grid gap-6 sm:grid-cols-2">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Contact Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									name="contact_email"
									value={formData.contact_email}
									onChange={handleChange}
									placeholder="school@example.com"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Contact Phone <span className="text-red-500">*</span>
								</label>
								<input
									type="tel"
									name="contact_phone"
									value={formData.contact_phone}
									onChange={handleChange}
									placeholder="+91 XXXXX XXXXX"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
									required
								/>
							</div>

							<div className="sm:col-span-2">
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Principal Name
								</label>
								<input
									type="text"
									name="principal_name"
									value={formData.principal_name}
									onChange={handleChange}
									placeholder="Optional"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400"
								/>
							</div>
						</div>
					</div>

					{/* Submit Button */}
					<div className="flex justify-end gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
						<button
							type="submit"
							disabled={loading}
							className="rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<span className="flex items-center gap-2">
									<svg
										className="h-4 w-4 animate-spin"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Creating School...
								</span>
							) : (
								"Complete Setup"
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
