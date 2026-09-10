"use client";

import { useEffect, useState, useRef } from "react";
import { aiFetch } from "@/app/utils/ai-fallback";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

const PROGRAMMING_LANGUAGES = [
	{ value: "javascript", label: "JavaScript", extension: "js" },
	{ value: "python", label: "Python", extension: "py" },
	{ value: "java", label: "Java", extension: "java" },
	{ value: "cpp", label: "C++", extension: "cpp" },
	{ value: "c", label: "C", extension: "c" },
	{ value: "html", label: "HTML", extension: "html" },
	{ value: "css", label: "CSS", extension: "css" },
	{ value: "typescript", label: "TypeScript", extension: "ts" },
	{ value: "php", label: "PHP", extension: "php" },
	{ value: "ruby", label: "Ruby", extension: "rb" },
	{ value: "go", label: "Go", extension: "go" },
	{ value: "rust", label: "Rust", extension: "rs" },
	{ value: "swift", label: "Swift", extension: "swift" },
	{ value: "kotlin", label: "Kotlin", extension: "kt" },
];

export default function CodeTutorPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [selectedLanguage, setSelectedLanguage] = useState("javascript");
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [error, setError] = useState("");
	const messagesEndRef = useRef(null);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleLanguageChange = (newLanguage) => {
		setSelectedLanguage(newLanguage);
		setMessages([
			{
				role: "assistant",
				content: `Great! I'm now your ${PROGRAMMING_LANGUAGES.find(l => l.value === newLanguage)?.label} tutor. I'll help you learn ${PROGRAMMING_LANGUAGES.find(l => l.value === newLanguage)?.label} programming with clear explanations and code examples. What would you like to learn?`,
				timestamp: new Date().toISOString(),
			}
		]);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!inputMessage.trim() || isGenerating) return;

		const userMessage = {
			role: "user",
			content: inputMessage,
			timestamp: new Date().toISOString(),
		};

		setMessages(prev => [...prev, userMessage]);
		setInputMessage("");
		setIsGenerating(true);
		setError("");

		try {
			const languageInfo = PROGRAMMING_LANGUAGES.find(l => l.value === selectedLanguage);
			const systemPrompt = `You are an expert ${languageInfo.label} programming tutor. Your role is to:
1. Teach ${languageInfo.label} concepts clearly and concisely
2. Provide working code examples in ${languageInfo.label} with proper syntax
3. Explain code line-by-line when requested
4. Help debug and fix code errors
5. Suggest best practices and modern approaches
6. Be encouraging and patient with learners

IMPORTANT: 
- Always write code examples using proper ${languageInfo.label} syntax
- Format all code blocks with triple backticks and the language identifier: \`\`\`${selectedLanguage}
- Provide clear explanations before and after code examples
- Keep explanations beginner-friendly but technically accurate
- When explaining code, break it down step-by-step`;

			const response = await aiFetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-4o",
					messages: [
						{ role: "system", content: systemPrompt },
						...messages.slice(-10).map(msg => ({
							role: msg.role,
							content: msg.content
						})),
						{ role: "user", content: inputMessage }
					],
					temperature: 0.7,
					max_tokens: 2000,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get response from AI tutor");
			}

			const data = await response.json();
			const assistantMessage = {
				role: "assistant",
				content: data.choices[0].message.content,
				timestamp: new Date().toISOString(),
			};

			setMessages(prev => [...prev, assistantMessage]);
		} catch (err) {
			console.error("Error:", err);
			setError("Failed to get response. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const renderMessageContent = (content) => {
		// Split content by code blocks
		const parts = content.split(/(```[\s\S]*?```)/g);
		
		return parts.map((part, index) => {
			if (part.startsWith("```") && part.endsWith("```")) {
				// Extract language and code
				const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
				if (match) {
					const [, lang, code] = match;
					const language = lang || selectedLanguage;
					
					return (
						<div key={index} className="my-4 overflow-hidden rounded-xl border shadow-lg" style={{
							borderColor: 'var(--dashboard-border)',
							background: 'var(--dashboard-surface-muted)'
						}}>
							<div className="flex items-center justify-between px-4 py-2.5" style={{
								background: 'var(--dashboard-background-contrast)',
								borderBottom: '1px solid var(--dashboard-border)'
							}}>
								<div className="flex items-center gap-2">
									<div className="flex gap-1.5">
										<div className="h-3 w-3 rounded-full bg-red-500/80"></div>
										<div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
										<div className="h-3 w-3 rounded-full bg-green-500/80"></div>
									</div>
									<span className="ml-3 text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										{PROGRAMMING_LANGUAGES.find(l => l.value === language)?.label || language}
									</span>
								</div>
								<button
									onClick={() => {
										navigator.clipboard.writeText(code.trim());
									}}
									className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
									style={{
										background: 'rgba(59, 130, 246, 0.1)',
										color: 'rgba(96, 165, 250, 1)',
										border: '1px solid rgba(59, 130, 246, 0.3)'
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
										e.currentTarget.style.color = 'rgba(147, 197, 253, 1)';
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
										e.currentTarget.style.color = 'rgba(96, 165, 250, 1)';
									}}
								>
									<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
									</svg>
									Copy
								</button>
							</div>
							<SyntaxHighlighter
								language={language}
								style={vscDarkPlus}
								customStyle={{
									margin: 0,
									borderRadius: 0,
									fontSize: "0.875rem",
									background: '#1e293b',
									padding: '1rem',
								}}
								showLineNumbers
								lineNumberStyle={{
									color: '#64748b',
									paddingRight: '1rem',
									minWidth: '2.5rem'
								}}
							>
								{code.trim()}
							</SyntaxHighlighter>
						</div>
					);
				}
			}
			
			// Regular text content - skip empty parts
			if (!part.trim()) return null;
			
			return (
				<div key={index} className="leading-relaxed">
					{part.split('\n').filter(line => line.trim()).map((line, i) => (
						<p key={i} className="mb-3 text-[15px] leading-7" style={{
							color: 'var(--dashboard-text)'
						}}>
							{line}
						</p>
					))}
				</div>
			);
		});
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center" style={{ background: 'var(--dashboard-background)' }}>
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col" style={{ background: 'var(--dashboard-background)' }}>
			{/* Header */}
			<div className="border-b px-6 py-4" style={{ 
				borderColor: 'var(--dashboard-border)',
				background: 'var(--dashboard-card)'
			}}>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button
							onClick={() => router.back()}
							className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
							style={{
								borderColor: 'var(--dashboard-border)',
								color: 'var(--dashboard-text)',
								background: 'var(--dashboard-card)'
							}}
							onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
							onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div>
							<h1 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
								Code Tutor
							</h1>
							<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
								AI-powered coding teacher for all skill levels
							</p>
						</div>
					</div>
					
					{/* Language Selector */}
					<div className="flex items-center gap-3">
						<label className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
							Programming Language:
						</label>
						<select
							value={selectedLanguage}
							onChange={(e) => handleLanguageChange(e.target.value)}
							className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
							style={{
								borderColor: 'var(--dashboard-border)',
								background: 'var(--dashboard-card)',
								color: 'var(--dashboard-text)'
							}}
						>
							{PROGRAMMING_LANGUAGES.map(lang => (
								<option key={lang.value} value={lang.value}>
									{lang.label}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-1 overflow-y-auto px-6 py-6">
				<div className="mx-auto max-w-4xl space-y-6">
					{messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}>
								<svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
								</svg>
							</div>
							<h2 className="mb-3 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
								Welcome to Code Tutor!
							</h2>
							<p className="mb-6 max-w-lg text-sm" style={{ color: 'var(--dashboard-muted)' }}>
								Select a programming language above and ask me anything. I can help you learn concepts, 
								debug code, explain syntax, and provide best practices.
							</p>
							<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{[
									"Explain variables and data types",
									"How do I create a function?",
									"Help me debug this code",
									"What are loops?",
									"Teach me about arrays",
									"Best practices for beginners"
								].map((suggestion, idx) => (
									<button
										key={idx}
										onClick={() => setInputMessage(suggestion)}
										className="rounded-xl border px-5 py-3.5 text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-lg"
										style={{
											borderColor: 'var(--dashboard-border)',
											background: 'var(--dashboard-surface)',
											color: 'var(--dashboard-text)'
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-primary)';
											e.currentTarget.style.background = 'var(--dashboard-surface-muted)';
											e.currentTarget.style.color = 'var(--dashboard-primary)';
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.borderColor = 'var(--dashboard-border)';
											e.currentTarget.style.background = 'var(--dashboard-surface)';
											e.currentTarget.style.color = 'var(--dashboard-text)';
										}}
									>
										{suggestion}
									</button>
								))}
							</div>
						</div>
					) : (
						messages.map((message, index) => (
							<div
								key={index}
								className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
							>
								{message.role === "assistant" && (
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg" style={{
										background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
									}}>
										<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
										</svg>
									</div>
								)}
								
								<div className={`max-w-3xl rounded-2xl px-6 py-5 shadow-md transition-all hover:shadow-lg ${
									message.role === "user" 
										? "rounded-br-sm" 
										: "rounded-bl-sm"
								}`} style={{
									background: message.role === "user" 
										? 'linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 85%, #000))' 
										: 'var(--dashboard-surface)',
									borderWidth: '1px',
									borderColor: message.role === "user" 
										? 'transparent' 
										: 'var(--dashboard-border)'
								}}>
									{message.role === "user" ? (
										<p className="text-[15px] leading-7" style={{ color: 'var(--dashboard-primary-foreground)' }}>
											{message.content}
										</p>
									) : (
										renderMessageContent(message.content)
									)}
								</div>

								{message.role === "user" && (
									<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg" style={{
										background: 'linear-gradient(135deg, rgba(99, 102, 241, 1), rgba(79, 70, 229, 1))',
										color: 'white'
									}}>
										<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
											<path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
									</div>
								)}
							</div>
						))
					)}
					
					{isGenerating && (
						<div className="flex gap-4">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-lg" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}>
								<svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
								</svg>
							</div>
							<div className="rounded-2xl rounded-bl-sm border px-6 py-5 shadow-md" style={{
								background: 'var(--dashboard-surface)',
								borderColor: 'var(--dashboard-border)'
							}}>
								<div className="flex items-center gap-2.5">
									<div className="h-2.5 w-2.5 animate-bounce rounded-full shadow-lg" style={{ 
										background: 'var(--dashboard-primary)',
										animationDelay: '0ms' 
									}}></div>
									<div className="h-2.5 w-2.5 animate-bounce rounded-full shadow-lg" style={{ 
										background: 'var(--dashboard-primary)',
										animationDelay: '150ms' 
									}}></div>
									<div className="h-2.5 w-2.5 animate-bounce rounded-full shadow-lg" style={{ 
										background: 'var(--dashboard-primary)',
										animationDelay: '300ms' 
									}}></div>
								</div>
							</div>
						</div>
					)}

					{error && (
						<div className="rounded-xl border px-5 py-4 text-sm font-medium shadow-lg" style={{
							background: 'rgba(239, 68, 68, 0.1)',
							borderColor: 'rgba(239, 68, 68, 0.4)',
							color: '#ef4444'
						}}>
							<div className="flex items-center gap-3">
								<svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								<span>{error}</span>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Input Area */}
			<div className="border-t px-6 py-5" style={{ 
				borderColor: 'var(--dashboard-border)',
				background: 'var(--dashboard-card)'
			}}>
				<form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
					<div className="flex gap-3">
						<input
							type="text"
							value={inputMessage}
							onChange={(e) => setInputMessage(e.target.value)}
							placeholder={`Ask me anything about ${PROGRAMMING_LANGUAGES.find(l => l.value === selectedLanguage)?.label}...`}
							className="flex-1 rounded-xl border px-5 py-4 text-[15px] transition-all focus:outline-none focus:ring-2"
							style={{
								borderColor: 'var(--dashboard-border)',
								background: 'var(--dashboard-surface)',
								color: 'var(--dashboard-text)'
							}}
							onFocus={(e) => {
								e.currentTarget.style.borderColor = 'var(--dashboard-primary)';
								e.currentTarget.style.boxShadow = `0 0 0 3px color-mix(in srgb, var(--dashboard-primary) 15%, transparent)`;
							}}
							onBlur={(e) => {
								e.currentTarget.style.borderColor = 'var(--dashboard-border)';
								e.currentTarget.style.boxShadow = 'none';
							}}
							disabled={isGenerating}
						/>
						<button
							type="submit"
							disabled={!inputMessage.trim() || isGenerating}
							className="flex items-center gap-2.5 rounded-xl px-7 py-4 font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
							style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 80%, #000))`,
								boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
							}}
						>
							{isGenerating ? (
								<>
									<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
									</svg>
									Thinking...
								</>
							) : (
								<>
									<span className="text-[15px]">Send</span>
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
									</svg>
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
