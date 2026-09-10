"use client";

import { useEffect, useState } from "react";
import { aiFetch } from "@/app/utils/ai-fallback";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function IdeaGenerationPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState({
		interests: "",
		industry: "",
		problemArea: "",
		targetAudience: "",
		budget: "low",
		timeframe: "short"
	});
	const [generating, setGenerating] = useState(false);
	const [ideas, setIdeas] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	const industries = [
		"Technology", "Healthcare", "Education", "Finance", "E-commerce",
		"Food & Beverage", "Entertainment", "Fashion", "Real Estate", "Transportation",
		"Agriculture", "Environmental", "Social Impact", "Other"
	];

	const handleSubmit = async (e) => {
		e.preventDefault();
		setGenerating(true);
		setError("");
		setIdeas([]);

		try {
			const prompt = `Generate 3 innovative and practical startup ideas based on the following criteria:

Interests: ${formData.interests}
Industry: ${formData.industry}
Problem Area: ${formData.problemArea}
Target Audience: ${formData.targetAudience}
Budget Level: ${formData.budget}
Timeframe: ${formData.timeframe}

For EACH idea, provide the response in this EXACT JSON format:
{
  "name": "Catchy startup name",
  "tagline": "One compelling sentence",
  "description": "2-3 sentences describing the core concept",
  "targetMarket": "Specific target audience description",
  "revenueStreams": [
    "Revenue stream 1",
    "Revenue stream 2",
    "Revenue stream 3"
  ],
  "initialSteps": [
    "Step 1 with brief description",
    "Step 2 with brief description",
    "Step 3 with brief description",
    "Step 4 with brief description"
  ],
  "challenges": [
    "Challenge 1",
    "Challenge 2",
    "Challenge 3"
  ],
  "successMetrics": [
    {"metric": "Metric name 1", "target": "Specific target"},
    {"metric": "Metric name 2", "target": "Specific target"},
    {"metric": "Metric name 3", "target": "Specific target"}
  ],
  "estimatedCosts": {
    "initial": "Initial investment range",
    "monthly": "Monthly operating costs",
    "breakeven": "Expected breakeven timeline"
  },
  "competitiveAdvantage": "What makes this unique"
}

Return an array of 3 such JSON objects. Make ideas unique, feasible, and exciting. Ensure valid JSON format.`;

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
							content: "You are an expert startup advisor and idea generator. You help aspiring entrepreneurs discover innovative business ideas that are practical, scalable, and aligned with current market trends. Always return valid JSON arrays with detailed, actionable startup ideas."
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
				throw new Error("Failed to generate ideas");
			}

			const data = await response.json();
			const generatedContent = data.choices[0].message.content;
			
			// Parse JSON response
			let parsedData;
			try {
				parsedData = JSON.parse(generatedContent);
				// Handle if the response is wrapped in an object with an "ideas" key
				const ideasArray = Array.isArray(parsedData) ? parsedData : (parsedData.ideas || [parsedData]);
				setIdeas(ideasArray.map((idea, index) => ({ ...idea, id: index })));
			} catch (parseError) {
				console.error("JSON Parse Error:", parseError);
				throw new Error("Failed to parse AI response");
			}
		} catch (err) {
			console.error("Error generating ideas:", err);
			setError("Failed to generate ideas. Please try again.");
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
							<h1 className="text-3xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Startup Idea Generator</h1>
							<p className="mt-1" style={{ color: 'var(--dashboard-muted)' }}>AI-powered tool to discover your next big venture</p>
						</div>
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-2">
					{/* Input Form */}
					<div className="rounded-2xl border p-6 shadow-lg dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
						<h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Tell Us About Your Vision</h2>
						
						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
									Your Interests & Skills
								</label>
								<textarea
									name="interests"
									value={formData.interests}
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
									placeholder="E.g., Technology, coding, design, sustainability..."
									required
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
									Industry
								</label>
								<select
									name="industry"
									value={formData.industry}
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
									required
								>
									<option value="">Select an industry</option>
									{industries.map(ind => (
										<option key={ind} value={ind}>{ind}</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
									Problem You Want to Solve
								</label>
								<textarea
									name="problemArea"
									value={formData.problemArea}
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
									placeholder="What problem do you want to solve?"
									required
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
									Target Audience
								</label>
								<input
									type="text"
									name="targetAudience"
									value={formData.targetAudience}
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
									placeholder="E.g., College students, small businesses..."
									required
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Budget Level
									</label>
									<select
										name="budget"
										value={formData.budget}
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
										<option value="low">Low ($0-$10k)</option>
										<option value="medium">Medium ($10k-$50k)</option>
										<option value="high">High ($50k+)</option>
									</select>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Timeframe
									</label>
									<select
										name="timeframe"
										value={formData.timeframe}
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
										<option value="short">Quick Launch (1-3 months)</option>
										<option value="medium">Medium (3-6 months)</option>
										<option value="long">Long-term (6+ months)</option>
									</select>
								</div>
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
										Generating Ideas...
									</span>
								) : (
									<span className="flex items-center justify-center gap-2">
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
										Generate Ideas
									</span>
								)}
							</button>
						</form>
					</div>

					{/* Results */}
					<div className="rounded-2xl border p-6 shadow-lg dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Your Startup Ideas</h2>
							{ideas.length > 0 && (
								<span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold" style={{
									background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
									color: 'var(--dashboard-primary)'
								}}>
									{ideas.length} {ideas.length === 1 ? 'Idea' : 'Ideas'}
								</span>
							)}
						</div>
						
						{error && (
							<div className="rounded-lg border p-4" style={{
								background: 'rgba(239, 68, 68, 0.1)',
								borderColor: 'rgba(239, 68, 68, 0.4)',
								color: '#ef4444'
							}}>
								{error}
							</div>
						)}

						{ideas.length === 0 && !generating && !error && (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full dashboard-pill">
									<svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
									</svg>
								</div>
								<h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>No ideas generated yet</h3>
								<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>Fill out the form and click "Generate Ideas" to get started!</p>
							</div>
						)}

						{generating && (
							<div className="flex flex-col items-center justify-center py-12">
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent mb-4" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
								<p style={{ color: 'var(--dashboard-muted)' }}>AI is crafting amazing ideas for you...</p>
							</div>
						)}

						{ideas.length > 0 && (
							<div className="space-y-8 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
								{ideas.map((idea, idx) => (
									<div
										key={idea.id}
										className="group rounded-2xl border-2 p-6 shadow-md transition-all hover:shadow-xl dashboard-card"
										style={{ borderColor: 'var(--dashboard-border)' }}
									>
										{/* Header */}
										<div className="mb-6 flex items-start justify-between">
											<div className="flex-1">
												<div className="mb-2 flex items-center gap-3">
													<span className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg" style={{
														background: 'linear-gradient(135deg, var(--dashboard-primary), var(--dashboard-primary-hover))'
													}}>
														{idx + 1}
													</span>
													<div>
														<h3 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
															{idea.name}
														</h3>
														<p className="text-sm italic" style={{ color: 'var(--dashboard-primary)' }}>
															"{idea.tagline}"
														</p>
													</div>
												</div>
											</div>
										</div>

										{/* Description */}
										<div className="mb-6 rounded-xl p-4 dashboard-card-muted">
											<p className="leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>
												{idea.description}
											</p>
										</div>

										{/* Target Market & Competitive Advantage */}
										<div className="mb-6 grid gap-4 sm:grid-cols-2">
											<div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
												<div className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
													<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
													</svg>
													<h4 className="font-semibold">Target Market</h4>
												</div>
												<p className="text-sm text-slate-700 dark:text-slate-300">{idea.targetMarket}</p>
											</div>

											<div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-900/30 dark:bg-green-900/10">
												<div className="mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
													<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
													</svg>
													<h4 className="font-semibold">Competitive Edge</h4>
												</div>
												<p className="text-sm text-slate-700 dark:text-slate-300">{idea.competitiveAdvantage}</p>
											</div>
										</div>

										{/* Revenue Streams */}
										<div className="mb-6">
											<h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
												<svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
												Revenue Streams
											</h4>
											<div className="grid gap-2">
												{idea.revenueStreams?.map((stream, i) => (
													<div key={i} className="flex items-start gap-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/10">
														<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
															{i + 1}
														</span>
														<p className="text-sm text-slate-700 dark:text-slate-300">{stream}</p>
													</div>
												))}
											</div>
										</div>

										{/* Initial Steps */}
										<div className="mb-6">
											<h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
												<svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
												</svg>
												Initial Steps to Launch
											</h4>
											<div className="space-y-3">
												{idea.initialSteps?.map((step, i) => (
													<div key={i} className="flex items-start gap-3">
														<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
															{i + 1}
														</div>
														<div className="flex-1 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/30 dark:bg-indigo-900/10">
															<p className="text-sm text-slate-700 dark:text-slate-300">{step}</p>
														</div>
													</div>
												))}
											</div>
										</div>

										{/* Estimated Costs Table */}
										{idea.estimatedCosts && (
											<div className="mb-6">
												<h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
													<svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
													</svg>
													Financial Overview
												</h4>
												<div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
													<table className="w-full">
														<thead className="bg-slate-100 dark:bg-slate-800">
															<tr>
																<th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Category</th>
																<th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Estimate</th>
															</tr>
														</thead>
														<tbody className="divide-y divide-slate-200 dark:divide-slate-700">
															<tr className="bg-white dark:bg-slate-900">
																<td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">Initial Investment</td>
																<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{idea.estimatedCosts.initial}</td>
															</tr>
															<tr className="bg-slate-50 dark:bg-slate-800/50">
																<td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">Monthly Operating Costs</td>
																<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{idea.estimatedCosts.monthly}</td>
															</tr>
															<tr className="bg-white dark:bg-slate-900">
																<td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">Breakeven Timeline</td>
																<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{idea.estimatedCosts.breakeven}</td>
															</tr>
														</tbody>
													</table>
												</div>
											</div>
										)}

										{/* Success Metrics Table */}
										{idea.successMetrics && (
											<div className="mb-6">
												<h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
													<svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
													</svg>
													Success Metrics (Year 1)
												</h4>
												<div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
													<table className="w-full">
														<thead className="bg-purple-100 dark:bg-purple-900/30">
															<tr>
																<th className="px-4 py-3 text-left text-sm font-semibold text-purple-900 dark:text-purple-300">Metric</th>
																<th className="px-4 py-3 text-left text-sm font-semibold text-purple-900 dark:text-purple-300">Target</th>
															</tr>
														</thead>
														<tbody className="divide-y divide-slate-200 dark:divide-slate-700">
															{idea.successMetrics.map((metric, i) => (
																<tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-800/50"}>
																	<td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{metric.metric}</td>
																	<td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{metric.target}</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										)}

										{/* Challenges */}
										<div>
											<h4 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
												<svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
												</svg>
												Potential Challenges
											</h4>
											<div className="grid gap-2">
												{idea.challenges?.map((challenge, i) => (
													<div key={i} className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900/30 dark:bg-red-900/10">
														<svg className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
														</svg>
														<p className="text-sm text-slate-700 dark:text-slate-300">{challenge}</p>
													</div>
												))}
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
