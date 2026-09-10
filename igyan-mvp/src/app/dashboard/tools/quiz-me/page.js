"use client";

import { useEffect, useState } from "react";
import { aiFetch } from "@/app/utils/ai-fallback";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";
import QuizQuestion from "./components/QuizQuestion";
import QuizResults from "./components/QuizResults";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function QuizMePage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState({
		topic: "",
		difficulty: "medium",
		questionCount: "5",
		focusArea: ""
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
			const prompt = `Generate a ${formData.questionCount}-question multiple choice quiz about: ${formData.topic}

Difficulty Level: ${formData.difficulty}
${formData.focusArea ? `Focus Area: ${formData.focusArea}` : ""}

Requirements:
- Create exactly ${formData.questionCount} questions
- Each question should have 4 options (A, B, C, D)
- Only ONE option should be correct
- Provide a clear, educational explanation for each correct answer
- Make questions progressively challenging
- Use real-world scenarios when appropriate
- Difficulty: ${formData.difficulty === "easy" ? "basic concepts and definitions" : formData.difficulty === "medium" ? "application and understanding" : "advanced analysis and problem-solving"}

Return the response in this EXACT JSON format:
{
  "title": "Quiz title",
  "description": "Brief description of what this quiz covers",
  "questions": [
    {
      "id": 1,
      "question": "The question text?",
      "options": [
        {"id": "A", "text": "Option A text"},
        {"id": "B", "text": "Option B text"},
        {"id": "C", "text": "Option C text"},
        {"id": "D", "text": "Option D text"}
      ],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong"
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
							content: "You are an expert educational assessment creator. You generate engaging, accurate, and well-structured multiple choice quizzes that test understanding and promote learning. Always return valid JSON responses."
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
				throw new Error("Failed to generate quiz");
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
			console.error("Error generating quiz:", err);
			setError("Failed to generate quiz. Please try again.");
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
							<h1 className="text-3xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Quiz Me</h1>
							<p className="mt-1" style={{ color: 'var(--dashboard-muted)' }}>Test your knowledge with AI-generated quizzes</p>
						</div>
					</div>
				</div>

				{!quiz && !generating && (
					<div className="grid gap-8 lg:grid-cols-2">
						{/* Setup Form */}
						<div className="rounded-2xl border p-6 shadow-lg dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
							<h2 className="mb-6 text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>Quiz Setup</h2>
							
							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Quiz Topic <span className="text-red-500">*</span>
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
										placeholder="E.g., JavaScript fundamentals, World History..."
										required
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
										Focus Area (Optional)
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
										placeholder="E.g., async/await, Renaissance period..."
									/>
								</div>

								<div className="grid gap-4 sm:grid-cols-2">
									<div>
										<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
											Difficulty
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
											<option value="easy">Easy</option>
											<option value="medium">Medium</option>
											<option value="hard">Hard</option>
										</select>
									</div>

									<div>
										<label className="mb-2 block text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
											Number of Questions
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
											Generating Quiz...
										</span>
									) : (
										<span className="flex items-center justify-center gap-2">
											<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
											</svg>
											Generate Quiz
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
								<h3 className="mb-2 text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>How It Works</h3>
								<ul className="space-y-3 text-sm" style={{ color: 'var(--dashboard-text)' }}>
									<li className="flex items-start gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{
											background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
											color: 'var(--dashboard-primary)'
										}}>1</span>
										<span>Enter your quiz topic and preferences</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{
											background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
											color: 'var(--dashboard-primary)'
										}}>2</span>
										<span>AI generates custom questions for you</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{
											background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
											color: 'var(--dashboard-primary)'
										}}>3</span>
										<span>Answer each question at your own pace</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{
											background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
											color: 'var(--dashboard-primary)'
										}}>4</span>
										<span>Get instant feedback with explanations</span>
									</li>
								</ul>
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
						<h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Creating Your Quiz...</h3>
						<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>AI is crafting the perfect questions for you</p>
					</div>
				)}

				{quiz && !quizStarted && !showResults && (
					<div className="mx-auto max-w-3xl">
						<div className="rounded-2xl border border-violet-200 bg-linear-to-br from-white to-violet-50 p-8 shadow-xl dark:border-violet-800 dark:from-slate-800 dark:to-violet-900/20">
							<div className="mb-6 flex items-center gap-4">
								<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
									<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
								</div>
								<div>
									<h2 className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.title}</h2>
									<p className="text-slate-600 dark:text-slate-400">{quiz.description}</p>
								</div>
							</div>

							<div className="mb-6 grid gap-4 sm:grid-cols-3">
								<div className="rounded-xl bg-violet-100 p-4 dark:bg-violet-900/30">
									<div className="text-2xl font-bold text-violet-700 dark:text-violet-300">{quiz.questions.length}</div>
									<div className="text-sm font-medium text-slate-600 dark:text-slate-400">Questions</div>
								</div>
								<div className="rounded-xl bg-fuchsia-100 p-4 dark:bg-fuchsia-900/30">
									<div className="text-2xl font-bold text-fuchsia-700 dark:text-fuchsia-300 capitalize">{formData.difficulty}</div>
									<div className="text-sm font-medium text-slate-600 dark:text-slate-400">Difficulty</div>
								</div>
								<div className="rounded-xl bg-pink-100 p-4 dark:bg-pink-900/30">
									<div className="text-2xl font-bold text-pink-700 dark:text-pink-300">~{quiz.questions.length * 1.5} min</div>
									<div className="text-sm font-medium text-slate-600 dark:text-slate-400">Est. Time</div>
								</div>
							</div>

							<div className="flex gap-3">
								<button
									onClick={handleStartQuiz}
									className="flex-1 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl"
								>
									<span className="flex items-center justify-center gap-2">
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Start Quiz
									</span>
								</button>
								<button
									onClick={handleRestartQuiz}
									className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
								>
									New Quiz
								</button>
							</div>
						</div>
					</div>
				)}

				{quiz && quizStarted && !showResults && currentQuestion && (
					<div className="mx-auto max-w-4xl">
						{/* Progress Bar */}
						<div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
							<div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
								<span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
								<span>{Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100)}% Complete</span>
							</div>
							<div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
								<div 
									className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
									style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
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
								className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
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
									className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
								>
									Finish Quiz
									<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</button>
							) : (
								<button
									onClick={handleNextQuestion}
									disabled={!userAnswers[currentQuestion.id]}
									className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-violet-600 to-fuchsia-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:from-violet-700 hover:to-fuchsia-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
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
