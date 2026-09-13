"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/utils/auth_context";
import {
	Search,
	Phone,
	Send,
	ChevronDown,
	SquarePen,
	Check,
	CheckCheck,
	X,
	Circle,
} from "lucide-react";

// Figma Frame 138 Message Flags
const MESSAGE_TAGS = [
	{ id: "general", label: "General", icon: "💬" },
	{ id: "complaint", label: "COMPLAINT", icon: "🚩" },
	{ id: "homework", label: "HW", icon: "📚" },
	{ id: "urgent", label: "URGENT", icon: "⚠️" },
];

// Curated Contacts & Conversations matching Figma Frame 138 design exactly
const FIGMA_CONTACTS = [
	{
		id: "c-1",
		name: "Mr. Jonathan Reed (2-A)",
		studentName: "Jonathan Reed",
		className: "2-A",
		role: "Parent",
		phone: "+91 98765 43210",
		avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
		initials: "JR",
		status: "online",
		unreadCount: 2,
		lastTime: "12m",
		lastMessage: "Haha that's terrifying 😂",
		messages: [
			{ id: "m-101", sender: "them", text: "Good morning teacher! Are we aligned on the syllabus for next week?", time: "10:15 AM", flag: "general" },
			{ id: "m-102", sender: "me", text: "Yes, verified and updated in the system.", time: "10:18 AM", flag: "general" },
			{ id: "m-103", sender: "them", text: "Haha that's terrifying 😂", time: "10:20 AM", flag: "general" },
		],
	},
	{
		id: "c-2",
		name: "Ms. Emily Carter (5-A)",
		studentName: "Emily Carter",
		className: "5-A",
		role: "Parent",
		phone: "+91 98111 22334",
		avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
		initials: "EC",
		status: "online",
		unreadCount: 0,
		lastTime: "24m",
		lastMessage: "woohoooo 🎉",
		messages: [
			{ id: "m-201", sender: "them", text: "omg, this is amazing", time: "11:02 AM", flag: "general" },
			{ id: "m-202", sender: "them", text: "perfect! ✅", time: "11:03 AM", flag: "homework" },
			{ id: "m-203", sender: "them", text: "Wow, this is really epic", time: "11:04 AM", flag: "general" },
			{ id: "m-204", sender: "me", text: "How are you?", time: "11:10 AM", flag: "general" },
			{ id: "m-205", sender: "them", text: "just ideas for next time", time: "11:12 AM", flag: "general" },
			{ id: "m-206", sender: "them", text: "I'll be there in 2 mins ⏱️", time: "11:14 AM", flag: "urgent" },
			{ id: "m-207", sender: "me", text: "woohoooo", time: "11:16 AM", flag: "general" },
			{ id: "m-208", sender: "me", text: "haha oh man", time: "11:17 AM", flag: "general" },
			{ id: "m-209", sender: "me", text: "Haha that's terrifying 😂", time: "11:18 AM", flag: "general" },
			{ id: "m-210", sender: "them", text: "aww", time: "11:20 AM", flag: "general" },
			{ id: "m-211", sender: "them", text: "omg, this is amazing", time: "11:21 AM", flag: "general" },
			{ id: "m-212", sender: "them", text: "woohoooo 🎉", time: "11:22 AM", flag: "general" },
		],
	},
	{
		id: "c-3",
		name: "Mrs. Olivia Bennett (1-A)",
		studentName: "Olivia Bennett",
		className: "1-A",
		role: "Parent",
		phone: "+91 98222 33445",
		avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
		initials: "OB",
		status: "online",
		unreadCount: 0,
		lastTime: "1h",
		lastMessage: "Wow, this is really epic",
		messages: [
			{ id: "m-301", sender: "them", text: "Hey! Did you check the new timetable structure?", time: "09:30 AM", flag: "general" },
			{ id: "m-302", sender: "me", text: "Just saw it, looks well balanced.", time: "09:45 AM", flag: "general" },
			{ id: "m-303", sender: "them", text: "Wow, this is really epic", time: "10:00 AM", flag: "homework" },
		],
	},
	{
		id: "c-4",
		name: "Mr. Daniel Foster (8-A)",
		studentName: "Daniel Foster",
		className: "8-A",
		role: "Parent",
		phone: "+91 98333 44556",
		avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
		initials: "DF",
		status: "offline",
		unreadCount: 0,
		lastTime: "1h",
		lastMessage: "omg, this is amazing",
		messages: [
			{ id: "m-401", sender: "them", text: "Can we request a copy of the mid-term report card?", time: "08:15 AM", flag: "general" },
			{ id: "m-402", sender: "me", text: "Certainly! Uploading it to your portal shortly.", time: "08:20 AM", flag: "general" },
			{ id: "m-403", sender: "them", text: "omg, this is amazing", time: "08:22 AM", flag: "general" },
		],
	},
	{
		id: "c-5",
		name: "Mrs. Sophia Clarke (3-A)",
		studentName: "Sophia Clarke",
		className: "3-A",
		role: "Parent",
		phone: "+91 98444 55667",
		avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
		initials: "SC",
		status: "online",
		unreadCount: 0,
		lastTime: "2d",
		lastMessage: "haha 😂",
		messages: [
			{ id: "m-501", sender: "them", text: "Sophia will be absent for the first two periods tomorrow due to a dental visit.", time: "Yesterday", flag: "urgent" },
			{ id: "m-502", sender: "me", text: "Noted, thank you for informing.", time: "Yesterday", flag: "general" },
			{ id: "m-503", sender: "them", text: "haha 😂", time: "Yesterday", flag: "general" },
		],
	},
	{
		id: "c-6",
		name: "Mr. Benjamin Hayes (6-A)",
		studentName: "Benjamin Hayes",
		className: "6-A",
		role: "Parent",
		phone: "+91 98555 66778",
		avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
		initials: "BH",
		status: "online",
		unreadCount: 0,
		lastTime: "1w",
		lastMessage: "perfect! ✅",
		messages: [
			{ id: "m-601", sender: "them", text: "Received the science exhibition participation invite.", time: "May 10", flag: "general" },
			{ id: "m-602", sender: "me", text: "Great! Looking forward to Benjamin's project.", time: "May 10", flag: "homework" },
			{ id: "m-603", sender: "them", text: "perfect! ✅", time: "May 10", flag: "general" },
		],
	},
];

export default function FacultyChatPage() {
	const { user } = useAuth();

	// ─── STATE ───
	const [contactsList, setContactsList] = useState(FIGMA_CONTACTS);
	const [selectedContact, setSelectedContact] = useState(FIGMA_CONTACTS[1]); // Default to Emily Carter (5-A) as in Figma
	const [messages, setMessages] = useState(FIGMA_CONTACTS[1].messages);
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'complaint' | 'homework' | 'urgent'
	const [selectedTag, setSelectedTag] = useState("urgent"); // Matches Image 3 with 'URGENT' highlighted
	const [messageText, setMessageText] = useState("");
	const [sending, setSending] = useState(false);

	const messagesEndRef = useRef(null);
	const chatContainerRef = useRef(null);

	// Auto-scroll inside chat container
	useEffect(() => {
		if (chatContainerRef.current) {
			chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
		}
	}, [messages, selectedContact]);

	// Switch contact
	const handleSelectContact = (contact) => {
		setSelectedContact(contact);
		setMessages(contact.messages || []);
		// Mark unread as 0 locally
		setContactsList((prev) =>
			prev.map((c) => (c.id === contact.id ? { ...c, unreadCount: 0 } : c))
		);
	};

	// Send message handler
	const handleSendMessage = async () => {
		if (!messageText.trim() || !selectedContact) return;
		setSending(true);

		const textToSend = messageText.trim();
		const currentTag = selectedTag;

		const newMsg = {
			id: `m-${Date.now()}`,
			sender: "me",
			text: textToSend,
			time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
			flag: currentTag,
		};

		const updatedMessages = [...messages, newMsg];
		setMessages(updatedMessages);
		setMessageText("");

		// Update contacts list last message preview
		setContactsList((prev) =>
			prev.map((c) =>
				c.id === selectedContact.id
					? {
							...c,
							lastMessage: textToSend,
							lastTime: "Just now",
							messages: updatedMessages,
					  }
					: c
			)
		);

		// Attempt background supabase sync if tables exist
		try {
			if (user?.id && user?.school_id) {
				await supabase.from("parent_teacher_messages").insert({
					school_id: user.school_id,
					sender_id: user.id,
					sender_role: "faculty",
					message_text: textToSend,
					flag: currentTag,
				});
			}
		} catch (e) {
			// graceful local fallback
		} finally {
			setSending(false);
		}
	};

	// Filtered contact list
	const filteredContacts = useMemo(() => {
		return contactsList.filter((c) => {
			const q = searchQuery.toLowerCase();
			return (
				c.name.toLowerCase().includes(q) ||
				(c.lastMessage && c.lastMessage.toLowerCase().includes(q))
			);
		});
	}, [contactsList, searchQuery]);

	// Filtered messages
	const filteredMessages = useMemo(() => {
		if (activeFilter === "all") return messages;
		return messages.filter((m) => m.flag === activeFilter);
	}, [messages, activeFilter]);

	// Total unread count
	const totalUnread = useMemo(() => {
		return contactsList.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
	}, [contactsList]);

	return (
		<div className="min-h-full bg-[#f8fafc] p-4 text-[#1e293b] sm:p-6 lg:p-7">
			{/* ══════════════════════════════════════════════════════════════
			    FIGMA FRAME 138: EXACT CONTAINER (1166px width, 12px radius)
			   ══════════════════════════════════════════════════════════════ */}
			<div className="max-w-[1166px] mx-auto w-full rounded-2xl border border-[#eeeeee] bg-white p-6 shadow-xs">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[720px] h-[calc(100vh-200px)] max-h-[860px]">
					
					{/* ──── LEFT PANEL: Messages List (4.5 Cols) ──── */}
					<div className="lg:col-span-5 flex flex-col border-r border-[#eeeeee] pr-5">
						
						{/* Messages Header Row */}
						<div className="flex items-center justify-between pb-4">
							<div className="flex items-center gap-2">
								<h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 cursor-pointer">
									<span>Messages</span>
									<ChevronDown className="h-4 w-4 text-slate-400 stroke-[2.5]" />
								</h2>
								<span className="inline-flex items-center justify-center rounded-full bg-[#ea580c] px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs">
									{totalUnread > 0 ? totalUnread : 12}
								</span>
							</div>

							<button
								type="button"
								className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition"
								title="New Message"
							>
								<SquarePen className="h-4 w-4" />
							</button>
						</div>

						{/* Search Message Bar */}
						<div className="relative pb-3">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 -mt-1.5 h-4 w-4 text-slate-400" />
							<input
								type="text"
								placeholder="Search Message"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
							/>
						</div>

						{/* Contacts List */}
						<div className="flex-1 overflow-y-auto space-y-1.5 pr-1 [scrollbar-width:thin]">
							{filteredContacts.map((contact) => {
								const isSelected = selectedContact?.id === contact.id;

								return (
									<button
										key={contact.id}
										type="button"
										onClick={() => handleSelectContact(contact)}
										className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left cursor-pointer ${
											isSelected
												? "bg-[#fff7ed] border border-[#ffedd5]"
												: "hover:bg-slate-50 border border-transparent"
										}`}
									>
										{/* Round Photo Avatar */}
										<div className="relative shrink-0">
											<img
												src={contact.avatar}
												alt={contact.name}
												className="h-10 w-10 rounded-full object-cover shadow-2xs"
											/>
										</div>

										{/* Name & Snippet */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between gap-1 mb-0.5">
												<p
													className={`text-xs font-bold truncate ${
														isSelected ? "text-[#ea580c]" : "text-slate-900"
													}`}
												>
													{contact.name}
												</p>
												<span className="text-[10px] font-medium text-slate-400 shrink-0">
													{contact.lastTime}
												</span>
											</div>
											<p className="text-[11px] text-slate-500 truncate leading-tight">
												{contact.lastMessage}
											</p>
										</div>

										{/* Unread Pill Badge */}
										{contact.unreadCount > 0 && (
											<span className="shrink-0 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#ea580c] px-1.5 text-[10px] font-bold text-white shadow-2xs">
												{contact.unreadCount}
											</span>
										)}
									</button>
								);
							})}
						</div>
					</div>

					{/* ──── RIGHT PANEL: Active Chat Canvas (7.5 Cols) ──── */}
					<div className="lg:col-span-7 flex flex-col justify-between pl-2">
						
						{/* ── Chat Header ── */}
						<div className="flex items-center justify-between pb-4 border-b border-[#eeeeee]">
							<div className="flex items-center gap-3">
								<img
									src={selectedContact.avatar}
									alt={selectedContact.name}
									className="h-10 w-10 rounded-full object-cover shadow-2xs"
								/>
								<div>
									<h3 className="text-sm font-extrabold text-slate-900">
										{selectedContact.name}
									</h3>
									<div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
										<span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
										<span>Online</span>
									</div>
								</div>
							</div>

							{/* Top Right Actions (Matching Image 2) */}
							<div className="flex items-center gap-2">
								{/* Green Phone Call Button */}
								<a
									href={`tel:${selectedContact.phone || "9876543210"}`}
									className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10b981] text-white shadow-sm hover:bg-[#059669] transition cursor-pointer"
									title="Call Parent"
								>
									<Phone className="h-4 w-4 fill-current" />
								</a>

								{/* Filter Pill: All */}
								<button
									type="button"
									onClick={() => setActiveFilter("all")}
									className={`flex h-9 px-3 items-center justify-center rounded-xl text-xs font-semibold transition cursor-pointer ${
										activeFilter === "all"
											? "bg-slate-200 text-slate-800 font-bold"
											: "bg-[#f8fafc] text-slate-600 hover:bg-slate-100"
									}`}
								>
									All
								</button>

								{/* Filter Pill: Complaint (Red Flag) with Red Circular Outline */}
								<button
									type="button"
									onClick={() => setActiveFilter(activeFilter === "complaint" ? "all" : "complaint")}
									className={`flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer ${
										activeFilter === "complaint" ? "ring-2 ring-red-500" : ""
									}`}
									title="Filter Complaints"
								>
									<span className="text-sm">🚩</span>
								</button>

								{/* Filter Pill: Homework (Books) */}
								<button
									type="button"
									onClick={() => setActiveFilter(activeFilter === "homework" ? "all" : "homework")}
									className={`flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fafc] hover:bg-slate-100 transition cursor-pointer ${
										activeFilter === "homework" ? "ring-2 ring-blue-500 bg-blue-50" : ""
									}`}
									title="Filter Homework"
								>
									<span className="text-sm">📚</span>
								</button>

								{/* Filter Pill: Urgent (Warning) */}
								<button
									type="button"
									onClick={() => setActiveFilter(activeFilter === "urgent" ? "all" : "urgent")}
									className={`flex h-9 w-9 items-center justify-center rounded-full bg-[#f8fafc] hover:bg-slate-100 transition cursor-pointer ${
										activeFilter === "urgent" ? "ring-2 ring-amber-500 bg-amber-50" : ""
									}`}
									title="Filter Urgent"
								>
									<span className="text-sm">⚠️</span>
								</button>
							</div>
						</div>

						{/* ── Message Stream (Scrollable) ── */}
						<div
							ref={chatContainerRef}
							className="flex-1 overflow-y-auto py-5 space-y-3 [scrollbar-width:thin]"
						>
							{filteredMessages.map((msg, index) => {
								const isMe = msg.sender === "me";

								return (
									<div
										key={msg.id || index}
										className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"}`}
									>
										{!isMe && (
											<img
												src={selectedContact.avatar}
												alt="avatar"
												className="h-6 w-6 rounded-full object-cover shrink-0 shadow-2xs"
											/>
										)}

										<div
											className={`max-w-[72%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
												isMe
													? "bg-[#ea580c] text-white rounded-br-xs"
													: "bg-[#f1f5f9] text-slate-800 rounded-bl-xs"
											}`}
										>
											<p className="whitespace-pre-wrap">{msg.text}</p>
										</div>

										{isMe && (
											<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white shadow-2xs">
												{user?.full_name?.slice(0, 1) || "T"}
											</div>
										)}
									</div>
								);
							})}
							<div ref={messagesEndRef} />
						</div>

						{/* ── Bottom Input & Tag Selector ── */}
						<div className="pt-3 border-t border-[#eeeeee] space-y-3">
							
							{/* Tag Selector Row (Matching Image 3) */}
							<div className="flex items-center gap-2">
								<span className="text-xs font-semibold text-slate-400 mr-1">
									Tag:
								</span>

								{MESSAGE_TAGS.map((tag) => {
									const isSelected = selectedTag === tag.id;

									return (
										<button
											key={tag.id}
											type="button"
											onClick={() => setSelectedTag(tag.id)}
											className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
												isSelected
													? "border border-[#ea580c] bg-[#fff7ed] text-[#ea580c] shadow-2xs ring-1 ring-[#ea580c]"
													: "bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-transparent"
											}`}
										>
											<span>{tag.icon}</span>
											<span>{tag.label}</span>
										</button>
									);
								})}
							</div>

							{/* Message Input Box with Orange Send Button (Matching Figma) */}
							<div className="relative flex items-center">
								<input
									type="text"
									placeholder="Type a message..."
									value={messageText}
									onChange={(e) => setMessageText(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSendMessage();
										}
									}}
									className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-4 pr-12 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#ea580c]/15"
								/>
								<button
									type="button"
									onClick={handleSendMessage}
									disabled={sending || !messageText.trim()}
									className="absolute right-3.5 text-[#ea580c] hover:text-[#c2410c] disabled:opacity-30 transition cursor-pointer"
								>
									<Send className="h-4 w-4 fill-current stroke-none" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
