"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/app/utils/supabase";
import { useAuth } from "@/app/utils/auth_context";
import {
	Search,
	Phone,
	Send,
	ChevronDown,
	SquarePen,
	CheckCheck,
} from "lucide-react";

// Figma Frame 138 Message Flags
const MESSAGE_TAGS = [
	{ id: "general", label: "General", icon: "💬" },
	{ id: "complaint", label: "COMPLAINT", icon: "🚩" },
	{ id: "homework", label: "HW", icon: "📚" },
	{ id: "urgent", label: "URGENT", icon: "⚠️" },
];

export default function FacultyChatPage() {
	const { user } = useAuth();

	// ─── STATE ───
	const [contactsList, setContactsList] = useState([]);
	const [selectedContact, setSelectedContact] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
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

	const formatTime = (value) => value
		? new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
		: "";

	const toMessage = (message) => ({
		id: message.id,
		sender: message.sender_id === user?.id ? "me" : "them",
		text: message.message_text,
		time: formatTime(message.created_at),
		flag: message.flag || "general",
	});

	const loadMessages = async (contact) => {
		const { data, error } = await supabase
			.from("parent_teacher_messages")
			.select("*")
			.eq("conversation_id", contact.id)
			.eq("is_deleted", false)
			.order("created_at", { ascending: true });

		if (error) {
			console.error("Unable to load messages:", error);
			return;
		}

		setMessages((data || []).map(toMessage));
		await supabase
			.from("parent_teacher_messages")
			.update({ is_read: true, read_at: new Date().toISOString() })
			.eq("conversation_id", contact.id)
			.neq("sender_id", user.id)
			.eq("is_read", false);
		await supabase
			.from("parent_teacher_conversations")
			.update({ unread_teacher: 0 })
			.eq("id", contact.id);
		setContactsList((previous) => previous.map((item) => item.id === contact.id ? { ...item, unreadCount: 0 } : item));
	};

	useEffect(() => {
		if (!user?.id) return;

		const loadConversations = async () => {
			setLoading(true);
			const { data: conversations, error } = await supabase
				.from("parent_teacher_conversations")
				.select("id, school_id, parent_id, student_id, last_message_at, unread_teacher, parent:parent_id(id, full_name, phone), student:student_id(full_name)")
				.eq("teacher_id", user.id)
				.eq("is_active", true)
				.order("last_message_at", { ascending: false });

			if (error) {
				console.error("Unable to load parent conversations:", error);
				setLoading(false);
				return;
			}

			const ids = (conversations || []).map((conversation) => conversation.id);
			const { data: recentMessages } = ids.length
				? await supabase
					.from("parent_teacher_messages")
					.select("conversation_id, message_text, created_at")
					.in("conversation_id", ids)
					.eq("is_deleted", false)
					.order("created_at", { ascending: false })
				: { data: [] };
			const latestByConversation = new Map();
			for (const message of recentMessages || []) {
				if (!latestByConversation.has(message.conversation_id)) latestByConversation.set(message.conversation_id, message);
			}
			const contacts = (conversations || []).map((conversation) => {
				const lastMessage = latestByConversation.get(conversation.id);
				const parent = conversation.parent || {};
				return {
					id: conversation.id,
					schoolId: conversation.school_id,
					name: parent.full_name || "Parent",
					studentName: conversation.student?.full_name || "",
					phone: parent.phone || "",
					initials: (parent.full_name || "P").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
					unreadCount: conversation.unread_teacher || 0,
					lastTime: formatTime(lastMessage?.created_at || conversation.last_message_at),
					lastMessage: lastMessage?.message_text || "No messages yet",
				};
			});
			setContactsList(contacts);
			setSelectedContact((current) => contacts.find((contact) => contact.id === current?.id) || contacts[0] || null);
			setLoading(false);
		};

		loadConversations();
	}, [user?.id]);

	useEffect(() => {
		if (selectedContact) loadMessages(selectedContact);
		else setMessages([]);
	}, [selectedContact?.id]);

	useEffect(() => {
		if (!selectedContact?.id) return;

		const channel = supabase
			.channel(`faculty-parent-messages-${selectedContact.id}`)
			.on("postgres_changes", {
				event: "INSERT",
				schema: "public",
				table: "parent_teacher_messages",
				filter: `conversation_id=eq.${selectedContact.id}`,
			}, (payload) => {
				setMessages((previous) => previous.some((message) => message.id === payload.new.id)
					? previous
					: [...previous, toMessage(payload.new)]);
			})
			.subscribe();

		return () => supabase.removeChannel(channel);
	}, [selectedContact?.id, user?.id]);

	const handleSelectContact = (contact) => setSelectedContact(contact);

	// Send message handler
	const handleSendMessage = async () => {
		if (!messageText.trim() || !selectedContact) return;
		setSending(true);

		const textToSend = messageText.trim();
		const currentTag = selectedTag;

		try {
			const { data, error } = await supabase
				.from("parent_teacher_messages")
				.insert({
					conversation_id: selectedContact.id,
					school_id: selectedContact.schoolId,
					sender_id: user.id,
					sender_role: "faculty",
					message_text: textToSend,
					flag: currentTag,
				})
				.select()
				.single();
			if (error) throw error;
			const now = new Date().toISOString();
			await supabase
				.from("parent_teacher_conversations")
				.update({ last_message_at: now, unread_parent: 1 })
				.eq("id", selectedContact.id);
			setMessages((previous) => [...previous, toMessage(data)]);
			setContactsList((previous) => previous.map((contact) => contact.id === selectedContact.id ? { ...contact, lastMessage: textToSend, lastTime: formatTime(now) } : contact));
			setMessageText("");
		} catch (error) {
			console.error("Unable to send message:", error);
			alert("Message could not be sent. Please try again.");
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

	if (!selectedContact) {
		return (
			<div className="min-h-full bg-[#f8fafc] p-4 sm:p-6 lg:p-7">
				<div className="mx-auto flex min-h-72 max-w-[1166px] items-center justify-center rounded-2xl border border-[#eeeeee] bg-white p-6 text-sm text-slate-500">
					{loading ? "Loading parent conversations…" : "No parent conversations have been started yet."}
				</div>
			</div>
		);
	}

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
									{totalUnread}
								</span>
							</div>

							<button
								type="button"
								disabled
								className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400"
								title="Parents start conversations from their portal"
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
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white shadow-2xs">
												{contact.initials}
											</div>
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
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white shadow-2xs">
									{selectedContact.initials}
								</div>
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
											<div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-white shadow-2xs">
												{selectedContact.initials}
											</div>
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
