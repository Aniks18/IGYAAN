"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
	Search,
	Send,
	Plus,
	X,
	Check,
	CheckCheck,
	MoreVertical,
	Phone,
	Video,
	Paperclip,
	Smile,
	Users,
	Sparkles,
	Bot,
	Filter,
	ArrowLeft,
	Circle
} from "lucide-react";
import { useAuth } from "@/app/utils/auth_context";
import { supabase } from "@/app/utils/supabase";

// Initial Demo Contacts matching Figma design exactly
const INITIAL_CONTACTS = [
	{
		id: "c-1",
		name: "Mr. Jonathan Reed (2-A)",
		role: "Faculty",
		roleDetail: "English Teacher (2-A)",
		avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
		initials: "JR",
		avatarBg: "bg-blue-500",
		status: "online",
		unreadCount: 2,
		lastTime: "12m",
		lastMessage: "Haha it's real",
		messages: [
			{ id: "m-101", sender: "them", text: "Good morning! Are we aligned on the syllabus for next week?", time: "10:15 AM" },
			{ id: "m-102", sender: "me", text: "Yes, verified and updated in the system.", time: "10:18 AM" },
			{ id: "m-103", sender: "them", text: "Haha it's real", time: "10:20 AM" },
		],
	},
	{
		id: "c-2",
		name: "Ms. Emily Carter (5-A)",
		role: "Faculty",
		roleDetail: "Class Teacher of (5-A)",
		avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
		initials: "EC",
		avatarBg: "bg-amber-500",
		status: "online",
		unreadCount: 0,
		lastTime: "24m",
		lastMessage: "woofoooo 🔥",
		messages: [
			{ id: "m-201", sender: "them", text: "omg, this is amazing", time: "11:02 AM" },
			{ id: "m-202", sender: "them", text: "perfect ✅", time: "11:03 AM" },
			{ id: "m-203", sender: "them", text: "wow, this is really epic", time: "11:04 AM" },
			{ id: "m-204", sender: "me", text: "How are you?", time: "11:10 AM" },
			{ id: "m-205", sender: "them", text: "just ideas for next time", time: "11:12 AM" },
			{ id: "m-206", sender: "them", text: "I'll be there in 2 mins", time: "11:14 AM" },
			{ id: "m-207", sender: "me", text: "woofoooo", time: "11:16 AM" },
			{ id: "m-208", sender: "me", text: "Haha ah man", time: "11:17 AM" },
			{ id: "m-209", sender: "me", text: "Haha that's terrifying 😂", time: "11:18 AM" },
			{ id: "m-210", sender: "them", text: "aww", time: "11:20 AM" },
			{ id: "m-211", sender: "them", text: "omg, this is amazing", time: "11:21 AM" },
			{ id: "m-212", sender: "them", text: "woofoooo 🔥", time: "11:22 AM" },
		],
	},
	{
		id: "c-3",
		name: "Mrs. Olivia Bennett (1-A)",
		role: "Faculty",
		roleDetail: "Math Teacher (1-A)",
		avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
		initials: "OB",
		avatarBg: "bg-emerald-500",
		status: "online",
		unreadCount: 0,
		lastTime: "1h",
		lastMessage: "Haha that's terrifying",
		messages: [
			{ id: "m-301", sender: "them", text: "Hey! Did you check the new timetable structure?", time: "09:30 AM" },
			{ id: "m-302", sender: "me", text: "Just saw it, looks well balanced.", time: "09:45 AM" },
			{ id: "m-303", sender: "them", text: "Haha that's terrifying", time: "10:00 AM" },
		],
	},
	{
		id: "c-4",
		name: "Mr. Daniel Foster (0-A)",
		role: "Faculty",
		roleDetail: "Foundation Lead (0-A)",
		avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
		initials: "DF",
		avatarBg: "bg-purple-500",
		status: "offline",
		unreadCount: 0,
		lastTime: "3h",
		lastMessage: "omg, this is amazing",
		messages: [
			{ id: "m-401", sender: "them", text: "The kindergarten robotics showcase was a huge hit!", time: "08:15 AM" },
			{ id: "m-402", sender: "them", text: "omg, this is amazing", time: "08:16 AM" },
		],
	},
	{
		id: "c-5",
		name: "Ms. Sophia Clarke (3-A)",
		role: "Faculty",
		roleDetail: "Science Teacher (3-A)",
		avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
		initials: "SC",
		avatarBg: "bg-rose-500",
		status: "online",
		unreadCount: 0,
		lastTime: "2d",
		lastMessage: "I'll be there in 2 mins",
		messages: [
			{ id: "m-501", sender: "them", text: "Meeting at the innovation lab?", time: "2 days ago" },
			{ id: "m-502", sender: "them", text: "I'll be there in 2 mins", time: "2 days ago" },
		],
	},
	{
		id: "c-6",
		name: "Mr. Benjamin Hayes (6-A)",
		role: "Faculty",
		roleDetail: "Sports & Physical Ed (6-A)",
		avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
		initials: "BH",
		avatarBg: "bg-cyan-500",
		status: "offline",
		unreadCount: 0,
		lastTime: "1m",
		lastMessage: "perfect!",
		messages: [
			{ id: "m-601", sender: "them", text: "Inter-school athletic meet registrations are finalized.", time: "11:40 AM" },
			{ id: "m-602", sender: "me", text: "Great, I will notify the principal.", time: "11:41 AM" },
			{ id: "m-603", sender: "them", text: "perfect!", time: "11:42 AM" },
		],
	},
];

// Directory of Teachers & Staff matching Screenshot 5
const DIRECTORY_USERS = [
	{ id: "dir-1", name: "Raj Patel", roleTitle: "Class Teacher of (6-C)", role: "Class Teacher", status: "Active", avatarBg: "bg-blue-500", initials: "RP" },
	{ id: "dir-2", name: "Maya Johnson", roleTitle: "Math Teacher (4-C)", role: "Teacher", status: "Active", avatarBg: "bg-purple-500", initials: "MJ" },
	{ id: "dir-3", name: "Emily Chen", roleTitle: "Science Teacher (4-C)", role: "Teacher", status: "Active", avatarBg: "bg-rose-500", initials: "EC" },
	{ id: "dir-4", name: "Luis Gonzalez", roleTitle: "Art Teacher (4-C)", role: "Teacher", status: "Active", avatarBg: "bg-amber-500", initials: "LG" },
	{ id: "dir-5", name: "Aisha Khan", roleTitle: "History Teacher (4-C)", role: "Teacher", status: "Active", avatarBg: "bg-emerald-500", initials: "AK" },
	{ id: "dir-6", name: "Omar Ali", roleTitle: "Physical Education Teacher (4-C)", role: "Teacher", status: "Active", avatarBg: "bg-teal-500", initials: "OA" },
	{ id: "dir-7", name: "Sophia Williams", roleTitle: "Music Teacher (4-C)", role: "Teacher", status: "Active", avatarBg: "bg-violet-500", initials: "SW" },
	{ id: "dir-8", name: "James Smith", roleTitle: "Computer Science Teacher (4-C)", role: "Teacher", status: "Active", avatarBg: "bg-indigo-500", initials: "JS" },
];

export default function CommunicationPage() {
	const { user } = useAuth();
	const [contacts, setContacts] = useState(INITIAL_CONTACTS);
	const [activeContactId, setActiveContactId] = useState("c-2"); // Default Emily Carter (5-A) matching Figma
	const [searchContactQuery, setSearchContactQuery] = useState("");
	const [inputText, setInputText] = useState("");

	// New Message Drawer / Modal
	const [showNewMessageDrawer, setShowNewMessageDrawer] = useState(false);
	const [directorySearchQuery, setDirectorySearchQuery] = useState("");
	const [directoryUsers, setDirectoryUsers] = useState(DIRECTORY_USERS);
	const messagesEndRef = useRef(null);
	const chatContainerRef = useRef(null);

	// Load users from Supabase if available
	useEffect(() => {
		const loadSchoolUsers = async () => {
			if (!user?.school_id) return;
			try {
				const { data, error } = await supabase
					.from("users")
					.select("id, full_name, role, email")
					.eq("school_id", user.school_id)
					.in("role", ["faculty", "super_admin", "co_admin", "counselor"])
					.order("full_name");

				if (!error && data && data.length > 0) {
					const mapped = data.map((u, i) => ({
						id: u.id,
						name: u.full_name || "Faculty Member",
						roleTitle: `${u.role === "faculty" ? "Teacher" : "Staff"} (${u.role})`,
						role: u.role,
						status: "Active",
						avatarBg: ["bg-blue-500", "bg-purple-500", "bg-rose-500", "bg-emerald-500", "bg-amber-500"][i % 5],
						initials: u.full_name ? u.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "FM"
					}));
					setDirectoryUsers(mapped);
				}
			} catch (err) {
				console.error("Error loading school directory users:", err);
			}
		};

		loadSchoolUsers();
	}, [user?.school_id]);

	// Current Active Contact
	const activeContact = useMemo(() => {
		return contacts.find((c) => c.id === activeContactId) || contacts[0];
	}, [contacts, activeContactId]);

	// Filtered Contacts List
	const filteredContacts = useMemo(() => {
		if (!searchContactQuery.trim()) return contacts;
		const q = searchContactQuery.toLowerCase();
		return contacts.filter(
			(c) =>
				c.name.toLowerCase().includes(q) ||
				c.lastMessage.toLowerCase().includes(q)
		);
	}, [contacts, searchContactQuery]);

	// Filtered Directory Users for New Message Drawer
	const filteredDirectoryUsers = useMemo(() => {
		if (!directorySearchQuery.trim()) return directoryUsers;
		const q = directorySearchQuery.toLowerCase();
		return directoryUsers.filter(
			(u) =>
				u.name.toLowerCase().includes(q) ||
				u.roleTitle.toLowerCase().includes(q)
		);
	}, [directoryUsers, directorySearchQuery]);

	// Auto-scroll inside chat container only without scrolling outer page/window
	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [activeContactId, activeContact?.messages?.length]);

	// Handle Send Message
	const handleSendMessage = (e) => {
		e?.preventDefault();
		if (!inputText.trim()) return;

		const newMsg = {
			id: `m-${Date.now()}`,
			sender: "me",
			text: inputText.trim(),
			time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		};

		setContacts((prev) =>
			prev.map((c) => {
				if (c.id === activeContactId) {
					return {
						...c,
						lastMessage: newMsg.text,
						lastTime: "Just now",
						messages: [...c.messages, newMsg],
					};
				}
				return c;
			})
		);

		setInputText("");
	};

	// Start or Open Chat with a Directory User
	const handleStartChatWithUser = (dirUser) => {
		const existing = contacts.find(
			(c) => c.name.toLowerCase().includes(dirUser.name.toLowerCase()) || c.id === dirUser.id
		);

		if (existing) {
			setActiveContactId(existing.id);
		} else {
			const newContactObj = {
				id: dirUser.id,
				name: dirUser.name,
				role: dirUser.role || "Faculty",
				roleDetail: dirUser.roleTitle,
				avatar: null,
				initials: dirUser.initials,
				avatarBg: dirUser.avatarBg,
				status: "online",
				unreadCount: 0,
				lastTime: "Just now",
				lastMessage: "Started new conversation",
				messages: [
					{
						id: `m-${Date.now()}`,
						sender: "them",
						text: `Hello! How can I assist you today?`,
						time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
					},
				],
			};
			setContacts((prev) => [newContactObj, ...prev]);
			setActiveContactId(newContactObj.id);
		}

		setShowNewMessageDrawer(false);
	};

	return (
		<div className="h-[calc(100vh-4rem)] flex flex-col bg-[#fafaf9] p-2.5 sm:p-4 lg:p-5 font-sans overflow-hidden box-border">
			{/* Main Communication Container Card matching Figma exact Frame */}
			<div className="mx-auto flex h-full w-full max-w-7xl flex-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs min-h-0">
				
				{/* ══════════════════════════════════════════════════════════ */}
				{/*  LEFT COLUMN: CONTACTS & MESSAGES LIST                     */}
				{/* ══════════════════════════════════════════════════════════ */}
				<div className="flex w-full max-w-[340px] flex-col border-r border-slate-100 bg-white h-full min-h-0">
					
					{/* Top Header of Messages List */}
					<div className="flex items-center justify-between p-4 pb-3 border-b border-slate-50">
						<div className="flex items-center gap-2">
							<h1 className="text-base font-bold text-slate-900 tracking-tight">Messages</h1>
							<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
								12
							</span>
						</div>

						{/* New Message / Compose Button matching Figma */}
						<button
							type="button"
							onClick={() => setShowNewMessageDrawer(true)}
							className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#ea580c] hover:bg-[#fff7ed] hover:text-[#ea580c] transition-colors"
							title="New Message"
						>
							<Plus className="h-4 w-4" />
						</button>
					</div>

					{/* Search Contacts Bar */}
					<div className="px-4 py-2">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
							<input
								type="text"
								value={searchContactQuery}
								onChange={(e) => setSearchContactQuery(e.target.value)}
								placeholder="Search Message"
								className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 py-2 pl-9 pr-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15 transition-all"
							/>
						</div>
					</div>

					{/* Contacts Scrollable List */}
					<div className="flex-1 overflow-y-auto px-2 py-1 divide-y divide-slate-50/50">
						{filteredContacts.map((contact) => {
							const isSelected = contact.id === activeContactId;
							return (
								<div
									key={contact.id}
									onClick={() => setActiveContactId(contact.id)}
									className={`group relative flex cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition-all ${
										isSelected
											? "bg-[#fff7ed]/70 border border-[#ea580c]/20 shadow-2xs"
											: "hover:bg-slate-50 border border-transparent"
									}`}
								>
									{/* Avatar with Status indicator */}
									<div className="relative shrink-0">
										{contact.avatar ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={contact.avatar}
												alt={contact.name}
												className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
											/>
										) : (
											<div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-2xs ${contact.avatarBg || "bg-slate-700"}`}>
												{contact.initials || "U"}
											</div>
										)}
										{contact.status === "online" && (
											<span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
										)}
									</div>

									{/* Name & Snippet */}
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between mb-0.5">
											<h2 className={`truncate text-xs font-bold ${isSelected ? "text-[#ea580c]" : "text-slate-900"}`}>
												{contact.name}
											</h2>
											<span className="text-[10px] text-slate-400 whitespace-nowrap ml-1 font-medium">
												{contact.lastTime}
											</span>
										</div>
										<p className="truncate text-[11px] text-slate-500 font-normal leading-tight">
											{contact.lastMessage}
										</p>
									</div>

									{/* Unread Pill Badge */}
									{contact.unreadCount > 0 && (
										<div className="flex h-4 min-w-[16px] shrink-0 items-center justify-center rounded-full bg-[#ea580c] px-1 text-[10px] font-bold text-white shadow-2xs">
											{contact.unreadCount}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* ══════════════════════════════════════════════════════════ */}
				{/*  RIGHT COLUMN: ACTIVE CHAT CONVERSATION WINDOW             */}
				{/* ══════════════════════════════════════════════════════════ */}
				<div className="flex flex-1 flex-col bg-[#fdfdfd] h-full min-h-0">
					
					{/* Active Chat Header matching Figma */}
					<div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3.5 shrink-0">
						<div className="flex items-center gap-3">
							<div className="relative shrink-0">
								{activeContact.avatar ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={activeContact.avatar}
										alt={activeContact.name}
										className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
									/>
								) : (
									<div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${activeContact.avatarBg || "bg-slate-700"}`}>
										{activeContact.initials || "U"}
									</div>
								)}
								{activeContact.status === "online" && (
									<span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
								)}
							</div>
							<div>
								<h2 className="text-xs font-bold text-slate-900 leading-tight">
									{activeContact.name}
								</h2>
								<div className="flex items-center gap-1.5 mt-0.5">
									<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
									<span className="text-[10px] font-medium text-emerald-600">Online</span>
								</div>
							</div>
						</div>

						{/* Top Right Header Options Matching Image 2 */}
						<div className="flex items-center gap-2">
							{/* Green Phone Call Button */}
							<a
								href="tel:9876543210"
								className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10b981] text-white shadow-sm hover:bg-[#059669] transition cursor-pointer"
								title="Call"
							>
								<Phone className="h-3.5 w-3.5 fill-current" />
							</a>

							{/* Filter Pill: All */}
							<button
								type="button"
								className="flex h-8 px-2.5 items-center justify-center rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition cursor-pointer"
							>
								All
							</button>

							{/* Filter Pill: Complaint (Red Flag) with Red Circular Outline */}
							<button
								type="button"
								className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
								title="Filter Complaints"
							>
								<span className="text-xs">🚩</span>
							</button>

							{/* Filter Pill: Homework (Books) */}
							<button
								type="button"
								className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
								title="Filter Homework"
							>
								<span className="text-xs">📚</span>
							</button>

							{/* Filter Pill: Urgent (Warning) */}
							<button
								type="button"
								className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
								title="Filter Urgent"
							>
								<span className="text-xs">⚠️</span>
							</button>
						</div>
					</div>

					{/* Chat Messages Stream */}
					<div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-3.5">
						{activeContact.messages.map((msg) => {
							const isMe = msg.sender === "me";
							return (
								<div
									key={msg.id}
									className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
								>
									{/* Avatar for incoming messages */}
									{!isMe && (
										<div className="shrink-0 mb-0.5">
											{activeContact.avatar ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={activeContact.avatar}
													alt={activeContact.name}
													className="h-6 w-6 rounded-full object-cover ring-1 ring-slate-200"
												/>
											) : (
												<div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${activeContact.avatarBg || "bg-slate-600"}`}>
													{activeContact.initials || "U"}
												</div>
											)}
										</div>
									)}

									{/* Message Bubble matching exact Figma styles */}
									<div
										className={`max-w-[70%] px-4 py-2.5 text-xs shadow-2xs leading-relaxed transition-all ${
											isMe
												? "bg-[#ea580c] text-white rounded-2xl rounded-br-xs font-normal"
												: "bg-[#f1f5f9] text-slate-800 rounded-2xl rounded-bl-xs font-normal border border-slate-100"
										}`}
									>
										<p>{msg.text}</p>
										<div className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${isMe ? "text-white/70" : "text-slate-400"}`}>
											<span>{msg.time || "11:20 AM"}</span>
											{isMe && <CheckCheck className="h-3 w-3" />}
										</div>
									</div>

									{/* Avatar for outgoing messages */}
									{isMe && (
										<div className="shrink-0 mb-0.5">
											<div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white shadow-xs">
												{user?.full_name ? user.full_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "ME"}
											</div>
										</div>
									)}
								</div>
							);
						})}
						<div ref={messagesEndRef} />
					</div>

					{/* Bottom Chat Input Bar & Tag Selector matching Image 3 */}
					<div className="border-t border-slate-100 bg-white p-3 sm:p-4 space-y-3 shrink-0">
						{/* Tag Selector Row */}
						<div className="flex items-center gap-2">
							<span className="text-xs font-semibold text-slate-400 mr-1">
								Tag:
							</span>
							<button
								type="button"
								className="flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200/70 transition"
							>
								<span>💬</span>
								<span>General</span>
							</button>
							<button
								type="button"
								className="flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200/70 transition"
							>
								<span>🚩</span>
								<span>COMPLAINT</span>
							</button>
							<button
								type="button"
								className="flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200/70 transition"
							>
								<span>📚</span>
								<span>HW</span>
							</button>
							<button
								type="button"
								className="flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border border-[#ea580c] bg-[#fff7ed] text-[#ea580c] ring-1 ring-[#ea580c] shadow-2xs transition"
							>
								<span>⚠️</span>
								<span>URGENT</span>
							</button>
						</div>

						{/* Text input with Send Arrow */}
						<form
							onSubmit={handleSendMessage}
							className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-2xs focus-within:border-[#ea580c] focus-within:ring-2 focus-within:ring-[#ea580c]/15 transition-all"
						>
							<input
								type="text"
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								placeholder="Type a message..."
								className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
							/>

							{/* Orange Send button */}
							<button
								type="submit"
								disabled={!inputText.trim()}
								className="text-[#ea580c] hover:text-[#c2410c] disabled:opacity-30 transition cursor-pointer"
							>
								<Send className="h-4 w-4 fill-current stroke-none" />
							</button>
						</form>
					</div>
				</div>
			</div>

			{/* ══════════════════════════════════════════════════════════════ */}
			{/*  NEW MESSAGE DRAWER / MODAL (MATCHING FIGMA SCREENSHOT 5)       */}
			{/* ══════════════════════════════════════════════════════════ */}
			{showNewMessageDrawer && (
				<div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in">
					<div className="relative flex h-full w-full max-w-md flex-col bg-white p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-250">
						
						{/* Drawer Header */}
						<div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3.5">
							<h2 className="text-base font-bold text-slate-900 tracking-tight">
								New Message
							</h2>
							<button
								type="button"
								onClick={() => setShowNewMessageDrawer(false)}
								className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{/* Search Name Input */}
						<div className="mb-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
								<input
									type="text"
									value={directorySearchQuery}
									onChange={(e) => setDirectorySearchQuery(e.target.value)}
									placeholder="Search Name"
									className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#ea580c] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15 transition-all"
								/>
							</div>
						</div>

						{/* Directory List matching Screenshot 5 */}
						<div className="flex-1 overflow-y-auto divide-y divide-slate-50">
							{filteredDirectoryUsers.map((dirUser) => (
								<div
									key={dirUser.id}
									onClick={() => handleStartChatWithUser(dirUser)}
									className="group flex cursor-pointer items-center justify-between p-3 rounded-xl hover:bg-[#fff7ed]/50 transition-colors"
								>
									<div className="flex items-center gap-3">
										<div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-2xs ${dirUser.avatarBg}`}>
											{dirUser.initials}
										</div>
										<div>
											<h3 className="text-xs font-bold text-slate-900 group-hover:text-[#ea580c] transition-colors">
												{dirUser.name}
											</h3>
											<p className="text-[11px] text-slate-500 font-normal">
												{dirUser.roleTitle}
											</p>
										</div>
									</div>

									{/* Green Active Badge */}
									<span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-600">
										{dirUser.status || "Active"}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
