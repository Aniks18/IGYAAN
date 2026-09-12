"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import VoiceChatHistory from "./components/VoiceChatHistory";
import StudentProfile from "./components/StudentProfile";
import NotesSelector from "./components/NotesSelector";
import VoiceMessage from "./components/VoiceMessage";
import ProfileSetupForm from "./components/ProfileSetupForm";
import Image from "next/image";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// Default profile structure
const DEFAULT_PROFILE = {
	name: "",
	class: "",
	section: "",
	age: "",
	classTeacher: "",
	house: "",
	school: {
		name: "",
		location: "",
		board: ""
	},
	interests: [],
	learningStyle: "",
	strengths: [],
	growthAreas: [],
	academicGoals: [],
	recentWins: [],
	sleepTime: "",
	studySchedule: {
		weekday: "",
		weekend: ""
	},
	favoriteSubjects: [],
	mentors: [],
	funFact: ""
};

export default function IgyanAIPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [messages, setMessages] = useState([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [currentChatId, setCurrentChatId] = useState(null);
	const [selectedNotes, setSelectedNotes] = useState(null);
	const [activeTab, setActiveTab] = useState("chats");
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [aiName, setAiName] = useState("");
	const [inputMode, setInputMode] = useState("voice"); // "voice" or "text"
	const [textInput, setTextInput] = useState("");
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [showProfileSetup, setShowProfileSetup] = useState(false);
	const [studentProfile, setStudentProfile] = useState(DEFAULT_PROFILE);
	
	// Quiz Mode States
	const [quizMode, setQuizMode] = useState(false);
	const [quizData, setQuizData] = useState({
		questions: [],
		currentQuestionIndex: 0,
		answers: [],
		isComplete: false,
		report: null
	});
	
	const recognitionRef = useRef(null);
	const messagesEndRef = useRef(null);
	const synthRef = useRef(null);

	const previewConversation = [
		{ role: "ai", label: "AI", text: "Hey there! Ready for a quick viva warm-up?" },
		{ role: "student", label: "You", text: "Yes! Can we revise photosynthesis today?" },
		{ role: "ai", label: "AI", text: "Absolutely. What triggers the opening of stomata in leaves?" },
		{ role: "student", label: "You", text: "They open when guard cells absorb water and become turgid." },
		{ role: "ai", label: "AI", text: "Perfect! Want me to ask a tougher follow-up or start a quiz?" }
	];

	// Initialize Speech Recognition and Speech Synthesis
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Initialize Speech Recognition (Chrome's Web Speech API)
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			if (SpeechRecognition) {
				const recognition = new SpeechRecognition();
				recognition.continuous = false;
				recognition.interimResults = false;
				recognition.lang = "en-US";

				recognition.onstart = () => {
					setIsListening(true);
					setTranscript("");
				};

				recognition.onresult = (event) => {
					const speechResult = event.results[0][0].transcript;
					setTranscript(speechResult);
					processInput(speechResult, true);
				};

				recognition.onerror = (event) => {
					console.error("Speech recognition error:", event.error);
					setIsListening(false);
					if (event.error === "no-speech") {
						alert("No speech detected. Please try again.");
					} else if (event.error === "not-allowed") {
						alert("Microphone access denied. Please enable microphone permissions.");
					}
				};

				recognition.onend = () => {
					setIsListening(false);
				};

				recognitionRef.current = recognition;
			} else {
				console.error("Speech Recognition not supported");
			}

			// Initialize Speech Synthesis
			synthRef.current = window.speechSynthesis;
		}
	}, []);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	// Load student profile from database
	useEffect(() => {
		const loadProfile = async () => {
			if (!user) return;

			try {
				// Load AI name from localStorage
				const savedName = localStorage.getItem(`ai-companion-name-${user.id}`);
				if (savedName) {
					setAiName(savedName);
				} else {
					const studentFirstName = user.full_name?.split(" ")[0] || "Student";
					setAiName(`${studentFirstName}'s Companion`);
				}

				// Load profile from database
				const response = await fetch(`/api/student-profile?userId=${user.id}`);
				const data = await response.json();

				if (response.ok && data.profile) {
					setStudentProfile(data.profile);
					setShowProfileSetup(false);
				} else {
					// No profile exists, show setup modal
					setShowProfileSetup(true);
				}
			} catch (error) {
				console.error("Error loading profile:", error);
				setShowProfileSetup(true);
			}
		};

		loadProfile();
	}, [user]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Load chat from database
	useEffect(() => {
		if (currentChatId && user) {
			loadChat(currentChatId);
		}
	}, [currentChatId, user]);

	// Save chat to database when messages change
	useEffect(() => {
		if (messages.length > 0 && user) {
			saveChat();
		}
	}, [messages, user]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const loadChat = async (chatId) => {
		try {
			const response = await fetch(`/api/voice-chat?userId=${user.id}`);
			const data = await response.json();
			
			if (response.ok) {
				const chat = data.chats?.find(c => c.id === chatId);
				if (chat) {
					setMessages(chat.messages || []);
					setSelectedNotes(chat.selected_notes || null);
				}
			}
		} catch (error) {
			console.error("Error loading chat:", error);
		}
	};

	const saveChat = async () => {
		try {
			let title = "New Voice Chat";
			let chatIdToSave = currentChatId;
			
			// Check if chat already exists
			const checkResponse = await fetch(`/api/voice-chat?userId=${user.id}`);
			if (checkResponse.ok) {
				const { chats } = await checkResponse.json();
				const existingChat = chats?.find(c => c.id === chatIdToSave);
				
				if (existingChat) {
					// Updating existing chat - keep its title
					title = existingChat.title;
				} else if (messages.length > 0) {
					// New chat - generate title from first user message
					const firstUserMsg = messages.find(m => m.role === "user");
					if (firstUserMsg) {
						title = await generateChatTitle(firstUserMsg.content);
					}
				}
			}

			// Save to database
			const response = await fetch('/api/voice-chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId: user.id,
					chatId: chatIdToSave,
					title,
					messages,
					selectedNotes,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				
				// If this was a new chat, update the currentChatId with the returned ID
				if (!chatIdToSave && data.chat && data.chat.id) {
					setCurrentChatId(data.chat.id);
				}
				
				// Reload chat list
				if (window.reloadVoiceChats) {
					window.reloadVoiceChats();
				}
			}
		} catch (error) {
			console.error("Error saving chat:", error);
		}
	};

	const generateChatTitle = async (firstMessage) => {
		try {
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: [
						{
							role: "system",
							content: "Generate a short, concise title (max 5 words) for a chat that starts with this message. Just return the title, nothing else.",
						},
						{
							role: "user",
							content: firstMessage,
						},
					],
					temperature: 0.7,
					max_tokens: 20,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				return data.choices[0].message.content.trim().replace(/['"]/g, "");
			}
		} catch (error) {
			console.error("Error generating title:", error);
		}
		return "New Voice Chat";
	};

	const handleSelectChat = (chatId) => {
		if (chatId === null) {
			// New chat - use UUID-like format
			setCurrentChatId(null);
			setMessages([]);
			setSelectedNotes(null);
			// Reset quiz mode when starting new chat
			setQuizMode(false);
			setQuizData({
				questions: [],
				currentQuestionIndex: 0,
				answers: [],
				isComplete: false,
				report: null
			});
		} else {
			setCurrentChatId(chatId);
		}
	};

	const handleNotesSelect = (notes) => {
		setSelectedNotes(notes);
	};

	const handleAiNameChange = (newName) => {
		setAiName(newName);
		localStorage.setItem(`ai-companion-name-${user.id}`, newName);
	};

	const handleProfileSave = async (profileData) => {
		try {
			// Update state
			setStudentProfile(profileData);
			// Save to localStorage
			localStorage.setItem(`user_viva_profile_${user.id}`, JSON.stringify(profileData));
			setShowProfileSetup(false);
		} catch (error) {
			console.error("Error saving profile:", error);
			alert("Failed to save profile. Please try again.");
		}
	};

	const handleProfileClose = () => {
		setShowProfileSetup(false);
	};

	const startListening = () => {
		if (recognitionRef.current && !isListening) {
			recognitionRef.current.start();
		}
	};

	const stopListening = () => {
		if (recognitionRef.current && isListening) {
			recognitionRef.current.stop();
		}
	};

	// Start Quiz Mode
	const startQuiz = async () => {
		if (!selectedNotes) {
			alert("Please select study notes first from the Notes tab!");
			return;
		}

		setQuizMode(true);
		setIsProcessing(true);

		try {
			// Generate 4-6 questions based on selected notes
			const numQuestions = Math.floor(Math.random() * 3) + 4; // 4-6 questions
			
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: [
						{
							role: "system",
							content: `You are a quiz generator. Generate exactly ${numQuestions} questions based on the student's study material. Return ONLY a JSON array of questions, no other text. Each question should have: "question" (string), "expectedConcepts" (array of key concepts that should be in a correct answer), "difficulty" (easy/medium/hard).

Example format:
[
  {
    "question": "What is photosynthesis?",
    "expectedConcepts": ["plants make food", "sunlight", "chlorophyll", "carbon dioxide", "oxygen"],
    "difficulty": "easy"
  }
]`,
						},
						{
							role: "user",
							content: `Generate ${numQuestions} questions about: Subject: ${selectedNotes.subject}, Chapter: ${selectedNotes.chapter}, Topic: ${selectedNotes.topic}. Content: ${selectedNotes.content || "General topic coverage"}`,
						},
					],
					temperature: 0.7,
					max_tokens: 1000,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate quiz");
			}

			const data = await response.json();
			const questionsText = data.choices[0].message.content;
			
			// Parse JSON from response
			const questions = JSON.parse(questionsText);

			setQuizData({
				questions,
				currentQuestionIndex: 0,
				answers: [],
				isComplete: false,
				report: null
			});

			// Ask first question
			const firstQuestion = questions[0];
			const welcomeMessage = {
				role: "assistant",
				content: `🎯 Great! Let's start your quiz on ${selectedNotes.topic}. I'll ask you ${questions.length} questions. Ready?\n\n**Question 1/${questions.length}:**\n${firstQuestion.question}`,
				timestamp: new Date().toISOString(),
				hasAudio: true,
				isQuiz: true
			};
			
			setMessages([welcomeMessage]);
			speakText(welcomeMessage.content);

		} catch (error) {
			console.error("Error starting quiz:", error);
			alert("Failed to start quiz. Please try again.");
			setQuizMode(false);
		} finally {
			setIsProcessing(false);
		}
	};

	// Process quiz answer
	const processQuizAnswer = async (answerText) => {
		const currentQuestion = quizData.questions[quizData.currentQuestionIndex];
		
		// Store the answer
		const newAnswers = [...quizData.answers, {
			question: currentQuestion.question,
			userAnswer: answerText,
			expectedConcepts: currentQuestion.expectedConcepts,
			difficulty: currentQuestion.difficulty
		}];

		setQuizData(prev => ({
			...prev,
			answers: newAnswers
		}));

		// Evaluate the answer
		setIsProcessing(true);
		try {
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: [
						{
							role: "system",
							content: `You are evaluating a student's answer. Respond in a friendly, encouraging way. Keep it under 50 words. Give brief feedback on their answer and whether it covers the key concepts. Don't give the full answer yet.`,
						},
						{
							role: "user",
							content: `Question: ${currentQuestion.question}\nStudent Answer: ${answerText}\nKey concepts: ${currentQuestion.expectedConcepts.join(", ")}`,
						},
					],
					temperature: 0.7,
					max_tokens: 100,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to evaluate answer");
			}

			const data = await response.json();
			const feedback = data.choices[0].message.content;

			// Add feedback message
			const feedbackMessage = {
				role: "assistant",
				content: feedback,
				timestamp: new Date().toISOString(),
				hasAudio: true,
				isQuiz: true
			};
			setMessages(prev => [...prev, feedbackMessage]);
			speakText(feedback);

			// Check if there are more questions
			const nextIndex = quizData.currentQuestionIndex + 1;
			
			if (nextIndex < quizData.questions.length) {
				// Ask next question
				setTimeout(() => {
					const nextQuestion = quizData.questions[nextIndex];
					const nextQuestionMessage = {
						role: "assistant",
						content: `**Question ${nextIndex + 1}/${quizData.questions.length}:**\n${nextQuestion.question}`,
						timestamp: new Date().toISOString(),
						hasAudio: true,
						isQuiz: true
					};
					setMessages(prev => [...prev, nextQuestionMessage]);
					speakText(nextQuestionMessage.content);
					
					setQuizData(prev => ({
						...prev,
						currentQuestionIndex: nextIndex
					}));
				}, 2000);
			} else {
				// Quiz complete, generate report
				setTimeout(() => {
					generateQuizReport(newAnswers);
				}, 2000);
			}

		} catch (error) {
			console.error("Error evaluating answer:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	// Generate quiz report
	const generateQuizReport = async (answers) => {
		setIsProcessing(true);
		try {
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: [
						{
							role: "system",
							content: `You are an encouraging teacher creating a quiz report. Analyze the student's answers and provide:
1. Overall score estimation (X out of ${answers.length})
2. Strengths (2-3 points)
3. Areas to review (2-3 points)
4. Encouraging next steps

Keep it positive, specific, and under 200 words. Use emojis to make it engaging.`,
						},
						{
							role: "user",
							content: `Analyze these quiz responses:\n${JSON.stringify(answers, null, 2)}`,
						},
					],
					temperature: 0.7,
					max_tokens: 400,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate report");
			}

			const data = await response.json();
			const report = data.choices[0].message.content;

			const reportMessage = {
				role: "assistant",
				content: `📊 **Quiz Complete!**\n\n${report}\n\n✨ Great job! Would you like to try another quiz or continue with regular chat?`,
				timestamp: new Date().toISOString(),
				hasAudio: true,
				isQuiz: true,
				isReport: true
			};

			setMessages(prev => [...prev, reportMessage]);
			speakText(reportMessage.content);

			setQuizData(prev => ({
				...prev,
				isComplete: true,
				report: report
			}));

			// Exit quiz mode after report
			setTimeout(() => {
				setQuizMode(false);
			}, 1000);

		} catch (error) {
			console.error("Error generating report:", error);
		} finally {
			setIsProcessing(false);
		}
	};

	const processInput = async (inputText, isVoice = true) => {
		// If in quiz mode, process as quiz answer
		if (quizMode && !quizData.isComplete) {
			const userMessage = {
				role: "user",
				content: inputText,
				timestamp: new Date().toISOString(),
				hasAudio: false,
				isQuiz: true
			};
			setMessages(prev => [...prev, userMessage]);
			
			await processQuizAnswer(inputText);
			return;
		}


		setIsProcessing(true);

		// Add user message
		const userMessage = {
			role: "user",
			content: inputText,
			timestamp: new Date().toISOString(),
			hasAudio: false,
		};
		setMessages((prev) => [...prev, userMessage]);

		try {
			// Build context with student profile and selected notes
			const companionName = aiName || "AI Companion";
			const studentFirstName = studentProfile.name.split(" ")[0];
			const mentorSummary = studentProfile.mentors
				?.map((mentor) => `${mentor.name} (${mentor.role})`)
				.join(", ");
			const profileContext = [
				`Student: ${studentProfile.name}, Grade ${studentProfile.class} Section ${studentProfile.section}, House ${studentProfile.house}.`,
				`Learning style: ${studentProfile.learningStyle}.`,
				`Interests: ${studentProfile.interests.join(", ")}.`,
				`Recent wins: ${studentProfile.recentWins.join("; ")}.`,
				`Goals: ${studentProfile.academicGoals.join("; ")}.`,
				`Strengths: ${studentProfile.strengths.join("; ")}.`,
				mentorSummary ? `Mentor circle: ${mentorSummary}.` : null,
				`Study schedule weekdays ${studentProfile.studySchedule?.weekday} and weekends ${studentProfile.studySchedule?.weekend}.`
			]
				.filter(Boolean)
				.join(" ");
		let systemContext = `You are ${companionName}, the spirited iGyanAI mentor for ${studentFirstName}. Mix clarity with playful wit, lean into ${studentFirstName}'s love for comedy, and give crisp explanations that nod to their strengths and goals. Keep the tone encouraging, modern, and emoji-friendly. Cap responses at 140 words for smooth narration. Always reference at least one relevant detail from the student profile or their recent wins/goals.`;
	
		if (selectedNotes) {
			if (selectedNotes.isCustom && selectedNotes.customContent) {
				systemContext += `\n\nStudent's Custom Notes - "${selectedNotes.chapter}":\n${selectedNotes.customContent}\n\nUse this custom note content as reference when answering questions. Connect explanations back to what the student has written in their notes.`;
			} else {
				systemContext += `\n\nCurrent study focus: Subject ${selectedNotes.subject}, Chapter ${selectedNotes.chapter}, Topic ${selectedNotes.topic}. Connect explanations back to this focus and suggest how it links to ${studentFirstName}'s ambitions.`;
			}
		}

		systemContext += `\n\nStudent profile insights: ${profileContext}`;			// Call OpenAI API for AI response
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: [
						{
							role: "system",
							content: systemContext,
						},
						...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
						{
							role: "user",
							content: inputText,
						},
					],
					temperature: 0.7,
					max_tokens: 300,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get AI response");
			}

			const data = await response.json();
			const aiResponse = data.choices[0].message.content;

			// Add AI response message
			const aiMessage = {
				role: "assistant",
				content: aiResponse,
				timestamp: new Date().toISOString(),
				hasAudio: true,
			};
			setMessages((prev) => [...prev, aiMessage]);

			// Speak the response using Web Speech API (only if voice mode or user preference)
			if (isVoice || inputMode === "voice") {
				speakText(aiResponse);
			}
		} catch (error) {
			console.error("Error processing voice:", error);
			const errorMessage = {
				role: "assistant",
				content:
					"Sorry, I encountered an error processing your request. Please make sure your API key is configured correctly.",
				timestamp: new Date().toISOString(),
				isError: true,
				hasAudio: false,
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsProcessing(false);
		}
	};

	const speakText = (text) => {
		if (synthRef.current) {
			// Cancel any ongoing speech
			synthRef.current.cancel();

			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 1.0;
			utterance.pitch = 1.0;
			utterance.volume = 1.0;

			// Try to use a female voice if available
			const voices = synthRef.current.getVoices();
			const femaleVoice =
				voices.find((voice) => voice.name.includes("Female")) ||
				voices.find((voice) => voice.name.includes("Zira")) ||
				voices.find((voice) => voice.name.includes("Google US English")) ||
				voices[0];

			if (femaleVoice) {
				utterance.voice = femaleVoice;
			}

			// Add event listeners
			utterance.onstart = () => {
				setIsSpeaking(true);
			};

			utterance.onend = () => {
				setIsSpeaking(false);
			};

			utterance.onerror = () => {
				setIsSpeaking(false);
			};

			synthRef.current.speak(utterance);
		}
	};

	const stopSpeaking = () => {
		if (synthRef.current) {
			synthRef.current.cancel();
			setIsSpeaking(false);
		}
	};

	const toggleListening = () => {
		if (isListening) {
			stopListening();
		} else {
			// Stop any ongoing speech when starting to listen
			stopSpeaking();
			startListening();
		}
	};

	const replayAudio = (messageContent) => {
		speakText(messageContent);
	};

	const handleTextSubmit = () => {
		if (!textInput.trim() || isProcessing) return;
		
		processInput(textInput.trim(), false);
		setTextInput("");
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleTextSubmit();
		}
	};

	// Stop speech when changing tabs or modes
	useEffect(() => {
		return () => {
			stopSpeaking();
		};
	}, [activeTab]);

	useEffect(() => {
		stopSpeaking();
	}, [inputMode]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading AI Companion...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<>
			{/* Profile Setup Modal */}
			{showProfileSetup && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
					<div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-purple-200/50 bg-white dark:border-purple-900/30 dark:bg-zinc-900 shadow-2xl">
						<div className="sticky top-0 z-10 p-6 border-b" style={{
							background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`,
							borderColor: 'var(--dashboard-border)'
						}}>
							<h2 className="text-2xl font-bold text-white drop-shadow-sm">
								✨ Welcome! Let's Set Up Your Profile
							</h2>
							<p className="text-white/80 text-sm mt-1">
								Tell us about yourself to personalize your learning experience
							</p>
							<button
								onClick={handleProfileClose}
								className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
								title="Close"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
									<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
								</svg>
							</button>
						</div>
						<ProfileSetupForm 
							onSave={handleProfileSave} 
							userName={user?.full_name || ""} 
						/>
					</div>
				</div>
			)}

			<div className="flex h-[calc(100vh-4rem)] gap-6 p-4 lg:p-6 max-w-[1400px] mx-auto" style={{
				background: 'var(--dashboard-background)'
			}}>
				{/* Sidebar */}
			<div className={`${isSidebarOpen ? "w-80" : "w-0"} shrink-0 transition-all duration-300 overflow-hidden`}>
				<div className="flex h-full flex-col rounded-3xl border border-purple-200/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 dark:border-purple-900/30 dark:bg-zinc-900/80">
				{/* Sidebar Header with Gradient */}
				<div className="relative border-b p-6 overflow-hidden" style={{
					background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`,
					borderColor: 'var(--dashboard-border)'
				}}>
					<div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')" }}></div>
					<div className="relative flex items-center gap-3">
						<div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg overflow-hidden">
							<Image
								src="/asset/vivabg.jpg"
								alt=""
								fill
								className="object-cover opacity-80"
								priority={false}
							/>
							<Image
								src="/asset/viva.png"
								alt="Viva AI Avatar"
								width={48}
								height={48}
								className="relative z-10 object-cover"
							/>
						</div>
						<div>
							<h2 className="text-lg font-bold text-white drop-shadow-sm">
								{aiName || "AI Companion"}
							</h2>
							<p className="text-xs text-white/90 font-medium">
								Voice Learning Assistant
							</p>
						</div>
					</div>
				</div>
					{/* Tabs */}
					<div className="flex border-b" style={{
						borderColor: 'var(--dashboard-border)',
						background: `linear-gradient(180deg, color-mix(in srgb, var(--dashboard-primary) 8%, transparent), transparent)`
					}}>
						<button
							onClick={() => setActiveTab("chats")}
							className={`group flex-1 px-4 py-3.5 text-sm font-medium transition-all duration-200 relative`}
							style={{
								color: activeTab === "chats" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
							}}
						>
							{activeTab === "chats" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{
									background: `linear-gradient(90deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, transparent))`
								}}></div>
							)}
							<div className="flex items-center justify-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
									<path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-5.183.501.78.78 0 00-.528.224l-3.579 3.58A.75.75 0 016 17.25v-3.443a41.033 41.033 0 01-2.57-.33C1.993 13.244 1 11.986 1 10.573V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
								</svg>
								Chats
							</div>
						</button>
						<button
							onClick={() => setActiveTab("profile")}
							className={`group flex-1 px-4 py-3.5 text-sm font-medium transition-all duration-200 relative`}
							style={{
								color: activeTab === "profile" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
							}}
						>
							{activeTab === "profile" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{
									background: `linear-gradient(90deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, transparent))`
								}}></div>
							)}
							<div className="flex items-center justify-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
									<path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
								</svg>
								Profile
							</div>
						</button>
						<button
							onClick={() => setActiveTab("notes")}
							className={`group flex-1 px-4 py-3.5 text-sm font-medium transition-all duration-200 relative`}
							style={{
								color: activeTab === "notes" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
							}}
						>
							{activeTab === "notes" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{
									background: `linear-gradient(90deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, transparent))`
								}}></div>
							)}
							<div className="flex items-center justify-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
									<path d="M3.196 12.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 12.87z" />
									<path d="M3.196 8.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 8.87z" />
									<path d="M10.38 1.103a.75.75 0 00-.76 0l-7.25 4.25a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.76 0l7.25-4.25a.75.75 0 000-1.294l-7.25-4.25z" />
								</svg>
								Notes
							</div>
						</button>
					</div>

					{/* Tab Content */}
					<div className="flex-1 overflow-y-auto p-4">
						{activeTab === "chats" && (
							<VoiceChatHistory
								onSelectChat={handleSelectChat}
								currentChatId={currentChatId}
								userId={user?.id}
							/>
						)}
						{activeTab === "profile" && (
							<StudentProfile 
								aiName={aiName}
								onAiNameChange={handleAiNameChange}
								studentProfile={studentProfile}
								userId={user?.id}
								onProfileUpdate={() => setShowProfileSetup(true)}
							/>
						)}
						{activeTab === "notes" && (
							<NotesSelector
								onNotesSelect={handleNotesSelect}
								selectedNotes={selectedNotes}
								userGrade={studentProfile.class || "9"}
							/>
						)}
					</div>
				</div>
			</div>

			{/* Main Chat Area */}
			<div className="flex flex-1 flex-col rounded-3xl border border-purple-200/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 dark:border-purple-900/30 dark:bg-zinc-900/80 overflow-hidden">
				{/* Header with Gradient */}
				<div className="relative flex items-center justify-between border-b backdrop-blur-md px-5 py-1 md:px-6" style={{
					borderColor: 'var(--dashboard-border)',
					backgroundColor: 'var(--dashboard-surface)'
				}}>
					<div className="absolute inset-0" style={{
						background: `linear-gradient(90deg, color-mix(in srgb, var(--dashboard-primary) 5%, transparent), color-mix(in srgb, var(--dashboard-primary) 3%, transparent), color-mix(in srgb, var(--dashboard-primary) 5%, transparent))`
					}}></div>
					<div className="relative flex items-center gap-4">
						<button
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="group rounded-xl p-2.5 text-zinc-600 transition-all duration-200 hover:bg-purple-100 hover:text-purple-600 dark:text-zinc-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 transition-transform group-hover:scale-110">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
							</svg>
						</button>
						<div className="relative">
							<div className="absolute inset-0 animate-pulse rounded-full opacity-20 blur-md" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}></div>
							<div className="relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg overflow-hidden" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`,
								boxShadow: `0 10px 25px -10px var(--dashboard-primary)`
							}}>
								<Image
									src="/asset/vivabg.jpg"
									alt=""
									fill
									className="object-cover opacity-70"
								/>
								<Image
									src="/asset/viva.png"
									alt="Viva AI Avatar"
									width={48}
									height={48}
									className="relative z-10 object-cover"
								/>
							</div>
						</div>
						<div>
							<h2 className="text-lg font-bold text-zinc-900 dark:text-white">
								{aiName || "AI Companion"}
							</h2>
							<p className="text-xs font-medium" style={{color: 'var(--dashboard-muted)'}}>
								{selectedNotes ? (
									<span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5" style={{
										backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)',
										color: 'var(--dashboard-primary)'
									}}>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
											<path d="M3.196 12.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 12.87z" />
											<path d="M3.196 8.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 8.87z" />
											<path d="M10.38 1.103a.75.75 0 00-.76 0l-7.25 4.25a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.76 0l7.25-4.25a.75.75 0 000-1.294l-7.25-4.25z" />
										</svg>
										{selectedNotes.subject} • {selectedNotes.topic}
									</span>
								) : (
									"Speak naturally, learn effortlessly ✨"
								)}
							</p>
						</div>
					</div>
					<div className="relative flex items-center gap-3">
						{isListening && (
							<div className="flex items-center gap-2.5 rounded-full bg-red-100 px-4 py-2 dark:bg-red-900/30">
								<div className="relative flex h-3 w-3">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
									<span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
								</div>
								<span className="text-sm font-semibold text-red-600 dark:text-red-400">
									Listening...
								</span>
							</div>
						)}
						{isSpeaking && (
							<button
								onClick={stopSpeaking}
								className="flex items-center gap-2.5 rounded-full bg-purple-100 px-4 py-2 transition-all hover:bg-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/50"
								title="Stop speaking"
							>
								<div className="relative flex h-3 w-3">
									<span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-purple-500 opacity-75"></span>
									<span className="relative inline-flex h-3 w-3 rounded-full bg-purple-500"></span>
								</div>
								<span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
									Speaking...
								</span>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-purple-600 dark:text-purple-400">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
								</svg>
							</button>
						)}
					</div>
				</div>

				{/* Messages Container */}
				<div className="flex-1 overflow-y-auto p-6 pt-12 no-scrollbar">
					{messages.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-start gap-6 text-center px-4 pt-8 pb-12">
							{/* Large Centered Avatar */}
							<div className="relative mb-4">
								{/* Animated sound wave rings when listening */}
								{isListening && (
									<>
										<div className="absolute inset-0 -m-12 flex items-center justify-center">
											<div className="absolute w-48 h-48 rounded-full border-2 animate-sound-wave-1" style={{borderColor: 'color-mix(in srgb, var(--dashboard-primary) 40%, transparent)'}}></div>
											<div className="absolute w-56 h-56 rounded-full border-2 animate-sound-wave-2" style={{borderColor: 'color-mix(in srgb, var(--dashboard-primary) 30%, transparent)'}}></div>
											<div className="absolute w-64 h-64 rounded-full border-2 animate-sound-wave-3" style={{borderColor: 'color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'}}></div>
										</div>
									</>
								)}
								
								{/* Glow effect when idle */}
								{!isListening && !isProcessing && (
									<div className="absolute inset-0 animate-pulse rounded-full opacity-20 blur-3xl" style={{
										background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
									}}></div>
								)}
								
								{/* Main Avatar Circle - Large */}
								<div className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden shadow-2xl ${isListening ? 'scale-110' : isSpeaking ? 'scale-105' : 'scale-100'}`} style={{
									border: '6px solid var(--dashboard-border)',
									backgroundColor: 'var(--dashboard-card)',
									boxShadow: isListening 
										? `0 25px 70px -15px var(--dashboard-primary)` 
										: isSpeaking
										? `0 20px 60px -10px var(--dashboard-primary)`
										: `0 15px 50px -10px var(--dashboard-primary)`
								}}>
									<Image
										src="/asset/vivabg.jpg"
										alt=""
										fill
										className="object-cover opacity-70"
										priority={false}
									/>
									<Image
										src="/asset/viva.png"
										alt="Viva AI Avatar"
										width={160}
										height={160}
										className="relative z-10 object-cover w-full h-full"
										priority
									/>
								</div>
							</div>

							{/* Title */}
							<h2 className="text-2xl font-bold mb-1" style={{color: 'var(--dashboard-heading)'}}>
								AI Viva conversation
							</h2>
							
							{/* Selected Notes or Subtitle */}
							{selectedNotes ? (
								<div className="flex items-center gap-2 rounded-full px-4 py-2 mb-4" style={{
									backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
									color: 'var(--dashboard-primary)'
								}}>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
										<path d="M3.196 12.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 12.87z" />
										<path d="M3.196 8.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 8.87z" />
										<path d="M10.38 1.103a.75.75 0 00-.76 0l-7.25 4.25a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.76 0l7.25-4.25a.75.75 0 000-1.294l-7.25-4.25z" />
									</svg>
									<span className="text-sm font-medium">{selectedNotes.subject} • {selectedNotes.topic}</span>
								</div>
							) : (
								<p className="text-sm mb-4" style={{color: 'var(--dashboard-muted)'}}>
									Speak naturally, learn effortlessly ✨
								</p>
							)}

							{/* Quick suggestion prompts - optional */}
							<div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mt-6">
								{/* Simple prompt chips */}
								<button 
									onClick={() => {
										setIsSidebarOpen(true);
										setActiveTab("notes");
									}}
									className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
									style={{
										backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
										color: 'var(--dashboard-primary)',
										border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
									}}
								>
									📚 Select Study Notes
								</button>
								<button 
									onClick={() => {
										setIsSidebarOpen(true);
										setActiveTab("chats");
									}}
									className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
									style={{
										backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)',
										color: 'var(--dashboard-primary)',
										border: '1px solid color-mix(in srgb, var(--dashboard-primary) 20%, transparent)'
									}}
								>
									💬 View Chat History
								</button>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{messages.map((message, index) => (
								<VoiceMessage
									key={index}
									message={message}
									onReplay={replayAudio}
									onStop={stopSpeaking}
									isSpeaking={isSpeaking}
								/>
							))}
							{isProcessing && (
								<div className="flex gap-3 justify-start">
									<div className="flex h-8 w-8 items-center justify-center rounded-full" style={{
										background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
									}}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											className="h-5 w-5 text-white"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
											/>
										</svg>
									</div>
									<div className="rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
										<div className="flex gap-1">
											<span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></span>
											<span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></span>
											<span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></span>
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</div>
					)}
				</div>

				{/* Input Area - Voice and Text */}
				<div className="relative border-t backdrop-blur-md p-4" style={{
					borderColor: 'var(--dashboard-border)',
					backgroundColor: 'var(--dashboard-surface)'
				}}>
					<div className="absolute inset-0" style={{
						background: `linear-gradient(0deg, color-mix(in srgb, var(--dashboard-primary) 5%, transparent), color-mix(in srgb, var(--dashboard-primary) 3%, transparent), transparent)`
					}}></div>
					<div className="relative space-y-3">
						{/* Quiz Mode Banner */}
						{quizMode && !quizData.isComplete && (
							<div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-white">
								<div className="flex items-center gap-2">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 13.24a.75.75 0 001.1 1.02l2.1-2.25a.75.75 0 00.2-.51V6.75z" clipRule="evenodd" />
									</svg>
									<span className="text-sm font-semibold">
										Quiz Mode: Question {quizData.currentQuestionIndex + 1} of {quizData.questions.length}
									</span>
								</div>
								<button
									onClick={() => {
										if (confirm("Are you sure you want to exit the quiz? Your progress will be lost.")) {
											setQuizMode(false);
											setQuizData({
												questions: [],
												currentQuestionIndex: 0,
												answers: [],
												isComplete: false,
												report: null
											});
										}
									}}
									className="text-white/80 hover:text-white transition-colors"
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
										<path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
									</svg>
								</button>
							</div>
						)}

						{/* Mode Toggle */}
						<div className="flex items-center justify-center gap-2">
							{!quizMode && selectedNotes && (
								<button
									onClick={startQuiz}
									disabled={isProcessing}
									className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
									</svg>
									Start Quiz
								</button>
							)}
							<button
								onClick={() => setInputMode("voice")}
								disabled={quizMode}
								className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${quizMode ? 'opacity-50 cursor-not-allowed' : ''}`}
								style={
									inputMode === "voice"
										? {
											backgroundColor: 'var(--dashboard-primary)',
											color: 'var(--dashboard-primary-foreground)',
											boxShadow: '0 4px 12px -4px var(--dashboard-primary)'
										}
										: {
											color: 'var(--dashboard-muted)',
											backgroundColor: 'transparent'
										}
								}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
									<path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
									<path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
								</svg>
								Voice Mode
							</button>
							<button
								onClick={() => setInputMode("text")}
								disabled={quizMode}
								className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${quizMode ? 'opacity-50 cursor-not-allowed' : ''}`}
								style={
									inputMode === "text"
										? {
											backgroundColor: 'var(--dashboard-primary)',
											color: 'var(--dashboard-primary-foreground)',
											boxShadow: '0 4px 12px -4px var(--dashboard-primary)'
										}
										: {
											color: 'var(--dashboard-muted)',
											backgroundColor: 'transparent'
										}
								}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
									<path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 001.28.53l3.58-3.579a.78.78 0 01.527-.224 41.202 41.202 0 005.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2zm0 7a1 1 0 100-2 1 1 0 000 2zM8 8a1 1 0 11-2 0 1 1 0 012 0zm5 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
								</svg>
								Text Mode
							</button>
						</div>

						{/* Voice Input */}
						{inputMode === "voice" && (
							<div className="flex flex-col items-center gap-3 py-2">
								<div className="relative">
									{/* Pulse rings for listening state */}
									{isListening && (
										<>
											<div className="absolute inset-0 -m-6 animate-ping rounded-full bg-red-500 opacity-20"></div>
											<div className="absolute inset-0 -m-3 animate-pulse rounded-full bg-red-500 opacity-30"></div>
										</>
									)}
									{/* Glow effect for idle state */}
									{!isListening && !isProcessing && (
										<div className="absolute inset-0 -m-4 animate-pulse rounded-full opacity-20 blur-xl" style={{
											background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
										}}></div>
									)}
									<button
										onClick={toggleListening}
										disabled={isProcessing}
										className="group relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 transform shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
										style={{
											background: isListening 
												? 'linear-gradient(135deg, #ef4444, #dc2626)' 
												: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 85%, #000))`,
											boxShadow: isListening 
												? '0 20px 40px -15px rgba(239, 68, 68, 0.5)' 
												: `0 20px 40px -15px var(--dashboard-primary)`,
											transform: isListening ? 'scale(1.05)' : 'scale(1)'
										}}
										onMouseEnter={(e) => {
											if (!isListening && !isProcessing) {
												e.currentTarget.style.transform = 'scale(1.1)';
											}
										}}
										onMouseLeave={(e) => {
											if (!isListening && !isProcessing) {
												e.currentTarget.style.transform = 'scale(1)';
											}
										}}
									>
										{isListening ? (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												className="h-8 w-8 text-white transition-transform group-hover:scale-90"
											>
												<path
													fillRule="evenodd"
													d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
													clipRule="evenodd"
												/>
											</svg>
										) : (
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												className="h-8 w-8 text-white transition-transform group-hover:scale-110"
											>
												<path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
												<path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
											</svg>
										)}
									</button>
								</div>
								<p className="text-sm font-medium text-center" style={{color: 'var(--dashboard-heading)'}}>
									{isListening
										? "🎤 Listening..."
										: isProcessing
										? "⚡ Processing..."
										: "Click mic to speak"}
								</p>
							</div>
						)}

						{/* Text Input */}
						{inputMode === "text" && (
							<div className="flex gap-2">
								<div className="relative flex-1">
									<textarea
										value={textInput}
										onChange={(e) => setTextInput(e.target.value)}
										onKeyPress={handleKeyPress}
										placeholder="Type your message here..."
										rows="2"
										className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
										disabled={isProcessing}
									/>
									<button
										onClick={toggleListening}
										disabled={isProcessing}
										className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg p-2 transition-all ${
											isListening
												? 'bg-red-500 text-white animate-pulse'
												: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
										}`}
										title={isListening ? 'Stop recording' : 'Use voice input'}
									>
										{isListening ? (
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
												<path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
												<path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
											</svg>
										) : (
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
												<path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
												<path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
											</svg>
										)}
									</button>
								</div>
								<button
									onClick={handleTextSubmit}
									disabled={!textInput.trim() || isProcessing}
									className="flex items-center justify-center rounded-xl px-6 text-white transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
									style={{
										background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 85%, #000))`
									}}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
										<path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
									</svg>
								</button>
							</div>
						)}

						<p className="text-xs text-center" style={{color: 'var(--dashboard-muted)'}}>
							{quizMode
								? "🎯 Answer the question above - the AI will evaluate your response"
								: inputMode === "text" 
								? "Press Enter to send • Shift+Enter for new line • Click mic for voice"
								: selectedNotes
								? "Speak your question or click 'Start Quiz' to test your knowledge"
								: "Speak your question clearly and the AI will respond with voice"}
						</p>
					</div>
				</div>
			</div>
		</div>
		</>
	);
}
