"use client";

import { useEffect, useMemo, useState } from "react";
import { aiFetch } from "@/app/utils/ai-fallback";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const DETAIL_LEVEL_COPY = {
	quickstart: "Deliver a compact 4-step guide focused on essential actions and momentum.",
	standard: "Deliver a balanced 5-7 step guide with context, actions, and guidance.",
	deepdive: "Deliver an in-depth 7-9 step guide with detailed explanations, decision points, and best practices."
};

export default function StepByStepGuidePage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState({
		topic: "",
		goal: "",
		audience: "self",
		timeframe: "1-2 weeks",
		detailLevel: "standard",
		constraints: ""
	});
	const [guide, setGuide] = useState(null);
	const [generating, setGenerating] = useState(false);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(timer);
	}, [copied]);

	const audienceOptions = useMemo(() => [
		{ value: "self", label: "Personal Learning" },
		{ value: "students", label: "Students/Class" },
		{ value: "team", label: "Team/Collaborative" },
		{ value: "client", label: "Client Delivery" }
	], []);

	const timeframeOptions = useMemo(() => [
		"1-2 days",
		"3-5 days",
		"1-2 weeks",
		"3-4 weeks",
		"1-2 months"
	], []);

	const detailLevelOptions = useMemo(() => ([
		{ value: "quickstart", label: "Quickstart" },
		{ value: "standard", label: "Standard" },
		{ value: "deepdive", label: "Deep Dive" }
	]), []);

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const formatGuideForClipboard = (data) => {
		if (!data) return "";
		const lines = [
			`Topic: ${data.topic}`,
			`Goal: ${data.overview?.goal}`,
			`Summary: ${data.overview?.summary}`,
			`Estimated Duration: ${data.overview?.estimatedDuration}`,
			`Difficulty: ${data.overview?.difficulty}`,
			"",
			"Prerequisites:",
			...(data.prerequisites?.length ? data.prerequisites.map((item, idx) => `${idx + 1}. ${item}`) : ["None specified"]),
			"",
			"Materials:",
			...(data.materials?.length ? data.materials.map((item, idx) => `${idx + 1}. ${item}`) : ["No special materials required"]),
			"",
			"Steps:"
		];

		data.steps?.forEach((step) => {
			lines.push(`${step.stepNumber}. ${step.title}`);
			if (step.objective) lines.push(`   Objective: ${step.objective}`);
			if (step.description) lines.push(`   Details: ${step.description}`);
			if (step.actions?.length) {
				lines.push("   Actions:");
				step.actions.forEach((action, index) => {
					lines.push(`      - ${action}`);
				});
			}
			if (step.tips?.length) {
				lines.push("   Tips:");
				step.tips.forEach((tip) => {
					lines.push(`      • ${tip}`);
				});
			}
			if (step.deliverables?.length) {
				lines.push("   Deliverables:");
				step.deliverables.forEach((deliverable) => {
					lines.push(`      • ${deliverable}`);
				});
			}
			if (step.estimatedTime) lines.push(`   Estimated Time: ${step.estimatedTime}`);
			lines.push("");
		});

		if (data.followUp?.nextActions?.length) {
			lines.push("Next Actions:");
			data.followUp.nextActions.forEach((action, idx) => {
				lines.push(`   ${idx + 1}. ${action}`);
			});
			lines.push("");
		}

		if (data.followUp?.successMetrics?.length) {
			lines.push("Success Metrics:");
			data.followUp.successMetrics.forEach((metric, idx) => {
				lines.push(`   ${idx + 1}. ${metric}`);
			});
			lines.push("");
		}

		if (data.followUp?.pitfalls?.length) {
			lines.push("Pitfalls to Avoid:");
			data.followUp.pitfalls.forEach((item, idx) => {
				lines.push(`   ${idx + 1}. ${item}`);
			});
			lines.push("");
		}

		if (data.resources?.length) {
			lines.push("Resources:");
			data.resources.forEach((resource, idx) => {
				lines.push(`   ${idx + 1}. ${resource.name} (${resource.type}) - ${resource.url}`);
			});
			lines.push("");
		}

		return lines.join("\n");
	};

	const copyGuide = () => {
		if (!guide) return;
		navigator.clipboard.writeText(formatGuideForClipboard(guide));
		setCopied(true);
	};

	const downloadGuide = () => {
		if (!guide) return;
		const blob = new Blob([JSON.stringify(guide, null, 2)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `${guide.topic?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "step-by-step-guide"}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setGenerating(true);
		setError("");
		setGuide(null);

		const goalText = formData.goal?.trim() || "Develop practical understanding";
		const constraintsText = formData.constraints?.trim() || "";
		const audienceLabel = audienceOptions.find((option) => option.value === formData.audience)?.label || "Personal Learning";

		const prompt = `Create a clear, actionable step-by-step guide in JSON format.

Topic: ${formData.topic}
Audience: ${audienceLabel}
Primary Goal: ${goalText}
Desired Timeframe: ${formData.timeframe}
Detail Expectation: ${DETAIL_LEVEL_COPY[formData.detailLevel]}
Constraints or Special Notes: ${constraintsText || "None"}

Instructions:
- Tailor the tone for ${audienceLabel.toLowerCase()}.
- Align depth and pacing to ${formData.timeframe} and ${formData.detailLevel} expectations.
- Provide a sequence of steps that progressively builds understanding and output.
- Use practical, realistic language and include hands-on actions.
- Include checkpoints, deliverables, and reminders to verify progress.
- Recommend credible, accessible resources with working URLs.
- Keep the plan feasible for the stated timeframe.
- Avoid placeholder text; use concrete advice.

Return the response in this EXACT JSON format:
{
  "topic": "Topic name",
  "overview": {
    "goal": "Primary goal",
    "summary": "Brief summary",
    "estimatedDuration": "e.g., 2-3 weeks",
    "difficulty": "Beginner/Intermediate/Advanced",
    "keyOutcome": "What will be achieved (optional)"
  },
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "materials": ["Material 1", "Material 2"],
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "objective": "What this step achieves",
      "description": "Detailed description (optional)",
      "actions": ["Action 1", "Action 2"],
      "tips": ["Tip 1", "Tip 2"],
      "deliverables": ["Deliverable 1"],
      "estimatedTime": "e.g., 2-3 days"
    }
  ],
  "checkpoints": ["Checkpoint 1", "Checkpoint 2"],
  "resources": [
    {
      "name": "Resource name",
      "type": "Article/Video/Tool/Course",
      "url": "https://example.com",
      "description": "Brief description"
    }
  ],
  "followUp": {
    "nextActions": ["Action 1", "Action 2"],
    "successMetrics": ["Metric 1", "Metric 2"],
    "pitfalls": ["Pitfall 1", "Pitfall 2"]
  }
}

Provide ONLY valid JSON, no additional commentary.`;

		try {
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
							content: "You are an instructional design expert who creates precise, motivating step-by-step plans for learners and teams. Always return valid JSON responses that are grounded in achievable actions."
						},
						{
							role: "user",
							content: prompt
						}
					],
					temperature: 0.7,
					max_tokens: 3200,
					response_format: { type: "json_object" }
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate guide");
			}

			const data = await response.json();
			const generatedContent = data.choices[0].message.content;
			
			// Parse JSON response
			let parsedData;
			try {
				parsedData = JSON.parse(generatedContent);
				setGuide(parsedData);
			} catch (parseError) {
				console.error("JSON Parse Error:", parseError);
				throw new Error("Failed to parse AI response");
			}
		} catch (err) {
			console.error("Error generating guide:", err);
			setError("Failed to generate guide. Please try again.");
		} finally {
			setGenerating(false);
		}
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div className="dashboard-theme min-h-screen">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<div className="mb-8 flex items-center gap-3">
					<button
						onClick={() => router.back()}
						className="dashboard-card flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:scale-105"
					>
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
				</button>
				<div>
					<h1 className="text-3xl font-bold" style={{ color: "var(--dashboard-heading)" }}>Learning Journey Architect</h1>
					<p className="mt-1 text-sm sm:text-base" style={{ color: "var(--dashboard-muted)" }}>Shape immersive, theme-aligned playbooks that translate intent into confident execution.</p>
				</div>
			</div>				<div className="grid gap-8 lg:grid-cols-3">
					<div className="lg:col-span-1">
					<div className="dashboard-card sticky top-6 rounded-2xl p-6">
						<h2 className="mb-6 text-xl font-bold" style={{ color: "var(--dashboard-heading)" }}>Blueprint Inputs</h2>
						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label className="mb-2 block text-sm font-medium" style={{ color: "var(--dashboard-muted)" }}>
									Focus Area <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="topic"
									value={formData.topic}
									onChange={handleInputChange}
									className="w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 placeholder:opacity-60"
									style={{ 
										backgroundColor: "var(--dashboard-surface-solid)",
										borderColor: "var(--dashboard-border)",
										color: "var(--dashboard-text)",
										"--tw-ring-color": "color-mix(in srgb, var(--dashboard-primary) 50%, transparent)"
									}}
									placeholder="E.g., Launch a student podcast, onboard a new teacher..."
									required
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium" style={{ color: "var(--dashboard-muted)" }}>
									Desired Outcome
								</label>
								<textarea
									name="goal"
									value={formData.goal}
									onChange={handleInputChange}
									rows={3}
									className="w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 placeholder:opacity-60"
									style={{ 
										backgroundColor: "var(--dashboard-surface-solid)",
										borderColor: "var(--dashboard-border)",
										color: "var(--dashboard-text)",
										"--tw-ring-color": "color-mix(in srgb, var(--dashboard-primary) 50%, transparent)"
									}}
									placeholder="What does success look like for this blueprint?"
								/>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: "var(--dashboard-muted)" }}>
										Audience Lens
									</label>
									<select
										name="audience"
										value={formData.audience}
										onChange={handleInputChange}
										className="w-full rounded-lg border px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2"
										style={{ 
											backgroundColor: "var(--dashboard-surface-solid)",
											borderColor: "var(--dashboard-border)",
											color: "var(--dashboard-text)",
											"--tw-ring-color": "color-mix(in srgb, var(--dashboard-primary) 50%, transparent)"
										}}
									>
										{audienceOptions.map((option) => (
											<option key={option.value} value={option.value}>
												{option.label}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: "var(--dashboard-muted)" }}>
										Target Duration
									</label>
									<select
										name="timeframe"
										value={formData.timeframe}
										onChange={handleInputChange}
										className="w-full rounded-lg border px-4 py-2 text-sm transition-all focus:outline-none focus:ring-2"
										style={{ 
											backgroundColor: "var(--dashboard-surface-solid)",
											borderColor: "var(--dashboard-border)",
											color: "var(--dashboard-text)",
											"--tw-ring-color": "color-mix(in srgb, var(--dashboard-primary) 50%, transparent)"
										}}
									>
										{timeframeOptions.map((option) => (
											<option key={option} value={option}>
												{option}
											</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium" style={{ color: "var(--dashboard-muted)" }}>
									Depth Profile
								</label>
								<div className="grid grid-cols-3 gap-2">
									{detailLevelOptions.map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => setFormData((prev) => ({ ...prev, detailLevel: option.value }))}
											className={`rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
												formData.detailLevel === option.value
													? "dashboard-button transform scale-105"
													: "dashboard-card hover:scale-105"
											}`}
										>
											{option.label}
										</button>
									))}
								</div>
								<p className="mt-2 text-xs" style={{ color: "var(--dashboard-muted)" }}>{DETAIL_LEVEL_COPY[formData.detailLevel]}</p>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium" style={{ color: "var(--dashboard-muted)" }}>
									Constraints &amp; Context
								</label>
								<textarea
									name="constraints"
									value={formData.constraints}
									onChange={handleInputChange}
									rows={3}
									className="w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 placeholder:opacity-60"
									style={{ 
										backgroundColor: "var(--dashboard-surface-solid)",
										borderColor: "var(--dashboard-border)",
										color: "var(--dashboard-text)",
										"--tw-ring-color": "color-mix(in srgb, var(--dashboard-primary) 50%, transparent)"
									}}
									placeholder="Tools on hand, dependencies, constraints to respect..."
								/>
							</div>								<button
									type="submit"
									disabled={generating || !formData.topic.trim()}
										className="dashboard-button w-full rounded-lg px-6 py-3 font-semibold shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
								>
									{generating ? (
										<span className="flex items-center justify-center gap-2">
											<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
											</svg>
												Assembling...
										</span>
									) : (
										<span className="flex items-center justify-center gap-2">
											<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8m-4 0v-8m5.875-6.125l2.25-2.25a1.5 1.5 0 00-2.121-2.121l-2.25 2.25M4 13l-1.5 1.5" />
											</svg>
												Build Blueprint
										</span>
									)}
								</button>
							</form>
						</div>
					</div>

					<div className="lg:col-span-2">
						{error && (
							<div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dashboard-card-muted">
								{error}
							</div>
						)}

						{!guide && !generating && !error && (
							<div className="dashboard-card flex flex-col items-center justify-center rounded-2xl px-8 py-20 text-center">
							<div className="dashboard-pill mb-4 flex h-20 w-20 items-center justify-center rounded-full">
								<svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
								</svg>
							</div>
							<h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Blueprint ready when you are</h3>
							<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>Complete the inputs on the left and we will orchestrate a guided journey for you.</p>
							</div>
						)}

						{generating && (
					<div className="dashboard-card flex flex-col items-center justify-center rounded-2xl px-8 py-20 text-center">
						<div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
						<p style={{ color: "var(--dashboard-muted)" }}>AI is composing your personalized blueprint...</p>
					</div>
						)}

					{guide && (
						<div className="space-y-6">
							<div className="dashboard-card flex flex-wrap items-center justify-between gap-3 rounded-2xl p-6">
								<div>
									<h2 className="text-2xl font-bold" style={{ color: "var(--dashboard-heading)" }}>{guide.topic}</h2>
									<p className="mt-1" style={{ color: "var(--dashboard-muted)" }}>{guide.overview?.summary}</p>
								</div>
									<div className="flex flex-wrap gap-2">
										<div className="dashboard-pill rounded-xl px-3 py-1 text-xs font-semibold">
											Duration: {guide.overview?.estimatedDuration}
										</div>
										<div className="dashboard-pill rounded-xl px-3 py-1 text-xs font-semibold">
											Difficulty: {guide.overview?.difficulty}
										</div>
										{guide.overview?.goal && (
											<div className="dashboard-pill rounded-xl px-3 py-1 text-xs font-semibold">
												Goal: {guide.overview.goal}
											</div>
										)}
									</div>
								</div>

								<div className="flex flex-wrap items-center gap-3">
									<button
										onClick={copyGuide}
										className="dashboard-card inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:scale-105"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
										{copied ? "Copied!" : "Copy Blueprint"}
									</button>
									<button
										onClick={downloadGuide}
										className="dashboard-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										Export JSON
									</button>
								</div>

								{(guide.prerequisites?.length || guide.materials?.length) && (
									<div className="grid gap-4 md:grid-cols-2">
									{guide.prerequisites?.length ? (
										<div className="dashboard-card-muted rounded-2xl p-6">
											<h3 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--dashboard-heading)" }}>Readiness Checklist</h3>
											<ul className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--dashboard-muted)" }}>
													{guide.prerequisites.map((item, idx) => (
														<li key={idx} className="flex gap-2">
															<span>•</span>
															<span>{item}</span>
														</li>
													))}
												</ul>
											</div>
										) : null}

									{guide.materials?.length ? (
										<div className="dashboard-card-muted rounded-2xl p-6">
											<h3 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--dashboard-heading)" }}>Resources on Hand</h3>
											<ul className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--dashboard-muted)" }}>
													{guide.materials.map((item, idx) => (
														<li key={idx} className="flex gap-2">
															<span>•</span>
															<span>{item}</span>
														</li>
													))}
												</ul>
											</div>
										) : null}
									</div>
								)}

							<div className="dashboard-card rounded-2xl p-6">
								<h3 className="mb-6 text-lg font-bold" style={{ color: "var(--dashboard-heading)" }}>Milestone Roadmap</h3>
								<div className="relative">
										<div className="absolute left-4 top-0 h-full w-0.5" style={{ backgroundColor: 'var(--dashboard-primary)', opacity: 0.3 }}></div>
										<div className="space-y-6">
											{guide.steps.map((step) => (
												<div key={step.stepNumber} className="relative flex gap-6 pl-10">
													<div className="dashboard-button absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-lg">
														{step.stepNumber}
													</div>
											<div className="dashboard-card-muted flex-1 rounded-xl p-5">
												<div className="flex flex-wrap items-center justify-between gap-3">
													<h4 className="text-lg font-semibold" style={{ color: "var(--dashboard-heading)" }}>{step.title}</h4>
													{step.estimatedTime && (
																<span className="dashboard-pill rounded-full px-3 py-1 text-xs font-semibold">{step.estimatedTime}</span>
															)}
														</div>
														{step.objective && (
															<p className="theme-muted mt-3 text-sm leading-relaxed">
																<span className="font-semibold" style={{ color: "var(--dashboard-heading)" }}>Objective:</span>{" "}
																{step.objective}
															</p>
														)}
														{step.description && (
															<p className="theme-muted mt-2 text-sm leading-relaxed">{step.description}</p>
														)}
														{step.actions?.length && (
															<div
																className="mt-4 rounded-lg border border-dashed p-4"
																style={{ borderColor: "color-mix(in srgb, var(--dashboard-primary) 35%, transparent)" }}
															>
																<h5 className="theme-heading text-xs font-bold uppercase tracking-wide">Action Steps</h5>
																<ul className="mt-2 space-y-2 text-sm leading-relaxed theme-muted">
																	{step.actions.map((action, idx) => (
																		<li key={idx} className="flex gap-2">
																			<span aria-hidden="true" style={{ color: "var(--dashboard-heading)" }}>•</span>
																			<span>{action}</span>
																		</li>
																	))}
																</ul>
															</div>
														)}
														{step.deliverables?.length && (
															<div
																className="mt-4 rounded-lg border border-dashed p-4"
																style={{ borderColor: "color-mix(in srgb, var(--dashboard-primary) 20%, transparent)" }}
															>
																<h5 className="theme-heading text-xs font-bold uppercase tracking-wide">Proof Points</h5>
																<ul className="mt-2 space-y-1 text-sm leading-relaxed theme-muted">
																	{step.deliverables.map((deliverable, idx) => (
																		<li key={idx} className="flex gap-2">
																			<span aria-hidden="true" style={{ color: "var(--dashboard-heading)" }}>✓</span>
																			<span>{deliverable}</span>
																		</li>
																	))}
																</ul>
															</div>
														)}
														{step.tips?.length && (
															<div
																className="mt-4 rounded-xl border p-4"
																style={{
																	backgroundColor: "color-mix(in srgb, var(--dashboard-primary) 8%, transparent)",
																	borderColor: "color-mix(in srgb, var(--dashboard-primary) 38%, transparent)"
																}}
															>
																<h5 className="theme-heading text-sm font-semibold">Expert Signals</h5>
																<ul className="mt-1 space-y-1 text-sm leading-relaxed theme-muted">
																	{step.tips.map((tip, idx) => (
																		<li key={idx} className="flex gap-2">
																			<span aria-hidden="true" style={{ color: "var(--dashboard-heading)" }}>•</span>
																			<span>{tip}</span>
																		</li>
																	))}
																</ul>
															</div>
														)}
													</div>
												</div>
											))}
									</div>
								</div>
							</div>

								{(guide.checkpoints?.length || guide.followUp) && (
									<div className="grid gap-4 md:grid-cols-2">
									{guide.checkpoints?.length ? (
										<div className="dashboard-card rounded-2xl p-6">
											<h3 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--dashboard-heading)" }}>Progress Checks</h3>
											<ul className="space-y-2 text-sm leading-relaxed" style={{ color: "var(--dashboard-muted)" }}>
													{guide.checkpoints.map((checkpoint, idx) => (
														<li key={idx} className="flex gap-2">
															<span aria-hidden="true" style={{ color: "var(--dashboard-heading)" }}>•</span>
															<span>{checkpoint}</span>
														</li>
													))}
												</ul>
											</div>
										) : null}

									{guide.followUp && (
										<div className="dashboard-card rounded-2xl p-6">
											<h3 className="mb-3 text-sm font-bold uppercase tracking-wide" style={{ color: "var(--dashboard-heading)" }}>Momentum Builder</h3>
											<div className="space-y-4 text-sm leading-relaxed" style={{ color: "var(--dashboard-muted)" }}>
												{guide.followUp.nextActions?.length && (
													<div>
														<h4 className="text-sm font-semibold" style={{ color: "var(--dashboard-heading)" }}>Next Moves</h4>
														<ul className="mt-2 space-y-1">
																{guide.followUp.nextActions.map((action, idx) => (
																	<li key={idx} className="flex gap-2"><span aria-hidden="true" style={{ color: "var(--dashboard-heading)" }}>→</span><span>{action}</span></li>
																))}
															</ul>
														</div>
													)}
												{guide.followUp.successMetrics?.length && (
													<div>
														<h4 className="text-sm font-semibold" style={{ color: "var(--dashboard-heading)" }}>Success Signals</h4>
														<ul className="mt-2 space-y-1">
																{guide.followUp.successMetrics.map((metric, idx) => (
																	<li key={idx} className="flex gap-2"><span aria-hidden="true" style={{ color: "var(--dashboard-heading)" }}>★</span><span>{metric}</span></li>
																))}
															</ul>
														</div>
													)}
												{guide.followUp.pitfalls?.length && (
													<div>
														<h4 className="text-sm font-semibold" style={{ color: "var(--dashboard-heading)" }}>Watch Outs</h4>
														<ul className="mt-2 space-y-1">
																{guide.followUp.pitfalls.map((item, idx) => (
																	<li key={idx} className="flex gap-2"><span aria-hidden="true" style={{ color: "var(--dashboard-heading)" }}>⚠️</span><span>{item}</span></li>
																))}
															</ul>
														</div>
													)}
												</div>
											</div>
										)}
									</div>
								)}

							{guide.resources?.length && (
								<div className="dashboard-card rounded-2xl p-6">
									<h3 className="mb-4 text-lg font-bold" style={{ color: "var(--dashboard-heading)" }}>Resource Kit</h3>
									<div className="grid gap-4 md:grid-cols-2">
											{guide.resources.map((resource, idx) => (
												<a
													key={idx}
													href={resource.url}
													target="_blank"
													rel="noopener noreferrer"
													className="dashboard-card-muted group flex items-start gap-3 rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
													style={{ borderColor: "color-mix(in srgb, var(--dashboard-primary) 18%, transparent)" }}
												>
													<div className="dashboard-pill flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold">
														{resource.type?.[0] || "R"}
												</div>
												<div className="min-w-0 flex-1">
													<p className="truncate text-sm font-semibold transition-colors" style={{ color: "var(--dashboard-heading)" }}>{resource.name}</p>
													<p className="text-xs" style={{ color: "var(--dashboard-muted)" }}>{resource.type}</p>
													<p className="mt-1 line-clamp-2 text-xs" style={{ color: "var(--dashboard-muted)" }}>{resource.description}</p>
												</div>
													<svg className="h-4 w-4 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--dashboard-primary)" }}>
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
													</svg>
												</a>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
