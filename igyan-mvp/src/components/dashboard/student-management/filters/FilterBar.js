export default function FilterBar({
	searchQuery,
	setSearchQuery,
	filterClass,
	setFilterClass,
	filterSection,
	setFilterSection,
	uniqueClasses,
	uniqueSections,
	filteredCount,
	totalCount,
	onDownloadCSV,
}) {
	return (
		<div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
			<div className="grid gap-4 sm:grid-cols-4">
				<div className="sm:col-span-2">
					<label htmlFor="student-search-input" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
						Search
					</label>
					<div className="relative">
						<input
							id="student-search-input"
							name="search"
							type="text"
							placeholder="Search by name, reg no, or email..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-lg border border-zinc-300 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
							/>
						</svg>
					</div>
				</div>

				<div>
					<label htmlFor="filter-class-select" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
						Filter by Class
					</label>
					<select
						id="filter-class-select"
						name="class"
						value={filterClass}
						onChange={(e) => setFilterClass(e.target.value)}
						className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
					>
						<option value="">All Classes</option>
						{uniqueClasses.map((cls) => (
							<option key={cls} value={cls}>
								{cls}
							</option>
						))}
					</select>
				</div>

				<div>
					<label htmlFor="filter-section-select" className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
						Filter by Section
					</label>
					<select
						id="filter-section-select"
						name="section"
						value={filterSection}
						onChange={(e) => setFilterSection(e.target.value)}
						className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
					>
						<option value="">All Sections</option>
						{uniqueSections.map((sec) => (
							<option key={sec} value={sec}>
								{sec}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
				<div className="text-sm text-zinc-600 dark:text-zinc-400">
					Showing {filteredCount} of {totalCount} students
				</div>
				<button
					onClick={onDownloadCSV}
					disabled={filteredCount === 0}
					className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
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
					Download CSV
				</button>
			</div>
		</div>
	);
}
