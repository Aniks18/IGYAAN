"use client";

import { useEffect, useState } from "react";
import { aiFetch } from "@/app/utils/ai-fallback";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function TextSummarizerPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState({
		text: "",
		length: "medium",
		format: "paragraph",
		tone: "neutral"
	});
	const [summarizing, setSummarizing] = useState(false);
	const [summary, setSummary] = useState(null);
	const [error, setError] = useState("");
	const [stats, setStats] = useState(null);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	const calculateStats = (original, summarized) => {
		const originalWords = original.trim().split(/\s+/).length;
		const summarizedWords = summarized.trim().split(/\s+/).length;
		const reduction = Math.round(((originalWords - summarizedWords) / originalWords) * 100);
		
		return {
			originalWords,
			summarizedWords,
			reduction,
			originalChars: original.length,
			summarizedChars: summarized.length
		};
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSummarizing(true);
		setError("");
		setSummary(null);
		setStats(null);

		try {
			const lengthInstructions = {
				short: "very brief (2-3 sentences)",
				medium: "concise but comprehensive (1 paragraph)",
				long: "detailed (2-3 paragraphs)"
			};

			const formatInstructions = {
				paragraph: "Write the summary in paragraph form with smooth transitions.",
				bullets: "Write the summary as clear bullet points highlighting key information.",
				numbered: "Write the summary as a numbered list of main points in logical order."
			};

			const toneInstructions = {
				neutral: "Use a neutral, objective tone.",
				casual: "Use a casual, conversational tone.",
				formal: "Use a formal, professional tone.",
				technical: "Use technical language and precise terminology."
			};

			const prompt = `Summarize the following text. Make it ${lengthInstructions[formData.length]}. ${formatInstructions[formData.format]} ${toneInstructions[formData.tone]}

Text to summarize:
${formData.text}

Provide ONLY the summary, no additional commentary or explanations.`;

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
							content: "You are an expert text summarizer. You create clear, accurate summaries that capture the essential information while being concise. Follow the user's formatting and length requirements precisely."
						},
						{
							role: "user",
							content: prompt
						}
					],
					temperature: 0.5,
					max_tokens: 1000,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate summary");
			}

			const data = await response.json();
			const summaryText = data.choices[0].message.content;
			setSummary(summaryText);
			setStats(calculateStats(formData.text, summaryText));
		} catch (err) {
			console.error("Error generating summary:", err);
			setError("Failed to generate summary. Please check your API key and try again.");
		} finally {
			setSummarizing(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const copySummary = () => {
		if (!summary) return;
		navigator.clipboard.writeText(summary);
		alert("Summary copied to clipboard!");
	};

	const downloadSummary = () => {
		if (!summary) return;
		const element = document.createElement("a");
		const file = new Blob([summary], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = "summary.txt";
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: 'var(--dashboard-background)' }}>
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-4">
						<button
							onClick={() => router.back()}
							className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
							style={{
								borderColor: 'var(--dashboard-border)',
								backgroundColor: 'var(--dashboard-surface-solid)',
								color: 'var(--dashboard-muted)'
							}}
							onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-surface-muted)'}
							onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-surface-solid)'}
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div>
							<h1 className="text-3xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Text Summarizer</h1>
							<p className="mt-1" style={{ color: 'var(--dashboard-muted)' }}>Transform long content into concise, clear summaries</p>
						</div>
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-2">
					{/* Input Form */}
					<div className="rounded-2xl border shadow-lg dashboard-card p-6" style={{ borderColor: 'var(--dashboard-border)' }}>
						<h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Input Text</h2>
						
						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
									Text to Summarize <span className="text-red-500">*</span>
								</label>
								<textarea
									name="text"
									value={formData.text}
									onChange={handleInputChange}
									onFocus={(e) => {
										e.target.style.borderColor = 'var(--dashboard-primary)';
										e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)';
									}}
									onBlur={(e) => {
										e.target.style.borderColor = 'var(--dashboard-border)';
										e.target.style.boxShadow = 'none';
									}}
									rows={12}
									className="w-full rounded-lg border px-4 py-3"
									style={{
										borderColor: 'var(--dashboard-border)',
										backgroundColor: 'var(--dashboard-surface-solid)',
										color: 'var(--dashboard-text)'
									}}
									placeholder="Paste your text here... (article, document, notes, etc.)"
									required
								/>
								<div className="mt-2 flex items-center justify-between text-xs" style={{ color: 'var(--dashboard-muted)' }}>
									<span>
										{formData.text.trim() ? `${formData.text.trim().split(/\s+/).length} words, ${formData.text.length} characters` : "0 words"}
									</span>
									{formData.text.trim().split(/\s+/).length > 3000 && (
										<span className="text-amber-600 dark:text-amber-400">⚠️ Very long text may take time</span>
									)}
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-3">
								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Length
									</label>
									<select
										name="length"
										value={formData.length}
										onChange={handleInputChange}
										onFocus={(e) => {
											e.target.style.borderColor = 'var(--dashboard-primary)';
											e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)';
										}}
										onBlur={(e) => {
											e.target.style.borderColor = 'var(--dashboard-border)';
											e.target.style.boxShadow = 'none';
										}}
										className="w-full rounded-lg border px-4 py-2.5"
										style={{
											borderColor: 'var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
									>
										<option value="short">Short</option>
										<option value="medium">Medium</option>
										<option value="long">Long</option>
									</select>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Format
									</label>
									<select
										name="format"
										value={formData.format}
										onChange={handleInputChange}
										onFocus={(e) => {
											e.target.style.borderColor = 'var(--dashboard-primary)';
											e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)';
										}}
										onBlur={(e) => {
											e.target.style.borderColor = 'var(--dashboard-border)';
											e.target.style.boxShadow = 'none';
										}}
										className="w-full rounded-lg border px-4 py-2.5"
										style={{
											borderColor: 'var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
									>
										<option value="paragraph">Paragraph</option>
										<option value="bullets">Bullet Points</option>
										<option value="numbered">Numbered List</option>
									</select>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Tone
									</label>
									<select
										name="tone"
										value={formData.tone}
										onChange={handleInputChange}
										onFocus={(e) => {
											e.target.style.borderColor = 'var(--dashboard-primary)';
											e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)';
										}}
										onBlur={(e) => {
											e.target.style.borderColor = 'var(--dashboard-border)';
											e.target.style.boxShadow = 'none';
										}}
										className="w-full rounded-lg border px-4 py-2.5"
										style={{
											borderColor: 'var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
									>
										<option value="neutral">Neutral</option>
										<option value="casual">Casual</option>
										<option value="formal">Formal</option>
										<option value="technical">Technical</option>
									</select>
								</div>
							</div>

							<button
								type="submit"
								disabled={summarizing || !formData.text.trim()}
								className="w-full rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
								style={{
									background: 'linear-gradient(to right, var(--dashboard-primary), var(--dashboard-primary-hover))'
								}}
								onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'translateY(-1px)')}
								onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
							>
								{summarizing ? (
									<span className="flex items-center justify-center gap-2">
										<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										Summarizing...
									</span>
								) : (
									<span className="flex items-center justify-center gap-2">
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
										Generate Summary
									</span>
								)}
							</button>
						</form>
					</div>

					{/* Results */}
					<div className="rounded-2xl border shadow-lg dashboard-card p-6" style={{ borderColor: 'var(--dashboard-border)' }}>
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Summary</h2>
							{summary && (
								<div className="flex gap-2">
									<button
										onClick={copySummary}
										className="flex items-center gap-1 rounded-lg dashboard-card-muted px-3 py-1.5 text-sm font-medium transition-colors"
										style={{ color: 'var(--dashboard-text)' }}
										onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-surface-muted)'}
										onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-surface-solid)'}
										title="Copy to clipboard"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
										Copy
									</button>
									<button
										onClick={downloadSummary}
										className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
										style={{
											backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)',
											color: 'var(--dashboard-primary)'
										}}
										onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--dashboard-primary) 25%, transparent)'}
										onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)'}
										title="Download summary"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										Download
									</button>
								</div>
							)}
						</div>

						{error && (
							<div className="rounded-lg border p-4" style={{
								backgroundColor: 'rgba(239, 68, 68, 0.1)',
								borderColor: 'rgba(239, 68, 68, 0.3)',
								color: '#ef4444'
							}}>
								{error}
							</div>
						)}

						{!summary && !summarizing && !error && (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full dashboard-pill">
									<svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>No summary yet</h3>
								<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>Paste your text and click "Generate Summary" to get started!</p>
							</div>
						)}

						{summarizing && (
							<div className="flex flex-col items-center justify-center py-12">
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent mb-4" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
								<p style={{ color: 'var(--dashboard-muted)' }}>AI is analyzing and summarizing your text...</p>
							</div>
						)}

						{summary && stats && (
							<div className="space-y-6">
								{/* Statistics */}
								<div className="grid grid-cols-3 gap-4">
									<div className="rounded-xl dashboard-card-muted p-4">
										<div className="text-2xl font-bold" style={{ color: 'var(--dashboard-primary)' }}>{stats.reduction}%</div>
										<div className="text-xs font-medium" style={{ color: 'var(--dashboard-muted)' }}>Reduction</div>
									</div>
									<div className="rounded-xl dashboard-card-muted p-4">
										<div className="text-2xl font-bold" style={{ color: 'var(--dashboard-primary)' }}>{stats.originalWords}</div>
										<div className="text-xs font-medium" style={{ color: 'var(--dashboard-muted)' }}>Original Words</div>
									</div>
									<div className="rounded-xl dashboard-card-muted p-4">
										<div className="text-2xl font-bold" style={{ color: 'var(--dashboard-primary)' }}>{stats.summarizedWords}</div>
										<div className="text-xs font-medium" style={{ color: 'var(--dashboard-muted)' }}>Summary Words</div>
									</div>
								</div>

								{/* Summary Content */}
								<div className="rounded-xl border p-6" style={{
									borderColor: 'color-mix(in srgb, var(--dashboard-primary) 20%, transparent)',
									backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 5%, transparent)'
								}}>
									<div className="prose prose-sm max-w-none">
										<div className="leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--dashboard-text)' }}>
											{summary}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
