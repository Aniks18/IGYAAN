import { useState } from "react";

export default function BulkUploadModal({ isOpen, onClose, onUpload }) {
	const [dragActive, setDragActive] = useState(false);
	const [file, setFile] = useState(null);
	const [error, setError] = useState("");

	if (!isOpen) return null;

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		setError("");

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	};

	const handleChange = (e) => {
		e.preventDefault();
		setError("");
		if (e.target.files && e.target.files[0]) {
			handleFile(e.target.files[0]);
		}
	};

	const handleFile = (uploadedFile) => {
		const validTypes = [
			"application/vnd.ms-excel",
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			"text/csv",
		];

		if (!validTypes.includes(uploadedFile.type)) {
			setError("Please upload a valid Excel (.xlsx, .xls) or CSV file");
			return;
		}

		setFile(uploadedFile);
	};

	const downloadTemplate = () => {
		const headers = ["regNo", "name", "email", "password", "class", "section"];
		const sampleData = [
			["2024001", "John Doe", "john@example.com", "password123", "10", "A"],
			["2024002", "Jane Smith", "jane@example.com", "password456", "10", "B"],
		];

		const csvContent = [
			headers.join(","),
			...sampleData.map((row) => row.join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "student_upload_template.csv";
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const handleSubmit = async () => {
		if (!file) {
			setError("Please select a file to upload");
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const text = e.target.result;
				const rows = text.split("\n").filter((row) => row.trim());
				const headers = rows[0].split(",").map((h) => h.trim());

				const students = rows.slice(1).map((row) => {
					const values = row.split(",").map((v) => v.trim());
					return {
						regNo: values[0],
						name: values[1],
						email: values[2],
						password: values[3],
						class: values[4],
						section: values[5],
					};
				});

				onUpload(students);
				setFile(null);
				setError("");
			} catch (err) {
				setError("Error parsing file. Please check the format and try again.");
			}
		};

		reader.readAsText(file);
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center overlay-scrim p-4">
			<div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
						Bulk Upload Students
					</h2>
					<button
						onClick={onClose}
						className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="h-6 w-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				<div className="space-y-6">
					{/* Instructions */}
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
						<h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-300">
							Upload Instructions
						</h3>
						<ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
							<li>• Download the template and fill in student details</li>
							<li>• Required columns: regNo, name, email, password, class, section</li>
							<li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
							<li>• Duplicate registration numbers or emails will be skipped</li>
						</ul>
					</div>

					{/* Download Template Button */}
					<button
						onClick={downloadTemplate}
						className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-indigo-500 hover:bg-indigo-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/20"
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
								d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
							/>
						</svg>
						Download Template
					</button>

					{/* File Upload Area */}
					<div
						className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
							dragActive
								? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
								: "border-zinc-300 dark:border-zinc-700"
						}`}
						onDragEnter={handleDrag}
						onDragLeave={handleDrag}
						onDragOver={handleDrag}
						onDrop={handleDrop}
					>
						<input
							id="bulk-student-file-upload"
							name="bulkFile"
							aria-label="Upload students CSV or Excel file"
							type="file"
							accept=".csv,.xlsx,.xls"
							onChange={handleChange}
							className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
						/>

						{file ? (
							<div className="space-y-3">
								<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										className="h-8 w-8 text-green-600 dark:text-green-400"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<div>
									<p className="font-semibold text-zinc-900 dark:text-white">
										{file.name}
									</p>
									<p className="text-sm text-zinc-600 dark:text-zinc-400">
										{(file.size / 1024).toFixed(2)} KB
									</p>
								</div>
								<button
									onClick={(e) => {
										e.stopPropagation();
										setFile(null);
									}}
									className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
								>
									Remove file
								</button>
							</div>
						) : (
							<div className="space-y-3">
								<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										className="h-8 w-8 text-zinc-600 dark:text-zinc-400"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
										/>
									</svg>
								</div>
								<div>
									<p className="font-semibold text-zinc-900 dark:text-white">
										Drag and drop your file here
									</p>
									<p className="text-sm text-zinc-600 dark:text-zinc-400">
										or click to browse
									</p>
								</div>
							</div>
						)}
					</div>

					{error && (
						<div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
							{error}
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
						<button
							onClick={handleSubmit}
							disabled={!file}
							className="flex-1 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Upload Students
						</button>
						<button
							onClick={onClose}
							className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
