"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/utils/supabase/client";
import { useChat, Message } from "@/hooks/useChat";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatList, ChatContact } from "@/components/chat/ChatList";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { ContactPicker, PickerContact } from "@/components/chat/ContactPicker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconDotsVertical } from "@tabler/icons-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export default function MessagesPage() {
	const { user } = useAuthStore();
	const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
	const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
	const [showContactPicker, setShowContactPicker] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Fetch chat sessions for the current user
	const { data: sessions = [] } = useQuery({
		queryKey: ["chat-sessions", user?.id],
		queryFn: async () => {
			if (!user) return [];
			const { data, error } = await supabase
				.from("chat_sessions")
				.select("*, profiles(*)")
				.or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
				.order("updated_at", { ascending: false });
			if (error) throw error;
			return data ?? [];
		},
		enabled: !!user,
	});

	// Fetch all users for contact picker
	const { data: allUsers = [] } = useQuery({
		queryKey: ["all-users-for-picker"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("profiles")
				.select("id, username, avatar_url")
				.neq("id", user?.id ?? "")
				.order("username");
			if (error) throw error;
			return data ?? [];
		},
		enabled: !!user && showContactPicker,
	});

	// Map sessions to ChatContact format
	const contacts: ChatContact[] = sessions.map((session: any) => {
		const isUser1 = session.user1_id === user?.id;
		const otherProfile = isUser1
			? session.user2_profile
			: session.user1_profile;
		return {
			id: session.id,
			name: otherProfile?.username ?? session.profiles?.username ?? "Unknown",
			avatar: otherProfile?.avatar_url ?? session.profiles?.avatar_url,
			lastMessage: session.last_message ?? "",
			isActive: session.id === activeSessionId,
		};
	});

	// Chat messages for active session
	const { messages, sendMessage } = useChat(activeSessionId ?? "");

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSelectContact = (contactId: string) => {
		setActiveSessionId(contactId);
		const contact = contacts.find((c) => c.id === contactId);
		setActiveContact(contact ?? null);
		setShowContactPicker(false);
	};

	const handleNewMessage = () => {
		setShowContactPicker(true);
	};

	const handlePickContact = async (contact: PickerContact) => {
		if (!user) return;
		// Check if session exists
		const { data: existingSession } = await supabase
			.from("chat_sessions")
			.select("id")
			.or(
				`and(user1_id.eq.${user.id},user2_id.eq.${contact.id}),and(user1_id.eq.${contact.id},user2_id.eq.${user.id})`,
			)
			.single();

		if (existingSession) {
			handleSelectContact(existingSession.id);
		} else {
			// Create new session
			const { data: newSession } = await supabase
				.from("chat_sessions")
				.insert({ user1_id: user.id, user2_id: contact.id })
				.select()
				.single();
			if (newSession) {
				handleSelectContact(newSession.id);
			}
		}
		setShowContactPicker(false);
	};

	const handleSendMessage = (content: string) => {
		if (!activeSessionId || !user) return;
		sendMessage(content, user.id);
	};

	const pickerContacts: PickerContact[] = allUsers.map((u: any) => ({
		id: u.id,
		name: u.username ?? "User",
		avatar: u.avatar_url,
	}));

	return (
		<div className="mx-auto flex h-[calc(100vh-80px)] max-w-5xl flex-col px-4 pt-6 pb-24 lg:pb-6">
			<Card className="flex flex-1 overflow-hidden border shadow-lg">
				{/* Header */}
				<div className="flex w-full flex-col">
					<div className="flex items-center justify-between border-b border-border px-5 py-4">
						<h3 className="text-base font-semibold">Messages</h3>
						{activeContact && (
							<div className="flex items-center gap-3">
								<span className="rounded-full bg-muted px-3 py-1 text-xs">
									Online
								</span>
								<Button className="text-muted-foreground hover:text-foreground">
									<IconDotsVertical className="size-4" />
								</Button>
							</div>
						)}
					</div>

					<div className="flex flex-1 overflow-hidden">
						{/* Left: Chat list */}
						<div className="w-72 shrink-0 overflow-y-auto">
							<ChatList
								contacts={contacts}
								activeContactId={activeSessionId ?? undefined}
								onSelectContact={handleSelectContact}
								onNewMessage={handleNewMessage}
							/>
						</div>

						{/* Right: Chat content or empty state */}
						{showContactPicker ? (
							<div className="flex flex-1 items-center justify-center p-6">
								<div className="w-full max-w-md">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setShowContactPicker(false)}
										className="mb-4"
									>
										<IconArrowLeft className="mr-2 size-4" />
										Back
									</Button>
									<ContactPicker
										contacts={pickerContacts}
										onSelect={handlePickContact}
									/>
								</div>
							</div>
						) : activeSessionId ? (
							<div className="flex flex-1 flex-col">
								{/* Messages area */}
								<div className="flex-1 space-y-4 overflow-y-auto p-6">
									{messages.length === 0 && (
										<p className="py-12 text-center text-sm text-muted-foreground">
											No messages yet. Say hello! 👋
										</p>
									)}
									{messages.map((msg: Message) => (
										<ChatBubble
											key={msg.id}
											content={msg.content}
											timestamp={format(new Date(msg.created_at), "h:mm a")}
											variant={msg.sender_id === user?.id ? "sent" : "received"}
										/>
									))}
									<div ref={messagesEndRef} />
								</div>

								{/* Input */}
								<ChatInput onSend={handleSendMessage} avatarUrl={undefined} />
							</div>
						) : (
							<ChatEmptyState onNewMessage={handleNewMessage} />
						)}
					</div>
				</div>
			</Card>
		</div>
	);
}
