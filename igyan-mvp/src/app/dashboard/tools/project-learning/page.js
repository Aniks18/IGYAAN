"use client";

import { useEffect, useState } from "react";
import { aiFetch } from "@/app/utils/ai-fallback";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function ProjectLearningPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState({
		topic: "",
		skillLevel: "beginner",
		duration: "1-2 weeks",
		interests: "",
		goals: ""
	});
	const [generating, setGenerating] = useState(false);
	const [projects, setProjects] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setGenerating(true);
		setError("");
		setProjects(null);

		try {
			const prompt = `Generate 3 personalized project recommendations for a student based on the following:

Topic/Subject: ${formData.topic}
Skill Level: ${formData.skillLevel}
Available Time: ${formData.duration}
Interests: ${formData.interests || "General learning"}
Learning Goals: ${formData.goals || "Practical hands-on experience"}

Return a JSON object with this EXACT structure:
{
  "topic": "${formData.topic}",
  "recommendedProjects": [
    {
      "title": "Project name",
      "difficulty": "Beginner/Intermediate/Advanced",
      "duration": "Estimated time (e.g., 1-2 weeks)",
      "description": "Brief overview of the project (2-3 sentences)",
      "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"],
      "requirements": {
        "skills": ["Skill 1", "Skill 2"],
        "tools": ["Tool 1", "Tool 2"],
        "prerequisites": ["Prerequisite 1", "Prerequisite 2"]
      },
      "phases": [
        {
          "phase": "Phase 1",
          "title": "Phase title",
          "tasks": ["Task 1", "Task 2", "Task 3"],
          "estimatedTime": "Time estimate"
        }
      ],
      "resources": [
        {"name": "Resource name", "type": "Tutorial/Documentation/Video", "url": "https://example.com"},
        {"name": "Resource name", "type": "Tutorial/Documentation/Video", "url": "https://example.com"}
      ],
      "challenges": ["Challenge 1", "Challenge 2"],
      "extensions": ["Extension idea 1", "Extension idea 2"],
      "matchScore": 95
    }
  ],
  "generalTips": ["Tip 1", "Tip 2", "Tip 3"],
  "skillsToLearn": ["Skill 1", "Skill 2", "Skill 3"]
}

Guidelines:
- Projects should match ${formData.skillLevel} level
- Make projects achievable within ${formData.duration}
- Include 3-5 learning outcomes per project
- Provide 3-4 phases with clear tasks
- Add 3-5 relevant learning resources with real URLs
- Order projects by matchScore (highest to lowest)
- Make projects practical and engaging
- Include real, working URLs to educational resources

Return ONLY valid JSON.`;

			const response = await aiFetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-4o",
					messages: [
						{
							role: "system",
							content: "You are an expert educational advisor specializing in project-based learning. You create personalized, practical project recommendations that help students learn through hands-on experience. Always return valid JSON with detailed, actionable project plans."
						},
						{
							role: "user",
							content: prompt
						}
					],
					temperature: 0.8,
					max_tokens: 4000,
					response_format: { type: "json_object" }
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate project recommendations");
			}

			const data = await response.json();
			const parsedProjects = JSON.parse(data.choices[0].message.content);
			setProjects(parsedProjects);
		} catch (err) {
			console.error("Error generating projects:", err);
			setError("Failed to generate project recommendations. Please try again.");
		} finally {
			setGenerating(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center" style={{ background: 'var(--dashboard-background)' }}>
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ background: 'var(--dashboard-background)' }}>
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-4">
						<button
							onClick={() => router.back()}
							className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
							style={{
								borderColor: 'var(--dashboard-border)',
								background: 'var(--dashboard-surface-solid)',
								color: 'var(--dashboard-text)'
							}}
							onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
							onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div>
							<h1 className="text-3xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Project-Based Learning</h1>
							<p className="mt-1" style={{ color: 'var(--dashboard-muted)' }}>Discover the perfect projects to accelerate your learning journey</p>
						</div>
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-3">
					{/* Input Form */}
					<div className="lg:col-span-1">
						<div className="rounded-2xl border p-6 shadow-lg dashboard-card sticky top-8" style={{ borderColor: 'var(--dashboard-border)' }}>
							<h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Your Learning Profile</h2>
							
							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Topic/Subject <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										name="topic"
										value={formData.topic}
										onChange={handleInputChange}
										className="w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 placeholder:opacity-60"
										style={{
											borderColor: 'var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
										onFocus={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-primary)';
											e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)';
										}}
										onBlur={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-border)';
											e.currentTarget.style.boxShadow = 'none';
										}}
										placeholder="E.g., Web Development, Data Science..."
										required
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Current Skill Level
									</label>
									<select
										name="skillLevel"
										value={formData.skillLevel}
										onChange={handleInputChange}
										className="w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2"
										style={{
											borderColor: 'var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
										onFocus={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-primary)';
											e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)';
										}}
										onBlur={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-border)';
											e.currentTarget.style.boxShadow = 'none';
										}}
									>
										<option value="beginner">Beginner</option>
										<option value="intermediate">Intermediate</option>
										<option value="advanced">Advanced</option>
									</select>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Available Time
									</label>
									<select
										name="duration"
										value={formData.duration}
										onChange={handleInputChange}
										className="w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2"
										style={{
											borderColor: 'var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
										onFocus={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-primary)';
											e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)';
										}}
										onBlur={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-border)';
											e.currentTarget.style.boxShadow = 'none';
										}}
									>
										<option value="1-2 weeks">1-2 weeks</option>
										<option value="2-4 weeks">2-4 weeks</option>
										<option value="1-2 months">1-2 months</option>
										<option value="2+ months">2+ months</option>
									</select>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Your Interests (Optional)
									</label>
									<input
										type="text"
										name="interests"
										value={formData.interests}
										onChange={handleInputChange}
										className="w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 placeholder:opacity-60"
										style={{
											borderColor: 'var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
										onFocus={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-primary)';
											e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)';
										}}
										onBlur={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-border)';
											e.currentTarget.style.boxShadow = 'none';
										}}
										placeholder="E.g., gaming, social media, automation..."
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Learning Goals (Optional)
									</label>
									<textarea
										name="goals"
										value={formData.goals}
										onChange={handleInputChange}
										rows={3}
										className="w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 placeholder:opacity-60"
										style={{
											borderColor: 'var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
										onFocus={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-primary)';
											e.currentTarget.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)';
										}}
										onBlur={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-border)';
											e.currentTarget.style.boxShadow = 'none';
										}}
										placeholder="What do you want to achieve?"
									/>
								</div>

								<button
									type="submit"
									disabled={generating}
									className="w-full rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
									style={{
										background: 'linear-gradient(to right, var(--dashboard-primary), var(--dashboard-primary-hover))'
									}}
									onMouseEnter={(e) => !generating && (e.currentTarget.style.transform = 'translateY(-1px)')}
									onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
								>
									{generating ? (
										<span className="flex items-center justify-center gap-2">
											<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
											</svg>
											Finding Projects...
										</span>
									) : (
										<span className="flex items-center justify-center gap-2">
											<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
											</svg>
											Find Projects
										</span>
									)}
								</button>
							</form>
						</div>
					</div>

					{/* Results */}
					<div className="lg:col-span-2">
						{error && (
							<div className="rounded-lg border p-4 mb-6" style={{
								background: 'rgba(239, 68, 68, 0.1)',
								borderColor: 'rgba(239, 68, 68, 0.4)',
								color: '#ef4444'
							}}>
								{error}
							</div>
						)}

						{!projects && !generating && !error && (
							<div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
								<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full dashboard-pill">
									<svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
									</svg>
								</div>
								<h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Ready to Start Learning?</h3>
								<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>Fill in your details and get personalized project recommendations!</p>
							</div>
						)}

						{generating && (
							<div className="flex flex-col items-center justify-center py-20 rounded-2xl border dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent mb-4" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
								<p style={{ color: 'var(--dashboard-muted)' }}>AI is finding the perfect projects for you...</p>
							</div>
						)}

						{projects && (
							<div className="space-y-6">
								{/* General Tips */}
								{projects.generalTips && (
									<div className="rounded-2xl border border-blue-200 bg-linear-to-br from-blue-50 to-cyan-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20">
										<div className="flex items-start gap-3">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
												<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
											</div>
											<div className="flex-1">
												<h3 className="font-bold text-slate-900 dark:text-white mb-2">💡 Learning Tips</h3>
												<ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
													{projects.generalTips.map((tip, idx) => (
														<li key={idx} className="flex items-start gap-2">
															<span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
															<span>{tip}</span>
														</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								)}

								{/* Skills to Learn */}
								{projects.skillsToLearn && (
									<div className="rounded-2xl border border-purple-200 bg-linear-to-br from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20">
										<h3 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
											<span className="text-xl">🎯</span>
											Skills You'll Develop
										</h3>
										<div className="flex flex-wrap gap-2">
											{projects.skillsToLearn.map((skill, idx) => (
												<span key={idx} className="rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
													{skill}
												</span>
											))}
										</div>
									</div>
								)}

								{/* Project Cards */}
								{projects.recommendedProjects?.map((project, idx) => (
									<div key={idx} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-700 dark:bg-slate-800">
										{/* Project Header */}
										<div className="mb-6">
											<div className="flex items-start justify-between mb-3">
												<div className="flex items-center gap-3">
													<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-500 text-white font-bold text-xl">
														#{idx + 1}
													</div>
													<div>
														<h3 className="text-2xl font-bold text-slate-900 dark:text-white">{project.title}</h3>
														<div className="flex items-center gap-3 mt-1">
															<span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
																project.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
																project.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
																'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
															}`}>
																{project.difficulty}
															</span>
															<span className="text-sm text-slate-600 dark:text-slate-400">⏱️ {project.duration}</span>
														</div>
													</div>
												</div>
												<div className="text-right">
													<div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{project.matchScore}%</div>
													<div className="text-xs text-slate-500 dark:text-slate-400">Match Score</div>
												</div>
											</div>
											<p className="text-slate-700 dark:text-slate-300 leading-relaxed">{project.description}</p>
										</div>

										{/* Learning Outcomes */}
										<div className="mb-6">
											<h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
												<span className="text-green-600 dark:text-green-400">✓</span>
												What You'll Learn
											</h4>
											<div className="grid gap-2 sm:grid-cols-2">
												{project.learningOutcomes?.map((outcome, i) => (
													<div key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
														<span className="text-green-600 dark:text-green-400 mt-0.5">→</span>
														<span>{outcome}</span>
													</div>
												))}
											</div>
										</div>

										{/* Requirements */}
										<div className="mb-6 grid gap-4 sm:grid-cols-3">
											<div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
												<h5 className="font-bold text-blue-900 dark:text-blue-300 mb-2 text-sm">Skills Needed</h5>
												<ul className="space-y-1">
													{project.requirements?.skills?.map((skill, i) => (
														<li key={i} className="text-xs text-blue-700 dark:text-blue-400">• {skill}</li>
													))}
												</ul>
											</div>
											<div className="rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
												<h5 className="font-bold text-purple-900 dark:text-purple-300 mb-2 text-sm">Tools Required</h5>
												<ul className="space-y-1">
													{project.requirements?.tools?.map((tool, i) => (
														<li key={i} className="text-xs text-purple-700 dark:text-purple-400">• {tool}</li>
													))}
												</ul>
											</div>
											<div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
												<h5 className="font-bold text-amber-900 dark:text-amber-300 mb-2 text-sm">Prerequisites</h5>
												<ul className="space-y-1">
													{project.requirements?.prerequisites?.map((prereq, i) => (
														<li key={i} className="text-xs text-amber-700 dark:text-amber-400">• {prereq}</li>
													))}
												</ul>
											</div>
										</div>

										{/* Project Phases */}
										<div className="mb-6">
											<h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
												<span className="text-indigo-600 dark:text-indigo-400">📋</span>
												Project Roadmap
											</h4>
											<div className="space-y-3">
												{project.phases?.map((phase, i) => (
													<div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
														<div className="flex items-center gap-2 mb-2">
															<span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
																{i + 1}
															</span>
															<h5 className="font-bold text-slate-900 dark:text-white">{phase.title}</h5>
															<span className="ml-auto text-xs text-slate-500 dark:text-slate-400">{phase.estimatedTime}</span>
														</div>
														<ul className="ml-8 space-y-1">
															{phase.tasks?.map((task, j) => (
																<li key={j} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
																	<span className="text-indigo-600 dark:text-indigo-400 mt-0.5">▸</span>
																	<span>{task}</span>
																</li>
															))}
														</ul>
													</div>
												))}
											</div>
										</div>

										{/* Resources */}
										<div className="mb-6">
											<h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
												<span className="text-cyan-600 dark:text-cyan-400">📚</span>
												Learning Resources
											</h4>
											<div className="grid gap-3 sm:grid-cols-2">
												{project.resources?.map((resource, i) => (
													<a
														key={i}
														href={resource.url}
														target="_blank"
														rel="noopener noreferrer"
														className="group flex items-start gap-3 rounded-lg border border-cyan-200 bg-cyan-50 p-3 transition-all hover:border-cyan-300 hover:shadow-md dark:border-cyan-800 dark:bg-cyan-900/20 dark:hover:border-cyan-700"
													>
														<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white text-xs font-bold">
															{resource.type[0]}
														</div>
														<div className="flex-1 min-w-0">
															<div className="font-semibold text-cyan-900 dark:text-cyan-300 text-sm truncate">
																{resource.name}
															</div>
															<div className="text-xs text-cyan-700 dark:text-cyan-400">{resource.type}</div>
														</div>
														<svg className="h-4 w-4 text-cyan-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
														</svg>
													</a>
												))}
											</div>
										</div>

										{/* Challenges & Extensions */}
										<div className="grid gap-4 sm:grid-cols-2">
											<div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
												<h5 className="font-bold text-red-900 dark:text-red-300 mb-3 text-sm flex items-center gap-2">
													<span>⚠️</span>
													Potential Challenges
												</h5>
												<ul className="space-y-2">
													{project.challenges?.map((challenge, i) => (
														<li key={i} className="text-xs text-red-700 dark:text-red-400 flex items-start gap-2">
															<span className="mt-0.5">•</span>
															<span>{challenge}</span>
														</li>
													))}
												</ul>
											</div>
											<div className="rounded-lg bg-emerald-50 p-4 dark:bg-emerald-900/20">
												<h5 className="font-bold text-emerald-900 dark:text-emerald-300 mb-3 text-sm flex items-center gap-2">
													<span>🚀</span>
													Extension Ideas
												</h5>
												<ul className="space-y-2">
													{project.extensions?.map((extension, i) => (
														<li key={i} className="text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
															<span className="mt-0.5">•</span>
															<span>{extension}</span>
														</li>
													))}
												</ul>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
