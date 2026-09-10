"use client";

import { useEffect, useState, useRef } from "react";
import { aiFetch } from "@/app/utils/ai-fallback";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../utils/auth_context";
import ChatMessage from "./components/ChatMessage";
import ChatInput from "./components/ChatInput";
import TypingIndicator from "./components/TypingIndicator";
import EmptyState from "./components/EmptyState";
import ChatHistory from "./components/ChatHistory";
import MemoryList from "./components/MemoryList";
import StudentProfile from "./components/StudentProfile";
import NotesSelector from "./components/NotesSelector";
import ModeSelector, { AI_MODES } from "./components/ModeSelector";
import { supabase } from "../../utils/supabase";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function AICopilotPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [messages, setMessages] = useState([]);
	const [inputMessage, setInputMessage] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [sessionMemories, setSessionMemories] = useState([]);
	const [overallMemories, setOverallMemories] = useState([]);
	const [currentChatId, setCurrentChatId] = useState(null);
	const [chatHistory, setChatHistory] = useState([]);
	const [sidebarView, setSidebarView] = useState("chats"); // chats, session-memory, overall-memory, profile, notes
	const [selectedNotes, setSelectedNotes] = useState(null);
	const [generatingTitle, setGeneratingTitle] = useState(false);
	const [selectedMode, setSelectedMode] = useState(null);
	const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [recognition, setRecognition] = useState(null);
	const [userProfile, setUserProfile] = useState(null);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [profileForm, setProfileForm] = useState({
		interests: '',
		classTeacher: '',
		sleepTime: '',
	});
	const messagesEndRef = useRef(null);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	// Fetch user profile and school data
	useEffect(() => {
		if (user) {
			fetchUserProfile();
		}
	}, [user]);

	const fetchUserProfile = async () => {
		if (!user) return;

		try {
			// Get profile data from localStorage first
			const savedProfile = localStorage.getItem(`user_profile_${user.id}`);
			if (savedProfile) {
				setUserProfile(JSON.parse(savedProfile));
				return;
			}

			// Build profile from user data
			const profile = {
				name: user.full_name || user.email.split('@')[0],
				class: user.student_profile?.class || user.faculty_profile?.subjects || '',
				school: {
					name: '',
					location: '',
				},
				interests: [],
				classTeacher: '',
				sleepTime: '',
			};

			// Fetch school data if school_id exists
			if (user.school_id) {
				const { data: schoolData } = await supabase
					.from('schools')
					.select('school_name, city, state')
					.eq('id', user.school_id)
					.single();

				if (schoolData) {
					profile.school.name = schoolData.school_name;
					profile.school.location = `${schoolData.city}, ${schoolData.state}`;
				}
			}

			setUserProfile(profile);
			localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(profile));
		} catch (error) {
			console.error('Error fetching profile:', error);
		}
	};

	// Load data from localStorage
	useEffect(() => {
		if (user) {
			const savedChats = localStorage.getItem(`chat_history_${user.id}`);
			const savedSessionMemories = localStorage.getItem(`session_memories_${user.id}`);
			const savedOverallMemories = localStorage.getItem(`overall_memories_${user.id}`);
			
			if (savedChats) {
				const chats = JSON.parse(savedChats);
				setChatHistory(chats);
				
				if (chats.length > 0) {
					const latestChat = chats[0];
					setCurrentChatId(latestChat.id);
					setMessages(latestChat.messages);
				}
			}
			
			if (savedSessionMemories) {
				setSessionMemories(JSON.parse(savedSessionMemories));
			}
			
			if (savedOverallMemories) {
				setOverallMemories(JSON.parse(savedOverallMemories));
			}
		}
	}, [user]);

	// Initialize speech recognition
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			if (SpeechRecognition) {
				const recognitionInstance = new SpeechRecognition();
				recognitionInstance.continuous = true;
				recognitionInstance.interimResults = true;
				recognitionInstance.lang = 'en-US';

				recognitionInstance.onresult = (event) => {
					let interimTranscript = '';
					let finalTranscript = '';

					for (let i = event.resultIndex; i < event.results.length; i++) {
						const transcript = event.results[i][0].transcript;
						if (event.results[i].isFinal) {
							finalTranscript += transcript + ' ';
						} else {
							interimTranscript += transcript;
						}
					}

					if (finalTranscript) {
						setInputMessage(prev => prev + finalTranscript);
					}
				};

				recognitionInstance.onerror = (event) => {
					console.error('Speech recognition error:', event.error);
					setIsListening(false);
				};

				recognitionInstance.onend = () => {
					setIsListening(false);
				};

				setRecognition(recognitionInstance);
			}
		}
	}, []);

	// Auto-scroll to bottom
	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// Save chat to localStorage
	const saveChat = (chatId, updatedMessages, chatTitle = null) => {
		if (!user) return;
		
		const chatIndex = chatHistory.findIndex(chat => chat.id === chatId);
		let updatedChatHistory;
		
		if (chatIndex !== -1) {
			// Update existing chat
			updatedChatHistory = [...chatHistory];
			updatedChatHistory[chatIndex] = {
				...updatedChatHistory[chatIndex],
				messages: updatedMessages,
				updatedAt: new Date().toISOString(),
				...(chatTitle && { title: chatTitle }),
			};
		} else {
			// Create new chat
			const newChat = {
				id: chatId,
				title: chatTitle || "New Chat",
				messages: updatedMessages,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			updatedChatHistory = [newChat, ...chatHistory];
		}
		
		setChatHistory(updatedChatHistory);
		localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(updatedChatHistory));
	};

	// Save memory summary
	const saveMemory = (summary, type = "overall") => {
		if (!user) return;
		
		const newMemory = {
			id: Date.now().toString(),
			summary,
			chatId: currentChatId,
			createdAt: new Date().toISOString(),
		};
		
		if (type === "session") {
			const updatedMemories = [newMemory, ...sessionMemories];
			setSessionMemories(updatedMemories);
			localStorage.setItem(`session_memories_${user.id}`, JSON.stringify(updatedMemories));
		} else {
			const updatedMemories = [newMemory, ...overallMemories];
			setOverallMemories(updatedMemories);
			localStorage.setItem(`overall_memories_${user.id}`, JSON.stringify(updatedMemories));
		}
	};

	// Call OpenAI API
	const callOpenAI = async (conversationMessages) => {
		try {
			const response = await aiFetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: conversationMessages,
					temperature: 0.7,
					max_tokens: 1000,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get response from OpenAI");
			}

			const data = await response.json();
			return data.choices[0].message.content;
		} catch (error) {
			console.error("OpenAI API Error:", error);
			throw error;
		}
	};

	// Generate memory summary
	const generateMemorySummary = async (conversationMessages, type = "overall") => {
		try {
			const summaryPrompt = [
				{
					role: "system",
					content: type === "session" 
						? "You are a helpful assistant that creates concise summaries. Create a 3-line summary of the most recent exchange focusing on the question asked and answer provided."
						: "You are a helpful assistant that creates concise summaries. Create a 5-line summary of the entire conversation that captures the key topics discussed, main questions asked, and important solutions provided.",
				},
				{
					role: "user",
					content: `Please create a ${type === "session" ? "3-line recent" : "5-line overall"} summary of this conversation:\n\n${conversationMessages
						.map((msg) => `${msg.role}: ${msg.content}`)
						.join("\n")}`,
				},
			];

			const summary = await callOpenAI(summaryPrompt);
			saveMemory(summary, type);
		} catch (error) {
			console.error("Failed to generate summary:", error);
		}
	};

	// Build context from selected notes and profile
	const buildContextPrompt = () => {
		if (!userProfile) {
			return `You are Sudarshan AI, a helpful educational assistant. `;
		}

		let context = `You are Sudarshan AI, helping ${userProfile.name}`;
		
		if (userProfile.class) {
			context += `, a Class ${userProfile.class} student`;
		}
		
		if (userProfile.school?.name) {
			context += ` from ${userProfile.school.name}`;
			if (userProfile.school?.location) {
				context += `, ${userProfile.school.location}`;
			}
		}
		
		context += `. `;
		
		if (userProfile.classTeacher) {
			context += `Their class teacher is ${userProfile.classTeacher}. `;
		}
		
		if (userProfile.interests && userProfile.interests.length > 0) {
			context += `The student is interested in ${userProfile.interests.join(", ")}. `;
		}
		
		if (userProfile.sleepTime) {
			context += `Their sleep time is ${userProfile.sleepTime}. `;
		}
		
		// Add mode-specific instructions
		if (selectedMode) {
			const mode = AI_MODES.find(m => m.id === selectedMode);
			if (mode) {
				context += `\n\n${mode.systemPrompt} `;
			}
		}
		
		if (selectedNotes) {
			const classLabel = selectedNotes.grade ? selectedNotes.grade.replace(/^Grade\b/i, "Class") : "their class";
			context += `\n\nThe student is currently studying: ${classLabel}, ${selectedNotes.subject}, ${selectedNotes.chapter}, Topic: ${selectedNotes.topic}. `;
			context += `Please provide answers relevant to this specific topic and pitched at the difficulty level of ${classLabel} NCERT curriculum.`;
		}
		
		return context;
	};

	// Handle send message
	// Generate chat title using AI
	const generateChatTitle = async (firstMessage) => {
		try {
			const titlePrompt = [
				{
					role: "system",
					content: "You are a helpful assistant that creates short, catchy titles. Create a 3-5 word title that captures the essence of the question. Be creative and engaging. Return ONLY the title, nothing else.",
				},
				{
					role: "user",
					content: `Create a short title for this question: "${firstMessage}"`,
				},
			];

			const title = await callOpenAI(titlePrompt);
			return title.trim().replace(/['"]/g, ''); // Remove quotes if AI adds them
		} catch (error) {
			console.error("Failed to generate title:", error);
			return firstMessage.slice(0, 50);
		}
	};

	// Handle key press for Enter to send
	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const handleSendMessage = async () => {
		if (!inputMessage.trim() || isTyping) return;

		const userMessage = {
			role: "user",
			content: inputMessage.trim(),
			timestamp: new Date().toISOString(),
		};

		// Generate chat ID if new chat
		const chatId = currentChatId || Date.now().toString();
		if (!currentChatId) {
			setCurrentChatId(chatId);
		}

		const updatedMessages = [...messages, userMessage];
		setMessages(updatedMessages);
		setInputMessage("");
		setIsTyping(true);

		// Save user message
		saveChat(chatId, updatedMessages);

		try {
			const conversationMessages = updatedMessages.map((msg) => ({
				role: msg.role,
				content: msg.content,
			}));

			// Add system message with context
			const contextPrompt = buildContextPrompt();
			conversationMessages.unshift({
				role: "system",
				content: `You are a helpful, friendly, and knowledgeable AI assistant for iGyanAI, an educational platform. ${contextPrompt}

IMPORTANT FORMATTING RULES:
- Be warm, encouraging, and conversational in tone
- Use emojis occasionally to make responses friendly (📚, ✨, 💡, 🎯, etc.)
- Break down complex concepts into simple steps
- Use bullet points and numbered lists when explaining multiple points
- Add line breaks between paragraphs for readability
- End with an encouraging note or ask if they need more clarification
- Keep language simple and relatable for a 9th-grade student`,
			});

			const aiResponse = await callOpenAI(conversationMessages);

			const assistantMessage = {
				role: "assistant",
				content: aiResponse,
				timestamp: new Date().toISOString(),
			};

			const finalMessages = [...updatedMessages, assistantMessage];
			setMessages(finalMessages);
			
			// Generate AI title for new chats
			if (!currentChatId || messages.length === 0) {
				setGeneratingTitle(true);
				const aiTitle = await generateChatTitle(userMessage.content);
				saveChat(chatId, finalMessages, aiTitle);
				setGeneratingTitle(false);
			} else {
				saveChat(chatId, finalMessages);
			}

			// Generate summary after EVERY exchange (both session and overall)
			// Session memory - last 2 messages (user + assistant)
			await generateMemorySummary(
				finalMessages.slice(-2).map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				"session"
			);

			// Overall memory - entire conversation
			await generateMemorySummary(
				finalMessages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				})),
				"overall"
			);
		} catch (error) {
			const errorMessage = {
				role: "assistant",
				content: "I apologize, but I encountered an error. Please try again.",
				timestamp: new Date().toISOString(),
				isError: true,
			};
			const errorMessages = [...updatedMessages, errorMessage];
			setMessages(errorMessages);
			saveChat(chatId, errorMessages);
		} finally {
			setIsTyping(false);
		}
	};

	const startNewChat = () => {
		setMessages([]);
		setCurrentChatId(null);
		setSessionMemories([]); // Clear session memories on new chat
		setSelectedMode(null); // Reset mode selection on new chat
		if (user) {
			localStorage.removeItem(`session_memories_${user.id}`);
		}
	};

	const loadChat = (chat) => {
		setCurrentChatId(chat.id);
		setMessages(chat.messages);
		setSidebarView("chats");
	};

	const deleteChat = (chatId) => {
		if (!confirm("Are you sure you want to delete this chat?")) return;
		
		const updatedChats = chatHistory.filter(chat => chat.id !== chatId);
		setChatHistory(updatedChats);
		localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(updatedChats));
		
		if (chatId === currentChatId) {
			startNewChat();
		}
	};

	const deleteMemory = (memoryId, type = "overall") => {
		if (type === "session") {
			const updatedMemories = sessionMemories.filter(mem => mem.id !== memoryId);
			setSessionMemories(updatedMemories);
			localStorage.setItem(`session_memories_${user.id}`, JSON.stringify(updatedMemories));
		} else {
			const updatedMemories = overallMemories.filter(mem => mem.id !== memoryId);
			setOverallMemories(updatedMemories);
			localStorage.setItem(`overall_memories_${user.id}`, JSON.stringify(updatedMemories));
		}
	};

	const handleNotesSelect = (notes) => {
		setSelectedNotes(notes);
	};

	const handleProfileEdit = () => {
		if (userProfile) {
			setProfileForm({
				interests: userProfile.interests?.join(', ') || '',
				classTeacher: userProfile.classTeacher || '',
				sleepTime: userProfile.sleepTime || '',
			});
		}
		setIsProfileModalOpen(true);
	};

	const handleProfileSave = () => {
		if (!user || !userProfile) return;

		const updatedProfile = {
			...userProfile,
			interests: profileForm.interests.split(',').map(i => i.trim()).filter(i => i),
			classTeacher: profileForm.classTeacher,
			sleepTime: profileForm.sleepTime,
		};

		setUserProfile(updatedProfile);
		localStorage.setItem(`user_profile_${user.id}`, JSON.stringify(updatedProfile));
		setIsProfileModalOpen(false);
	};

	// Toggle speech recognition
	const toggleSpeechRecognition = () => {
		if (!recognition) {
			alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
			return;
		}

		if (isListening) {
			recognition.stop();
			setIsListening(false);
		} else {
			recognition.start();
			setIsListening(true);
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading Sudarshan AI...</p>
				</div>
			</div>
		);
	}
	
	if (!user) return null;

	return (
		<div className="flex h-[calc(100vh-4rem)] gap-4 p-4 lg:p-6">
			{/* Sidebar */}
			<div className="hidden lg:flex lg:w-80 flex-col gap-4">
				{/* New Chat Button */}
				<button
					onClick={startNewChat}
					className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-600"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					New Chat
				</button>

				{/* Navigation Tabs */}
				<div className="grid grid-cols-3 gap-2">
					<button
						onClick={() => setSidebarView("chats")}
						className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
							sidebarView === "chats"
								? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
								: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
						}`}
					>
						Chats
					</button>
					<button
						onClick={() => setSidebarView("session-memory")}
						className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
							sidebarView === "session-memory"
								? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
								: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
						}`}
					>
						Session
					</button>
					<button
						onClick={() => setSidebarView("overall-memory")}
						className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
							sidebarView === "overall-memory"
								? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
								: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
						}`}
					>
						Memory
					</button>
				</div>

				<div className="flex gap-2">
					<button
						onClick={() => setSidebarView("profile")}
						className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
							sidebarView === "profile"
								? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
								: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
						}`}
					>
						Profile
					</button>
					<button
						onClick={() => setSidebarView("notes")}
						className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
							sidebarView === "notes"
								? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
								: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
						}`}
					>
						Notes
					</button>
				</div>

				{/* Content Area */}
				<div className="flex-1 overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
					{sidebarView === "chats" && (
						<ChatHistory
							chatHistory={chatHistory}
							currentChatId={currentChatId}
							onLoadChat={loadChat}
							onDeleteChat={deleteChat}
						/>
					)}
					{sidebarView === "session-memory" && (
						<div>
							<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
								Current Session Memory
							</h3>
							<MemoryList
								memories={sessionMemories}
								onDeleteMemory={(id) => deleteMemory(id, "session")}
								type="session"
							/>
						</div>
					)}
					{sidebarView === "overall-memory" && (
						<div>
							<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
								Overall Memory
							</h3>
							<MemoryList
								memories={overallMemories}
								onDeleteMemory={(id) => deleteMemory(id, "overall")}
								type="overall"
							/>
						</div>
					)}
					{sidebarView === "profile" && (
						<StudentProfile 
							profile={userProfile} 
							onEditProfile={handleProfileEdit}
						/>
					)}
					{sidebarView === "notes" && (
						<NotesSelector
							onNotesSelect={handleNotesSelect}
							selectedNotes={selectedNotes}
						/>
					)}
				</div>
			</div>

			{/* Main Chat Area */}
			<div className="flex flex-1 flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
				{/* Header */}
				<div className="flex items-center justify-between border-b p-4" style={{ borderColor: 'var(--dashboard-border)' }}>
					<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 shadow-lg ring-2 ring-orange-200 dark:ring-orange-900/50">
						<Image 
							src="/asset/sudarshanai/sudarshanlogo.jpg" 
							alt="Sudarshan AI"
							width={32}
							height={32}
							className="rounded-full object-contain p-1"
						/>
					</div>
						<div>
							<h2 className="text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
								{generatingTitle ? (
									<span className="inline-flex items-center gap-2">
										<span className="animate-pulse">Generating title</span>
										<span className="flex gap-1">
											<span className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: 'var(--dashboard-primary)' }}></span>
											<span className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: 'var(--dashboard-primary)' }}></span>
											<span className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: 'var(--dashboard-primary)' }}></span>
										</span>
									</span>
								) : currentChatId && chatHistory.find(c => c.id === currentChatId) ? (
									<span className="inline-flex items-center gap-2">
										<span className="animate-[slideIn_0.5s_ease-out]">
											{chatHistory.find(c => c.id === currentChatId)?.title}
										</span>
										<span className="text-xl animate-[wiggle_1s_ease-in-out_3]">✨</span>
									</span>
								) : (
									"Sudarshan AI"
								)}
							</h2>
							<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Powered by iGyan AI</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<ModeSelector
							selectedMode={selectedMode}
							onModeSelect={setSelectedMode}
							isOpen={isModeDropdownOpen}
							onToggle={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
						/>
						<button
							onClick={startNewChat}
							className="lg:hidden rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
							</svg>
						</button>
					</div>
				</div>

				{/* Messages Container */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{messages.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center gap-6 text-center">
							<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 shadow-2xl ring-4 ring-orange-200 dark:ring-orange-900/50">
								<Image 
									src="/asset/sudarshanai/sudarshanlogo.jpg" 
									alt="Sudarshan AI"
									width={80}
									height={80}
									className="rounded-full object-cover animate-spin"
									style={{ animationDuration: '8s' }}
									priority
								/>
							</div>
							<div>
								<h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
									Welcome to Sudarshan AI!
								</h3>
								<p className="mt-2 text-zinc-600 dark:text-zinc-400">
									{selectedMode 
										? `${AI_MODES.find(m => m.id === selectedMode)?.name} • Ready to help you learn`
										: "Select a learning mode to get started"}
								</p>
							</div>

							{/* Mode Selection Prompt */}
							{!selectedMode && (
								<div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-800">
									<div className="flex items-start gap-4">
										<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-indigo-600 dark:text-indigo-400">
												<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
												<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											</svg>
										</div>
										<div className="flex-1 text-left">
											<h4 className="font-semibold text-zinc-900 dark:text-white mb-1">
												Choose Your Learning Mode
											</h4>
											<p className="text-sm text-zinc-600 dark:text-zinc-400">
												Select a mode from the top-right to customize how the AI helps you learn
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Suggested Prompts */}
							{selectedMode && (
								<div className="grid gap-3 sm:grid-cols-2 max-w-2xl w-full">
									{selectedMode === "doubt-solver" && [
										"How does photosynthesis work?",
										"Explain Newton's laws step by step",
										"What is the Pythagorean theorem?",
										"Break down chemical bonding for me",
									].map((suggestion, idx) => (
										<button
											key={idx}
											onClick={() => setInputMessage(suggestion)}
											className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-left text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/30"
										>
											{suggestion}
										</button>
									))}
									{selectedMode === "homework-helper" && [
										"I'm stuck on this algebra problem",
										"Can you guide me through this essay?",
										"Help me understand this concept",
										"Give me hints for this question",
									].map((suggestion, idx) => (
										<button
											key={idx}
											onClick={() => setInputMessage(suggestion)}
											className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-left text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/30"
										>
											{suggestion}
										</button>
									))}
									{selectedMode === "concept-explainer" && [
										"Explain quantum physics like I'm 5",
										"What is blockchain in simple terms?",
										"How does gravity work?",
										"Explain evolution with examples",
									].map((suggestion, idx) => (
										<button
											key={idx}
											onClick={() => setInputMessage(suggestion)}
											className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-left text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/30"
										>
											{suggestion}
										</button>
									))}
									{selectedMode === "test-prep" && [
										"Quiz me on World War 2",
										"Give me MCQs on cell biology",
										"Test my knowledge of algebra",
										"Practice questions for chemistry",
									].map((suggestion, idx) => (
										<button
											key={idx}
											onClick={() => setInputMessage(suggestion)}
											className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-left text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/30"
										>
											{suggestion}
										</button>
									))}
									{selectedMode === "study-buddy" && [
										"Help me plan my study schedule",
										"I'm feeling unmotivated to study",
										"Time management tips for exams",
										"How to stay focused while studying",
									].map((suggestion, idx) => (
										<button
											key={idx}
											onClick={() => setInputMessage(suggestion)}
											className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-left text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/30"
										>
											{suggestion}
										</button>
									))}
								</div>
							)}
						</div>
					) : (
						<>
							{messages.map((message, index) => (
								<ChatMessage key={index} message={message} user={user} />
							))}
							{isTyping && <TypingIndicator />}
							<div ref={messagesEndRef} />
						</>
					)}
				</div>

				{/* Input Area */}
				<div className="border-t border-zinc-200 dark:border-zinc-800">
					{/* Active Mode Indicator */}
					{selectedMode && (
						<div className={`border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800 ${AI_MODES.find(m => m.id === selectedMode)?.bgColor}`}>
							<div className="flex items-center gap-2 text-xs">
								<span className={AI_MODES.find(m => m.id === selectedMode)?.textColor}>
									{AI_MODES.find(m => m.id === selectedMode)?.icon}
								</span>
								<span className="font-medium text-zinc-700 dark:text-zinc-300">
									Active:
								</span>
								<span className={`font-semibold ${AI_MODES.find(m => m.id === selectedMode)?.textColor}`}>
									{AI_MODES.find(m => m.id === selectedMode)?.name}
								</span>
								<button
									onClick={() => setSelectedMode(null)}
									className="ml-auto text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
									title="Clear mode"
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
										<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
									</svg>
								</button>
							</div>
						</div>
					)}
					
					{/* Selected Notes Display */}
					{selectedNotes && (
						<div className="border-b border-zinc-200 bg-indigo-50 px-4 py-2 dark:border-zinc-800 dark:bg-indigo-900/20">
							<div className="flex items-center gap-2 text-xs">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-indigo-600 dark:text-indigo-400">
									<path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
								</svg>
								<span className="font-medium text-indigo-900 dark:text-indigo-300">
									Currently studying:
								</span>
								<span className="text-indigo-700 dark:text-indigo-400">
									{selectedNotes.grade ? `${selectedNotes.grade.replace(/^Grade\b/i, "Class")} • ` : ""}{selectedNotes.subject} • {selectedNotes.chapter} • {selectedNotes.topic}
								</span>
								<button
									onClick={() => setSelectedNotes(null)}
									className="ml-auto text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
									title="Clear selection"
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
										<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
									</svg>
								</button>
							</div>
						</div>
					)}
					
					<div className="p-4">
						<div className="flex gap-2">
							<div className="relative flex-1">
								<textarea
									value={inputMessage}
									onChange={(e) => setInputMessage(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder="Ask me anything..."
									rows="1"
									className="w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 pr-12 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									disabled={isTyping}
								/>
								<button
									onClick={toggleSpeechRecognition}
									className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg p-2 transition-all ${
										isListening
											? 'bg-red-500 text-white animate-pulse'
											: 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
									}`}
									title={isListening ? 'Stop recording' : 'Start voice input'}
									disabled={isTyping}
								>
									{isListening ? (
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
											<path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
											<path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
										</svg>
									) : (
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
											<path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
											<path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
										</svg>
									)}
								</button>
							</div>
							<button
								onClick={handleSendMessage}
								disabled={!inputMessage.trim() || isTyping}
								className="flex items-center justify-center rounded-xl bg-indigo-500 px-6 text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
								</svg>
							</button>
						</div>
						<p className="mt-2 text-xs text-zinc-500 text-center">
							Press Enter to send • Shift+Enter for new line • Click mic for voice input
						</p>
					</div>
				</div>
			</div>

			{/* Profile Setup Modal */}
			{isProfileModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
						<div className="mb-4 flex items-center justify-between">
							<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
								Edit Profile Details
							</h3>
							<button
								onClick={() => setIsProfileModalOpen(false)}
								className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
									<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
								</svg>
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Interests (comma-separated)
								</label>
								<input
									type="text"
									value={profileForm.interests}
									onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
									placeholder="AI, Science, Technology, etc."
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Class Teacher
								</label>
								<input
									type="text"
									value={profileForm.classTeacher}
									onChange={(e) => setProfileForm({ ...profileForm, classTeacher: e.target.value })}
									placeholder="Teacher's name"
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Sleep Time
								</label>
								<input
									type="time"
									value={profileForm.sleepTime}
									onChange={(e) => setProfileForm({ ...profileForm, sleepTime: e.target.value })}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									onClick={() => setIsProfileModalOpen(false)}
									className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
								>
									Cancel
								</button>
								<button
									onClick={handleProfileSave}
									className="flex-1 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
								>
									Save Profile
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
