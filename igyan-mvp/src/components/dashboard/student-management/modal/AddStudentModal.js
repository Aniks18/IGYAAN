export default function AddStudentModal({
	isOpen,
	onClose,
	onSubmit,
	formData,
	setFormData,
	formErrors,
	onAddMore,
	isEditMode = false,
}) {
	if (!isOpen) return null;

	const handleSubmitAndAddMore = (e) => {
		e.preventDefault();
		if (onAddMore) {
			onAddMore(e);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center overlay-scrim p-4">
			<div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
				<div className="mb-6 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
						{isEditMode ? 'Edit Student' : 'Add New Student'}
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

				<form onSubmit={onSubmit} className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<label htmlFor="student-regNo" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Registration Number <span className="text-red-500">*</span>
							</label>
							<input
								id="student-regNo"
								name="regNo"
								type="text"
								value={formData.regNo}
								onChange={(e) =>
									setFormData({ ...formData, regNo: e.target.value })
								}
								className={`w-full rounded-lg border ${
									formErrors.regNo
										? "border-red-500"
										: "border-zinc-300 dark:border-zinc-700"
								} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
								placeholder="e.g., 2024001"
							/>
							{formErrors.regNo && (
								<p className="mt-1 text-xs text-red-500">{formErrors.regNo}</p>
							)}
						</div>

						<div>
							<label htmlFor="student-name" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Full Name <span className="text-red-500">*</span>
							</label>
							<input
								id="student-name"
								name="name"
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className={`w-full rounded-lg border ${
									formErrors.name
										? "border-red-500"
										: "border-zinc-300 dark:border-zinc-700"
								} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
								placeholder="e.g., John Doe"
							/>
							{formErrors.name && (
								<p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
							)}
						</div>

						<div>
							<label htmlFor="student-email" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Email <span className="text-red-500">*</span>
							</label>
							<input
								id="student-email"
								name="email"
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className={`w-full rounded-lg border ${
									formErrors.email
										? "border-red-500"
										: "border-zinc-300 dark:border-zinc-700"
								} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
								placeholder="e.g., john@example.com"
							/>
							{formErrors.email && (
								<p className="mt-1 text-xs text-red-500">{formErrors.email}</p>
							)}
						</div>

						<div>
							<label htmlFor="student-password" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Password {!isEditMode && <span className="text-red-500">*</span>}
								{isEditMode && <span className="text-xs text-zinc-500">(leave empty to keep current)</span>}
							</label>
							<input
								id="student-password"
								name="password"
								type="password"
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
								className={`w-full rounded-lg border ${
									formErrors.password
										? "border-red-500"
										: "border-zinc-300 dark:border-zinc-700"
								} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
								placeholder={isEditMode ? "Enter new password to change" : "Min. 6 characters"}
							/>
							{formErrors.password && (
								<p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
							)}
						</div>

						<div>
							<label htmlFor="student-class" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Class <span className="text-red-500">*</span>
							</label>
							<input
								id="student-class"
								name="class"
								type="text"
								value={formData.class}
								onChange={(e) =>
									setFormData({ ...formData, class: e.target.value })
								}
								className={`w-full rounded-lg border ${
									formErrors.class
										? "border-red-500"
										: "border-zinc-300 dark:border-zinc-700"
								} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
								placeholder="e.g., 10"
							/>
							{formErrors.class && (
								<p className="mt-1 text-xs text-red-500">{formErrors.class}</p>
							)}
						</div>

						<div>
							<label htmlFor="student-section" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Section <span className="text-red-500">*</span>
							</label>
							<input
								id="student-section"
								name="section"
								type="text"
								value={formData.section}
								onChange={(e) =>
									setFormData({ ...formData, section: e.target.value })
								}
								className={`w-full rounded-lg border ${
									formErrors.section
										? "border-red-500"
										: "border-zinc-300 dark:border-zinc-700"
								} bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white`}
								placeholder="e.g., A"
							/>
							{formErrors.section && (
								<p className="mt-1 text-xs text-red-500">{formErrors.section}</p>
							)}
						</div>

						<div>
							<label htmlFor="student-age" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Age
							</label>
							<input
								id="student-age"
								name="age"
								type="number"
								value={formData.age}
								onChange={(e) =>
									setFormData({ ...formData, age: e.target.value })
								}
								className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
								placeholder="e.g., 15"
							/>
						</div>

						<div>
							<label htmlFor="student-house" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								House
							</label>
							<input
								id="student-house"
								name="house"
								type="text"
								value={formData.house}
								onChange={(e) =>
									setFormData({ ...formData, house: e.target.value })
								}
								className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
								placeholder="e.g., Red House"
							/>
						</div>

						<div>
							<label htmlFor="student-classTeacher" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Class Teacher
							</label>
							<input
								id="student-classTeacher"
								name="classTeacher"
								type="text"
								value={formData.classTeacher}
								onChange={(e) =>
									setFormData({ ...formData, classTeacher: e.target.value })
								}
								className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
								placeholder="e.g., Mrs. Smith"
							/>
						</div>

						<div>
							<label htmlFor="student-sleepTime" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Sleep Time
							</label>
							<input
								id="student-sleepTime"
								name="sleepTime"
								type="text"
								value={formData.sleepTime}
								onChange={(e) =>
									setFormData({ ...formData, sleepTime: e.target.value })
								}
								className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
								placeholder="e.g., 10:00 PM"
							/>
						</div>

						<div>
							<label htmlFor="student-weekday-schedule" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Study Schedule (Weekday)
							</label>
							<input
								id="student-weekday-schedule"
								name="studyScheduleWeekday"
								type="text"
								value={formData.studyScheduleWeekday}
								onChange={(e) =>
									setFormData({ ...formData, studyScheduleWeekday: e.target.value })
								}
								className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
								placeholder="e.g., 4 PM - 7 PM"
							/>
						</div>

						<div>
							<label htmlFor="student-weekend-schedule" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Study Schedule (Weekend)
							</label>
							<input
								id="student-weekend-schedule"
								name="studyScheduleWeekend"
								type="text"
								value={formData.studyScheduleWeekend}
								onChange={(e) =>
									setFormData({ ...formData, studyScheduleWeekend: e.target.value })
								}
								className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
								placeholder="e.g., 10 AM - 12 PM"
							/>
						</div>

						<div>
							<label htmlFor="student-schoolBoard" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								School Board
							</label>
							<input
								id="student-schoolBoard"
								name="schoolBoard"
								type="text"
								value={formData.schoolBoard}
								onChange={(e) =>
									setFormData({ ...formData, schoolBoard: e.target.value })
								}
								className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
								placeholder="e.g., CBSE, ICSE"
							/>
						</div>

						<div>
							<label htmlFor="student-learningStyle" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Learning Style
							</label>
							<input
								id="student-learningStyle"
								name="learningStyle"
								type="text"
								value={formData.learningStyle}
								onChange={(e) =>
									setFormData({ ...formData, learningStyle: e.target.value })
								}
								className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
								placeholder="e.g., Visual, Auditory, Kinesthetic"
							/>
						</div>
					</div>

					<div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-700">
						<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Additional Information</h3>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="sm:col-span-2">
								<label htmlFor="student-interests" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Interests <span className="text-xs text-zinc-500">(comma separated)</span>
								</label>
								<input
									id="student-interests"
									name="interests"
									type="text"
									value={formData.interests}
									onChange={(e) =>
										setFormData({ ...formData, interests: e.target.value })
									}
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
									placeholder="e.g., Reading, Sports, Music"
								/>
							</div>

							<div className="sm:col-span-2">
								<label htmlFor="student-strengths" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Strengths <span className="text-xs text-zinc-500">(comma separated)</span>
								</label>
								<input
									id="student-strengths"
									name="strengths"
									type="text"
									value={formData.strengths}
									onChange={(e) =>
										setFormData({ ...formData, strengths: e.target.value })
									}
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
									placeholder="e.g., Mathematics, Problem Solving"
								/>
							</div>

							<div className="sm:col-span-2">
								<label htmlFor="student-growthAreas" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Growth Areas <span className="text-xs text-zinc-500">(comma separated)</span>
								</label>
								<input
									id="student-growthAreas"
									name="growthAreas"
									type="text"
									value={formData.growthAreas}
									onChange={(e) =>
										setFormData({ ...formData, growthAreas: e.target.value })
									}
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
									placeholder="e.g., Time Management, Public Speaking"
								/>
							</div>

							<div className="sm:col-span-2">
								<label htmlFor="student-academicGoals" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Academic Goals <span className="text-xs text-zinc-500">(comma separated)</span>
								</label>
								<input
									id="student-academicGoals"
									name="academicGoals"
									type="text"
									value={formData.academicGoals}
									onChange={(e) =>
										setFormData({ ...formData, academicGoals: e.target.value })
									}
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
									placeholder="e.g., Score 90%+, Improve in Science"
								/>
							</div>

							<div className="sm:col-span-2">
								<label htmlFor="student-favoriteSubjects" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Favorite Subjects <span className="text-xs text-zinc-500">(comma separated)</span>
								</label>
								<input
									id="student-favoriteSubjects"
									name="favoriteSubjects"
									type="text"
									value={formData.favoriteSubjects}
									onChange={(e) =>
										setFormData({ ...formData, favoriteSubjects: e.target.value })
									}
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
									placeholder="e.g., Physics, Mathematics, History"
								/>
							</div>

							<div className="sm:col-span-2">
								<label htmlFor="student-funFact" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Fun Fact
								</label>
								<textarea
									id="student-funFact"
									name="funFact"
									value={formData.funFact}
									onChange={(e) =>
										setFormData({ ...formData, funFact: e.target.value })
									}
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:bg-zinc-800 dark:text-white"
									placeholder="e.g., Can solve Rubik's cube in under 2 minutes"
									rows="2"
								/>
							</div>
						</div>
					</div>

					<div className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
						<div className="flex gap-3">
							<button
								type="submit"
								className="flex-1 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-600"
							>
								{isEditMode ? 'Update Student' : 'Add Student'}
							</button>
							{!isEditMode && (
								<button
									type="button"
									onClick={handleSubmitAndAddMore}
									className="flex-1 rounded-lg border-2 border-indigo-500 px-6 py-3 text-sm font-semibold text-indigo-500 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
								>
									Add & Add More
								</button>
							)}
						</div>
						<button
							type="button"
							onClick={onClose}
							className="w-full rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
