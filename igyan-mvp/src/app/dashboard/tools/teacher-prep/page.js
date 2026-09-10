"use client";

import { useEffect, useState } from "react";
import { aiFetch } from "@/app/utils/ai-fallback";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";
import QuizQuestion from "./components/QuizQuestion";
import QuizResults from "./components/QuizResults";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function TeacherPrepPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState({
		topic: "",
		difficulty: "medium",
		questionCount: "5",
		focusArea: "",
		prepType: "knowledge" // knowledge, teaching-strategies, classroom-scenarios
	});
	const [generating, setGenerating] = useState(false);
	const [quiz, setQuiz] = useState(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState({});
	const [showResults, setShowResults] = useState(false);
	const [quizStarted, setQuizStarted] = useState(false);
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
		setQuiz(null);
		setUserAnswers({});
		setCurrentQuestionIndex(0);
		setShowResults(false);
		setQuizStarted(false);

		try {
			let prepTypeInstructions = "";
			if (formData.prepType === "knowledge") {
				prepTypeInstructions = "Focus on deep content knowledge, subject mastery, and conceptual understanding that teachers need to effectively teach this topic.";
			} else if (formData.prepType === "teaching-strategies") {
				prepTypeInstructions = "Focus on pedagogical approaches, teaching methods, student engagement strategies, and effective ways to explain this topic to students.";
			} else if (formData.prepType === "classroom-scenarios") {
				prepTypeInstructions = "Focus on real classroom situations, handling student questions, addressing misconceptions, and practical teaching challenges related to this topic.";
			}

			const prompt = `Generate a ${formData.questionCount}-question multiple choice quiz for TEACHER PREPARATION on: ${formData.topic}

Difficulty Level: ${formData.difficulty}
Preparation Type: ${formData.prepType}
${formData.focusArea ? `Focus Area: ${formData.focusArea}` : ""}

IMPORTANT: This quiz is for TEACHERS preparing to teach, not for students. ${prepTypeInstructions}

Requirements:
- Create exactly ${formData.questionCount} questions that help teachers prepare
- Each question should have 4 options (A, B, C, D)
- Only ONE option should be correct
- Provide detailed, educational explanations with teaching tips
- Make questions progressively challenging
- Include practical teaching scenarios when appropriate
- Difficulty: ${formData.difficulty === "easy" ? "foundational teaching concepts" : formData.difficulty === "medium" ? "effective teaching practices and strategies" : "advanced pedagogical techniques and complex scenarios"}

Return the response in this EXACT JSON format:
{
  "title": "Teacher Prep Quiz title",
  "description": "Brief description of what this preparation covers",
  "questions": [
    {
      "id": 1,
      "question": "The question text for teacher preparation?",
      "options": [
        {"id": "A", "text": "Option A text"},
        {"id": "B", "text": "Option B text"},
        {"id": "C", "text": "Option C text"},
        {"id": "D", "text": "Option D text"}
      ],
      "correctAnswer": "A",
      "explanation": "Detailed explanation with teaching insights and practical tips"
    }
  ]
}

Provide ONLY valid JSON, no additional commentary.`;

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
							content: "You are an expert teacher educator and instructional coach. You create preparation materials that help teachers master content knowledge, develop effective teaching strategies, and handle classroom scenarios. Always return valid JSON responses with practical teaching insights."
						},
						{
							role: "user",
							content: prompt
						}
					],
					temperature: 0.7,
					max_tokens: 3000,
					response_format: { type: "json_object" }
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate teacher prep quiz");
			}

			const data = await response.json();
			const generatedContent = data.choices[0].message.content;
			
			let parsedData;
			try {
				parsedData = JSON.parse(generatedContent);
				setQuiz(parsedData);
			} catch (parseError) {
				console.error("JSON Parse Error:", parseError);
				throw new Error("Failed to parse AI response");
			}
		} catch (err) {
			console.error("Error generating teacher prep quiz:", err);
			setError("Failed to generate preparation quiz. Please try again.");
		} finally {
			setGenerating(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleStartQuiz = () => {
		setQuizStarted(true);
		setCurrentQuestionIndex(0);
		setUserAnswers({});
		setShowResults(false);
	};

	const handleAnswerSelect = (questionId, answerId) => {
		if (userAnswers[questionId]) return; // Already answered
		
		setUserAnswers(prev => ({
			...prev,
			[questionId]: answerId
		}));
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < quiz.questions.length - 1) {
			setCurrentQuestionIndex(prev => prev + 1);
		} else {
			setShowResults(true);
		}
	};

	const handlePreviousQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(prev => prev - 1);
		}
	};

	const handleRestartQuiz = () => {
		setQuiz(null);
		setUserAnswers({});
		setCurrentQuestionIndex(0);
		setShowResults(false);
		setQuizStarted(false);
	};

	const calculateScore = () => {
		if (!quiz) return { correct: 0, total: 0, percentage: 0 };
		
		let correct = 0;
		quiz.questions.forEach(question => {
			if (userAnswers[question.id] === question.correctAnswer) {
				correct++;
			}
		});
		
		const total = quiz.questions.length;
		const percentage = Math.round((correct / total) * 100);
		
		return { correct, total, percentage };
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center" style={{ background: 'var(--dashboard-background)' }}>
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
			</div>
		);
	}

	const currentQuestion = quiz?.questions?.[currentQuestionIndex];
	const score = calculateScore();

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
							<h1 className="text-3xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Teacher Prep Quiz</h1>
							<p className="mt-1" style={{ color: 'var(--dashboard-muted)' }}>Test and enhance your teaching knowledge and skills</p>
						</div>
					</div>
				</div>

				{!quiz && !generating && (
					<div className="grid gap-8 lg:grid-cols-2">
						{/* Setup Form */}
						<div className="rounded-2xl border p-6 shadow-lg dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
							<div className="mb-6 flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg" style={{
									background: 'linear-gradient(to bottom right, var(--dashboard-primary), var(--dashboard-primary-hover))'
								}}>
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
									</svg>
								</div>
								<div>
									<h2 className="text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Preparation Setup</h2>
									<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>Customize your prep session</p>
								</div>
							</div>
							
							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Topic to Teach <span className="text-red-500">*</span>
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
										placeholder="E.g., Photosynthesis, Quadratic Equations..."
										required
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Preparation Type <span className="text-red-500">*</span>
									</label>
									<select
										name="prepType"
										value={formData.prepType}
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
										<option value="knowledge">Content Knowledge Mastery</option>
										<option value="teaching-strategies">Teaching Strategies & Methods</option>
										<option value="classroom-scenarios">Classroom Scenarios & Challenges</option>
									</select>
									<p className="mt-1.5 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
										{formData.prepType === "knowledge" && "Deep dive into subject matter and concepts"}
										{formData.prepType === "teaching-strategies" && "Explore effective pedagogical approaches"}
										{formData.prepType === "classroom-scenarios" && "Practice handling real teaching situations"}
									</p>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Specific Focus (Optional)
									</label>
									<input
										type="text"
										name="focusArea"
										value={formData.focusArea}
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
										placeholder="E.g., explaining to beginners, common misconceptions..."
									/>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
											Difficulty Level
										</label>
										<select
											name="difficulty"
											value={formData.difficulty}
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
											<option value="easy">Foundational</option>
											<option value="medium">Intermediate</option>
											<option value="hard">Advanced</option>
										</select>
									</div>

									<div>
										<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
											Question Count
										</label>
										<select
											name="questionCount"
											value={formData.questionCount}
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
											<option value="5">5 Questions</option>
											<option value="7">7 Questions</option>
											<option value="10">10 Questions</option>
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
											Preparing Your Quiz...
										</span>
									) : (
										<span className="flex items-center justify-center gap-2">
											<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
											</svg>
											Generate Prep Quiz
										</span>
									)}
								</button>
							</form>
						</div>

						{/* Info Panel */}
						<div className="space-y-6">
							<div className="rounded-2xl border p-6 shadow-lg dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
								<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg" style={{
									background: 'linear-gradient(to bottom right, var(--dashboard-primary), var(--dashboard-primary-hover))'
								}}>
									<svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
									</svg>
								</div>
								<h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>Why Teacher Prep?</h3>
								<p className="mb-4 text-sm leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>
									Prepare yourself before entering the classroom. Test your knowledge, practice teaching strategies, and build confidence.
								</p>
								<ul className="space-y-3 text-sm" style={{ color: 'var(--dashboard-text)' }}>
									<li className="flex items-start gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{
											background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
											color: 'var(--dashboard-primary)'
										}}>✓</span>
										<span>Master content before teaching</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{
											background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
											color: 'var(--dashboard-primary)'
										}}>✓</span>
										<span>Learn effective teaching strategies</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{
											background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
											color: 'var(--dashboard-primary)'
										}}>✓</span>
										<span>Practice handling classroom scenarios</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{
											background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
											color: 'var(--dashboard-primary)'
										}}>✓</span>
										<span>Get instant feedback with teaching tips</span>
									</li>
								</ul>
							</div>

							{/* Prep Type Info Cards */}
							<div className="grid gap-4">
								<div className="rounded-xl border p-4" style={{
									borderColor: 'var(--dashboard-border)',
									background: 'color-mix(in srgb, var(--dashboard-primary) 5%, transparent)'
								}}>
									<div className="mb-2 flex items-center gap-2">
										<svg className="h-5 w-5" style={{ color: 'var(--dashboard-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
										</svg>
										<h4 className="font-semibold text-sm" style={{ color: 'var(--dashboard-heading)' }}>Content Knowledge</h4>
									</div>
									<p className="text-xs" style={{ color: 'var(--dashboard-text)' }}>Deep dive into concepts, facts, and subject mastery</p>
								</div>

								<div className="rounded-xl border p-4" style={{
									borderColor: 'var(--dashboard-border)',
									background: 'color-mix(in srgb, var(--dashboard-primary) 5%, transparent)'
								}}>
									<div className="mb-2 flex items-center gap-2">
										<svg className="h-5 w-5" style={{ color: 'var(--dashboard-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
										<h4 className="font-semibold text-sm" style={{ color: 'var(--dashboard-heading)' }}>Teaching Strategies</h4>
									</div>
									<p className="text-xs" style={{ color: 'var(--dashboard-text)' }}>Pedagogical methods and effective instruction techniques</p>
								</div>

								<div className="rounded-xl border p-4" style={{
									borderColor: 'var(--dashboard-border)',
									background: 'color-mix(in srgb, var(--dashboard-primary) 5%, transparent)'
								}}>
									<div className="mb-2 flex items-center gap-2">
										<svg className="h-5 w-5" style={{ color: 'var(--dashboard-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
										</svg>
										<h4 className="font-semibold text-sm" style={{ color: 'var(--dashboard-heading)' }}>Classroom Scenarios</h4>
									</div>
									<p className="text-xs" style={{ color: 'var(--dashboard-text)' }}>Real situations, student questions, and practical challenges</p>
								</div>
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
						</div>
					</div>
				)}

				{generating && (
					<div className="flex flex-col items-center justify-center rounded-2xl border px-8 py-20 text-center shadow-lg dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
						<div className="h-16 w-16 animate-spin rounded-full border-4 border-t-transparent mb-4" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
						<h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Crafting Your Prep Quiz...</h3>
						<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>AI is creating personalized preparation questions</p>
					</div>
				)}

				{quiz && !quizStarted && !showResults && (
					<div className="mx-auto max-w-3xl">
						<div className="rounded-2xl border p-8 shadow-xl dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
							<div className="mb-6 flex items-center gap-4">
								<div className="flex h-16 w-16 items-center justify-center rounded-xl text-white shadow-lg" style={{
									background: 'linear-gradient(to bottom right, var(--dashboard-primary), var(--dashboard-primary-hover))'
								}}>
									<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
									</svg>
								</div>
								<div>
									<h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>{quiz.title}</h2>
									<p style={{ color: 'var(--dashboard-muted)' }}>{quiz.description}</p>
								</div>
							</div>

							<div className="mb-6 grid gap-4 sm:grid-cols-3">
								<div className="rounded-xl border p-4" style={{
									borderColor: 'var(--dashboard-border)',
									background: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)'
								}}>
									<div className="text-2xl font-bold" style={{ color: 'var(--dashboard-primary)' }}>{quiz.questions.length}</div>
									<div className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>Questions</div>
								</div>
								<div className="rounded-xl border p-4" style={{
									borderColor: 'var(--dashboard-border)',
									background: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)'
								}}>
									<div className="text-2xl font-bold capitalize" style={{ color: 'var(--dashboard-primary)' }}>{formData.difficulty}</div>
									<div className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>Level</div>
								</div>
								<div className="rounded-xl border p-4" style={{
									borderColor: 'var(--dashboard-border)',
									background: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)'
								}}>
									<div className="text-2xl font-bold" style={{ color: 'var(--dashboard-primary)' }}>~{quiz.questions.length * 2} min</div>
									<div className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>Est. Time</div>
								</div>
							</div>

							<div className="flex gap-3">
								<button
									onClick={handleStartQuiz}
									className="flex-1 rounded-lg px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
									style={{
										background: 'linear-gradient(to right, var(--dashboard-primary), var(--dashboard-primary-hover))'
									}}
									onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
									onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
								>
									<span className="flex items-center justify-center gap-2">
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Begin Preparation
									</span>
								</button>
								<button
									onClick={handleRestartQuiz}
									className="rounded-lg border px-6 py-3 font-semibold transition-colors"
									style={{
										borderColor: 'var(--dashboard-border)',
										background: 'var(--dashboard-surface-solid)',
										color: 'var(--dashboard-text)'
									}}
									onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
									onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
								>
									New Topic
								</button>
							</div>
						</div>
					</div>
				)}

				{quiz && quizStarted && !showResults && currentQuestion && (
					<div className="mx-auto max-w-4xl">
						{/* Progress Bar */}
						<div className="mb-6 rounded-2xl border p-6 shadow-lg dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
							<div className="mb-3 flex items-center justify-between text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>
								<span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
								<span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% Complete</span>
							</div>
							<div className="h-3 overflow-hidden rounded-full" style={{ background: 'var(--dashboard-surface-muted)' }}>
								<div 
									className="h-full rounded-full transition-all duration-500"
									style={{ 
										width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
										background: 'linear-gradient(to right, var(--dashboard-primary), var(--dashboard-primary-hover))'
									}}
								></div>
							</div>
						</div>

						{/* Question Card */}
						<QuizQuestion
							question={currentQuestion}
							questionNumber={currentQuestionIndex + 1}
							selectedAnswer={userAnswers[currentQuestion.id]}
							onAnswerSelect={handleAnswerSelect}
						/>

						{/* Navigation */}
						<div className="mt-6 flex items-center justify-between">
							<button
								onClick={handlePreviousQuestion}
								disabled={currentQuestionIndex === 0}
								className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
								style={{
									borderColor: 'var(--dashboard-border)',
									background: 'var(--dashboard-surface-solid)',
									color: 'var(--dashboard-text)'
								}}
								onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.opacity = '0.8')}
								onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
								</svg>
								Previous
							</button>

							{currentQuestionIndex === quiz.questions.length - 1 ? (
								<button
									onClick={handleNextQuestion}
									disabled={!userAnswers[currentQuestion.id]}
									className="inline-flex items-center gap-2 rounded-lg px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
									style={{
										background: 'linear-gradient(to right, var(--dashboard-primary), var(--dashboard-primary-hover))'
									}}
									onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'translateY(-1px)')}
									onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
								>
									Complete Prep
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</button>
							) : (
								<button
									onClick={handleNextQuestion}
									disabled={!userAnswers[currentQuestion.id]}
									className="inline-flex items-center gap-2 rounded-lg px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
									style={{
										background: 'linear-gradient(to right, var(--dashboard-primary), var(--dashboard-primary-hover))'
									}}
									onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.transform = 'translateY(-1px)')}
									onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
								>
									Next Question
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							)}
						</div>
					</div>
				)}

				{showResults && (
					<QuizResults
						quiz={quiz}
						userAnswers={userAnswers}
						score={score}
						onRestartQuiz={handleRestartQuiz}
						onReviewAnswers={() => {
							setShowResults(false);
							setQuizStarted(true);
							setCurrentQuestionIndex(0);
						}}
					/>
				)}
			</div>
		</div>
	);
}
